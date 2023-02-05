import { IsBoolean, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class CreateTable {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    name: string;

    @IsBoolean()
    @IsNotEmpty()
    private: boolean;

    @IsString()
    password: string;

    @IsNotEmpty()
    @IsNumber()
    game: number;
}