import { UsersEntity } from "src/entities/db/users.entity";
import { GamesEntity } from "src/entities/db/games.entity";
import { RankEntity } from "src/entities/db/ranks.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesDecksEntity } from "./table_decks.entity";
import { TableUsersEntity } from "./table_users.entity";

@Entity('tables')
export class TablesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    name: string;

    @Column({ default: false })
    private: boolean;

    @Column({ nullable: true })
    password: string;

    @Column()
    status: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.tables, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'creator' })
    creator: UsersEntity

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.table_id)
    @JoinColumn({ name: 'game_id' })
    game: GamesEntity

    @OneToMany(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.table_id)
    table_decks: TablesDecksEntity

    @OneToMany(() => RankEntity, (rankEntity) => rankEntity.table)
    ranks: RankEntity

    @OneToMany(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.table)
    table_users: TableUsersEntity
}