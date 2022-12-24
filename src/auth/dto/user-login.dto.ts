import { IsNotEmpty, MinLength, Matches, IsEmail } from 'class-validator'

export class UserLoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @MinLength(6)
    @IsNotEmpty()
    password: string;
}

