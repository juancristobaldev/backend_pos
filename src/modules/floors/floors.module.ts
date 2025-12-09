import { Module } from '@nestjs/common';
import { FloorsResolver } from './floors.resolver';
import { FloorService } from './floors.service';

@Module({
  providers: [FloorService, FloorsResolver],
})
export class FloorsModule {}
