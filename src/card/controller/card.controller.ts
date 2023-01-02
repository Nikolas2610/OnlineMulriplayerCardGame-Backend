import { Controller, Get, UseGuards, Request, Post, Body, UploadedFile, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, UseInterceptors, HttpStatus, HttpException, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { createWriteStream } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';
import { CardsEntity } from 'src/entities/db/card.entity';
import { CreateCardDto } from '../dto/CreateCard.dto';
import { CardService } from '../services/card.service';
import * as fs from 'fs';
import { EditCardDto } from '../dto/EditCard.dto';

@Controller('card')
@UseGuards(JwtGuard, RefreshToken)
export class CardController {
    constructor(private readonly cardService: CardService) { }

    @Get('public')
    async getPublicCards(): Promise<CardsEntity[]> {
        return await this.cardService.getPublicCards();
    }

    @Get('user')
    async getUserCards(@Request() req: any): Promise<CardsEntity[]> {
        return await this.cardService.getUserCards(req.user);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async saveCard(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|svg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        ) image: Express.Multer.File,
        @Body() card: CreateCardDto,
        @Request() req: any
    ): Promise<CardsEntity> {
        return await this.cardService.saveCard(req.user, card, image);
    }

    @Patch()
    @UseInterceptors(FileInterceptor('image'))
    async updateCard(
        @Body() card: EditCardDto,
        @Request() req: any
    ): Promise<CardsEntity> {
        return await this.cardService.updateCardWithoutImage(req.user, card);
    }

    @Patch('image')
    @UseInterceptors(FileInterceptor('image'))
    async updateCardWithImage(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|svg)' }),
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
                ],
            }),
        ) image: Express.Multer.File,
        @Body() card: EditCardDto,
        @Request() req: any
    ): Promise<CardsEntity> {
        return await this.cardService.updateCardWithImage(req.user, card, image);
    }

    @Delete()
    async deleteCard(
        @Request() req: any,
        @Body('card_id') card_id: number,
    ) {
        return await this.cardService.deleteCard(req.user, card_id);
    }
}


