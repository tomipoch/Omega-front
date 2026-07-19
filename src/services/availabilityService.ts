import { apiFetch, type ApiFetchOptions } from './apiClient';
import { getToken } from './authService';
import type {
  Disponibilidad,
  DisponibilidadEstado,
  DisponibilidadPayload,
} from '../types';

// Admin endpoints

const withToken = (
  opts: Omit<ApiFetchOptions, 'token'> = {},
): ApiFetchOptions => ({ ...opts, token: getToken() });

export const createAvailability = (data: DisponibilidadPayload): Promise<Disponibilidad> =>
  apiFetch<Disponibilidad>('/disponibilidad', withToken({ method: 'POST', body: data }));

export const getAvailabilitiesAdmin = (
  params: Record<string, string | number | undefined> = {},
): Promise<Disponibilidad[]> => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, String(value));
  });
  const query = search.toString();
  return apiFetch<Disponibilidad[]>(
    `/disponibilidad/admin${query ? `?${query}` : ''}`,
    withToken(),
  );
};

export const updateAvailability = (
  id: number,
  data: DisponibilidadPayload,
): Promise<Disponibilidad> =>
  apiFetch<Disponibilidad>(`/disponibilidad/${id}`, withToken({ method: 'PUT', body: data }));

export const deleteAvailability = (id: number): Promise<unknown> =>
  apiFetch(`/disponibilidad/${id}`, withToken({ method: 'DELETE' }));

export const getAvailabilitiesByRange = (
  fechaInicio: string,
  fechaFin: string,
): Promise<Disponibilidad[]> =>
  apiFetch<Disponibilidad[]>(
    `/disponibilidad/admin/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
    withToken(),
  );

// Public endpoints

export const getPublicAvailabilities = (): Promise<Disponibilidad[]> =>
  apiFetch<Disponibilidad[]>('/disponibilidad/publicas');

export const getPublicAvailabilitiesWithAppointment = (
  appointmentId: number | null = null,
): Promise<Disponibilidad[]> => {
  const query = appointmentId ? `?citaId=${appointmentId}` : '';
  return apiFetch<Disponibilidad[]>(`/disponibilidad/publicas-con-cita${query}`);
};

// Format helpers

export const formatDate = (fecha: string | null | undefined): string => {
  if (!fecha) return 'Fecha no disponible';
  const fechaObj = new Date(fecha);
  if (Number.isNaN(fechaObj.getTime())) return 'Fecha inválida';
  return fechaObj.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatTime = (hora: string | Date | null | undefined): string => {
  if (!hora) return 'Hora no disponible';
  if (typeof hora === 'string') {
    const parts = hora.split(':');
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return hora;
  }
  if (hora instanceof Date) {
    return hora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return String(hora);
};

export const groupByDate = (
  disponibilidades: Disponibilidad[] = [],
): Record<string, Disponibilidad[]> =>
  disponibilidades.reduce<Record<string, Disponibilidad[]>>((acc, d) => {
    if (!d?.fecha) return acc;
    (acc[d.fecha] = acc[d.fecha] || []).push(d);
    return acc;
  }, {});

export type { DisponibilidadEstado };