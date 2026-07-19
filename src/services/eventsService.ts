import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { Evento, InscripcionEstado } from '../types';
import type { EventoPayloadSchema } from '../schemas/content';
import type { z } from 'zod';

type EventoPayload = z.infer<typeof EventoPayloadSchema>;

export const getEvents = (): Promise<Evento[]> => apiGet<Evento[]>('/eventos');

export const getEventById = (id: number | string): Promise<Evento> =>
  apiGet<Evento>(`/eventos/${id}`);

export const createEvent = (data: EventoPayload): Promise<Evento> =>
  apiPost<Evento>('/eventos', data);

export const updateEvent = (id: number, data: EventoPayload): Promise<Evento> =>
  apiPut<Evento>(`/eventos/${id}`, data);

export const deleteEvent = (id: number): Promise<unknown> =>
  apiDelete(`/eventos/${id}`);

export const registerForEvent = (id: number): Promise<InscripcionEstado> =>
  apiPost<InscripcionEstado>(`/eventos/${id}/inscripcion`);

export const cancelRegistration = (id: number): Promise<InscripcionEstado> =>
  apiDelete<InscripcionEstado>(`/eventos/${id}/inscripcion`);

export const getRegistrationStatus = (id: number): Promise<InscripcionEstado> =>
  apiGet<InscripcionEstado>(`/eventos/${id}/inscripcion`);