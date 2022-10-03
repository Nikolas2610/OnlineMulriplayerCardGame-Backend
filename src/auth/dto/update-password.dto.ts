import { IsNotEmpty, MinLength, Matches, IsJWT } from 'class-validator'

export class UpdatePasswordDto {
    @IsNotEmpty()
    @IsJWT()
    token: string;

    @MinLength(6)
    @IsNotEmpty()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'password is weak' })
    password: string;
}