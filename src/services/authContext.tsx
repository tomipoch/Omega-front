import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthContextValue, AuthUser } from '../types';
import {
  clearAuth as clearPersistedAuth,
  getStoredUser,
  persistAuth,
} from './authService';
import { clearToken, getToken } from './authStorage';
import { UNAUTHORIZED_EVENT } from './apiClient';

const MISSING_PROVIDER_MESSAGE =
  'AuthContext: useContext invocado fuera de <AuthProvider>. Envuelve la app con <AuthProvider>.';

const defaultValue: AuthContextValue = {
  user: null,
  token: null,
  isLoading: true,
  loginUser: () => {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  },
  logoutUser: () => {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  },
  updateUser: () => {
    throw new Error(MISSING_PROVIDER_MESSAGE);
  },
};

export const AuthContext = createContext<AuthContextValue>(defaultValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getToken());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleUnauthorized = () => {
      clearPersistedAuth();
      clearToken();
      setUser(null);
      setToken(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const loginUser = useCallback((userData: AuthUser): void => {
    const tokenValue = userData?.token;
    if (!tokenValue) {
      console.error('loginUser: token ausente en la respuesta');
      return;
    }
    persistAuth(userData, tokenValue);
    setUser(userData);
    setToken(tokenValue);
  }, []);

  const logoutUser = useCallback((): void => {
    clearPersistedAuth();
    clearToken();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>): void => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      persistAuth(next, getToken() ?? '');
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, isLoading, loginUser, logoutUser, updateUser }),
    [user, token, isLoading, loginUser, logoutUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};