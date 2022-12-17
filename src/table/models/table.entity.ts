import { UsersEntity } from "src/auth/models/user.entity";
import { GamesEntity } from "src/game/models/game.entity";
import { RankEntity } from "src/rank/models/rank.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesDecksEntity } from "./table_deck.entity";

@Entity('table')
export class TablesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    private: boolean;

    @Column()
    status: string;

    @Column()
    name: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_id)
    @JoinColumn({ name: 'user_id' })
    user_id: UsersEntity

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.table_id)
    @JoinColumn({ name: 'game_id' })
    game_id: UsersEntity

    @OneToMany(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.table_id)
    table_deck_id: TablesDecksEntity

    @OneToMany(() => RankEntity, (rankEntity) => rankEntity.table_id)
    rank_id: RankEntity
}