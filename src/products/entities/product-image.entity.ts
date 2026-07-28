import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class ProductImage {

  //Validacion del ID del producto
  @ApiProperty(
    {
      example: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
      description: 'Product image ID',
      uniqueItems: true
    }
  )
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Validacion de el recurso multimedia URL
  @ApiProperty(
    {
      example: 'https://...',
      description: 'Product image url',
      uniqueItems: true
    }
  )
  @Column('text')
  url!: string;    
  
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE'
  })
  product!: Product;
}