import { Controller, Post, Body, Inject, Get, Query, Sse } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { DaprClient } from '@dapr/dapr';
import { Trace, Log } from './entities';
import { DAPR_CLIENT } from '../dapr/dapr.module';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

interface TelemetryMessage {
  type: 'trace' | 'log';
  data: any;
}

interface DaprPubSubMessage {
  data: TelemetryMessage;
  topic: string;
  pubsubname: string;
}

@Controller('telemetry')
export class TelemetryController {
  private readonly traceSubject = new Subject<MessageEvent>();
  private readonly logSubject = new Subject<MessageEvent>();
  private readonly appId: string;

  constructor(
    private readonly telemetryService: TelemetryService,
    @Inject(DAPR_CLIENT)
    private readonly daprClient: DaprClient,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('dapr.appId') || 'gateway-api';
  }

  // @Post()
  // async handleDaprMessage(@Body() message: DaprPubSubMessage) {
  //   console.log('Received Dapr message:', message);
  //   const { data } = message;
  //   const event = new MessageEvent('message', {
  //     data: JSON.stringify(data),
  //   });

  //   if (data.type === 'trace') {
  //     this.traceSubject.next(event);
  //   } else if (data.type === 'log') {
  //     this.logSubject.next(event);
  //   }

  //   return { success: true };
  // }

  @Post('traces')
  async handleTraces(@Body() data: any) {
    // Store in database and publish to Dapr
    //await this.telemetryService.handleTraces(data);
    await this.daprClient.pubsub.publish('pubsub', 'telemetry', {
      type: 'trace',
      data: {
        name: "span.name",
        // traceId: span.spanContext().traceId,
        // name: span.name,
        // timestamp: new Date(span.startTime[0] * 1000 + span.startTime[1] / 1000000),
        // duration: span.duration[0] * 1000 + span.duration[1] / 1000000,
        // status: span.status.code === 0 ? 'success' : 'error',
        // spans: [span],
        // metadata: {
        //   attributes: span.attributes,
        //   events: span.events,
        //   links: span.links,
        // },
      },
    });
    return { success: true };
  }

  @Post('logs')
  async handleLogs(@Body() data: any) {
    // Store in database and publish to Dapr
    //await this.telemetryService.handleLogs(data);
    return { success: true };
  }

  @Get('traces')
  async getTraces() {
    //return this.telemetryService.getTraces();
    return { success: true };
  }

  @Get('logs')
  async getLogs() {
    //return this.telemetryService.getLogs();
    return { success: true };
  }

  // @Sse('traces/stream')
  // streamTraces(): Observable<MessageEvent> {
  //   return this.traceSubject.asObservable();
  // }

  // @Sse('logs/stream')
  // streamLogs(): Observable<MessageEvent> {
  //   return this.logSubject.asObservable();
  // }
} 