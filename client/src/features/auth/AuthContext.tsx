import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchCurrentUser } from '@/api/auth';
import { tokenStorage } from '@/api/client';
import type { AuthResponse, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  setSession: (auth: AuthResponse) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser(): Promise<void> {
      if (!tokenStorage.get()) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await fetchCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const setSession = useCallback((auth: AuthResponse) => {
    tokenStorage.set(auth.token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, setSession, logout }),
    [user, isLoading, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
