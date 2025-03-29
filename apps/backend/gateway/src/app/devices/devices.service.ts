import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { DeviceRepository } from './repositories/device.repository';
import { BaseService } from '../shared/services/base.service.impl';

@Injectable()
export class DevicesService extends BaseService<Device> {
  constructor(protected override readonly repository: DeviceRepository) {
    super(repository);
  }

  override async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    return super.create({
      ...createDeviceDto,
      status: 'offline',
      lastSeen: new Date(),
    });
  }

  override async update(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    return super.update(id, {
      ...updateDeviceDto,
      lastSeen: new Date(),
    });
  }
} 