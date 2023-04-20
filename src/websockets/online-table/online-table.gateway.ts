import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsException, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { OnlineTableService } from './online-table.service';
import { Server, Socket } from 'socket.io';
import { Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateTable } from 'src/table/models/create-table.dto';
import { JoinTable } from './dto/JoinTable.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { JwtGuardWebSocket } from '../guards/JwtGuardWebSocket';
import { TableUsersEntity } from 'src/entities/db/table_users.entity';
import { RolesEntity } from 'src/entities/db/roles.entity';
import { TeamsEntity } from 'src/entities/db/teams.entity';
import { StatusEntity } from 'src/entities/db/status.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { TablesCardsEntity } from 'src/entities/db/table_cards.entity';
import { TableStatus } from 'src/table/models/table-status.enum';
import { Message } from './dto/Message.dto';
import { StoreRankRow } from './dto/StoreRankRow.dto';
import { RankEntity } from 'src/entities/db/ranks.entity';


@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class OnlineTableGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly onlineTableService: OnlineTableService) { }

  // ? For debug
  afterInit() {
    setInterval(() => {
      console.log(this.server.sockets.adapter.rooms)
    }, 30000);
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('\x1b[32m%s\x1b[0m', "Client connect: " + client.id);
  }

  async handleDisconnect(client: any) {
    console.log('\x1b[31m%s\x1b[0m', "Client disconnected: " + client.id);
    const response = await this.onlineTableService.disconnectUser(client.id);

    if (response) {
      // Update table online players
      const tableGame = await this.onlineTableService.loadTableGame(response.table?.id);
      // Update players to table
      this.server.emit('getTableUsers', tableGame);
    }
  }

  @SubscribeMessage('createOnlineTable')
  async create(
    @MessageBody('user_id') userId: number,
    @MessageBody('table') table: CreateTable,
  ) {
    const tableDB = await this.onlineTableService.createTable(userId, table);
    if (tableDB) {
      this.server.emit('addNewTable', tableDB);
      return tableDB
    }
  }

  @SubscribeMessage('removeTable')
  async removeTable(
    @MessageBody('tableId') tableId: number,
  ) {
    const response = await this.onlineTableService.removeTable(tableId);

    if (response.affected === 1) {
      this.server.emit('removeOldTable', tableId);
    }
    return response;
  }

  @SubscribeMessage('joinTable')
  // @UseInterceptors(JwtGuardWebSocket)
  async joinTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinTable,
  ) {
    // Get user
    const user = await this.onlineTableService.getUserById(data.userId);
    // Get response
    const response = await this.onlineTableService.joinTable(data, user, client.id);
    // Check for errors
    if (response.error) {
      this.server.to(client.id).emit('error', response.error);
      return response;
    }
    // Add client to socket room
    client.join(data.publicUrl);
    // Load game settings and update players to table
    const tableGame = await this.onlineTableService.loadTableGame(data.tableId);
    this.server.emit('getTableUsers', tableGame);

    return response;
  }

  @SubscribeMessage('leaveTable')
  async leaveTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinTable,
  ) {
    const response = await this.onlineTableService.leaveTable(data.userId, data.tableId);
    // Leave user from the socket room 
    client.leave(data.publicUrl);
    // Update table online players
    const tableGame = await this.onlineTableService.loadTableGame(data.tableId);
    // Update players to table
    this.server.emit('getTableUsers', tableGame);

    return response;
  }

  @SubscribeMessage('findAllOnlineTable')
  async findAll() {
    return await this.onlineTableService.findAll();
  }

  @SubscribeMessage('setTurnTableUsers')
  async setTurnTableUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody('table_users') tableUsers: TableUsersEntity[],
    @MessageBody('room') room: string,
  ) {
    // Update turn table users at database
    const response = await this.onlineTableService.setTurnTableUsers(tableUsers);
    if (response.error) {
      return response
    }
    // Update turn table users at room 
    client.broadcast.to(room).emit('getTurnTableUsers', response);
    return { message: 'success' }
  }

  @SubscribeMessage('setStatusTableUser')
  async setStatusTableUser(
    @MessageBody('status') status: StatusEntity,
    @MessageBody('table_user') tableUser: TableUsersEntity,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.setStatusTableUser(tableUser, status);
    if (response.error) {
      return response
    }
    // Update status at table users at room 
    this.server.to(room).emit('getUpdateTableUser', response);
    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('setTeamTableUser')
  async setTeamTableUser(
    @MessageBody('team') team: TeamsEntity,
    @MessageBody('table_user') tableUser: TableUsersEntity,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.setTeamTableUser(tableUser, team);
    if (response.error) {
      return response
    }
    // Update team at table users at room 
    this.server.to(room).emit('getUpdateTableUser', response);
    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('setRoleTableUser')
  async setRoleTableUser(
    @MessageBody('role') role: RolesEntity,
    @MessageBody('table_user') tableUser: TableUsersEntity,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.setRoleTableUser(tableUser, role);
    if (response.error) {
      return response
    }
    // Update role at table users at room 
    this.server.to(room).emit('getUpdateTableUser', response);
    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('stopGame')
  async startGame(
    @MessageBody('table') table: TablesEntity,
    @MessageBody('room') room: string,
  ) {
    // Remove previous cards if exists
    const response = await this.onlineTableService.eraseDecksAndCards(table);

    // Return the errors
    if (response.error) {
      return response
    }

    // Update table status 
    table.table_decks = [];
    table.status = TableStatus.FINISH;
    
    this.server.to(room).emit('getStartGameDetails', table, []);

    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('leaveGame')
  async leaveGame(
    @MessageBody('table') table: TablesEntity,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.leaveGame(table);
    if (response.error) {
      return response
    }
    this.server.to(room).emit('exitUsersFromTable');

    const roomSockets = await this.server.in(room).fetchSockets();
    for (const socket of roomSockets) {
      socket.leave(room);
    }

    // Update table online players
    const tableGame = await this.onlineTableService.loadTableGame(table.id);
    // Update players to table
    this.server.emit('getTableUsers', tableGame);
  }

  @SubscribeMessage('newGame')
  async newGame(
    @MessageBody('table') table: TablesEntity,
    @MessageBody('room') room: string,
  ) {
    // Remove previous cards if exists
    await this.onlineTableService.eraseDecksAndCards(table);
    // Create Table decks 
    const response = await this.onlineTableService.startGame(table);
    if (response.error) {
      return response
    }
    // Create Cards
    const cards = await this.onlineTableService.createTableCards(table);
    if (cards.error) {
      return response
    }
    // Return the cards
    this.server.to(room).emit('getStartGameDetails', response, cards);

    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('updateCard')
  async updateCard(
    @ConnectedSocket() client: Socket,
    @MessageBody('card') card: TablesCardsEntity,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.updateCard(card);

    if (response.error) {
      return response
    }
    // Return update card
    client.to(room).except(client.id).emit('getUpdateCard', response);

    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('setPlayerPlaying')
  async setPlayerPlaying(
    @MessageBody('table_users') table_users: TableUsersEntity[],
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.setPlayerPlaying(table_users);
    if (response.error) {
      return response
    }
    // Return update card
    this.server.to(room).emit('getTurnTableUsers', response);
    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('updateTableGameStatus')
  async updateTableGameStatus(
    @MessageBody('table') table: TablesEntity,
    @MessageBody('status') status: TableStatus,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.updateTableGameStatus(table, status);
    if (response.error) {
      return response
    }

    // Return update card
    this.server.to(room).emit('getTableGameStatus', response);
    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('showAllCards')
  async showAllCards(
    @MessageBody('room') room: string,
  ) {
    const response = true;
    // Return update card
    this.server.to(room).emit('getShowAllCards', response);
    return { message: 'success', status: 200 }
  }

  @SubscribeMessage('removePlayer')
  async removePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinTable,
  ) {
    const response = await this.onlineTableService.leaveTable(data.userId, data.tableId);
    // Leave user from the socket room 
    this.server.sockets.in(data.publicUrl).socketsLeave(response.socket_id);
    // Update table online players
    const tableGame = await this.onlineTableService.loadTableGame(data.tableId);
    // Update players to table
    this.server.emit('getTableUsers', tableGame);

    return response;
  }

  @SubscribeMessage('validateTablePassword')
  async validateTablePassword(
    @MessageBody('password') password: string,
    @MessageBody('table') table: TablesEntity,
  ) {
    return await this.onlineTableService.validateTablePassword(table, password);
  }

  @SubscribeMessage('setNextPlayer')
  async setNextPlayer(
    @MessageBody('table_users') table_users: TableUsersEntity[],
    @MessageBody('room') room: string,
    @MessageBody('next_player') nextPlayer: boolean,
  ) {
    const response = await this.onlineTableService.setNextPlayer(table_users, nextPlayer);
    if (response.error) {
      return response
    }

    // Return update card
    this.server.to(room).emit('getTurnTableUsers', response);
    return { message: 'success', status: 200 };
  }

  @SubscribeMessage('shuffleDeck')
  async shuffleDeck(
    @MessageBody('table_deck_id') tableDeckId: number,
    @MessageBody('room') room: string,
  ) {
    const response = await this.onlineTableService.shuffleDeck(tableDeckId);

    if (response.error) {
      return response
    }

    this.server.to(room).emit('getShuffleDeck', response, tableDeckId);
    return { message: 'success', status: 200 };
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody('data') data: Message,
  ) {
    const response = { ...data, created_at: new Date() }
    this.server.to(data.room).emit('getSendMessage', response);
    return { message: 'success', status: 200 };
  }

  @SubscribeMessage('storeRankRow')
  async updateRankTable(
    @MessageBody('room') room: string,
    @MessageBody('table_id') tableId: number,
    @MessageBody('row') row: number,
    @MessageBody('data') data: StoreRankRow[]
  ) {
    // Write the rank data
    const response = await this.onlineTableService.updateRankTable(data, tableId);
    // Return the error
    if (response.error) {
      return response
    }
    // Emit event to the users of the room 
    this.server.to(room).emit('getUpdateRankRow', response, row);
    // Return success message
    return { message: 'success', status: 200 };
  }

  @SubscribeMessage('getRankTable')
  async getRankTable(
    @MessageBody('table_id') table_id: number
  ) {
    return await this.onlineTableService.getRankTable(table_id);
  }

  @SubscribeMessage('updateRankRow')
  async updateRankRow(
    @MessageBody('room') room: string,
    @MessageBody('row') row: number,
    @MessageBody('data') data: RankEntity[]
  ) {
    const response = await this.onlineTableService.updateRankRow(data);
    // Return the error
    if (response.error) {
      return response
    }
    // Emit event to the users of the room 
    this.server.to(room).emit('getUpdateRankRow', response, row);

    return { message: 'success', status: 200 };
  }

  @SubscribeMessage('deleteRankRow')
  async deleteRankRow(
    @MessageBody('room') room: string,
    @MessageBody('row') row: number,
    @MessageBody('table_id') table_id: number
  ) {
    const response = await this.onlineTableService.deleteRankRow(row, table_id);
    console.log('\x1b[31m%s\x1b[0m', 'Response');
    console.log(response);
    
    // Return the error
    if (response.error) {
      return response
    }
    // Emit event to the users of the room 
    this.server.to(room).emit('getUpdateRankRow', null, row);
    return { message: 'success', status: 200 };
  }
}
