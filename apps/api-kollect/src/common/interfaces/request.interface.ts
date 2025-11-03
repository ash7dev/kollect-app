import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/roles.decorator';

export interface AuthRequest extends Request {
  user: AuthenticatedUser;
}
