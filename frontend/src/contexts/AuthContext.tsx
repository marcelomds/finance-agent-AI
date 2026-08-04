import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  login as loginRequest,
  loginWithGoogle as loginWithGoogleRequest,
  register as registerRequest,
} from '../features/auth/services/authService';
import { clearAuth, getStoredUser, getToken, setAuth, type AuthUser } from '../lib/authStorage';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => (getToken() ? getStoredUser() : null));
  const queryClient = useQueryClient();

  async function login(email: string, password: string) {
    const { token, user: loggedInUser } = await loginRequest(email, password);
    setAuth(token, loggedInUser);
    setUser(loggedInUser);
  }

  async function register(email: string, password: string, name: string) {
    const { token, user: newUser } = await registerRequest(email, password, name);
    setAuth(token, newUser);
    setUser(newUser);
  }

  async function loginWithGoogle(idToken: string) {
    const { token, user: loggedInUser } = await loginWithGoogleRequest(idToken);
    setAuth(token, loggedInUser);
    setUser(loggedInUser);
  }

  function logout() {
    clearAuth();
    setUser(null);
    queryClient.clear();
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    login,
    register,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
