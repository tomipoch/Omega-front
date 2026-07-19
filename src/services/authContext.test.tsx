import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from './authContext';
import type { AuthUser } from '../types';

const buildUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  usuario_id: 1,
  nombre: 'Test',
  token: 'jwt.token.value',
  rol_id: 1,
  ...overrides,
});

const Consumer = ({ loginWith }: { loginWith?: () => void } = {}) => {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user">{ctx.user?.nombre ?? 'none'}</span>
      <span data-testid="token">{ctx.token ?? 'no-token'}</span>
      <span data-testid="loading">{String(ctx.isLoading)}</span>
      <button type="button" onClick={loginWith ?? (() => ctx.loginUser(buildUser({ nombre: 'Logged', token: 'tok-2' })))}>
        login
      </button>
      <button type="button" onClick={() => ctx.logoutUser()}>
        logout
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders with default loading state, then resolves user from sessionStorage', async () => {
    window.sessionStorage.setItem('token', 'preload-token');
    window.sessionStorage.setItem('user', JSON.stringify(buildUser({ nombre: 'Stored' })));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('Stored');
    expect(screen.getByTestId('token')).toHaveTextContent('preload-token');
  });

  it('loginUser persists user (without token) and stores token separately', async () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Logged');
      expect(screen.getByTestId('token')).toHaveTextContent('tok-2');
    });

    const stored = JSON.parse(window.sessionStorage.getItem('user') ?? '{}');
    expect(stored.token).toBeUndefined();
    expect(window.sessionStorage.getItem('token')).toBe('tok-2');
  });

  it('logoutUser clears both token and user', async () => {
    window.sessionStorage.setItem('token', 't');
    window.sessionStorage.setItem('user', JSON.stringify(buildUser()));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
      expect(screen.getByTestId('token')).toHaveTextContent('no-token');
    });
    expect(window.sessionStorage.getItem('token')).toBeNull();
    expect(window.sessionStorage.getItem('user')).toBeNull();
  });

  it('reacts to UNAUTHORIZED_EVENT by clearing auth', async () => {
    window.sessionStorage.setItem('token', 'to-clear');
    window.sessionStorage.setItem('user', JSON.stringify(buildUser()));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

    act(() => {
      window.dispatchEvent(new CustomEvent('omega:unauthorized'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
      expect(window.sessionStorage.getItem('token')).toBeNull();
    });
  });

  it('warns and no-ops when loginUser is called without token', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ConsumerNoToken = () => {
      const ctx = useContext(AuthContext);
      return (
        <button
          type="button"
          onClick={() =>
            ctx.loginUser({ ...buildUser(), token: '' as unknown as string })
          }
        >
          login
        </button>
      );
    };

    render(
      <AuthProvider>
        <ConsumerNoToken />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText('login')).toBeInTheDocument());

    fireEvent.click(screen.getByText('login'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});