import config from '../config/config';
import { OtelLog, OtelSpan, OtelMetric } from '@iot-sphere/entity-lib';

type StreamType = 'span' | 'log' | 'metric';

class TelemetryService {
  private readonly streamUrls: Record<StreamType, string> = {
    span: config.telemetry.spanStreamUrl,
    log: config.telemetry.logStreamUrl,
    metric: config.telemetry.metricStreamUrl,
  };

  private eventSources: Record<StreamType, EventSource | null> = {
    span: null,
    log: null,
    metric: null,
  };

  private reconnectAttempts: Record<StreamType, number> = {
    span: 0,
    log: 0,
    metric: 0,
  };

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

  formatLogBody(body: unknown): string {
    if (typeof body === 'string') return body;
    if (typeof body === 'object') return JSON.stringify(body);
    if (typeof body === 'number' || typeof body === 'boolean') return String(body);
    return '';
  }

  formatLogBodySafe(log: any): string {
    const body = log.body ?? log._body;
    return this.formatLogBody(body);
  }

  async getSpans(): Promise<OtelSpan[]> {
    try {
      // const response = await fetchClient.get<OtelSpan[]>(`${this.baseUrl}/telemetry/spans`);
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch spans:', error);
      return [];
    }
  }

  async getLogs(): Promise<OtelLog[]> {
    try {
      // const response = await fetchClient.get<OtelLog[]>(`${this.baseUrl}/telemetry/logs`);
      return [];
    } catch (error) {
      console.error('❌ Failed to fetch logs:', error);
      return [];
    }
  }

  subscribeToSpans(onMessage: (span: OtelSpan) => void, onError?: (error: Event) => void): () => void {
    return this.subscribeToStream<OtelSpan>('span', onMessage, onError);
  }

  subscribeToLogs(onMessage: (log: OtelLog) => void, onError?: (error: Event) => void): () => void {
    return this.subscribeToStream<OtelLog>('log', onMessage, onError);
  }

  subscribeToMetrics(onMessage: (metric: OtelMetric) => void, onError?: (error: Event) => void): () => void {
    return this.subscribeToStream<OtelMetric>('metric', onMessage, onError);
  }

  private subscribeToStream<T>(type: StreamType, onMessage: (data: T) => void, onError?: (error: Event) => void): () => void {
    this.closeStream(type);

    const url = this.streamUrls[type];
    const source = new EventSource(url, { withCredentials: false });
    this.eventSources[type] = source;

    source.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed.data ?? parsed;
        if(type === 'metric')
        {

          const metric = data as OtelMetric;
          console.log("Recieved: ", metric)
        }
        
        onMessage(data as T);
        this.reconnectAttempts[type] = 0;
      } catch (err) {
        console.error(`❌ Failed to parse ${type} data:`, err, event.data);
      }
    };

    source.onerror = (err) => {
      console.error(`⚠️ ${type.toUpperCase()} SSE error:`, err, 'ReadyState:', source.readyState);
      if (onError) onError(err);
      if (source.readyState === EventSource.CLOSED) {
        this.reconnectStream(type, onMessage, onError);
      }
    };

    source.onopen = () => {
      console.log(`✅ ${type.toUpperCase()} SSE connection established`);
      this.reconnectAttempts[type] = 0;
    };

    return () => this.closeStream(type);
  }

  private reconnectStream<T>(type: StreamType, onMessage: (data: T) => void, onError?: (error: Event) => void): void {
    if (this.reconnectAttempts[type] >= this.maxReconnectAttempts) {
      console.error(`❌ Max ${type} reconnection attempts reached`);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts[type]), 10000);
    this.reconnectAttempts[type]++;

    setTimeout(() => {
      if (!this.eventSources[type] || this.eventSources[type]!.readyState === EventSource.CLOSED) {
        this.subscribeToStream(type, onMessage, onError);
      }
    }, delay);
  }

  private closeStream(type: StreamType): void {
    if (this.eventSources[type]) {
      this.eventSources[type]!.close();
      this.eventSources[type] = null;
    }
  }
}

export const telemetryService = new TelemetryService();
