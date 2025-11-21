/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  // Charger un template HTML
  private loadTemplate(filename: string): string {
    // 1) Chemin pour l'environnement buildé (dist/email/templates/...)
    const distPath = path.join(__dirname, 'templates', filename);
    if (fs.existsSync(distPath)) {
      return fs.readFileSync(distPath, 'utf8');
    }

    // 2) Fallback pour l'environnement dev (src/email/templates/...)
    // On repart du répertoire courant de l'app API (apps/api-kollect)
    const projectRoot = process.cwd();
    const srcTemplatePath = path.join(
      projectRoot,
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
    const from = process.env.EMAIL_FROM || 'Kollect <no-reply@kollect.app>';

    return await this.transporter.sendMail({
      from,
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
