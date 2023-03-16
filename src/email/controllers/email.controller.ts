import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { Public } from 'src/auth/guards/public';
import { EmailService } from '../services/email.service';

@Controller('email')
export class EmailController {
    constructor(private emailService: EmailService) { }

    // ***FOR TESTING SENDGRID WORKS
    @Public()
    @Get('plain-text-email')
    async plainTextEmail(@Query('toemail') toemail: string) {
        return await this.emailService.plainTextEmail(toemail);
    }
    // ***FOR TESTING SENDGRID WORKS
    @Public()
    @Post('plain-html-email')
    async plainHTMLEmail(@Body() payload) {
        return await this.emailService.plainHTMLEmail(payload);
    }
}
