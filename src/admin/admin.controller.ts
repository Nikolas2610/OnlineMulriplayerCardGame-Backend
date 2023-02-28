import { Controller, Get, Body, Patch, Request, Delete, UseGuards, HttpException, HttpStatus, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/models/role.enum';
import { EditCardDto } from 'src/card/dto/EditCard.dto';
import { CardsEntity } from 'src/entities/db/cards.entity';
import { DecksEntity } from 'src/entities/db/decks.entity';
import { TablesEntity } from 'src/entities/db/tables.entity';
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
      throw new HttpException({ status: HttpStatus.METHOD_NOT_ALLOWED, message: 'Can delete this user' }, HttpStatus.METHOD_NOT_ALLOWED);
    }
  }

  @Get('decks')
  findAllDecks() {
    return this.adminService.findAllDecks();
  }

  @Patch('deck')
  async editDeck(
    @Request() req: any,
    @Body() deck: DecksEntity
  ) {
    return await this.adminService.editDeck(deck);
  }

  @Delete('deck')
  async deleteDeck(
    @Request() req: any,
    @Body('deck_id') deck_id: number
  ) {
    return await this.adminService.deleteDeck(deck_id)
  }

  @Get('games')
  findAllGames() {
    return this.adminService.findAllGames();
  }

  @Get('tables')
  findAllTables() {
    return this.adminService.findAllTables();
  }

  @Patch('table')
  updateTable(
    @Body('table') table: TablesEntity
  ) {
    return this.adminService.updateTable(table);
  }

  @Delete('table')
  deleteTable(
    @Body('id') id: number
  ) {
    return this.adminService.deleteTable(id);
  }

  @Get('cards')
  findAllCards() {
    return this.adminService.findAllCards();
  }

  @Patch('card')
  @UseInterceptors(FileInterceptor('image'))
  async updateCard(
    @Body() card: EditCardDto,
    @Request() req: any
  ): Promise<CardsEntity> {
    return await this.adminService.updateCardWithoutImage(card);
  }

  @Patch('card/image')
  @UseInterceptors(FileInterceptor('image'))
  async updateCardWithImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|svg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    ) image: Express.Multer.File,
    @Body() card: EditCardDto,
    @Request() req: any
  ): Promise<CardsEntity> {
    return await this.adminService.updateCardWithImage(card, image);
  }

  @Delete('card')
  async deleteCard(
    @Request() req: any,
    @Body('card_id') card_id: number,
  ) {
    return await this.adminService.deleteCard(card_id);
  }
}
