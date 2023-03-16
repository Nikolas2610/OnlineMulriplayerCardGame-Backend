import { CardsEntity } from "src/entities/db/cards.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesDecksEntity } from "./table_decks.entity";

@Entity('table_cards')
export class TablesCardsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: false })
    hidden: boolean;

    @Column({ default: 0 })
    rotate: number;

    @Column({ nullable: true })
    turn: number;

    @Column({ nullable: true, default: 0 })
    position_x: number;

    @Column({ nullable: true, default: 0 })
    position_y: number;

    @Column({ default: 0 })
    z_index: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesDecksEntity, (tablesDecksEntity) => tablesDecksEntity.table_cards)
    @JoinColumn({ name: 'table_deck_id' })
    table_deck: TablesDecksEntity

    @ManyToOne(() => CardsEntity, (cardsEntity) => cardsEntity.table_cards_id)
    @JoinColumn({ name: 'card_id' })
    card: CardsEntity
}