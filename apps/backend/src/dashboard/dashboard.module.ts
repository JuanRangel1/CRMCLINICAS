import { Controller, Get, Module } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async clinic(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    const [patients, leads, appointments, completed, noShows, income, treatments, opportunities] = await Promise.all([
      this.prisma.patient.count({ where: { clinicId } }),
      this.prisma.lead.count({ where: { clinicId } }),
      this.prisma.appointment.count({ where: { clinicId } }),
      this.prisma.appointment.count({ where: { clinicId, status: 'COMPLETED' } }),
      this.prisma.appointment.count({ where: { clinicId, status: 'NO_SHOW' } }),
      this.prisma.transaction.aggregate({ where: { clinicId, type: 'INCOME', status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.treatment.count({ where: { clinicId } }),
      this.prisma.opportunity.findMany({ where: { clinicId }, include: { stage: true } }),
    ]);
    const revenue = income._sum.amount ?? 0;
    const avgTicket = completed > 0 ? revenue / completed : 0;
    const noShowRate = appointments > 0 ? Math.round((noShows / appointments) * 100) : 0;
    const converted = await this.prisma.lead.count({ where: { clinicId, status: 'CONVERTED' } });
    const conversion = leads > 0 ? Math.round((converted / leads) * 100) : 0;
    const pipelineValue = opportunities.reduce((s, o) => s + o.value, 0);
    return {
      patients, leads, appointments, consultations: completed, conversion, revenue, avgTicket: Math.round(avgTicket), noShowRate, treatments, pipelineValue,
    };
  }

  @Get('admin')
  async admin(@CurrentUser() u: AuthUser) {
    if (u.role !== 'SUPER_ADMIN') return { error: 'forbidden' };
    const [totalClinics, active, suspended, users, professionals, patients, leads, appointments, revenue] = await Promise.all([
      this.prisma.clinic.count(),
      this.prisma.clinic.count({ where: { status: 'ACTIVE' } }),
      this.prisma.clinic.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count(),
      this.prisma.professional.count(),
      this.prisma.patient.count(),
      this.prisma.lead.count(),
      this.prisma.appointment.count(),
      this.prisma.transaction.aggregate({ where: { type: 'INCOME', status: 'PAID' }, _sum: { amount: true } }),
    ]);
    return { totalClinics, active, suspended, users, professionals, patients, leads, appointments, revenue: revenue._sum.amount ?? 0 };
  }
}

@Module({ controllers: [DashboardController] })
export class DashboardModule {}
