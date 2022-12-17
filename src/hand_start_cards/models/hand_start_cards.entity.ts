import { DecksEntity } from "src/deck/models/deck.entity";
import { GamesEntity } from "src/game/models/game.entity";
import { RolesEntity } from "src/role/models/role.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('hand_start_cards')
export class HandStartCardsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    count_cards: number

    @Column({ default: false })
    hidden: boolean;

    @Column()
    repeat: number

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => DecksEntity, (decksEntity) => decksEntity.hand_start_cards)
    @JoinColumn({ name: 'deck_id' })
    deck_id: DecksEntity

    @ManyToOne(() => RolesEntity, (rolesEntity) => rolesEntity.id)
    @JoinColumn({ name: 'role_id' })
    role_id: RolesEntity

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.id)
    @JoinColumn({ name: 'game_id' })
    game_id: GamesEntity
}