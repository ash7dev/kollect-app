/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
 
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
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
import { Request } from '@nestjs/common';
import { AuthResponseWithToken } from './interfaces/auth-response.interface';
import type { AuthenticatedUser } from '../common/decorators/roles.decorator';
import * as requestInterface from '../common/interfaces/request.requestInterface';

@Controller('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('admin/dashboard')
  @Roles('isAdmin')
  getAdminDashboard(@GetUser() user: AuthenticatedUser) {
    return {
      message: 'Tableau de bord administrateur',
      user: {
        email: user.email,
        roles: user.roles,
        prenom: user.firstName,
        nom: user.lastName
      }
    };
  }

  /**
   * Endpoint appelé après le login Kinde côté mobile
   * Synchronise l'utilisateur dans notre DB et retourne un JWT avec ses rôles
   */
  @Public()
  @Post('sync')
  async syncUser(
    @Body() syncUserDto: SyncUserDto,
  ): Promise<AuthResponseWithToken> {
    try {
      return await this.authService.syncUser(syncUserDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnauthorizedException(error.message);
      }
      throw new UnauthorizedException('Failed to sync user');
    }
  }

  /**
   * Retourne les infos de l'utilisateur connecté avec ses rôles
   * ET un nouveau JWT avec les rôles actualisés
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: requestInterface.AuthRequest): Promise<AuthResponseWithToken> {
    try {
      if (!req.user?.kindeId) {
        throw new UnauthorizedException('Invalid user data');
      }

       
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return await this.authService.getUserProfile(req.user.kindeId);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Failed to fetch user profile');
    }
  }

  /**
   * Webhook Kinde (optionnel - pour sync automatique)
   * Appelé par Kinde lors d'événements (user.created, user.updated)
   */
  @Post('webhook/kinde')
  handleKindeWebhook(@Body() payload: unknown): { received: boolean } {
    try {
      this.authService.handleKindeWebhook(payload);
      return { received: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid webhook payload');
    }
  }
}
