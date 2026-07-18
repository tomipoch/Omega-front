import { apiFetch, type ApiFetchOptions } from './apiClient';
import { getToken } from './authService';
import type { Testimonio } from '../types';

const withToken = (
  opts: Omit<ApiFetchOptions, 'token'> = {},
): ApiFetchOptions => ({ ...opts, token: getToken() });

export const obtenerTodasLasReseñas = (): Promise<Testimonio[]> =>
  apiFetch<Testimonio[]>('/testimonios', withToken());

export const obtenerReseñasPendientes = (): Promise<Testimonio[]> =>
  apiFetch<Testimonio[]>('/testimonios/pendientes', withToken());

export const aceptarReseña = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}/aceptar`, withToken({ method: 'PUT' }));

export const rechazarReseña = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}/rechazar`, withToken({ method: 'PUT' }));

export const eliminarReseñaAdmin = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}/admin`, withToken({ method: 'DELETE' }));