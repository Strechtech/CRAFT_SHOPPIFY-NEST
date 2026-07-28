import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
   
    @ApiProperty({
        minimum: 1,
        default: 10,
        // Permite delimitar la cantidad de items por página
        description: 'Limit per page'
    })
    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    // TRANSFORMAR EN NUMBER
    limit?: number;

    @ApiProperty({
        minimum: 0,
        default: 10,
        // Permite desarrollar saltos entre posiciones de la base de datos
        description: 'How many items to skip'
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number;
}