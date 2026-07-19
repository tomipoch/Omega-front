import { apiFetch } from './apiClient';
import { getToken } from './authService';
import type { Cita, CitaFormData, Servicio } from '../types';

const token = (): string | null => getToken();

// Authenticated user appointments

export const createAppointment = (data: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>('/citas', { method: 'POST', body: data, token: token() });

export const getAppointments = (): Promise<Cita[]> =>
  apiFetch<Cita[]>('/citas', { token: token() });

export const deleteAppointment = (id: number): Promise<unknown> =>
  apiFetch(`/citas/${id}`, { method: 'DELETE', token: token() });

export const updateAppointment = (id: number, data: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>(`/citas/${id}`, { method: 'PUT', body: data, token: token() });

// Admin appointments

export const getAllAppointments = (): Promise<Cita[]> =>
  apiFetch<Cita[]>('/citas/admin/todas', { token: token() });

export const deleteAppointmentAdmin = (id: number): Promise<unknown> =>
  apiFetch(`/citas/admin/${id}`, { method: 'DELETE', token: token() });

export const createAppointmentAdmin = (data: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>('/citas/admin/crear', { method: 'POST', body: data, token: token() });

export const updateAppointmentAdmin = (id: number, data: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>(`/citas/admin/${id}`, { method: 'PUT', body: data, token: token() });

export const getAllAppointmentsAdmin = (): Promise<Cita[]> =>
  apiFetch<Cita[]>('/citas/admin/todas', { token: token() });

// Services

export const getServices = (): Promise<Servicio[]> =>
  apiFetch<Servicio[]>('/servicios', { token: token() });

// Format helpers

export const formatDate = (fecha: string | Date): string => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (hora: string | null | undefined): string =>
  hora ? String(hora).substring(0, 5) : '';

export const formatDateTime = (
  fechaHora: string | Date,
): { fecha: string; hora: string } => {
  const fecha = new Date(fechaHora);
  return {
    fecha: formatDate(fecha),
    hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  };
};