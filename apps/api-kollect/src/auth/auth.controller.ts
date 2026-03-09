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
  Param,
  Patch,
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
  constructor(private readonly authService: AuthService) { }

  /**
   * 🆕 Endpoint de santé pour vérifier si l'API est accessible
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
   * 🔐 Endpoint appelé après login/signup Supabase côté client
   * Vérifie le token Supabase, synchronise l'utilisateur dans notre DB
   * et retourne un JWT interne avec les rôles
   */
  @Public()
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncUser(
    @Body() syncUserDto: SyncUserDto,
  ): Promise<AuthResponseWithToken> {
    try {
      console.log('📥 [AUTH] Sync user request:', {
        hasToken: !!syncUserDto.supabaseAccessToken,
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
   * 🔄 Retourne les infos de l'utilisateur connecté avec un nouveau JWT
   * Permet de rafraîchir le token et les rôles
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: requestInterface.AuthRequest): Promise<AuthResponseWithToken> {
    try {
      if (!req.user?.supabaseId) {
        console.error('❌ [AUTH] Invalid user data in request');
        throw new UnauthorizedException('Invalid user data');
      }

      console.log('📥 [AUTH] Get profile request:', {
        supabaseId: req.user.supabaseId,
        email: req.user.email,
      });

      const result = await this.authService.getUserProfile(req.user.supabaseId);

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
   * 🚪 Endpoint de logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: requestInterface.AuthRequest) {
    try {
      console.log('🚪 [AUTH] Logout request:', {
        supabaseId: req.user?.supabaseId,
        email: req.user?.email,
      });

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
   * 📱 Endpoint pour mettre à jour le FCM token
   */
  @Post('fcm-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateFcmToken(
    @Req() req: requestInterface.AuthRequest,
    @Body('fcmToken') fcmToken: string,
  ) {
    try {
      if (!req.user?.supabaseId) {
        throw new UnauthorizedException('Invalid user data');
      }

      if (!fcmToken) {
        throw new UnauthorizedException('FCM token is required');
      }

      console.log('📱 [AUTH] Update FCM token:', {
        supabaseId: req.user.supabaseId,
        fcmToken: '***',
      });

      await this.authService.updateFcmToken(req.user.supabaseId, fcmToken);

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
   * 🔒 Endpoint protégé par rôle admin
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
   * 🧭 Met à jour le rôle de l'utilisateur et le statut has_seen_creator_prompt
   */
  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id') userId: string,
    @Body() body: { choice: 'client' | 'vendeur', hasSeenCreatorPrompt: boolean },
    @GetUser() user: AuthenticatedUser
  ): Promise<AuthResponseWithToken> {
    // Vérifier que l'utilisateur met à jour son propre profil ou est admin
    if (user.id !== userId && !user.isAdmin) {
      throw new UnauthorizedException('Not authorized to update this user');
    }

    try {
      console.log('🔄 [AUTH] Updating user role:', {
        userId,
        role: body.choice,
        hasSeenCreatorPrompt: body.hasSeenCreatorPrompt
      });

      return this.authService.updateUserRole(
        userId,
        body.choice,
        body.hasSeenCreatorPrompt
      );
    } catch (error) {
      console.error('❌ [AUTH] Update role error:', error);
      throw new UnauthorizedException('Failed to update user role');
    }
  }
}