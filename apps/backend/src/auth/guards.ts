import { CanActivate, createParamDecorator, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  clinicId: string | null;
}

export const CurrentUser = createParamDecorator((_d, ctx: ExecutionContext): AuthUser => {
  return ctx.switchToHttp().getRequest().user;
});

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) { super(); }
  canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [ctx.getHandler(), ctx.getClass()]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }
  handleRequest(err: any, user: any) {
    if (err || !user) throw err || new UnauthorizedException('Não autenticado');
    return user;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles || roles.length === 0) return true;
    const user = ctx.switchToHttp().getRequest().user;
    if (!user) throw new ForbiddenException('Acesso negado');
    if (!roles.includes(user.role)) throw new ForbiddenException('Sem permissão');
    return true;
  }
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user) return true;
    if (user.role !== 'SUPER_ADMIN' && !user.clinicId) {
      throw new ForbiddenException('Usuário sem clínica vinculada');
    }
    return true;
  }
}

export function requireClinic(user: AuthUser): string {
  if (user.role === 'SUPER_ADMIN') throw new ForbiddenException('Super admin sem clínica');
  if (!user.clinicId) throw new ForbiddenException('Sem clínica');
  return user.clinicId;
}
