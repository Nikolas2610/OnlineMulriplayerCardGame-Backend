import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardsEntity } from '../db/card.entity';
import { faker } from '@faker-js/faker';
import { UsersEntity } from '../db/user.entity';


export class CardSeeder {
    constructor(
        @InjectRepository(CardsEntity)
        private readonly cardsReposiroty: Repository<CardsEntity>,
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>
    ) {
        // this.addFakeCards(20);
        // this.getCards();
        // this.deleteCard();
    }

    async addFakeCards(cards: number) {
        const user = await this.usersRepository.findOne({ where: { id: 13 } });

        for (let index = 0; index < cards; index++) {
            const image = new CardsEntity();
            image.name = faker.name.firstName(),
                image.image = faker.image.imageUrl(),
                image.private = faker.helpers.arrayElement([true, false]),
                image.creator = user
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