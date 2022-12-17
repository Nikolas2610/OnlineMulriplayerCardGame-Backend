import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandStartCardsEntity } from './models/hand_start_cards.entity';

@Module({
    imports: [TypeOrmModule.forFeature([HandStartCardsEntity])]
})
export class HandStartCardsModule { }
