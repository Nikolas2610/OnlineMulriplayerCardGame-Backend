import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/auth/guards/public';
import { UpdateResult } from 'typeorm';
import { EmailConfirmationDto } from '../dto/email-confirmation.dto';
import { EmailConfirmationService } from '../services/email-confirmation.service';

@Controller('email-confirmation')
export class EmailConfirmationController {
    constructor(
        private readonly emailConfirmationService: EmailConfirmationService
    ) { }

    @Public()
    @Post('confirm')
    async confirmEmailVerification(@Body() token: EmailConfirmationDto): Promise<UpdateResult> {
        return await this.emailConfirmationService.confirmEmailVerification(token);
    }

    @Public()
    @Post('confirm-forgot-password')
    async confirmForgotPassword(@Body() token: EmailConfirmationDto): Promise<EmailConfirmationDto> {
        return await this.emailConfirmationService.confirmForgotPassword(token);
    }
}
