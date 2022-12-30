import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/auth/models/role.enum";

export class User {
    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    isEmailConfirmed: boolean;

    @IsNotEmpty()
    role: Role
}