import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './models/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { EmailConfirmationService } from 'src/email/services/email-confirmation.service';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/services/email.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '3600s' }
      })
    }),
    TypeOrmModule.forFeature([UsersEntity]),forwardRef(() => EmailModule)],
  providers: [AuthService, JwtGuard, JwtStrategy, RolesGuard, EmailConfirmationService, EmailService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
