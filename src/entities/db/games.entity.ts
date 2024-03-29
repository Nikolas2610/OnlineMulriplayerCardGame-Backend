import { UsersEntity } from "src/entities/db/users.entity";
import { DecksEntity } from "src/entities/db/decks.entity";
import { HandStartCardsEntity } from "src/entities/db/hand_start_cards.entity";
import { RolesEntity } from "src/entities/db/roles.entity";
import { TablesEntity } from "src/entities/db/tables.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StatusEntity } from "./status.entity";
import { TeamsEntity } from "./teams.entity";

@Entity('games')
export class GamesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    name: string;

    @Column({ length: 1000, nullable: true })
    description: string;

    @Column()
    max_players: number;

    @Column({ default: false })
    auto_turn: boolean;

    @Column({ default: false })
    private: boolean;

    @Column()
    grid_rows: number;

    @Column()
    grid_cols: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @OneToMany(() => RolesEntity, (rolesEntity) => rolesEntity.game, { cascade: true })
    roles: RolesEntity[]

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.game, { cascade: true })
    hand_start_cards: HandStartCardsEntity[]

    @ManyToMany(() => DecksEntity, (decksEntity) => decksEntity.games, { onDelete: 'CASCADE' })
    deck: DecksEntity[]

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.id, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    creator: UsersEntity

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.game)
    table_id: TablesEntity

    @OneToMany(() => StatusEntity, (statusEntity) => statusEntity.game, { cascade: true })
    status: StatusEntity[]

    @OneToMany(() => TeamsEntity, (teamsEntity) => teamsEntity.game, { cascade: true })
    teams: TeamsEntity[]
}