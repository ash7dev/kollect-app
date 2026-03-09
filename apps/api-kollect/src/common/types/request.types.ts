import { Request } from 'express';

export interface UserPayload {
  supabaseId: string;
  email: string;
  sub: string; // Correspond à l'ID utilisateur dans le JWT
  iat?: number; // Issued At (timestamp)
  exp?: number; // Expiration (timestamp)
  roles?: {
    isClient: boolean;
    isCEO: boolean;
    isAdmin: boolean;
  };
  brand?: unknown;
}

/**
 * Extension de l'interface Request d'Express pour inclure l'utilisateur authentifié
 */
export interface AuthRequest extends Request {
  user: UserPayload;
}
