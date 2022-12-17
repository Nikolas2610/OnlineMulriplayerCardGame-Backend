import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TablesDecksEntity } from './models/table_deck.entity';
import { TablesEntity } from './models/table.entity';
import { TablesCardsEntity } from './models/table_cards.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TablesEntity, TablesDecksEntity, TablesCardsEntity])]
})
export class TableModule { }
