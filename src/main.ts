import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const PORT: number = Number(process.env.PORT) || 8080;

  await app.listen(PORT, () => {
    Logger.log(
      `Server running on port ${PORT} in ${process.env.NODE_ENV.toUpperCase()} env`,
    );
  });
}
bootstrap();
