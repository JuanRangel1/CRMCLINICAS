import { Body, Controller, Delete, Get, Module, Param, Post, Put, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    return this.prisma.budget.findMany({ where: { clinicId, deletedAt: null }, include: { patient: true, professional: true, items: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post()
  async create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const items = dto.items ?? [];
    const subtotal = items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);
    const total = Math.max(0, subtotal - (dto.discount ?? 0));
    return this.prisma.budget.create({
      data: {
        patientId: dto.patientId,
        professionalId: dto.professionalId,
        discount: dto.discount ?? 0,
        total,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        notes: dto.notes,
        status: dto.status,
        clinicId,
        items: { create: items.map((i: any) => ({ procedureId: i.procedureId, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.quantity * i.unitPrice })) },
      },
      include: { items: true },
    });
  }

  @Get(':id')
  async get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = requireClinic(u);
    const b = await this.prisma.budget.findFirst({ where: { id, clinicId }, include: { items: true, patient: true, professional: true } });
    if (!b) throw new NotFoundException();
    return b;
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const b = await this.prisma.budget.findFirst({ where: { id, clinicId } });
    if (!b) throw new NotFoundException();
    return this.prisma.budget.update({ where: { id }, data: { status: dto.status, discount: dto.discount, notes: dto.notes, validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = requireClinic(u);
    const b = await this.prisma.budget.findFirst({ where: { id, clinicId } });
    if (!b) throw new NotFoundException();
    await this.prisma.budget.update({ where: { id }, data: { deletedAt: new Date() } });
    return { ok: true };
  }
}

@Module({ controllers: [BudgetsController] })
export class BudgetsModule {}
