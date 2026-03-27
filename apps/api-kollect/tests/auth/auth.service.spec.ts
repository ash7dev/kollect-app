import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AppLogger } from '../../src/common/logger/logger.service';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;
  let logger: AppLogger;
  let configService: ConfigService;

  const mockPrismaService = {
    utilisateur: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    marque: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockLogger = {
    logAuth: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AppLogger,
          useValue: mockLogger,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<AppLogger>(AppLogger);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('syncUser', () => {
    const syncUserDto = {
      supabaseAccessToken: 'valid-token',
      fcmToken: 'test-fcm-token',
    };

    const supabaseUser = {
      id: 'supabase-123',
      email: 'test@example.com',
      user_metadata: {
        firstName: 'John',
        lastName: 'Doe',
      },
    };

    const existingUser = {
      id: 'user-123',
      supabaseId: 'supabase-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isClient: true,
      isCEO: false,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      has_seen_creator_prompt: false,
      phone: null,
      avatar: null,
      fcmToken: null,
      address: null,
      city: null,
      postalCode: null,
      country: 'Sénégal',
    };

    it('should sync existing user successfully', async () => {
      // Mock Supabase verification
      jest.spyOn(service as any, 'verifySupabaseToken').mockResolvedValue(supabaseUser);
      
      // Mock existing user
      mockPrismaService.utilisateur.findUnique.mockResolvedValue(existingUser);
      
      // Mock JWT
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.syncUser(syncUserDto);

      expect(mockPrismaService.utilisateur.update).toHaveBeenCalledWith({
        where: { supabaseId: 'supabase-123' },
        data: {
          lastLoginAt: expect.any(Date),
          fcmToken: 'test-fcm-token',
        },
      });

      expect(mockLogger.logAuth).toHaveBeenCalledWith('sync', 'user-123', {
        email: 'test@example.com',
        isNewUser: false,
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
        }),
      });
    });

    it('should create new user when not exists', async () => {
      // Mock Supabase verification
      jest.spyOn(service as any, 'verifySupabaseToken').mockResolvedValue(supabaseUser);
      
      // Mock no existing user
      mockPrismaService.utilisateur.findUnique.mockResolvedValue(null);
      
      // Mock user creation
      mockPrismaService.utilisateur.create.mockResolvedValue(existingUser);
      
      // Mock JWT
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.syncUser(syncUserDto);

      expect(mockPrismaService.utilisateur.create).toHaveBeenCalledWith({
        data: {
          supabaseId: 'supabase-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          fcmToken: 'test-fcm-token',
        },
      });

      expect(mockLogger.logAuth).toHaveBeenCalledWith('sync', 'user-123', {
        email: 'test@example.com',
        isNewUser: true,
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
        }),
      });
    });

    it('should throw error for invalid Supabase token', async () => {
      // Mock Supabase verification failure
      jest.spyOn(service as any, 'verifySupabaseToken').mockRejectedValue(
        new Error('Invalid token')
      );

      await expect(service.syncUser(syncUserDto)).rejects.toThrow('Invalid token');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to sync user',
        expect.objectContaining({
          error: 'Invalid token',
        })
      );
    });
  });

  describe('updateUserRole', () => {
    const userId = 'user-123';
    const choice = 'vendeur';
    const hasSeenCreatorPrompt = true;

    it('should update user role successfully', async () => {
      const updatedUser = {
        ...existingUser,
        isClient: false,
        isCEO: true,
        has_seen_creator_prompt: true,
      };

      mockPrismaService.utilisateur.update.mockResolvedValue(updatedUser);
      mockJwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.updateUserRole(userId, choice, hasSeenCreatorPrompt);

      expect(mockPrismaService.utilisateur.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          isClient: false,
          isCEO: true,
          has_seen_creator_prompt: hasSeenCreatorPrompt,
        },
      });

      expect(mockLogger.logAuth).toHaveBeenCalledWith('role_update', userId, {
        newRole: 'CEO',
        hasSeenCreatorPrompt,
      });

      expect(result).toEqual({
        access_token: 'new-jwt-token',
        user: updatedUser,
      });
    });

    it('should handle client role update', async () => {
      const updatedUser = {
        ...existingUser,
        isClient: true,
        isCEO: false,
        has_seen_creator_prompt: true,
      };

      mockPrismaService.utilisateur.update.mockResolvedValue(updatedUser);
      mockJwtService.sign.mockReturnValue('new-jwt-token');

      const result = await service.updateUserRole(userId, 'client', hasSeenCreatorPrompt);

      expect(mockPrismaService.utilisateur.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          isClient: true,
          isCEO: false,
          has_seen_creator_prompt: hasSeenCreatorPrompt,
        },
      });

      expect(result.user.isClient).toBe(true);
      expect(result.user.isCEO).toBe(false);
    });
  });

  describe('updateFcmToken', () => {
    const userId = 'user-123';
    const fcmToken = 'new-fcm-token';

    it('should update FCM token successfully', async () => {
      mockPrismaService.utilisateur.update.mockResolvedValue(existingUser);

      await service.updateFcmToken(userId, fcmToken);

      expect(mockPrismaService.utilisateur.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { fcmToken },
      });

      expect(mockLogger.logAuth).toHaveBeenCalledWith('fcm_token_update', userId);
    });

    it('should handle database errors', async () => {
      mockPrismaService.utilisateur.update.mockRejectedValue(
        new Error('Database error')
      );

      await expect(service.updateFcmToken(userId, fcmToken)).rejects.toThrow(
        'Database error'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update FCM token',
        expect.objectContaining({
          userId,
          error: 'Database error',
        })
      );
    });
  });
});
function expect(isClient: boolean) {
    throw new Error('Function not implemented.');
}

