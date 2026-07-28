import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

  // Validacion para el campo ID del usuario en la BD
  @ApiProperty({
    example: 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1',
    description: 'User ID',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

// Validacion para el campo Email del usuario en la BD
  @ApiProperty({
    example: 'XGZVl@example.com',
    description: 'User email',
    uniqueItems: true
  })
  @Column('text', { unique: true })
  email!: string;  


  // Validacion para el campo Password del usuario en la BD
  @ApiProperty({
    example: '123456',
    description: 'User password',
    uniqueItems: true
  })
  @Column('text')
  password!: string;  

  // Validacion para el campo FullName del usuario en la BD
  @ApiProperty({
    example: 'John Doe',
    description: 'User name',
    uniqueItems: true
  })
  @Column('text')
  fullName!: string;  

  // Validacion para control del estado del usuario en la BD
  @ApiProperty({
    example: true,
    description: 'User status',
    uniqueItems: true
  })
  @Column('bool', {default: true })
  isActive!: boolean;

// Validacion para el campo Rol del usuario en la BD
  @ApiProperty(
    {
      example: ['user'],
      description: 'User roles',
      uniqueItems: true
    }
  )
  @Column('text', { array: true, default: ['user'] })
  roles?: string[];

  // relacion de uno a muchos
  @OneToMany(() => Product, (product) => product.user)
  product!: Product;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}