import { Body, Controller, Post } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { EmailConfirmationService } from '../services/email-confirmation.service';

@Controller('email-confirmation')
export class EmailConfirmationController {
    constructor(
        private readonly emailConfirmationService: EmailConfirmationService
    ) {}

    @Post('confirm')
    async confirmEmailVerification(@Body('token') token: string):Promise<UpdateResult> {
        return await this.emailConfirmationService.confirmEmailVerification(token);
    }

    @Post('confirm-forgot-password')
    async confirmForgotPassword(@Body('token') token: string):Promise<{token: string}> {
        return await this.emailConfirmationService.confirmForgotPassword(token);
    }
}
