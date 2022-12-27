import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/role.enum';
import { AdminService } from './admin.service';
import { User } from './dto/user.dto';


@Controller('admin')
@Roles(Role.ADMIN)
@UseGuards(JwtGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Patch('user/edit')
  updateUserDetails(@Body() updateUserAdminDto: User) {
    return this.adminService.updateUserDetails(updateUserAdminDto);
  }

  @Delete('user/delete')
  deleteUser(@Body("id") userId: number) {
    return this.adminService.deleteUser(userId);
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
