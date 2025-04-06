import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';

export interface SpanData {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: string;
  startTime: string;
  endTime: string;
  duration: number;
  attributes: Record<string, unknown>;
  status: { code: number; message?: string };
  events: Array<{ name: string; attributes: Record<string, unknown>; timestamp: string }>;
  links: Array<{ traceId: string; spanId: string; attributes: Record<string, unknown> }>;
}
export class TraceExporter implements SpanExporter {
  //   private readonly daprClient: DaprClient;
  // constructor(daprPort = '3500') {
  //   this.daprClient = new DaprClient(); // Dapr sidecar address
    
  // }
  private daprClient: DaprClient;
  
  constructor(daprClient: DaprClient) {
    this.daprClient = daprClient;
  }
  async export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void) {
    try {
      for (const span of spans) {

        console.log('recieved span', span)
        const safeSpan = {
          name: span.name,
          startTime: span.startTime,
          endTime: span.endTime,
          status: span.status,
          attributes: span.attributes,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
        };
  
        console.log('Exporting span:', safeSpan);
        span.attributes.a
        await this.daprClient.pubsub.publish('pubsub2', 'my-span', this.safeStringify(span));
        console.log('✅ Span published successfully');
      }
  
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('❌ Failed to publish span:', error);
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }
  safeStringify(obj : any) {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return; // Remove circular references
        }
        seen.add(value);
      }
      return value;
    });
  }
  shutdown(): Promise<void> {
    // Clean up resources if necessary
    return Promise.resolve();
  }
}
