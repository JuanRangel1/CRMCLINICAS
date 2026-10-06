import { Body, Controller, Get, Module, Param, Post, Put, Query, NotFoundException, ForbiddenException, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('clinics')
@ApiBearerAuth()
@Controller('clinics')
export class ClinicsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@CurrentUser() u: AuthUser, @Query('q') q?: string, @Query('status') status?: string) {
    if (u.role !== 'SUPER_ADMIN') return this.prisma.clinic.findMany({ where: { id: u.clinicId ?? undefined, deletedAt: null } });
    return this.prisma.clinic.findMany({
      where: { deletedAt: null, ...(status ? { status: status as any } : {}), ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}) },
      include: { plan: true, _count: { select: { users: true, patients: true, leads: true, appointments: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    if (u.role !== 'SUPER_ADMIN') throw new ForbiddenException('Apenas super admin');
    const clinic = await this.prisma.clinic.create({ data: dto });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId: clinic.id, action: 'CREATE', entity: 'clinic', entityId: clinic.id } });
    return clinic;
  }

  @Get(':id')
  get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    if (u.role !== 'SUPER_ADMIN' && u.clinicId !== id) throw new NotFoundException();
    return this.prisma.clinic.findUnique({ where: { id }, include: { plan: true, _count: { select: { users: true, patients: true, leads: true } } } });
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    if (u.role !== 'SUPER_ADMIN' && u.clinicId !== id) throw new NotFoundException();
    const c = await this.prisma.clinic.update({ where: { id }, data: dto });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId: id, action: 'UPDATE', entity: 'clinic', entityId: id } });
    return c;
  }

  @Post(':id/suspend')
  setSuspended(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body('status') status: string) {
    if (u.role !== 'SUPER_ADMIN') throw new ForbiddenException('Apenas super admin');
    return this.prisma.clinic.update({ where: { id }, data: { status: status === 'ACTIVE' ? 'ACTIVE' : status === 'INACTIVE' ? 'INACTIVE' : 'SUSPENDED' } });
  }

  @Delete(':id')
  async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    if (u.role !== 'SUPER_ADMIN') throw new ForbiddenException('Apenas super admin');
    await this.prisma.clinic.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    return { ok: true };
  }
}

@Module({ controllers: [ClinicsController] })
export class ClinicsModule {}
