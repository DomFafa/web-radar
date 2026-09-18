import { afterEach, describe, expect, it, vi } from 'vitest';
import { snapshotSchema, prService, prImage } from '../src/worker/product-radar';
import {
  assetReferences,
  defaultDraft,
  publicAssetReferences,
  validateDraft,
} from '../src/worker/domain';
import type { AppEnv } from '../src/worker/env';
import type { Principal } from '../src/shared/model';
const principal: Principal = {
  userId: 'owner',
  authSubject: 'owner',
  email: 'owner@example.test',
  displayName: 'Owner',
  systemRole: 'user',
  workspaceId: 'work',
  workspaceRole: 'member',
  workspaceName: 'Workspace',
};
const copy = {
  name: 'Uploaded bottle',
  tagline: 'Take it along',
  description: 'Compact bottle',
  sellingPoints: ['Carry loop', 'Rounded shape', 'Reusable'],
  applications: ['Travel'],
};
const snapshot = {
  source: 'product-radar',
  id: 'saved-set',
  sourceProjectId: null,
  workflow: 'upload',
  version: 'a'.repeat(64),
  name: copy.name,
  description: copy.description,
  material: '',
  dimensions: '',
  seriesName: '',
  designDirection: '',
  conditions: {},
  image: { sourceProductId: 'saved-set', contentType: null },
  factsOrigin: 'product-set',
  websiteCopy: copy,
  images: [
    { id: 'original', kind: 'original', caption: 'Original', contentType: null },
    { id: 'detail', kind: 'detail', caption: 'Detail', contentType: null },
  ],
};
const env = {
  PRODUCT_RADAR_BASE_URL: 'https://pr.example.test',
  PRODUCT_RADAR_INTEGRATION_SECRET: 'test-integration-secret-at-least-32-characters',
} as AppEnv;
afterEach(() => vi.unstubAllGlobals());
describe('saved product set import contract', () => {
  it('preserves upload source, fixed website copy and every selected image', () => {
    expect(snapshotSchema.parse(snapshot)).toEqual(snapshot);
  });
  it('keeps legacy stored projects readable while refusing new concept imports', async () => {
    const legacy = {
      ...snapshot,
      sourceProjectId: 'source-project',
      workflow: 'create',
      factsOrigin: 'generated-concept',
      websiteCopy: undefined,
      images: undefined,
    };
    expect(snapshotSchema.safeParse(legacy).success).toBe(true);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ products: [legacy], total: 1 })),
    );
    await expect(
      prService(env, principal, 'products', { productIds: ['saved-set'] }),
    ).rejects.toMatchObject({ status: 502 });
  });
  it('sends image identity and version through authenticated server retrieval', async () => {
    const fetcher = vi.fn(
      async (_url: RequestInfo | URL, _init?: RequestInit) =>
        new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/png' } }),
    );
    vi.stubGlobal('fetch', fetcher);
    await prImage(env, principal, 'saved-set', snapshot.version, 'detail');
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toMatchObject({
      userId: 'owner',
      workspaceId: 'work',
      productId: 'saved-set',
      expectedVersion: snapshot.version,
      imageId: 'detail',
    });
  });
  it('retains gallery and website fields during draft validation and asset authorization', () => {
    const draft = defaultDraft();
    draft.products = [
      {
        id: 'local-product',
        name: copy.name,
        description: copy.description,
        material: '',
        dimensions: '',
        tagline: copy.tagline,
        sellingPoints: copy.sellingPoints,
        applications: copy.applications,
        imageAssetId: 'main',
        gallery: [
          { assetId: 'main', sourceImageId: 'original', kind: 'original', caption: 'Original' },
          { assetId: 'detail', sourceImageId: 'detail', kind: 'detail', caption: 'Detail' },
        ],
      },
    ];
    const saved = validateDraft(draft);
    expect(saved.products[0]).toEqual(draft.products[0]);
    expect(assetReferences(saved)).toContain('detail');
    expect(publicAssetReferences(saved)).toContain('detail');
  });
});
