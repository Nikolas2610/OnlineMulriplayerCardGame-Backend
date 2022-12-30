import { Controller, Get, Body, Patch, Request, Delete, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/role.enum';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AdminService } from './admin.service';
import { User } from './dto/user.dto';


@Controller('admin')
@Roles(Role.ADMIN)
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('dashboard')
  getDashboardDetails(): Promise<{ tables: number, games: number, decks: number, cards: number }> {
    return this.adminService.getDashboardDetails();
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Patch('user/edit')
  async updateUserDetails(@Body() updateUserAdminDto: User): Promise<UpdateResult> {
    return await this.adminService.updateUserDetails(updateUserAdminDto);
  }

  @Delete('user/delete')
  async deleteUser(@Body("id") userId: number): Promise<DeleteResult> {
    try {
      return await this.adminService.deleteUser(userId);
    } catch (error) {
      console.log(error);

      throw new HttpException({ status: HttpStatus.METHOD_NOT_ALLOWED, message: 'Can delete this user' }, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  @Get('decks')
  findAllDecks() {
    return this.adminService.findAllDecks();
  }

  @Get('games')
  findAllGames() {
    return this.adminService.findAllGames();
  }

  @Get('tables')
  findAllTables() {
    return this.adminService.findAllTables();
  }

  @Get('cards')
  findAllCards() {
    return this.adminService.findAllCards();
  }
}
