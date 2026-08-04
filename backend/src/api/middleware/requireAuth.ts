import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../../services/authService';
import { UnauthorizedError } from '../errors/AppError';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = header.slice('Bearer '.length);

  try {
    req.user = verifyToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid or expired token');
    }
    throw err;
  }

  next();
}
