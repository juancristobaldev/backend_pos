import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [ProductModule],
  providers: [OrderResolver, OrderService],
})
export class OrderModule {}
