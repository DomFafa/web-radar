import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearSession, privateAssetBlob, setSession } from '../src/client/api';

beforeEach(() => setSession('account-one'));
afterEach(() => {
  clearSession();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('deduplicates concurrent reads and reuses images only within the same session and variant', async () => {
  const fetcher = vi.fn(
    async (_url: string, _options?: RequestInit) =>
      new Response('image', { headers: { 'Content-Type': 'image/webp' } }),
  );
  vi.stubGlobal('fetch', fetcher);
  const [a, b] = await Promise.all([
    privateAssetBlob('p', 'a', 'preview'),
    privateAssetBlob('p', 'a', 'preview'),
  ]);
  expect(a).toBe(b);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toBe('/api/projects/p/assets/a?variant=preview');
  await privateAssetBlob('p', 'a', 'preview');
  expect(fetcher).toHaveBeenCalledTimes(1);
  await privateAssetBlob('p', 'a');
  expect(fetcher).toHaveBeenCalledTimes(2);
  setSession('account-two');
  await privateAssetBlob('p', 'a', 'preview');
  expect(fetcher).toHaveBeenCalledTimes(3);
});

it('does not cache failures and expires successful cached reads', async () => {
  vi.useFakeTimers();
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response('', { status: 503 }))
    .mockImplementation(
      async () => new Response('image', { headers: { 'Content-Type': 'image/webp' } }),
    );
  vi.stubGlobal('fetch', fetcher);
  await expect(privateAssetBlob('p', 'a')).rejects.toThrow();
  await privateAssetBlob('p', 'a');
  await vi.advanceTimersByTimeAsync(5 * 60 * 1000 + 1);
  await privateAssetBlob('p', 'a');
  expect(fetcher).toHaveBeenCalledTimes(3);
});

it('times out a stalled response body and allows a fresh retry', async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'fetch',
    vi.fn((_url, init) =>
      Promise.resolve({
        ok: true,
        blob: () =>
          new Promise((_resolve, reject) =>
            init.signal.addEventListener('abort', () => reject(init.signal.reason)),
          ),
      }),
    ),
  );
  const read = privateAssetBlob('p', 'a', 'preview');
  const failure = expect(read).rejects.toThrow('超时');
  await vi.advanceTimersByTimeAsync(30_001);
  await failure;
});

it('aborts pending asset reads when the session changes', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(init.signal.reason));
        }),
    ),
  );
  const read = privateAssetBlob('p', 'a');
  const failure = expect(read).rejects.toThrow();
  clearSession();
  await failure;
});
