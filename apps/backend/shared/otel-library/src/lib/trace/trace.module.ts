import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace, context } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { resourceFromAttributes  } from '@opentelemetry/resources';
import { TraceExporter } from './trace.exporter';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { DaprClient } from '@dapr/dapr';
import { DAPR_CLIENT } from '../dapr/dapr.module';
import { CentralLoggerService } from '../logger/logger.service';
import { OtelLoggerModule } from '../logger/logger.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OtelLoggerModule
  ],
  providers: [
    {
      provide: 'OTEL_TRACER_PROVIDER',
      useFactory: (configService: ConfigService, daprClient: DaprClient, logService: CentralLoggerService) => {
        const daprPort = configService.get<string>('dapr.port');
        console.log('DAPR (for trace): ' + logService);

        const serviceName = configService.get('resource.name');
        const serviceVersion = configService.get('resource.version')
        const provider = new NodeTracerProvider({
          resource:  resourceFromAttributes({
            'service.name': serviceName,
            'service.version': serviceVersion
          }),
          spanProcessors:[
            new BatchSpanProcessor(
                new TraceExporter(daprClient, logService), // Replace with your real exporter
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
      inject: [ConfigService, DAPR_CLIENT, CentralLoggerService],
    },
  ],
  exports: ['OTEL_TRACER_PROVIDER'],
})
export class TraceModule {}

