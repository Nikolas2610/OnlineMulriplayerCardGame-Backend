import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GamesEntity } from "./games.entity";
import { TableUsersEntity } from "./table_users.entity";

@Entity('teams')
export class TeamsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    name: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.teams)
    @JoinColumn({ name: 'game_id' })
    game: GamesEntity

    @OneToMany(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.team)
    table_user: TableUsersEntity
}