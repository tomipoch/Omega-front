import { apiFetch, type ApiFetchOptions } from './apiClient';
import { getToken } from './authService';
import type { Testimonio } from '../types';

const withToken = (
  opts: Omit<ApiFetchOptions, 'token'> = {},
): ApiFetchOptions => ({ ...opts, token: getToken() });

export const getAllReviews = (): Promise<Testimonio[]> =>
  apiFetch<Testimonio[]>('/testimonios', withToken());

export const getPendingReviews = (): Promise<Testimonio[]> =>
  apiFetch<Testimonio[]>('/testimonios/pendientes', withToken());

export const acceptReview = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}/aceptar`, withToken({ method: 'PUT' }));

export const rejectReview = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}/rechazar`, withToken({ method: 'PUT' }));

export const deleteReviewAdmin = (id: number): Promise<unknown> =>
  apiFetch(`/testimonios/${id}/admin`, withToken({ method: 'DELETE' }));