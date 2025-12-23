import { Module } from '@nestjs/common';
import { KpiResolver } from './kpi.resolver';

@Module({
  providers: [KpiResolver]
})
export class KpiModule {}
