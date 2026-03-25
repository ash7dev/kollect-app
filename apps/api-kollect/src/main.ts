/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — doit être EN PREMIER, avant helmet, pour que les réponses OPTIONS
  // reçoivent les bons headers avant que helmet ne les modifie.
  // - L'app web envoie des cookies (withCredentials: true) → origin ne peut pas être '*'
  // - Le mobile utilise Bearer token → pas d'origin header → passe via !origin
  // ALLOWED_ORIGINS = liste séparée par des virgules, ex: "http://localhost:3001,https://kollect.sn"
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000'
  ).split(',').map((o) => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Pas d'origin = requête serveur-à-serveur ou mobile natif → ok
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin non autorisée : ${origin}`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true, // Obligatoire pour que le browser envoie les cookies
  });

  // Sécurité
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  );

  // Cookie parser — doit être avant les guards pour que req.cookies soit disponible
  app.use(cookieParser());

  // Logger HTTP
  app.use(morgan('dev'));

  // Validation automatique des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Retire les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Erreur si propriétés non autorisées
      transform: true, // Transforme automatiquement les types
    }),
  );

  // Préfixe API
  // On expose l'API à la fois sous /api et /api/v1 pour permettre
  // une transition progressive vers le versioning.
  app.setGlobalPrefix('api', {
    exclude: [
      { path: 's', method: RequestMethod.ALL },
      { path: 's/(.*)', method: RequestMethod.ALL },
      // On laisse également passer /api/v1/* pour être réécrit plus bas
      // afin que /api/v1 pointe sur les mêmes routes que /api.
      { path: 'api/v1/(.*)', method: RequestMethod.ALL },
    ],
  });

  // Réécriture simple pour supporter /api/v1/* vers les mêmes handlers que /api/*
  app.use((req, _res, next) => {
    if (req.url.startsWith('/api/v1/')) {
      req.url = req.url.replace('/api/v1/', '/api/');
    }
    next();
  });

  // Documentation OpenAPI / Swagger (accessible uniquement en développement par défaut)
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const config = new DocumentBuilder()
      .setTitle('Kollect API')
      .setDescription('Documentation de l’API Kollect (v1)')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    console.log(
      `📄 Swagger UI available at http://localhost:${process.env.PORT || 3000}/api/docs`,
    );
  }

  // Port depuis .env ou 3000 par défaut
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API available at http://localhost:${port}/api (legacy)`);
  console.log(`📚 API available at http://localhost:${port}/api/v1`);
}

// Gestion des erreurs pour la promesse non gérée
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
