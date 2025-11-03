import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT Payload interface
 */
interface JwtPayload {
  sub: string; // ID de l'utilisateur dans votre DB
  kindeId: string; // ID Kinde
  email: string;
  fcmToken?: string | null;
  roles?: {
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
  };
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated user type
 */
interface AuthenticatedUser {
  id: string;
  kindeId: string;
  email: string;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  roles: {
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
    fcmToken?: string | null;
  };
  firstName?: string | null;
  lastName?: string | null;
  brand?: any;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
      passReqToCallback: false,
    });
  }

  /**
   * Validate JWT token and return user
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    try {
      console.log('🔍 JWT Payload received:', JSON.stringify(payload, null, 2));

      // Vérifier que le payload contient bien kindeId
      if (!payload.kindeId) {
        console.error('❌ Missing kindeId in JWT payload');
        throw new UnauthorizedException('Invalid token: missing kindeId');
      }

      // Rechercher l'utilisateur par kindeId
      const user = await this.prisma.utilisateur.findUnique({
        where: { kindeId: payload.kindeId },
        include: { brand: true },
      });

      if (!user) {
        console.error(`❌ User not found for kindeId: ${payload.kindeId}`);
        throw new UnauthorizedException('User not found');
      }

      console.log('✅ User validated:', {
        id: user.id,
        email: user.email,
        roles: {
          isAdmin: user.isAdmin,
          isCEO: user.isCEO,
          isClient: user.isClient,
        },
      });

      // Retourner l'utilisateur authentifié avec les rôles
      const authenticatedUser: AuthenticatedUser = {
        id: user.id,
        kindeId: user.kindeId,
        email: user.email,
        isAdmin: user.isAdmin,
        isCEO: user.isCEO,
        isClient: user.isClient,
        roles: {
          isAdmin: user.isAdmin,
          isCEO: user.isCEO,
          isClient: user.isClient,
        },
        firstName: user.firstName,
        lastName: user.lastName,
        brand: user.brand,
        iat: payload.iat,
        exp: payload.exp,
      };

      return authenticatedUser;
    } catch (error) {
      console.error('💥 JWT Validation Error:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token validation failed');
    }
  }
}
