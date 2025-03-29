import { Repository, EntityTarget, DeepPartial } from 'typeorm';
import { IBaseRepository } from './base.repository';
import { NotFoundException } from '@nestjs/common';

export class BaseRepository<T extends { id: string }> implements IBaseRepository<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entity: EntityTarget<T>,
  ) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<T> {
    console.log('findOne', id);
    try {
      const entity = await this.repository.findOne({ where: { id } as any });
      console.log('entity', entity);
      if (!entity) {
        throw new NotFoundException(`Entity with ID ${id} not found`);
      }
      return entity;
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOne(id);
    const updatedEntity = Object.assign({}, entity, data);
    return this.repository.save(updatedEntity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return this.repository.findByIds(ids);
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
} 