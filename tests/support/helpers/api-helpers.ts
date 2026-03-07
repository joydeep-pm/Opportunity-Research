import type { APIRequestContext } from '@playwright/test';

/**
 * Fetch the current signal state from the API.
 */
export async function getSignalState(request: APIRequestContext) {
  const response = await request.get('/api/signal');
  if (!response.ok()) {
    throw new Error(`GET /api/signal failed: ${response.status()}`);
  }
  return response.json();
}
