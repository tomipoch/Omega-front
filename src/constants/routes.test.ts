import { describe, it, expect } from 'vitest';
import { ROUTES, HIDE_CHROME_ROUTES } from './routes';

describe('routes constants', () => {
  it('exposes the expected public routes', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.REGISTER).toBe('/register');
    expect(ROUTES.CATALOG).toBe('/catalogo');
  });

  it('builds parametrized routes with placeholders', () => {
    expect(ROUTES.BLOG_DETAIL()).toBe('/blog/:id');
    expect(ROUTES.BLOG_DETAIL(7)).toBe('/blog/7');
    expect(ROUTES.ADMIN_BLOG_EDIT(42)).toBe('/admin/blog/edit/42');
    expect(ROUTES.ADMIN_EVENTS_EDIT('abc')).toBe('/admin/events/edit/abc');
  });

  it('hides chrome on auth-only routes', () => {
    expect(HIDE_CHROME_ROUTES.has(ROUTES.LOGIN)).toBe(true);
    expect(HIDE_CHROME_ROUTES.has(ROUTES.REGISTER)).toBe(true);
    expect(HIDE_CHROME_ROUTES.has(ROUTES.FORGOT_PASSWORD)).toBe(true);
    expect(HIDE_CHROME_ROUTES.has(ROUTES.RESET_PASSWORD)).toBe(true);
    expect(HIDE_CHROME_ROUTES.has(ROUTES.HOME)).toBe(false);
    expect(HIDE_CHROME_ROUTES.has(ROUTES.CATALOG)).toBe(false);
  });
});