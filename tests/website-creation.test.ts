import { afterEach, expect, it, vi } from 'vitest';
import { PendingWebsiteCreation } from '../src/client/website-creation';
afterEach(() => vi.unstubAllGlobals());
it('keeps the original request and payload across reloads, isolates identities, and clears only on completion', () => {
  const storage = new Map<string, string>();
  vi.stubGlobal('sessionStorage', { getItem: (key: string) => storage.get(key) || null, setItem: (key: string, value: string) => storage.set(key, value), removeItem: (key: string) => storage.delete(key) });
  const first = new PendingWebsiteCreation('owner', 'one').body({ name: 'Original', buildBranch: 'clone', targetUrl: 'https://example.com' });
  const reloaded = new PendingWebsiteCreation('owner', 'one');
  expect(reloaded.body({ name: 'Changed while waiting', buildBranch: 'template' })).toEqual(first);
  expect(new PendingWebsiteCreation('other', 'one').pending).toBeUndefined();
  expect(new PendingWebsiteCreation('owner', 'two').pending).toBeUndefined();
  reloaded.complete(); expect(new PendingWebsiteCreation('owner', 'one').pending).toBeUndefined();
  expect(reloaded.body({ name: 'Second', buildBranch: 'template' }).requestId).not.toBe(first.requestId);
});
