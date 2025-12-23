import { Resolver, Query, Args } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessKpis, BusinessKpisV2, ProductStat } from 'src/entitys/kpi.entity';


@Resolver()
export class KpiResolver {
  constructor(private readonly prisma: PrismaService) {}
  @Query(() => BusinessKpisV2)
  async businessKpisV2(@Args('businessId') businessId: string): Promise<BusinessKpisV2> {
    
    // 1. Obtener Órdenes del Negocio
    const orders = await this.prisma.order.findMany({
      where: {
        table: { floor: { businessId } }
      },
      include: {
        items: { include: { product: true } },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // --- KPI 1: TOTAL REVENUE ---
    const totalRevenue = orders
      .filter(o => o.status === 'COMPLETED')
      .reduce((acc, o) => acc + o.total, 0);

    // --- KPI 2: REVENUE UPDATES ---
    const monthsMap = new Map<string, { earnings: number, expense: number }>();
    
    orders.forEach(order => {
      const monthKey = order.createdAt.toLocaleString('default', { month: 'short' });
      
      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, { earnings: 0, expense: 0 });
      }
      
      // SOLUCIÓN AL ERROR: Verificar que 'current' existe
      const current = monthsMap.get(monthKey);
      
      if (current) {
        if (order.status === 'COMPLETED') {
            current.earnings += order.total;
        } else if (order.status === 'CANCELLED') {
            current.expense += order.total;
        }
      }
    });

    const revenueUpdates = Array.from(monthsMap.entries()).map(([month, data]) => ({
      month,
      earnings: data.earnings,
      expense: data.expense
    })).reverse().slice(0, 9);


    // --- KPI 3: PRODUCT PERFORMANCES ---
    const productMap = new Map<string, ProductStat>();

    for (const order of orders) {
      if (order.status !== 'COMPLETED') continue;

      for (const item of order.items) {
        if (!productMap.has(item.productId)) {
          productMap.set(item.productId, {
            id: item.productId,
            name: item.product.name,
            category: item.product.category,
            priority: item.product.price > 50 ? 'High' : 'Low',
            price: item.product.price,
            budget: 0,
            percentage: item.product.available ? 100 : 0
          });
        }
        
        // SOLUCIÓN AL ERROR: Verificar que 'prod' existe
        const prod = productMap.get(item.productId);
        if (prod) {
            prod.budget += item.total;
        }
      }
    }
    
    const productPerformances = Array.from(productMap.values())
      .sort((a, b) => b.budget - a.budget)
      .slice(0, 5)
      .map(p => ({
        ...p,
        percentage: Math.min(100, Math.round((p.budget / 1000) * 100))
      }));


    // --- KPI 4: RECENT TRANSACTIONS ---
    const recentTransactions = orders.slice(0, 6).map(order => {
      let title = "Order #" + order.id.slice(0, 4);
      let subtitle = "Payment received";
      let type = "Income";

      if (order.user) {
        title = order.user.name;
      }
      
      if (order.status === 'CANCELLED') {
        subtitle = "Refunded";
        type = "Expense";
      }

      return {
        id: order.id,
        title,
        subtitle,
        amount: order.total,
        type,
        date: order.createdAt.toISOString(),
        status: order.status
      };
    });

    return {
      totalRevenue,
      revenueUpdates,
      productPerformances,
      recentTransactions
    };
  }
  @Query(() => BusinessKpis)
  async businessKpis(
    @Args('businessId') businessId: string,
  ): Promise<BusinessKpis> {
    /* ===============================
       USUARIOS
    =============================== */

    const activeUsers = await this.prisma.user.count({
      where: {
        businessId,
        status: 'ACTIVE',
      },
    });

    const users = await this.prisma.user.findMany({
      where: { businessId },
      include: { orders: true },
    });

    const avgOrdersPerUser =
      users.length === 0
        ? 0
        : users.reduce((acc, u) => acc + u.orders.length, 0) / users.length;

    const now = new Date();
    const avgDaysSinceLastLogin =
      users.length === 0
        ? 0
        : users.reduce((acc, u) => {
            if (!u.lastLogin) return acc;
            const diff =
              (now.getTime() - u.lastLogin.getTime()) / (1000 * 60 * 60 * 24);
            return acc + diff;
          }, 0) / users.length;

    /* ===============================
       MESAS / PISOS
    =============================== */

    const activeTables = await this.prisma.table.count({
      where: {
        status: 'OCCUPIED',
        floor: {
          businessId,
        },
      },
    });

    const totalFloors = await this.prisma.floor.count({
      where: { businessId },
    });

    const tables = await this.prisma.table.findMany({
      where: {
        floor: {
          businessId,
        },
      },
      include: {
        orders: true,
      },
    });

    const tableRotationRate =
      tables.length === 0
        ? 0
        : tables.reduce((acc, t) => acc + t.orders.length, 0) / tables.length;

    /* ===============================
       PRODUCTOS
    =============================== */

    const availableProducts = await this.prisma.product.count({
      where: {
        businessId,
        available: true,
      },
    });

    const totalProducts = await this.prisma.product.count({
      where: { businessId },
    });

    /* ===============================
       ÓRDENES / VENTAS
    =============================== */

    const orders = await this.prisma.order.findMany({
      where: {
        table: {
          floor: {
            businessId,
          },
        },
      },
      include: {
        histories: true,
      },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === 'COMPLETED',
    ).length;

    const cancellationRate =
      totalOrders === 0
        ? 0
        : (orders.filter((o) => o.status === 'CANCELLED').length /
            totalOrders) *
          100;

    const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

    const netRevenue = orders.reduce(
      (acc, o) => acc + (o.total - o.tax - o.discount),
      0,
    );

    const avgTicket =
      totalOrders === 0 ? 0 : totalRevenue / totalOrders;

    const avgTip =
      totalOrders === 0
        ? 0
        : orders.reduce((acc, o) => acc + o.tip, 0) / totalOrders;

    /* ===============================
       HISTORIAL DE ESTADOS
    =============================== */

    const histories = orders.flatMap((o) => o.histories);

    const avgStatusChangeTimeMinutes =
      histories.length === 0
        ? 0
        : histories.reduce((acc, h) => {
            const diff =
              (h.changedAt.getTime() -
                new Date(h.changedAt).getTime()) /
              (1000 * 60);
            return acc + Math.abs(diff);
          }, 0) / histories.length;

    /* ===============================
       RETURN
    =============================== */

    return {
      activeUsers,
      avgOrdersPerUser,
      avgDaysSinceLastLogin,
      activeTables,
      tableRotationRate,
      totalFloors,
      availableProducts,
      totalProducts,
      avgTicket,
      totalRevenue,
      netRevenue,
      avgTip,
      totalOrders,
      completedOrders,
      cancellationRate,
      avgStatusChangeTimeMinutes,
    };
  }
}

