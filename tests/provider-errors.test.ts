import { afterEach, describe, expect, it, vi } from 'vitest';
import { jsonRequest, requestJson } from '../src/worker/providers/http';

afterEach(() => vi.unstubAllGlobals());

describe('provider error diagnostics', () => {
  it('retains the upstream reason and request ID while redacting credentials and signed URLs', async () => {
    const key = 'private-test-key-for-diagnostics';
    const url = 'https://media.example/image?token=private-signed-token';
    vi.stubGlobal('fetch', async () =>
      Response.json(
        {
          error: {
            code: 'permission_denied',
            message: `Model access denied. Key ${key}. Bearer another-private-key. Image ${url}`,
            param: 'model',
          },
        },
        { status: 403, headers: { 'x-request-id': 'req_access_denied' } },
      ),
    );
    const error = await requestJson(
      'https://text.example/v1/chat/completions',
      jsonRequest(key, {}),
      { provider: 'text' },
    ).catch((e) => e);
    expect(error).toMatchObject({ code: 'text_http_403', uncertain: false });
    expect(error.message).toContain('permission_denied');
    expect(error.message).toContain('Model access denied');
    expect(error.message).toContain('req_access_denied');
    expect(error.message).toContain('model');
    for (const secret of [key, 'another-private-key', 'private-signed-token', url])
      expect(error.message).not.toContain(secret);
  });

  it.each([
    ['html', '<html>private upstream error document</html>', 'text/html'],
    ['malformed', '{invalid-json', 'application/json'],
    ['large', JSON.stringify({ error: { message: 'x'.repeat(20000) } }), 'application/json'],
  ])(
    'preserves HTTP classification for an unreadable %s error response',
    async (_name, body, contentType) => {
      vi.stubGlobal(
        'fetch',
        async () =>
          new Response(body, {
            status: 403,
            headers: { 'content-type': contentType, 'x-request-id': 'req_fallback' },
          }),
      );
      const error = await requestJson('https://text.example', {}, { provider: 'text' }).catch(
        (e) => e,
      );
      expect(error).toMatchObject({ code: 'text_http_403', uncertain: false });
      expect(error.message).toContain('req_fallback');
      expect(error.message).not.toContain(body);
      expect(error.message.length).toBeLessThan(1000);
    },
  );

  it('keeps uncertain mutations and Retry-After when adding error details', async () => {
    vi.stubGlobal('fetch', async () =>
      Response.json(
        { error: { code: 'unavailable', message: 'Service unavailable' } },
        {
          status: 503,
          headers: { 'retry-after': '120', 'x-request-id': 'req_unavailable' },
        },
      ),
    );
    await expect(
      requestJson('https://provider.example', {}, { provider: 'image', mutation: true }),
    ).rejects.toMatchObject({
      code: 'image_http_503',
      uncertain: true,
      retryAfterMs: 120000,
      message: expect.stringContaining('req_unavailable'),
    });
  });
});
