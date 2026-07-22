import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

import {
  proxyPostToBackend,
} from '../../server/backendProxy.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  await proxyPostToBackend(
    request,
    response,
    {
      backendPath: '/dashboard/remessas',
    },
  );
}
