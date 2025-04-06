import { IsString, IsOptional, IsObject, IsNumber, IsDateString } from 'class-validator';

export class TelemetryDto {
  @IsString()
  deviceId!: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsObject()
  data!: Record<string, any>;

  @IsString()
  @IsOptional()
  type?: string;

  @IsNumber()
  @IsOptional()
  version?: number;
} 