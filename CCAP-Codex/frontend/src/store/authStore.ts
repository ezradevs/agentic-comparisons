import { create } from 'zustand';
import { apiClient, getStoredToken, setAuthToken } from '../lib/apiClient';
import type { AuthenticatedUser, LoginResponse } from '../types/api';

interface AuthState {
  user: AuthenticatedUser | null;
  token: string | null;
  isHydrated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,
  error: null,
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      setAuthToken(response.data.token);
      set({ user: response.data.user, token: response.data.token, error: null });
    } catch (error) {
      set({ error: 'Unable to sign in. Check your credentials.' });
      throw error;
    }
  },
  logout() {
    setAuthToken(null);
    set({ user: null, token: null, error: null });
  },
  async hydrate() {
    const token = getStoredToken();
    if (!token) {
      set({ isHydrated: true });
      return;
    }
    setAuthToken(token);
    try {
      const response = await apiClient.get<{ user: AuthenticatedUser }>('/auth/profile');
      set({ user: response.data.user, token, isHydrated: true, error: null });
    } catch (error) {
      setAuthToken(null);
      set({ user: null, token: null, isHydrated: true });
    }
  }
}));
