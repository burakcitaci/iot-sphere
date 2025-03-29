import { Injectable } from '@nestjs/common';
import type { IBaseService } from './base.service';
import type { IBaseRepository } from '../repositories/base.repository';
import { DeepPartial } from 'typeorm';

@Injectable()
export class BaseService<T extends { id: string }> implements IBaseService<T> {
  constructor(protected readonly repository: IBaseRepository<T>) {}

  async create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<T> {
    console.log('findOne', id);
    return this.repository.findOne(id);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    return this.repository.update(id, data);
  }

  async remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return this.repository.findByIds(ids);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
} 