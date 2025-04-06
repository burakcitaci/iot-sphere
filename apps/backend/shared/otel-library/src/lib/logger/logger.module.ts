import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CentralLoggerService } from './logger.service';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { LogExporter } from './log.exporter';
import { logs } from '@opentelemetry/api-logs';
import { DaprClient } from '@dapr/dapr';
import { DAPR_CLIENT } from '../dapr/dapr.module';
@Global()
@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
    
  }),],
  providers: [CentralLoggerService,
    {
      provide: 'OTEL_LOGGER_PROVIDER',
      useFactory: (configService: ConfigService, daprClient: DaprClient) => {
     
        const serviceName = configService.get('resource.name');
        const serviceVersion = configService.get('resource.version')
        const loggerProvider = new LoggerProvider({
          resource: new Resource({
            'service.name': serviceName,
            'service.version': serviceVersion
          })
        });

        loggerProvider.addLogRecordProcessor(
          new BatchLogRecordProcessor(new LogExporter(daprClient), {
            maxExportBatchSize: 100,
            scheduledDelayMillis: 1000,
          })
        );

        logs.setGlobalLoggerProvider(loggerProvider);
        return loggerProvider;
      },
      inject: [ConfigService, DAPR_CLIENT],
    },
  ],
  exports: [CentralLoggerService, 'OTEL_LOGGER_PROVIDER'],
})
export class OtelLoggerModule {} 