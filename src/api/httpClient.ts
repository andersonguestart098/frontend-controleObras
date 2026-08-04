import axios from 'axios';

import { getAccessToken } from '@/auth/authStorage';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://api-controle-obras-cemear-6cbd941bea73.herokuapp.com/api/v1';

const apiKey =
  import.meta.env.VITE_API_KEY ?? '';

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
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.set(
        "Authorization",
        `Bearer ${accessToken}`,
      );
    }

    return config;
  },
);

