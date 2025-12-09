// order.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { OrderItem, Prisma } from '@prisma/client'; // Tipos de salida de Prisma
import { PrismaService } from '../prisma/prisma.service';
import {
  Order,
  CreateOrderInput,
  CreateOrderItemInput,
  UpdateOrderStatusInput,
} from 'src/entitys/order.entity';
// Asumimos que los Inputs están definidos en order.entity.ts
// import { CreateOrderInput, UpdateOrderStatusInput, CreateOrderItemInput } from './order.entity';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Método auxiliar para calcular subtotal, impuestos y total.
   * Busca los precios de los productos y aplica los cálculos.
   */
  private async calculateOrderTotals(
    businessId: string,
    items: CreateOrderItemInput[],
  ): Promise<{
    subtotal: number;
    tax: number;
    total: number;
    orderItemsData: any[];
  }> {
    let subtotal = 0;
    const orderItemsData: any[] = [];

    // 1. Obtener el porcentaje de impuestos del negocio
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { taxRate: true },
    });

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found.`);
    }

    // 2. Buscar precios de productos y calcular subtotales de ítems
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true, businessId: true },
      });

      if (!product || product.businessId !== businessId) {
        throw new BadRequestException(
          `Product ID ${item.productId} is invalid or does not belong to the business.`,
        );
      }

      const unitPrice = product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        total: itemTotal,
        note: item.note,
      });
    }

    // 3. Aplicar impuestos
    const taxRate = business.taxRate / 100;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return { subtotal, tax, total, orderItemsData };
  }

  async findOne(
    where: Prisma.OrderWhereInput,
    include: Prisma.OrderInclude,
  ): Promise<Order | null> {
    try {
      return await this.prisma.order.findFirst({
        where,
        include,
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(e);
    }
  }

  async findAll(where: Prisma.OrderWhereInput, include: Prisma.OrderInclude) {
    try {
      return await this.prisma.order.findMany({
        where,
        include,
      });
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(e);
    }
  }
  // 1. CREAR PEDIDO (Mutación: createOrder)
  /**
   * Crea un nuevo pedido con sus ítems asociados.
   * @param input Datos del pedido, incluyendo items.
   * @returns El objeto Order recién creado.
   */
  async create(input: CreateOrderInput, businessId: string): Promise<Order> {
    const { subtotal, tax, total, orderItemsData } =
      await this.calculateOrderTotals(businessId, input.items);

    // El pedido inicia en estado 'Pending'
    const newOrder = await this.prisma.order.create({
      data: {
        tableId: input.tableId,
        userId: input.userId,
        status: 'Pending',
        subtotal: subtotal,
        tax: tax,
        total: total + input.tip - input.discount, // Total final con propina y descuento
        tip: input.tip,
        discount: input.discount,

        // Crea los OrderItems en la misma transacción
        items: {
          create: orderItemsData,
        },

        // Crea un historial de orden inicial
        histories: {
          create: {
            userId: input.userId,
            previousStatus: 'None',
            newStatus: 'Pending',
          },
        },
      },
      include: { items: true }, // Retorna el pedido con sus ítems
    });

    return newOrder;
  }

  // 2. ACTUALIZAR ESTADO DE PEDIDO (Mutación: updateOrderStatus)
  /**
   * Cambia el estado de un pedido y registra el cambio en el historial.
   * @param input ID del pedido, nuevo estado y ID del usuario que lo cambia.
   * @returns El objeto Order actualizado.
   */
  async updateStatus(input: UpdateOrderStatusInput): Promise<Order> {
    const { id, newStatus, userId } = input;

    // 1. Obtener estado actual
    const currentOrder = await this.prisma.order.findUnique({ where: { id } });

    if (!currentOrder) {
      throw new NotFoundException(`Order with ID ${id} not found.`);
    }

    // 2. Actualizar estado y crear registro de historial en una sola transacción
    const updatedOrder = await this.prisma.$transaction(async (prisma) => {
      // A. Actualizar el estado del pedido
      const order = await prisma.order.update({
        where: { id: id },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          items: true,
        },
      });

      // B. Registrar el cambio en el historial
      await prisma.orderHistory.create({
        data: {
          orderId: id,
          userId: userId,
          previousStatus: currentOrder.status,
          newStatus: newStatus,
        },
      });

      return order;
    });

    return updatedOrder;
  }

  // 3. ELIMINAR PEDIDO (Mutación: deleteOrder)
  /**
   * Elimina un pedido por su ID.
   * @param id ID del pedido (String).
   * @returns true si la eliminación fue exitosa.
   */
  async delete(id: string): Promise<boolean> {
    try {
      // La eliminación debe ser en cascada: primero ítems e historial
      await this.prisma.$transaction([
        this.prisma.orderItem.deleteMany({ where: { orderId: id } }),
        this.prisma.orderHistory.deleteMany({ where: { orderId: id } }),
        this.prisma.order.delete({ where: { id: id } }),
      ]);

      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}
