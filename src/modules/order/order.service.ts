import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOrderInput,
  CreateOrderItemInput,
  UpdateOrderStatusInput,
} from 'src/entitys/order.entity';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================
     HELPERS
  ========================= */

  private async calculateOrderTotals(
    businessId: string,
    items: CreateOrderItemInput[],
  ): Promise<{
    subtotal: number;
    tax: number;
    total: number;
    orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[];
  }> {
    let subtotal = 0;
    const orderItemsData: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { taxRate: true },
    });

    if (!business) {
      throw new NotFoundException(`Business ${businessId} not found`);
    }

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true, businessId: true },
      });

      if (!product || product.businessId !== businessId) {
        throw new BadRequestException(
          `Product ${item.productId} is invalid for this business`,
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        product: { connect: { id: item.productId } },
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
        note: item.note ?? null,
      });
    }

    const tax = subtotal * (business.taxRate / 100);
    const total = subtotal + tax;

    return { subtotal, tax, total, orderItemsData };
  }

  /* =========================
     QUERIES
  ========================= */

  findOne(args: Prisma.OrderFindFirstArgs) {
    return this.prisma.order.findFirst(args);
  }

  findAll(args: Prisma.OrderFindManyArgs) {
    return this.prisma.order.findMany(args);
  }

  /* =========================
     MUTATIONS
  ========================= */

  /** Crear orden con items e historial */
  async create(input: CreateOrderInput, businessId: string) {
    const { subtotal, tax, total, orderItemsData } =
      await this.calculateOrderTotals(businessId, input.items);

    return this.prisma.order.create({
      data: {
        businessId,
        tableId: input.tableId ?? null,
        userId: input.userId,
        status: 'Pending',
        subtotal,
        tax,
        tip: input.tip ?? 0,
        discount: input.discount ?? 0,
        total: total + (input.tip ?? 0) - (input.discount ?? 0),

        items: {
          create: orderItemsData,
        },

        histories: {
          create: {
            userId: input.userId,
            previousStatus: 'None',
            newStatus: 'Pending',
          },
        },
      },
      include: {
        items: true,
      },
    });
  }

  /** Actualizar estado de orden con historial */
  async updateStatus(input: UpdateOrderStatusInput) {
    const order = await this.prisma.order.findUnique({
      where: { id: input.id },
    });

    if (!order) {
      throw new NotFoundException(`Order ${input.id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: input.id },
        data: {
          status: input.newStatus,
        },
        include: {
          items: true,
        },
      });

      await tx.orderHistory.create({
        data: {
          orderId: input.id,
          userId: input.userId,
          previousStatus: order.status,
          newStatus: input.newStatus,
        },
      });

      return updatedOrder;
    });
  }

  /** Eliminar orden completa */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.$transaction([
        this.prisma.orderItem.deleteMany({ where: { orderId: id } }),
        this.prisma.orderHistory.deleteMany({ where: { orderId: id } }),
        this.prisma.order.delete({ where: { id } }),
      ]);
      return true;
    } catch (e: any) {
      if (e.code === 'P2025') return false;
      throw e;
    }
  }

  /** Actualizar items de una orden existente */
  async updateItems(
    orderId: string,
    items: { productId: string; quantity: number; price?: number; note?: string }[],
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return null;

    await this.prisma.orderItem.deleteMany({ where: { orderId } });

    const createdItems = await this.prisma.orderItem.createMany({
      data: items.map((i) => ({
        orderId,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.price ?? 0,
        total: (i.price ?? 0) * i.quantity,
        note: i.note ?? null,
      })),
    });

    return this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  }

  /** Crear venta por todas las órdenes pendientes de una mesa */
  async createSaleFromTableOrders(params: { tableId: string; businessId: string; userId: string }) {
    const orders = await this.prisma.order.findMany({
      where: { tableId: params.tableId, status: 'Pending' },
    });

    if (!orders.length) throw new NotFoundException('No hay órdenes pendientes en la mesa');

    const subtotal = orders.reduce((acc, o) => acc + o.total, 0);

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          businessId: params.businessId,
          userId: params.userId,
          status: 'paid',
          subtotal,
          tax: 0,
          discount: 0,
          tip: 0,
          total: subtotal,
          tableId: params.tableId,
          closedAt: new Date(),
        },
      });

      await tx.order.updateMany({
        where: { tableId: params.tableId, status: 'Pending' },
        data: { status: 'CLOSED', saleId: sale.id },
      });

      return sale.id;
    });
  }
}
