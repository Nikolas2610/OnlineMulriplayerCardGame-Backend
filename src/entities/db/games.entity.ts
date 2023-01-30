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

    @Column({ length: 1000 })
    description: string;

    @Column()
    min_players: number;

    @Column()
    max_players: number;

    @Column({ default: false })
    extra_roles: boolean;

    @Column({ default: false })
    status_player: boolean;

    @Column({ default: false })
    extra_teams: boolean;

    @Column({ default: false })
    rank: boolean;

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

    @OneToMany(() => RolesEntity, (rolesEntity) => rolesEntity.game)
    role_id: RolesEntity

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.game)
    hand_start_cards_id: HandStartCardsEntity

    @ManyToMany(() => DecksEntity, (decksEntity) => decksEntity.games, { onDelete: 'CASCADE' })
    deck: DecksEntity[]

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.id, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    creator: UsersEntity

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.game)
    table_id: TablesEntity

    @OneToMany(() => StatusEntity, (statusEntity) => statusEntity.game_id)
    status_id: StatusEntity

    @OneToMany(() => TeamsEntity, (teamsEntity) => teamsEntity.game_id)
    teams: TeamsEntity
}