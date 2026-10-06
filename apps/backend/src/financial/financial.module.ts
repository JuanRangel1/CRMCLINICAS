import { Body, Controller, Get, Module, Param, Post, Put, Query, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async summary(@CurrentUser() u: AuthUser, @Query('from') from?: string, @Query('to') to?: string) {
    const clinicId = requireClinic(u);
    const where: any = { clinicId };
    if (from && to) where.createdAt = { gte: new Date(from), lte: new Date(to) };
    const txs = await this.prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } });
    const income = txs.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter((t) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s, t) => s + t.amount, 0);
    const pending = txs.filter((t) => t.status === 'PENDING').reduce((s, t) => s + t.amount, 0);
    const overdue = txs.filter((t) => t.status === 'OVERDUE').reduce((s, t) => s + t.amount, 0);
    return { income, expenses, profit: income - expenses, pending, overdue, transactions: txs };
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.transaction.create({ data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, clinicId } });
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const t = await this.prisma.transaction.findFirst({ where: { id, clinicId } });
    if (!t) throw new NotFoundException();
    return this.prisma.transaction.update({ where: { id }, data: { ...dto, paidAt: dto.status === 'PAID' ? new Date() : dto.paidAt } });
  }

  @Get('commissions')
  commissions(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    return this.prisma.commission.findMany({ where: { clinicId }, include: { professional: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post('commissions')
  async createCommission(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.commission.create({ data: { ...dto, clinicId } });
  }
}

@Module({ controllers: [FinancialController] })
export class FinancialModule {}
