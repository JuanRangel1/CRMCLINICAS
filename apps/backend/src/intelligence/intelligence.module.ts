import { Controller, Get, Module } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('intelligence')
@ApiBearerAuth()
@Controller('intelligence')
export class IntelligenceController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async analyze(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    const alerts: { level: 'RED' | 'YELLOW' | 'GREEN'; message: string }[] = [];
    const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const inactive = await this.prisma.patient.count({ where: { clinicId, appointments: { none: { startAt: { gte: sixMonthsAgo } } } } });
    if (inactive > 0) alerts.push({ level: 'RED', message: `${inactive} pacientes não retornam há mais de 6 meses.` });
    const soon = new Date(); soon.setDate(soon.getDate() + 7);
    const expiring = await this.prisma.budget.count({ where: { clinicId, status: 'SENT', validUntil: { lte: soon, gte: new Date() } } });
    if (expiring > 0) alerts.push({ level: 'YELLOW', message: `${expiring} orçamentos estão próximos de expirar.` });
    const noShows = await this.prisma.appointment.count({ where: { clinicId, status: 'NO_SHOW' } });
    const total = await this.prisma.appointment.count({ where: { clinicId } });
    const noShowRate = total > 0 ? Math.round((noShows / total) * 100) : 0;
    if (noShowRate > 15) alerts.push({ level: 'RED', message: `A taxa de no-show está em ${noShowRate}%.` });
    const noContact = await this.prisma.lead.count({ where: { clinicId, status: 'NEW', activities: { none: {} } } });
    if (noContact > 0) alerts.push({ level: 'YELLOW', message: `${noContact} leads sem contato.` });
    const hotNoFollow = await this.prisma.lead.count({ where: { clinicId, score: { gte: 61 }, status: { in: ['QUALIFIED', 'SCHEDULING'] } } });
    if (hotNoFollow > 0) alerts.push({ level: 'RED', message: `${hotNoFollow} leads quentes precisam de follow-up.` });
    const converted = await this.prisma.lead.count({ where: { clinicId, status: 'CONVERTED' } });
    const leadsTotal = await this.prisma.lead.count({ where: { clinicId } });
    const conversion = leadsTotal > 0 ? Math.round((converted / leadsTotal) * 100) : 0;
    if (conversion >= 30) alerts.push({ level: 'GREEN', message: `Conversão de leads em ${conversion}%.` });

    const occupancy = total > 0 ? Math.min(100, Math.round(((total - noShows) / total) * 100)) : 50;
    const score = Math.round(
      0.2 * conversion +
      0.2 * Math.max(0, 100 - noShowRate * 2) +
      0.2 * occupancy +
      0.2 * Math.max(0, 100 - inactive) +
      0.2 * (conversion >= 30 ? 90 : 60),
    );
    const health = score >= 90 ? 'Excelente' : score >= 70 ? 'Bom' : score >= 50 ? 'Atenção' : 'Crítico';
    return { alerts, score, health, noShowRate };
  }
}

@Module({ controllers: [IntelligenceController] })
export class IntelligenceModule {}
