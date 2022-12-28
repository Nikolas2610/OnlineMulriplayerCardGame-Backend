import { UsersEntity } from "src/entities/db/user.entity";
import { CardsEntity } from "src/entities/db/card.entity";
import { GamesEntity } from "src/entities/db/game.entity";
import { HandStartCardsEntity } from "src/entities/db/hand_start_cards.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, JoinColumn } from "typeorm";

@Entity('deck')
export class DecksEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: false })
    private: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (userEntity) => userEntity.decks, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'creator_id' })
    creator: UsersEntity

    @ManyToMany(() => CardsEntity, (cardsEntity) => cardsEntity.deck)
    @JoinTable({ name: 'card_deck' })
    cards: CardsEntity[]

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.deck_id)
    hand_start_cards: HandStartCardsEntity

    @ManyToMany(() => GamesEntity, (gamesEntity) => gamesEntity.deck)
    @JoinTable({ name: 'deck_game' })
    games: GamesEntity[]
}