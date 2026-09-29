import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { ValidRoles } from '../interfaces';

export class UpdateUserRolesDto {
  @ApiProperty({
    enum: ValidRoles,
    isArray: true,
    example: [ValidRoles.user, ValidRoles.admin],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ValidRoles, { each: true })
  roles!: ValidRoles[];
}