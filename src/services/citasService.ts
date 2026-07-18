import { apiFetch } from './apiClient';
import { getToken } from './authService';
import type { Cita, CitaFormData, Servicio } from '../types';

const token = (): string | null => getToken();

// Citas del usuario autenticado

export const crearCita = (citaData: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>('/citas', { method: 'POST', body: citaData, token: token() });

export const obtenerCitas = (): Promise<Cita[]> =>
  apiFetch<Cita[]>('/citas', { token: token() });

export const eliminarCita = (id: number): Promise<unknown> =>
  apiFetch(`/citas/${id}`, { method: 'DELETE', token: token() });

export const actualizarCita = (id: number, citaData: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>(`/citas/${id}`, { method: 'PUT', body: citaData, token: token() });

// Aliases conservados por compatibilidad (no se usan internamente)
export const getCitas = obtenerCitas;
export const updateCita = actualizarCita;
export const deleteCita = eliminarCita;

// Citas como administrador

export const obtenerTodasLasCitas = (): Promise<Cita[]> =>
  apiFetch<Cita[]>('/citas/admin/todas', { token: token() });

export const eliminarCitaAdmin = (id: number): Promise<unknown> =>
  apiFetch(`/citas/admin/${id}`, { method: 'DELETE', token: token() });

export const crearCitaAdmin = (citaData: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>('/citas/admin/crear', { method: 'POST', body: citaData, token: token() });

export const actualizarCitaAdmin = (id: number, citaData: CitaFormData): Promise<Cita> =>
  apiFetch<Cita>(`/citas/admin/${id}`, { method: 'PUT', body: citaData, token: token() });

export const obtenerTodasLasCitasAdmin = (): Promise<Cita[]> =>
  apiFetch<Cita[]>('/citas/admin/todas', { token: token() });

// Servicios

export const obtenerServicios = (): Promise<Servicio[]> =>
  apiFetch<Servicio[]>('/servicios', { token: token() });

export const getServicios = obtenerServicios;

// Utilidades de formato

export const formatearFecha = (fecha: string | Date): string => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatearHora = (hora: string | null | undefined): string =>
  hora ? String(hora).substring(0, 5) : '';

export const formatearFechaHora = (
  fechaHora: string | Date,
): { fecha: string; hora: string } => {
  const fecha = new Date(fechaHora);
  return {
    fecha: formatearFecha(fecha),
    hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  };
};