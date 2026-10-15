import { afterEach, expect, it, vi } from 'vitest';
import type { AppEnv } from '../src/worker/env';
vi.mock('../src/worker/coordinator', () => ({ Coordinator: class {} }));
import app from '../src/worker/index';
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function environment(origin: string): AppEnv {
  return { PRODUCT_RADAR_BASE_URL: origin, PRODUCT_RADAR_INTEGRATION_SECRET: 'private-server-value-not-for-client'.repeat(2), DB: { prepare: () => ({ first: async () => ({ n: 0 }) }) }, ASSETS: { fetch: async () => new Response('app') } } as unknown as AppEnv;
}
it('exposes only the validated public UI origin without authenticating or leaking integration credentials', async () => {
  const response = await app.request('https://web.example.test/api/config', {}, environment('https://radar.example.test'));
  expect(response.status).toBe(200);
  const config = await response.json() as Record<string, unknown>;
  expect(config.productRadarOrigin).toBe('https://radar.example.test');
  expect(JSON.stringify(config)).not.toContain('private-server-value');
});
it.each(['https://radar.example.test/path', 'https://radar.example.test/; frame-src *', 'http://untrusted.example.test'])('refuses an invalid frame host configuration: %s', async origin => {
  const response = await app.request('https://web.example.test/api/config', {}, environment(origin));
  expect((await response.json() as Record<string, unknown>).productRadarOrigin).toBeNull();
});
