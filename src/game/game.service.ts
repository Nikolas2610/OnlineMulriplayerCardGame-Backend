import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { GamesEntity } from 'src/entities/db/games.entity';
import { HandStartCardsEntity } from 'src/entities/db/hand_start_cards.entity';
import { RolesEntity } from 'src/entities/db/roles.entity';
import { StatusEntity } from 'src/entities/db/status.entity';
import { TeamsEntity } from 'src/entities/db/teams.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { Repository } from 'typeorm';
import { CreateGame } from './models/create-game.dto';
import { GameReturn } from './models/game.return.model';
import { CreateHandStartCards } from './models/relation/hand-start-cards/create-hand-start-cards.interface';
import { CreateRole } from './models/relation/role/create-role.interface';
import { CreateStatus } from './models/relation/status/create-status.interface';
import { CreateTeam } from './models/relation/team/create-team.interface';

@Injectable()
export class GameService {
    private defaultRoles: CreateRole[] = [{ name: 'Table' }, { name: 'Player' }];

    constructor(
        @InjectRepository(GamesEntity)
        private readonly gameRepository: Repository<GamesEntity>,
        @InjectRepository(RolesEntity)
        private readonly roleRepository: Repository<RolesEntity>,
        @InjectRepository(StatusEntity)
        private readonly statusRepository: Repository<StatusEntity>,
        @InjectRepository(UsersEntity)
        private readonly userRepository: Repository<UsersEntity>,
        @InjectRepository(TeamsEntity)
        private readonly teamRepository: Repository<TeamsEntity>,
        @InjectRepository(HandStartCardsEntity)
        private readonly handStartCardsRepository: Repository<HandStartCardsEntity>,
        @InjectRepository(DecksEntity)
        private readonly deckRepository: Repository<DecksEntity>,
    ) { }

    async saveGame(user: User, game: CreateGame, decks: Array<number>): Promise<GamesEntity> {
        try {
            // Queries
            const gameDB = await this.gameRepository.save(this.setGameValues(game));
            const userDB = await this.userRepository.findOne({ where: { id: user.id } });
            const decksGame = await this.findDecks(decks);
            // Set relationships
            gameDB.creator = userDB;
            gameDB.deck = decksGame;
            // Save the main data of the game
            return await this.gameRepository.save(gameDB);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't create game" }, HttpStatus.BAD_REQUEST);
        }
    }

    async saveMoreSettings(game: GamesEntity, status: CreateStatus[], teams: CreateTeam[], roles: CreateRole[]) {
        try {
            game.roles = await this.createRoles(roles);
            game.status = await this.createStatus(status);
            game.teams = await this.createTeams(teams);
            return await this.gameRepository.save(game);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't create role" }, HttpStatus.BAD_REQUEST);
        }
    }

    async saveHandStartGames(game: GamesEntity, hand_start_cards: CreateHandStartCards[]) {
        try {
            game.hand_start_cards = await this.createStartHandCards(hand_start_cards, game);
            await this.gameRepository.save(game);
            return { message: 'Game create successfully' }
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't create rules games" }, HttpStatus.BAD_REQUEST);
        }
    }

    async updateGame(game: GamesEntity, decks: Array<number>) {
        game.deck = await this.findDecks(decks);
        return await this.gameRepository.save(game);
    }

    async updateMoreSettings(game: GamesEntity, roles: CreateRole[], teams: CreateTeam[], status: CreateStatus[]) {
        try {
            await this.deleteRelations(game);
            game.roles = await this.createRoles(roles);
            game.teams = await this.createTeams(teams);
            game.status = await this.createStatus(status);
            return await this.gameRepository.save(game);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't update more settings" }, HttpStatus.BAD_REQUEST);
        }
    }

    async updateHandStartGames(game: GamesEntity, handStartCards: CreateHandStartCards[]) {
        // Delete for the relation
        if (game.hand_start_cards) {
            const rules = game.hand_start_cards;
            game.hand_start_cards = null;
            await this.emptyHandStartCard(rules);
        }
        if (handStartCards) {
            game.hand_start_cards = await this.createStartHandCards(handStartCards, game);
        }
        return await this.gameRepository.save(game);
    }


