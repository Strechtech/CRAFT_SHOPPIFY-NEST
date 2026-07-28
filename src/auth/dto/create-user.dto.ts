/*DTO PARA LA CREACION DE USUARIOS APLICANDO VALIDACIONES
Y CAMPOS OBLIGATORIOS */

import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    // Validacion encargada de validar el email
    @ApiProperty({
        example: 'XGZVl@example.com',
        description: 'User email',
        uniqueItems: true
    })
    @IsEmail()
    @IsString()
    email!: string;

    // Validacion encargada de validar la contraseña
    @ApiProperty({
        example: '123456',
        description: 'User password',
        uniqueItems: true
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'})

    password!: string;
    
    // Validacion encargada de validar el nombre completo
    @ApiProperty({
        example: 'John Doe',
        description: 'User name',
        uniqueItems: true
    })
    @IsString()
    @MinLength(1)
    fullName?: string;

}