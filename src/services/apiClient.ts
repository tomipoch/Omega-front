import type { ApiError, ApiList } from '../types';

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000';

const handleResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : `Error ${response.status}`;
    const error = new Error(message) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

const buildHeaders = ({
  headers,
  token,
  isForm,
}: {
  headers?: HeadersInit;
  token?: string | null;
  isForm: boolean;
}): HeadersInit => {
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (!isForm) finalHeaders['Content-Type'] = 'application/json';
  if (token) finalHeaders['x-auth-token'] = token;
  return finalHeaders;
};

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: unknown;
  token?: string | null;
  isForm?: boolean;
}

export const apiFetch = async <T = unknown>(
  path: string,
  { method = 'GET', headers, body, token, isForm = false }: ApiFetchOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders({ headers, token, isForm }),
    body:
      body === undefined || body === null
        ? undefined
        : isForm
          ? (body as BodyInit)
          : JSON.stringify(body),
  });
  return handleResponse(response) as Promise<T>;
};

const isPlainList = <T>(value: unknown): value is T[] => Array.isArray(value);

export const extractList = <T>(data: unknown): T[] => {
  if (isPlainList<T>(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as { data?: unknown; results?: unknown };
    if (isPlainList<T>(obj.data)) return obj.data;
    if (isPlainList<T>(obj.results)) return obj.results;
  }
  return [];
};

export const isApiList = <T>(data: unknown): data is ApiList<T> =>
  isPlainList<T>(data) ||
  (typeof data === 'object' &&
    data !== null &&
    ('data' in (data as object) || 'results' in (data as object)));