import { IsNotEmpty } from "class-validator";
import { CardsEntity } from "src/entities/db/card.entity";

export class CreateDeck {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    private: boolean;

    @IsNotEmpty()
    cards: CardsEntity[];
}