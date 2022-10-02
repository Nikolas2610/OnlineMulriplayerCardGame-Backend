import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    constructor(
        private mailService: MailerService,
        private readonly configService: ConfigService,) { }

    async sendMail(to: string, subject: string, text: string) {
        return await this.mailService.sendMail({
            to,
            from: this.configService.get('APP_EMAIL'),
            subject,
            text,
        });
    }

    async plainTextEmail(toemail: string) {
        return await this.mailService.sendMail({
            to: toemail,
            from: 'psillovits@gmail.com',
            subject: 'Simple Plain Text',
            text: `Welcome to the Online Multiplayer Card Game`
        });
    }

    async plainTextEmail2(mail: { email: string }) {
        const { email } = mail
        return await this.mailService.sendMail({
            to: email,
            from: 'psillovits@gmail.com',
            subject: 'Simple Plain Text2',
            text: `Welcome to the Online Multiplayer Card Game`
        });
    }
}
