import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/services/auth.service';
import { UpdateResult } from 'typeorm';
import { EmailConfirmationDto } from '../dto/email-confirmation.dto';
import VerificationTokenPayload from '../modals/verificationTokenPayload.interface';
import { EmailService } from './email.service';

@Injectable()
export class EmailConfirmationService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService
    ) { }

    async sendVerificationLink(email: string, username: string): Promise<string> {
        // Get the email from request
        const payload: VerificationTokenPayload = { email };
        // Create jwt token with user email
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_EMAIL_VERIFICATION_TOKEN_SECRET'),
            expiresIn: this.configService.get('JWT_EMAIL_VERIFICATION_TOKEN_EXPIRATION_TIME')
        })
        // Get the app url and add the token | ***Bug from SENDGRID the url shows but not the href | ***URL decide from the Frontend
        const url = `${this.configService.get('FRONTEND_URL')}${this.configService.get('EMAIL_CONFIRMATION_URL')}?token=${token}`; 
        // Subject email
        const subject = `Email Confirmation | ${this.configService.get('APP_NAME')}`;
        // Send email
        const message = await this.emailService.sendEmailAccountConfirmation(email, subject, url, username);
        return message;
    }

    async confirmEmailVerification(token: EmailConfirmationDto): Promise<UpdateResult> {
        // Verify token 
        try {
            const payload = await this.jwtService.verify(token.token, {
                secret: this.configService.get('JWT_EMAIL_VERIFICATION_TOKEN_SECRET'),
            });
            // If the token is correct add confirm email to the user
            if (typeof payload === 'object' && 'email' in payload) {
                return await this.authService.activateEmail(payload.email);
            }
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Bad Request' }, HttpStatus.BAD_REQUEST);
        } catch (error) {
            // If token has expire resend email verification link and return message to the user
            if (error?.name === 'TokenExpiredError') {
                // Decode jwt token
                const payload: string | any = this.jwtService.decode(token.token);
                // Check email is exists to database
                const user = await this.authService.checkUserExists(payload.email);
                // Send email
                const message = await this.sendVerificationLink(user.email, user.username);
                // Send status message to the user
                if (message === 'email server error') {
                    throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error' }, HttpStatus.INTERNAL_SERVER_ERROR);
                } else {
                    throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Email confirmation token expired' }, HttpStatus.BAD_REQUEST);
                }
            }
            // Bad request
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Bad confirmation token' }, HttpStatus.BAD_REQUEST);
        }
    }

    async confirmForgotPassword(token: EmailConfirmationDto): Promise<EmailConfirmationDto> {
        try {
            // Verify token 
            const payload = await this.jwtService.verify(token.token, {
                secret: this.configService.get('JWT_FORGOT_PASSWORD_TOKEN_SECRET'),
            });
            // If the token is correct add confirm email to the user
            if (typeof payload === 'object' && 'email' in payload) {
                const newObjectPayload = { email: payload.email, verification: true };
                const token = this.jwtService.sign(newObjectPayload, {
                    secret: this.configService.get('JWT_FORGOT_PASSWORD_TOKEN_SECRET'),
                    expiresIn: this.configService.get('JWT_FORGOT_PASSWORD_TOKEN_EXPIRATION_TIME')
                })
                return { token };
            }
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Bad Request' }, HttpStatus.BAD_REQUEST);
        } catch (error) {
            // Check If token has expire 
            if (error?.name === 'TokenExpiredError') {
                throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Forgot password token expired' }, HttpStatus.BAD_REQUEST);
            }
            // Bad request
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Bad confirmation token' }, HttpStatus.BAD_REQUEST);
        }
    }
}
