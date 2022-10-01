import { Body, Controller, Post } from '@nestjs/common';
import { User } from '../models/user.interface';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('register')
    async register(@Body() user: User): Promise<User> {
        return await this.authService.registerAccount(user);
    }
}
