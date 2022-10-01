import { FeedPost } from "src/feed/models/post.interface";
import { Role } from "./role.enum";

export interface User {
    id?: number;
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    role?: Role;
    posts?: FeedPost[];
}