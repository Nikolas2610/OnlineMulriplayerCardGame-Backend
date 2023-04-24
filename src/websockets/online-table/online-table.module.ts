import { Module } from '@nestjs/common';
import { OnlineTableService } from './online-table.service';
import { OnlineTableGateway } from './online-table.gateway';
import { EntitiesModule } from 'src/entities/entities.module';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';
import { OnlineTableServerService } from './online-table.server.service';

@Module({
  imports: [EntitiesModule],
  providers: [OnlineTableGateway, OnlineTableService, OnlineTableServerService, JwtGuard, JwtStrategy], 
})
export class OnlineTableModule { }
