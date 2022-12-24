import { UsersEntity } from "src/entities/db/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('feed_post')
export class FeedPostEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: '' })
    body: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => UsersEntity, (userEntity) => userEntity.feedPosts)
    author: UsersEntity
}