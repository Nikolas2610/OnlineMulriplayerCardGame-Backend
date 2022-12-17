import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsEntity } from './models/card.entiry';

@Module({
    imports: [TypeOrmModule.forFeature([CardsEntity])]
})
export class CardModule { }
