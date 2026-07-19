import { describe, it, expect } from 'vitest';
import { isAdmin, isUser, hasRole, USER_ROL_NUMBER, ADMIN_ROL_NUMBER } from './roles';
import { USER_ROL, ADMIN_ROL } from '../types';

describe('roles helpers', () => {
  it('exports the canonical role numbers', () => {
    expect(USER_ROL_NUMBER).toBe(USER_ROL);
    expect(ADMIN_ROL_NUMBER).toBe(ADMIN_ROL);
  });

  it('isAdmin returns true only for admin role', () => {
    expect(isAdmin(2)).toBe(true);
    expect(isAdmin(Number('2'))).toBe(true);
    expect(isAdmin(1)).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });

  it('isUser returns true only for user role', () => {
    expect(isUser(1)).toBe(true);
    expect(isUser(Number('1'))).toBe(true);
    expect(isUser(2)).toBe(false);
    expect(isUser(null)).toBe(false);
  });

  it('hasRole matches against the provided allowlist', () => {
    expect(hasRole(1, [USER_ROL, ADMIN_ROL])).toBe(true);
    expect(hasRole(2, [USER_ROL])).toBe(false);
    expect(hasRole(null, [])).toBe(false);
  });
});