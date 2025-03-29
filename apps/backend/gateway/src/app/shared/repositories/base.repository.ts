import { Repository, DeepPartial } from 'typeorm';

export interface IBaseRepository<T extends { id: string }> {
  create(data: DeepPartial<T>): Promise<T>;
  findAll(): Promise<T[]>;
  findOne(id: string): Promise<T>;
  update(id: string, data: DeepPartial<T>): Promise<T>;
  remove(id: string): Promise<void>;
  findByIds(ids: string[]): Promise<T[]>;
  count(): Promise<number>;
} 