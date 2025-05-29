import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { DaprService } from '@gateway/otel-library';

@Module({
  imports: [],
  controllers: [MetricsController],
  providers: [DaprService],
})
export class MetricsModule {} 