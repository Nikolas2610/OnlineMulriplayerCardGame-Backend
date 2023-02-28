import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateRole {
    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    @MinLength(3)
    name: string;
}