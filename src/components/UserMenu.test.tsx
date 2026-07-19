import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../services/authContext';
import type { AuthUser, AuthContextValue } from '../types';
import UserMenu from './UserMenu';

const buildUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  usuario_id: 1,
  nombre: 'Test',
  token: 'jwt.token.value',
  rol_id: 1,
  ...overrides,
});

const buildContext = (overrides: Partial<AuthContextValue> = {}): AuthContextValue => ({
  user: buildUser(),
  token: 'jwt.token.value',
  isLoading: false,
  loginUser: vi.fn(),
  logoutUser: vi.fn(),
  updateUser: vi.fn(),
  ...overrides,
});

const menuOpenSelector = '[role="menu"][aria-label="Menú de usuario"]:not(.pointer-events-none)';

describe('UserMenu accessibility', () => {
  it('opens the menu when the trigger is clicked', async () => {
    const handleLogout = vi.fn();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={buildContext()}>
          <UserMenu user={buildUser()} handleLogout={handleLogout} />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    expect(document.querySelector(menuOpenSelector)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /menú de test/i }));
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).not.toBeNull());
  });

  it('toggles the menu with Enter and Space', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={buildContext()}>
          <UserMenu user={buildUser()} handleLogout={vi.fn()} />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /menú de test/i });
    trigger.focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).not.toBeNull());

    trigger.focus();
    await user.keyboard(' ');
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).toBeNull());
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={buildContext()}>
          <UserMenu user={buildUser()} handleLogout={vi.fn()} />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    const trigger = screen.getByRole('button', { name: /menú de test/i });
    fireEvent.click(trigger);
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).not.toBeNull());

    await user.keyboard('{Escape}');
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('closes when clicking outside', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={buildContext()}>
          <UserMenu user={buildUser()} handleLogout={vi.fn()} />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /menú de test/i }));
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).not.toBeNull());

    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(document.querySelector(menuOpenSelector)).toBeNull());
  });

  it('exposes menu items with role=menuitem and triggers logout', async () => {
    const user = userEvent.setup();
    const handleLogout = vi.fn();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={buildContext()}>
          <UserMenu user={buildUser()} handleLogout={handleLogout} />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /menú de test/i }));
    const logout = await screen.findByRole('menuitem', { name: /cerrar sesión/i });
    expect(logout).toBeInTheDocument();
    await user.click(logout);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});