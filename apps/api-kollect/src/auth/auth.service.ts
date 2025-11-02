/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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

  /**
   * Génère un JWT complet avec kindeId et rôles
   * ⚠️ MÉTHODE CRITIQUE - Tous les champs sont nécessaires pour jwt.strategy.ts
   */
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
      kindeId: user.kindeId, // ✅ REQUIS pour jwt.strategy.ts
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

      // ✅ Utilisation de generateJwtToken avec tous les champs
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

      return this.login({
        email: registerDto.email,
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

  async syncUser(syncUserDto: SyncUserDto): Promise<AuthResponseWithToken> {
    const { kindeId, email, firstName, lastName, avatar } = syncUserDto;

    try {
      console.log('📥 Syncing user:', JSON.stringify(syncUserDto, null, 2));

      const user = await this.prisma.utilisateur.upsert({
        where: { kindeId },
        update: {
          email,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          avatar: avatar ?? null,
          lastLoginAt: new Date(),
        },
        create: {
          kindeId,
          email,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          avatar: avatar ?? null,
          isClient: true,
          isAdmin: false,
          isCEO: false,
          lastLoginAt: new Date(),
        },
      });

      // ✅ Utilisation de generateJwtToken avec tous les champs
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

      // ✅ Utilisation de generateJwtToken avec tous les champs
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
}
