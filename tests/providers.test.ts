import { afterEach, describe, it, expect, vi } from 'vitest';
import type { Draft, Inquiry } from '../src/shared/model';
import { createProviders } from '../src/worker/providers';
import { requestJson, downloadMedia } from '../src/worker/providers/http';
import { createPagesGateway } from '../src/worker/providers/pages';
const draft = (): Draft => ({
  company: {
    name: 'A company',
    email: 'a@example.com',
    contactName: 'A',
    type: 'factory',
    description: 'Customer supplied.',
    facebook: '',
    instagram: '',
    x: '',
  },
  products: [
    {
      id: 'p',
      name: 'A product',
      description: 'Customer supplied.',
      material: 'Wood',
      dimensions: '12 cm',
    },
  ],
  primaryProductId: 'p',
  category: 'toy',
  country: 'US',
  languages: ['en'],
  template: 'natural',
  brandColor: '#52684b',
  copy: {},
  duration: 8,
  direction: 'Natural light',
  script: 'Show product',
  scriptRevision: 1,
  scenes: [
    { id: 's1', description: 'Front', revision: 1 },
    { id: 's2', description: 'Side', revision: 1 },
    { id: 's3', description: 'Back', revision: 1 },
  ],
  storyboardRevision: 1,
  heroAccepted: false,
});
const agnes = {
  AGNES_API_BASE_URL: 'https://apihub.agnes-ai.com',
  AGNES_API_KEY: 'video-key',
  AGNES_MODEL: 'agnes-video-v2.0',
  AGNES_CONTRACT: 'agnes-video-v2.0-2026-09',
  PROVIDER_MEDIA_ORIGINS: 'https://media.example,https://platform-outputs.agnes-ai.space',
};
afterEach(() => vi.unstubAllGlobals());
describe('provider boundaries', () => {
  it('marks missing config unavailable and only fakes in explicit test environment', async () => {
    const live = createProviders({ TEST_PROVIDERS: 'true' });
    expect(live.status().every((s) => s.mode === 'unconfigured')).toBe(true);
    await expect(live.script(draft())).rejects.toMatchObject({ code: 'text_unconfigured' });
    const test = createProviders({ ENVIRONMENT: 'test', TEST_PROVIDERS: 'true' });
    expect(test.status().every((s) => s.mode === 'test')).toBe(true);
    expect((await test.image(draft(), draft().scenes[0], '', [])).testMode).toBe(true);
  });
  it('submits one complete keyframes video and preserves video_id', async () => {
    let body: any;
    vi.stubGlobal('fetch', async (_url: unknown, init: RequestInit) => {
      body = JSON.parse(init.body as string);
      expect(init.redirect).toBe('manual');
      return Response.json({ video_id: 'video_known', task_id: 'wrong_id' });
    });
    const p = createProviders(agnes);
    expect(
      await p.submitVideo(
        draft(),
        ['https://media.example/1', 'https://media.example/2', 'https://media.example/3'],
        'request',
      ),
    ).toEqual({ videoId: 'video_known' });
    expect(body.extra_body.image).toHaveLength(3);
    expect(body.extra_body.mode).toBe('keyframes');
    expect(body.num_frames).toBe(193);
    expect(body.model).toBe('agnes-video-v2.0');
  });
  it('rejects missing contract and insufficient storyboard references before network', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    await expect(
      createProviders({ ...agnes, AGNES_CONTRACT: '' }).submitVideo(draft(), [], 'r'),
    ).rejects.toMatchObject({ code: 'agnes_unconfigured' });
    await expect(
      createProviders(agnes).submitVideo(
        { ...draft(), duration: 12 },
        ['https://media.example/1'],
        'r',
      ),
    ).rejects.toMatchObject({ code: 'video_references' });
    expect(spy).not.toHaveBeenCalled();
  });
  it('treats ambiguous acceptance as unknown and refuses unsafe media downloads', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ task_id: 'only-task-id' }));
    await expect(
      createProviders(agnes).submitVideo(draft(), Array(3).fill('https://media.example/1'), 'r'),
    ).rejects.toMatchObject({ uncertain: true });
    vi.stubGlobal('fetch', async () =>
      Response.json({
        status: 'completed',
        seconds: '8.04',
        metadata: { url: 'http://127.0.0.1/secret' },
      }),
    );
    await expect(createProviders(agnes).pollVideo('v')).rejects.toMatchObject({
      code: 'unsafe_media_url',
    });
  });
  it('uses dedicated image edits key/model and reference bytes', async () => {
    let posted: FormData | undefined;
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      if (url.startsWith('https://media.example/'))
        return new Response(new Uint8Array([137, 80, 78, 71]), {
          headers: { 'content-type': 'image/png' },
        });
      expect(init.headers).toMatchObject({ Authorization: 'Bearer image-only' });
      posted = init.body as FormData;
      return Response.json({
        data: [
          {
            b64_json:
              'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jvacAAAAASUVORK5CYII=',
          },
        ],
      });
    });
    const p = createProviders({
      IMAGE_API_BASE_URL: 'https://images.example/v1',
      IMAGE_API_KEY: 'image-only',
      TEXT_API_KEY: 'text-only',
      PROVIDER_MEDIA_ORIGINS: 'https://media.example',
    });
    const result = await p.image(draft(), draft().scenes[0], 'keep color', [
      'https://media.example/ref',
    ]);
    expect(result.contentType).toBe('image/png');
    expect(posted!.get('model')).toBe('gpt-image-2.5-sunburst');
    expect(posted!.getAll('image[]')).toHaveLength(1);
  });
  it('sends full inquiry with buyer reply-to and stable idempotency', async () => {
    const inquiry: Inquiry = {
      id: 'i',
      projectId: 'p',
      requestId: 'r',
      name: 'Buyer',
      email: 'buyer@example.com',
      company: 'Buyer Co',
      message: 'Please share specifications.',
      productId: 'product-1',
      siteUrl: 'https://site.example',
      createdAt: '2026-09-12',
      emailStatus: 'queued',
      emailAttempts: 0,
    };
    let sent: any;
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      expect(url).toBe('https://api.resend.com/emails');
      expect(init.redirect).toBe('manual');
      expect(init.headers).toMatchObject({ 'Idempotency-Key': 'inq-i' });
      sent = JSON.parse(init.body as string);
      return Response.json({ id: 'mail' });
    });
    expect(
      await createProviders({
        RESEND_API_KEY: 'mail-key',
        MAIL_FROM: 'platform@example.com',
      }).email(inquiry, 'seller@example.com', 'inq-i'),
    ).toEqual({ id: 'mail', testMode: false });
    expect(sent.reply_to).toBe('buyer@example.com');
    expect(sent.to).toEqual(['seller@example.com']);
    for (const value of [
      'Buyer Co',
      'Please share specifications.',
      'product-1',
      'https://site.example',
      'buyer@example.com',
    ])
      expect(sent.text).toContain(value);
  });
});
describe('Pages alias gateway', () => {
  it('fails closed before serving static artifacts when release activation cannot be verified', async () => {
    const code = createPagesGateway('https://wr.example', 'p', 'release-one');
    const worker = (
      await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
    ).default;
    const spy = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe('https://wr.example/public/sites/p/gate/release-one');
      expect(init.redirect).toBe('manual');
      return new Response('Site offline', { status: 503 });
    });
    vi.stubGlobal('fetch', spy);
    const assets = vi.fn();
    const env = { ASSETS: { fetch: assets } };
    const response = await worker.fetch(
      new Request('https://old-alias.pages.dev/en/index.html'),
      env,
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    vi.stubGlobal('fetch', async () => {
      throw Error('offline');
    });
    expect(
      (await worker.fetch(new Request('https://old-alias.pages.dev/en/index.html'), env)).status,
    ).toBe(503);
    expect(assets).not.toHaveBeenCalled();
  });
});
describe('resumable upstream operations', () => {
  it.each(['url', 'metadata.url'])(
    'reads completed Agnes %s without resubmitting or forwarding credentials to media',
    async (field) => {
      const calls: string[] = [];
      vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
        calls.push(url);
        expect(init.redirect).toBe('manual');
        if (url.startsWith('https://apihub.agnes-ai.com/agnesapi?')) {
          expect(new URL(url).searchParams.get('video_id')).toBe('persisted/video');
          return Response.json({
            status: 'completed',
            ...(field === 'url'
              ? { url: 'https://platform-outputs.agnes-ai.space/final.mp4' }
              : { metadata: { url: 'https://platform-outputs.agnes-ai.space/final.mp4' } }),
          });
        }
        expect(init.headers).toBeUndefined();
        return new Response(new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]), {
          headers: { 'content-type': 'video/mp4' },
        });
      });
      const result = await createProviders(agnes).pollVideo('persisted/video');
      expect(result.state).toBe('succeeded');
      expect(result.media?.testMode).toBe(false);
      expect(calls.some((u) => u.endsWith('/v1/videos'))).toBe(false);
    },
  );
  it('retains status-query Retry-After without accepting or resubmitting a video', async () => {
    const fetch = vi.fn(
      async () =>
        new Response('rate limited', {
          status: 429,
          headers: { 'Retry-After': '120' },
        }),
    );
    vi.stubGlobal('fetch', fetch);
    await expect(createProviders(agnes).pollVideo('persisted-video')).rejects.toMatchObject({
      code: 'agnes_http_429',
      retryAfterMs: 120_000,
      uncertain: false,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('rejects an untrusted top-level video URL before downloading', async () => {
    const fetch = vi.fn(async () =>
      Response.json({ status: 'completed', url: 'http://127.0.0.1/private' }),
    );
    vi.stubGlobal('fetch', fetch);
    await expect(createProviders(agnes).pollVideo('persisted-video')).rejects.toMatchObject({
      code: 'unsafe_media_url',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('does not classify a timed out video acceptance as safe to retry', async () => {
    vi.stubGlobal('fetch', async () => {
      throw Error('network secret must never echo');
    });
    await expect(
      createProviders(agnes).submitVideo(
        draft(),
        Array(3).fill('https://media.example/ref'),
        'same',
      ),
    ).rejects.toMatchObject({ code: 'agnes_network_uncertain', uncertain: true });
  });
  it('has no live fixture fallback on missing credentials', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    await expect(
      createProviders({ ENVIRONMENT: 'production', TEST_PROVIDERS: 'true' }).image(
        draft(),
        draft().scenes[0],
        '',
        [],
      ),
    ).rejects.toMatchObject({ code: 'image_unconfigured' });
    expect(spy).not.toHaveBeenCalled();
  });
  it('uses the dedicated text model and validates the complete selected-language response', async () => {
    let request: any;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      expect(init.headers).toMatchObject({ Authorization: 'Bearer only-text' });
      request = JSON.parse(init.body as string);
      return Response.json({
        choices: [
          {
            message: {
              content: JSON.stringify({
                script: 'One film',
                scenes: [
                  { description: 'Front' },
                  { description: 'Detail' },
                  { description: 'Back' },
                ],
              }),
            },
          },
        ],
      });
    });
    const result = await createProviders({
      TEXT_API_BASE_URL: 'https://text.example/v1',
      TEXT_API_KEY: 'only-text',
      TEXT_MODEL: 'configured-model',
      IMAGE_API_KEY: 'not-text',
    }).script(draft());
    expect(result.scenes).toHaveLength(3);
    expect(request.model).toBe('configured-model');
    expect(request.messages[0].content).toContain('Never invent');
  });
  it('returns playable test WebM bytes for both durations without any network', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    for (const duration of [8, 12] as const) {
      const p = createProviders({ ENVIRONMENT: 'test', TEST_PROVIDERS: 'true' });
      const video = await p.submitVideo(
        { ...draft(), duration },
        Array(duration === 12 ? 4 : 3).fill('test'),
        'same',
      );
      const result = await p.pollVideo(video.videoId);
      expect(result.media?.filename).toContain(`${duration}s`);
      expect(Array.from((result.media!.body as Uint8Array).slice(0, 4))).toEqual([
        26, 69, 223, 163,
      ]);
      expect(result.media?.testMode).toBe(true);
    }
    expect(spy).not.toHaveBeenCalled();
  });
});
describe('Pages direct upload transaction', () => {
  const env = {
    CLOUDFLARE_API_TOKEN: 'cf-secret',
    CLOUDFLARE_ACCOUNT_ID: 'account',
    APP_ORIGIN: 'https://wr.example',
  };
  async function setup(handlers?: {
    pending?: boolean;
    failOpen?: boolean;
    existingRelease?: boolean;
    existingReleasePage?: number;
  }) {
    const projectId = 'project-one';
    const name =
      'wr-' +
      Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(projectId))),
        (b) => b.toString(16).padStart(2, '0'),
      )
        .join('')
        .slice(0, 32);
    const root = `https://api.cloudflare.com/client/v4/accounts/account/pages/projects/${name}`;
    const forms: FormData[] = [];
    const uploads: any[] = [];
    const calls: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      calls.push(url);
      expect(init.redirect).toBe('manual');
      let result: any;
      if (url === root)
        result = {
          name,
          deployment_configs: Object.fromEntries(
            ['production', 'preview'].map((kind) => [
              kind,
              {
                fail_open: handlers?.failOpen ?? false,
                env_vars: { WR_PROJECT_ID: { value: projectId } },
              },
            ]),
          ),
        };
      else if (url.includes('/deployments?')) {
        const params = new URL(url).searchParams;
        if (Number(params.get('per_page')) > 25)
          return Response.json(
            {
              success: false,
              errors: [{ code: 8000024, message: 'Invalid list options provided.' }],
            },
            { status: 400 },
          );
        const page = Number(params.get('page') || 1);
        result =
          page < (handlers?.existingReleasePage ?? 1)
            ? Array.from({ length: 25 }, (_, i) => ({ id: `other-${page}-${i}` }))
            : handlers?.existingRelease
              ? [
                  {
                    id: 'accepted',
                    deployment_trigger: {
                      metadata: { commit_message: 'Web Radar release release-one' },
                    },
                    latest_stage: { name: 'deploy', status: 'success' },
                    uses_functions: true,
                  },
                ]
              : [];
      } else if (url.endsWith('/upload-token')) result = { jwt: 'upload-jwt' };
      else if (url.endsWith('/pages/assets/upload')) {
        expect(init.headers).toMatchObject({ Authorization: 'Bearer upload-jwt' });
        uploads.push(JSON.parse(init.body as string));
      } else if (url.endsWith('/deployments')) {
        forms.push(init.body as FormData);
        result = {
          id: 'accepted',
          latest_stage: { name: 'deploy', status: handlers?.pending ? 'active' : 'success' },
          uses_functions: true,
        };
      } else throw Error('Unexpected endpoint');
      return Response.json({ success: true, result });
    });
    return {
      projectId,
      name,
      calls,
      forms,
      uploads,
      target: { accountId: 'account', pagesProjectName: name },
    };
  }
  it('uploads precompiled HTML and mandatory all-path fail-closed worker before activating', async () => {
    const ctx = await setup();
    const result = await createProviders(env).publish(
      ctx.projectId,
      'release-one',
      {
        'en/index.html': '<h1>Approved site</h1>',
      },
      undefined,
      ctx.target,
    );
    expect(result.url).toBe(`https://${ctx.name}.pages.dev`);
    expect(ctx.uploads[0][0].metadata.contentType).toBe('text/html;charset=utf-8');
    expect(await (ctx.forms[0].get('_worker.js') as Blob).text()).toContain(
      '/public/sites/project-one/gate/release-one',
    );
    expect(JSON.parse(await (ctx.forms[0].get('_routes.json') as Blob).text())).toEqual({
      version: 1,
      include: ['/*'],
      exclude: [],
    });
  });
  it('finds an accepted release on a later API page without creating another deployment', async () => {
    const ctx = await setup({ existingRelease: true, existingReleasePage: 3 });
    const result = await createProviders(env).publish(
      ctx.projectId,
      'release-one',
      { 'index.html': 'approved' },
      undefined,
      ctx.target,
    );
    expect(result.deploymentId).toBe('accepted');
    expect(ctx.calls.filter((url) => url.includes('/deployments?'))).toHaveLength(3);
    expect(ctx.forms).toHaveLength(0);
    expect(ctx.uploads).toHaveLength(0);
  });
  it('refuses a fail-open project before uploading any artifact', async () => {
    const ctx = await setup({ failOpen: true });
    await expect(
      createProviders(env).publish(
        ctx.projectId,
        'release-one',
        { 'index.html': 'safe' },
        undefined,
        ctx.target,
      ),
    ).rejects.toMatchObject({ code: 'pages_gate_not_configured' });
    expect(ctx.uploads).toHaveLength(0);
  });
  it('uploads both bounded snapshots and binds the previous release to its hidden static files', async () => {
    const ctx = await setup();
    await createProviders(env).publish(
      ctx.projectId,
      'release-one',
      { 'en/index.html': '<h1>New draft</h1>' },
      'prior-deployment',
      ctx.target,
      { releaseId: 'prior-release', files: { 'en/index.html': '<h1>Approved old site</h1>' } },
    );
    const manifest = JSON.parse(String(ctx.forms[0].get('manifest')));
    expect(Object.keys(manifest).sort()).toEqual([
      '/__wr_previous/en/index.html',
      '/__wr_previous/robots.txt',
      '/__wr_previous/sitemap.xml',
      '/en/index.html',
      '/robots.txt',
      '/sitemap.xml',
    ]);
    const uploaded = ctx.uploads
      .flat()
      .map((item) => Buffer.from(item.value, 'base64').toString('utf8'));
    expect(uploaded.some(html => html.includes('<h1>Approved old site</h1>'))).toBe(true);
    expect(uploaded.some(html => html.includes('<urlset'))).toBe(true);
    const gateway = await (ctx.forms[0].get('_worker.js') as Blob).text();
    expect(gateway).toContain('/gate/prior-release');
    expect(gateway).toContain('__wr_previous');
    expect(gateway).toContain('publicFiles.current');
  });
  it('reports pending deployment as uncertain and reuses a known successful release', async () => {
    let ctx = await setup({ pending: true });
    await expect(
      createProviders(env).publish(
        ctx.projectId,
        'release-one',
        { 'index.html': 'safe' },
        undefined,
        ctx.target,
      ),
    ).rejects.toMatchObject({ code: 'pages_deployment_pending', uncertain: true });
    ctx = await setup({ existingRelease: true });
    expect(
      (
        await createProviders(env).publish(
          ctx.projectId,
          'release-one',
          { 'index.html': 'safe' },
          undefined,
          ctx.target,
        )
      ).deploymentId,
    ).toBe('accepted');
    expect(ctx.uploads).toHaveLength(0);
    expect(ctx.forms).toHaveLength(0);
  });
});

