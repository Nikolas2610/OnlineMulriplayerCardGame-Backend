import { UsersEntity } from "src/entities/db/users.entity";
import { CardsEntity } from "src/entities/db/cards.entity";
import { GamesEntity } from "src/entities/db/games.entity";
import { HandStartCardsEntity } from "src/entities/db/hand_start_cards.entity";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany, JoinColumn } from "typeorm";
import { TablesDecksEntity } from "./table_decks.entity";

@Entity('decks')
export class DecksEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    name: string;

    @Column({ default: false })
    private: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => UsersEntity, (userEntity) => userEntity.decks, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    creator: UsersEntity

    @ManyToMany(() => CardsEntity, (cardsEntity) => cardsEntity.deck)
    @JoinTable({ name: 'cards_deck' })
    cards: CardsEntity[]

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.deck)
    hand_start_cards_id: HandStartCardsEntity

    @ManyToMany(() => GamesEntity, (gamesEntity) => gamesEntity.deck)
    @JoinTable({ name: 'decks_game' })
    games: GamesEntity[]

    @OneToMany(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.deck)
    table_deck_id: TablesDecksEntity;
}