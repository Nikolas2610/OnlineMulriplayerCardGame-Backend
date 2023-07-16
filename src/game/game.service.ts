import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { DeckType } from 'src/deck/services/models/DeckType.enum';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { GamesEntity } from 'src/entities/db/games.entity';
import { HandStartCardsEntity } from 'src/entities/db/hand_start_cards.entity';
import { RolesEntity } from 'src/entities/db/roles.entity';
import { StatusEntity } from 'src/entities/db/status.entity';
import { TeamsEntity } from 'src/entities/db/teams.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { EqualOperator, Repository } from 'typeorm';
import { CreateGame } from './models/create-game.dto';
import { GameReturn } from './models/game.return.model';
import { CreateExtraDeck } from './models/relation/create-extra-deck';
import { CreateHandStartCards } from './models/relation/hand-start-cards/create-hand-start-cards.interface';
import { HandStartCardsRuleType } from './models/relation/hand-start-cards/HandStartCardsRuleType.enum';
import { CreateRole } from './models/relation/role/create-role.interface';
import { CreateStatus } from './models/relation/status/create-status.interface';
import { CreateTeam } from './models/relation/team/create-team.interface';

@Injectable()
export class GameService {

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

    async saveMoreSettings(game: GamesEntity, status: CreateStatus[], teams: CreateTeam[], roles: CreateRole[], extraDecks: CreateExtraDeck[], user: User) {
        try {
            game.roles = await this.createRoles(roles);
            game.status = await this.createStatus(status);
            game.teams = await this.createTeams(teams);
            if (extraDecks.length > 0) {
                const extraDecksDBResults = await Promise.all(await this.createExtraDecks(extraDecks, user));
                if (!game.deck) {
                    game.deck = [];
                }
                extraDecksDBResults.forEach(extraDecksDB => {
                    game.deck.push(extraDecksDB);
                });
            }
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

    async updateMoreSettings(game: GamesEntity, roles: CreateRole[], teams: CreateTeam[], status: CreateStatus[], extraDecks: CreateExtraDeck[], user: User) {
        try {
            // Delete game relations
            await this.deleteRelations(game);
            // Get the new game
            const gameDB = await this.gameRepository.findOne({
                where: { id: new EqualOperator(game.id) },
                relations: ['deck']
            });
            // Update the game
            return await this.saveMoreSettings(gameDB, status, teams, roles, extraDecks, user);
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
                throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: 'This game is in used from a table' }, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    async deleteRelations(game: GamesEntity) {
        try {
            const promises = [];
            if (game.hand_start_cards) {
                promises.push(await this.emptyHandStartCard(game.hand_start_cards));
            }
            promises.push(await this.emptyExtraDecks(game.deck))
            if (game.roles) {
                promises.push(await this.emptyRoles(game.roles));
            }
            if (game.teams) {
                promises.push(await this.emptyTeams(game.teams));
            }
            if (game.status) {
                promises.push(await this.emptyStatus(game.status));
            }
            await Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't delete relations" }, HttpStatus.BAD_REQUEST);
        }
    }

    async emptyExtraDecks(decks: DecksEntity[]) {
        try {
            const deletePromises = decks
                .filter(deck => deck.type === DeckType.EXTRA_DECK)
                .map(deck => this.deckRepository.delete(deck.id));
            await Promise.all(deletePromises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error.message : "Can't delete extra decks" }, HttpStatus.BAD_REQUEST);
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
        gameDB.max_players = game.max_players;
        gameDB.grid_cols = game.grid_cols;
        gameDB.grid_rows = game.grid_rows;
        gameDB.auto_turn = game.auto_turn;
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

    async createExtraDecks(extraDecks: CreateExtraDeck[], user: User): Promise<DecksEntity[]> {
        try {
            const userDB = await this.userRepository.findOne({ where: { id: user.id } })
            const promises = extraDecks.map(async (deck) => {
                const deckDB = new DecksEntity();
                deckDB.name = deck.name;
                deckDB.type = DeckType.EXTRA_DECK;
                deckDB.creator = userDB;
                deckDB.private = true;
                return await this.deckRepository.save(deckDB);
            })
            return Promise.all(promises);
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create extra decks" }, HttpStatus.BAD_REQUEST);
        }
    }

    async createStartHandCards(hand_start_cards: CreateHandStartCards[], game: GamesEntity): Promise<HandStartCardsEntity[]> {
        try {
            const promises = hand_start_cards.map(async rule => {
                const hand_start_cardsDB = new HandStartCardsEntity();
                // Different settings for each hand start cards rule
                if (rule.type === HandStartCardsRuleType.ROLE) {
                    hand_start_cardsDB.role = game.roles.find(role => role.id === rule.role);
                    hand_start_cardsDB.toDeck = null;
                } else {
                    hand_start_cardsDB.role = null;
                    hand_start_cardsDB.toDeck = game.deck.find(deck => deck.id === rule.toDeck);
                }
                // Default settings for each hand start cards rule
                hand_start_cardsDB.deck = game.deck.find(deck => deck.id === rule.deck);
                hand_start_cardsDB.type = rule.type;
                hand_start_cardsDB.count_cards = rule.count_cards;
                hand_start_cardsDB.hidden = rule.hidden;
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
            .orderBy("games.created_at", "DESC") 
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
