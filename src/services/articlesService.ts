import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { BlogArticulo, ArticuloSeccion } from '../types';
import type { BlogArticuloPayloadSchema } from '../schemas/content';
import type { z } from 'zod';

type BlogArticuloPayload = z.infer<typeof BlogArticuloPayloadSchema>;

interface BlogArticuloConId extends BlogArticulo {
  publicacion_id: number;
}

export const getArticles = (): Promise<BlogArticulo[]> => apiGet<BlogArticulo[]>('/blog');

export const getArticleById = (id: number | string): Promise<BlogArticulo> =>
  apiGet<BlogArticulo>(`/blog/${id}`);

export const createArticle = (data: BlogArticuloPayload): Promise<BlogArticuloConId> =>
  apiPost<BlogArticuloConId>('/blog', data);

export const updateArticle = (
  id: number,
  data: BlogArticuloPayload,
): Promise<BlogArticuloConId> => apiPut<BlogArticuloConId>(`/blog/${id}`, data);

export const deleteArticle = (id: number): Promise<unknown> =>
  apiDelete(`/blog/${id}`);

export const buildArticleSections = (data: BlogArticulo): ArticuloSeccion[] =>
  data.secciones ?? [];