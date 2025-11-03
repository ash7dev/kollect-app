/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { NotificationsService, type SendNotificationResult } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../common/decorators/roles.decorator';

class UpdateFCMTokenDto {
  fcmToken: string;
}

class SendTestNotificationDto {
  userId: string;
}

class SendNotificationDto {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  type?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Met à jour le token FCM de l'utilisateur connecté
   */
  @Post('register-token')
  async registerToken(
    @GetUser() user: AuthenticatedUser,
    @Body() dto: UpdateFCMTokenDto,
  ) {
    await this.notificationsService.updateFCMToken(user.id, dto.fcmToken);
    return {
      success: true,
      message: 'FCM token registered successfully',
    };
  }

  /**
   * Envoie une notification de test à l'utilisateur connecté
   */
  @Post('test')
  async sendTestNotification(
    @GetUser() user: AuthenticatedUser,
  ): Promise<SendNotificationResult> {
    const result = await this.notificationsService.sendTestNotification(
      user.id,
    );
    return result;
  }

  /**
   * Envoie une notification de test à un utilisateur spécifique (Admin only)
   */
  @Post('test/:userId')
  async sendTestNotificationToUser(
    @Param('userId') userId: string,
    @Body() _dto: SendTestNotificationDto,
  ): Promise<SendNotificationResult> {
    const result = await this.notificationsService.sendTestNotification(userId);
    return result;
  }

  /**
   * Envoie une notification personnalisée (Admin only)
   */
  @Post('send')
  async sendNotification(
    @Body() dto: SendNotificationDto,
  ): Promise<SendNotificationResult> {
    const result = await this.notificationsService.sendPushNotification({
      userId: dto.userId,
      title: dto.title,
      body: dto.body,
      data: dto.data,
      type: dto.type,
      priority: dto.priority,
    });
    return result;
  }

  /**
   * Récupère toutes les notifications de l'utilisateur connecté
   */
  @Get('my-notifications')
  async getMyNotifications(@GetUser() user: AuthenticatedUser) {
    // TODO: Implémenter la récupération des notifications
    return {
      notifications: [],
      unreadCount: 0,
    };
  }

  /**
   * Marque une notification comme lue
   */
  @Patch(':notificationId/read')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @GetUser() _user: AuthenticatedUser,
  ) {
    // TODO: Implémenter la mise à jour
    return {
      success: true,
      message: 'Notification marked as read',
      notificationId,
    };
  }
}
