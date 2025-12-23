// auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'; // Necesitas instalar @nestjs/jwt
import * as bcrypt from 'bcrypt'; // Necesitas instalar bcrypt
import { AuthInput } from 'src/entitys/auth.entity'; // Input genérico para login
import { Role } from 'src/common/decorators/roles.decorators';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Genera un token JWT para el usuario/cliente autenticado.
   * @param payload Objeto con información mínima (ID y tipo de rol/modelo).
   * @returns Un objeto con el token de acceso.
   */
  async generateToken(payload: {
    email: string;
    role: string;
  }): Promise<{ accessToken: string }> {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  // 1. LÓGICA DE LOGIN PARA USUARIOS (EMPLEADOS)
  async validateUser(input: AuthInput): Promise<any> {
    const { email, password } = input;

    // 1. Buscar el usuario (empleado) en la base de datos
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log(user)
    if (user && user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account is inactive.');
    }

    // 2. Verificar la contraseña
    // Nota: Asume que las contraseñas están hasheadas en la DB.
    if (user && password === user.password) {
      // 3. Generar el payload JWT
      const payload = {
        id:user.id,
        email: user.email,
        role: user.role,
        businessId:user.businessId
      };
      return this.generateToken(payload);
    }

    // Si no es un usuario, intenta con un cliente
    return this.validateClient(input);
  }

  // 2. LÓGICA DE LOGIN PARA CLIENTES (DUEÑOS/ADMINISTRADORES)
  async validateClient(input: AuthInput): Promise<any> {
    const { email, password } = input;

    // 1. Buscar el cliente (dueño) en la base de datos
    const client = await this.prisma.client.findUnique({ where: { email } });

    if (client && client.status !== 'Active') {
      throw new UnauthorizedException('Client account is inactive.');
    }

    // 2. Verificar la contraseña
    if (client && (await bcrypt.compare(password, client.password))) {
      // 3. Generar el payload JWT
      const payload = {
        ...client,
        email: client.email,
        role: Role.Administrator, // Asignar un rol de administrador del sistema/dueño
      };

      return this.generateToken(payload);
    }

    // Si no se encontró ni un User ni un Client, o la contraseña falló
    throw new UnauthorizedException('Invalid credentials.');
  }

  // 3. Hashing de contraseña (útil para el proceso de registro/creación)
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }
}
