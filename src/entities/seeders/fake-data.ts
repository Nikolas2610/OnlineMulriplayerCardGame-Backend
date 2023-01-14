import { Injectable } from "@nestjs/common";
import { CardSeeder } from "./card.seed";
import { DeckSeeder } from "./deck.seed";
import { GameSeeder } from "./game.seed";
import { TableSeeder } from "./table.seed";
import { UserSeeder } from "./user.seed";

@Injectable()
export class FakeDataSeeder {
    constructor(
        private readonly cardSeeder: CardSeeder,
        private readonly usersSeeder: UserSeeder,
        private readonly deckSeeder: DeckSeeder,
        private readonly gamesSeeder: GameSeeder,
        private readonly tableSeeder: TableSeeder
    ) {
        if (process.env.NODE_SEED) {
            this.fillData()
        }
    }

    async fillData() {
        await this.usersSeeder.fillUsersTable(50)
        console.log('Add users DONE');
        await this.cardSeeder.addFakeCards(200);
        console.log('Add cards DONE');
        await this.deckSeeder.addFakeDecks(20);
        console.log('Add decks DONE');
        await this.gamesSeeder.addFakeGames(50);
        console.log('Add games DONE');
        await this.tableSeeder.addFakeTables(30);
        console.log('Add tables DONE');
        console.log('Fake data add suffesfully');
    }
}