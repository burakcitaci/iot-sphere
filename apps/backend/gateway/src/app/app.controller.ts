import { Controller, Get, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MetricService, Trace } from '@gateway/otel-library';
import type { Counter, Meter } from '@opentelemetry/api';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
 
  constructor( private readonly appService: AppService,
    private metricsService: MetricService,
  ) {
    
  }

  @Get('span/:spanId')
  @ApiOperation({ summary: 'Get span by ID' })
  @ApiParam({ 
    name: 'spanId', 
    description: 'The span identifier',
    type: 'string',
    example: 'abc123'
  })
  @ApiResponse({
    status: 200,
    description: 'Span found successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Span not found'
  })
  @Trace({
    spanName: 'device-by-span-id',
    captureArgs: true,
  })
  getSpanById(@Param('spanId') spanId: string) {
    console.log('Testing spanId parameter:', spanId);
    const result = this.appService.getSpanById(spanId);
    this.metricsService.incrementHttpRequests("GET", "hello", 204);
    return result;
  }
}
