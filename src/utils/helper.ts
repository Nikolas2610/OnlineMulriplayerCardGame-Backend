import * as bcrypt from 'bcrypt';

// Hash the password
export const hashPassword = async (password: string): Promise<string> => {
    return bcrypt.hash(password, 12);
}