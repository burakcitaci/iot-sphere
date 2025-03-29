import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  name!: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 