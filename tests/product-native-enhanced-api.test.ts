import { createHash } from 'node:crypto';
import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MaterialsTemplateContract } from '../src/shared/materials';
import { productNativeTemplateIds } from '../src/shared/product-native-materials';
import type { AppEnv, HonoEnv } from '../src/worker/env';
import { createTemplateGuidesApp } from '../src/worker/template-guides/api';
import { materialsFixture } from './fixtures/materials';
import { testDb } from './helpers/db';

describe('explicit enhanced product-template guide API', () => {
  let env: AppEnv;
  let principal: Awaited<ReturnType<typeof materialsFixture>>['principal'];
  const app = new Hono<HonoEnv>().route('/api/internal/template-guides', createTemplateGuidesApp());
  beforeEach(async () => {
    principal = { ...(await materialsFixture()).principal, email: 'member@example.com', workspaceRole: 'member' };
    env = { DB: testDb(), PRODUCT_RADAR_BASE_URL: 'https://product.example.com', PRODUCT_RADAR_INTEGRATION_SECRET: 's'.repeat(40), APP_ORIGIN: 'https://web-radar.net' } as AppEnv;
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ protocolVersion: 1, principal })));
  });
  afterEach(() => vi.unstubAllGlobals());
  const get = (path: string, headers: Record<string, string> = {}) => app.request(`https://web-radar.net/api/internal/template-guides/${path}`, { headers: {
    'X-Web-Radar-Secret': 's'.repeat(40), 'X-Product-Radar-User-Id': principal.userId, 'X-Product-Radar-Workspace-Id': principal.workspaceId, ...headers,
  } }, env);

  it.each(productNativeTemplateIds)('%s keeps default/v2/v3 revisions and response validators distinct', async id => {
    const hashes = new Set<string>();
    let currentEtag = '';
    for (const version of [1, 2, 3]) {
      const revision = `${version === 3 ? '2026-10-03' : '2026-10-02'}.${id}-materials.${version}`;
      const suffix = version === 1 ? '' : `?contractRevision=${revision}`;
      const response = await get(`materials/${id}${suffix}`);
      expect(response.status).toBe(200);
      const contract = await response.json() as MaterialsTemplateContract;
      const hash = createHash('sha256').update(JSON.stringify(contract)).digest('hex');
      expect(contract.contractRevision).toBe(revision);
      expect(contract.guideRevision).toBe(version === 3 ? '2026-10-03.1' : `2026-10-02.${version}`);
      expect(response.headers.get('X-Template-Materials-Revision')).toBe(revision);
      expect(response.headers.get('X-Template-Materials-SHA256')).toBe(hash);
      expect(response.headers.get('ETag')).toBe(`"${hash}"`);
      hashes.add(hash);
      if (version === 3) currentEtag = `"${hash}"`;
      const hero = contract.imageSlots.find(slot => slot.id === (['auravell', 'careflow-healthcare'].includes(id) ? 'home-hero' : 'hero-scene'));
      if (version >= 2) expect(hero).toMatchObject(id === 'toorun-early-learning'
        ? { role: 'scene', productScope: 'single-product', repeat: 'per-selection' }
        : version === 3 ? { role: 'collection', productScope: 'all-products', repeat: 'once', min: 1, max: 1, sourcePolicy: 'product-reference', reusePolicy: 'generate-new' }
          : { role: 'scene', productScope: 'single-product', repeat: 'once' });
      if (version === 3 && id !== 'toorun-early-learning') expect(contract.requiredCapabilities).toContain('image.collection.v1');
    }
    expect(hashes.size).toBe(3);
    expect((await get(`materials/${id}?contractRevision=2026-10-03.${id}-materials.3`, { 'If-None-Match': currentEtag })).status).toBe(304);
    expect((await get(`materials/${id}`, { 'If-None-Match': currentEtag })).status).toBe(200);
    expect((await get(`materials/${id}?contractRevision=2026-10-02.${id}-materials.2`, { 'If-None-Match': currentEtag })).status).toBe(200);
  });

  it.each(productNativeTemplateIds)('%s serves its explicit enhanced home demo with motion and native navigation', async id => {
    const revision = `2026-10-03.${id}-materials.3`;
    const response = await get(`materials/${id}/preview?contractRevision=${revision}&page=home`);
    expect(response.status).toBe(200);
    const preview = await response.json() as { templateId: string; contractRevision: string; page: string; html: string; demo: boolean; assetBaseUrl: string };
    expect(preview).toMatchObject({ templateId: id, contractRevision: revision, page: 'home', demo: true, assetBaseUrl: 'https://web-radar.net' });
    expect(preview.html).toContain(`data-wr-materials-revision="${revision}"`);
    expect(preview.html).toContain('data-wr-nav-layout=');
    expect(preview.html).toContain('product-scroll-enter');
    expect(preview.html.split('</head>')[0]).toContain('product-motion-prepaint');
  });
});
