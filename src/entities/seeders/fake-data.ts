import { Injectable } from "@nestjs/common";
import { CardSeeder } from "./card.seed";
import { DeckSeeder } from "./deck.seed";
import { GameSeeder } from "./game.seed";
import { UserSeeder } from "./user.seed";

@Injectable()
export class FakeDataSeeder {
    constructor(
        private readonly cardSeeder: CardSeeder,
        private readonly usersSeeder: UserSeeder,
        private readonly deckSeeder: DeckSeeder,
        private readonly gamesSeeder: GameSeeder,
    ) {
        if (process.env.NODE_SEED) {
            this.fillData()
        }
    }

    async fillData() {
        console.log('Add users');
        await this.usersSeeder.fillUsersTable(50)
        console.log('Add cards');
        await this.cardSeeder.addFakeCards(200);
        console.log('Add decks');
        await this.deckSeeder.addFakeDecks(20);
        console.log('Add games');
        await this.gamesSeeder.addFakeGames(50);
        console.log('Fake data add suffesfully');
    }
}