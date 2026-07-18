import { useContext } from 'react';
import { AuthContext } from '../services/authContext';
import type { AuthContextValue, AuthUser, Rol } from '../types';

export interface UseUserResult extends AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

export const useUser = (): UseUserResult => {
  const context = useContext(AuthContext);
  const rol = Number(context.user?.rol_id) as Rol;
  return {
    ...context,
    isAdmin: rol === 2,
    isAuthenticated: context.user !== null,
    isAuthLoading: context.isLoading,
  };
};