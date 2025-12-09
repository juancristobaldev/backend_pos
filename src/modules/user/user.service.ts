// user.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from 'src/entitys/user.entity';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAllByBusiness(businessId: string): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        businessId: businessId, // Filtramos estrictamente por el negocio
        // Opcional: Puedes excluir al Administrador Principal o filtrar por estado 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        businessId: true,
        password: true,
        updatedAt: true,
        createdAt: true,
        // No seleccionar 'password' por seguridad
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  // 1. CREAR USUARIO (Mutación: createUser)
  // Utiliza 'data' para el objeto de creación, incluyendo la relación 'business'
  async create(input: CreateUserInput): Promise<User> {
    const { businessId, name, email, password, role } = input;

    // NOTA: Se asume que 'status' tiene un valor predeterminado o se manejará aparte.
    // Aquí usamos un valor de ejemplo 'Active'.

    const newUser = await this.prisma.user.create({
      data: {
        businessId, // Se enlaza con el Business
        name,
        email,
        password,
        role,
        status: 'Active',
      },
      // Puedes incluir el negocio y otras relaciones si es necesario devolverlas
      // include: { business: true },
    });

    return newUser;
  }

  // 2. ACTUALIZAR USUARIO (Mutación: updateUser)
  // Actualiza un usuario por su ID
  async update(id: string, input: UpdateUserInput): Promise<User> {
    try {
      // Usamos 'update' y especificamos el ID en 'where'
      const updatedUser = await this.prisma.user.update({
        where: { id: id },
        data: {
          // Utiliza la sintaxis de Prisma para actualizar solo los campos presentes en el input
          name: input.name,
          email: input.email,
          password: input.password,
          role: input.role,
          status: input.status,
          // 'businessId' generalmente no se actualiza, pero se podría añadir si es necesario.
        },
      });
      return updatedUser;
    } catch (error) {
      // Manejar el caso donde el usuario no se encuentra (código P2025 de Prisma)
      if (error.code === 'P2025') {
        throw new NotFoundException(`User with ID ${id} not found.`);
      }
      throw error;
    }
  }

  // 3. ELIMINAR USUARIO (Mutación: deleteUser)
  // Elimina un usuario por su ID
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id: id },
      });
      return true; // Eliminación exitosa
    } catch (error) {
      if (error.code === 'P2025') {
        // El usuario ya no existe o nunca existió
        return false;
      }
      throw error;
    }
  }
}
