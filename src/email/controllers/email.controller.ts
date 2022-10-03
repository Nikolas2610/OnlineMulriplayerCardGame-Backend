import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from '../services/email.service';

@Controller('email')
export class EmailController {
    constructor(private emailService: EmailService) {}

    // ***FOR TESTING SENDGRID WORKS
    @Get('plain-text-email')
    async plainTextEmail(@Query('toemail') toemail: string) {
        return await this.emailService.plainTextEmail(toemail);
    }
}
