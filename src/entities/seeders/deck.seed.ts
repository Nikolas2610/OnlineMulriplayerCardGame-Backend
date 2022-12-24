import { InjectRepository } from "@nestjs/typeorm";
import { UsersEntity } from "src/auth/models/user.entity";
import { CardsEntity } from "src/entities/db/card.entity";
import { DecksEntity } from "src/entities/db/deck.entity";
import { Repository } from "typeorm";


export class SeedDeck {
    constructor(
        @InjectRepository(DecksEntity)
        private readonly decksEntity: Repository<DecksEntity>,
        @InjectRepository(CardsEntity)
        private readonly cardsEntity: Repository<CardsEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersEntity: Repository<UsersEntity>
    ) {
        // this.deleteDeck(1);
        // this.addDeck("Classic")
        // this.addDeck("Uno")
        // this.getCardsDeck()
        // this.getUser();
        // this.getUserDecks(13);
    }

    async getUser() {
        const user = await this.usersEntity.findOne({ where: { username: 'psillovits' } });
        console.log(user);
    }

    async getUserDecks(id: number) {
        const user = await this.usersEntity
            .createQueryBuilder('users')
            .leftJoinAndSelect('users.decks', 'deck')
            .where('users.id = :id', { id })
            .getOne();

        Object.values(user.decks).forEach(async deck => {
            const cards = await this.decksEntity.find({ where: { id: deck.id }, relations: ['cards'] })
            console.log(cards);
        })
    }

    async addDeck(name: string) {
        const deck = new DecksEntity();
        const creator = await this.usersEntity.findOne({ where: { id: 13 } });
        console.log(creator);

        deck.name = name;
        deck.creator = creator;
        const cards = await this.cardsEntity.find({ where: { private: false } });
        deck.cards = cards;
        const response = await this.decksEntity.save(deck);

    }

    async getCardsDeck() {
        const decks = await this.decksEntity.find({ relations: ['cards'] });
        console.log(decks);
    }

    async deleteDeck(id: number) {
        const response = await this.decksEntity.delete(id);
        console.log(response);
    }
}