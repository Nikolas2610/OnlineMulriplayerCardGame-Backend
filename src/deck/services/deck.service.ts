import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { DecksEntity } from 'src/entities/db/deck.entity';
import { UsersEntity } from 'src/entities/db/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateDeck } from '../dto/CreateDeck.dto';

@Injectable()
export class DeckService {
    constructor(
        @InjectRepository(DecksEntity)
        private readonly decksRepository: Repository<DecksEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersReposiroty: Repository<UsersEntity>,
    ) {
    }

    async createDeck(user: User, deck: CreateDeck): Promise<DecksEntity> {
        const userDB = await this.usersReposiroty.findOne({ where: { id: user.id } });
        const deckDB = new DecksEntity();
        deckDB.name = deck.name;
        deckDB.private = deck.private;
        deckDB.cards = deck.cards;
        deckDB.creator = userDB;
        const response = await this.decksRepository.save(deckDB);
        return response;
    }

    async editDeck(user: User, deck: DecksEntity) {
        const deckDB = await this.decksRepository.findOne({ where: { id: deck.id }, relations: ['creator'] });
        if (user.id !== deckDB.creator.id) {
            throw new HttpException({ status: HttpStatus.UNAUTHORIZED, message: 'Unauthorized' }, HttpStatus.UNAUTHORIZED);
        }
        const response = await this.decksRepository.save(deck);
        delete response.cards
        return response;
    }

    async deleteDeck(user: User, deck_id: number) {
        const deck = await this.decksRepository.findOne({ where: { id: deck_id }, relations: ['creator'] });
        if (user.id !== deck.creator.id) {
            throw new HttpException({ status: HttpStatus.UNAUTHORIZED, message: 'Unauthorized' }, HttpStatus.UNAUTHORIZED);
        }
        return await this.decksRepository.delete(deck_id);
    }
}
