import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardsEntity } from 'src/entities/db/card.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CardService {
    constructor(
        @InjectRepository(CardsEntity)
        private readonly cardsReposiroty: Repository<CardsEntity>,
    ) {

    }
}
