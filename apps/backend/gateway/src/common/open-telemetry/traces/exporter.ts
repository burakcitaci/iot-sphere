import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-node';
import { Logger } from '@nestjs/common';
import { DaprClient } from '@dapr/dapr';

export class GatewaySpanExporter implements SpanExporter {
  private readonly logger = new Logger(GatewaySpanExporter.name);
  private _isShutdown = false;
  private _pendingExports: Promise<void>[] = [];
  private readonly daprClient: DaprClient;

  constructor() {
    this.daprClient = new DaprClient({
      daprHost: process.env.DAPR_HOST || 'localhost',
      daprPort: process.env.DAPR_PORT || '3501',
    });
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._isShutdown) {
      this.logger.warn('Attempted to export spans after exporter shutdown');
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    const exportPromise = Promise.all(
      
      spans.map(async (span) => {
        console.log('Exporting span:', span);
        try {
          await this.daprClient.pubsub.publish('pubsub', 'telemetry', {
            type: 'trace',
            data: {
              name: span.name,
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
        } catch (error) {
          this.logger.error('Failed to publish span to Dapr:', error);
          throw error;
        }
      })
    )
      .then(() => {
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch((error) => {
        this.logger.error('Failed to export spans:', error);
        resultCallback({ code: ExportResultCode.FAILED, error });
      })
      .finally(() => {
        this._pendingExports = this._pendingExports.filter(
          (p) => p !== exportPromise
        );
      });

    this._pendingExports.push(exportPromise);
  }

  async shutdown(): Promise<void> {
    if (this._isShutdown) {
      return;
    }

    this.logger.log('Shutting down GatewaySpanExporter...');
    this._isShutdown = true;

    try {
      await Promise.allSettled(this._pendingExports);
      this.logger.log('GatewaySpanExporter shutdown complete');
    } catch (error) {
      this.logger.error('Error during GatewaySpanExporter shutdown:', error);
    }
  }

  async forceFlush(): Promise<void> {
    this.logger.log('Force flushing GatewaySpanExporter...');

    if (this._isShutdown) {
      return Promise.reject(new Error('Exporter is shutdown'));
    }

    try {
      await Promise.allSettled(this._pendingExports);
      this.logger.log('GatewaySpanExporter force flush complete');
    } catch (error) {
      this.logger.error('Error during GatewaySpanExporter force flush:', error);
      return Promise.reject(new Error(String(error)));
    }
  }
}
