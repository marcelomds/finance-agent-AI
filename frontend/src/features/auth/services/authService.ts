import { api } from '../../../services/api';
import type { ApiSuccessResponse } from '../../../types/apiResponse';
import type { AuthUser } from '../../../lib/authStorage';

type AuthResult = { token: string; user: AuthUser };

export async function login(email: string, password: string): Promise<AuthResult> {
  const res = await api.post<ApiSuccessResponse<AuthResult>>('/api/auth/login', { email, password });
  return res.data.data;
}

export async function register(email: string, password: string, name: string): Promise<AuthResult> {
  const res = await api.post<ApiSuccessResponse<AuthResult>>('/api/auth/register', { email, password, name });
  return res.data.data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  const res = await api.post<ApiSuccessResponse<AuthResult>>('/api/auth/google', { idToken });
  return res.data.data;
}
