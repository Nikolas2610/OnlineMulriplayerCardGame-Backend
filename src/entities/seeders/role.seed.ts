import { InjectRepository } from "@nestjs/typeorm";
import { RolesEntity } from "../db/role.entity";
import { faker } from '@faker-js/faker';
import { GamesEntity } from "../db/game.entity";
import { Repository } from "typeorm";

export class RoleSeeder {
    constructor(
        @InjectRepository(RolesEntity)
        private readonly rolesRepository: Repository<RolesEntity>,
        @InjectRepository(GamesEntity)
        private readonly gamesRepository: Repository<GamesEntity>
    ) {
        // this.addRoles();
    }

    async addRoles() {
        for (let index = 0; index < 10; index++) {
            const game = await this.gamesRepository.findOne({ where: { id: 21 } })
            const role = new RolesEntity();
            role.name = faker.lorem.word();
            role.max_players = faker.datatype.number(10);
            role.description = faker.lorem.paragraph();
            role.game_id = game;
            const response = await this.rolesRepository.save(role)
            console.log(response);
        }
    }


}