import { Body, Controller, Delete, Get, Module, Param, Post, Put, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

function crud(model: string, entity: string) {
  @ApiTags(entity)
  @ApiBearerAuth()
  @Controller(entity)
  class C {
    constructor(private prisma: PrismaService) {}

    @Get()
    list(@CurrentUser() u: AuthUser) {
      const clinicId = requireClinic(u);
      return (this.prisma as any)[model].findMany({ where: { clinicId, ...(['professional', 'procedure', 'treatment', 'budget'].includes(model) ? { deletedAt: null } : {}) }, orderBy: model === 'room' ? { name: 'asc' } : { createdAt: 'desc' }, include: model === 'professional' ? { specialty: true } : undefined });
    }

    @Post()
    async create(@CurrentUser() u: AuthUser, @Body() dto: any) {
      const clinicId = requireClinic(u);
      return (this.prisma as any)[model].create({ data: { ...dto, clinicId } });
    }

    @Get(':id')
    async get(@CurrentUser() u: AuthUser, @Param('id') id: string) {
      const clinicId = requireClinic(u);
      const e = await (this.prisma as any)[model].findFirst({ where: { id, clinicId } });
      if (!e) throw new NotFoundException(`${entity} não encontrado`);
      return e;
    }

    @Put(':id')
    async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
      const clinicId = requireClinic(u);
      const e = await (this.prisma as any)[model].findFirst({ where: { id, clinicId } });
      if (!e) throw new NotFoundException(`${entity} não encontrado`);
      return (this.prisma as any)[model].update({ where: { id }, data: dto });
    }

    @Delete(':id')
    async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
      const clinicId = requireClinic(u);
      const e = await (this.prisma as any)[model].findFirst({ where: { id, clinicId } });
      if (!e) throw new NotFoundException(`${entity} não encontrado`);
      if ('deletedAt' in e) await (this.prisma as any)[model].update({ where: { id }, data: { deletedAt: new Date() } });
      else await (this.prisma as any)[model].delete({ where: { id } });
      return { ok: true };
    }
  }
  return C;
}

const ProfessionalsController = crud('professional', 'professionals');
const RoomsController = crud('room', 'rooms');
const ProceduresController = crud('procedure', 'procedures');
const TreatmentsController = crud('treatment', 'treatments');

@Module({ controllers: [ProfessionalsController] })
export class ProfessionalsModule {}
@Module({ controllers: [RoomsController] })
export class RoomsModule {}
@Module({ controllers: [ProceduresController] })
export class ProceduresModule {}
@Module({ controllers: [TreatmentsController] })
export class TreatmentsModule {}
