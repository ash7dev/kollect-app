/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandesService } from '../commandes.service';

@Injectable()
export class CommandeAutoCancelProcessor {
  private readonly logger = new Logger(CommandeAutoCancelProcessor.name);

  constructor(private readonly commandesService: CommandesService) {}

  /**
   * Cron job: Auto-annulation des commandes après 48h
   * S'exécute toutes les heures
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleCommandeAutoCancel() {
    this.logger.log('🔄 Début de l\'auto-annulation des commandes expirées');

    try {
      const result = await this.commandesService.autoAnnulerCommandesExpirees();

      this.logger.log(
        `✅ Auto-annulation terminée: ${result.annulees}/${result.total} commandes annulées`,
      );

      if (result.echecs > 0) {
        this.logger.warn(`⚠️ ${result.echecs} échecs lors de l'auto-annulation`);
        this.logger.debug(JSON.stringify(result.details.filter(d => !d.success)));
      }

      return result;
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'auto-annulation des commandes', error.stack);
      throw error;
    }
  }

  /**
   * Pour les tests: exécuter manuellement l'auto-annulation
   */
  async runManually() {
    return this.handleCommandeAutoCancel();
  }
}