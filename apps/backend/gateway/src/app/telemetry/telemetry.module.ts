import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtelLogger } from '../../common/open-telemetry/logs/logger';
import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { GatewayLogExporter } from '../../common/open-telemetry/logs/exporter';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [ConfigModule],
  providers: [
    TelemetryService,
    {
      provide: OtelLogger,
      useFactory: (configService: ConfigService) => {
        const loggerProvider = new LoggerProvider({
          resource: new Resource({
            'service.name': configService.get('telemetry.serviceName'),
            'service.version': configService.get('telemetry.serviceVersion'),
          }),
        });

        loggerProvider.addLogRecordProcessor(
          new BatchLogRecordProcessor(new GatewayLogExporter())
        );

        return new OtelLogger(loggerProvider.getLogger('gateway-api'));
      },
      inject: [ConfigService],
    },
  ],
  exports: [OtelLogger],
})
export class TelemetryModule {} 