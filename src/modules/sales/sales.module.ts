import { Module } from '@nestjs/common';

import { SalesResolver } from './sales.resolver';
import { SaleService } from './sales.service';

@Module({
  providers: [SaleService, SalesResolver]
})
export class SalesModule {}
