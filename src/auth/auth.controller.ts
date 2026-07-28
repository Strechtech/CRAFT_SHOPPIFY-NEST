import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { RawHeaders, GetUser, Auth } from './decorators';
import type { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from './interfaces';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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
  @ApiResponse({ status: 200, description: 'User logged', type: User })
  @ApiResponse({ status: 401, description: 'User incorrect' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('check-status')
  @Auth()
  @ApiResponse({ status: 200, description: 'Rewiew role user in DB', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }





  @Get('private')
  @UseGuards(AuthGuard())
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
  @RoleProtected(  ValidRoles.superUser, ValidRoles.admin, ValidRoles.user) 
  // @SetMetadata('roles', ['admin', 'super-user'])
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      user
    }
  }


  @Get('private3')
  @Auth(  ValidRoles.superUser, ValidRoles.admin, ValidRoles.user)
  // @SetMetadata('roles', ['admin', 'super-user'])

  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      user
    }
  }

}
