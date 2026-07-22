import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

interface ProxyOptions {
  backendPath: string;
}

export async function proxyPostToBackend(
  request: VercelRequest,
  response: VercelResponse,
  options: ProxyOptions,
): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');

    response.status(405).json({
      detail: 'Método não permitido.',
    });

    return;
  }

  const backendUrl = process.env.BACKEND_URL
    ?.trim()
    .replace(/\/+$/, '');

  const backendApiKey =
    process.env.BACKEND_API_KEY?.trim();

  if (!backendUrl || !backendApiKey) {
    console.error(
      'BACKEND_URL ou BACKEND_API_KEY não configurada.',
    );

    response.status(500).json({
      detail:
        'Configuração do backend não encontrada.',
    });

    return;
  }

  const targetUrl =
    `${backendUrl}/api/v1${options.backendPath}`;

  try {
    const requestBody =
      typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body ?? {});

    const backendResponse = await fetch(
      targetUrl,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-API-Key': backendApiKey,
        },
        body: requestBody,
      },
    );

    const responseBody =
      await backendResponse.text();

    const contentType =
      backendResponse.headers.get(
        'content-type',
      ) ?? 'application/json';

    response.setHeader(
      'Content-Type',
      contentType,
    );

    response
      .status(backendResponse.status)
      .send(responseBody);
  } catch (error) {
    console.error(
      `Erro ao acessar ${targetUrl}:`,
      error,
    );

    response.status(502).json({
      detail:
        'Não foi possível acessar o backend.',
    });
  }
}