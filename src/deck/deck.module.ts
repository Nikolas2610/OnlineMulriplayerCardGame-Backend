import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsEntity } from 'src/entities/db/card.entity';
import { DeckController } from './controller/deck.controller';
import { DecksEntity } from '../entities/db/deck.entity';
// import { SeedDeck } from './seed/deck.seed';
import { DeckService } from './services/deck.service';

@Module({
  imports: [],
  controllers: [DeckController],
  providers: [DeckService]
})
export class DeckModule { }
