import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './health/health.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { DevicesModule } from './devices/devices.module';
import { Device } from './devices/entities/device.entity';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'bci'),
        database: configService.get('DB_DATABASE', 'iot_sphere'),
        entities: [Device],
        synchronize: configService.get('NODE_ENV') !== 'production',
        autoLoadEntities: true,
        createDatabase: true,
        dropSchema: false,
      }),
      inject: [ConfigService],
    }),
    SharedModule,
    HealthModule,
    TelemetryModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
