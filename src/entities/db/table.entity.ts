import { UsersEntity } from "src/entities/db/user.entity";
import { GamesEntity } from "src/entities/db/game.entity";
import { RankEntity } from "src/entities/db/rank.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesDecksEntity } from "./table_deck.entity";
import { TableUsersEntity } from "./table_users.entity";

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

    @OneToMany(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.table)
    table_users_id: TableUsersEntity
}