import { Injectable, Logger } from '@nestjs/common';
import { DaprClient, CommunicationProtocolEnum } from '@dapr/dapr';

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

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly daprClient: DaprClient;
  private readonly PUBSUB_NAME = 'telemetry-pubsub';
  private readonly TOPIC_NAME = 'spans';

  constructor() {
    this.daprClient = new DaprClient();
  }

  async publishSpan(spanData: any): Promise<void> {
    try {
      // Log the raw span data for debugging
      this.logger.debug('Raw span data:', spanData);

      // Ensure we have valid span data before proceeding
      // if (!spanData || !spanData.name || !spanData.spanId || !spanData.traceId) {
      //   this.logger.error('Invalid span data received');
      //   throw new Error('Invalid span data');
      // }

      // // Skip publishing if this is a publish operation span
      // const httpUrl = spanData.attributes['http.url']?.toString() || '';
      // if (
      //   spanData.name.includes('publish') ||
      //   spanData.name.includes('dapr.io') ||
      //   httpUrl.includes('/v1.0/publish')
      // ) {
      //   this.logger.debug(`Skipping publish operation span: ${spanData.name}`);
      //   return;
      // }

      // // Ensure all required fields are present and have the correct types
      // const normalizedSpanData: SpanData = {
      //   traceId: spanData.traceId,
      //   spanId: spanData.spanId,
      //   parentSpanId: spanData.parentSpanId || '',
      //   name: spanData.name,
      //   kind: spanData.kind,
      //   startTime: spanData.startTime,
      //   endTime: spanData.endTime,
      //   duration: spanData.duration,
      //   attributes: spanData.attributes || {},
      //   status: {
      //     code: spanData.status.code,
      //     message: spanData.status.message || ''
      //   },
      //   events: (spanData.events || []).map(event => ({
      //     name: event.name || '',
      //     timestamp: event.timestamp || new Date().toISOString(),
      //     attributes: event.attributes || {}
      //   })),
      //   links: (spanData.links || []).map(link => ({
      //     spanId: link.spanId || '',
      //     traceId: link.traceId || '',
      //     attributes: link.attributes || {}
      //   }))
      // };

      // // Create the CloudEvent envelope
      // const cloudEvent: CloudEvent<SpanData> = {
      //   specversion: '1.0',
      //   type: 'com.dapr.telemetry.span',
      //   source: '/telemetry/spans',
      //   id: spanData.spanId,
      //   time: new Date().toISOString(),
      //   datacontenttype: 'application/json',
      //   data: normalizedSpanData,
      //   traceid: spanData.traceId
      // };
      const message = spanData;
      this.logger.debug(`Devices Api Publishing span to ${this.PUBSUB_NAME}/${this.TOPIC_NAME}: ${message.message}`);
      //this.logger.debug('CloudEvent payload:', JSON.stringify(cloudEvent, null, 2));
      
      // Publish with metadata to disable tracing
     // In your publisher service
await this.daprClient.pubsub.publish(
  this.PUBSUB_NAME, 
  this.TOPIC_NAME, 
  spanData
);
      
      this.logger.debug('Span published successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error publishing span: ${errorMessage}`);
      throw error;
    }
  }
} 