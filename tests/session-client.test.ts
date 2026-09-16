import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { api, clearSession, privateAssetBlob, setSession } from '../src/client/api';
let dispatch: ReturnType<typeof vi.fn>;
beforeEach(() => {
  dispatch = vi.fn();
  vi.stubGlobal('window', { dispatchEvent: dispatch });
  vi.stubGlobal(
    'CustomEvent',
    class {
      constructor(readonly type: string) {}
    },
  );
  setSession('old-session');
});
afterEach(() => {
  clearSession();
  vi.unstubAllGlobals();
});
it('a late 401 from a prior login does not log out the new session', async () => {
  let respond!: (r: Response) => void;
  vi.stubGlobal(
    'fetch',
    vi.fn(
      () =>
        new Promise<Response>((r) => {
          respond = r;
        }),
    ),
  );
  const request = api('/api/projects');
  setSession('new-session');
  respond(Response.json({ code: 'session_expired' }, { status: 401 }));
  await expect(request).rejects.toThrow();
  expect(dispatch).not.toHaveBeenCalled();
});
it('only confirmed session errors clear authentication, including cookie login', async () => {
  setSession('');
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ code: 'product_radar_unavailable' }, { status: 401 }))
    .mockResolvedValueOnce(Response.json({ code: 'session_expired' }, { status: 401 }));
  vi.stubGlobal('fetch', fetcher);
  await expect(api('/api/projects')).rejects.toThrow();
  expect(dispatch).not.toHaveBeenCalled();
  await expect(api('/api/projects')).rejects.toThrow();
  expect(dispatch).toHaveBeenCalledTimes(1);
});
it('cookie-authenticated private media does not send an empty bearer header', async () => {
  setSession('');
  const fetcher = vi.fn(
    async () => new Response('image', { headers: { 'Content-Type': 'image/png' } }),
  );
  vi.stubGlobal('fetch', fetcher);
  await privateAssetBlob('p', 'image');
  const options = (fetcher.mock.calls as unknown as [string, RequestInit][])[0][1];
  expect(new Headers(options.headers).has('Authorization')).toBe(false);
});
