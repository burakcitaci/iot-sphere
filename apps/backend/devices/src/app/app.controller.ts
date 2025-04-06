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

  @Post('publish')
  async publish(@Body() body: { topic: string; message: any }) {
    try {
      const { topic, message } = body;

      const enhancedMessage = {
        data: message,
        metadata: {
          publishedAt: new Date().toISOString(),
          publisher: 'devices-api',
          messageId: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        },
      };

      console.log(
        `[${new Date().toISOString()}] Publishing to topic "${topic}" on pubsub "pubsub":`,
        JSON.stringify(enhancedMessage)
      );

      // Ensure the pubsub name matches the subscriber's configuration
      await this.daprClient.pubsub.publish('pubsub', topic, enhancedMessage);

      console.log(
        `[${new Date().toISOString()}] Successfully published to "${topic}"`
      );

      return {
        status: 'Message published',
        messageId: enhancedMessage.metadata.messageId,
        timestamp: enhancedMessage.metadata.publishedAt,
      };
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Failed to publish message:`,
        error
      );

      return {
        status: 'error',
        message: `Failed to publish: ${error || error}`,
        code: error || 'UNKNOWN_ERROR',
      };
    }
  }
}
