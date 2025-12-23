// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserInput,
  UpdateUserInput,
  EmployeeStatus,
  User as GraphqlUser,
  User,
  OutputUser,
} from 'src/entitys/user.entity';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /* --------------------------------------------------------
   * Mapper Prisma → GraphQL
   * -------------------------------------------------------- */
  private mapUser(user: PrismaUser): GraphqlUser {
    return {
      ...user,
      status: user.status as EmployeeStatus,
    };
  }


  async findOne(userId: string): Promise<OutputUser> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return {
          success: false,
          errors: 'NOT FOUND',
        };
      }
  
      return {
        success: true,
        user: {
          ...user,
          status: user.status as EmployeeStatus,
        },
      };
    } catch (e) {
      console.error(e);
  
      return {
        success: false,
        errors: 'INTERNAL SERVER ERROR',
      };
    }
  }
  
  /* --------------------------------------------------------
   * Obtener usuarios por negocio
   * -------------------------------------------------------- */
  async findAllByBusiness(businessId: string): Promise<GraphqlUser[]> {
    const users = await this.prisma.user.findMany({
      where: {
        businessId,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users.map((user) => this.mapUser(user));
  }

  /* --------------------------------------------------------
   * Crear usuario
   * -------------------------------------------------------- */
  async create(input: CreateUserInput): Promise<GraphqlUser> {
    const { businessId, name, email, password, role } = input;

    const newUser = await this.prisma.user.create({
      data: {
        businessId,
        name,
        email,
        password,
        role,
        status: EmployeeStatus.ACTIVE, // 👈 estado por defecto
      },
    });

    return this.mapUser(newUser);
  }

  /* --------------------------------------------------------
   * Actualizar usuario
   * -------------------------------------------------------- */
  async update(
    id: string,
    input: UpdateUserInput,
  ): Promise<GraphqlUser> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
          status: input.status,
        },
      });

      return this.mapUser(updatedUser);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error;
    }
  }

  /* --------------------------------------------------------
   * Eliminar usuario
   * -------------------------------------------------------- */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
