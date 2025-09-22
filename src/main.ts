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

  // ---------------- CORS CONFIG (Production friendly) ----------------
  // NOTE: The production errors showed missing Access-Control-Allow-Origin on preflight (OPTIONS) requests.
  // Causes identified:
  // 1) We omitted the OPTIONS verb in methods => preflight did not get proper headers.
  // 2) Authorization header requires it to be explicitly allowed in some stricter environments.
  // 3) Vercel preview deployments (ruta-viajera-front-end-* .vercel.app) were not explicitly listed.
  // This block adds a dynamic origin validator and explicit allowedHeaders.

  const defaultOrigins = [
    'https://ruta-viajera-front-end.vercel.app', // main prod frontend
    'http://localhost:3001',
    'http://localhost:3000'
  ];
  // Allow comma separated list in ALLOWED_ORIGINS env (Railway dashboard)
  const envOrigins = process.env.ALLOWED_ORIGINS?.split(',')
    .map(o => o.trim())
    .filter(Boolean) || [];
  const staticAllowed = Array.from(new Set([...defaultOrigins, ...envOrigins]));

  // Regex for Vercel preview URLs (e.g., https://ruta-viajera-front-end-git-feature-branch-<hash>.vercel.app)
  const vercelPreviewRegex = /^https:\/\/ruta-viajera-front-end[-a-z0-9]*\.vercel\.app$/i;

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // SSR or same-origin
        return callback(null, true);
      }
      if (staticAllowed.includes(origin) || vercelPreviewRegex.test(origin)) {
        return callback(null, true);
      }
      console.warn('[CORS] Origin bloqueado:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','X-Requested-With'],
    exposedHeaders: ['Content-Length'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  console.log('[CORS] Orígenes estáticos permitidos:', staticAllowed);
  console.log('[CORS] Regex previews Vercel:', vercelPreviewRegex.toString());
  // -------------------------------------------------------------------

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
  // Bind to 0.0.0.0 for Railway / container platforms
  await app.listen(port, '0.0.0.0');
  const baseUrl = `http://localhost:${port}`;
  console.log(`[Nest] Backend listening on ${baseUrl}`);
  console.log(`Swagger docs: ${baseUrl}/api`);
}
bootstrap();
