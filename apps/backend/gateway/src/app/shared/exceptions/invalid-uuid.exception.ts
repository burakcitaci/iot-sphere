import { BadRequestException } from '@nestjs/common';

export class InvalidUUIDException extends BadRequestException {
  constructor(value: string) {
    super(`Invalid UUID format: ${value}`);
  }
} 