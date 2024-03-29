import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardsEntity } from 'src/entities/db/cards.entity';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { GamesEntity } from 'src/entities/db/games.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { DeleteResult, EqualOperator, Repository, UpdateResult } from 'typeorm';
import { User } from './dto/user.dto';
import * as fs from 'fs';
import { extname } from 'path';
import { EditCardDto } from 'src/card/dto/EditCard.dto';
import * as sharp from 'sharp';
import { TableUsersEntity } from 'src/entities/db/table_users.entity';
import { TablesDecksEntity } from 'src/entities/db/table_decks.entity';
import { TablesCardsEntity } from 'src/entities/db/table_cards.entity';
import { DeckType } from 'src/deck/services/models/DeckType.enum';
import { SocketStatus } from 'src/websockets/types/SocketStatus.enum';
import { hashPassword } from 'src/utils/helper';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(DecksEntity)
    private readonly decksRepository: Repository<DecksEntity>,
    @InjectRepository(GamesEntity)
    private readonly gamesRepository: Repository<GamesEntity>,
    @InjectRepository(TablesEntity)
    private readonly tablesRepository: Repository<TablesEntity>,
    @InjectRepository(CardsEntity)
    private readonly cardsRepository: Repository<CardsEntity>,
    @InjectRepository(TableUsersEntity)
    private readonly tableUsersRepository: Repository<TableUsersEntity>,
    @InjectRepository(TablesDecksEntity)
    private readonly tableDecksRepository: Repository<TablesDecksEntity>,
    @InjectRepository(TablesCardsEntity)
    private readonly tableCardsRepository: Repository<TablesCardsEntity>,
  ) { }

  async getDashboardDetails(): Promise<{ tables: number, games: number, decks: number, cards: number }> {
    const tables = await this.tablesRepository.count();
    const games = await this.gamesRepository.count();
    const decks = await this.decksRepository.count({ where: { type: DeckType.DECK } });
    const cards = await this.cardsRepository.count();
    return { tables, games, decks, cards };
  }

  async findAllUsers() {
    const users = await this.usersRepository.find({
      order: {
        created_at: 'DESC'
      }
    });
    // Remove refresh token 
    Object.values(users).forEach(user => delete user.refresh_token);
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async updateUserDetails(updateAdminDto: User): Promise<UpdateResult> {
    try {
      const { id, username, email, role, email_confirmed } = updateAdminDto;

      return await this.usersRepository.update(id, { username, email, role, email_confirmed });
    } catch (error) {
      if (error.sqlMessage.includes("Duplicate entry")) {
        if (error.sqlMessage.includes("users.IDX_fe0bb3f6520ee0469504521e71")) {
          throw new HttpException(
            { message: 'Username already exists.', status: HttpStatus.CONFLICT },
            HttpStatus.CONFLICT,
          );
        } else if (error.sqlMessage.includes("users.IDX_97672ac88f789774dd47f7c8be")) {
          throw new HttpException(
            { message: 'Email already exists.', status: HttpStatus.CONFLICT },
            HttpStatus.CONFLICT,
          );
        }
      }
      throw new HttpException(
        { message: error.message, status: HttpStatus.BAD_REQUEST },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteUser(userId: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(userId);
  }

  findAllDecks() {
    return this.decksRepository.find({
      where: { type: DeckType.DECK },
      relations: ['cards'],
      order: {
        created_at: 'DESC'
      }
    })
  }

  async editDeck(deck: DecksEntity) {
    const response = await this.decksRepository.save(deck);
    delete response.cards
    return response;
  }

  async deleteDeck(deck_id: number) {
    return await this.decksRepository.delete(deck_id);
  }

  async findAllGames() {
    const games = await this.gamesRepository.find({
      relations: [
        'roles',
        'hand_start_cards',
        'hand_start_cards.role',
        'hand_start_cards.deck',
        'hand_start_cards.toDeck',
        'teams',
        'status',
        'deck'
      ],
      order: {
        created_at: 'DESC'
      }
    });
    return games;
  }

  async findAllTables() {
    return await this.tablesRepository.find({
      relations: ['game'],
      order: {
        created_at: 'DESC'
      }
    });
  }

  async findAllCards() {
    return await this.cardsRepository.find({
      order: {
        created_at: 'DESC'
      }
    });
  }

  async updateTable(table: TablesEntity) {
    try {
      if (table.password) {
        table.password = await hashPassword(table.password);
      }
      await this.tablesRepository.save(table);
      return { message: 'Table updated successfully' }
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error }, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTable(id: number) {
    try {
      await this.tablesRepository.delete(id);
      return { message: 'Table deleted successfully' }
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error }, HttpStatus.BAD_REQUEST);
    }
  }

  async saveImage(image: Express.Multer.File) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(image.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      const compressedImage = await this.compress(image.buffer);
      fs.writeFileSync(`uploads/${filename}`, compressedImage);
      return filename;
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Unable to save the image' }, HttpStatus.BAD_REQUEST);
    }
  }

  async compress(image: Buffer): Promise<Buffer> {
    const options = {
      width: undefined,
      height: 200
    };
    return sharp(image)
      .resize(options)
      .toBuffer();
  }

  async updateCardWithImage(card: EditCardDto, image: Express.Multer.File): Promise<CardsEntity> {
    const cardDB = await this.cardsRepository.findOne({ where: { id: parseInt(card.id) } });
    cardDB.name = card.name;
    cardDB.private = card.private === 'true';
    this.deleteCardImage(cardDB.image);
    cardDB.image = await this.saveImage(image);
    const response = await this.cardsRepository.save(cardDB);
    delete response.creator
    return response;
  }

  async updateCardWithoutImage(card: EditCardDto): Promise<CardsEntity> {
    const cardDB = await this.cardsRepository.findOne({ where: { id: parseInt(card.id) } });
    cardDB.name = card.name;
    cardDB.private = card.private === 'true';
    const response = await this.cardsRepository.save(cardDB);
    delete response.creator
    return response;
  }

  deleteCardImage(image: string) {
    try {
      fs.unlinkSync(`uploads/${image}`);
    } catch (error) {
      console.log("Image not exists to public folder");
    }
  }

  async deleteCard(card_id: number) {
    const query = await this.cardsRepository.findOne({ where: { id: card_id } });
    if (!query) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Card not exists to the database' }, HttpStatus.BAD_REQUEST);
    }
    try {
      const response = await this.cardsRepository.delete({ id: card_id });
      this.deleteCardImage(query.image);
      return response;
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'This card is used to a deck' }, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteTableUsers(id: number) {
    try {
      const users = await this.tableUsersRepository.find({ where: { table: new EqualOperator(id) } });
      const decks = await this.tableDecksRepository.find({ where: { table: new EqualOperator(id) } });

      // Delete cards for each deck
      for (const deck of decks) {
        const cards = await this.tableCardsRepository.find({ where: { table_deck: new EqualOperator(deck.id) } });
        const cardPromises = cards.map(card => this.tableCardsRepository.delete(card.id));
        await Promise.all(cardPromises);
        await this.tableDecksRepository.delete(deck.id);
      }

      // Update users
      const userPromises = users.map(user => {
        user.table = null;
        user.role = null;
        user.status = null;
        user.team = null;
        user.turn = null;
        user.socket_status = SocketStatus.ONLINE
        this.tableUsersRepository.save(user)
      });
      await Promise.all(userPromises);

      return { success: true };
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error }, HttpStatus.BAD_REQUEST);
    }
  }
}
