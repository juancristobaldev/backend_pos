import { ObjectType, Field, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class BusinessKpis {
  // Usuarios
  @Field(() => Int)
  activeUsers: number;

  @Field(() => Float)
  avgOrdersPerUser: number;

  @Field(() => Float)
  avgDaysSinceLastLogin: number;

  // Mesas / Pisos
  @Field(() => Int)
  activeTables: number;

  @Field(() => Float)
  tableRotationRate: number;

  @Field(() => Int)
  totalFloors: number;

  // Productos
  @Field(() => Int)
  availableProducts: number;

  @Field(() => Int)
  totalProducts: number;

  // Ventas
  @Field(() => Float)
  avgTicket: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  netRevenue: number;

  @Field(() => Float)
  avgTip: number;

  // Órdenes
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Int)
  completedOrders: number;

  @Field(() => Float)
  cancellationRate: number;

  // Operación
  @Field(() => Float)
  avgStatusChangeTimeMinutes: number;
}

@ObjectType()
export class RevenueChartData {
  @Field() month: string;
  @Field(() => Float) earnings: number;
  @Field(() => Float) expense: number;
}

@ObjectType()
export class ProductStat {
  @Field() id: string;
  @Field() name: string;
  @Field() category: string;
  @Field() priority: string;
  @Field(() => Float) price: number;
  @Field(() => Float) budget: number;
  @Field(() => Float) percentage: number;
}

@ObjectType()
export class Transaction {
  @Field() id: string;
  @Field() title: string;
  @Field() subtitle: string;
  @Field(() => Float) amount: number;
  @Field() type: string;
  @Field() date: string;
  @Field() status: string;
}

@ObjectType()
export class BusinessKpisV2 {
  @Field(() => Float) totalRevenue: number;
  @Field(() => [RevenueChartData]) revenueUpdates: RevenueChartData[];
  @Field(() => [ProductStat]) productPerformances: ProductStat[];
  @Field(() => [Transaction]) recentTransactions: Transaction[];
}