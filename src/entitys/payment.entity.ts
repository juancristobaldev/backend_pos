import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PaymentIntent {
  @Field(() => ID)
  id: string;

  /* =========================
     RELACIÓN OPCIONAL
  ========================= */
  @Field({ nullable: true })
  orderId?: string;

  /* =========================
     MONTO / ESTADO
  ========================= */
  @Field(() => Int)
  amount: number;

  @Field()
  status: string; // PENDING | PAID | FAILED | CANCELLED

  /* =========================
     TRANSBANK
  ========================= */
  @Field({ nullable: true })
  token?: string;

  @Field()
  buyOrder: string;

  @Field()
  sessionId: string;

  @Field()
  returnUrl: string;

  /* =========================
     IDENTIFICACIÓN DEL PAGO
  ========================= */
  @Field()
  type: string; // SUBSCRIPTION

  @Field()
  referenceId: string; // subscriptionId

  @Field()
  clientEmail: string; // 👈 email del cliente

  /* =========================
     TIMESTAMPS
  ========================= */
  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}


@ObjectType()
export class CommitSubscriptionPaymentResponse {
  @Field()
  clientEmail: string;

  @Field()
  saleToken: string;
}

@ObjectType()
export class CreatePaymentResponse {
  @Field(() => ID)
  id: string;

  @Field()
  token: string;

  @Field()
  webpayUrl: string;
}



@ObjectType()
export class PaymentStatus {
  @Field()
  status: string;

  @Field(() => Int)
  amount: number;

  @Field()
  clientEmail: string;

  @Field()
  type: string;

  @Field()
  referenceId: string;

  @Field()
  createdAt: Date;
}
