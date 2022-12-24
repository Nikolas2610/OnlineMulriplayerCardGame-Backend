import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardsEntity } from '../db/card.entity';
import { faker } from '@faker-js/faker';


export class CardSeeder {
    constructor(
        @InjectRepository(CardsEntity)
        private readonly cardsReposiroty: Repository<CardsEntity>
    ) {
        // this.addFakeCards(52);
        // this.getCards();
        // this.deleteCard();
    }

    async addFakeCards(cards: number) {
        for (let index = 0; index < cards; index++) {
            const image = {
                name: faker.name.firstName(),
                image: faker.image.imageUrl(),
                private: faker.helpers.arrayElement([true, false])
            }
            await this.cardsReposiroty.save(image)
        }
    }

    async getCards() {
        const cards = await this.cardsReposiroty.find();
        console.log(cards);
    }

    async deleteCard() {
        try {
            const response = await this.cardsReposiroty.delete(1);
            console.log(response);
        } catch (error) {
            console.log(error.sqlMessage);
            console.error('Card is using from a deck so its not possible to delete this card');
        }
    }
}