/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  // Charger un template HTML
  private loadTemplate(filename: string): string {
    // 1) Chemin pour l'environnement buildé (dist/email/templates/...)
    const distPath = path.join(__dirname, 'templates', filename);
    if (fs.existsSync(distPath)) {
      return fs.readFileSync(distPath, 'utf8');
    }

    // 2) Fallback pour l'environnement dev (src/email/templates/...)
    // On repart de la racine du projet API
    const projectRoot = process.cwd();
    const srcTemplatePath = path.join(
      projectRoot,
      'apps',
      'api-kollect',
      'src',
      'email',
      'templates',
      filename,
    );

    if (fs.existsSync(srcTemplatePath)) {
      return fs.readFileSync(srcTemplatePath, 'utf8');
    }

    // Si aucun des chemins n'existe, on lève une erreur explicite
    throw new Error(
      `Template email introuvable: ${filename}. Chemins testés: ${distPath} et ${srcTemplatePath}`,
    );
  }

  // Remplacer les variables dynamiques
  private renderTemplate(template: string, data: any): string {
    return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
  }

  // Envoyer un email générique
  async sendTemplateEmail(to: string, subject: string, templateName: string, data: any) {
    const template = this.loadTemplate(templateName);
    const html = this.renderTemplate(template, data);

    return await this.resend.emails.send({
      from: 'Kollect <onboarding@resend.dev>', // pour développement
      to,
      subject,
      html,
    });
  }

  // ==========================
  // Templates spécifiques
  // ==========================

  // 1) Confirmation de commande côté client
  async sendClientConfirmationCommande(to: string, data: any) {
    return this.sendTemplateEmail(
      to,
      'Confirmation de ta commande',
      'client/confirmationCommande.html',
      data,
    );
  }

  // 1bis) Commande confirmée après validation CEO
  async sendClientCommandeConfirmee(to: string, data: any) {
    return this.sendTemplateEmail(
      to,
      'Ta commande est confirmée',
      'client/commandeConfirmee.html',
      data,
    );
  }

  // 2) Email de confirmation de création de marque
  async sendMarqueCreationEmail(to: string, data: any) {
    return this.sendTemplateEmail(
      to,
      'Bienvenue sur Kollect',
      'marque/creationMarque.html',
      data,
    );
  }

  // 3) Notification nouvelle commande pour la marque / CEO
  async sendMarqueNouvelleCommandeCEO(to: string, data: any) {
    return this.sendTemplateEmail(
      to,
      'Nouvelle commande reçue',
      'marque/nouvelleCommandeCEO.html',
      data,
    );
  }
}
