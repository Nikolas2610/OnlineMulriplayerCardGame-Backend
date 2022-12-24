import { UsersEntity } from "src/auth/models/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesEntity } from "./table.entity";

@Entity('table_users')
export class TableUsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    status: string;

    @Column()
    turn: number;

    @Column()
    playing: boolean;

    @Column()
    game_master: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_users_id)
    @JoinColumn({ name: 'user' })
    user: UsersEntity

    @ManyToOne(() => TablesEntity, (tableEntity) => tableEntity.table_users_id)
    @JoinColumn({ name: 'table' })
    table: TablesEntity
}