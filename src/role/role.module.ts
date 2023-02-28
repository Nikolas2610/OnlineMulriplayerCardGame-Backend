import { Module } from '@nestjs/common';
import { EntitiesModule } from 'src/entities/entities.module';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
    imports: [EntitiesModule],
    controllers: [RoleController],
    providers: [RoleService]
})
export class RoleModule { }
