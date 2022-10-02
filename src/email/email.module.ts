import { forwardRef, Module } from '@nestjs/common';
import { EmailController } from './controllers/email.controller';
import { EmailService } from './services/email.service';
import { EmailConfirmationService } from './services/email-confirmation.service';
import { JwtService } from '@nestjs/jwt';
import { EmailConfirmationController } from './controllers/email-confirmation.controller';
import { AuthService } from 'src/auth/services/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [EmailController, EmailConfirmationController],
  providers: [EmailService, EmailConfirmationService, JwtService],
  exports: [EmailConfirmationService, EmailService]
})
export class EmailModule { }
