import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateProductDto {
  // Propiedades de los productos que permiten validar si cumplen con los requisitos de la base de datos
  // Validacion del campo title
  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product title',
    uniqueItems: true
  })
  @IsString()
  @MinLength(1)
  title!: string;
  
// Validacion del campo price
  @ApiProperty({
    example: 0,
    description: 'Product price',
    default: 0
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;

// Validacion del campo description
  @ApiProperty({
    example: 'A nice product',
    description: 'Product description',
    default: null
  })
  @IsString()
  @IsOptional()
  description?: string;

// Validacion del campo slug
  @ApiProperty({
    example: 't-shirt-teslo',
    description: 'Product slug',
    default: null
  })
  @IsString()
  @IsOptional()
  slug?: string;

// Validacion del campo stock
  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;

// Validacion del campo sizes
  @ApiProperty({
    example: ['M', 'XL', 'XXL'],
    description: 'Product sizes',
    default: []
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  sizes?: string[];

// Validacion del campo type
  @ApiProperty({
    example: 'women',
    description: 'Product gender',
    default: 'women'
  })
  @IsString()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender!: string;

// Validacion del campo tags
  @ApiProperty({
    example: ['shirt', 'polo'],
    description: 'Product tags',
    default: []
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

// Validacion del campo images
  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product title',
    uniqueItems: true
  })
  @IsString({ each: true })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];
}