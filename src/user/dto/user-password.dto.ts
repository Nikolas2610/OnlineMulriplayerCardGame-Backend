import { MinLength, IsNotEmpty, Matches } from "class-validator";


export class UserPasswords {

    @MinLength(6)
    @IsNotEmpty()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'password is weak' })
    old_password: string;

    @MinLength(6)
    @IsNotEmpty()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
        { message: 'password is weak' })
    new_password: string;
}