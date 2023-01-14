import { UsersEntity } from "src/entities/db/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DecksEntity } from "./decks.entity";
import { TablesEntity } from "./tables.entity";
import { TablesCardsEntity } from "./table_cards.entity";

@Entity('table_decks')
export class TablesDecksEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesEntity, (tablesEntity) => tablesEntity.table_decks)
    @JoinColumn({ name: 'table_id' })
    table_id: TablesEntity;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_decks, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user_id?: UsersEntity;

    @ManyToOne(() => DecksEntity, (decksEntity) => decksEntity.table_deck_id, { nullable: true })
    @JoinColumn({ name: 'deck_id'})
    deck?: DecksEntity;
    
    @OneToMany(() => TablesCardsEntity, (tablesCardsEntity) => tablesCardsEntity.table_deck_id)
    table_cards_id: TablesCardsEntity;
}