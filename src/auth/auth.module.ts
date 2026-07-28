import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
  TypeOrmModule.forFeature([User]),
  ConfigModule,
  PassportModule.register({defaultStrategy: 'jwt'}),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      // console.log('JWT_SECRET_KEY', configService.get('JWT_SECRET_KEY'));
      // console.log('JWT SECRET KEY', process.env.JWT_SECRET_KEY);
      return {
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: '1h',
        },
      };
    },
  })
  // JwtModule.register({
  //   secret: process.env.JWT_SECRET_KEY,
  //   signOptions: {
  //     expiresIn: '1h'
  //   }
  // }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
