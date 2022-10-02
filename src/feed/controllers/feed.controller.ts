import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/role.enum';
import { EmailConfirmationGuard } from 'src/email/guards/email-confirmation.guard';
import { DeleteResult, UpdateResult } from 'typeorm';
import { FeedPost } from '../models/post.interface';
import { FeedService } from '../services/feed.service';

@Controller('feed')
export class FeedController {
    constructor(
        private feedService: FeedService
    ) { }

    @Roles(Role.USER)
    @UseGuards(JwtGuard, RolesGuard, EmailConfirmationGuard)
    @Post()
    async create(@Body() feedPost: FeedPost, @Request() req): Promise<FeedPost> {
        return await this.feedService.createPost(req.user, feedPost);
    }

    @Get('pagination')
    findSelected(@Query('take') take: number = 1, @Query('skip') skip: number = 1): Promise<FeedPost[]> {
        return this.feedService.findPosts(take, skip);
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
    deletePost(@Param('id') id: number): Promise<DeleteResult> {
        return this.feedService.deletePost(id);
    }
}
