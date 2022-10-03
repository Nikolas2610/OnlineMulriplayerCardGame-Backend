import { Body, Controller, Post } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { EmailConfirmationDto } from '../dto/email-confirmation.dto';
import { EmailConfirmationService } from '../services/email-confirmation.service';

@Controller('email-confirmation')
export class EmailConfirmationController {
    constructor(
        private readonly emailConfirmationService: EmailConfirmationService
    ) { }

    @Post('confirm')
    async confirmEmailVerification(@Body() token: EmailConfirmationDto): Promise<any> {
        return await this.emailConfirmationService.confirmEmailVerification(token);
    }

    @Post('confirm-forgot-password')
    async confirmForgotPassword(@Body() token: EmailConfirmationDto): Promise<EmailConfirmationDto> {
        return await this.emailConfirmationService.confirmForgotPassword(token);
    }
}
