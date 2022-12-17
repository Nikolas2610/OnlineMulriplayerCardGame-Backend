import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamesEntity } from './models/game.entity';

@Module({
    imports: [TypeOrmModule.forFeature([GamesEntity])]
})
export class GameModule { }
