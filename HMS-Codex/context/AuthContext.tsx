'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Role, User } from '@/lib/types';
import { users as seedUsers } from '@/data/mockData';

interface Credentials {
  email: string;
  role: Role;
  name?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: Role | Role[]) => boolean;
  availableUsers: User[];
}

const STORAGE_KEY = 'codexhms-auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function resolveUser(credentials: Credentials): User {
  const existing = seedUsers.find((entry) => entry.email.toLowerCase() === credentials.email.toLowerCase() && entry.role === credentials.role);
  if (existing) {
    return existing;
  }
  const name = credentials.name ?? credentials.email.split('@')[0];
  return {
    id: `u-${credentials.role}-${Date.now()}`,
    name,
    email: credentials.email,
    role: credentials.role,
    department: credentials.role === 'doctor' ? 'General Medicine' : undefined,
    avatarInitials: name
      .split(' ')
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2)
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const serialized = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as User;
        setUser(parsed);
      } catch (error) {
        console.error('Failed to parse stored user session', error);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const resolvedUser = resolveUser(credentials);
        setUser(resolvedUser);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvedUser));
        }
        setLoading(false);
        resolve();
      }, 450);
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const hasRole = useCallback(
    (roles: Role | Role[]) => {
      if (!user) {
        return false;
      }
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(user.role);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      hasRole,
      availableUsers: seedUsers
    }),
    [user, loading, login, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
