import { Body, Controller, Delete, Get, Module, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';
import { NotFoundException } from '@nestjs/common';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
export class PatientsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query('q') q?: string) {
    const clinicId = requireClinic(u);
    return this.prisma.patient.findMany({
      where: { clinicId, deletedAt: null, ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { cpf: { contains: q } }] } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const p = await this.prisma.patient.create({ data: { ...dto, clinicId } });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId, action: 'CREATE', entity: 'patient', entityId: p.id } });
    return p;
  }

  @Get(':id')
  async get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = requireClinic(u);
    const p = await this.prisma.patient.findFirst({
      where: { id, clinicId, deletedAt: null },
      include: { appointments: { orderBy: { startAt: 'desc' }, take: 20 }, treatments: true, budgets: true, transactions: true, followUps: true, surveys: true },
    });
    if (!p) throw new NotFoundException('Paciente não encontrado');
    return p;
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const existing = await this.prisma.patient.findFirst({ where: { id, clinicId } });
    if (!existing) throw new NotFoundException('Paciente não encontrado');
    const before = existing;
    const p = await this.prisma.patient.update({ where: { id }, data: dto });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId, action: 'UPDATE', entity: 'patient', entityId: id, before, after: p as any } });
    return p;
  }

  @Delete(':id')
  async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = requireClinic(u);
    const existing = await this.prisma.patient.findFirst({ where: { id, clinicId } });
    if (!existing) throw new NotFoundException('Paciente não encontrado');
    await this.prisma.patient.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId, action: 'DELETE', entity: 'patient', entityId: id } });
    return { ok: true };
  }
}

@Module({ controllers: [PatientsController] })
export class PatientsModule {}
