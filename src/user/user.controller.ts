import { Controller, Get, Body, Patch, Request, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserPasswords } from './dto/user-password.dto';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';
import { CardsEntity } from 'src/entities/db/cards.entity';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { GamesEntity } from 'src/entities/db/games.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
import { Game } from 'src/game/models/game.interface';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Put } from '@nestjs/common/decorators';
import { GameService } from 'src/game/game.service';


@Controller('user')
@UseGuards(JwtGuard, RefreshToken)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly gameService: GameService
  ) { }

  @Get('dashboard')
  getDashboardDetails(@Request() req: any): Promise<{ tables: number, games: number, decks: number, cards: number }> {
    return this.userService.getDashboardDetails(req.user);
  }

  @Patch('edit/username')
  updateUsername(
    @Body('username') username: string,
    @Request() req: any
  ) {
    return this.userService.updateUsername(req.user, username);
  }

  @Patch('edit/password')
  updatePassword(
    @Body() passwords: UserPasswords,
    @Request() req: any
  ): Promise<UpdateResult> {
    return this.userService.updatePassword(req.user, passwords);
  }

  @Get('cards')
  getAllCards(@Request() req: any): Promise<CardsEntity[]> {
    return this.userService.getAllCards(req.user);
  }

  @Get('decks')
  getAllDecks(@Request() req: any): Promise<DecksEntity[]> {
    return this.userService.getAllDecks(req.user);
  }

  // Games Section 
  @Get('games')
  getAllGames(@Request() req: any): Promise<GamesEntity[]> {
    return this.userService.getAllGames(req.user);
  }

  @Delete('games')
  async deleteGame(
    @Request() req: any,
    @Body('game_id') gameId: number
  ): Promise<DeleteResult> {
    try {
      const gameDB = await this.userService.userOwnerOfGame(req.user, gameId);
      if (gameDB?.id) {
        return this.gameService.deleteGame(gameId);
      }
    } catch (error) {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: "You are not the creator of the game" }, HttpStatus.BAD_REQUEST);
    }

  }

  @Get('tables')
  getAllTables(
    @Request() req: any
  ): Promise<TablesEntity[]> {
    return this.userService.getAllTables(req.user);
  }

  @Patch('table')
  async editTable(
    @Body('table') table: TablesEntity,
  ) {
    return this.userService.editTable(table);
  }

  @Delete('table')
  async deleteTable(
    @Body('id') id: number
  ) {
    return this.userService.deleteTable(id);
  }
}
