import { Request } from 'express';
import { UnauthorizedError } from '../errors/AppError';

export function getAuthUser(req: Request) {
  if (!req.user) throw new UnauthorizedError('Authentication required');
  return req.user;
}
