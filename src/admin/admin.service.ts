import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { where } from '@tensorflow/tfjs';
import { CardsEntity } from 'src/entities/db/card.entity';
import { DecksEntity } from 'src/entities/db/deck.entity';
import { GamesEntity } from 'src/entities/db/game.entity';
import { TablesEntity } from 'src/entities/db/table.entity';
import { UsersEntity } from 'src/entities/db/user.entity';
import { UserService } from 'src/user/user.service';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { User } from './dto/user.dto';

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
    const { id, username, email, role, isEmailConfirmed } = updateAdminDto;
    // TODO: check the email confirm type
    return await this.usersRepository.update(id, { username, email, role, isEmailConfirmed });
  }

  async deleteUser(userId: number): Promise<DeleteResult> {
    return await this.usersRepository.delete(userId);
  }

  findAllDecks() {
    return this.decksRepository.find()
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
}
