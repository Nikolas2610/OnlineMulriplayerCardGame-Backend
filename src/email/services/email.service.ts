import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    constructor(private mailService:MailerService) {

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
