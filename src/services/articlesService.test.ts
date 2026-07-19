import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getArticles, getArticleById, createArticle, deleteArticle } from './articlesService';

describe('articlesService', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getArticles hits /blog with GET', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
    await getArticles();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/blog');
    expect(init.method).toBe('GET');
  });

  it('getArticleById appends the id', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await getArticleById(7);
    expect(fetchMock.mock.calls[0][0]).toContain('/blog/7');
  });

  it('createArticle sends POST with JSON body', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));
    await createArticle({ titulo: 'T', contenido: 'C' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/blog');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ titulo: 'T', contenido: 'C' }));
  });

  it('deleteArticle sends DELETE', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await deleteArticle(42);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('/blog/42');
    expect(init.method).toBe('DELETE');
  });
});