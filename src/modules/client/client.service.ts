// client.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client'; // Importamos el tipo 'Client' de Prisma
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service'; // Necesario para cifrar la contraseña
import {
  CreateClientInput,
  UpdateClientInput,
} from 'src/entitys/client.entity';
// Importamos los Inputs (asumimos que ya están creados)

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService, // Usamos el AuthService para cifrar
  ) {}

  // MÉTODO AUXILIAR: Buscar por email (usado en autenticación)
  async findByEmail(
    email: string,
    include?: Prisma.ClientInclude | {},
  ): Promise<Client | null> {
    return this.prisma.client.findUnique({ where: { email }, include });
  }

  // 1. CREAR CLIENTE (Mutación: createClient)
  async create(input: CreateClientInput): Promise<Client> {
    const { name, email, password } = input;

    // Cifra la contraseña antes de guardarla en la base de datos
    const hashedPassword = await this.authService.hashPassword(password);

    // NOTA: Asignamos un estado inicial (ej. 'Active')
    const newClient = await this.prisma.client.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: 'Active',
      },
    });

    return newClient;
  }

  // 2. ACTUALIZAR CLIENTE (Mutación: updateClient)
  async update(id: string, input: UpdateClientInput): Promise<Client> {
    const dataToUpdate: any = { ...input };

    // Si se proporciona una nueva contraseña, la ciframos antes de actualizar
    if (input.password) {
      dataToUpdate.password = await this.authService.hashPassword(
        input.password,
      );
    }

    try {
      const updatedClient = await this.prisma.client.update({
        where: { id: id },
        data: dataToUpdate,
      });

      return updatedClient;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found.`);
      }
      throw error;
    }
  }

  // 3. ELIMINAR CLIENTE (Mutación: deleteClient)
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.client.delete({
        where: { id: id },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        // El cliente no existe
        return false;
      }
      throw error;
    }
  }
}
