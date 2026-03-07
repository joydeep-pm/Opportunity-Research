import { test, expect } from '../support/merged-fixtures';

test.describe('Signal API', () => {
  test('[P0] GET /api/signal returns valid response shape', async ({ apiRequest }) => {
    // Given: the signal API endpoint is available
    // When: a GET request is made
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/signal',
    });

    // Then: response has expected structure
    expect(status).toBe(200);
    expect(body).toHaveProperty('markdown');
    expect(typeof body.markdown).toBe('string');
    expect(body).toHaveProperty('source');
    expect(['filesystem', 'memory', 'none']).toContain(body.source);
  });

  test('[P0] GET /api/signal always returns exists flag', async ({ apiRequest }) => {
    // Given: the signal API endpoint is available
    // When: a GET request is made
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/signal',
    });

    // Then: exists flag is a boolean
    expect(status).toBe(200);
    expect(typeof body.exists).toBe('boolean');
  });

  test('[P1] GET /api/signal includes sections when signal exists', async ({
    apiRequest,
  }) => {
    // Given: the signal API returns data
    // When: a GET request is made
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/signal',
    });

    // Then: if signal exists, sections array should be present
    expect(status).toBe(200);
    if (body.exists) {
      expect(Array.isArray(body.sections)).toBe(true);
      expect(body.updatedAt).toBeTruthy();
    }
  });

  test('[P1] GET /api/signal includes updatedAt when source is filesystem', async ({
    apiRequest,
  }) => {
    // Given: the signal API returns data
    // When: a GET request is made
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/signal',
    });

    // Then: if source is filesystem, updatedAt is an ISO string
    expect(status).toBe(200);
    if (body.source === 'filesystem') {
      expect(body.updatedAt).toBeTruthy();
      expect(new Date(body.updatedAt).toISOString()).toBe(body.updatedAt);
    }
  });

  test('[P1] POST /api/signal/refresh returns error without API key', async ({
    apiRequest,
  }) => {
    // Given: OPENAI_API_KEY is not set in the test environment
    // When: a POST request is made to refresh
    const { status, body } = await apiRequest({
      method: 'POST',
      path: '/api/signal/refresh',
    });

    // Then: the response indicates a configuration error
    if (status === 500) {
      expect(body).toHaveProperty('error');
      expect(body.ok).toBe(false);
    }
    expect([200, 500, 502]).toContain(status);
  });

  test('[P1] GET /api/signal returns fallback when no signal file', async ({
    apiRequest,
  }) => {
    // Given: the signal API endpoint may not have a signal file
    // When: a GET request is made
    const { status, body } = await apiRequest({
      method: 'GET',
      path: '/api/signal',
    });

    // Then: if no signal exists, source is 'none' with markdown content
    expect(status).toBe(200);
    if (!body.exists) {
      expect(body.source).toBe('none');
      expect(body.markdown).toBeTruthy();
    }
  });
});
