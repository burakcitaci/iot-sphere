import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';
import { OtelLog } from '@iot-sphere/entity-lib';

export class LogExporter implements LogRecordExporter {
  constructor(private readonly daprClient: DaprClient) {}

  async export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ): Promise<void> {
    try {
      const publishPromises = logs.map((logRecord) => {
        const otelLog = this.toOtelLog(logRecord);
        return this.daprClient.pubsub.publish(
          'pubsub',
          'my-topic',
          JSON.stringify(otelLog)
        );
      });

      console.log('All logs published successfully');
      await Promise.all(publishPromises);
      
      resultCallback({ code: ExportResultCode.SUCCESS });

    } catch (error) {
      console.error('Failed to export logs:', error);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  shutdown(): Promise<void> {
    // Perform any cleanup here if needed
    return Promise.resolve();
  }

  private toOtelLog(logRecord: ReadableLogRecord): OtelLog {
    const attrs = logRecord.resource.attributes;

    return {
      body: logRecord.body,
      severityText: logRecord.severityText,
      hrTime: logRecord.hrTime,
      serviceName: attrs['service.name']?.toString(),
      serviceVersion: attrs['service.version']?.toString(),
      environment: attrs['environment']?.toString(),
      host: attrs['host']?.toString(),
      attributes: attrs
    };
  }
}
