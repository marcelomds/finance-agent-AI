import { Request, Response } from 'express';
import { login, loginWithGoogle, register } from '../../services/authService';
import { getAuthUser } from '../utils/authContext';
import { ValidationError } from '../errors/AppError';
import { sendSuccessResponse } from '../utils/apiResponse';

export async function loginController(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  const missing = ['email', 'password'].filter((field) => !req.body?.[field]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  const result = await login(email, password);
  sendSuccessResponse(res, result, 'Login successful');
}

export async function registerController(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body ?? {};

  const missing = ['email', 'password', 'name'].filter((field) => !req.body?.[field]);
  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', missing);
  }

  const result = await register(email, password, name);
  sendSuccessResponse(res, result, 'Account created');
}

export async function googleLoginController(req: Request, res: Response): Promise<void> {
  const { idToken } = req.body ?? {};

  if (!idToken) {
    throw new ValidationError('Missing required fields', ['idToken']);
  }

  const result = await loginWithGoogle(idToken);
  sendSuccessResponse(res, result, 'Login successful');
}

export async function meController(req: Request, res: Response): Promise<void> {
  const user = getAuthUser(req);
  sendSuccessResponse(res, user);
}
