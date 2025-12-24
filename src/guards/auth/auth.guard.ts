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

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Contexto GraphQL
    const ctx = GqlExecutionContext.create(context).getContext();
    const req = ctx.req; // 🔴 CLAVE

    const authHeader = req.headers.authorization;

    console.log(authHeader);
    if (!authHeader) {
      throw new UnauthorizedException('Token no encontrado');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Verificar token
    const payload = this.jwtService.verify(token);

    console.log(payload);
    // Guardar usuario en el request
    req.user = payload;

    // Verificar rol
    return requiredRoles.includes(payload.role);
  }
}
