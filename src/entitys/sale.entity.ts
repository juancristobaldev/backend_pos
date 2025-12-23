import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Business } from './business.entity';
import { User } from './user.entity';
import { Order } from './order.entity';


@ObjectType()
export class PaymentIntent {
  @Field(() => ID)
  id: string;

  @Field()
  orderId: string;

  @Field()
  businessId: string;

  @Field(() => Int)
  amount: number;

  /**
   * pending | paid | failed | cancelled
   */
  @Field()
  status: string;

  /**
   * Token entregado por Transbank
   */
  @Field({ nullable: true })
  token?: string;

  @Field()
  buyOrder: string;

  @Field()
  sessionId: string;

  @Field()
  returnUrl: string;

  /* Relaciones */

  @Field(() => Order)
  order: Order;

  @Field(() => Business)
  business: Business;

  /* Fechas */

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class Sale {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  paymentMethod: string;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  tax: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  total: number;

  @Field(() => String, { nullable: true })
  clientEmail?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  paidAt?: Date;

  // Relaciones
  @Field(() => Business)
  business: Business;

  @Field(() => User)
  user: User;

  @Field(() => Order, { nullable: true })
  order?: Order
  ;

  @Field(() => [SaleItem])
  items: SaleItem[];
}


@ObjectType()
export class SaleItem {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  productName: string;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  total: number;

  // Relación
  @Field(() => Sale)
  sale: Sale;
}
