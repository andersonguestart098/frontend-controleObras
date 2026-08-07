import {
  getAccessToken,
} from '@/auth/authStorage';

import type {
  MaoObraImportacaoResponse,
  MaoObraPreviewResponse,
} from '@/types/importacaoMaoObra';


const ENV_API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL;


const API_BASE_URL = String(
  ENV_API_URL ??
    (
      import.meta.env.DEV
        ? 'http://127.0.0.1:8000/api/v1'
        : ''
    ),
).replace(/\/$/, '');


const IMPORTACAO_BASE_ENDPOINT =
  `${API_BASE_URL}/dashboard/importacoes/mao-de-obra`;


interface ApiErrorPayload {
  detail?: unknown;
  error?: unknown;
  message?: unknown;
}


function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();

  if (!token) {
    throw new Error(
      'Sessão expirada. Faça login novamente.',
    );
  }

  return {
    Accept: 'application/json',

    Authorization: `Bearer ${token}`,
  };
}


async function extractErrorMessage(
  response: Response,
): Promise<string> {
  let payload: ApiErrorPayload | null = null;

  try {
    payload = (
      await response.json()
    ) as ApiErrorPayload;

  } catch {
    payload = null;
  }

  if (
    payload &&
    typeof payload.detail === 'string' &&
    payload.detail.trim()
  ) {
    return payload.detail;
  }

  if (
    payload &&
    typeof payload.message === 'string' &&
    payload.message.trim()
  ) {
    return payload.message;
  }

  if (
    payload &&
    typeof payload.error === 'string' &&
    payload.error.trim()
  ) {
    return payload.error;
  }

  return (
    'Falha na comunicação com a API ' +
    `(HTTP ${response.status}).`
  );
}


async function postMultipart<T>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'URL da API não configurada.',
    );
  }

  const response = await fetch(
    endpoint,
    {
      method: 'POST',

      headers: getAuthHeaders(),

      /*
       * Não informar Content-Type manualmente.
       *
       * O browser monta automaticamente:
       *
       * multipart/form-data;
       * boundary=...
       */
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(
        response,
      ),
    );
  }

  return response.json() as Promise<T>;
}


function buildArquivoFormData(
  arquivo: File,
): FormData {
  const formData = new FormData();

  formData.append(
    'arquivo',
    arquivo,
    arquivo.name,
  );

  return formData;
}


export async function previewImportacaoMaoObra(
  arquivo: File,
): Promise<MaoObraPreviewResponse> {
  return postMultipart<MaoObraPreviewResponse>(
    `${IMPORTACAO_BASE_ENDPOINT}/preview`,
    buildArquivoFormData(
      arquivo,
    ),
  );
}


export async function processarImportacaoMaoObra(
  arquivo: File,
): Promise<MaoObraImportacaoResponse> {
  /*
   * codigo_cliente não é enviado.
   *
   * O backend utiliza o parceiro padrão
   * 46996 enquanto não definirmos
   * a regra definitiva.
   */

  return postMultipart<MaoObraImportacaoResponse>(
    `${IMPORTACAO_BASE_ENDPOINT}/processar`,
    buildArquivoFormData(
      arquivo,
    ),
  );
}


export function getImportacaoMaoObraErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return (
    'Não foi possível concluir a operação. ' +
    'Tente novamente.'
  );
}