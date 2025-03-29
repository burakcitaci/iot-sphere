import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { GatewaySpanExporter } from '../../common/open-telemetry/traces/exporter';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class TelemetryService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (this.configService.get('telemetry.enabled')) {
      this.initializeTracing();
    }
  }

  private initializeTracing() {
    console.log('Initializing telemetry...');

    const provider = new NodeTracerProvider({
      resource: new Resource({
        'service.name': this.configService.get('telemetry.serviceName'),
        'service.version': this.configService.get('telemetry.serviceVersion'),
      }),
      spanProcessors: [
        new BatchSpanProcessor(new GatewaySpanExporter()),
      ],
    });

    provider.register();

    registerInstrumentations({
      instrumentations: [
        new HttpInstrumentation({
          requestHook: (span, request: ClientRequest | IncomingMessage) => {
            const method = 'method' in request ? request.method : undefined;
            const url = 'url' in request ? request.url : undefined;

            if (method) {
              span.setAttribute('http.method', method);
            }
            if (url) {
              span.setAttribute('http.url', url);
            }
          },
          responseHook: (
            span,
            response: IncomingMessage | ServerResponse<IncomingMessage>
          ) => {
            if (
              'statusCode' in response &&
              typeof response.statusCode === 'number'
            ) {
              span.setAttribute('http.status_code', response.statusCode);
            }
          },
        }),
      ],
    });
  }
} 