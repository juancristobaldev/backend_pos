import { Module } from '@nestjs/common';
import { TableResolver } from './table.resolver';
import { TableService } from './table.service';

@Module({
  providers: [TableResolver, TableService]
})
export class TableModule {}
