import { Module } from '@nestjs/common';
import { EntitiesModule } from 'src/entities/entities.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
    imports: [EntitiesModule],
    providers: [GameService],
    controllers: [GameController]
})
export class GameModule { }
