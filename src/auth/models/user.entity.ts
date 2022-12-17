import { DecksEntity } from "src/deck/models/deck.entity";
import { FeedPostEntity } from "src/feed/models/post.entity";
import { GamesEntity } from "src/game/models/game.entity";
import { TablesDecksEntity } from "src/table/models/table_deck.entity";
import { TablesEntity } from "src/table/models/table.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Role } from "./role.enum";
import { RankEntity } from "src/rank/models/rank.entity";

@Entity('users')
export class UsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

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

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.user_id)
    table_id: GamesEntity

    @OneToMany(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.user_id)
    table_deck_id: TablesDecksEntity

    @OneToMany(() => RankEntity, (rankEntity) => rankEntity.user_id)
    rank_id: RankEntity
}