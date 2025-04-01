import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { Logger } from '@nestjs/common';
import { ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';

export class GatewayLogExporter implements LogRecordExporter {
  private readonly logger = new Logger(GatewayLogExporter.name);
  private _isShutdown = false;
  private _pendingExports: Promise<void>[] = [];
  private readonly daprClient: DaprClient;

  constructor() {
    console.log('GatewayLogExporter constructor');
    this.daprClient = new DaprClient({
      daprHost: process.env.DAPR_HOST || 'localhost',
      daprPort: process.env.DAPR_PORT || '3501',
    });
  }

  export(
    logs: ReadableLogRecord[],
    resultCallback: (result: { code: ExportResultCode }) => void
  ): void {
    if (this._isShutdown) {
      this.logger.warn('Attempted to export logs after exporter shutdown');
      resultCallback({ code: ExportResultCode.FAILED });
      return;
    }

    const exportPromise = Promise.allSettled(
      logs.map(async (log) => {
        try {
          console.log('log', log);  
          await this.daprClient.pubsub.publish('pubsub', 'telemetry', {
            type: 'log',
            data: {
              timestamp: new Date(),
              level: log.severityText || 'INFO',
              message: log.body as string,
              service: log.resource.attributes['service.name'] as string || 'unknown',
              traceId: log.spanContext?.traceId || '',
              metadata: {
                severityNumber: log.severityNumber,
                attributes: log.attributes,
                resource: log.resource.attributes,
              },
            },
          });
        } catch (error) {
          this.logger.error('Failed to publish log to Dapr:', error);
          throw error;
        }
      })
    )
      .then(() => {
        resultCallback({ code: ExportResultCode.SUCCESS });
      })
      .catch(() => {
        resultCallback({ code: ExportResultCode.FAILED });
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

    this.logger.log('Shutting down GatewayLogExporter...');
    this._isShutdown = true;

    try {
      await Promise.allSettled(this._pendingExports);
      this.logger.log('GatewayLogExporter shutdown complete');
    } catch (error) {
      this.logger.error('Error during GatewayLogExporter shutdown:', error);
    }
  }
}
