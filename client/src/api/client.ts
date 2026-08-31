import axios, { AxiosError } from 'axios';

const TOKEN_KEY = 'teamflow.token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStorage.get()) {
      tokenStorage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

interface ApiErrorBody {
  error?: { message?: string; details?: { field: string; message: string }[] };
}

/** Converts any thrown value into a message that is safe to show to the user. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    const details = body?.error?.details;
    if (details?.length) {
      return details.map((detail) => detail.message).join(', ');
    }
    if (body?.error?.message) {
      return body.error.message;
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Cannot reach the server. Is the API running?';
    }
  }
  return fallback;
}
