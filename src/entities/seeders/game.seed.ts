import { InjectRepository } from "@nestjs/typeorm";
import { GamesEntity } from "../db/games.entity";
import { faker } from '@faker-js/faker';
import { UsersEntity } from "src/entities/db/users.entity";
import { EqualOperator, Repository } from "typeorm";
import { DecksEntity } from "../db/decks.entity";
import { RolesEntity } from "../db/roles.entity";
import { GameStandardRoles } from "src/game/models/game-roles.enum";
import { TeamsEntity } from "../db/teams.entity";
import { StatusEntity } from "../db/status.entity";
import { HandStartCardsEntity } from "../db/hand_start_cards.entity";
import { DeckType } from "src/deck/services/models/DeckType.enum";

export class GameSeeder {
    constructor(
        @InjectRepository(GamesEntity)
        private readonly gamesRepository: Repository<GamesEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
        @InjectRepository(DecksEntity)
        private readonly decksRepository: Repository<DecksEntity>,
        @InjectRepository(RolesEntity)
        private readonly rolesRepository: Repository<RolesEntity>,
        @InjectRepository(TeamsEntity)
        private readonly teamsRepository: Repository<TeamsEntity>,
        @InjectRepository(StatusEntity)
        private readonly statusRepository: Repository<StatusEntity>,
        @InjectRepository(HandStartCardsEntity)
        private readonly handStartCardsRepository: Repository<HandStartCardsEntity>,
    ) {
        // this.getGameWithDecksAndCards(1);
        // this.addFakeGames(5);
        // this.addStarterCardsRules();
    }

    async addFakeGames(games: number) {
        // Get all users
        const users = await this.usersRepository.find();
        // Get all Decks
        const decks = await this.decksRepository.find({ where: { type: DeckType.DECK } });

        for (let index = 1; index < games; index++) {
            try {
                const game = new GamesEntity();
                game.name = faker.internet.userName();
                game.description = faker.lorem.paragraph();
                game.max_players = faker.datatype.number({
                    min: 2,
                    max: 10
                });
                game.extra_roles = faker.datatype.boolean();
                game.status_player = faker.datatype.boolean();
                game.extra_teams = faker.datatype.boolean();
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
                await this.addRoles(game);
                await this.addStatus(game);
                await this.addTeams(game);
                await this.addStarterCardsRules(game);
            } catch (error) {
                console.log(error);
            }
        }
    }

    async addStarterCardsRules(game: GamesEntity) {
        const roles = await this.rolesRepository.find({ where: { game: new EqualOperator(game.id) } });
        roles.forEach(async role => {
            const rule = new HandStartCardsEntity();
            rule.count_cards = 1;
            rule.hidden = role.name === 'table' ? false : true;
            rule.game = game;
            rule.role = role;
            rule.deck = game.deck[0];
            await this.handStartCardsRepository.save(rule);
        })
    }

    async addStatus(game: GamesEntity) {
        if (game.status_player) {
            for (let index = 0; index < 2; index++) {
                this.addStat(faker.name.firstName(), game);
            }
        }
    }

    async addStat(statusName: string, game: GamesEntity) {
        try {
            const status = new StatusEntity();
            status.name = statusName;
            status.game = game;
            // status.description = faker.lorem.sentence();
            await this.statusRepository.save(status);
        } catch (error) {
            console.log(error);
        }
    }

    async addTeams(game: GamesEntity) {
        if (game.extra_teams) {
            for (let index = 0; index < 2; index++) {
                this.addTeam(faker.name.firstName(), game);
            }
        }
    }

    async addTeam(teamName: string, game: GamesEntity) {
        try {
            const team = new TeamsEntity();
            team.name = teamName;
            team.game = game;
            await this.teamsRepository.save(team);
        } catch (error) {
            console.log(error);
        }
    }

    async addRoles(game: GamesEntity) {
        await this.addRole(GameStandardRoles.TABLE, game);
        // TODO: after complete add "game.extra_roles"
        if (false) {
            for (let index = 0; index < 2; index++) {
                await this.addRole(faker.name.firstName(), game);
            }
        } else {
            await this.addRole(GameStandardRoles.PLAYER, game);
        }
    }

    async addRole(roleName: string, game: GamesEntity) {
        try {
            const role = new RolesEntity();
            role.name = roleName;
            // role.max_players = faker.datatype.number(3);
            // role.description = faker.lorem.sentence();
            role.game = game;
            await this.rolesRepository.save(role);
        } catch (error) {
            console.log(error);
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

    async getGame() {
        const game = await this.gamesRepository.findOne({ where: { id: 1 }, relations: ['deck'] });
        console.log(game);
    }

    async getGameWithDecksAndCards(gameId: number) {
        const game = await this.gamesRepository
            .createQueryBuilder('games')
            .leftJoinAndSelect('games.deck', 'deck')
            .leftJoinAndSelect('deck.cards', 'card')
            .where('games.id = :id', { id: gameId })
            .getOne();

        const print = game.deck.map(d => {
            const deck = d.name;
            const cards = d.cards.map(c => c.id);
            return { name: deck, cards }
        })
        console.log(print);
    }
}