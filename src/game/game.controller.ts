import { Body, Controller, Request, Post, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGame } from './models/create-game.interface';
import { GameReturn } from './models/game.return.model';
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
          @Body('status') status: CreateStatus[],
          @Body('teams') teams: CreateTeam[],
          @Body('hand_start_cards') hand_start_cards: CreateHandStartCards[],
          @Body('roles') roles: CreateRole[],
          @Body('decks') decks: Array<number>,
     ): Promise<{ message: string }> {
          return await this.gameService.saveGame(req.user, game, roles, status, teams, hand_start_cards, decks);
     }

     @Get('private-public')
     async getPrivatePublicGames(
          @Request() req: any
     ): Promise<GameReturn[]> {
          return await this.gameService.getPrivatePublicGames(req.user);
     }
}
