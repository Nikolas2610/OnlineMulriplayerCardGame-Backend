import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './models/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([RolesEntity])]
})
export class RoleModule { }
