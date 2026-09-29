import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser, Auth } from './decorators';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidRoles } from './interfaces';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';

//  METODOS CRUD PARA EL CONTROL DE USUARIOS (AUTH, REGISTER, LOGIN, ETC)
@ApiTags('Autenticacion')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 200, description: 'User created', type: User })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'Usuario ha ingresado con éxito',
    schema: {
      example: {
        message: 'Usuario ha ingresado con éxito',
        token: 'eyJhbGciOiJIUzI1NiIs...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Correo o contraseña incorrectos' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Patch('users/:id/roles')
  @Auth(ValidRoles.admin)
  @ApiResponse({ status: 200, description: 'Roles de usuario actualizados' })
  @ApiResponse({ status: 403, description: 'Se requiere el rol admin' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateUserRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ) {
    return this.authService.updateUserRoles(id, updateUserRolesDto.roles);
  }

  @Get('check-status')
  @Auth()
  @ApiResponse({ status: 200, description: 'Rewiew role user in DB', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }
}
