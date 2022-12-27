import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/admin/dto/user.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { UsersEntity } from 'src/entities/db/user.entity';
import { Repository } from 'typeorm';
import { UserPasswords } from './dto/user-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) { }
  async updateUsername(user: User, username: string): Promise<{ token: string }> {
    const response = await this.usersRepository.update(user.id, { username });
    if (response.affected === 1) {
      user.username = username;
      const token = await this.jwtService.signAsync(
        { user },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRATION_TIME
        })
      return { token };
    } else {
      throw new HttpException({ status: HttpStatus.BAD_REQUEST, error: 'Bad request' }, HttpStatus.BAD_REQUEST);
    }
  }

  async updatePassword(user: User, password: UserPasswords) {
    const userExists = await this.authService.validateUser(user.email, password.old_password);
    if (!userExists) {
      throw new HttpException({ status: HttpStatus.UNAUTHORIZED, error: 'User does not exist' }, HttpStatus.UNAUTHORIZED);
    }
    const newPassowrd = await this.authService.hashPassword(password.new_password);
    return await this.usersRepository.update(user.id, { password: newPassowrd });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
