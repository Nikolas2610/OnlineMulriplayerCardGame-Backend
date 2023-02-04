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
import { CreateGame } from './models/create-game.interface';
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

    async saveGame(user: User, game: CreateGame, roles: CreateRole[], status: CreateStatus[], teams: CreateTeam[], hand_start_cards: CreateHandStartCards[], decks: Array<number>): Promise<{ message: string }> {
        try {
            // Queries
            const userDB = await this.userRepository.findOne({ where: { id: user.id } });
            const decksGame = await this.deckRepository.createQueryBuilder('decks')
                .where("decks.id IN (:...selectedDecks)", { selectedDecks: decks })
                .getMany();
            // Save the main data of the game
            const gameDB = await this.gameRepository.save(this.setGameValues(game));
            const rolesDB = await this.createRoles(gameDB.extra_roles ? roles : this.defaultRoles);
            // Initialize the relations
            gameDB.roles = rolesDB;
            gameDB.creator = userDB;
            gameDB.deck = decksGame;
            if (gameDB.status_player) {
                gameDB.status = await this.createStatus(status);
            }
            if (gameDB.extra_teams) {
                gameDB.teams = await this.createTeams(teams);
            }
            if (hand_start_cards) {
                gameDB.hand_start_cards = await this.createStartHandCards(hand_start_cards, rolesDB, decksGame);
            }
            // Update game and return data back to the frontend
            await this.gameRepository.save(gameDB);
            return { message: 'Game create successfully' }
        } catch (error) {
            console.log("main");
            console.log(error);
        }
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
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create role" }, HttpStatus.BAD_REQUEST);
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
            console.log('status');
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
            console.log('teams');
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create team" }, HttpStatus.BAD_REQUEST);
        }
    }

    async createStartHandCards(hand_start_cards: CreateHandStartCards[], roles: RolesEntity[], decks: DecksEntity[]): Promise<HandStartCardsEntity[]> {
        try {
            const promises = hand_start_cards.map(async item => {
                const hand_start_cardsDB = new HandStartCardsEntity();
                hand_start_cardsDB.count_cards = item.count_cards;
                hand_start_cardsDB.hidden = item.hidden;
                hand_start_cardsDB.repeat = item.repeat;
                hand_start_cardsDB.deck = decks[item.deck];
                hand_start_cardsDB.role = roles[item.role];
                return await this.handStartCardsRepository.save(hand_start_cardsDB);
            })
            return Promise.all(promises);
        } catch (error) {
            console.log('items');
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
