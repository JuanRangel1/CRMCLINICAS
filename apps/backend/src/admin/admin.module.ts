import { Body, Controller, Get, Module, Param, Post, Put, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, Roles } from '../auth/guards';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('plans')
  plans() {
    return this.prisma.plan.findMany();
  }

  @Post('plans')
  @Roles('SUPER_ADMIN')
  createPlan(@Body() dto: any) {
    return this.prisma.plan.create({ data: dto });
  }

  @Put('plans/:id')
  @Roles('SUPER_ADMIN')
  updatePlan(@Param('id') id: string, @Body() dto: any) {
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  @Get('subscriptions')
  subscriptions() {
    return this.prisma.subscription.findMany({ include: { clinic: true, plan: true } });
  }

  @Post('subscriptions')
  @Roles('SUPER_ADMIN')
  createSubscription(@Body() dto: any) {
    return this.prisma.subscription.create({ data: dto });
  }

  @Get('audit-logs')
  @Roles('SUPER_ADMIN', 'ADMIN_CLINIC')
  audit(@CurrentUser() u: AuthUser) {
    const where = u.role === 'SUPER_ADMIN' ? {} : { clinicId: u.clinicId ?? undefined };
    return this.prisma.auditLog.findMany({ where, include: { user: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Get('permissions')
  permissions() {
    return this.prisma.permission.findMany({ include: { roles: true } });
  }
}

@Module({ controllers: [AdminController] })
export class AdminModule {}
