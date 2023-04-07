import { GamesEntity } from "src/entities/db/games.entity";
import { HandStartCardsEntity } from "src/entities/db/hand_start_cards.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TableUsersEntity } from "./table_users.entity";

@Entity('roles')
export class RolesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 25 })
    name: string;

    // @Column()
    // max_players: number;

    // @Column({ length: 1000 })
    // description: string;

    @CreateDateColumn({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date;

    @ManyToOne(() => GamesEntity, (gamesEntity) => gamesEntity.roles, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'game_id' })
    game: GamesEntity

    @OneToMany(() => HandStartCardsEntity, (handStartCardsEntity) => handStartCardsEntity.role, { onDelete: 'CASCADE' })
    hand_start_deck_id: HandStartCardsEntity

    @OneToMany(() => TableUsersEntity, (tableUsersEntity) => tableUsersEntity.role)
    table_user_id: TableUsersEntity;
}