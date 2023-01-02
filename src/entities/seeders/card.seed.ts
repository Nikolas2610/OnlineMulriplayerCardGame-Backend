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
    ) { }

    async addFakeCards(cards: number) {
        // Get all users
        const users = await this.usersRepository.find();

        // Add images
        for (let index = 0; index < cards; index++) {
            const image = new CardsEntity();
            image.name = faker.name.firstName();
            image.image = faker.image.imageUrl();
            image.private = faker.datatype.boolean();
            image.creator = users[faker.datatype.number({
                min: 1,
                max: (users.length - 1)
            })];
            await this.cardsReposiroty.save(image)
        }
    }
}