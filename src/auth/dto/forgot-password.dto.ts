import { IsNotEmpty, MinLength, Matches, IsEmail } from 'class-validator'

export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

