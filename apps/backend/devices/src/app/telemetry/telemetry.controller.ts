import {
  Controller,
  Post,
  Body,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import axios from 'axios';
import { DaprClient } from '@dapr/dapr';

interface SpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: string;
  startTime: string;
  endTime: string;
  duration: number;
  attributes: Record<string, unknown>;
  status: {
    code: string;
    message?: string;
  };
  events: Array<{
    name?: string;
    timestamp?: string;
    attributes?: Record<string, unknown>;
  }>;
  links: Array<{
    spanId?: string;
    traceId?: string;
    attributes?: Record<string, unknown>;
  }>;
}

interface CloudEvent<T = unknown> {
  specversion: string;
  type: string;
  source: string;
  id: string;
  time?: string;
  datacontenttype: string;
  data: T;
  pubsubname?: string;
  topic?: string;
  traceid?: string;
}

@Controller('telemetry')
export class TelemetryController {
  private readonly logger = new Logger(TelemetryController.name);
  private readonly daprClient: DaprClient;
  constructor(private readonly telemetryService: TelemetryService) {
    this.daprClient = new DaprClient({
      daprHost: 'localhost',
      daprPort: '3500',
    }); // Dapr sidecar address
  }

  @Post('spans')
  async publishSpan(@Body() body: any) {
    console.log('📦 Raw span received:', JSON.stringify(body, null, 2));
    //await this.telemetryService.publishSpan(data);
    const { topic, message } = body;
    await this.daprClient.pubsub.publish('pubsub', topic, message);

    // try {
    //   let spanData: SpanData;

    //   // Extract span data from CloudEvent if necessary
    //   if (this.isCloudEvent(data)) {
    //     if (!data.data) {
    //       throw new HttpException('CloudEvent data is missing', HttpStatus.BAD_REQUEST);
    //     }
    //     spanData = data.data;
    //   } else {
    //     spanData = data;
    //   }

    //   // Log the received data for debugging
    //   this.logger.debug('Received span data Device Api:', spanData);

    //   // Validate required fields
    //   if (!this.isValidSpanData(spanData)) {
    //     this.logger.error('Invalid span data format:', spanData);
    //     throw new HttpException('Invalid span data format', HttpStatus.BAD_REQUEST);
    //   }

    //   this.logger.debug(`Publishing span: ${spanData.name} (${spanData.spanId})`);
    //   await this.telemetryService.publishSpan(spanData);

    //   return { success: true, message: 'Span published successfully' };
    // } catch (error) {
    //   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    //   this.logger.error(`Error publishing span: ${errorMessage}`);

    //   if (error instanceof HttpException) {
    //     throw error;
    //   }

    //   throw new HttpException(
    //     'Error publishing span',
    //     HttpStatus.INTERNAL_SERVER_ERROR
    //   );
    // }
  }

  private isCloudEvent(data: unknown): data is CloudEvent<SpanData> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'specversion' in data &&
      'type' in data &&
      'source' in data &&
      'id' in data &&
      'data' in data
    );
  }

  private isValidSpanData(data: unknown): data is SpanData {
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const span = data as SpanData;

    // Check required string fields
    const requiredStringFields: (keyof SpanData)[] = [
      'traceId',
      'spanId',
      'name',
      'kind',
      'startTime',
      'endTime',
    ];
    for (const field of requiredStringFields) {
      if (typeof span[field] !== 'string') {
        this.logger.debug(`Missing or invalid ${field}`);
        return false;
      }
    }

    // Check duration is a number
    if (typeof span.duration !== 'number') {
      this.logger.debug('Missing or invalid duration');
      return false;
    }

    // Check attributes is an object
    if (typeof span.attributes !== 'object' || span.attributes === null) {
      this.logger.debug('Missing or invalid attributes');
      return false;
    }

    // Check status
    if (
      !span.status ||
      typeof span.status !== 'object' ||
      typeof span.status.code !== 'string'
    ) {
      this.logger.debug('Missing or invalid status');
      return false;
    }

    // Check arrays (they can be empty)
    if (!Array.isArray(span.events) || !Array.isArray(span.links)) {
      this.logger.debug('Events or links is not an array');
      return false;
    }

    return true;
  }
}
