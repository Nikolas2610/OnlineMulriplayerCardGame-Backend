import { UsersEntity } from "src/entities/db/users.entity";
import { TableDeckType } from "src/table/models/table-deck-type.enum";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DecksEntity } from "./decks.entity";
import { TablesEntity } from "./tables.entity";
import { TablesCardsEntity } from "./table_cards.entity";
import { TableUsersEntity } from "./table_users.entity";

@Entity('table_decks')
export class TablesDecksEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: TableDeckType, default: TableDeckType.USER })
    type: TableDeckType

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesEntity, (tablesEntity) => tablesEntity.table_decks)
    @JoinColumn({ name: 'table_id' })
    table: TablesEntity;

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_decks, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user?: UsersEntity;

    @ManyToOne(() => DecksEntity, (decksEntity) => decksEntity.table_deck_id, { nullable: true })
    @JoinColumn({ name: 'deck_id' })
    deck?: DecksEntity;

    @OneToMany(() => TablesCardsEntity, (tablesCardsEntity) => tablesCardsEntity.table_deck)
    table_cards: TablesCardsEntity[];

    @OneToOne(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.table_deck, { nullable: true })
    @JoinColumn({ name: 'table_user_id' })
    table_user?: TableUsersEntity
}