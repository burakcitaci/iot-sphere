import {SpanContext} from '@opentelemetry/api'
export interface OtelSpan {
  name: string;
  startTime: [number, number]; // hrTime format: [seconds, nanoseconds]
  endTime: [number, number];
  status: {
    code: number;
    message?: string;
  };
  attributes: Record<string, unknown>;
  spanContext: SpanContext;
}
