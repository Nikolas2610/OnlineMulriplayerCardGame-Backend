import { InjectRepository } from "@nestjs/typeorm";
import { GamesEntity } from "../db/game.entity";
import { faker } from '@faker-js/faker';
import { UsersEntity } from "src/entities/db/user.entity";
import { Repository } from "typeorm";
import { DecksEntity } from "../db/deck.entity";

export class GameSeeder {
    constructor(
        @InjectRepository(GamesEntity)
        private readonly gamesRepository: Repository<GamesEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
        @InjectRepository(DecksEntity)
        private readonly decksRepository: Repository<DecksEntity>
    ) { }

    async addFakeGames(games: number) {
        // Get all users
        const users = await this.usersRepository.find();
        // Get all Decks
        const decks = await this.decksRepository.find();

        for (let index = 1; index < games; index++) {
            try {
                const game = new GamesEntity();
                game.name = faker.internet.userName();
                game.description = faker.lorem.paragraph();
                game.min_players = faker.datatype.number(10);
                game.max_players = faker.datatype.number({
                    min: game.min_players,
                    max: 10
                });
                game.dealer = faker.datatype.boolean();
                game.status_player = faker.datatype.boolean();
                game.rank = faker.datatype.boolean();
                game.grid_cols = faker.datatype.number(5);
                game.grid_rows = faker.datatype.number(5);
                game.private = faker.datatype.boolean();
                game.creator = users[faker.datatype.number({
                    min: 0,
                    max: (users.length - 1)
                })];
                game.deck = [];
                const uniqueNumbers = this.uniqueNumbersArray(0, decks.length - 1);
                uniqueNumbers.forEach(num => game.deck.push(decks[num]));
                await this.gamesRepository.save(game);
            } catch (error) {
                console.log(error);
            }
        }
    }

    uniqueNumbersArray(min: number, max: number) {
        const arr = [];
        while (arr.length < faker.datatype.number({ min: 1, max: 4 })) {
            const r = Math.floor(Math.random() * (max - min + 1)) + min;
            if (arr.indexOf(r) === -1) arr.push(r);
        }
        return arr;
    }
}