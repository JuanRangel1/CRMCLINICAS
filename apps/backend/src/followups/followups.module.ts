import { Body, Controller, Get, Module, Param, Post, Put, Query, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, requireClinic } from '../auth/guards';

@ApiTags('followups')
@ApiBearerAuth()
@Controller('followups')
export class FollowUpsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser, @Query('today') today?: string) {
    const clinicId = requireClinic(u);
    const where: any = { clinicId, done: false };
    if (today === '1') where.dueDate = { lte: new Date() };
    return this.prisma.followUp.findMany({ where, include: { patient: true }, orderBy: { dueDate: 'asc' } });
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.followUp.create({ data: { ...dto, dueDate: new Date(dto.dueDate), clinicId } });
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const f = await this.prisma.followUp.findFirst({ where: { id, clinicId } });
    if (!f) throw new NotFoundException();
    return this.prisma.followUp.update({ where: { id }, data: dto });
  }
}

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    return this.prisma.task.findMany({ where: { clinicId }, include: { patient: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.task.create({ data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, clinicId } });
  }

  @Put(':id')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = requireClinic(u);
    const t = await this.prisma.task.findFirst({ where: { id, clinicId } });
    if (!t) throw new NotFoundException();
    return this.prisma.task.update({ where: { id }, data: dto });
  }
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    return this.prisma.notification.findMany({ where: { clinicId }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.notification.create({ data: { ...dto, clinicId, userId: u.id } });
  }

  @Put(':id/read')
  read(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    return this.prisma.notification.update({ where: { id }, data: { read: true } });
  }
}

@ApiTags('satisfaction')
@ApiBearerAuth()
@Controller('satisfaction')
export class SatisfactionController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    return this.prisma.satisfactionSurvey.findMany({ where: { clinicId }, include: { patient: true, professional: true }, orderBy: { createdAt: 'desc' } });
  }

  @Post()
  create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = requireClinic(u);
    return this.prisma.satisfactionSurvey.create({ data: { ...dto, clinicId } });
  }

  @Get('summary')
  async summary(@CurrentUser() u: AuthUser) {
    const clinicId = requireClinic(u);
    const surveys = await this.prisma.satisfactionSurvey.findMany({ where: { clinicId } });
    const avg = surveys.length ? surveys.reduce((s, x) => s + x.rating, 0) / surveys.length : 0;
    const promoters = surveys.filter((s) => s.rating >= 4).length;
    const detractors = surveys.filter((s) => s.rating <= 2).length;
    const nps = surveys.length ? Math.round(((promoters - detractors) / surveys.length) * 100) : 0;
    return { total: surveys.length, average: Math.round(avg * 10) / 10, nps };
  }
}

@Module({ controllers: [FollowUpsController] })
export class FollowUpsModule {}
@Module({ controllers: [TasksController] })
export class TasksModule {}
@Module({ controllers: [NotificationsController] })
export class NotificationsModule {}
@Module({ controllers: [SatisfactionController] })
export class SatisfactionModule {}
