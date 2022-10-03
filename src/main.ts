import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // start url with api after domain
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({
    forbidNonWhitelisted: true
  }));
  await app.listen(3000);
}
bootstrap();
