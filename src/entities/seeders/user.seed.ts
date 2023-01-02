import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "src/auth/models/role.enum";
import { AuthService } from "src/auth/services/auth.service";
import { Repository } from "typeorm";
import { UsersEntity } from "../db/user.entity";
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export class UserSeeder {
    constructor(
        @InjectRepository(UsersEntity)
        private readonly usersRepository: Repository<UsersEntity>,
    ) { }

    async fillUsersTable(users: number) {
        await this.addAdministrator();
        await this.addUsers(users);
    }

    async addAdministrator() {
        try {
            const admin = new UsersEntity();
            admin.username = 'Admin';
            admin.email = 'admin@omcg.com';
            admin.password = await this.hashPassword('CardGame-0');
            admin.isEmailConfirmed = true;
            admin.role = Role.ADMIN;
            await this.usersRepository.save(admin);
        } catch (error) {

        }
    }

    async addUsers(count: number) {
        for (let i = 0; i < count; i++) {
            const user = new UsersEntity();
            user.username = faker.internet.userName();
            user.email = faker.internet.email();
            user.isEmailConfirmed = faker.datatype.boolean();
            user.password = await this.hashPassword('CardGame-0');
            await this.usersRepository.save(user);
        }
    }

    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 12);
    }
}