import { UsersEntity } from "src/auth/models/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TablesEntity } from "./table.entity";
import { TablesCardsEntity } from "./table_cards.entity";

@Entity('table_decks')
export class TablesDecksEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => TablesEntity, (tablesEntity) => tablesEntity.table_deck_id)
    @JoinColumn({ name: 'table_id' })
    table_id: TablesEntity

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.table_deck_id, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user_id?: UsersEntity

    @OneToMany(() => TablesCardsEntity, (tablesCardsEntity) => tablesCardsEntity.table_deck_id)
    table_cards_id: TablesCardsEntity
}