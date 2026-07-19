import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiFetch, apiGet, apiPost, apiDelete, UNAUTHORIZED_EVENT, extractList, isApiList } from './apiClient';
import { setToken } from './authStorage';

describe('apiClient', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    window.sessionStorage.clear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends JSON body and Content-Type header', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await apiPost('/ping', { hello: 'world' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/ping');
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe(JSON.stringify({ hello: 'world' }));
  });

  it('auto-injects x-auth-token from sessionStorage when not explicitly provided', async () => {
    setToken('abc123');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiGet('/me');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['x-auth-token']).toBe('abc123');
  });

  it('explicit token overrides stored token', async () => {
    setToken('stored');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiFetch('/me', { token: 'override' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['x-auth-token']).toBe('override');
  });

  it('skipAuth prevents auto token injection', async () => {
    setToken('should-not-be-sent');
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await apiGet('/public', { skipAuth: true });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['x-auth-token']).toBeUndefined();
  });

  it('parses JSON success responses', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: 1, name: 'Omega' }), { status: 200 }),
    );

    const result = await apiGet<{ id: number; name: string }>('/thing');
    expect(result).toEqual({ id: 1, name: 'Omega' });
  });

  it('parses JSON error responses and attaches status', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'No encontrado' }), { status: 404 }),
    );

    await expect(apiGet('/missing')).rejects.toMatchObject({
      message: 'No encontrado',
      status: 404,
    });
  });

  it('falls back to generic error message when payload lacks one', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));

    await expect(apiGet('/boom')).rejects.toMatchObject({
      message: 'Error 500',
      status: 500,
    });
  });

  it('dispatches UNAUTHORIZED_EVENT and rejects on 401', async () => {
    const handler = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 }),
    );

    await expect(apiGet('/secure')).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  });

  it('handles empty 204 responses gracefully', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiDelete('/items/1')).resolves.toBeNull();
  });

  it('exposes extractList for the common backend wrappers', () => {
    expect(extractList<number>([1, 2, 3])).toEqual([1, 2, 3]);
    expect(extractList<number>({ data: [1, 2] })).toEqual([1, 2]);
    expect(extractList<number>({ results: [9] })).toEqual([9]);
    expect(extractList<number>(null)).toEqual([]);
  });

  it('isApiList narrows unions for responses', () => {
    expect(isApiList<number>([1])).toBe(true);
    expect(isApiList<number>({ data: [1] })).toBe(true);
    expect(isApiList<number>({ results: [1] })).toBe(true);
    expect(isApiList<number>({ foo: 1 })).toBe(false);
  });
});