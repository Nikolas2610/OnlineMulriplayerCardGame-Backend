import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, WsException, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { OnlineTableService } from './online-table.service';
import { Server, Socket } from 'socket.io';
import { Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateTable } from 'src/table/models/create-table.dto';
import { JoinTable } from './dto/JoinTable.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { JwtGuardWebSocket } from '../guards/JwtGuardWebSocket';


@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class OnlineTableGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly onlineTableService: OnlineTableService) { }

  handleConnection(client: any, ...args: any[]) {
    console.log("Client connect: ", client.id);
  }

  afterInit(server: any) {
    // console.log(server);

  }

  handleDisconnect(client: any) {
    // console.log(client);
    console.log("Client disconnected: ", client.id);
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
    const response =  await this.onlineTableService.removeTable(tableId);

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
    const response = await this.onlineTableService.joinTable(data);
    console.log(response);
    
    if (response.error) {
      console.log('\x1b[31m%s\x1b[0m', 'ERROR');
      this.server.to(client.id).emit('error', response.error);
    }
    const user = await this.onlineTableService.getUserById(data.userId);
    
    client.join(data.publicUrl);
    client.to(data.publicUrl).emit('successJoinRoom', { user, room: data.publicUrl});
    
    this.server.emit('addPlayerToTable', response);
    return response;
  }

  @SubscribeMessage('leaveTable')
  async leaveTable(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinTable,
  ) {
    const response = await this.onlineTableService.leaveTable(data.userId, data.tableId);

    const user = await this.onlineTableService.getUserById(data.userId);
    client.to(data.publicUrl).emit('successLeaveRoom', { user, room: data.publicUrl});
    client.leave(data.publicUrl);
    console.log(client.rooms);
    this.server.emit('removePlayerFromTable', response)
    return response;
  }


  @SubscribeMessage('findAllOnlineTable')
  findAll() {
    return this.onlineTableService.findAll();
  }
}
