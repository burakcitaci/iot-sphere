import { Injectable, Inject } from '@nestjs/common';
import { Counter, UpDownCounter, Meter, Histogram, MeterProvider } from '@opentelemetry/api';


@Injectable()
export class MetricService {
  private httpRequestsCounter!: Counter;
  private httpRequestDuration!: Histogram;
  private activeConnections!: UpDownCounter;
  private customMetrics: Map<string, Counter | Histogram | UpDownCounter> = new Map();

  private meter: Meter;

  constructor( private meterProvider: MeterProvider) {
    this.meter = this.meterProvider.getMeter('metric-service');
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // HTTP Metrics
    this.httpRequestsCounter = this.meter.createCounter('http_requests_total', {
      description: 'Total number of HTTP requests',
    });

    this.httpRequestDuration = this.meter.createHistogram('http_request_duration_ms', {
      description: 'Duration of HTTP requests in milliseconds',
      unit: 'ms',
    });

    this.activeConnections = this.meter.createUpDownCounter('active_connections', {
      description: 'Number of active connections',
    });
  }

  // HTTP Request Metrics
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsCounter.add(1, {
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  recordHttpRequestDuration(duration: number, method: string, route: string, statusCode: number) {
    this.httpRequestDuration.record(duration, {
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  // Connection Metrics
  incrementActiveConnections() {
    this.activeConnections.add(1);
  }

  decrementActiveConnections() {
    this.activeConnections.add(-1);
  }

  // Custom Business Metrics
  createCustomCounter(name: string, description: string) {
    const counter = this.meter.createCounter(name, { description });
    this.customMetrics.set(name, counter);
    return counter;
  }

  createCustomHistogram(name: string, description: string, unit?: string) {
    const histogram = this.meter.createHistogram(name, { description, unit });
    this.customMetrics.set(name, histogram);
    return histogram;
  }

  incrementCustomMetric(name: string, value = 1, attributes?: Record<string, string>) {
    const metric = this.customMetrics.get(name);
    if (metric && 'add' in metric) {
      (metric as Counter | UpDownCounter).add(value, attributes);
    }
  }

  recordCustomMetric(name: string, value: number, attributes?: Record<string, string>) {
    const metric = this.customMetrics.get(name);
    if (metric && 'record' in metric) {
      (metric as Histogram).record(value, attributes);
    }
  }
}