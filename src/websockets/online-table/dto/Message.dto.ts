import { UsersEntity } from "src/entities/db/users.entity";

export class Message {
    message: string;
    room: string;
    user: UsersEntity
}