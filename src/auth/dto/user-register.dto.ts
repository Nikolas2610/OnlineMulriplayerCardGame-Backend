import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator'

export class UserRegisterDto {
    @MinLength(4)
    @MaxLength(20)
    @IsNotEmpty()
    @IsString()
    firstname: string;
    
    @MinLength(4)
    @MaxLength(20)
    @IsNotEmpty()
    @IsString()
    lastname: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @MinLength(6)
    @IsNotEmpty()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'password is weak' })
    password: string;
}

