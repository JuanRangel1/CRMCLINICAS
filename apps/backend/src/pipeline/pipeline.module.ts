import { Body, Controller, Get, Module, Param, Post, Put, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('pipeline')
@ApiBearerAuth()
@Controller('pipeline')
export class PipelineController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async pipeline(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    let pipeline = await this.prisma.pipeline.findFirst({
      where: { clinicId },
      include: { stages: { orderBy: { order: 'asc' }, include: { opportunities: { include: { patient: true, lead: true } } } } },
    });
    return pipeline;
  }

  @Post('opportunities')
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.opportunity.create({ data: { ...dto, clinicId } });
  }

  @Put('opportunities/:id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const o = await this.prisma.opportunity.findFirst({ where: { id, clinicId } });
    if (!o) throw new NotFoundException();
    return this.prisma.opportunity.update({ where: { id }, data: dto });
  }
}

@Module({ controllers: [PipelineController] })
export class PipelineModule {}
