/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { SyncUserDto } from './dto/sync-user.dto';
import { AuthResponseWithToken } from './interfaces/auth-response.interface';

type UserWithRoles = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  supabaseId: string;
  brand?: {
    id: string;
    slug: string;
    name: string;
    isVerified: boolean;
  } | null;
};

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private metricsService: MetricsService,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
  }

  // ============================================
  // HELPERS PRIVÉS
  // ============================================

  private toUserProfile(user: {
    id: string;
    supabaseId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    avatar?: string | null;
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
    address?: string | null;
    has_seen_creator_prompt?: boolean;
    brand?: {
      id: string;
      slug: string;
      name: string;
      isVerified: boolean;
    } | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    fcmToken?: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date | null;
  }): AuthResponseWithToken['user'] {
    return {
      id: user.id,
      supabaseId: user.supabaseId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? undefined,
      avatar: user.avatar ?? undefined,
      isAdmin: user.isAdmin,
      isCEO: user.isCEO,
      isClient: user.isClient,
      has_seen_creator_prompt: user.has_seen_creator_prompt ?? false,
      brand: user.brand ?? null,
      address: user.address ?? undefined,
      city: user.city ?? undefined,
      postalCode: user.postalCode ?? undefined,
      country: user.country ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
    };
  }

  private generateJwtToken(
    user: {
      id: string;
      supabaseId: string;
      email: string;
      isAdmin: boolean;
      isCEO: boolean;
      isClient: boolean;
      has_seen_creator_prompt?: boolean;
    },
    brand: { id: string; slug: string; name: string; isVerified: boolean } | null = null,
  ): string {
    const payload = {
      sub: user.id,
      supabaseId: user.supabaseId,
      email: user.email,
      roles: {
        isAdmin: user.isAdmin,
        isCEO: user.isCEO,
        isClient: user.isClient,
      },
      isAdmin: user.isAdmin,
      isCEO: user.isCEO,
      isClient: user.isClient,
      has_seen_creator_prompt: user.has_seen_creator_prompt ?? false,
      brand: brand ?? null,
    };

    console.log('🔑 Generating JWT with payload:', JSON.stringify(payload, null, 2));
    return this.jwtService.sign(payload);
  }

  private async getBrandForToken(userId: string) {
    try {
      const brand = await this.prisma.marque.findUnique({
        where: { userId },
        select: {
          id: true,
          slug: true,
          name: true,
          isVerified: true,
        },
      });
      return brand || null;
    } catch {
      return null;
    }
  }

  // ============================================
  // VÉRIFICATION TOKEN SUPABASE
  // ============================================

  /**
   * Vérifie un token Supabase et retourne les infos utilisateur
   */
  async verifySupabaseToken(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      console.error('❌ [AUTH] Supabase token verification failed:', error?.message);
      throw new UnauthorizedException('Invalid Supabase token');
    }

    return data.user;
  }

  // ============================================
  // ACTIONS PUBLIQUES
  // ============================================

  /**
   * Synchronise un utilisateur Supabase avec notre DB
   * Appelé après login/signup Supabase côté client
   */
  async syncUser(syncUserDto: SyncUserDto): Promise<AuthResponseWithToken> {
    const { supabaseAccessToken, fcmToken } = syncUserDto;

    try {
      // 1. Vérifier le token Supabase côté serveur
      const supabaseUser = await this.verifySupabaseToken(supabaseAccessToken);

      console.log('📥 [AUTH] Syncing Supabase user:', {
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
      });

      const updateData: any = {
        email: supabaseUser.email,
        firstName: supabaseUser.user_metadata?.full_name?.split(' ')[0] ??
          supabaseUser.user_metadata?.given_name ?? null,
        lastName: supabaseUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') ??
          supabaseUser.user_metadata?.family_name ?? null,
        avatar: supabaseUser.user_metadata?.avatar_url ??
          supabaseUser.user_metadata?.picture ?? null,
        lastLoginAt: new Date(),
      };

      // Ajouter le FCM token si fourni
      if (fcmToken) {
        updateData.fcmToken = fcmToken;
        console.log('📱 Updating FCM token');
      }

      // 2. Vérifier si l'utilisateur existe déjà par email (transition Kinde -> Supabase)
      let user;
      const existingUser = await this.prisma.utilisateur.findUnique({
        where: { email: supabaseUser.email || '' },
      });

      if (existingUser && !existingUser.supabaseId) {
        // Utilisateur existant de l'époque Kinde, on met à jour avec supabaseId
        user = await this.prisma.utilisateur.update({
          where: { id: existingUser.id },
          data: {
            supabaseId: supabaseUser.id,
            ...updateData,
          },
        });
      } else {
        // Upsert normal par supabaseId
        user = await this.prisma.utilisateur.upsert({
          where: { supabaseId: supabaseUser.id },
          update: updateData,
          create: {
            supabaseId: supabaseUser.id,
            email: supabaseUser.email || '',
            firstName: updateData.firstName,
            lastName: updateData.lastName,
            avatar: updateData.avatar,
            fcmToken: fcmToken ?? null,
            isClient: true,
            isAdmin: false,
            isCEO: false,
            lastLoginAt: new Date(),
          },
        });
      }

      // 3. Générer notre JWT interne
      const brand = await this.getBrandForToken(user.id);
      const token = this.generateJwtToken(user, brand);
      const userProfileResponse = this.toUserProfile(user);

      this.metricsService.incrementUserRegistered();

      return {
        access_token: token,
        user: {
          ...userProfileResponse,
          brand,
        },
      };
    } catch (error: any) {
      console.error('❌ [AUTH] Sync error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException(`Sync failed: ${error?.message || error}`);
    }
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  async updateUserRole(
    userId: string,
    role: 'client' | 'vendeur',
    hasSeenCreatorPrompt: boolean,
  ): Promise<AuthResponseWithToken> {
    try {
      const currentUser = await this.prisma.utilisateur.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      const isFirstUpgradeToSeller = !currentUser.isCEO && role === 'vendeur';

      const [updatedUser] = await this.prisma.$transaction([
        this.prisma.utilisateur.update({
          where: { id: userId },
          data: {
            isClient: role === 'client',
            isCEO: role === 'vendeur',
            has_seen_creator_prompt: hasSeenCreatorPrompt,
          },
        }),
        ...(isFirstUpgradeToSeller
          ? [
            this.prisma.favori.deleteMany({ where: { userId } }),
            this.prisma.notification.deleteMany({ where: { userId } }),
          ]
          : []),
      ]);

      const brand = await this.getBrandForToken(updatedUser.id);
      const token = this.generateJwtToken(
        {
          id: updatedUser.id,
          supabaseId: updatedUser.supabaseId,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          isCEO: updatedUser.isCEO,
          isClient: updatedUser.isClient,
          has_seen_creator_prompt: updatedUser.has_seen_creator_prompt,
        },
        brand,
      );

      return {
        access_token: token,
        user: this.toUserProfile(updatedUser),
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Récupérer le profil utilisateur par supabaseId
   */
  async getUserProfile(supabaseId: string): Promise<AuthResponseWithToken> {
    try {
      const user = await this.prisma.utilisateur.findUnique({
        where: { supabaseId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const brand = await this.getBrandForToken(user.id);
      const token = this.generateJwtToken(user, brand);
      const userProfileResponse = this.toUserProfile(user);

      return {
        access_token: token,
        user: {
          ...userProfileResponse,
          brand,
        },
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new UnauthorizedException('Failed to fetch user profile');
    }
  }

  /**
   * Mettre à jour le FCM token
   */
  async updateFcmToken(supabaseId: string, fcmToken: string): Promise<void> {
    try {
      console.log('📱 [AUTH] Updating FCM token:', {
        supabaseId,
        fcmToken: '***',
      });

      await this.prisma.utilisateur.update({
        where: { supabaseId },
        data: { fcmToken },
      });

      console.log('✅ [AUTH] FCM token updated successfully');
    } catch (error) {
      console.error('❌ [AUTH] Error updating FCM token:', error);
      throw new Error('Failed to update FCM token');
    }
  }

  /**
   * Valider un utilisateur par email
   */
  async validateUser(email: string): Promise<UserWithRoles | null> {
    try {
      const user = await this.prisma.utilisateur.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      return user as UserWithRoles;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }
}