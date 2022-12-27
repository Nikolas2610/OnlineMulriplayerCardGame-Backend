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

    async sendEmailAccountConfirmation(to: string, subject: string, url: string, username: string): Promise<string> {
        let message: string = '';
        try {
            await this.mailService.sendMail({
                to,
                from: this.configService.get('APP_EMAIL'),
                subject,
                template: 'account-verify',
                context: {
                    url: url,
                    username: username
                }
            });
            message = 'email sent';
        } catch (error) {
            message = 'email server error';
        }
        return message
    }

    async sendForgotPasswordConfirmation(to: string, subject: string, url: string): Promise<string> {
        let message: string = '';
        try {
            await this.mailService.sendMail({
                to,
                from: this.configService.get('APP_EMAIL'),
                subject,
                template: 'forgot-password',
                context: {
                    url: url
                }
            });
            message = 'email sent';
        } catch (error) {
            message = 'email server error';
        }
        return message
    }

    // For Testing
    async plainTextEmail(toemail: string) {
        return await this.mailService.sendMail({
            to: toemail,
            from: 'psillovits1@gmail.com',
            subject: 'Simple Plain Text',
            text: `Welcome to the Online Multiplayer Card Game`
        });
    }

    // For Testing
    async plainHTMLEmail(payload) {
        let message = ''
        try {
            const response = await this.mailService.sendMail({
                to: payload.toemail,
                from: 'psillovits11@gmail.com',
                subject: 'Simple Plain HTML mail',
                template: 'forgot-password',
                context: {
                    url: payload.url
                }
            });
            message = 'success'
        } catch (error) {
            message = 'error'
        }
        return message
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
