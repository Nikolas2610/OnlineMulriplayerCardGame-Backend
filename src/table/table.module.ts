import { Module } from '@nestjs/common';
import { EntitiesModule } from 'src/entities/entities.module';
import { TableController } from './table.controller';
import { TableService } from './table.service';

@Module({
    imports: [EntitiesModule],
    controllers: [TableController],
    providers: [TableService]
})
export class TableModule { }