    async deleteGame(gameId: number) {
        try {
            const game = await this.gameRepository.findOne({
                where: { id: gameId },
                relations: ['roles', 'hand_start_cards', 'teams', 'status', 'deck']
            });
            await this.deleteRelations(game);
            return await this.gameRepository.delete(game.id);
        } catch (error) {
            if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'Game has child rows in the tables table and cannot be deleted.' }, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    async deleteRelations(game: GamesEntity) {
        try {
            const promises = [];
            if (game.hand_start_cards) {
                promises.push(this.emptyHandStartCard(game.hand_start_cards));
            }
            if (game.roles) {
                promises.push(this.emptyRoles(game.roles));
            }
            if (game.teams) {
                promises.push(this.emptyTeams(game.teams));
            }
            if (game.status) {
                promises.push(this.emptyStatus(game.status));
            }
            await Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't delete relations" }, HttpStatus.BAD_REQUEST);
        }
    }

    async emptyStatus(status: StatusEntity[]) {
        try {
            const promises = status.map((item) => {
                return this.statusRepository.delete(item.id);
            });
            await Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't delete status" }, HttpStatus.BAD_REQUEST);
        }
    }

    async emptyTeams(teams: TeamsEntity[]) {
        try {
            const promises = teams.map((item) => {
                return this.teamRepository.delete(item.id);
            });
            await Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't delete team" }, HttpStatus.BAD_REQUEST);
        }
    }

    async emptyRoles(roles: RolesEntity[]) {
        try {
            const promises = roles.map(async (item, index) => {
                const res = await this.roleRepository.delete(item.id);
                return res
            });

            await Promise.all(promises);
        } catch (error) {
            console.error("ERROR")
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't delete role" }, HttpStatus.BAD_REQUEST);
        }
    }

    async emptyHandStartCard(handStartCards: HandStartCardsEntity[]) {
        try {
            const promises = handStartCards.map(async (item, index) => {
                return await this.handStartCardsRepository.delete(item.id);
            });
            await Promise.all(promises);
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    message:
                        process.env.NODE_ENV === 'development'
                            ? error.message
                            : "Can't delete starting card rules",
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async findDecks(decks: Array<number>): Promise<DecksEntity[]> {
        return await this.deckRepository.createQueryBuilder('decks')
            .where("decks.id IN (:...selectedDecks)", { selectedDecks: decks })
            .getMany();
    }

    setGameValues(game: CreateGame): GamesEntity {
        const gameDB = new GamesEntity();
        gameDB.name = game.name;
        gameDB.description = game.description;
        gameDB.min_players = game.min_players;
        gameDB.max_players = game.max_players;
        gameDB.grid_cols = game.grid_cols;
        gameDB.grid_rows = game.grid_rows;
        gameDB.extra_roles = game.extra_roles;
        gameDB.extra_teams = game.extra_teams;
        gameDB.status_player = game.status_player;
        gameDB.rank = game.rank;
        gameDB.private = game.private;
        return gameDB;
    }

    async createRoles(roles: CreateRole[]): Promise<RolesEntity[]> {
        try {
            const promises = roles.map(async (role) => {
                const roleDB = new RolesEntity();
                roleDB.name = role.name;
                return await this.roleRepository.save(roleDB);
            });
            return Promise.all(promises);
        } catch (error) {
            const failedRole = roles.find(
                (role, index) => error[index] instanceof Error,
            );
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    message:
                        process.env.NODE_ENV === 'development'
                            ? error.message
                            : `Can't create role '${failedRole.name}'`,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async createStatus(status: CreateStatus[]): Promise<StatusEntity[]> {
        try {
            const promises = status.map(async (s) => {
                const statusDB = new StatusEntity();
                statusDB.name = s.name;
                return await this.statusRepository.save(statusDB);
            })
            return Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create status" }, HttpStatus.BAD_REQUEST);
        }
    }

    async createTeams(teams: CreateStatus[]): Promise<TeamsEntity[]> {
        try {
            const promises = teams.map(async (team) => {
                const teamDB = new TeamsEntity();
                teamDB.name = team.name;
                return await this.teamRepository.save(teamDB);
            })
            return Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create team" }, HttpStatus.BAD_REQUEST);
        }
    }

    async createStartHandCards(hand_start_cards: CreateHandStartCards[], game: GamesEntity): Promise<HandStartCardsEntity[]> {
        try {
            const promises = hand_start_cards.map(async item => {
                const hand_start_cardsDB = new HandStartCardsEntity();
                hand_start_cardsDB.count_cards = item.count_cards;
                hand_start_cardsDB.hidden = item.hidden;
                hand_start_cardsDB.repeat = item.repeat;
                hand_start_cardsDB.deck = game.deck[item.deck];
                hand_start_cardsDB.role = game.roles[item.role];
                return await this.handStartCardsRepository.save(hand_start_cardsDB);
            })
            return Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't save the starting cards rules" }, HttpStatus.BAD_REQUEST);
        }
    }

    async getPrivatePublicGames(user: User): Promise<GameReturn[]> {
        try {
            const games = await this.gameRepository
                .createQueryBuilder('games')
                .leftJoinAndSelect("games.creator", "user")
                .where("user.id = :userId", { userId: user.id })
                .orWhere("games.private = :private", { private: false })
                .getMany();

            if (games.length === 0) {
                throw new HttpException({ status: HttpStatus.NOT_FOUND, message: 'No games found' }, HttpStatus.NOT_FOUND);
            }
            const modifiedGames = games.map(game => {
                return {
                    id: game.id,
                    name: game.name,
                    private: game.private,
                    creator: game.creator ? game.creator.username : 'Unknown'
                }
            });
            return modifiedGames;
        } catch (error) {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error occurred while fetching games' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
