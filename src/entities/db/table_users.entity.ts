import { UsersEntity } from "src/entities/db/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolesEntity } from "./roles.entity";
import { StatusEntity } from "./status.entity";
import { TablesEntity } from "./tables.entity";
import { TablesCardsEntity } from "./table_cards.entity";
import { TablesDecksEntity } from "./table_decks.entity";
import { TeamsEntity } from "./teams.entity";
import { RankEntity } from "./ranks.entity";
import { SocketStatus } from "src/websockets/types/SocketStatus.enum";

@Entity('table_users')
export class TableUsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    turn: number;

    @Column({ default: false })
    playing: boolean;

    @Column()
    socket_id: string;

    @Column({ type: 'enum', enum: SocketStatus, default: SocketStatus.ONLINE })
    socket_status: SocketStatus

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_users_id, { cascade: true })
    @JoinColumn({ name: 'user_id' })
    user: UsersEntity

    @ManyToOne(() => TablesEntity, (tableEntity) => tableEntity.table_users, { cascade: true, nullable: true })
    @JoinColumn({ name: 'table_id' })
    table: TablesEntity

    @ManyToOne(() => RolesEntity, (rolesEntity) => rolesEntity.table_user_id, { cascade: true, nullable: true })
    @JoinColumn({ name: 'role_id' })
    role: RolesEntity

    @ManyToOne(() => TeamsEntity, (teamsEntity) => teamsEntity.table_user, { cascade: true, nullable: true })
    @JoinColumn({ name: 'team_id' })
    team: TeamsEntity

    @ManyToOne(() => StatusEntity, (statusEntity) => statusEntity.table_user, { cascade: true, nullable: true })
    @JoinColumn({ name: 'status_id' })
    status: StatusEntity

    @OneToOne(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.table_user, { cascade: true })
    table_deck: TablesDecksEntity

    @OneToMany(() => RankEntity, (randEntity) => randEntity.table_user, { cascade: true })
    rank: RankEntity
}