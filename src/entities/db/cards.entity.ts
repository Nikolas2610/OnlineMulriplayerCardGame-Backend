import { DecksEntity } from "src/entities/db/decks.entity";
import { TablesCardsEntity } from "src/entities/db/table_cards.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UsersEntity } from "./users.entity";


@Entity('cards')
export class CardsEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    image: string;

    @Column({ length: 25 })
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

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.cards, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    creator: UsersEntity
}