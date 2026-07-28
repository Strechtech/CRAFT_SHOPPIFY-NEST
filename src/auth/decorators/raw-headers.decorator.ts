// DECORADOR ENCARGADO DE OBTENER EL ESTADO DEL USUARIO AL REALIZAR UNA PETICION HTTP

import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        return req.rawHeaders;
        
    }
)