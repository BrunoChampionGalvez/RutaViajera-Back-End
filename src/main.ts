import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerGlobalMiddleware } from './middlewares/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cors from 'cors';
import * as session from 'express-session';
import { config as dotenvConfig } from 'dotenv';
import * as passport from 'passport';
import { join } from 'path';
import * as express from 'express';

dotenvConfig({ path: './.development.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Documentación RutaViajera')
    .setDescription(
      'Esta es la documentación del back end del sitio web Ruta Viajera en donde encontrarán todas las rutas y los datos que se necesitan enviar para que funcionen.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // Allow overriding origins via .env (ALLOWED_ORIGINS comma separated) while keeping safe defaults for local dev
  const defaultOrigins = [
    'https://ruta-viajera-front-end.vercel.app',
    'http://localhost:3001',
    'http://localhost:3000'
  ];
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) || [];
  const origins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(LoggerGlobalMiddleware);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Static serving for uploaded images (room types, etc.)
  const uploadsPath = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));
  // Make port configurable. Requested configuration: backend on port 3000.
  // Set PORT env var if you ever need to change it.
  const port = process.env.PORT || 3000;
  await app.listen(port);
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Nest] Backend listening on ${baseUrl}`);
  console.log(`Swagger docs: ${baseUrl}/api`);
}
bootstrap();
