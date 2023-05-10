import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TableUsersEntity } from 'src/entities/db/table_users.entity';
import { EqualOperator, Repository } from 'typeorm';
import { SocketStatus } from '../types/SocketStatus.enum';
import { Server, Socket } from 'socket.io';
import { OnlineTableService } from './online-table.service';
import { TableStatus } from 'src/table/models/table-status.enum';

@Injectable()
export class OnlineTableServerService extends OnlineTableService {

  async emitCountUsers(server: Server) {
    const countUsers = await this.getOnlineUsers();
    server.emit('getUsersOnline', countUsers);
  }

  async emitUpdateTableToLobby(server: Server, tableId: number) {
    try {
      const table = await this.findOneTable(tableId);
      table.table_users.sort((a: TableUsersEntity, b: TableUsersEntity) => a.turn - b.turn);
      server.emit('getUpdateTable', table);
    } catch (error) {
      return error;
    }
  }

  async findOneTable(tableId: number) {
    try {
      return await this.tablesRepository.findOne(
        {
          where: { id: new EqualOperator(tableId) },
          relations: [
            'game',
            'creator',
            'table_users',
            'game_master',
            'game.deck',
            'game.deck.cards',
          ]
        }
      );
    } catch (error) {
      return error
    }
  }

  async getOnlineUsers() {
    try {
      const countOnlineUsers = await this.tableUsersRepository.count({ where: [{ socket_status: SocketStatus.ONLINE }, { socket_status: SocketStatus.LEAVE }] });
      const countInRoomUsers = await this.tableUsersRepository.count({ where: { socket_status: SocketStatus.ROOM } });
      return { countOnlineUsers, countInRoomUsers }
    } catch (error) {
      return error
    }
  }
}