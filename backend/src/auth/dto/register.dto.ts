import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';


@ValidatorConstraint({ name: 'MatchPasswords', async: false })
class MatchPasswordsConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const object = args.object as any;
    return object.password === confirmPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return `Passwords do not match`;
  }
}

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchPasswordsConstraint,
    });
  };
}


export class RegisterDto {
  @IsString()
  @IsNotEmpty()
   @ApiProperty({ example: 'John Doe' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*\d).+$/, {
    message: 'Password must contain at leats one number',
  })
    @ApiProperty({ example: 'pass1234' })
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
    @ApiProperty({ example: 'pass1234' })
  confirmPassword: string;
}
