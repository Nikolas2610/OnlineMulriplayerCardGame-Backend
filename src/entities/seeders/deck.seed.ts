import { InjectRepository } from "@nestjs/typeorm";
import { UsersEntity } from "src/entities/db/user.entity";
import { CardsEntity } from "src/entities/db/card.entity";
import { DecksEntity } from "src/entities/db/deck.entity";
import { Repository } from "typeorm";
import { faker } from '@faker-js/faker';


export class DeckSeeder {
    constructor(
        @InjectRepository(DecksEntity)
        private readonly deckRepository: Repository<DecksEntity>,
        @InjectRepository(CardsEntity)
        private readonly cardsEntity: Repository<CardsEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>
    ) { }

    async addFakeDecks(decks: number) {
        // Get all users
        const users = await this.usersRepository.find();
        // Get all cards
        const cards = await this.cardsEntity.find();
        // Save Deck to DB
        for (let i = 0; i < decks; i++) {
            try {
                const deck = new DecksEntity();
                deck.name = faker.name.firstName();
                deck.private = faker.datatype.boolean();
                deck.creator = users[faker.datatype.number({
                    min: 1,
                    max: (users.length - 1)
                })];
                deck.cards = [];
                // Save cards to deck 
                const uniqueNumbers = this.uniqueNumbersArray(0, cards.length - 1);
                uniqueNumbers.forEach(num => deck.cards.push(cards[num]));
                await this.deckRepository.save(deck);
            } catch (error) {
                console.log(error);
            }
        }
    }

    uniqueNumbersArray(min: number, max: number) {
        const arr = [];
        while (arr.length < faker.datatype.number(25)) {
            const r = Math.floor(Math.random() * (max - min + 1)) + min;
            if (arr.indexOf(r) === -1) arr.push(r);
        }
        return arr;
    }
}