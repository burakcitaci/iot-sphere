import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { DaprClient } from '@dapr/dapr';
import { CentralLoggerService } from '@gateway/otel-library';

@Controller()
export class AppController {
  private readonly daprClient: DaprClient;
  constructor(private readonly appService: AppService, private readonly logger: CentralLoggerService) {
    this.daprClient = new DaprClient({
      daprHost: 'localhost',
      daprPort: '3500',
    }); // Dapr sidecar address
    this.logger.setContext('AppController');
  }

  @Get()
  getData() {
    this.logger.log('Fetching data from AppService');
    return this.appService.getData();
  }
}
