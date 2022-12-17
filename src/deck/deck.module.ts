import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeckController } from './controller/deck/deck.controller';
import { DecksEntity } from './models/deck.entity';
import { DeckService } from './services/deck/deck.service';

@Module({
  imports: [TypeOrmModule.forFeature([DecksEntity])],
  controllers: [DeckController],
  providers: [DeckService]
})
export class DeckModule { }
