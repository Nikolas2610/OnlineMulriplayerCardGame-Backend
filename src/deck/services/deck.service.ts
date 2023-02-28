import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { UsersEntity } from 'src/entities/db/users.entity';
import { DeleteResult, getConnection, Repository } from 'typeorm';
import { CreateDeck } from '../dto/CreateDeck.dto';
import { DeckReturn } from './models/deck.return.model';

@Injectable()
export class DeckService {
    constructor(
        @InjectRepository(DecksEntity)
        private readonly decksRepository: Repository<DecksEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersReposiroty: Repository<UsersEntity>,
    ) {
    }

    async getPrivatePublicDecks(user: User): Promise<DeckReturn[]> {
        try {
            const decks = await this.decksRepository
                .createQueryBuilder('decks')
                .leftJoinAndSelect("decks.creator", "user")
                .where("user.id = :userId", { userId: user.id })
                .orWhere("decks.private = :private", { private: false })
                .getMany();
            if (decks.length === 0) {
                throw new HttpException({ status: HttpStatus.NOT_FOUND, message: 'No decks found' }, HttpStatus.NOT_FOUND);
            }
            const modifiedDecks = decks.map(deck => {
                return {
                    id: deck.id,
                    name: deck.name,
                    private: deck.private,
                    creator: deck.creator.username
                }
            });
            return modifiedDecks;
        } catch (error) {
            throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error occurred while fetching decks' }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
        try {
            return await this.decksRepository.delete(deck_id);
        } catch (error) {
            // Check if the error is related to a foreign key constraint
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                throw new HttpException({ status: HttpStatus.CONFLICT, message: 'Cannot delete deck with related records' }, HttpStatus.CONFLICT);
            } else {
                // Handle any other error
                throw new HttpException({ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Error deleting deck' }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
