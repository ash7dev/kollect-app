/* eslint-disable prettier/prettier */
 
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
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
  kindeId: string;
  password?: string;
};

@Injectable()
export class AuthService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleKindeWebhook(_payload: unknown) {
    throw new Error('Method not implemented.');
  }
  
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private toUserProfile(user: {
    id: string;
    kindeId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
    avatar?: string | null;
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
    address?: string | null;
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
      kindeId: user.kindeId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? undefined,
      avatar: user.avatar ?? undefined,
      isAdmin: user.isAdmin,
      isCEO: user.isCEO,
      isClient: user.isClient,
      address: user.address ?? undefined,
      city: user.city ?? undefined,
      postalCode: user.postalCode ?? undefined,
      country: user.country ?? undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined,
    };
  }

  private generateJwtToken(user: {
    id: string;
    kindeId: string;
    email: string;
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
  }): string {
    const payload = {
      sub: user.id,
      kindeId: user.kindeId,
      email: user.email,
      roles: {
        isAdmin: user.isAdmin,
        isCEO: user.isCEO,
        isClient: user.isClient,
      },
      isAdmin: user.isAdmin,
      isCEO: user.isCEO,
      isClient: user.isClient,
    };

    console.log(
      '🔑 Generating JWT with payload:',
      JSON.stringify(payload, null, 2),
    );
    return this.jwtService.sign(payload);
  }

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

  async login(loginDto: LoginDto): Promise<AuthResponseWithToken> {
    try {
      const user = await this.validateUser(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      await this.prisma.utilisateur.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const userProfile = await this.prisma.utilisateur.findUnique({
        where: { id: user.id },
      });

      if (!userProfile) {
        throw new UnauthorizedException('User not found');
      }

      const token = this.generateJwtToken(userProfile);
      const userProfileResponse = this.toUserProfile(userProfile);

      return {
        access_token: token,
        user: userProfileResponse,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseWithToken> {
    try {
      await this.prisma.utilisateur.create({
        data: {
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName || null,
          isClient: true,
          isAdmin: false,
          isCEO: false,
          kindeId: `local_${Date.now()}`,
        },
      });

      // After registration, log the user in with their credentials
      return this.login({
        email: registerDto.email,
        password: registerDto.password
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new UnauthorizedException('Email already in use');
        }
      }
      console.error('Registration error:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }

  /**
   * Synchronise l'utilisateur et met à jour le FCM token si fourni
   */
  async syncUser(syncUserDto: SyncUserDto): Promise<AuthResponseWithToken> {
    const { kindeId, email, firstName, lastName, avatar, fcmToken } = syncUserDto;

    try {
      console.log('📥 Syncing user:', JSON.stringify(syncUserDto, null, 2));

      const updateData: any = {
        email,
        firstName: firstName ?? null,
        lastName: lastName ?? null,
        avatar: avatar ?? null,
        lastLoginAt: new Date(),
      };

      // Ajouter le FCM token si fourni
      if (fcmToken) {
        updateData.fcmToken = fcmToken;
        console.log('📱 Updating FCM token:', fcmToken);
      }

      const user = await this.prisma.utilisateur.upsert({
        where: { kindeId },
        update: updateData,
        create: {
          kindeId,
          email,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          avatar: avatar ?? null,
          fcmToken: fcmToken ?? null,
          isClient: true,
          isAdmin: false,
          isCEO: false,
          lastLoginAt: new Date(),
        },
      });

      const token = this.generateJwtToken(user);
      const userProfileResponse = this.toUserProfile(user);

      return {
        access_token: token,
        user: userProfileResponse,
      };
    } catch (error) {
      console.error('Sync error:', error);
      throw new UnauthorizedException('Sync failed');
    }
  }

  async getUserProfile(kindeId: string): Promise<AuthResponseWithToken> {
    try {
      const user = await this.prisma.utilisateur.findUnique({
        where: { kindeId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const token = this.generateJwtToken(user);
      const userProfileResponse = this.toUserProfile(user);

      return {
        access_token: token,
        user: userProfileResponse,
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new UnauthorizedException('Failed to fetch user profile');
    }
  }

 
async updateFcmToken(kindeId: string, fcmToken: string): Promise<void> {
  try {
    console.log('📱 [AUTH] Updating FCM token:', {
      kindeId,
      fcmToken: '***',
    });

    await this.prisma.utilisateur.update({
      where: { kindeId },
      data: { fcmToken },
    });

    console.log('✅ [AUTH] FCM token updated successfully');
  } catch (error) {
    console.error('❌ [AUTH] Error updating FCM token:', error);
    throw new Error('Failed to update FCM token');
  }
}
}