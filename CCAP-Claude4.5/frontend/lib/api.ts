import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
  getCurrentUser: () => api.get('/auth/me'),
};

// Players API
export const playersApi = {
  getAll: (params?: { active?: boolean }) => api.get('/players', { params }),
  getOne: (id: number) => api.get(`/players/${id}`),
  create: (data: any) => api.post('/players', data),
  update: (id: number, data: any) => api.put(`/players/${id}`, data),
  delete: (id: number) => api.delete(`/players/${id}`),
  getHistory: (id: number) => api.get(`/players/${id}/history`),
};

// Tournaments API
export const tournamentsApi = {
  getAll: (params?: { status?: string }) => api.get('/tournaments', { params }),
  getOne: (id: number) => api.get(`/tournaments/${id}`),
  create: (data: any) => api.post('/tournaments', data),
  update: (id: number, data: any) => api.put(`/tournaments/${id}`, data),
  delete: (id: number) => api.delete(`/tournaments/${id}`),
  getPlayers: (id: number) => api.get(`/tournaments/${id}/players`),
  addPlayer: (id: number, playerId: number, seedNumber?: number) =>
    api.post(`/tournaments/${id}/players`, { player_id: playerId, seed_number: seedNumber }),
  removePlayer: (id: number, playerId: number) =>
    api.delete(`/tournaments/${id}/players/${playerId}`),
  startNextRound: (id: number) => api.post(`/tournaments/${id}/rounds/next`),
  getGames: (id: number, round?: number) =>
    api.get(`/tournaments/${id}/games`, { params: { round } }),
  getStandings: (id: number) => api.get(`/tournaments/${id}/standings`),
};

// Games API
export const gamesApi = {
  getOne: (id: number) => api.get(`/games/${id}`),
  updateResult: (id: number, result: string) =>
    api.put(`/games/${id}/result`, { result }),
  clearResult: (id: number) => api.delete(`/games/${id}/result`),
};

export default api;
