import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  app.enableCors({
    origin: configService.get<string>('cors.origin', 'http://localhost:3000'),
    credentials: true,
  });

  app.setGlobalPrefix(configService.get<string>('app.prefix', 'api'), {
    exclude: ['health', 'health.json'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  const port = configService.get<number>('app.port', 3001);
  await app.listen(port);
  console.log(`🚀 Cielo API running on: http://localhost:${port}/api`);
}

bootstrap();
