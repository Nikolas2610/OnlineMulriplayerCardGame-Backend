import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { GamesEntity } from "./games.entity";

@Entity('status')
export class StatusEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    name: string;

    // @Column({ length: 1000 })
    // description: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.status)
    @JoinColumn({ name: 'game_id' })
    game: GamesEntity
}