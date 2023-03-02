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
        @InjectRepository(DecksEntity)
        private readonly decksRepository: Repository<DecksEntity>,
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
                table.game = await this.getGameWithDecksAndCards(Math.floor(Math.random() * (games - 1)) + 1);
                table.creator = table.game_master = users[faker.datatype.number({
                    min: 1,
                    max: (users.length - 1)
                })];
                await this.tablesRepository.save(table);
                await this.addUsersToTable(table);
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

    async addUsersToTable(table: TablesEntity) {
        const users = await this.usersRepository.find();
        const onlineUsersArray = this.uniqueNumbersArray(1, users.length);
        const rolePlayer = await this.rolesRepository.findOne({ where: { game: new EqualOperator(table.game.id), name: 'player' } })
        let counter = 1;
        onlineUsersArray.forEach(async num => {
            try {
                // Add user to table
                const userTable = new TableUsersEntity();
                userTable.role = rolePlayer;
                userTable.user = users[num];
                userTable.status = 'active'
                userTable.table = table;
                userTable.team = null;
                userTable.turn = counter;
                userTable.playing = true;
                counter++;
                await this.tableUsersRepository.save(userTable);
                // Create deck for the user
                const userDeck = new TablesDecksEntity();
                userDeck.user_id = users[num];
                userDeck.table_id = table;
                await this.tableDecksRepository.save(userDeck);
            } catch (error) {
                console.log(error);
            }
        })
        this.addDecksTable(table);
    }

    async addDecksTable(table: TablesEntity) {
        try {
            const game = await this.getGameWithDecksAndCards(table.game.id);
            // Add Empty Deck
            const tableDeck = new TablesDecksEntity();
            tableDeck.table_id = table;
            await this.tableDecksRepository.save(tableDeck);
            // Add deck cards to table
            const deck = new TablesDecksEntity();
            deck.table_id = table;
            deck.deck = game.deck[0];
            const saveDeck = await this.tableDecksRepository.save(deck);
            // Add Available cards to table
            this.addCardsToTable(saveDeck, game.deck[0]);
        } catch (error) {
            console.log(error);
        }
    }

    async addCardsToTable(tableMainDeck: TablesDecksEntity, deck: DecksEntity) {
        try {
            deck.cards.forEach(async card => {
                const deckCard = new TablesCardsEntity();
                deckCard.hidden = true;
                deckCard.rotate = 0;
                deckCard.table_deck_id = tableMainDeck;
                deckCard.card_id = card;
                await this.tableCardsRepository.save(deckCard);
            })
        } catch (error) {
            console.log(error);
        }
    }

    uniqueNumbersArray(min: number, max: number) {
        const arr = [];
        while (arr.length < 4) {
            const r = Math.floor(Math.random() * (max - min + 1)) + min;
            if (arr.indexOf(r) === -1) arr.push(r);
        }
        return arr;
    }

}