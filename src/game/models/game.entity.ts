import { UsersEntity } from "src/auth/models/user.entity";
import { DecksEntity } from "src/deck/models/deck.entity";
import { HandStartCardsEntity } from "src/hand_start_cards/models/hand_start_cards.entity";
import { RolesEntity } from "src/role/models/role.entity";
import { TablesEntity } from "src/table/models/table.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('game')
export class GamesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    min_players: number;

    @Column()
    max_players: number;

    @Column({ default: false })
    dealer: boolean;

    @Column({ default: false })
    status_player: boolean;

    @Column({ default: false })
    rank: boolean;

    @Column({ default: false })
    private: boolean;

    @Column()
    grid: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @OneToMany(() => RolesEntity, (rolesEntity) => rolesEntity.id)
    role_id: RolesEntity

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.id)
    hand_start_cards_id: HandStartCardsEntity

    @ManyToMany(() => DecksEntity, (decksEntity) => decksEntity.games)
    deck: DecksEntity[]

    @ManyToOne(() => UsersEntity, (usersEntity) => usersEntity.id)
    @JoinColumn({ name: 'creator' })
    creator: UsersEntity

    @OneToMany(() => TablesEntity, (tablesEntity) => tablesEntity.game_id)
    table_id: TablesEntity
}