import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DaprModule, OtelLoggerModule, TraceModule } from '@gateway/otel-library';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthController } from './health/health.controller';

@Module({
  imports: [OtelLoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TraceModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
