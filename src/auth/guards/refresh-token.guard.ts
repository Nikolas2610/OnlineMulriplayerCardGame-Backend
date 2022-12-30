import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entities/db/user.entity';
import { Repository } from 'typeorm';
import { User } from '../models/user.interface';
import * as crypto from 'crypto';


@Injectable()
export class RefreshToken implements CanActivate {
    constructor(private reflector: Reflector,
        private jwtService: JwtService,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>
    ) { }

    async canActivate(
        context: ExecutionContext,
    ): Promise<boolean> {
        // Get the user from the request
        const { user } = context.switchToHttp().getRequest();

        if (user.refresh_token) {
            return await this.verifyToken(user);
        }
    }

    async verifyToken(user: User) {
        try {
            const jwt_rt = await this.jwtService.verifyAsync(
                user.refresh_token,
                { secret: process.env.JWT_RT_SECRET }
            );

            if (Date.now() > jwt_rt.exp * 1000) {
                throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            }

            const refresh_token = this.hashPassword(jwt_rt.refresh_token)

            const refresh_token_exists = await this.usersRepository.findOne(
                { where: { refresh_token } }
            );

            if (refresh_token_exists) {
                return true
            }
        } catch (error) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
    }

    hashPassword(token: string) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}


