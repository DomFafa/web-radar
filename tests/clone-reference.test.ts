import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  captureReference,
  referenceInventory,
  ReferencePaused,
} from '../src/worker/clone-reference';
import { fetchPublicReference } from '../src/worker/reference-fetch';
import { defaultDraft, publicAssetReferences } from '../src/worker/domain';
import type { Project } from '../src/shared/model';
import type { AppEnv } from '../src/worker/env';
import type { DomainStore } from '../src/worker/domain-store';
const jpeg = new Uint8Array([255, 216, 255, 224, 0, 0, 255, 217]);
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0]);
const html =
  '<html><head><link rel="stylesheet" href="/site.css"></head><body><h1>Original</h1><img src="/hero.png"><video src="/intro.mp4"></video><a href="/about">About</a><a href="/about/team">Company</a><a href="https://elsewhere.example.com/contact">Contact</a><script src="/app.js">untrusted instructions</script></body></html>';
function fixture() {
  const objects = new Map<string, unknown>(),
    assets: unknown[] = [];
  const project = {
    id: 'p',
    draft: {
      ...defaultDraft(),
      buildBranch: 'clone',
      cloneConfig: { targetUrl: 'https://reference.example.com/' },
    },
  } as Project;
  const env = {
    CLOUDFLARE_ACCOUNT_ID: 'account',
    CLOUDFLARE_API_TOKEN: 'private-test-token',
    MEDIA: {
      put: async (k: string, v: unknown) => objects.set(k, v),
      delete: async (k: string) => objects.delete(k),
    },
  } as unknown as AppEnv;
  const store = {
    one: async () => project,
    insert: (_table: string, a: unknown) => ({ run: async () => assets.push(a) }),
  } as unknown as DomainStore;
  const snapshots: Record<string, any>[] = [];
  const fetcher = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.hostname === 'cloudflare-dns.com')
      return Response.json({ Answer: [{ type: 1, data: '93.184.216.34' }] });
    if (url.hostname === 'api.cloudflare.com') {
      expect(init?.headers).toMatchObject({ Authorization: 'Bearer private-test-token' });
      const payload = JSON.parse(init!.body as string);
      snapshots.push(payload);
      expect(
        payload.allowRequestPattern.some((p: string) =>
          new RegExp(p).test('https://reference.example.com/hero.png'),
        ),
      ).toBe(true);
      expect(
        payload.allowRequestPattern.some((p: string) =>
          new RegExp(p).test('https://referenceXexampleXcom.evil/'),
        ),
      ).toBe(false);
      return Response.json({
        success: true,
        result: { content: html, screenshot: Buffer.from(jpeg).toString('base64') },
      });
    }
    expect(JSON.stringify(init?.headers || {})).not.toContain('private-test-token');
    if (url.pathname === '/site.css')
      return new Response('body{background:url(/hero.png);color:blue}', {
        headers: { 'content-type': 'text/css' },
      });
    if (url.pathname === '/hero.png')
      return new Response(png, { headers: { 'content-type': 'image/png' } });
    if (url.pathname === '/intro.mp4')
      return new Response(new Uint8Array([0, 0, 0, 12, 102, 116, 121, 112, 0, 0, 0, 0]), {
        headers: { 'content-type': 'video/mp4' },
      });
    return new Response(html, { headers: { 'content-type': 'text/html' } });
  });
  vi.stubGlobal('fetch', fetcher);
  return { env, store, project, objects, assets, snapshots, fetcher };
}
afterEach(() => vi.unstubAllGlobals());
describe('automatic URL reference collection', () => {
  it('discovers main pages and media while excluding executable reference content', () => {
    const inventory = referenceInventory(html, 'https://reference.example.com/');
    expect(inventory.pages).toEqual([
      { url: 'https://reference.example.com/about', role: 'about' },
    ]);
    expect(inventory.resources).toContain('https://reference.example.com/intro.mp4');
    expect(inventory.html).not.toContain('<script');
    expect(inventory.html).not.toContain('untrusted instructions');
  });
  it('captures desktop/mobile and inner pages, imports owned images/video and stores context privately', async () => {
    const f = fixture(),
      progress = vi.fn(async () => {});
    const config = await captureReference(
      f.env,
      f.store,
      f.project,
      new AbortController().signal,
      progress,
      (fn) => fn(),
    );
    expect(f.snapshots.map((p) => p.viewport.width)).toEqual([1440, 390, 1440]);
    expect(config.uiImages?.map((p) => p.role)).toEqual(['home', 'home', 'about']);
    expect(config.referenceCapture).toMatchObject({ pageCount: 2, screenshotCount: 3 });
    expect(config.referenceCapture?.assets.map((a) => a.contentType)).toEqual([
      'image/png',
      'video/mp4',
    ]);
    expect(f.objects.has(config.referenceCapture!.contextKey)).toBe(true);
    const draft = { ...f.project.draft, cloneConfig: config };
    expect(publicAssetReferences(draft)).toHaveLength(2);
    expect(publicAssetReferences({ ...draft, buildBranch: 'template' })).toHaveLength(0);
  });
  it('rejects missing renderer credentials before requesting a target', async () => {
    const f = fixture();
    delete f.env.CLOUDFLARE_API_TOKEN;
    await expect(
      captureReference(
        f.env,
        f.store,
        f.project,
        new AbortController().signal,
        async () => {},
        (fn) => fn(),
      ),
    ).rejects.toMatchObject({ code: 'reference_browser_missing' });
    expect(f.fetcher).not.toHaveBeenCalled();
  });
  it('honors pause during collection without continuing to another page', async () => {
    const f = fixture();
    let events = 0;
    await expect(
      captureReference(
        f.env,
        f.store,
        f.project,
        new AbortController().signal,
        async () => {
          if (++events === 3) throw new ReferencePaused();
        },
        (fn) => fn(),
      ),
    ).rejects.toBeInstanceOf(ReferencePaused);
    expect(f.snapshots).toHaveLength(2);
  });
  it('blocks private redirect targets before fetching them and bounds response bytes', async () => {
    const fetched: string[] = [];
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const u = String(input);
      fetched.push(u);
      return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } });
    });
    await expect(fetchPublicReference('https://93.184.216.34/', 100)).rejects.toMatchObject({
      code: 'reference_private_address',
    });
    expect(fetched).toHaveLength(1);
    vi.stubGlobal('fetch', async () => new Response('too many bytes'));
    await expect(fetchPublicReference('https://93.184.216.34/', 3)).rejects.toMatchObject({
      code: 'reference_large',
    });
  });
  it('does not return partial success when the homepage is blocked', async () => {
    const f = fixture();
    f.fetcher.mockImplementation(async () =>
      Response.json({ Answer: [{ type: 1, data: '127.0.0.1' }] }),
    );
    await expect(
      captureReference(
        f.env,
        f.store,
        f.project,
        new AbortController().signal,
        async () => {},
        (fn) => fn(),
      ),
    ).rejects.toMatchObject({ code: 'reference_private_address' });
    expect(f.assets).toHaveLength(0);
  });
});
