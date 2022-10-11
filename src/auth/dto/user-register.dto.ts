import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator'

export class UserRegisterDto {
    @MinLength(4)
    @MaxLength(20)
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @MinLength(6)
    @IsNotEmpty()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'password is weak' })
    password: string;
}

