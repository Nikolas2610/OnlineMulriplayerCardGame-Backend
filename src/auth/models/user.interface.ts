import { Role } from "./role.enum";

export interface User {
    id?: number;
    username?: string;
    email?: string;
    password?: string;
    email_confirmed?: boolean;
    refresh_token: string;
    role?: Role;
}