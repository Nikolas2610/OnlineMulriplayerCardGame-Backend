import { UsersEntity } from "src/auth/models/user.entity";
import { TablesEntity } from "src/entities/db/table.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('rank')
export class RankEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    points: number;

    @Column()
    row: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesEntity, (tablesEntity) => tablesEntity.rank_id)
    @JoinColumn({ name: 'table_id' })
    table_id: TablesEntity

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.rank_id)
    @JoinColumn({ name: 'user_id' })
    user_id: UsersEntity
}