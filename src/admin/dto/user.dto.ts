import { IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/auth/models/role.enum";

export class User {
    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    @IsString()
    username: string;

    email: string;

    @IsNotEmpty()
    email_confirmed: boolean;

    role: Role
}