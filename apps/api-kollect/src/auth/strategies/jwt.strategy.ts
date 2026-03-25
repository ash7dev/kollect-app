import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * JWT Payload interface — notre JWT interne (pas celui de Supabase)
 */
interface JwtPayload {
  sub: string; // ID de l'utilisateur dans notre DB
  supabaseId: string; // ID Supabase Auth
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
  has_seen_creator_prompt: boolean;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated user type
 */
interface AuthenticatedUser {
  id: string;
  supabaseId: string;
  email: string;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  has_seen_creator_prompt: boolean;
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
      // Priorité : cookie httpOnly (web) → puis Bearer header (mobile)
      // Cela garantit la compatibilité avec l'app mobile existante.
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => req?.cookies?.['kollect_jwt'] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
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

      // Vérifier que le payload contient bien supabaseId
      if (!payload.supabaseId) {
        console.error('❌ Missing supabaseId in JWT payload');
        throw new UnauthorizedException('Invalid token: missing supabaseId');
      }

      // Rechercher l'utilisateur par supabaseId
      const user = await this.prisma.utilisateur.findUnique({
        where: { supabaseId: payload.supabaseId },
        include: { brand: true },
      });

      if (!user) {
        console.error(`❌ User not found for supabaseId: ${payload.supabaseId}`);
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
        supabaseId: user.supabaseId,
        email: user.email,
        isAdmin: user.isAdmin,
        isCEO: user.isCEO,
        has_seen_creator_prompt: user.has_seen_creator_prompt ?? false,
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
