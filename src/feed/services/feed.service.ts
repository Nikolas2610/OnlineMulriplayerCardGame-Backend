import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/models/user.interface';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { FeedPostEntity } from '../models/post.entity';
import { FeedPost } from '../models/post.interface';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(FeedPostEntity)
        private readonly feedPostRepository: Repository<FeedPostEntity>
    ) {}

    async createPost(user: User, feedPost: FeedPost): Promise<FeedPost> {
        // Connect post with user
        feedPost.author = user;
        return await this.feedPostRepository.save(feedPost);
    }

    async findAllPosts(): Promise<FeedPost[]> {
        return await this.feedPostRepository.find();
    }

    async findPosts(take: number = 10, skip: number =0): Promise<FeedPost[]> {
        const posts = await this.feedPostRepository.findAndCount({ take, skip });
        return <FeedPost[]>posts;
    }

    async updatePost(id: number, feedPost: FeedPost): Promise<UpdateResult> {
        return await this.feedPostRepository.update(id, feedPost);
    }

    async deletePost(id: number): Promise<DeleteResult> {
        return await this.feedPostRepository.delete(id);
    }
}
