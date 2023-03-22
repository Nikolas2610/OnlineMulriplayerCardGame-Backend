import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateTeam {
    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    @MinLength(1)
    name: string;
}