import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UsersEntity } from '../models/user.entity';
import { User } from '../models/user.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>
    ) { }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    async registerAccount(user: User): Promise<User> {
        const { firstname, lastname, email, password } = user;
        const hashPassword = await this.hashPassword(password);
        const registerUser =  await this.usersRepository.save({
            firstname, lastname, email, password: hashPassword
        })
        delete registerUser.password;
        return registerUser;
    }
}
