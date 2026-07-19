import { apiPost } from './apiClient';
import { LoginResponseSchema } from '../schemas/auth';
import type { AuthUser, LoginCredentials } from '../types';

export { getToken } from './authStorage';

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem('user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const persistAuth = (user: AuthUser, token: string): void => {
  if (typeof window === 'undefined') return;
  if (token) window.sessionStorage.setItem('token', token);
  if (user) {
    const { token: _token, ...safeUser } = user;
    void _token;
    window.sessionStorage.setItem('user', JSON.stringify(safeUser));
  }
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem('token');
  window.sessionStorage.removeItem('user');
};

export const register = (formData: FormData): Promise<unknown> =>
  apiPost('/usuarios/register', formData, { isForm: true, skipAuth: true });

export const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const raw = await apiPost<unknown>('/usuarios/login', credentials, { skipAuth: true });
  return LoginResponseSchema.parse(raw);
};

export type { ProfileResponse } from './profileService';
export { getProfile, updateProfile, deleteAccount } from './profileService';