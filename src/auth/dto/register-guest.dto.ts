import { IsNotEmpty, IsString } from "class-validator";

export class GuestRegister {
    @IsNotEmpty()
    @IsString()
    username: string;
}