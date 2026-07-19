import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './authContext';
import { setToken } from './authStorage';
import type { AuthUser, Rol } from '../types';

const buildUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  usuario_id: 1,
  nombre: 'Test',
  token: 'jwt.token.value',
  rol_id: 1,
  ...overrides,
});

const toAllowedRoles = (allow: 1 | 2 | Array<1 | 2>): Rol[] =>
  ([] as Array<1 | 2>).concat(allow) as Rol[];

const ProtectedHarness = ({ allow }: { allow?: Rol[] }) => (
  <MemoryRouter initialEntries={['/secret']}>
    <AuthProvider>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute allowedRoles={allow}>
              <div>secret-content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>login-page</div>} />
        <Route path="/" element={<div>home-page</div>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('redirects unauthenticated users to /login', async () => {
    render(<ProtectedHarness />);
    await waitFor(() => {
      expect(screen.getByText('login-page')).toBeInTheDocument();
    });
    expect(screen.queryByText('secret-content')).toBeNull();
  });

  it('renders children when authenticated', async () => {
    setToken('jwt.token.value');
    window.sessionStorage.setItem('user', JSON.stringify(buildUser()));

    render(<ProtectedHarness />);
    await waitFor(() => {
      expect(screen.getByText('secret-content')).toBeInTheDocument();
    });
  });

  it('redirects to home when role is not in allowedRoles', async () => {
    setToken('jwt.token.value');
    window.sessionStorage.setItem('user', JSON.stringify(buildUser({ rol_id: 1 })));

    render(<ProtectedHarness allow={toAllowedRoles(2)} />);
    await waitFor(() => {
      expect(screen.getByText('home-page')).toBeInTheDocument();
    });
  });
});