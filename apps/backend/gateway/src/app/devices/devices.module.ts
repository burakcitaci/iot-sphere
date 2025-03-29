import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from './entities/device.entity';
import { DeviceRepository } from './repositories/device.repository';
import { IsUUIDConstraint } from '../shared/validators/uuid.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [DevicesController],
  providers: [DevicesService, DeviceRepository, IsUUIDConstraint],
})
export class DevicesModule {} 