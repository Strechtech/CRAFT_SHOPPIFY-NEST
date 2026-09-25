import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get<string>('JWT_SECRET_KEY')!,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
    async validate(payload: JwtPayload): Promise<User> {
        const {email } = payload;
        const user = await this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                fullName: true,
                isActive: true,
                roles: true,
            },
        });
        if (!user) throw new UnauthorizedException('User not found');
        if (!user.isActive) throw new UnauthorizedException('User not active, talk with an admin');
        return user;
    }
}