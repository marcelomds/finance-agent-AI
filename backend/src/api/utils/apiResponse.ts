import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types/apiResponse';

export function sendSuccessResponse<T>(res: Response, data: T, message?: string, status = 200): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message: message || "Success",
  };
  res.status(status).json(response);
}

export function sendErrorResponse(res: Response, errors?: string[], message?: string, status = 400): void {
  const response: ApiErrorResponse = {
    success: false,
    errors,
    message: message || "An error occurred",
  };
  res.status(status).json(response);
}