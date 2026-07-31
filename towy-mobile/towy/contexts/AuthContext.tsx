import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { login as apiLogin, signup as apiSignup, getCurrentUser } from '@/services/api';

type Role = 'customer' | 'provider';

type AuthUser = {
  id: string;
  name?: string | null;
  email: string;
  role: Role;
  businessName?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  signup: (params: { name: string; email: string; password: string; role?: Role; latitude?: number; longitude?: number; businessName?: string; }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getCurrentUser();
      // Normalize shapes from backend
      const inferredRole: Role =
        (data?.user?.role as Role) ||
        (data?.role as Role) ||
        (data?.business_name != null || Array.isArray(data?.services) ? 'provider' : 'customer');

      const normalized: AuthUser = {
        id: String(data?.user?.id || data?.id),
        name: data?.user?.name || data?.name || data?.business_name || null,
        email: data?.user?.email || data?.email,
        role: inferredRole,
        businessName: data?.businessName ?? data?.business_name ?? null,
      };
      setUser(normalized);
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        await refresh();
      }
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string, role: Role = 'customer') => {
    const data = await apiLogin({ email, password, role });
    const token: string | undefined = data?.token;
    if (token) {
      await SecureStore.setItemAsync('authToken', token);
      await refresh();
    } else {
      throw new Error('No token returned');
    }
  }, [refresh]);

  const signup = useCallback(
    async (params: {
      name: string;
      email: string;
      password: string;
      role?: Role;
      latitude?: number;
      longitude?: number;
      businessName?: string;
    }) => {
      await apiSignup(params);
      const role: Role = params.role || 'customer';
      await login(params.email, params.password, role);
    },
    [login]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, signup, logout, refresh }), [user, loading, login, signup, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}



