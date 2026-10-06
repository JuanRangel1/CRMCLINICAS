import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, password: string, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: { role: true, clinic: true } });
    if (!user || !user.active) throw new UnauthorizedException('Credenciais inválidas');
    if (user.clinic && user.clinic.status !== 'ACTIVE' && user.role.name !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Clínica suspensa ou inativa');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    await this.prisma.auditLog.create({ data: { userId: user.id, clinicId: user.clinicId, action: 'LOGIN', entity: 'user', entityId: user.id, ip } });
    return this.issueTokens(user);
  }

  private async issueTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role.name, clinicId: user.clinicId };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
    } as any);
    const refreshToken = await this.jwt.signAsync({ sub: user.id, type: 'refresh' }, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_TTL ?? '7d',
    } as any);
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    await this.prisma.refreshToken.create({ data: { userId: user.id, token: refreshToken, expiresAt } });
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role.name, clinicId: user.clinicId },
    };
  }

  async refresh(token: string) {
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expirado ou revogado');
    }
    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub }, include: { role: true } });
    if (!user) throw new UnauthorizedException();
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
    return this.issueTokens(user);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { role: true, clinic: true } });
    if (!user) throw new UnauthorizedException();
    return { id: user.id, name: user.name, email: user.email, role: user.role.name, clinicId: user.clinicId, clinic: user.clinic };
  }
}
