import { UsersEntity } from "src/entities/db/users.entity";
import { TablesEntity } from "src/entities/db/tables.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('ranks')
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

    @ManyToOne(() => TablesEntity, (tablesEntity) => tablesEntity.ranks)
    @JoinColumn({ name: 'table_id' })
    table: TablesEntity

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.ranks)
    @JoinColumn({ name: 'user_id' })
    user_id: UsersEntity
}