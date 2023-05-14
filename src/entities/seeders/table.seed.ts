import { InjectRepository } from "@nestjs/typeorm";
import { EqualOperator, Repository } from "typeorm";
import { GamesEntity } from "../db/games.entity";
import { TablesEntity } from "../db/tables.entity";
import { faker } from '@faker-js/faker';
import { UsersEntity } from "../db/users.entity";
import { TableStatus } from "src/table/models/table-status.enum";
import { TableUsersEntity } from "../db/table_users.entity";
import { RolesEntity } from "../db/roles.entity";
import { TablesDecksEntity } from "../db/table_decks.entity";
import { DecksEntity } from "../db/decks.entity";
import { TablesCardsEntity } from "../db/table_cards.entity";
import { v4 as uuidv4 } from 'uuid';

export class TableSeeder {
    constructor(
        @InjectRepository(TablesEntity)
        private readonly tablesRepository: Repository<TablesEntity>,
        @InjectRepository(GamesEntity)
        private readonly gamesRepository: Repository<GamesEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
        @InjectRepository(RolesEntity)
        private readonly rolesRepository: Repository<RolesEntity>,
        @InjectRepository(TableUsersEntity)
        private readonly tableUsersRepository: Repository<TableUsersEntity>,
        @InjectRepository(TablesDecksEntity)
        private readonly tableDecksRepository: Repository<TablesDecksEntity>,
        @InjectRepository(TablesCardsEntity)
        private readonly tableCardsRepository: Repository<TablesCardsEntity>,
    ) {
        // this.addFakeTables(10);
        // this.addUsersToTable();
    }

    async addFakeTables(tables: number) {
        // Get all users
        const users = await this.usersRepository.find();
        const games = await this.gamesRepository.count();

        for (let index = 1; index < tables; index++) {
            try {
                const table = new TablesEntity();
                table.name = faker.internet.userName();
                table.private = faker.datatype.boolean();
                table.password = table.private ? 'tablepass' : '';
                table.status = this.getRandomEnumValue();
                table.public_url = uuidv4();
                table.game = await this.getGameWithDecksAndCards(Math.floor(Math.random() * (games - 1)) + 1);
                table.creator = table.game_master = users[faker.datatype.number({
                    min: 1,
                    max: (users.length - 1)
                })];
                await this.tablesRepository.save(table);
            } catch (error) {
                console.log(error);
            }
        }
    }

    getRandomEnumValue(): TableStatus {
        const enumValues = Object.values(TableStatus);
        const randomIndex = Math.floor(Math.random() * enumValues.length);
        return enumValues[randomIndex];
    }

    async getGameWithDecksAndCards(gameId: number) {
        return await this.gamesRepository
            .createQueryBuilder('games')
            .leftJoinAndSelect('games.deck', 'deck')
            .leftJoinAndSelect('deck.cards', 'card')
            .where('games.id = :id', { id: gameId })
            .getOne();
    }



}