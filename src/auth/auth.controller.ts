import { Controller, Get, Post, Body, UseGuards, Req, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { RawHeaders, GetUser, Auth } from './decorators';
import type { IncomingHttpHeaders } from 'http';
import { ValidRoles } from './interfaces';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

//  METODOS CRUD PARA EL CONTROL DE USUARIOS (AUTH, REGISTER, LOGIN, ETC)
@ApiTags('Autenticacion')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un usuario' })
  @ApiCreatedResponse({ description: 'Usuario creado', type: User })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email duplicado' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Credenciales válidas y JWT generado' })
  @ApiResponse({ status: 400, description: 'Usuario o contraseña incorrectos' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('check-status')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Comprobar sesión activa y renovar token' })
  @ApiResponse({ status: 200, description: 'Usuario autenticado', type: User })
  @ApiUnauthorizedResponse({ description: 'Token ausente, inválido o usuario inactivo' })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }





  @Get('private')
  @Auth()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Probar una ruta protegida por JWT' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders,

    // @Req() request: Express.Request
  ) {
      
    return {
      ok: true,
      message: 'Hello World Private',
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }
  @Get('private2')
  @Auth(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Probar una ruta protegida por roles' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'El usuario no tiene un rol permitido' })
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user
    }
  }


  @Get('private3')
  @Auth(ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Probar la protección combinada JWT y roles' })
  @ApiUnauthorizedResponse({ description: 'Token ausente o inválido' })
  @ApiResponse({ status: 403, description: 'El usuario no tiene un rol permitido' })
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user
    }
  }

}
