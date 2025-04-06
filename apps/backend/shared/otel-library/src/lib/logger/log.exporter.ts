import { LogRecordExporter, ReadableLogRecord } from '@opentelemetry/sdk-logs';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';
export class LogExporter implements LogRecordExporter {

  // private readonly daprClient: DaprClient;
  // constructor(daprPort = '3500') {
  //   this.daprClient = new DaprClient({
  //     daprHost: 'localhost',
  //     daprPort,
  //   }); // Dapr sidecar address
    
  // }
  private daprClient: DaprClient;
  
  constructor(daprClient: DaprClient) {
    this.daprClient = daprClient;
  }
  
  async export(logs: ReadableLogRecord[], resultCallback: (result: ExportResult) => void) {
    try {
      
     //this.formatLog(logs[0]); // Example of formatting the first log
     await this.daprClient.pubsub.publish('pubsub', "my-topic", JSON.stringify(logs[0]));

     console.log("Logs published successfully")
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.error('Failed to export logs:', error);
      resultCallback({ 
        code: ExportResultCode.FAILED, 
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  }

  // private formatLog(log: ReadableLogRecord): string {
  //   const timestamp = new Date().toISOString(); // Use current time since timestamp is not available
  //   const severity = log.severityText;
  //   const body = log.body;
  //   const attributes = JSON.stringify(log.attributes);
    
  //   return `${timestamp} [${severity}] ${body} ${attributes}`;
  // }

  async shutdown(): Promise<void> {
    // Cleanup if needed
  }
}