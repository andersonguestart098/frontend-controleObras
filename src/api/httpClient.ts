import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const baseURL = isDevelopment
  ? (
      import.meta.env.VITE_API_BASE_URL ??
      'http://127.0.0.1:8000/api/v1'
    )
  : '/api';

const apiKey = isDevelopment
  ? import.meta.env.VITE_API_KEY ?? ''
  : '';

export const httpClient = axios.create({
  baseURL,
  timeout: 90_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    if (apiKey) {
      config.headers.set(
        'X-API-Key',
        apiKey,
      );
    }

    return config;
  },
);