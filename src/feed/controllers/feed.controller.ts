import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { FeedPost } from '../models/post.interface';
import { FeedService } from '../services/feed.service';

@Controller('feed')
export class FeedController {
    constructor(
        private feedService: FeedService
    ) {}

    @Post()
    async create(@Body() feedPost: FeedPost): Promise<FeedPost> {
        return await this.feedService.createPost(feedPost);
    }

    @Get('pagination')
    findSelected(@Query('take') take: number = 1, @Query('skip') skip: number = 1): Promise<FeedPost[]> {
        return this.feedService.findPosts(take,skip);
    }
    
    @Get()
    findAllPosts(): Promise<FeedPost[]> {
        return this.feedService.findAllPosts()
    }

    @Put(':id')
    updatePost(
        @Param() id: number,
        @Body() feedPost: FeedPost
    ): Promise<UpdateResult> {
        return this.feedService.updatePost(id, feedPost);
    }

    @Delete(':id')
    deletePost(@Param('id') id:number): Promise<DeleteResult> {
        return this.feedService.deletePost(id);
    }
}
