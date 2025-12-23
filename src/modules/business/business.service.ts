// business.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// Asumimos que los Inputs (CreateBusinessInput, UpdateBusinessInput) ya están definidos
import {
  Business,
  CreateBusinessInput,
  UpdateBusinessInput,
} from '../../entitys/business.entity';
import { Prisma } from '@prisma/client';
import { User } from 'src/entitys/user.entity';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  // 1. CREAR NEGOCIO (Mutación: createBusiness)
  /**
   * Crea un nuevo registro de negocio en la base de datos.
   * @param input Los datos de la empresa, incluyendo el clientId (dueño).
   * @returns El objeto Business recién creado.
   */
  async create(
    input: CreateBusinessInput,
    clientId: string,
  ): Promise<Business> {
    const { name, address, phone } = input;

    // NOTA: 'status' se establece a un valor inicial, asumido como 'Active'.
    const newBusiness = await this.prisma.business.create({
      data: {
        clientId, // ID del cliente/dueño que creó el negocio
        name,
        address,
        phone,
        currency: 'CLP',
        taxRate: 19,
        maxTables: 200,
        status: 'Active',
      },
    });

    return { ...newBusiness, theme: '', floors: [] };
  }

  // 2. ACTUALIZAR NEGOCIO (Mutación: updateBusiness)
  /**
   * Actualiza un negocio existente por su ID.
   * @param id ID del negocio (String)
   * @param input Los campos opcionales a modificar.
   * @returns El objeto Business actualizado.
   */
  async update(id: string, input: UpdateBusinessInput): Promise<Business> {
    try {
      // Usamos 'update' y solo pasamos los campos definidos en el input
      const updatedBusiness = await this.prisma.business.update({
        where: { id: id },
        data: input,
        include: { floors: true },
      });

      return { ...updatedBusiness, theme: '' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Business with ID ${id} not found.`);
      }
      throw error;
    }
  }

  // 3. ELIMINAR NEGOCIO (Mutación: deleteBusiness)
  /**
   * Elimina un negocio por su ID.
   * @param id ID del negocio (String)
   * @returns true si la eliminación fue exitosa, false si no se encontró.
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.business.delete({
        where: { id: id },
      });
      return true;
    } catch (error) {
      // Prisma lanza P2025 si el registro no existe
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  // --- Consulta de ejemplo (Query, útil para el Resolver) ---

  async find(
    where: Prisma.BusinessWhereInput,
    include?: Prisma.BusinessInclude | {},
  ): Promise<Business | null> {
    const business = await this.prisma.business.findFirst({
      where: where,
      include: { floors: true, ...include },
    });
    if (business) {
      return { ...business, theme: '' };
    }
    return null;
  }

  async findOne(
    id: string,
    include?: Prisma.BusinessInclude | {},
  ): Promise<Business | null> {
    const business = await this.prisma.business.findUnique({
      where: { id: id },
      include: { floors: true, ...include },
    });
    if (business) {
      return { ...business, theme: '' };
    }
    return null;
  }
}
