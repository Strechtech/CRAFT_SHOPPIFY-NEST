import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { JwtService } from '@nestjs/jwt';
import { ValidRoles } from './interfaces';




@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  // CREAR USUARIO CON HASH DE PASSWORD - ENCRYPT
  async create(createUserDto: CreateUserDto) {
    try {
      const  {password, ...userData} = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      const { password: _, ...userWithoutPassword } = user;
      
      return userWithoutPassword;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }
  // LOGUEAR  USUARIO
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true, id: true } });

    if (!user) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }else if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }
    return {
      message: 'Usuario ha ingresado con éxito',
      token: this.getJwtToken({ email: user.email, id: user.id }),
    };
  }
  
  async updateUserRoles(userId: string, roles: ValidRoles[]) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, isActive: true, roles: true },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.roles?.includes(ValidRoles.admin) && !roles.includes(ValidRoles.admin)) {
      const otherAdmins = await this.userRepository
        .createQueryBuilder('user')
        .where(':admin = ANY(user.roles)', { admin: ValidRoles.admin })
        .andWhere('user.id != :userId', { userId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getCount();

      if (otherAdmins === 0) {
        throw new BadRequestException('Debe permanecer al menos un usuario admin');
      }
    }

    user.roles = roles;
    await this.userRepository.save(user);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isActive: user.isActive,
      roles: user.roles,
    };
  }

  // CHEQUEAR TOKEN DEL USUARIO
  checkAuthStatus(user: User) {
    const { password: _password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ email: user.email, id: user.id }),
    };
  }
  
  private getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    console.log(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}