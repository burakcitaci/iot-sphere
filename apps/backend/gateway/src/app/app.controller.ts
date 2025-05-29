import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MetricService, Trace } from '@gateway/otel-library';
import type { Counter, Meter } from '@opentelemetry/api';

@Controller()
export class AppController {
 
  constructor( private readonly appService: AppService,
    private metricsService: MetricService,
  ) {
    
  }

  @Get('span/:spanId')
  @Trace({
    spanName : 'device-by-span-id',
    captureArgs: true,
  })
  getSpanById(@Param('spanId') spanId: string) {
    const result = this.appService.getSpanById(spanId);
    this.metricsService.incrementHttpRequests("GET", "hello", 204);

    return result;
  }
}
