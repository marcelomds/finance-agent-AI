import { Router } from 'express';
import { googleLoginController, loginController, meController, registerController } from '../controllers/authController';
import { requireAuth } from '../middleware/requireAuth';

export const authRouter = Router();

authRouter.post('/api/auth/login', loginController);
authRouter.post('/api/auth/register', registerController);
authRouter.post('/api/auth/google', googleLoginController);
authRouter.get('/api/auth/me', requireAuth, meController);
