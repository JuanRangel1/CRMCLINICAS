import { Body, Controller, Get, Module, Param, Post, Put, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

const SCORE_RULES: Record<string, number> = {
  replied_message: 10,
  informed_interest: 20,
  requested_budget: 20,
  scheduled: 30,
  attended: 20,
};

@ApiTags('leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query('status') status?: string) {
    const clinicId = requireClinic(u);
    return this.prisma.lead.findMany({
      where: { clinicId, deletedAt: null, ...(status ? { status: status as any } : {}) },
      include: { source: true, owner: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.lead.create({ data: { ...dto, clinicId } });
  }

  @Get(':id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.findScoped(u, id);
  }

  @Put(':id')
  update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    return this.updateScoped(u, id, dto);
  }

  @Post(':id/activities')
  async addActivity(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const lead = await this.findScoped(u, id);
    const activity = await this.prisma.leadActivity.create({ data: { leadId: lead.id, type: dto.type, note: dto.note } });
    const delta = SCORE_RULES[dto.type] ?? 0;
    if (delta > 0) {
      await this.prisma.lead.update({ where: { id: lead.id }, data: { score: Math.min(100, lead.score + delta) } });
    }
    return activity;
  }

  @Post(':id/convert')
  async convert(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = requireClinic(u);
    const lead = await this.prisma.lead.findFirst({ where: { id, clinicId } });
    if (!lead) throw new NotFoundException('Lead não encontrado');
    if (lead.convertedToPatientId) return this.prisma.patient.findUnique({ where: { id: lead.convertedToPatientId } });
    let patient = await this.prisma.patient.findFirst({ where: { clinicId, name: lead.name } });
    if (!patient) {
      patient = await this.prisma.patient.create({
        data: { name: lead.name, email: lead.email, phone: lead.phone, clinicId, leadId: lead.id },
      });
    }
    await this.prisma.lead.update({ where: { id: lead.id }, data: { status: 'CONVERTED', convertedToPatientId: patient.id, score: Math.min(100, lead.score + 20) } });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId, action: 'CONVERT', entity: 'lead', entityId: id } });
    return patient;
  }

  private async findScoped(u: AuthUser, id: string) {
    const clinicId = requireClinic(u);
    const lead = await this.prisma.lead.findFirst({ where: { id, clinicId }, include: { activities: true, source: true, opportunities: true } });
    if (!lead) throw new NotFoundException('Lead não encontrado');
    return lead;
  }

  private async updateScoped(u: AuthUser, id: string, dto: any) {
    const clinicId = requireClinic(u);
    const lead = await this.prisma.lead.findFirst({ where: { id, clinicId } });
    if (!lead) throw new NotFoundException('Lead não encontrado');
    return this.prisma.lead.update({ where: { id }, data: dto });
  }
}

@Module({ controllers: [LeadsController] })
export class LeadsModule {}
