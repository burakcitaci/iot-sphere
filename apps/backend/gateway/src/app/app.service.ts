import { Injectable, Inject } from '@nestjs/common';
import type { SpanContext } from '@opentelemetry/api';
import type { IResource } from '@opentelemetry/resources';
import type { ReadableSpan } from '@opentelemetry/sdk-trace-node';
import { CentralLoggerService, Trace } from '@gateway/otel-library';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: CentralLoggerService
  ) {}

  @Trace({
    spanName: 'get-data',
    captureArgs: true
  })
  getData(): { message: string } {
    this.logger.log('Getting data from service');
    return { message: 'Hello API' };
  }

  getSpanById(spanId: string): ReadableSpan {
    this.logger.debug('Getting span by ID', spanId);
    const span: ReadableSpan = {
      name: 'GET',
      attributes: {
        'http.url': '/api',
        'http.host': 'localhost:3010',
        'net.host.name': 'localhost',
        'http.method': 'GET',
        'http.scheme': 'http',
        'http.target': '/api',
        'http.status_code': 200,
        'http.status_text': 'OK',
      },
      links: [],
      events: [],
      status: { code: 0 },
      startTime: [1742896545, 747000000],
      endTime: [1742896545, 755119500],
      duration: [0, 8119500],
      spanContext: () => {
        return {
          traceId: 'ea25309287eb77a16371081dd843a679',
          spanId: '1e35e7ffbd1a65ae',
          traceFlags: 1,
        } as SpanContext;
      },
      parentSpanId: undefined,
      kind: 1,
      resource: {
        attributes: {
          'service.name': 'gateway-api',
          'sdk.language': 'nodejs',
          'sdk.name': 'opentelemetry',
          'sdk.version': '1.30.1',
          'service.version': '0.0.2',
          'span.id': spanId,
        },
        asyncAttributesPending: false,
        waitForAsyncAttributes: async () => Promise.resolve(),
        merge: () => ({ attributes: {} } as IResource),
      } as IResource,
      ended: true,
      instrumentationLibrary: {
        name: 'my-instrumentation-library',
        version: '1.0.0',
      },
      droppedAttributesCount: 0,
      droppedEventsCount: 0,
      droppedLinksCount: 0,
    };
    return span;
  }
}
