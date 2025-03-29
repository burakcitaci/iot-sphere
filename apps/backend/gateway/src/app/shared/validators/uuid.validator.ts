import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InvalidUUIDException } from '../exceptions/invalid-uuid.exception';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUUIDConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new InvalidUUIDException(value);
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid UUID format';
  }
}

export function IsUUID(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUUIDConstraint,
    });
  };
} 