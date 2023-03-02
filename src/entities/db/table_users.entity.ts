import { UsersEntity } from "src/entities/db/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RolesEntity } from "./roles.entity";
import { TablesEntity } from "./tables.entity";

@Entity('table_users')
export class TableUsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true, length: 25 })
    status: string;

    @Column({ nullable: true, length: 25 })
    team: string;

    @Column({ nullable: true })
    turn: number;

    @Column()
    playing: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_users_id)
    @JoinColumn({ name: 'user_id' })
    user: UsersEntity

    @ManyToOne(() => TablesEntity, (tableEntity) => tableEntity.table_users, { cascade: true })
    @JoinColumn({ name: 'table_id' })
    table: TablesEntity

    @ManyToOne(() => RolesEntity, (rolesEntity) => rolesEntity.table_user_id, { cascade: true })
    @JoinColumn({ name: 'role_id' })
    role: RolesEntity
}