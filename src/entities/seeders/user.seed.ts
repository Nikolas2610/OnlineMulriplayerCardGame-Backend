import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "src/auth/models/role.enum";
import { AuthService } from "src/auth/services/auth.service";
import { Repository } from "typeorm";
import { UsersEntity } from "../db/users.entity";
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { hashPassword } from "src/utils/helper";

export class UserSeeder {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
    ) { }

    async fillUsersTable(users: number) {
        await this.addAdministrator();
        await this.addStandardUsers();
        await this.addUsers(users);
    }

    async addAdministrator() {
        try {
            const admin = new UsersEntity();
            admin.username = 'Admin';
            admin.email = 'admin@omcg.com';
            admin.password = await hashPassword('CardGame-0');
            admin.email_confirmed = true;
            admin.role = Role.ADMIN;
            await this.usersRepository.save(admin);
        } catch (error) {
            console.log(error);
        }
    }

    async addStandardUsers() {
        try {
            for (let i = 1; i < 9; i++) {
                const player = new UsersEntity();
                player.username = 'Player' + i;
                player.email = `player${i}@omcg.com`;
                player.password = await hashPassword('CardGame-0');
                player.email_confirmed = true;
                player.role = Role.USER;
                await this.usersRepository.save(player);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async addUsers(count: number) {
        for (let i = 0; i < count; i++) {
            const user = new UsersEntity();
            user.username = faker.internet.userName();
            user.email = faker.internet.email();
            user.email_confirmed = faker.datatype.boolean();
            user.password = await hashPassword('CardGame-0');
            await this.usersRepository.save(user);
        }
    }
}