import { Controller, Get, Post, Request, Body } from '@nestjs/common';
import { CreateTable } from './models/create-table.dto';
import { TableService } from './table.service';

@Controller('table')
export class TableController {
    constructor(
        private readonly tableService: TableService
    ) { }

    @Post()
    async createTable(
        @Body('table') table: CreateTable,
        @Request() req: any
    ) {
        return await this.tableService.createTable(req.user, table);
    }
}
