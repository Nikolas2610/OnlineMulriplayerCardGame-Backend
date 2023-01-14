import { Module } from '@nestjs/common';
import { NestApplicationContext } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/services/auth.service';
import { UsersEntity } from 'src/entities/db/users.entity';
import { CardsEntity } from './db/cards.entity';
import { DecksEntity } from './db/decks.entity';
import { GamesEntity } from './db/games.entity';
import { HandStartCardsEntity } from './db/hand_start_cards.entity';
import { RankEntity } from './db/ranks.entity';
import { RolesEntity } from './db/roles.entity';
import { StatusEntity } from './db/status.entity';
import { TablesEntity } from './db/tables.entity';
import { TablesCardsEntity } from './db/table_cards.entity';
import { TablesDecksEntity } from './db/table_decks.entity';
import { TableUsersEntity } from './db/table_users.entity';
import { TeamsEntity } from './db/teams.entity';
import { CardSeeder } from './seeders/card.seed';
import { DeckSeeder } from './seeders/deck.seed';
import { FakeDataSeeder } from './seeders/fake-data';
import { GameSeeder } from './seeders/game.seed';
import { RoleSeeder } from './seeders/role.seed';
import { TableSeeder } from './seeders/table.seed';
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
        UsersEntity, 
        TeamsEntity
    ])],
    providers: [DeckSeeder, CardSeeder, GameSeeder, RoleSeeder, UserSeeder, FakeDataSeeder, TableSeeder],
    exports: [TypeOrmModule, UserSeeder]
})
export class EntitiesModule { }
