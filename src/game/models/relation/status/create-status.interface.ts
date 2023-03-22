import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateStatus {
    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    @MinLength(1)
    name: string;
}