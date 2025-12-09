// product.service.ts

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
// Asumimos que los Inputs están definidos en product.entity.ts
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
} from '../../entitys/product.entity';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll(businessId: string): Promise<Product[]> {
    return this.prisma.product.findMany({
      // Puedes añadir un 'where' aquí para filtrar por businessId si es necesario:
      where: {
        businessId: businessId,
      },
      orderBy: {
        name: 'asc', // Ordena por nombre para una mejor UX
      },
    });
  }

  async findOne(
    where: Prisma.ProductWhereInput,
    include: Prisma.ProductInclude,
  ): Promise<Product | null> {
    try {
      const newProduct = await this.prisma.product.findFirst({
        where,
        include,
      });

      return newProduct;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  // 1. CREAR PRODUCTO (Mutación: createProduct)
  /**
   * Crea un nuevo producto, enlazándolo a un negocio por businessId.
   * @param input Los datos del producto, incluyendo businessId.
   * @returns El objeto Product recién creado.
   */
  async create(input: CreateProductInput): Promise<Product> {
    const { businessId, name, description, price, available, category } = input;

    const newProduct = await this.prisma.product.create({
      data: {
        businessId,
        name,
        description,
        price,
        available,
        category,
      },
    });

    return newProduct;
  }

  // 2. ACTUALIZAR PRODUCTO (Mutación: updateProduct)
  /**
   * Actualiza un producto existente por su ID.
   * @param id ID del producto (String).
   * @param input Los campos opcionales a modificar.
   * @returns El objeto Product actualizado.
   */
  async update(id: string, input: UpdateProductInput): Promise<Product> {
    try {
      // Usamos 'update' y solo pasamos los campos definidos en el input
      const updatedProduct = await this.prisma.product.update({
        where: { id: id },
        data: input,
      });

      return updatedProduct;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }
      throw error;
    }
  }

  // 3. ELIMINAR PRODUCTO (Mutación: deleteProduct)
  /**
   * Elimina un producto por su ID.
   * @param id ID del producto (String).
   * @returns true si la eliminación fue exitosa, false si no se encontró.
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id: id },
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
