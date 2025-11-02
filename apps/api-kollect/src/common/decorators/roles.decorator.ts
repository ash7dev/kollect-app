import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../../auth/interfaces/auth.interface';

/**
 * User type for request with authentication
 */
type AuthenticatedUser = Pick<
  UserProfile,
  'id' | 'kindeId' | 'email' | 'isAdmin' | 'isCEO' | 'isClient'
> & {
  roles: {
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
  };
};

/**
 * Custom decorator to get the authenticated user from the request
 * This ensures type safety when accessing the user object in controllers
 */
export const Roles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    return request.user;
  },
);
