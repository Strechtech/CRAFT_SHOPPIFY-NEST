import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {

    // Validacion del campo email
    @ApiProperty({
        example: 'XGZVl@example.com',
        description: 'User email',
        uniqueItems: true
    })
    @IsEmail()
    @IsString()
    email!: string;


    // Validacion del campo password
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

}