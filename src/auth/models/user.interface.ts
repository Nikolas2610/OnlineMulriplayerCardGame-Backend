import { FeedPost } from "src/feed/models/post.interface";
import { Role } from "./role.enum";

export interface User {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    isEmailConfirmed?: boolean;
    refresh_token: string;
    role?: Role;
    posts?: FeedPost[];
}