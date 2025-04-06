import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Trace } from '@gateway/otel-library';

@Controller()
export class AppController {
  constructor( private readonly appService: AppService) {}

  @Get('span/:spanId')
  @Trace({
    spanName : 'device-by-span-id',
    captureArgs: true,
  })
  getSpanById(@Param('spanId') spanId: string) {
    const result = this.appService.getSpanById(spanId);
   
    return result;
  }
}
