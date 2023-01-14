import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entities/db/users.entity';
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
        // Verify user with refresh token
        if (user.refresh_token) {
            return await this.verifyToken(user);
        }
    }

    async verifyToken(user: User) {
        try {
            // Verify JWT token
            const jwt_rt = await this.jwtService.verifyAsync(
                user.refresh_token,
                { secret: process.env.JWT_RT_SECRET }
            );
            // Hash the refresh token to check if is the same with the refresh_token at database
            const refresh_token = this.hashPassword(jwt_rt.refresh_token)
            const refresh_token_exists = await this.usersRepository.findOne({ where: { refresh_token } });
            // If refresh token exists accept the user
            if (refresh_token_exists) {
                return true
            }
        } catch (error) {
            throw new HttpException({ status: HttpStatus.FORBIDDEN, error: 'Unauthorized' }, HttpStatus.FORBIDDEN);
        }
    }

    hashPassword(token: string) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}


