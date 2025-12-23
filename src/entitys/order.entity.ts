import { ObjectType, Field, ID, Float, Int, InputType } from '@nestjs/graphql';
import { Product } from './product.entity';

/* =========================
   OUTPUT TYPES
========================= */



@InputType()
export class UpdateOrderItemsInput {
  @Field(() => ID)
  orderId: string;

  @Field(() => [OrderItemInput])
  items: OrderItemInput[];
}

@InputType()
export class OrderItemInput {
  @Field(() => ID)
  productId: string;

  @Field()
  quantity: number;

  @Field(() => Number, { nullable: true })
  price?: number;
}

@ObjectType()
export class OrderItem {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  productId: string;
  @Field(() => Product,{nullable:true})
  product?: Product;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  total: number;

  @Field(() => String, { nullable: true })
  note: string | null;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: string;

  // Prisma => string | null
  @Field(() => ID, { nullable: true })
  tableId: string | null;

  @Field(() => ID)
  userId: string;

  @Field()
  status: string;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  tip: number;

  @Field(() => Float)
  total: number;

  // Prisma => string | null
  @Field(() => String, { nullable: true })
  clientEmail: string | null;

  // Prisma => string | null
  @Field(() => ID, { nullable: true })
  saleId: string | null;

  @Field(() => [OrderItem],{nullable:true})
  items?: OrderItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

/* =========================
   INPUT TYPES
========================= */

@InputType()
export class CreateOrderItemInput {
  @Field(() => ID)
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => String, { nullable: true })
  note?: string;
}

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  tableId: string;

  @Field(() => ID)
  userId: string;

  @Field(() => Float, { defaultValue: 0 })
  tip: number;

  @Field(() => Float, { defaultValue: 0 })
  discount: number;

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[];
}

@InputType()
export class UpdateOrderStatusInput {
  @Field(() => ID)
  id: string;

  @Field()
  newStatus: string;

  @Field(() => ID)
  userId: string;
}

@InputType()
export class DeleteOrderInput {
  @Field(() => ID)
  id: string;
}
