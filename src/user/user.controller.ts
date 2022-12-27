import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserPasswords } from './dto/user-password.dto';
import { Public } from 'src/auth/guards/public';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RefreshToken } from 'src/auth/guards/refresh-token.guard';


@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch('edit/username')
  updateUsername(
    @Body('username') username: string,
    @Request() req: any
  ) {
    return this.userService.updateUsername(req.user, username);
  }

  @Patch('edit/password')
  updatePassword(
    @Body() passwords: UserPasswords,
    @Request() req: any
  ) {
    return this.userService.updatePassword(req.user, passwords);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Public()
  @Get('test')
  test() {
    return 'Public'
  }

  @UseGuards(RefreshToken)
  @Get('testAuth')
  testAuth() {
    return 'testAuth'
  }
}
