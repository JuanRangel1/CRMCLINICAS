import { Controller, Get, Module, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async search(@CurrentUser() u: AuthUser, @Query('q') q: string) {
    const clinicId = requireClinic(u);
    if (!q) return {};
    const [patients, leads, professionals, appointments, budgets, treatments, procedures] = await Promise.all([
      this.prisma.patient.findMany({ where: { clinicId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
      this.prisma.lead.findMany({ where: { clinicId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
      this.prisma.professional.findMany({ where: { clinicId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
      this.prisma.appointment.findMany({ where: { clinicId, patient: { name: { contains: q, mode: 'insensitive' } } }, include: { patient: true }, take: 5 }),
      this.prisma.budget.findMany({ where: { clinicId, patient: { name: { contains: q, mode: 'insensitive' } } }, include: { patient: true }, take: 5 }),
      this.prisma.treatment.findMany({ where: { clinicId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
      this.prisma.procedure.findMany({ where: { clinicId, name: { contains: q, mode: 'insensitive' } }, take: 5 }),
    ]);
    return { patients, leads, professionals, appointments, budgets, treatments, procedures };
  }
}

@Module({ controllers: [SearchController] })
export class SearchModule {}
