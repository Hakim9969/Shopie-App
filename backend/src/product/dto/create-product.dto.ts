import { IsString, IsNumber, IsUrl, Min, IsNotEmpty } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  shortDescription: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUrl()
  image: string;

  @IsNumber()
  @Min(0)
  quantityInStock: number;
}