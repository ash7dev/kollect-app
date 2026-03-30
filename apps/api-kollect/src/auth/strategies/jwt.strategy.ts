import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type Redis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';

interface JwtPayload {
  sub: string;
  supabaseId: string;
  email: string;
  fcmToken?: string | null;
  roles?: { isAdmin: boolean; isCEO: boolean; isClient: boolean };
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  has_seen_creator_prompt: boolean;
  iat?: number;
  exp?: number;
}

interface AuthenticatedUser {
  id: string;
  supabaseId: string;
  email: string;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  has_seen_creator_prompt: boolean;
  roles: { isAdmin: boolean; isCEO: boolean; isClient: boolean; fcmToken?: string | null };
  firstName?: string | null;
  lastName?: string | null;
  brand?: any;
  iat?: number;
  exp?: number;
}

const USER_CACHE_TTL_SECONDS = 60;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is required');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => req?.cookies?.['kollect_jwt'] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.supabaseId) {
      throw new UnauthorizedException('Invalid token: missing supabaseId');
    }

    const cacheKey = `user:jwt:${payload.supabaseId}`;

    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) return JSON.parse(cached) as AuthenticatedUser;
    } catch {
      // Redis indisponible — on continue vers la DB
    }

    const user = await this.prisma.utilisateur.findUnique({
      where: { supabaseId: payload.supabaseId },
      include: { brand: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      supabaseId: user.supabaseId,
      email: user.email,
      isAdmin: user.isAdmin,
      isCEO: user.isCEO,
      isClient: user.isClient,
      has_seen_creator_prompt: user.has_seen_creator_prompt ?? false,
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

    try {
      await this.redis.setex(cacheKey, USER_CACHE_TTL_SECONDS, JSON.stringify(authenticatedUser));
    } catch {
      // Redis indisponible — on continue sans cache
    }

    return authenticatedUser;
  }
}
