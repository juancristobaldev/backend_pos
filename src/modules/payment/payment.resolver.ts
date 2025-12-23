import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { PaymentService } from './payment.service';

import { CommitSubscriptionPaymentResponse, CreatePaymentResponse, PaymentStatus } from 'src/entitys/payment.entity';
import { PrismaService } from '../prisma/prisma.service';
import { webpayTx } from 'src/config';


@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService ,
    private readonly prisma:PrismaService
  ) {}

  /* =====================================================
     1️⃣ CREAR PAGO DE SUSCRIPCIÓN
     (se llama desde el frontend antes de redirigir)
  ===================================================== */
  @Mutation(() => CreatePaymentResponse)
  async createSubscriptionPayment(
    @Args('subscriptionId') subscriptionId: string,
    @Args('amount',{type:() => Int}) amount: number,
    @Args('clientEmail') clientEmail: string,
    @Args('returnUrl') returnUrl: string,
  ): Promise<CreatePaymentResponse> {
    console.log(returnUrl)
    return this.paymentService.createSubscriptionPaymentIntent(
      subscriptionId,
      amount,
      clientEmail,
      returnUrl,
    );
  }

  /* =====================================================
     2️⃣ CONFIRMAR PAGO (CALLBACK TRANSBANK)
     token viene desde ?token_ws
  ===================================================== */
  @Mutation(() => CommitSubscriptionPaymentResponse)
  async commitSubscriptionPayment(
    @Args('token') token: string,
  ): Promise<CommitSubscriptionPaymentResponse> {
    return this.paymentService.commitSubscriptionPayment(token);
  }
  
  /* =====================================================
     3️⃣ CONSULTAR ESTADO DE PAGO
  ===================================================== */
  @Query(() => PaymentStatus)
  async paymentStatus(
    @Args('paymentIntentId') paymentIntentId: string,
  ): Promise<PaymentStatus> {
    return this.paymentService.getPaymentStatus(paymentIntentId);
  }
}