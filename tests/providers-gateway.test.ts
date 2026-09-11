import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPagesGateway } from '../src/worker/providers/pages';

const appOrigin = 'https://wr.example';
const projectId = 'review-project';
const releaseId = 'release-current';
const inquiryPath = `/api/public/sites/${projectId}/inquiries`;
const gatePath = `/public/sites/${projectId}/gate/${releaseId}`;
const body = JSON.stringify({
  requestId: 'buyer-request',
  name: 'Buyer',
  email: 'buyer@example.com',
  company: 'Buyer Company',
  message: 'Please share product specifications.',
  productId: 'product-one',
});
async function gateway(boundReleaseId = releaseId) {
  const source = createPagesGateway(appOrigin, projectId, boundReleaseId);
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`))
    .default;
}
function upstream(active = true) {
  const submissions: unknown[] = [];
  const events: string[] = [];
  const fetch = vi.fn(async (url: string, init: RequestInit) => {
    const parsed = new URL(url);
    expect(parsed.origin).toBe(appOrigin);
    expect(init.redirect).toBe('error');
    expect(init.cache).toBe('no-store');
    const headers = new Headers(init.headers);
    expect(headers.has('authorization')).toBe(false);
    expect(headers.has('cookie')).toBe(false);
    if (parsed.pathname.startsWith(`/public/sites/${projectId}/gate/`)) {
      expect(init.method).toBe('GET');
      events.push('gate');
      return new Response(null, { status: active && parsed.pathname === gatePath ? 204 : 404 });
    }
    if (parsed.pathname === inquiryPath && init.method === 'POST') {
      events.push('inquiry');
      if (!active) return Response.json({ message: 'Website unavailable' }, { status: 404 });
      expect(headers.get('content-type')).toBe('application/json');
      const payload = await new Response(init.body).json();
      submissions.push(payload);
      return Response.json({ id: 'saved-inquiry', emailStatus: 'queued' });
    }
    // Pages HTML must never be fetched from the canonical renderer.
    throw new Error(`Unexpected canonical HTML/media fetch: ${parsed.pathname}`);
  });
  const assets = vi.fn(async (request: Request) => {
    const path = new URL(request.url).pathname;
    events.push(`assets:${path}`);
    return new Response(request.method === 'HEAD' ? null : `<h1>Precompiled ${path}</h1>`, {
      headers: { 'Content-Type': 'text/html', 'Set-Cookie': 'must-not-leak=1' },
    });
  });
  vi.stubGlobal('fetch', fetch);
  return { fetch, submissions, assets, env: { ASSETS: { fetch: assets } }, events };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('generated Pages gateway with immutable static artifacts', () => {
  it('serves the previous static snapshot while a promoted deployment awaits D1 activation', async () => {
    const source = createPagesGateway(appOrigin, projectId, 'release-new', releaseId, {
      current: ['en/index.html'],
      previous: ['en/index.html', 'de/contact/index.html'],
    });
    const worker = (
      await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
    ).default;
    const fake = upstream();
    const response = await worker.fetch(
      new Request('https://stable.pages.dev/en/index.html'),
      fake.env,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('/__wr_previous/en/index.html');
    expect(fake.events).toEqual(['gate', 'gate', 'assets:/__wr_previous/en/index.html']);
    expect(
      (await worker.fetch(new Request('https://stable.pages.dev/de/contact/index.html'), fake.env))
        .status,
    ).toBe(200);
    expect(
      (
        await worker.fetch(
          new Request(`https://stable.pages.dev${inquiryPath}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body,
          }),
          fake.env,
        )
      ).status,
    ).toBe(200);
    for (const path of [
      '/__wr_previous/en/index.html',
      '/%5f%5fwr_previous/en/index.html',
      '/en/%2e%2e/__wr_previous/en/index.html',
    ])
      expect(
        (await worker.fetch(new Request('https://stable.pages.dev' + path), fake.env)).status,
      ).toBe(404);
    upstream(false);
    expect(
      (await worker.fetch(new Request('https://stable.pages.dev/en/index.html'), fake.env)).status,
    ).toBe(404);
  });

  it('selects the new snapshot only after activation and never exposes previous-only paths', async () => {
    const source = createPagesGateway(appOrigin, projectId, releaseId, 'release-older', {
      current: ['en/index.html'],
      previous: ['en/index.html', 'de/contact/index.html'],
    });
    const worker = (
      await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
    ).default;
    const fake = upstream();
    const response = await worker.fetch(
      new Request('https://stable.pages.dev/en/index.html'),
      fake.env,
    );
    expect(await response.text()).toBe('<h1>Precompiled /en/index.html</h1>');
    expect(
      (await worker.fetch(new Request('https://stable.pages.dev/de/contact/index.html'), fake.env))
        .status,
    ).toBe(404);
    expect(
      (
        await worker.fetch(
          new Request('https://stable.pages.dev/__wr_previous/en/index.html'),
          fake.env,
        )
      ).status,
    ).toBe(404);
    expect(fake.fetch).toHaveBeenCalledTimes(3);
  });
  it('checks the bound release before same-host root redirects and serves the precompiled homepage', async () => {
    const worker = await gateway();
    const fake = upstream();
    for (const path of ['/', '/index.html']) {
      const root = await worker.fetch(
        new Request(`https://preview-alias.pages.dev${path}`),
        fake.env,
      );
      expect(root.status).toBe(302);
      expect(root.headers.get('location')).toBe('/en/index.html');
      expect(root.headers.get('cache-control')).toBe('no-store');
    }
    expect(fake.assets).not.toHaveBeenCalled();
    expect(fake.events).toEqual(['gate', 'gate']);
    const home = await worker.fetch(
      new Request('https://preview-alias.pages.dev/en/index.html'),
      fake.env,
    );
    expect(home.status).toBe(200);
    expect(await home.text()).toBe('<h1>Precompiled /en/index.html</h1>');
    expect(home.headers.get('cache-control')).toBe('no-store');
    expect(home.headers.has('set-cookie')).toBe(false);
    expect(fake.events).toEqual(['gate', 'gate', 'gate', 'assets:/en/index.html']);
    expect(fake.fetch.mock.calls.every(([url]) => url === `${appOrigin}${gatePath}`)).toBe(true);
  });

  it('serves catalog, product and asset requests from Pages after the current-release gate', async () => {
    const worker = await gateway();
    const fake = upstream();
    for (const path of [
      '/de/catalog/index.html',
      '/en/products/product-one/index.html',
      '/assets/style.css',
    ]) {
      const request = new Request(`https://published.pages.dev${path}`);
      expect((await worker.fetch(request, fake.env)).status).toBe(200);
      expect(fake.assets).toHaveBeenLastCalledWith(request);
    }
    const head = new Request('https://published.pages.dev/en/index.html', { method: 'HEAD' });
    expect((await worker.fetch(head, fake.env)).status).toBe(200);
    expect(fake.events).toEqual([
      'gate',
      'assets:/de/catalog/index.html',
      'gate',
      'assets:/en/products/product-one/index.html',
      'gate',
      'assets:/assets/style.css',
      'gate',
      'assets:/en/index.html',
    ]);
    expect(fake.fetch.mock.calls.every(([url]) => url === `${appOrigin}${gatePath}`)).toBe(true);
  });

  it('gates and forwards only its own inquiry with exact body and no browser credentials', async () => {
    const worker = await gateway();
    const fake = upstream();
    const response = await worker.fetch(
      new Request(`https://published.pages.dev${inquiryPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer browser-credential',
          Cookie: 'private-session=must-not-forward',
        },
        body,
      }),
      fake.env,
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 'saved-inquiry', emailStatus: 'queued' });
    expect(fake.submissions).toEqual([JSON.parse(body)]);
    expect(fake.events).toEqual(['gate', 'inquiry']);
    expect(fake.assets).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('denies offline roots, content and inquiries without accessing static artifacts', async () => {
    const worker = await gateway();
    const fake = upstream(false);
    for (const path of ['/', '/index.html', '/en/index.html']) {
      expect(
        (await worker.fetch(new Request(`https://old.pages.dev${path}`), fake.env)).status,
      ).toBe(404);
    }
    const inquiry = await worker.fetch(
      new Request(`https://old.pages.dev${inquiryPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      fake.env,
    );
    expect(inquiry.status).toBe(404);
    expect(fake.submissions).toHaveLength(0);
    expect(fake.assets).not.toHaveBeenCalled();
  });

  it('binds each deployed gateway to its immutable release and blocks stale aliases', async () => {
    const staleWorker = await gateway('release-previous');
    const fake = upstream();
    for (const path of ['/', '/en/index.html']) {
      expect(
        (await staleWorker.fetch(new Request(`https://old-release.pages.dev${path}`), fake.env))
          .status,
      ).toBe(404);
    }
    const inquiry = await staleWorker.fetch(
      new Request(`https://old-release.pages.dev${inquiryPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      fake.env,
    );
    expect(inquiry.status).toBe(404);
    expect(fake.fetch.mock.calls.every(([url]) => url.endsWith('/gate/release-previous'))).toBe(
      true,
    );
    expect(fake.assets).not.toHaveBeenCalled();
    expect(fake.submissions).toHaveLength(0);
  });

  it('fails closed on unavailable, unexpected or redirected gate responses', async () => {
    const worker = await gateway();
    const fake = upstream();
    for (const status of [200, 401, 503]) {
      vi.stubGlobal('fetch', async () => new Response(null, { status }));
      const response = await worker.fetch(
        new Request('https://published.pages.dev/en/index.html'),
        fake.env,
      );
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
    vi.stubGlobal('fetch', async () => {
      throw new TypeError('Redirect rejected');
    });
    expect(
      (await worker.fetch(new Request('https://published.pages.dev/en/index.html'), fake.env))
        .status,
    ).toBe(503);
    expect(fake.assets).not.toHaveBeenCalled();
  });

  it('rejects other projects and all other mutation paths without checking or serving content', async () => {
    const worker = await gateway();
    const fake = upstream();
    for (const [method, path] of [
      ['POST', '/api/public/sites/other-project/inquiries'],
      ['POST', `${inquiryPath}/retry`],
      ['POST', '/en/index.html'],
      ['PUT', inquiryPath],
      ['DELETE', inquiryPath],
      ['OPTIONS', inquiryPath],
    ]) {
      const response = await worker.fetch(
        new Request(`https://published.pages.dev${path}`, { method, body }),
        fake.env,
      );
      expect(response.status).toBe(405);
      expect(response.headers.get('cache-control')).toBe('no-store');
    }
    expect(fake.fetch).not.toHaveBeenCalled();
    expect(fake.assets).not.toHaveBeenCalled();
  });

  it('rejects declared and streamed oversized inquiry bodies without forwarding the POST', async () => {
    const worker = await gateway();
    const fake = upstream();
    for (const headers of [
      { 'Content-Type': 'application/json', 'Content-Length': String(1024 * 1024 + 1) },
      { 'Content-Type': 'application/json' },
    ] as HeadersInit[]) {
      const response = await worker.fetch(
        new Request(`https://published.pages.dev${inquiryPath}`, {
          method: 'POST',
          headers,
          body: 'x'.repeat(1024 * 1024 + 1),
        }),
        fake.env,
      );
      expect(response.status).toBe(413);
    }
    expect(fake.submissions).toHaveLength(0);
    expect(fake.assets).not.toHaveBeenCalled();
    expect(fake.fetch.mock.calls.every(([url]) => url === `${appOrigin}${gatePath}`)).toBe(true);
  });

  it('bounds stalled body reads and fails closed when the gated inquiry POST is unavailable', async () => {
    const worker = await gateway();
    const fake = upstream();
    vi.useFakeTimers();
    const stalled = new Request(`https://published.pages.dev${inquiryPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: new ReadableStream({ start() {} }),
      duplex: 'half',
    } as RequestInit);
    const pending = worker.fetch(stalled, fake.env);
    await vi.advanceTimersByTimeAsync(15000);
    expect((await pending).status).toBe(408);
    expect(fake.submissions).toHaveLength(0);
    vi.useRealTimers();
    vi.stubGlobal('fetch', async (url: string) => {
      if (url.endsWith(gatePath)) return new Response(null, { status: 204 });
      throw new TypeError('Network unavailable');
    });
    const response = await worker.fetch(
      new Request(`https://published.pages.dev${inquiryPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
      fake.env,
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
});
