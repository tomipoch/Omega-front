import { apiFetch } from './apiClient';

export const createCustomRequest = (data: {
  usuario_id: number;
  servicio_id: number;
  detalles: string;
}): Promise<unknown> => apiFetch('/personalizacion', { method: 'POST', body: data });