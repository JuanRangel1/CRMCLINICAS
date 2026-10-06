import { Controller, Get, Module, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private prisma: PrismaService) {}

  @Get('funnel')
  async funnel(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    const stages = await this.prisma.pipelineStage.findMany({ where: { pipeline: { clinicId } }, orderBy: { order: 'asc' }, include: { opportunities: true } });
    return stages.map((s) => ({ stage: s.name, count: s.opportunities.length, value: s.opportunities.reduce((acc, o) => acc + o.value, 0) }));
  }

  @Get('procedures')
  async procedures(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    const items = await this.prisma.budgetItem.findMany({ where: { budget: { clinicId } } });
    const map = new Map<string, { count: number; revenue: number }>();
    for (const i of items) {
      const cur = map.get(i.description) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      cur.revenue += i.total;
      map.set(i.description, cur);
    }
    return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
  }

  @Get('professionals')
  async professionals(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    const pros = await this.prisma.professional.findMany({ where: { clinicId }, include: { appointments: true, commissions: true } });
    return pros.map((p) => ({
      name: p.name,
      appointments: p.appointments.length,
      completed: p.appointments.filter((a) => a.status === 'COMPLETED').length,
      commissions: p.commissions.reduce((s, c) => s + c.amount, 0),
    }));
  }

  @Get('financial')
  async financial(@CurrentUser() u: AuthUser, @Query('from') from?: string, @Query('to') to?: string) {
    const clinicId = requireClinic(u);
    const where: any = { clinicId };
    if (from && to) where.createdAt = { gte: new Date(from), lte: new Date(to) };
    const txs = await this.prisma.transaction.findMany({ where });
    const income = txs.filter((t) => t.type === 'INCOME' && t.status === 'PAID').reduce((s, t) => s + t.amount, 0);
    const expenses = txs.filter((t) => t.type === 'EXPENSE' && t.status === 'PAID').reduce((s, t) => s + t.amount, 0);
    const byCategory = txs.reduce((acc: any, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc; }, {});
    return { income, expenses, profit: income - expenses, byCategory };
  }
}

@Module({ controllers: [ReportsController] })
export class ReportsModule {}
