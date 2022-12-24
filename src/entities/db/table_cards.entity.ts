import { CardsEntity } from "src/entities/db/card.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesDecksEntity } from "./table_deck.entity";

@Entity('table_cards')
export class TablesCardsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    hidden: boolean;

    @Column({ default: false })
    rotate: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.table_cards_id)
    @JoinColumn({ name: 'table_deck_id' })
    table_deck_id: TablesDecksEntity

    @ManyToOne(() => CardsEntity, (cardsEntity) => cardsEntity.table_cards_id)
    @JoinColumn({ name: 'card_id' })
    card_id: CardsEntity
}