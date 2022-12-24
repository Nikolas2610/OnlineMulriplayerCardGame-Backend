import { Module } from '@nestjs/common';
import { EntitiesModule } from 'src/entities/entities.module';
import { CardService } from './services/card.service';

@Module({
    imports: [EntitiesModule],
    providers: [CardService],
    exports: [CardService, CardModule],

})
export class CardModule { }
