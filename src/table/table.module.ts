import { Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableService } from './table.service';

@Module({
    imports: [],
    controllers: [TableController],
    providers: [TableService]
})
export class TableModule { }
