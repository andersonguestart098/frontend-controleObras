import axios, { isAxiosError } from 'axios';

import { clearAuthSession, getAccessToken } from '@/auth/authStorage';

/*
 * Endpoints públicos de autenticação: um 401 aqui
 * é erro de credencial (mostrado no próprio
 * formulário), não sessão expirada — não deve
 * limpar sessão nem redirecionar.
 */
const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
];

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

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl =
      isAxiosError(error) && error.config?.url
        ? error.config.url
        : '';

    const isPublicAuthRequest =
      PUBLIC_AUTH_ENDPOINTS.some((endpoint) =>
        requestUrl.includes(endpoint),
      );

    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !isPublicAuthRequest
    ) {
      clearAuthSession();

      if (
        window.location.pathname !== '/login'
      ) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

