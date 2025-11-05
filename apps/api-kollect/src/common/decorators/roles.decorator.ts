/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  kindeId: string;
  email: string;
  isAdmin: boolean;
  isCEO: boolean;
  isClient: boolean;
  has_seen_creator_prompt: boolean;
  roles: {
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
  };
  firstName?: string | null;
  lastName?: string | null;
  brand?: any;
  iat?: number;
  exp?: number;
}

export type Role = 'isAdmin' | 'isCEO' | 'isClient';
export const ROLES_KEY = 'roles';

// Decorator pour définir les rôles requis
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Decorator pour récupérer l'utilisateur
export const GetUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    
    return data ? user?.[data] : user;
  },
);
