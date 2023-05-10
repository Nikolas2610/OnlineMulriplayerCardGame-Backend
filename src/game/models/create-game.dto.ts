import { IsBoolean, IsEmpty, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateGame {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(25)
    @IsString()
    name: string;

    @MaxLength(1000)
    @IsString()
    description: string | null;

    @Min(0)
    @Max(10)
    @IsNumber()
    @IsNotEmpty()
    grid_rows: number;

    @Min(0)
    @Max(10)
    @IsNumber()
    @IsNotEmpty()
    grid_cols: number;

    @Min(0)
    @Max(10)
    @IsNumber()
    @IsNotEmpty()
    max_players: number;

    @IsBoolean()
    @IsNotEmpty()
    private: boolean;

    @IsBoolean()
    @IsNotEmpty()
    auto_turn: boolean;
}