import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleService } from 'nestjs-console';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const consoleService = app.get(ConsoleService);
    consoleService.setContainer(app);
    await consoleService.init(process.argv.slice(2));
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors de l'exécution de la commande:", error);
    process.exit(1);
  }
}

void bootstrap();
