const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_URL = rawApiUrl && rawApiUrl.length > 0
  ? rawApiUrl.replace(/\/$/, '')
  : 'http://localhost:5000/api';

export const apiUrl = (path: string) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
