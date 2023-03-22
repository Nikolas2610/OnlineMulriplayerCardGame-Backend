import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator";
import { HandStartCardsRuleType } from "./HandStartCardsRuleType.enum";

export class CreateHandStartCards {
    @IsNotEmpty()
    @IsNumber()
    count_cards: number;

    @IsNotEmpty()
    @IsNumber()
    deck: number;

    @IsNotEmpty()
    @IsNumber()
    role: number | null;

    @IsNotEmpty()
    @IsBoolean()
    hidden: boolean;

    @IsNotEmpty()
    type: HandStartCardsRuleType

    @IsNotEmpty()
    @IsNumber()
    toDeck: number | null;
}