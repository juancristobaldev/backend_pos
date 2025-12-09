// order.entity.ts

import { ObjectType, Field, InputType, ID, Float, Int } from '@nestjs/graphql';
import {
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';

// =========================================================
// 1. OUTPUT TYPES (Entities)
// =========================================================

// --- OrderItem Entity ---
// --- OrderItem Entity ---
@ObjectType()
export class OrderItem implements PrismaOrderItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  total: number;

  // ¡SOLUCIÓN APLICADA! Se añade explícitamente el tipo String.
  @Field(() => String, { nullable: true })
  note: string | null;
}

// --- Order Entity ---
@ObjectType()
export class Order implements PrismaOrder {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  tableId: string;

  @Field(() => ID)
  userId: string;

  @Field()
  status: string;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  total: number;

  @Field(() => Float)
  tip: number;

  @Field(() => Float)
  discount: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relación: Incluimos los ítems del pedido como un array de OrderItem
  @Field(() => [OrderItem])
  items: OrderItem[];

  // Nota: Otras relaciones (table, user, histories) se añadirían con @ResolveField
}

// =========================================================
// 2. INPUT TYPES (Mutations)
// =========================================================

// --- Input para la creación de un ítem dentro de un pedido ---
@InputType()
export class CreateOrderItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => String, { nullable: true })
  note?: string;
}

// --- Input para la creación del pedido principal ---
@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  tableId: string; // Mesa asignada

  @Field(() => ID)
  userId: string; // Usuario (empleado) que toma el pedido

  @Field(() => Float, { defaultValue: 0 })
  tip: number;

  @Field(() => Float, { defaultValue: 0 })
  discount: number;

  // Array de ítems para crear
  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

// --- Input para actualizar el estado del pedido ---
@InputType()
export class UpdateOrderStatusInput {
  @Field(() => ID)
  id: string; // ID del pedido a actualizar

  @Field()
  newStatus: string; // Nuevo estado (e.g., 'Completed', 'Canceled')

  @Field(() => ID)
  userId: string; // ID del usuario que realiza el cambio de estado (para el historial)
}

// --- Input para eliminar el pedido ---
@InputType()
export class DeleteOrderInput {
  @Field(() => ID)
  id: string;
}