describe('provider redirect boundary', () => {
  it.each([301, 302, 303, 307, 308])(
    'rejects HTTP %s without following to another origin',
    async (status) => {
      const upstream = vi.fn(
        async (_url: unknown, _init?: RequestInit) =>
          new Response(null, {
            status,
            headers: {
              Location: 'https://other.example.test/collect',
              'Content-Type': 'image/png',
            },
          }),
      );
      vi.stubGlobal('fetch', upstream);
      await expect(
        requestJson(
          'https://provider.example.test/generate',
          {
            method: 'POST',
            headers: { Authorization: 'Bearer test-key' },
            body: '{}',
          },
          { mutation: true },
        ),
      ).rejects.toMatchObject({ uncertain: true });
      expect(upstream).toHaveBeenCalledTimes(1);
      expect(upstream.mock.calls[0][1]?.redirect).toBe('manual');
      upstream.mockClear();
      await expect(
        downloadMedia(
          { PROVIDER_MEDIA_ORIGINS: 'https://media.example.test' },
          'https://media.example.test/image',
          'image',
        ),
      ).rejects.toMatchObject({ code: 'media_invalid_response' });
      expect(upstream).toHaveBeenCalledTimes(1);
      expect(upstream.mock.calls[0][1]?.redirect).toBe('manual');
    },
  );
});
