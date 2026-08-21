import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from '@verqik/common';
import { deployMigrations } from '@verqik/database';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'development') {
    console.log('Running database migrations (dev)...');
    deployMigrations();
  }

  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const frontendUrl = config.get<string>('FRONTEND_URL');
  const corsPermissive =
    config.get<string>('CORS_PERMISSIVE', 'false') === 'true';

  app.enableCors({
    origin: corsPermissive ? true : frontendUrl ? [frontendUrl] : false,
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Verqik API')
    .setDescription('Crowdshipping platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`HTTP API:  http://localhost:${port}/api`);
  console.log(`WebSocket: ws://localhost:${port} (Socket.IO)`);
}

bootstrap();
