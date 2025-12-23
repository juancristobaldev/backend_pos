import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SaleService {
  constructor(private readonly prisma: PrismaService) {}

  async findByBusiness(businessId: string) {
    return this.prisma.sale.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          include: {
            items: { include: { product: true } },
            table: true,
          },
        },
        user: true,
      },
    });
  }

  /**
   * Cierra una orden y genera su venta (1–1)
   */
  async createFromOrder(params: {
    orderId: string;
    businessId: string;
    userId: string;
    clientEmail?: string;
  }) {
    const order = await this.prisma.order.findUnique({
      where: { id: params.orderId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.saleId) {
      throw new BadRequestException('La orden ya tiene una venta asociada');
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          businessId: params.businessId,
          userId: params.userId,
          clientEmail: params.clientEmail,
          status: 'paid',
          subtotal: order.subtotal,
          tax: order.tax,
          discount: order.discount,
          tip: order.tip,
          total: order.total,
          tableId: order.tableId!,
          closedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'closed',
          saleId: sale.id,
        },
      });

      return sale;
    });
  }
}
