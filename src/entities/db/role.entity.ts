import { GamesEntity } from "src/entities/db/game.entity";
import { HandStartCardsEntity } from "src/entities/db/hand_start_cards.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('role')
export class RolesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    max_players: number;

    @Column({ length: 1000 })
    description: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.id)
    @JoinColumn({ name: 'game_id' })
    game_id: GamesEntity

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.id)
    hand_start_deck_id: HandStartCardsEntity
}