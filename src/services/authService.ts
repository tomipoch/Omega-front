import { apiFetch } from './apiClient';
import type { AuthUser, LoginCredentials, RegisterPayload } from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const getToken = (): string | null => sessionStorage.getItem(TOKEN_KEY);

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const persistAuth = (user: AuthUser, token: string): void => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

export const register = (formData: FormData): Promise<unknown> =>
  apiFetch('/usuarios/register', { method: 'POST', body: formData, isForm: true });

export const login = (credentials: LoginCredentials): Promise<AuthUser> =>
  apiFetch<AuthUser>('/usuarios/login', { method: 'POST', body: credentials });

export interface ProfileResponse {
  usuario_id: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo_electronico: string;
  telefono?: string;
  direccion?: string;
  foto_perfil_url?: string | null;
  rol_id: number;
  token?: string;
}

export const getProfile = (): Promise<ProfileResponse> =>
  apiFetch<ProfileResponse>('/usuarios/perfil', { token: getToken() });

export const updateProfile = (
  profileData: FormData | RegisterPayload | Record<string, unknown>,
  { isForm = false }: { isForm?: boolean } = {},
): Promise<unknown> =>
  apiFetch('/usuarios/perfil', {
    method: 'PUT',
    body: profileData,
    token: getToken(),
    isForm,
  });

export const deleteAccount = (): Promise<unknown> =>
  apiFetch('/usuarios/eliminar', { method: 'DELETE', token: getToken() });