import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankEntity } from './models/rank.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RankEntity])]
})
export class RankModule { }
