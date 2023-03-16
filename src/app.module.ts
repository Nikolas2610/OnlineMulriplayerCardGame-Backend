import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { DeckModule } from './deck/deck.module';
import { CardModule } from './card/card.module';
import { GameModule } from './game/game.module';
import { TableModule } from './table/table.module';
import { RankModule } from './rank/rank.module';
import { EntitiesModule } from './entities/entities.module';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/guards/jwt.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { OnlineTableModule } from './websockets/online-table/online-table.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(<string>process.env.MYSQL_PORT),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      migrationsRun: false,
      logging: false,
      dropSchema: false
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD
        }
      },
      template: {
        dir: join(__dirname, 'email-templates'),
        adapter: new HandlebarsAdapter()
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    AuthModule, EmailModule, DeckModule, CardModule, GameModule, TableModule, RankModule, EntitiesModule, AdminModule, UserModule, OnlineTableModule],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard
    }]
})
export class AppModule { }
