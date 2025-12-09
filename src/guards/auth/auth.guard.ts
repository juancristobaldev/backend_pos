import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from 'src/common/decorators/roles.decorators';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Leer roles desde el decorador
    const requiredRoles = this.reflector.get<Role[]>(
      'roles',
      context.getHandler(),
    );

    // Si el resolver no tiene @Roles → permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Contexto GraphQL
    const ctx = GqlExecutionContext.create(context).getContext();

    let authHeader = ctx.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Verificar token
    const payload = this.jwtService.verify(token);

    // Guardar usuario en contexto global
    ctx.user = payload;

    // Verificar rol
    return requiredRoles.includes(payload.role);
  }
}
