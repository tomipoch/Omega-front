import type { ZodType } from 'zod';
import type { ApiError, ApiList } from '../types';
import { getToken } from './authStorage';

const RAW_API_URL = import.meta.env.VITE_API_URL as string | undefined;

export const API_URL: string = RAW_API_URL || 'http://localhost:4000';

const isProduction = import.meta.env.PROD === true;
if (isProduction && !RAW_API_URL) {
  console.warn(
    '[omega-front] VITE_API_URL is not defined in production build. Falling back to localhost; this is almost certainly a misconfiguration.',
  );
}

export const UNAUTHORIZED_EVENT = 'omega:unauthorized';

const notifyUnauthorized = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
};

const parseErrorMessage = (status: number, data: unknown): string => {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return `Error ${status}`;
};

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
    if (response.status === 401) {
      notifyUnauthorized();
    }
    const error = new Error(parseErrorMessage(response.status, data)) as ApiError;
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
};

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: unknown;
  token?: string | null;
  isForm?: boolean;
  skipAuth?: boolean;
  schema?: ZodType<unknown>;
}

const readStoredToken = (): string | null => getToken();

const buildHeaders = ({
  headers,
  token,
  isForm,
  skipAuth,
}: {
  headers?: HeadersInit;
  token?: string | null;
  isForm: boolean;
  skipAuth: boolean;
}): HeadersInit => {
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (!isForm) finalHeaders['Content-Type'] = 'application/json';
  const resolvedToken = token ?? (skipAuth ? null : readStoredToken());
  if (resolvedToken) finalHeaders['x-auth-token'] = resolvedToken;
  return finalHeaders;
};

export const apiFetch = async <T = unknown>(
  path: string,
  { method = 'GET', headers, body, token, isForm = false, skipAuth = false, schema }: ApiFetchOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders({ headers, token, isForm, skipAuth }),
    body:
      body === undefined || body === null
        ? undefined
        : isForm
          ? (body as BodyInit)
          : JSON.stringify(body),
  });
  const data = await handleResponse(response);
  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const error = new Error('La respuesta del servidor no coincide con el esquema esperado') as ApiError;
      error.status = response.status;
      error.data = { issues: parsed.error.issues };
      throw error;
    }
    return parsed.data as T;
  }
  return data as T;
};

export const apiGet = <T>(path: string, options?: Omit<ApiFetchOptions, 'method' | 'body'>): Promise<T> =>
  apiFetch<T>(path, { ...options, method: 'GET' });

export const apiPost = <T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>,
): Promise<T> => apiFetch<T>(path, { ...options, method: 'POST', body });

export const apiPut = <T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>,
): Promise<T> => apiFetch<T>(path, { ...options, method: 'PUT', body });

export const apiPatch = <T>(
  path: string,
  body?: unknown,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>,
): Promise<T> => apiFetch<T>(path, { ...options, method: 'PATCH', body });

export const apiDelete = <T>(
  path: string,
  options?: Omit<ApiFetchOptions, 'method' | 'body'>,
): Promise<T> => apiFetch<T>(path, { ...options, method: 'DELETE' });

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