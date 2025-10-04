import { useAuthContext } from '../context/AuthContext';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';

export function useApi() {
  const { token } = useAuthContext();

  return {
    get: async <T>(path: string, params?: Record<string, unknown>) =>
      apiGet<T>(path, { token, params: params as Record<string, string | number | undefined | null> }),
    post: async <T>(path: string, data: unknown) => apiPost<T>(path, data, { token }),
    put: async <T>(path: string, data: unknown) => apiPut<T>(path, data, { token }),
    del: async <T>(path: string, params?: Record<string, unknown>) =>
      apiDelete<T>(path, { token, params: params as Record<string, string | number | undefined | null> }),
  };
}
