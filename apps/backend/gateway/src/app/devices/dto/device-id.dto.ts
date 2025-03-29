import { IsUUID } from '../../shared/validators/uuid.validator';

export class DeviceIdDto {
  @IsUUID()
  id!: string;
} 