import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { CardsEntity } from 'src/entities/db/cards.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { EqualOperator, Repository } from 'typeorm';
import { CreateCardDto } from '../dto/CreateCard.dto';
import { extname } from 'path';
import * as fs from 'fs';
import { EditCardDto } from '../dto/EditCard.dto';
import * as sharp from 'sharp';


@Injectable()
export class CardService {
    constructor(
        @InjectRepository(CardsEntity)
        private readonly cardsRepository: Repository<CardsEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
    ) {

    }

    async getPrivateAndPublicCards(user: User): Promise<{ publicCards: CardsEntity[], userCards: CardsEntity[] }> {
        try {
            const [publicCards, userCards] = await Promise.all([
                this.cardsRepository.find({ where: { private: false } }),
                this.cardsRepository.find({ where: { creator: new EqualOperator(user.id) } })
            ]);

            return { publicCards, userCards };
        } catch (error) {
            throw new HttpException({ status: HttpStatus.NO_CONTENT, error: 'There are not available cards' }, HttpStatus.NO_CONTENT);
        }
    }

    async saveCard(user: User, card: CreateCardDto, image: Express.Multer.File): Promise<CardsEntity> {
        const userDB = await this.usersRepository.findOne({ where: { id: user.id } });
        const imageCard = new CardsEntity();
        imageCard.name = card.name;
        imageCard.image = await this.saveImage(image);
        imageCard.private = card.private === 'true';
        imageCard.creator = userDB;
        const response = await this.cardsRepository.save(imageCard);
        delete response.creator
        return response;
    }


    async saveImage(image: Express.Multer.File) {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(image.originalname);
            const filename = `${uniqueSuffix}${ext}`;
            const compressedImage = await this.compress(image.buffer);
            fs.writeFileSync(`uploads/${filename}`, compressedImage);
            return filename;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateCardWithImage(user: User, card: EditCardDto, image: Express.Multer.File): Promise<CardsEntity> {
        const cardDB = await this.cardsRepository.findOne({ where: { id: parseInt(card.id), creator: new EqualOperator(user.id) } });
        cardDB.name = card.name;
        cardDB.private = card.private === 'true';
        this.deleteCardImage(cardDB.image);
        cardDB.image = await this.saveImage(image);
        const response = await this.cardsRepository.save(cardDB);
        delete response.creator
        return response;
    }

    async updateCardWithoutImage(user: User, card: EditCardDto): Promise<CardsEntity> {
        const cardDB = await this.cardsRepository.findOne({ where: { id: parseInt(card.id), creator: new EqualOperator(user.id) } });
        cardDB.name = card.name;
        cardDB.private = card.private === 'true';
        const response = await this.cardsRepository.save(cardDB);
        delete response.creator
        return response;
    }

    deleteCardImage(image: string) {
        try {
            fs.unlinkSync(`uploads/${image}`);
        } catch (error) {
            console.log("Image not exists to public folder");
        }
    }

    async deleteCard(user: User, card_id: number) {
        const query = await this.userOwnerOfCard(user, card_id);
        if (!query) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Card not exists with this user' }, HttpStatus.BAD_REQUEST);
        }
        try {
            const response = await this.cardsRepository.delete({ id: card_id });
            this.deleteCardImage(query.image);
            return response;
        } catch (error) {
            throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'This card is used to a deck' }, HttpStatus.BAD_REQUEST);
        }
    }

    async userOwnerOfCard(user: User, card_id: number): Promise<CardsEntity> {
        return this.cardsRepository.findOne(
            {
                where: { id: card_id, creator: new EqualOperator(user.id) },
                relations: ['creator']
            });
    }

    async compress(image: Buffer): Promise<Buffer> {
        const options = {
            width: undefined,
            height: 200
        };
        return sharp(image)
            .resize(options)
            .toBuffer();
    }
}
