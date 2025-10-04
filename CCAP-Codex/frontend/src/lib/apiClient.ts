import axios from 'axios';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      window.localStorage.setItem('ccap_token', token);
    } else {
      window.localStorage.removeItem('ccap_token');
    }
  }
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('ccap_token');
};

export const apiClient = axios.create({
  baseURL: '/api'
});

apiClient.interceptors.request.use((config) => {
  const token = authToken ?? getStoredToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});
