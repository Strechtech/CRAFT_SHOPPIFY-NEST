import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Product {
  @ApiProperty({
    example: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
    description: 'Product ID',
    uniqueItems: true
  })
  //Campos para la base de datos 
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product title',
    uniqueItems: true
   })
  @Column('text', { unique: true })
  title!: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
    default: 0
   })
  @Column('float', { default: 0 })
  price!: number;
  

  @ApiProperty({
    example: 'A nice product',
    description: 'Product description',
    default: null
   })
  @Column('text', { nullable: true })
  description?: string;
  

  @ApiProperty({
    example: 't-shirt-uuid',
    description: 'Product slug - for SEO',
    uniqueItems: true
   })
  @Column('text', { unique: true })
  slug?: string;


  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0
   })  
  @Column('int', { default: 0 })
  stock?: number;
  
  @ApiProperty({
    example: ['M', 'XL', 'XXL'],
    description: 'Product sizes',
    default: []
   })
  @Column('text', { array: true })
  sizes?: string[];


  @ApiProperty({
    example: 'men',
    description: 'Product gender',
    default: 'men'
   })
  @Column('text')
  gender?: string;

  //tags
  @ApiProperty({
    example: ['tag1', 'tag2', 'tag3'],
    description: 'Product tags',
    default: []
   })
  @Column(
    'text',
    {
      array: true,
      default: []
    }
  )
  tags?: string[];

  //images - relación OneToMany correcta
  @ApiProperty({
    type: () => [ProductImage],
    description: 'Product images',
    default: []
   })
  @OneToMany(() => ProductImage, (productImage) => productImage.product, { 
    cascade: true,
    eager: true
  })
  images?: ProductImage[];

  //Relacion de muchos productos a un usuario
  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user!: User;



  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug!.toLocaleLowerCase().replaceAll(' ', '-').replaceAll("'", '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug!.toLocaleLowerCase().replaceAll(' ', '-').replaceAll("'", '');
  }
}