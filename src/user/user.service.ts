import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { table } from 'console';
import { User } from 'src/admin/dto/user.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { CardsEntity } from 'src/entities/db/cards.entity';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { GamesEntity } from 'src/entities/db/games.entity';
import { HandStartCardsEntity } from 'src/entities/db/hand_start_cards.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { Game } from 'src/game/models/game.interface';
import { DeleteResult, EqualOperator, Repository, UpdateResult } from 'typeorm';
import { UserPasswords } from './dto/user-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
    @InjectRepository(GamesEntity)
    private readonly gamesRepository: Repository<GamesEntity>,
    @InjectRepository(TablesEntity)
    private readonly tablesRepository: Repository<TablesEntity>,
    @InjectRepository(HandStartCardsEntity)
    private readonly handStartCardsRepository: Repository<HandStartCardsEntity>
  ) { }

  async getDashboardDetails(user: User): Promise<{ tables: number, games: number, decks: number, cards: number }> {
    const tables = await this.tablesRepository.count({ where: { creator: new EqualOperator(user.id) } });
    const games = await this.gamesRepository.count({ where: { creator: new EqualOperator(user.id) } });
    const decks = await this.decksRepository.count({ where: { creator: new EqualOperator(user.id) } });
    const cards = await this.cardsRepository.count({ where: { creator: new EqualOperator(user.id) } });
    return { tables, games, decks, cards };
  }

  async updateUsername(user: User, username: string): Promise<{ token: string }> {
    const response = await this.usersRepository.update(user.id, { username });
    if (response.affected === 1) {
      user.username = username;
      const token = await this.jwtService.signAsync(
        { user },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRATION_TIME
        })
      return { token };
    } else {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Bad request' }, HttpStatus.BAD_REQUEST);
    }
  }

  async updatePassword(user: User, password: UserPasswords): Promise<UpdateResult> {
    const userExists = await this.authService.validateUser(user.email, password.old_password);
    if (!userExists) {
      throw new HttpException({ status: HttpStatus.UNAUTHORIZED, error: 'User does not exist' }, HttpStatus.UNAUTHORIZED);
    }
    const newPassowrd = await this.authService.hashPassword(password.new_password);
    return await this.usersRepository.update(user.id, { password: newPassowrd });
  }

  // Games Section
  async getAllCards(user: User): Promise<CardsEntity[]> {
    return await this.cardsRepository.find(
      {
        where: { creator: new EqualOperator(user.id) },
      });
  }

  async editGame(user: User, game: Game): Promise<UpdateResult> {
    const query = await this.userOwnerOfGame(user, game.id);
    if (!query) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Game not exists with this user' }, HttpStatus.BAD_REQUEST);
    }
    return await this.gamesRepository.update({ id: game.id }, game);
  }

  async deleteGame(user: User, game_id: number): Promise<DeleteResult> {
    const query = await this.userOwnerOfGame(user, game_id);
    if (!query) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Game not exists with this user' }, HttpStatus.BAD_REQUEST);
    }
    return await this.gamesRepository.delete({ id: game_id });
  }

  async userOwnerOfGame(user: User, game_id: number): Promise<GamesEntity> {
    return this.gamesRepository.findOne(
      {
        where: { id: game_id, creator: new EqualOperator(user.id) },
        relations: ['creator']
      });
  }

  async getAllDecks(user: User): Promise<DecksEntity[]> {
    return await this.decksRepository.find(
      {
        where: { creator: new EqualOperator(user.id) },
        relations: ['cards']
      }
    )
  }

  async getAllGames(user: User): Promise<GamesEntity[]> {
    const games = await this.gamesRepository.find(
      {
        where: { creator: new EqualOperator(user.id) },
        relations: ['roles', 'hand_start_cards', 'hand_start_cards.role', 'hand_start_cards.deck', 'teams', 'status', 'deck']
      }
    )
    return games;
  }

  async getAllTables(user: User): Promise<TablesEntity[]> {
    return await this.tablesRepository.find(
      {
        where: { creator: new EqualOperator(user.id) },
        relations: ['game']
      }
    )
  }

  async editTable(table: TablesEntity): Promise<{ message: string }> {
    try {
      await this.tablesRepository.save(table);
      return { message: 'Table updated successfully' }
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error }, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTable(id: number): Promise<{ message: string }> {
    try {
      await this.tablesRepository.delete(id);
      return { message: 'Table deleted successfully' }
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error }, HttpStatus.BAD_REQUEST);
    }
  }
}
