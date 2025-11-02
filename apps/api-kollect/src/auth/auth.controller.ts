/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { AuthRequest } from '../common/types/request.types';
import { AuthResponseWithToken } from './interfaces/auth-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint appelé après le login Kinde côté mobile
   * Synchronise l'utilisateur dans notre DB et retourne un JWT avec ses rôles
   */
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
  async getProfile(@Req() req: AuthRequest): Promise<AuthResponseWithToken> {
    try {
      if (!req.user?.kindeId) {
        throw new UnauthorizedException('Invalid user data');
      }

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
