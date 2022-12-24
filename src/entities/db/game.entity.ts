import { UsersEntity } from "src/entities/db/user.entity";
import { DecksEntity } from "src/entities/db/deck.entity";
import { HandStartCardsEntity } from "src/entities/db/hand_start_cards.entity";
import { RolesEntity } from "src/entities/db/role.entity";
import { TablesEntity } from "src/entities/db/table.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StatusEntity } from "./status.entity";

@Entity('game')
export class GamesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ length: 1000 })
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

    @OneToMany(() => StatusEntity, (statusEntity) => statusEntity.game_id)
    status_id: StatusEntity
}