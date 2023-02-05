import { IsBoolean, IsNotEmpty, IsNumber, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateGame {
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(25)
    @IsString()
    name: string;

    @MaxLength(1000)
    @IsString()
    description: string | null;

    @IsBoolean()
    @IsNotEmpty()
    extra_roles: boolean;

    @IsBoolean()
    @IsNotEmpty()
    extra_teams: boolean;

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

    @Min(0)
    @Max(10)
    @IsNumber()
    @IsNotEmpty()
    min_players: number;

    @IsBoolean()
    @IsNotEmpty()
    private: boolean;

    @IsBoolean()
    @IsNotEmpty()
    rank: boolean;

    @IsBoolean()
    @IsNotEmpty()
    status_player: boolean;
}