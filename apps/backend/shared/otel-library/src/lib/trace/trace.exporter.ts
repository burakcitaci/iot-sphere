import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';
import { DaprClient } from '@dapr/dapr';
import { CentralLoggerService } from '../logger/logger.service';
import { OtelSpan } from '@iot-sphere/entity-lib';

export class TraceExporter implements SpanExporter {
  constructor(
    private readonly daprClient: DaprClient,
    private readonly logService: CentralLoggerService
  ) {}

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): Promise<void> {
    try {
      const publishTasks = spans.map((span) => {
        const safeSpan: OtelSpan = this.toOtelSpan(span);
        return this.daprClient.pubsub.publish(
          'pubsub2',
          'my-span',
          JSON.stringify(safeSpan)
        );
      });

      await Promise.all(publishTasks);

      this.logService.debug('✅ All spans published successfully');
      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      this.logService.error('❌ Failed to publish spans:', error);
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }

  private toOtelSpan(span: ReadableSpan): OtelSpan {
    return {
      name: span.name,
      startTime: span.startTime,
      endTime: span.endTime,
      status: span.status,
      attributes: span.attributes,
      spanContext: span.spanContext(),
      serviceName: span.resource.attributes['service.name'] as string,
      serviceVersion: span.resource.attributes['service.version'] as string,
    };
  }
}
