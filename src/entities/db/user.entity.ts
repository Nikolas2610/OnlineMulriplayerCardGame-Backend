import { DecksEntity } from "src/entities/db/deck.entity";
import { FeedPostEntity } from "src/feed/models/post.entity";
import { GamesEntity } from "src/entities/db/game.entity";
import { TablesDecksEntity } from "src/entities/db/table_deck.entity";
import { TablesEntity } from "src/entities/db/table.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../../auth/models/role.enum";
import { RankEntity } from "src/entities/db/rank.entity";
import { TableUsersEntity } from "src/entities/db/table_users.entity";
import { CardsEntity } from "./card.entity";

@Entity('users')
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number;
    // TODO: Must do unique after finishing testings
    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true })
    refresh_token: string;

    @Column({ default: false })
    isEmailConfirmed: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @OneToMany(() => FeedPostEntity, (feedPostEntity) => feedPostEntity.author)
    feedPosts: FeedPostEntity

    @OneToMany(() => DecksEntity, (decksEntity) => decksEntity.creator)
    decks: DecksEntity

    @OneToMany(() => GamesEntity, (gamesEntity) => gamesEntity.creator)
    game_id: GamesEntity

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.creator)
    table_id: GamesEntity

    @OneToMany(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.user_id)
    table_deck_id: TablesDecksEntity

    @OneToMany(() => RankEntity, (rankEntity) => rankEntity.user_id)
    rank_id: RankEntity

    @OneToMany(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.user)
    table_users_id: TableUsersEntity

    @OneToMany(() => CardsEntity, (cardsEntity) => cardsEntity.creator)
    card_id: CardsEntity
}