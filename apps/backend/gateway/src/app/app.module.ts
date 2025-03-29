import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [SharedModule, HealthModule, TelemetryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
