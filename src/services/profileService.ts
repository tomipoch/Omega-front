import { apiGet, apiPut, apiDelete } from './apiClient';

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

export const getProfile = (): Promise<ProfileResponse> => apiGet<ProfileResponse>('/usuarios/perfil');

export const updateProfile = (
  profileData: FormData | Record<string, unknown>,
  { isForm = false }: { isForm?: boolean } = {},
): Promise<unknown> => {
  const body = isForm
    ? (profileData as FormData)
    : JSON.stringify(profileData);
  return apiPut('/usuarios/perfil', body, { isForm });
};

export const deleteAccount = (): Promise<unknown> =>
  apiDelete('/usuarios/eliminar');