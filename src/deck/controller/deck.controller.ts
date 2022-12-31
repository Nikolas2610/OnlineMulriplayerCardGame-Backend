import { Controller, UseGuards, Body, Request, Post } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';
import { DecksEntity } from 'src/entities/db/deck.entity';
import { CreateDeck } from '../dto/CreateDeck.dto';
import { DeckService } from '../services/deck.service';

@Controller('deck')
@UseGuards(JwtGuard, RefreshToken)
export class DeckController {
    constructor(private readonly deckService: DeckService) { }

    @Post()
    async createDeck(
        @Request() req: any,
        @Body() deck: CreateDeck
    ): Promise<DecksEntity> {
        return await this.deckService.createDeck(req.user, deck);
    }
}
