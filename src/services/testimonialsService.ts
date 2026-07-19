import { apiFetch, type ApiFetchOptions } from './apiClient';
import { getToken } from './authService';
import type { Testimonio } from '../types';

const withToken = (
  opts: Omit<ApiFetchOptions, 'token'> = {},
): ApiFetchOptions => ({ ...opts, token: getToken() });

export interface TestimonioFilters {
  limit?: number;
  page?: number;
  stars?: number;
  usuario_id?: number;
}

export const getTestimonials = (
  params: TestimonioFilters = {},
): Promise<Testimonio[]> => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  const useToken = Boolean(params.usuario_id);
  return apiFetch<Testimonio[]>(
    `/testimonios${query ? `?${query}` : ''}`,
    useToken ? withToken() : undefined,
  );
};

export interface TestimonioPayload {
  contenido: string;
  estrellas: number;
}

export const createTestimonial = (data: TestimonioPayload): Promise<Testimonio> =>
  apiFetch<Testimonio>('/testimonios', withToken({ method: 'POST', body: data }));

export const getMyTestimonials = (): Promise<Testimonio[]> =>
  apiFetch<Testimonio[]>('/testimonios/mis-testimonios', withToken());

export const updateTestimonial = (
  id: number,
  data: TestimonioPayload,
): Promise<Testimonio> =>
  apiFetch<Testimonio>(`/testimonios/${id}`, withToken({ method: 'PUT', body: data }));

export const deleteTestimonial = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}`, withToken({ method: 'DELETE' }));