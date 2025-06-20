import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @ApiProperty({})
  token: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({})
  password: string;
}