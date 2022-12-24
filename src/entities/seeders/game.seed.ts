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
    ) {
        // this.addGame();
        // this.addDecksToGame()
        // this.getGame(3);
    }

    async addGame() {
        for (let index = 13; index < 20; index++) {
            const userCreator = await this.usersRepository.findOne({ where: { id: index } });
            if (!userCreator) {
                continue;
            }
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
            game.grid = faker.helpers.arrayElement([
                '1x1', '2x1', '2x2', '3x3', '3x4', '4x4'
            ]);
            game.private = faker.datatype.boolean();
            game.creator = userCreator;
            const response = await this.gamesRepository.save(game);
            console.log(response);
        }
    }

    async addDecksToGame() {
        const deck = await this.decksRepository.findOne({ where: { id: 8 } });
        const game = await this.gamesRepository.findOne({ where: { id: 3 }, relations: ['deck'] });
        game.deck.push(deck);
        const response = await this.gamesRepository.save(game);
        console.log(response);
    }

    async getGame(id: number) {
        const game = await this.gamesRepository.findOne({ where: { id: 3 }, relations: ['deck', 'creator'] });
        console.log(game);
    }
}