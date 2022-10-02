import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/services/email.service';
import { Repository } from 'typeorm';
import { UsersEntity } from '../models/user.entity';
import { User } from '../models/user.interface';

@Injectable()
export class AuthService {
    constructor(
        // Import table
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
        private jwtService: JwtService,
        private emailService: EmailService
    ) { }

    // Hash the password
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }

    // Register Account
    async registerAccount(user: User): Promise<User> {
        const { firstname, lastname, email, password } = user;
        // Hash the password
        const hashPassword = await this.hashPassword(password);
        // Save to database
        const registerUser = await this.usersRepository.save({
            firstname, lastname, email, password: hashPassword
        })
        // Delete password to the return object
        delete registerUser.password;
        return registerUser;
    }

    async validateUser(email: string, password: string): Promise<User> {
        // Find user by email
        const user = await this.usersRepository.findOne({
            where: { email },
            select: {
                firstname: true,
                lastname: true,
                password: true,
                email: true,
                id: true,
                role: true
            }
        })
        // Return error for the email if has
        if (!user) {
            throw new HttpException({ status: HttpStatus.NOT_FOUND, error: 'The user does not exists' }, HttpStatus.NOT_FOUND);
        }
        // Check if the is the correct password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
            // Delete password from the return object
            delete user.password;
            return user;
        } else {
            // Throw error for the wrong password
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Wrong Password' }, HttpStatus.BAD_REQUEST);
        }
    }

    // Login account by email
    async loginAccount(userBeforeRequest: User): Promise<{ token: string }> {
        // Get email and password from the request
        const { email, password } = userBeforeRequest;
        // Check if the user is valid
        const user = await this.validateUser(email, password);
        if (user) {
            // Create jwt secret token 
            const token = await this.jwtService.signAsync({ user })
            return { token }
        }
    }

    async testemail(email:  { email: string }) {
        return await this.emailService.plainTextEmail2(email)
    }
}