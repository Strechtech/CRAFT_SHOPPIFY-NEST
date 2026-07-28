import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interfaces';
import { JwtService } from '@nestjs/jwt';




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
      throw new BadRequestException('User not found');
    }else if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Password incorrect');
    }
    console.log(user);
    return {
      ...user,
      token: this.getJwtToken({ email: user.email, id: user.id }),
    };
  }
  
  // CHEQUEAR TOKEN DEL USUARIO
  checkAuthStatus(user: User) {
    return {
      ...user,
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