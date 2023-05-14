import { UsersEntity } from "src/entities/db/users.entity";
import { TablesEntity } from "src/entities/db/tables.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TableUsersEntity } from "./table_users.entity";
import { RankType } from "src/rank/types/rank-type.enum";

@Entity('ranks')
export class RankEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    points: number;

    @Column()
    row: number;

    @Column({ type: 'enum', enum: RankType, default: RankType.POINTS })
    type: RankType

    @Column({ nullable: true, length: 25 })
    title: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesEntity, (tablesEntity) => tablesEntity.ranks)
    @JoinColumn({ name: 'table_id' })
    table: TablesEntity

    @ManyToOne(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.rank, { nullable: true })
    @JoinColumn({ name: 'table_user_id' })
    table_user: TableUsersEntity
}