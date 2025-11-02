/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role = 'isAdmin' | 'isCEO' | 'isClient';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

interface AuthenticatedUser {
  id: string;
  kindeId: string;
  email: string;
  roles: {
    isAdmin: boolean;
    isCEO: boolean;
    isClient: boolean;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Pas de rôles requis = accès autorisé
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    // Vérifie si l'utilisateur a au moins un des rôles requis
    return requiredRoles.some((role) => user.roles[role] === true);
  }
}
