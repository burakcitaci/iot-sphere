import { Injectable, Inject } from '@nestjs/common';
import { CentralLoggerService, Trace } from '@gateway/otel-library';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: CentralLoggerService
  ) {}

  @Trace({
    spanName: 'get-data',
    captureArgs: true
  })
  getData(): { message: string } {
    this.logger.log('Getting data from service');
    return { message: 'Hello API' };
  }

  getSpanById(spanId: string) {
    this.logger.debug('Getting span by ID', spanId);
    return "Hello World"
  }
}
