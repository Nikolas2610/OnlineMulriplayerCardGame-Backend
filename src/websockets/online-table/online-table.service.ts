import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets/errors';
import { GamesEntity } from 'src/entities/db/games.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { TableUsersEntity } from 'src/entities/db/table_users.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { CreateTable } from 'src/table/models/create-table.dto';
import { TableStatus } from 'src/table/models/table-status.enum';
import { DeleteResult, EqualOperator, Repository } from 'typeorm';
import { JoinTable } from './dto/JoinTable.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OnlineTableService {

  constructor(
    @InjectRepository(TablesEntity)
    private readonly tablesRepository: Repository<TablesEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(GamesEntity)
    private readonly gamesRepository: Repository<GamesEntity>,
    @InjectRepository(TableUsersEntity)
    private readonly tableUsersRepository: Repository<TableUsersEntity>,
  ) { }

  async createTable(userId: number, table: CreateTable) {
    try {
      // Queries
      const userDB = await this.usersRepository.findOne({ where: { id: userId } });
      const gameDB = await this.gamesRepository.findOne({ where: { id: table.game } });
      const tableDB = new TablesEntity();
      // Save data
      tableDB.name = table.name;
      tableDB.creator = tableDB.game_master = userDB;
      tableDB.private = table.private
      tableDB.password = table.password ? table.password : null;
      tableDB.game = gameDB;
      tableDB.public_url = uuidv4();

      // return new table
      return await this.tablesRepository.save(tableDB);
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create game" }, HttpStatus.BAD_REQUEST);
    }
  }

  async removeTable(tableId: number): Promise<DeleteResult> {
    try {
      return await this.tablesRepository.delete(tableId);
    } catch (error) {
      return error
    }
  }

  async findAll() {
    return await this.tablesRepository.find(
      {
        where: { status: TableStatus.WAITING },
        relations: ['game', 'creator', 'table_users', 'game_master'],
        order: {
          created_at: 'DESC'
        }
      }
    )
  }

  async joinTable(data: JoinTable) {
    try {
      // Get User
      const user = await this.getUserById(data.userId);
      // Set the the data for the table user
      const tableUsers = new TableUsersEntity();
      tableUsers.table = await this.findTable(data.tableId, data.publicUrl);
      tableUsers.user = user
      tableUsers.playing = false;
      // Save and return the user
      return this.tableUsersRepository.save(tableUsers);
    } catch (error) {
      return error
    }
  }

  async leaveTable(userId: number, tableId: number) {
    try {
      // Get table user
      const tableUser = await this.tableUsersRepository.findOne({
        where: { user: new EqualOperator(userId), table: new EqualOperator(tableId) },
        relations: ['table']
      });
      // Delete table user
      const response = await this.tableUsersRepository.delete(tableUser.id);
      // Return the response
      if (response.affected === 1) {
        return tableUser;
      } else {
        return response;
      }
    } catch (error) {
      return error
    }
  }

  async findTable(id: number, public_url: string): Promise<TablesEntity> {
    try {
      const table = await this.tablesRepository.findOne({
        where: {
          id, public_url
        }
      })
      if (table) {
        return table;
      }
      throw new WsException("Cant't find table with these credentials");
    } catch (error) {
      throw new WsException("Cant't find table with these credentials");
    }
  }

  async getUserById(userId: number): Promise<UsersEntity> {
    try {
      return await this.usersRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "User not exists" }, HttpStatus.BAD_REQUEST);
    }
  }
}
