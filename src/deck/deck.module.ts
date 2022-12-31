import { Module } from '@nestjs/common';
import { DeckController } from './controller/deck.controller';
import { DeckService } from './services/deck.service';
import { EntitiesModule } from 'src/entities/entities.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [EntitiesModule],
  controllers: [DeckController],
  providers: [DeckService, JwtService]
})
export class DeckModule { }
