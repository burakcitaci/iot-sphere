import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { Trace } from './entities/trace.entity';
import { Log } from './entities/log.entity';
import { DaprModule } from '../dapr/dapr.module';
import { GatewayLogExporter } from '../../common/open-telemetry/logs/exporter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OtelLogger } from '../../common/open-telemetry/logs/logger';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
const GATEWAY_LOG_EXPORTER = 'GATEWAY_LOG_EXPORTER';
@Module({
  imports: [
    TypeOrmModule.forFeature([Trace, Log]),
    DaprModule,
    ConfigModule
  ],
  controllers: [TelemetryController],
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
  exports: [TelemetryService, OtelLogger],
})
export class TelemetryModule {} 