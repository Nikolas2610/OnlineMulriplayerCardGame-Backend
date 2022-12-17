import { DecksEntity } from "src/deck/models/deck.entity";
import { TablesCardsEntity } from "src/table/models/table_cards.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity('card')
export class CardsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    image: string;

    @Column()
    name: string;

    @Column({ default: false })
    private: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToMany(() => DecksEntity, (decksEntity) => decksEntity.cards)
    deck: DecksEntity[]

    @OneToMany(() => TablesCardsEntity, (tablesCardsEntity) => tablesCardsEntity.card_id)
    table_cards_id: TablesCardsEntity
}