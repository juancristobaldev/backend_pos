import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { webpayTx } from 'src/config';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  /* =====================================================
     1️⃣ CREAR INTENTO DE PAGO (SUSCRIPCIÓN)
  ===================================================== */
  async createSubscriptionPaymentIntent(
    subscriptionType: string, // ej: MONTHLY | YEARLY
    amount: number,
    clientEmail: string,
    returnUrl: string,
  ) {
    /**
     * 1️⃣ Identificadores Transbank
     */
    const buyOrder = `${subscriptionType}-${Date.now()}`;
    const sessionId = `SES-${Date.now()}`;
  
    /**
     * 2️⃣ Crear transacción en Webpay
     */
    const response = await webpayTx.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl,
    );
  
    /**
     * 3️⃣ Guardar SOLO el intento de pago
     */
    const intent = await this.prisma.paymentIntent.create({
      data: {
        amount,
        status: 'PENDING',
  
        token: response.token,
        buyOrder,
        sessionId,
        returnUrl,
  
        type: 'SUBSCRIPTION',
        referenceId: subscriptionType, // 👈 identifica el plan
        clientEmail,                   // 👈 dueño del intento
      },
    });
  
    /**
     * 4️⃣ Respuesta al frontend
     */
    return {
      id: intent.id,
      token: response.token,
      webpayUrl: response.url,
    };
  }
  

  /* =====================================================
     2️⃣ CONFIRMAR PAGO (COMMIT TRANSBANK)
  ===================================================== */
  async commitSubscriptionPayment(token: string) {
    const intent = await this.prisma.paymentIntent.findFirst({
      where: { token },
    });
  
    if (!intent) {
      throw new Error('PaymentIntent no encontrado');
    }
  
    const commitResponse = await webpayTx.commit(token);
  
    if (
      commitResponse.status !== 'AUTHORIZED' ||
      commitResponse.response_code !== 0
    ) {
      await this.prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: 'FAILED' },
      });
  
      throw new Error('Pago rechazado');
    }
  
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: 'PAID' },
      });
  
      // 👉 Aquí normalmente crearías la Subscription + SubscriptionSale
    });
  
    return {
      clientEmail: intent.clientEmail,
      saleToken: intent.id, // 👈 token de venta (seguro)
    };
  }
  /* =====================================================
     3️⃣ UTILIDAD: CONSULTAR ESTADO DE PAGO
  ===================================================== */
  async getPaymentStatus(paymentIntentId: string) {
    const intent = await this.prisma.paymentIntent.findUnique({
      where: { id: paymentIntentId },
    });

    if (!intent) {
      throw new Error('PaymentIntent no encontrado');
    }

    return {
      status: intent.status,
      amount: intent.amount,
      clientEmail: intent.clientEmail,
      type: intent.type,
      referenceId: intent.referenceId,
      createdAt: intent.createdAt,
    };
  }
}
