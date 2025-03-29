import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(['online', 'offline'])
  status?: 'online' | 'offline';

  @IsOptional()
  @IsString()
  lastSeen?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 