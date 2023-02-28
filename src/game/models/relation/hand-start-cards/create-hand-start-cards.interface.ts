import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";

export class CreateHandStartCards {
    @IsNotEmpty()
    @IsNumber()
    count_cards: number;

    @IsNotEmpty()
    @IsNumber()
    deck: number;

    @IsNotEmpty()
    @IsNumber()
    role: number;

    @IsNotEmpty()
    @IsBoolean()
    hidden: boolean;

    @IsNotEmpty()
    @IsNumber()
    repeat: number;
}