import { Body, Controller, Post } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { User } from '../models/user.interface';
import { AuthService } from '../services/auth.service';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UserRegisterDto } from '../dto/user-register.dto';
import { UserLoginDto } from '../dto/user-login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { Public } from '../guards/public';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }

    @Public()
    @Post('register')
    async register(@Body() user: UserRegisterDto): Promise<User> {
        return await this.authService.registerAccount(user);
    }

    @Public()
    @Post('login')
    async login(@Body() user: UserLoginDto): Promise<{ token: String }> {
        return await this.authService.loginAccount(user);
    }

    @Public()
    @Post('forgot-password')
    async forgotPassword(@Body() email: ForgotPasswordDto): Promise<String> {
        return await this.authService.forgotPassword(email);
    }

    @Public()
    @Post('update-password')
    async updatePassword(@Body() user: UpdatePasswordDto): Promise<UpdateResult> {
        return await this.authService.updatePassword(user);
    }
}
