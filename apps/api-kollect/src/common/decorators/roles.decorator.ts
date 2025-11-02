/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
// decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User type from JWT payload after authentication
 */
export interface AuthenticatedUser {
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
  };
  firstName?: string | null;
  lastName?: string | null;
  iat?: number;
  exp?: number;
}

/**
 * Custom decorator to get the authenticated user from the request
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
