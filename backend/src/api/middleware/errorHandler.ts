import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { sendErrorResponse } from '../utils/apiResponse';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendErrorResponse(res, err.errors, err.message, err.statusCode);
    return;
  }

  console.error(err);
  sendErrorResponse(res, undefined, 'Internal server error', 500);
}
