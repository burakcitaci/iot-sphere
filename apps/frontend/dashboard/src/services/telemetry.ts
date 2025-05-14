
import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { log } from 'console';
import { ReadableSpan } from '@opentelemetry/sdk-trace-node';
import { te } from 'date-fns/locale';
import config from 'src/config/config';
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

export interface Trace {
  id: string;
  traceId: string;
  name: string;
  timestamp: Date;
  duration: number;
  status: string;
  spans: SpanData[];
  metadata: Record<string, any>;
  createdAt: Date;
}
export interface CustomLogRecord {
  timestamp: string; // epoch millis
  severity: string;
  message: string;
  resource: Record<string, any>;
  attributes: Record<string, any>;
  spanId?: string;
  traceId?: string;
  scope?: string;
  
}
export interface SafeLog {
  body: any;
  severityText: string;
  hrTime: [number, number]; // hrTime is a tuple like [seconds, nanoseconds]
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
  host: string;
}

class TelemetryService {
  private readonly baseUrl = config.api.baseUrl;
  private spanEventSource: EventSource | null = null;
  private logEventSource: EventSource | null = null;
  private spanReconnectAttempts = 0;
  private logReconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;

  formatHrTime(hrTime: [number, number]): string {
    const [seconds, nanos] = hrTime ?? [0, 0];
    const millis = seconds * 1000 + Math.floor(nanos / 1_000_000);
    const date = new Date(millis);
  
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Berlin',
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  
    
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '';
    return `${get('month')} ${get('day')}, ${get('year')} at ${get('hour')}:${get('minute')}:${get('second')} ${get('dayPeriod')?.toLowerCase()}`;
  
  }
  mapReadableLogRecordToCustom(log: ReadableLogRecord): CustomLogRecord {
    const [seconds, nanos] = log.hrTime;
    const timestamp = new Date(seconds * 1000 + nanos / 1_000_000).toISOString();
  
    return {
      timestamp: this.formatHrTime(log.hrTime),
      severity: log.severityText ?? 'UNKNOWN',
      message: this.formatLogBodySafe(log),
      resource: log.resource?.attributes ?? {},
      scope: log.instrumentationScope?.name ?? 'unknown',
      attributes: log.attributes ?? {},
      traceId: log.spanContext?.traceId,
      spanId: log.spanContext?.spanId,
    };
  }
  
  formatLogBody(body: unknown): string {
    if (typeof body === 'string') return body;
    if (typeof body === 'object') return JSON.stringify(body);
    if (typeof body === 'number' || typeof body === 'boolean') return String(body);
    return '';
  }

  
 formatLogBodySafe(log: any): string {
    const body = log.body ?? log._body;
    
    if (typeof body === 'string') return body;
    if (typeof body === 'object') return JSON.stringify(body);
    if (typeof body === 'number' || typeof body === 'boolean') return String(body);
    return '';
  }
  async getSpans(): Promise<ReadableSpan[]> {
    try {
      //const response = await fetchClient.get<SpanData[]>(`${this.baseUrl}/telemetry/spans`);
      //return response.data || [];
      return [];
    } catch (error) {
      console.error('Failed to fetch spans:', error);
      return [];
    }
  }

  async getLogs(): Promise<SafeLog[]> {
    try {
      //const response = await fetchClient.get<Log[]>(`${this.baseUrl}/telemetry/logs`);
      //return response.data || [];
      return [];
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return [];
    }
  }

  subscribeToSpans(onMessage: (span: ReadableSpan) => void, onError?: (error: Event) => void): () => void {
    this.closeSpanEventSource();

    const url = `http://localhost:3001/api/spans/stream`;
    this.spanEventSource = new EventSource(url, { withCredentials: false });

    this.spanEventSource.onmessage = (event) => {
      try {
        const parsedEvent = JSON.parse(event.data);
        const parsedSpan = JSON.parse(event.data) as ReadableSpan;
        console.log("PARSED SPAN", parsedSpan)
        onMessage(parsedSpan);
        this.spanReconnectAttempts = 0;
      } catch (error) {
        console.error('Error parsing span data:', error, event.data);
      }
    };

    this.spanEventSource.onerror = (error) => {
      console.error('Span EventSource error:', error, 'ReadyState:', this.spanEventSource?.readyState);
      if (onError) onError(error);
      if (this.spanEventSource?.readyState === EventSource.CLOSED) {
        this.reconnectSpanStream(onMessage, onError);
      }
    };

    this.spanEventSource.onopen = () => {
      console.log('Span SSE connection established');
      this.spanReconnectAttempts = 0;
    };

    return () => {
      this.closeSpanEventSource();
    };
  }

  subscribeToLogs(onMessage: (log: SafeLog) => void, onError?: (error: Event) => void): () => void {
    this.closeLogEventSource();

    const url = `http://localhost:3001/api/logs/stream`;
    this.logEventSource = new EventSource(url, { withCredentials: false });

    this.logEventSource.onmessage = (event) => {
      try {
        const parsedEvent = JSON.parse(event.data);
        console.log(parsedEvent)
        const spanData = parsedEvent.data ? parsedEvent.data : parsedEvent;
        const temp = spanData as SafeLog;
        console.log(temp)
        const logData = spanData as SafeLog;
        console.log(logData.body)
        onMessage(logData)
        //onMessage(this.mapReadableLogRecordToCustom(logData));
        this.logReconnectAttempts = 0;
      } catch (error) {
        console.error('Error parsing log data:', error, event.data);
      }
    };

    this.logEventSource.onerror = (error) => {
      console.error('Log EventSource error:', error, 'ReadyState:', this.logEventSource?.readyState);
      if (onError) onError(error);
      if (this.logEventSource?.readyState === EventSource.CLOSED) {
        this.reconnectLogStream(onMessage, onError);
      }
    };

    this.logEventSource.onopen = () => {
      console.log('Log SSE connection established');
      this.logReconnectAttempts = 0;
    };

    return () => {
      this.closeLogEventSource();
    };
  }

  private closeSpanEventSource(): void {
    if (this.spanEventSource) {
      this.spanEventSource.close();
      this.spanEventSource = null;
    }
  }

  private closeLogEventSource(): void {
    if (this.logEventSource) {
      this.logEventSource.close();
      this.logEventSource = null;
    }
  }

  private reconnectSpanStream(onMessage: (span: ReadableSpan) => void, onError?: (error: Event) => void): void {
    if (this.spanReconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max span reconnection attempts reached');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.spanReconnectAttempts), 10000);
    this.spanReconnectAttempts++;
    setTimeout(() => {
      if (!this.spanEventSource || this.spanEventSource.readyState === EventSource.CLOSED) {
        this.subscribeToSpans(onMessage, onError);
      }
    }, delay);
  }

  private reconnectLogStream(onMessage: (log: SafeLog) => void, onError?: (error: Event) => void): void {
    if (this.logReconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max log reconnection attempts reached');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, this.logReconnectAttempts), 10000);
    this.logReconnectAttempts++;
    setTimeout(() => {
      if (!this.logEventSource || this.logEventSource.readyState === EventSource.CLOSED) {
        this.subscribeToLogs(onMessage, onError);
      }
    }, delay);
  }
}

export const telemetryService = new TelemetryService(); 