import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, context } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { TraceExporter } from './trace.exporter';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { DaprClient } from '@dapr/dapr';
import { DAPR_CLIENT } from '../dapr/dapr.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: 'OTEL_TRACER_PROVIDER',
      useFactory: (configService: ConfigService, daprClient: DaprClient) => {
        const daprPort = configService.get<string>('dapr.port');
        console.log('DAPR (for trace): ' + daprPort);

    
        const provider = new NodeTracerProvider({
          resource: new Resource({
            'service.name': 'devices-api',
            'service.version': '1.0.0',
          }),
          spanProcessors:[
            new BatchSpanProcessor(
                new TraceExporter(daprClient), // Replace with your real exporter
                {
                  maxExportBatchSize: 100,
                  scheduledDelayMillis: 1000,
                }
              )
          ]
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
        trace.setGlobalTracerProvider(provider);

        return provider;
      },
      inject: [ConfigService, DAPR_CLIENT],
    },
  ],
  exports: ['OTEL_TRACER_PROVIDER'],
})
export class TraceModule {}

