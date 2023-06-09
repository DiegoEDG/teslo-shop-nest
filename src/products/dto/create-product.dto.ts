import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  stock: number;

  @IsIn(['man', 'woman', 'kid', 'unisex'])
  gender: string;

  @IsIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])
  sizes?: string[];

  @IsString()
  @IsOptional()
  type?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
