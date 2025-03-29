import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import { BaseRepository } from '../../shared/repositories/base.repository.impl';
import { IBaseRepository } from '../../shared/repositories/base.repository';

@Injectable()
export class DeviceRepository extends BaseRepository<Device> implements IBaseRepository<Device> {
  constructor(
    @InjectRepository(Device)
    repository: Repository<Device>,
  ) {
    super(repository, Device);
  }
} 