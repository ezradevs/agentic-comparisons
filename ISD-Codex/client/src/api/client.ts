export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined | null>;
  token?: string | null;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined | null>) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiRequest<T = unknown>(path: string, method: HttpMethod = 'GET', options: RequestOptions = {}) {
  const { params, token, headers, body, ...rest } = options;
  const url = buildUrl(path, params);
  const finalHeaders = new Headers(headers as HeadersInit | undefined);

  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (body && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body,
    ...rest,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'API request failed');
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}

export async function apiGet<T = unknown>(path: string, options: RequestOptions = {}) {
  return apiRequest<T>(path, 'GET', options);
}

export async function apiPost<T = unknown>(path: string, data: unknown, options: RequestOptions = {}) {
  return apiRequest<T>(path, 'POST', { ...options, body: JSON.stringify(data) });
}

export async function apiPut<T = unknown>(path: string, data: unknown, options: RequestOptions = {}) {
  return apiRequest<T>(path, 'PUT', { ...options, body: JSON.stringify(data) });
}

export async function apiDelete<T = unknown>(path: string, options: RequestOptions = {}) {
  return apiRequest<T>(path, 'DELETE', options);
}
