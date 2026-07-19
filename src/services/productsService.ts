import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { Producto } from '../types';
import type { ProductoPayloadSchema } from '../schemas/content';
import type { z } from 'zod';

type ProductoPayload = z.infer<typeof ProductoPayloadSchema>;

export const getProducts = (): Promise<Producto[]> => apiGet<Producto[]>('/productos');

export const createProduct = (data: ProductoPayload): Promise<Producto> =>
  apiPost<Producto>('/productos', data);

export const updateProduct = (id: number, data: ProductoPayload): Promise<Producto> =>
  apiPut<Producto>(`/productos/${id}`, data);

export const deleteProduct = (id: number): Promise<unknown> =>
  apiDelete(`/productos/${id}`);