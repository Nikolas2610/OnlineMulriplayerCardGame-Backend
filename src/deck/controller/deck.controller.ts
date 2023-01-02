import { Controller, UseGuards, Body, Request, Post, Patch, Delete } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';
import { DecksEntity } from 'src/entities/db/deck.entity';
import { DeleteResult } from 'typeorm';
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

    @Patch()
    async editDeck(
        @Request() req: any,
        @Body() deck: DecksEntity
    ) {
        return await this.deckService.editDeck(req.user, deck);
    }

    @Delete()
    async deleteDeck(
        @Request() req: any,
        @Body('deck_id') deck_id: number
    ) {
        return await this.deckService.deleteDeck(req.user, deck_id)
    }
}
