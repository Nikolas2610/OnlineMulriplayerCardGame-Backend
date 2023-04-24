import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TableUsersEntity } from 'src/entities/db/table_users.entity';
import { EqualOperator, Repository } from 'typeorm';
import { SocketStatus } from '../types/SocketStatus.enum';
import { Server, Socket } from 'socket.io';
import { OnlineTableService } from './online-table.service';

@Injectable()
export class OnlineTableServerService extends OnlineTableService {

  async emitCountUsers(server: Server) {
    const countUsers = await this.getOnlineUsers();
    server.emit('getUsersOnline', countUsers);
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