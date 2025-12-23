import { Module } from '@nestjs/common';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';



@Module({
  providers: [PaymentResolver, PaymentService]
})
export class PaymentModule {}
