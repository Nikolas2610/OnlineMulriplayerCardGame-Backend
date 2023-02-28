import { Body, Controller, Delete, Post } from '@nestjs/common';
import { CreateRole } from 'src/game/models/relation/role/create-role.interface';
import { RoleService } from './role.service';

@Controller('role')
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ) { }

    // @Post()
    // async createRole(
    //     @Body('role') role: CreateRole
    // ) {
    //     return await this.roleService.createRole(role);
    // }

    // @Delete()
    // async deleteRole(
    //     @Body('id') id: number
    // ) {
    //     return await this.roleService.deleteRole(id);
    // }
}
