import { DecksEntity } from "src/entities/db/decks.entity";
import { GamesEntity } from "src/entities/db/games.entity";
import { TablesDecksEntity } from "src/entities/db/table_decks.entity";
import { TablesEntity } from "src/entities/db/tables.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../../auth/models/role.enum";
import { RankEntity } from "src/entities/db/ranks.entity";
import { TableUsersEntity } from "src/entities/db/table_users.entity";
import { CardsEntity } from "./cards.entity";

@Entity('users')
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, length: 25 })
    username: string;

    @Column({ unique: true, length: 50 })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true })
    refresh_token: string;

    @Column({ default: false })
    email_confirmed: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @OneToMany(() => CardsEntity, (cardsEntity) => cardsEntity.creator)
    cards: CardsEntity

    @OneToMany(() => DecksEntity, (decksEntity) => decksEntity.creator)
    decks: DecksEntity

    @OneToMany(() => GamesEntity, (gamesEntity) => gamesEntity.creator)
    game_id: GamesEntity

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.creator)
    tables: GamesEntity

    @OneToMany(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.user_id)
    table_decks: TablesDecksEntity

    @OneToMany(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.user)
    table_users_id: TableUsersEntity

    @OneToMany(() => RankEntity, (rankEntity) => rankEntity.user_id)
    ranks: RankEntity

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.game_master)
    tables_game_master: TablesEntity
}