/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../common/guards/roles.guard';
import { GetUser } from '../common/decorators/roles.decorator';
import { SetMetadata } from '@nestjs/common';

// Décorateur pour définir les rôles requis
const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
import { AuthResponseWithToken } from './interfaces/auth-response.interface';
import type { AuthenticatedUser } from '../common/decorators/roles.decorator';
import * as requestInterface from '../common/interfaces/request.interface';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 🆕 AMÉLIORATION : Endpoint de santé pour vérifier si l'API est accessible
   */
  @Public()
  @Get('health')
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Endpoint appelé après le login Kinde côté mobile
   * Synchronise l'utilisateur dans notre DB et retourne un JWT avec ses rôles
   */
  @Public()
  @Post('sync')
  @HttpCode(HttpStatus.OK) // 🆕 Retourner 200 au lieu de 201
  async syncUser(
    @Body() syncUserDto: SyncUserDto,
  ): Promise<AuthResponseWithToken> {
    try {
      console.log('📥 [AUTH] Sync user request:', {
        kindeId: syncUserDto.kindeId,
        email: syncUserDto.email,
        fcmToken: syncUserDto.fcmToken ? '***' : 'none',
      });

      const result = await this.authService.syncUser(syncUserDto);
      
      console.log('✅ [AUTH] Sync successful:', {
        userId: result.user.id,
        roles: {
          isAdmin: result.user.isAdmin,
          isCEO: result.user.isCEO,
          isClient: result.user.isClient,
        },
      });

      return result;
    } catch (error) {
      console.error('❌ [AUTH] Sync error:', error);
      
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Failed to sync user');
    }
  }

  /**
   * 🆕 AMÉLIORATION : Retourne les infos de l'utilisateur connecté avec un nouveau JWT
   * Permet de rafraîchir le token et les rôles
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: requestInterface.AuthRequest): Promise<AuthResponseWithToken> {
    try {
      if (!req.user?.kindeId) {
        console.error('❌ [AUTH] Invalid user data in request');
        throw new UnauthorizedException('Invalid user data');
      }

      console.log('📥 [AUTH] Get profile request:', {
        kindeId: req.user.kindeId,
        email: req.user.email,
      });

      const result = await this.authService.getUserProfile(req.user.kindeId);
      
      console.log('✅ [AUTH] Profile fetched:', {
        userId: result.user.id,
        roles: {
          isAdmin: result.user.isAdmin,
          isCEO: result.user.isCEO,
          isClient: result.user.isClient,
        },
      });

      return result;
    } catch (error) {
      console.error('❌ [AUTH] Get profile error:', error);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to fetch user profile');
    }
  }

  /**
   * 🆕 AMÉLIORATION : Endpoint de logout pour invalider le token côté serveur
   * (optionnel si vous voulez implémenter une blacklist de tokens)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: requestInterface.AuthRequest) {
    try {
      console.log('🚪 [AUTH] Logout request:', {
        kindeId: req.user?.kindeId,
        email: req.user?.email,
      });

      // TODO: Implémenter une blacklist de tokens si nécessaire
      // await this.authService.blacklistToken(token);

      return {
        message: 'Logged out successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [AUTH] Logout error:', error);
      throw new UnauthorizedException('Failed to logout');
    }
  }

  /**
   * 🆕 AMÉLIORATION : Endpoint pour mettre à jour le FCM token
   * Permet de mettre à jour le token de notification sans refaire un login complet
   */
  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateFcmToken(
    @Req() req: requestInterface.AuthRequest,
    @Body('fcmToken') fcmToken: string,
  ) {
    try {
      if (!req.user?.kindeId) {
        throw new UnauthorizedException('Invalid user data');
      }

      if (!fcmToken) {
        throw new UnauthorizedException('FCM token is required');
      }

      console.log('📱 [AUTH] Update FCM token:', {
        kindeId: req.user.kindeId,
        fcmToken: '***',
      });

      await this.authService.updateFcmToken(req.user.kindeId, fcmToken);

      return {
        message: 'FCM token updated successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ [AUTH] Update FCM token error:', error);
      throw new UnauthorizedException('Failed to update FCM token');
    }
  }

  /**
   * Exemple d'endpoint protégé par rôle
   */
  @Get('admin/dashboard')
  @Roles('isAdmin')
  @HttpCode(HttpStatus.OK)
  getAdminDashboard(@GetUser() user: AuthenticatedUser) {
    return {
      message: 'Tableau de bord administrateur',
      user: {
        email: user.email,
        roles: user.roles,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Webhook Kinde (optionnel - pour sync automatique)
   * Appelé par Kinde lors d'événements (user.created, user.updated)
   */
  @Public()
  @Post('webhook/kinde')
  @HttpCode(HttpStatus.OK)
  handleKindeWebhook(@Body() payload: unknown): { received: boolean } {
    try {
      console.log('🔔 [AUTH] Kinde webhook received:', payload);
      
      this.authService.handleKindeWebhook(payload);
      
      return { received: true };
    } catch (error) {
      console.error('❌ [AUTH] Webhook error:', error);
      throw new UnauthorizedException('Invalid webhook payload');
    }
  }
}