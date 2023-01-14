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
  ) { }

  async getDashboardDetails(): Promise<{ tables: number, games: number, decks: number, cards: number }> {
    const tables = await this.tablesRepository.count();
    const games = await this.gamesRepository.count();
    const decks = await this.decksRepository.count();
    const cards = await this.cardsRepository.count();
    return { tables, games, decks, cards };
  }

  async findAllUsers() {
    const users = await this.usersRepository.find();
    // Remove refresh token 
    Object.values(users).forEach(user => delete user.refresh_token);
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} admin`;
  }

  async updateUserDetails(updateAdminDto: User): Promise<UpdateResult> {
    const { id, username, email, role, email_confirmed } = updateAdminDto;
    // TODO: check the email confirm type
    return await this.usersRepository.update(id, { username, email, role, email_confirmed });
  }

  async deleteUser(userId: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(userId);
  }

  findAllDecks() {
    return this.decksRepository.find({ relations: ['cards'] })
  }

  async editDeck(deck: DecksEntity) {
    const response = await this.decksRepository.save(deck);
    delete response.cards
    return response;
  }

  async deleteDeck(deck_id: number) {
    return await this.decksRepository.delete(deck_id);
  }

  findAllGames() {
    return this.gamesRepository.find();
  }

  findAllTables() {
    return this.tablesRepository.find();
  }

  findAllCards() {
    return this.cardsRepository.find();
  }

  async saveImage(image: Express.Multer.File) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(image.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      fs.writeFileSync(`uploads/${filename}`, image.buffer);
      return filename;
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Unable to save the image' }, HttpStatus.BAD_REQUEST);
    }
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
}
