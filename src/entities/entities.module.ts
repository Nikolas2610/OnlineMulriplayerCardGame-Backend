import { Module } from '@nestjs/common';
import { NestApplicationContext } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/services/auth.service';
import { UsersEntity } from 'src/entities/db/user.entity';
import { CardsEntity } from './db/card.entity';
import { DecksEntity } from './db/deck.entity';
import { GamesEntity } from './db/game.entity';
import { HandStartCardsEntity } from './db/hand_start_cards.entity';
import { RankEntity } from './db/rank.entity';
import { RolesEntity } from './db/role.entity';
import { StatusEntity } from './db/status.entity';
import { TablesEntity } from './db/table.entity';
import { TablesCardsEntity } from './db/table_cards.entity';
import { TablesDecksEntity } from './db/table_deck.entity';
import { TableUsersEntity } from './db/table_users.entity';
import { CardSeeder } from './seeders/card.seed';
import { DeckSeeder } from './seeders/deck.seed';
import { FakeDataSeeder } from './seeders/fake-data';
import { GameSeeder } from './seeders/game.seed';
import { RoleSeeder } from './seeders/role.seed';
import { UserSeeder } from './seeders/user.seed';

@Module({
    imports: [TypeOrmModule.forFeature([
        CardsEntity,
        TablesEntity,
        TablesDecksEntity,
        TablesCardsEntity,
        DecksEntity,
        GamesEntity,
        HandStartCardsEntity,
        RankEntity,
        RolesEntity,
        UsersEntity,
        TableUsersEntity,
        StatusEntity,
        UsersEntity
    ])],
    providers: [DeckSeeder, CardSeeder, GameSeeder, RoleSeeder, UserSeeder, FakeDataSeeder],
    exports: [TypeOrmModule, UserSeeder]
})
export class EntitiesModule { }
