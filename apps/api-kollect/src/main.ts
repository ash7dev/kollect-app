// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import morgan from 'morgan'; // Modification ici

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurité
  app.use(helmet());

  // CORS (autoriser le mobile à appeler l'API)
  app.enableCors({
    origin: '*', // En prod: mettre les domaines autorisés
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
  app.setGlobalPrefix('api');

  // Port depuis .env ou 3000 par défaut
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 API available at http://localhost:${port}/api`);
}

// Gestion des erreurs pour la promesse non gérée
bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
