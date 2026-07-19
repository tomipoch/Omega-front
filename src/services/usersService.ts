import { apiFetch } from './apiClient';
import { getToken } from './authService';

export interface Usuario {
  usuario_id: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  correo_electronico: string;
  telefono?: string;
  direccion?: string;
  rol_id: number | string;
  foto_perfil_url?: string | null;
}

export interface UserFilters {
  nombre?: string;
  rol?: string;
}

export const updateUserAdmin = (
  userId: number,
  userData: Partial<Usuario>,
): Promise<{ usuario?: Usuario } & Record<string, unknown>> =>
  apiFetch(`/usuarios/${userId}`, { method: 'PUT', body: userData, token: getToken() }) as Promise<
    { usuario?: Usuario } & Record<string, unknown>
  >;

export const getAllUsers = (
  filters: UserFilters = {},
): Promise<Usuario[]> => {
  const search = new URLSearchParams();
  if (filters.nombre) search.append('nombre', filters.nombre);
  if (filters.rol && filters.rol !== 'all') search.append('rol', filters.rol);
  const query = search.toString();
  return apiFetch<Usuario[]>(`/usuarios/all${query ? `?${query}` : ''}`, { token: getToken() });
};

export const deleteUser = (userId: number): Promise<unknown> =>
  apiFetch(`/usuarios/${userId}`, { method: 'DELETE', token: getToken() });

export const updateUserRole = (userId: number, rolId: number | string): Promise<unknown> =>
  apiFetch(`/usuarios/${userId}/role`, {
    method: 'PUT',
    body: { rol_id: Number(rolId) },
    token: getToken(),
  });