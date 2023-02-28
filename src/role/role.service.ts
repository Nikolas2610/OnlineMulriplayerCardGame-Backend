import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolesEntity } from 'src/entities/db/roles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RolesEntity)
        private readonly rolesEntity: Repository<RolesEntity>
    ) {}
}
