import { Body, Controller, Delete, Get, Module, Param, Post, Put, NotFoundException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.module';
import { AuthUser, CurrentUser, Roles, requireClinic } from '../auth/guards';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() u: AuthUser) {
    if (u.role === 'SUPER_ADMIN') return this.prisma.user.findMany({ include: { role: true, clinic: true } });
    const clinicId = requireClinic(u);
    return this.prisma.user.findMany({ where: { clinicId, deletedAt: null }, include: { role: true } });
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN_CLINIC')
  async create(@CurrentUser() u: AuthUser, @Body() dto: any) {
    const clinicId = u.role === 'SUPER_ADMIN' ? dto.clinicId : requireClinic(u);
    const role = await this.prisma.role.findUnique({ where: { name: dto.roleName } });
    if (!role) throw new NotFoundException('Papel não encontrado');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({ data: { name: dto.name, email: dto.email, phone: dto.phone, passwordHash, roleId: role.id, clinicId } });
    await this.prisma.auditLog.create({ data: { userId: u.id, clinicId, action: 'CREATE', entity: 'user', entityId: user.id } });
    return { ...user, passwordHash: undefined };
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLINIC')
  async update(@CurrentUser() u: AuthUser, @Param('id') id: string, @Body() dto: any) {
    const clinicId = u.role === 'SUPER_ADMIN' ? undefined : requireClinic(u);
    const existing = await this.prisma.user.findFirst({ where: { id, ...(clinicId ? { clinicId } : {}) } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');
    const data: any = { ...dto };
    delete data.password;
    if (dto.roleName) {
      const role = await this.prisma.role.findUnique({ where: { name: dto.roleName } });
      if (role) data.roleId = role.id;
      delete data.roleName;
    }
    return this.prisma.user.update({ where: { id }, data });
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN_CLINIC')
  async remove(@CurrentUser() u: AuthUser, @Param('id') id: string) {
    const clinicId = u.role === 'SUPER_ADMIN' ? undefined : requireClinic(u);
    const existing = await this.prisma.user.findFirst({ where: { id, ...(clinicId ? { clinicId } : {}) } });
    if (!existing) throw new NotFoundException('Usuário não encontrado');
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
    return { ok: true };
  }
}

@Module({ controllers: [UsersController] })
export class UsersModule {}
