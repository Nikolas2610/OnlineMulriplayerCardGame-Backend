import { DecksEntity } from "src/entities/db/decks.entity";
import { GamesEntity } from "src/entities/db/games.entity";
import { RolesEntity } from "src/entities/db/roles.entity";
import { HandStartCardsRuleType } from "src/game/models/relation/hand-start-cards/HandStartCardsRuleType.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('hand_start_cards')
export class HandStartCardsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    count_cards: number

    @Column({ default: false })
    hidden: boolean;

    @Column({ type: 'enum', enum: HandStartCardsRuleType, default: HandStartCardsRuleType.ROLE })
    type: HandStartCardsRuleType

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => DecksEntity, (decksEntity) => decksEntity.hand_start_cards)
    @JoinColumn({ name: 'deck_id' })
    deck: DecksEntity

    @ManyToOne(() => DecksEntity, (decksEntity) => decksEntity.hand_start_cards_to_deck, { nullable: true })
    @JoinColumn({ name: 'to_deck_id' })
    toDeck: DecksEntity

    @ManyToOne(() => RolesEntity, (rolesEntity) => rolesEntity.hand_start_deck_id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'role_id' })
    role: RolesEntity

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.hand_start_cards, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'game_id' })
    game: GamesEntity
}