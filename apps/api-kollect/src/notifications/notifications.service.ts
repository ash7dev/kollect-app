/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
 
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';


interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  type?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface SendNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private isInitialized = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  /**
   * Initialise Firebase Admin SDK
   */
  private initializeFirebase(): void {
    try {
      // Vérifier si Firebase est déjà initialisé
      if (admin.apps.length > 0) {
        this.logger.log('✅ Firebase Admin already initialized');
        this.isInitialized = true;
        return;
      }

      // Récupérer les credentials depuis les variables d'environnement
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      };

      // Vérifier que les variables sont définies
      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        this.logger.error('❌ Firebase credentials missing in environment variables');
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });

      this.isInitialized = true;
      this.logger.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('❌ Error initializing Firebase Admin SDK:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Envoie une notification push à un utilisateur
   */
  async sendPushNotification({
    userId,
    title,
    body,
    data = {},
    type = 'GENERALE',
    priority = 'MEDIUM',
  }: SendNotificationParams): Promise<SendNotificationResult> {
    try {
      if (!this.isInitialized) {
        this.logger.warn('⚠️ Firebase not initialized, skipping notification');
        return { success: false, error: 'Firebase not initialized' };
      }

      // Récupérer le token FCM de l'utilisateur
      const user = await this.prisma.utilisateur.findUnique({
        where: { id: userId },
        select: { fcmToken: true, email: true },
      });

      if (!user) {
        this.logger.warn(`⚠️ User not found: ${userId}`);
        return { success: false, error: 'User not found' };
      }

      if (!user.fcmToken) {
        this.logger.warn(`⚠️ No FCM token for user: ${user.email}`);
        return { success: false, error: 'No FCM token' };
      }

      // Convertir le token Expo en format compatible
      const fcmToken = this.convertExpoTokenToFCM(user.fcmToken);

      this.logger.log(`📤 Sending notification to ${user.email}`);

      // Préparer le message
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          type,
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: this.getAndroidPriority(priority),
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      // Envoyer la notification via FCM
      const response = await admin.messaging().send(message);

      this.logger.log(`✅ Notification sent successfully: ${response}`);

      // Sauvegarder la notification en base de données
      await this.prisma.notification.create({
        data: {
          userId,
          type: type as any,
          title,
          message: body,
          data: data as any,
          priority: priority as any,
          read: false,
        },
      });

      return { success: true, messageId: response };
    } catch (error) {
      this.logger.error('❌ Error sending notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Envoie une notification à plusieurs utilisateurs
   */
  async sendMulticastNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.sendPushNotification({
        userId,
        title,
        body,
        data,
      });

      if (result.success) {
        success++;
      } else {
        failed++;
      }
    }

    this.logger.log(`📊 Multicast result: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Met à jour le token FCM d'un utilisateur
   */
  async updateFCMToken(userId: string, fcmToken: string): Promise<void> {
    try {
      await this.prisma.utilisateur.update({
        where: { id: userId },
        data: { fcmToken },
      });

      this.logger.log(`✅ FCM token updated for user: ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Error updating FCM token:`, error);
      throw error;
    }
  }

  /**
   * Convertit un token Expo en token FCM (si nécessaire)
   */
  private convertExpoTokenToFCM(token: string): string {
    // Si c'est un token Expo, on utilise l'API Expo
    // Sinon, c'est déjà un token FCM natif
    if (token.startsWith('ExponentPushToken[')) {
      // Pour l'instant, on garde le token Expo tel quel
      // Plus tard, vous pourrez utiliser l'API Expo Push Notifications
      return token;
    }
    return token;
  }

  /**
   * Convertit la priorité en format Android
   */
  private getAndroidPriority(priority: string): 'high' | 'normal' {
    return priority === 'HIGH' || priority === 'URGENT' ? 'high' : 'normal';
  }

  /**
   * Envoie une notification de test
   */
  async sendTestNotification(userId: string): Promise<SendNotificationResult> {
    return this.sendPushNotification({
      userId,
      title: '🎉 Notification de test',
      body: 'Votre système de notifications fonctionne parfaitement !',
      data: {
        testId: Date.now().toString(),
      },
      type: 'NOUVELLE_VERSION',
      priority: 'HIGH',
    });
  }
}