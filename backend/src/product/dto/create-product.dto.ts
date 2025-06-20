import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUrl, Min, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ })
  shortDescription: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ })
  price: number;

  @IsUrl()
  @ApiProperty({ })
  image: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ })
  quantityInStock: number;
}