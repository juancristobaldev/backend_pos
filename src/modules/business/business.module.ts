import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessResolver } from './business.resolver';

@Module({
  providers: [BusinessService, BusinessResolver]
})
export class BusinessModule {}
