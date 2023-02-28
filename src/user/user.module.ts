import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { EntitiesModule } from 'src/entities/entities.module';
import { AuthService } from 'src/auth/services/auth.service';
import { EmailConfirmationService } from 'src/email/services/email-confirmation.service';
import { EmailModule } from 'src/email/email.module';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { GameService } from 'src/game/game.service';

@Module({
  imports: [EntitiesModule, forwardRef(() => EmailModule)],
  controllers: [UserController],
  providers: [UserService, GameService, AuthService, EmailConfirmationService, JwtService]
})
export class UserModule { }
