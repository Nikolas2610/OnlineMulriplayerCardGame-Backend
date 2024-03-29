import { Controller, UseGuards, Body, Request, Post, Patch, Delete, Get } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { DeleteResult } from 'typeorm';
import { CreateDeck } from '../dto/CreateDeck.dto';
import { DeckService } from '../services/deck.service';
import { DeckReturn } from '../services/models/deck.return.model';

@Controller('deck')
@UseGuards(JwtGuard, RefreshToken)
export class DeckController {
    constructor(private readonly deckService: DeckService) { }

    @Get('/private-public')
    async getPrivatePublicDecks(
        @Request() req: any,
    ): Promise<DeckReturn[]> {
        return await this.deckService.getPrivatePublicDecks(req.user)
    }

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
