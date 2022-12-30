import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { CardsEntity } from 'src/entities/db/card.entity';
import { EqualOperator, Repository } from 'typeorm';

@Injectable()
export class CardService {
    constructor(
        @InjectRepository(CardsEntity)
        private readonly cardsReposiroty: Repository<CardsEntity>,
    ) {

    }

    async getPublicCards(): Promise<CardsEntity[]> {
        return await this.cardsReposiroty.find({where: { private: false }});    
    }

    async getUserCards(user: User): Promise<CardsEntity[]> {
        return await this.cardsReposiroty.find({where: { creator: new EqualOperator(user.id)}});
    }
}
