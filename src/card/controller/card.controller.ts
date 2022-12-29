import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';
import { CardsEntity } from 'src/entities/db/card.entity';
import { CardService } from '../services/card.service';

@Controller('card')
@UseGuards(JwtGuard, RefreshToken)
export class CardController {
    constructor(private readonly cardService: CardService) { }

    @Get('public')
    async getPublicCards(): Promise<CardsEntity[]> {
        return await this.cardService.getPublicCards();
    }

    @Get('user')
    async getUserCards(@Request() req: any): Promise<CardsEntity[]> {
        return await this.cardService.getUserCards(req.user);
    }
}
