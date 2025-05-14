import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CentralLoggerService } from './logger.service';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { resourceFromAttributes  } from '@opentelemetry/resources';
import { LogExporter } from './log.exporter';
import { logs } from '@opentelemetry/api-logs';
import { DaprClient } from '@dapr/dapr';
import { DAPR_CLIENT } from '../dapr/dapr.module';
import * as os from 'os';
@Global()
@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,
    
  }),],
  providers: [CentralLoggerService,
    {
      provide: LoggerProvider,
      useFactory: (configService: ConfigService, daprClient: DaprClient) => {
     
        const serviceName = configService.get('resource.name');
        const serviceVersion = configService.get('resource.version')
        const environment = configService.get<string>('NODE_ENV');
        console.log(serviceName, serviceVersion)
        const attributes = {
          'service.name': serviceName,
          'service.version': serviceVersion,
          'environment': environment,
          'host': os.hostname()
        };
        
        const loggerProvider = new LoggerProvider({
          
          resource:  resourceFromAttributes(attributes)
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
  exports: [CentralLoggerService, LoggerProvider],
})
export class OtelLoggerModule {} 