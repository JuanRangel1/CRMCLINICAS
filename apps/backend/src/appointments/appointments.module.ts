import { Body, Controller, Get, Module, Param, Post, Put, Query, NotFoundException, BadRequestException, ConflictException, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query('from') from?: string, @Query('to') to?: string, @Query('professionalId') professionalId?: string) {
    const clinicId = requireClinic(u);
    return this.prisma.appointment.findMany({
      where: {
        clinicId,
        ...(professionalId ? { professionalId } : {}),
        ...(from && to ? { startAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: { patient: true, professional: true, room: true, procedure: true },
      orderBy: { startAt: 'asc' },
    });
  }

  @Post()
  async create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    await this.checkConflicts(clinicId, dto);
    return this.prisma.appointment.create({
      data: {
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        status: dto.status,
        notes: dto.notes,
        clinicId,
        patientId: dto.patientId,
        professionalId: dto.professionalId,
        roomId: dto.roomId,
        procedureId: dto.procedureId,
      },
    });
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const existing = await this.prisma.appointment.findFirst({ where: { id, clinicId } });
    if (!existing) throw new NotFoundException('Agendamento não encontrado');
    if (dto.startAt || dto.endAt || dto.roomId !== undefined) {
      await this.checkConflicts(clinicId, { ...existing, ...dto, startAt: dto.startAt ?? existing.startAt, endAt: dto.endAt ?? existing.endAt }, id);
    }
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...(dto.startAt ? { startAt: new Date(dto.startAt) } : {}),
        ...(dto.endAt ? { endAt: new Date(dto.endAt) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.roomId !== undefined ? { roomId: dto.roomId } : {}),
        ...(dto.procedureId !== undefined ? { procedureId: dto.procedureId } : {}),
        ...(dto.professionalId ? { professionalId: dto.professionalId } : {}),
        ...(dto.patientId ? { patientId: dto.patientId } : {}),
      },
    });
  }

  @Delete(':id')
  async cancel(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = requireClinic(u);
    const existing = await this.prisma.appointment.findFirst({ where: { id, clinicId } });
    if (!existing) throw new NotFoundException('Agendamento não encontrado');
    return this.prisma.appointment.update({ where: { id }, data: { status: 'CANCELED' } });
  }

  private async checkConflicts(clinicId: string, dto: any, excludeId?: string) {
    const start = new Date(dto.startAt);
    const end = new Date(dto.endAt);
    if (end <= start) throw new BadRequestException('Horário inválido');
    const overlap = (where: any) =>
      this.prisma.appointment.findFirst({
        where: { clinicId, id: excludeId ? { not: excludeId } : undefined, status: { in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] }, startAt: { lt: end }, endAt: { gt: start }, ...where },
      });
    if (dto.roomId) {
      const conflict = await overlap({ roomId: dto.roomId });
      if (conflict) throw new ConflictException('Sala já ocupada neste horário');
    }
    const profConflict = await overlap({ professionalId: dto.professionalId });
    if (profConflict) throw new ConflictException('Profissional já possui agendamento neste horário');
  }
}

@Module({ controllers: [AppointmentsController] })
export class AppointmentsModule {}
