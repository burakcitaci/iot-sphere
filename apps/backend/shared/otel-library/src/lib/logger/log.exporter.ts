import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';
export class LogExporter implements LogRecordExporter {
  private daprClient: DaprClient;

  constructor(daprClient: DaprClient) {
    this.daprClient = daprClient;
  }

  async export(
    logs: ReadableLogRecord[],
    resultCallback: (result: ExportResult) => void
  ) {
    try {
      //this.formatLog(logs[0]); // Example of formatting the first log
      for (const logRecord of logs) {
        const safeLog = {
          body: logRecord.body,
          severityText: logRecord.severityText,
          hrTime: logRecord.hrTime,
          serviceName: logRecord.resource.attributes['service.name'],
          serviceVersion: logRecord.resource.attributes['service.version'],
          environment: logRecord.resource.attributes['environment'],
          host: logRecord.resource.attributes['host'],
        };
        await this.daprClient.pubsub.publish(
          'pubsub',
          'my-topic',
          JSON.stringify(safeLog)
        );

        console.log('Logs published successfully', logRecord.resource);
      }

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('Failed to export logs:', error);
      resultCallback({
        code: ExportResultCode.FAILED,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }

  async shutdown(): Promise<void> {
    // Cleanup if needed
  }
}
