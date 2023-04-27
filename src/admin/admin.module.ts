import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { EntitiesModule } from 'src/entities/entities.module';
import { GameService } from 'src/game/game.service';

@Module({
  imports: [EntitiesModule],
  controllers: [AdminController],
  providers: [AdminService, GameService]
})
export class AdminModule { }
