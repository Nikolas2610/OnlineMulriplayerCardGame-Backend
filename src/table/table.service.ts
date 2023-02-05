import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { GamesEntity } from 'src/entities/db/games.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { Repository } from 'typeorm';
import { CreateTable } from './models/create-table.dto';

@Injectable()
export class TableService {
    constructor(
        @InjectRepository(TablesEntity)
        private readonly tablesRepository: Repository<TablesEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
        @InjectRepository(GamesEntity)
        private readonly gamesRepository: Repository<GamesEntity>,
    ) { }

    async createTable(user: User, table: CreateTable) {
        try {
            // Queries
            const userDB = await this.usersRepository.findOne({ where: { id: user.id } });
            const gameDB = await this.gamesRepository.findOne({ where: { id: table.game } });
            const tableDB = new TablesEntity();
            // Save data
            tableDB.name = table.name;
            tableDB.creator = userDB;
            tableDB.private = table.private
            tableDB.password = table.password ? table.password : null;
            tableDB.game = gameDB;
            // Save table
            await this.tablesRepository.save(tableDB);
            // return message
            return { message: 'Table created successfully' }
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, message: process.env.NODE_ENV === 'development' ? error : "Can't create game" }, HttpStatus.BAD_REQUEST);
        }
    }
}
