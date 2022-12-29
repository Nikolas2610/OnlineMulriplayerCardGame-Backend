import { Module } from '@nestjs/common';
import { EntitiesModule } from 'src/entities/entities.module';
import { CardController } from './controller/card.controller';
import { CardService } from './services/card.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [EntitiesModule],
    controllers: [CardController],
    providers: [CardService, JwtService],
    exports: [CardService, CardModule],

})
export class CardModule { }
