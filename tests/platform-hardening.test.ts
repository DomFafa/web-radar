import { afterEach, expect, it, vi } from 'vitest';
import { defaultDraft } from '../src/worker/domain';
import { storeCloneOutput, loadCloneOutput } from '../src/worker/clone-artifacts';
import { preserveCloneOutput } from '../src/shared/clone-output';
import { sanitizeGeneratedHtml } from '../src/worker/site-safety';
import {
  assertPublicReference,
  fetchReferenceHtml,
  publicAddress,
} from '../src/worker/reference-fetch';
import type { AppEnv } from '../src/worker/env';

function storage() {
  const objects = new Map<string, string>();
  const env = {
    MEDIA: {
      put: async (key: string, body: string) => objects.set(key, body),
      get: async (key: string) =>
        objects.has(key) ? { body: new Response(objects.get(key)).body } : null,
    },
  } as unknown as Pick<AppEnv, 'MEDIA'>;
  return { objects, env };
}
afterEach(() => vi.unstubAllGlobals());
it('keeps multi-megabyte output outside the database and verifies its hash and project scope', async () => {
  const { env, objects } = storage();
  const files = { 'en/index.html': '<html>' + 'x'.repeat(2_100_000) + '</html>' };
  const config = await storeCloneOutput(env, 'one', {
    generatedFiles: files,
    generatedHtml: files['en/index.html'],
  });
  expect(JSON.stringify(config).length).toBeLessThan(500);
  expect(config.artifact?.bytes).toBeGreaterThan(2_000_000);
  const draft = { ...defaultDraft(), cloneConfig: config };
  expect((await loadCloneOutput(env, 'one', draft)).cloneConfig?.generatedFiles).toEqual(files);
  await expect(loadCloneOutput(env, 'two', draft)).rejects.toMatchObject({
    code: 'clone_artifact_scope',
  });
  objects.set(config.artifact!.key, 'tampered');
  await expect(loadCloneOutput(env, 'one', draft)).rejects.toMatchObject({
    code: 'clone_artifact_integrity',
  });
});
it('uses stable artifact keys and keeps legacy HTML readable', async () => {
  const { env } = storage();
  const a = await storeCloneOutput(env, 'one', {
    generatedFiles: { 'en/b.html': 'b', 'en/a.html': 'a' },
  });
  const b = await storeCloneOutput(env, 'one', {
    generatedFiles: { 'en/a.html': 'a', 'en/b.html': 'b' },
  });
  expect(a.artifact?.sha256).toBe(b.artifact?.sha256);
  const config = await storeCloneOutput(env, 'one', { generatedHtml: '<html>Legacy</html>' });
  expect(
    (await loadCloneOutput(env, 'one', { ...defaultDraft(), cloneConfig: config })).cloneConfig
      ?.generatedHtml,
  ).toBe('<html>Legacy</html>');
});
it('does not accept generated output or status from editable form fields', () => {
  expect(
    preserveCloneOutput(undefined, {
      generatedHtml: 'forged',
      status: 'ready',
      instructions: 'keep this',
    }),
  ).toEqual({ instructions: 'keep this' });
  expect(
    preserveCloneOutput(
      { generatedHtml: 'trusted', status: 'ready' },
      { generatedHtml: 'forged', status: 'error', instructions: 'new' },
    ),
  ).toEqual({ generatedHtml: 'trusted', status: 'ready', instructions: 'new' });
});
it('removes executable HTML including encoded attributes while preserving layout and the trusted runtime', () => {
  const html = sanitizeGeneratedHtml(
    '<html><head><style>body{color:red}</style><base href="https://evil.example"><meta http-equiv="refresh" content="0;url=https://evil.example"></head><body><script>steal()</script><img src=x onerror="steal()"><a href="java&#x73;cript:steal()">bad</a><svg><a xlink:href="javascript:steal()">bad</a><foreignObject><iframe srcdoc="attack"></iframe></foreignObject></svg><form action="https://evil.example"><input name="email"><button onclick="steal()" formaction="https://evil.example">Send</button></form></body></html>',
    '/public/inquiry',
  );
  expect(html).not.toMatch(
    /steal\(|evil\.example|onerror|onclick|srcdoc|foreignObject|<base|http-equiv="refresh"/i,
  );
  expect(html).toContain('body{color:red}');
  expect(html).toContain('action="/public/inquiry"');
  expect(html.match(/<script>/g)).toHaveLength(1);
});
it('rejects internal, encoded and mixed public/private reference destinations', async () => {
  for (const value of [
    'http://127.1',
    'http://0x7f000001',
    'http://169.254.169.254',
    'http://[::1]',
    'http://[::ffff:127.0.0.1]',
    'http://example.com:8080',
    'http://user:password@example.com',
  ])
    await expect(assertPublicReference(new URL(value))).rejects.toBeTruthy();
  await expect(
    assertPublicReference(new URL('https://example.com'), async () => ['1.1.1.1', '10.0.0.1']),
  ).rejects.toBeTruthy();
  await expect(
    assertPublicReference(new URL('https://example.com'), async () => [
      '1.1.1.1',
      '2606:4700:4700::1111',
    ]),
  ).resolves.toBeUndefined();
  expect(publicAddress('192.0.2.1')).toBe(false);
  expect(publicAddress('198.18.0.1')).toBe(false);
});
it('checks redirect destinations before fetching and bounds downloaded HTML', async () => {
  const fetcher = vi.fn(async (url: string) =>
    url.includes('dns-query')
      ? Response.json({ Answer: [{ type: 1, data: '1.1.1.1' }] })
      : new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/admin' } }),
  );
  vi.stubGlobal('fetch', fetcher);
  await expect(fetchReferenceHtml('https://example.com')).rejects.toMatchObject({
    code: 'reference_private_address',
  });
  expect(fetcher.mock.calls.some(([url]) => url.includes('127.0.0.1'))).toBe(false);
  vi.stubGlobal('fetch', async (url: string) =>
    url.includes('dns-query')
      ? Response.json({ Answer: [{ type: 1, data: '1.1.1.1' }] })
      : new Response('x'.repeat(1024 * 1024 + 1), { headers: { 'content-type': 'text/html' } }),
  );
  await expect(fetchReferenceHtml('https://example.com')).rejects.toMatchObject({
    code: 'reference_large',
  });
});

import { backupManifest } from '../src/worker/backup-manifest';
import type { Project, Release } from '../src/shared/model';
it('includes active and historical generated artifacts in the backup manifest', () => {
  const artifact = {
    key: 'projects/p/sites/clone-hash.json',
    sha256: 'hash',
    bytes: 100,
    pageCount: 1,
  };
  const draft = { ...defaultDraft(), cloneConfig: { artifact } };
  const manifest = backupManifest(
    [{ id: 'p', draft } as Project],
    [],
    [],
    [
      {
        projectId: 'p',
        draft: {
          ...draft,
          siteDesign: {
            revision: 0,
            pages: {},
            build: { artifactKey: 'projects/p/sites/old-build.json' },
          },
        },
      } as Release,
    ],
  );
  expect(manifest).toEqual([
    { key: artifact.key, required: true, sha256: 'hash' },
    { key: 'projects/p/sites/old-build.json', required: true },
  ]);
});

import { withPublicationMetadata } from '../src/worker/site-metadata';
it('generates canonical, alternate languages and a sitemap containing only real public pages', () => {
  const html =
    '<html><head><title>Toys &amp; Gifts</title><link rel="canonical" href="https://wrong.example"><meta property="og:url" content="https://wrong.example"></head><body><main><h1>Our toys</h1><p>Browse the supplied collection.</p></main></body></html>';
  const files = withPublicationMetadata(
    { 'en/index.html': html, 'de/index.html': html, 'en/contact/index.html': html },
    'https://site.pages.dev',
  );
  expect(files['en/index.html']).not.toContain('wrong.example');
  expect(files['en/index.html']).toContain('hreflang="de"');
  expect(files['en/contact/index.html']).not.toContain('hreflang="de"');
  expect(files['sitemap.xml']).toContain('https://site.pages.dev/en/contact/index.html');
  expect(files['sitemap.xml'].match(/<url>/g)).toHaveLength(3);
  expect(files['robots.txt']).toContain('Sitemap: https://site.pages.dev/sitemap.xml');
});

import { completeSparseHome } from '../src/worker/clone-completion';
it('completes sparse smart homepages once with supplied facts and respects custom or faithful instructions', () => {
  const draft = {
    ...defaultDraft(),
    cloneConfig: { enhancementMode: 'smart' as const },
    products: [
      {
        id: 'one',
        name: 'Supplied <toy>',
        description: 'Existing facts',
        material: '',
        dimensions: '',
      },
    ],
  };
  draft.company.email = 'buyer@example.com';
  const files = {
    'en/index.html':
      '<html><head></head><body><main><h1>Hello</h1></main><footer>Footer</footer></body></html>',
  };
  const next = completeSparseHome(draft, files, ['en/index.html']);
  expect(next['en/index.html']).toContain('Supplied &lt;toy&gt;');
  expect(next['en/index.html']).toContain('buyer@example.com');
  expect(next['en/index.html'].indexOf('wr-completion"')).toBeLessThan(
    next['en/index.html'].indexOf('<footer>'),
  );
  expect(completeSparseHome(draft, next, ['en/index.html'])).toBe(next);
  expect(
    completeSparseHome({ ...draft, cloneConfig: { enhancementMode: 'faithful' } }, files, [
      'en/index.html',
    ]),
  ).toBe(files);
  expect(
    completeSparseHome({ ...draft, cloneConfig: { instructions: 'Keep just the hero' } }, files, [
      'en/index.html',
    ]),
  ).toBe(files);
});
