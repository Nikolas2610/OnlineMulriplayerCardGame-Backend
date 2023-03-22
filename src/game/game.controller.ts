import { Body, Controller, Request, Post, Get, Patch } from '@nestjs/common';
import { GamesEntity } from 'src/entities/db/games.entity';
import { GameService } from './game.service';
import { CreateGame } from './models/create-game.dto';
import { GameReturn } from './models/game.return.model';
import { CreateExtraDeck } from './models/relation/create-extra-deck';
import { CreateHandStartCards } from './models/relation/hand-start-cards/create-hand-start-cards.interface';
import { CreateRole } from './models/relation/role/create-role.interface';
import { CreateStatus } from './models/relation/status/create-status.interface';
import { CreateTeam } from './models/relation/team/create-team.interface';

@Controller('game')
export class GameController {
     constructor(private readonly gameService: GameService) { }

     @Post()
     async saveGame(
          @Request() req: any,
          @Body('game') game: CreateGame,
          @Body('decks') decks: Array<number>,
     ): Promise<GamesEntity> {
          return await this.gameService.saveGame(req.user, game, decks);
     }

     @Patch()
     async updateGame(
          @Body('game') game: GamesEntity,
          @Body('decks') decks: Array<number>,
     ) {
          return await this.gameService.updateGame(game, decks)
     }

     @Post('more-settings')
     async saveMoreSettings(
          @Request() req: any,
          @Body('game') game: GamesEntity,
          @Body('status') status: CreateStatus[],
          @Body('teams') teams: CreateTeam[],
          @Body('roles') roles: CreateRole[],
          @Body('extra_decks') extraDecks: CreateExtraDeck[]
     ) {
          return await this.gameService.saveMoreSettings(game, status, teams, roles, extraDecks, req.user);
     }

     @Patch('more-settings')
     async updateMoreSettings(
          @Request() req: any,
          @Body('game') game: GamesEntity,
          @Body('status') status: CreateStatus[],
          @Body('teams') teams: CreateTeam[],
          @Body('roles') roles: CreateRole[],
          @Body('extra_decks') extraDecks: CreateExtraDeck[]
     ) {
          return await this.gameService.updateMoreSettings(game, roles, teams, status, extraDecks, req.user);
     }

     @Post('hand-start-games')
     async saveHandStartGames(
          @Body('game') game: GamesEntity,
          @Body('hand_start_cards') hand_start_cards: CreateHandStartCards[],
     ) {
          return await this.gameService.saveHandStartGames(game, hand_start_cards);
     }

     @Patch('hand-start-games')
     async updateHandStartGame(
          @Body('game') game: GamesEntity,
          @Body('hand_start_cards') hand_start_cards: CreateHandStartCards[],
     ) {
          return await this.gameService.updateHandStartGames(game, hand_start_cards);
     }

     @Get('private-public')
     async getPrivatePublicGames(
          @Request() req: any
     ): Promise<GameReturn[]> {
          return await this.gameService.getPrivatePublicGames(req.user);
     }
}
