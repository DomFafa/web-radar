import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { getMaterialsTemplate } from '../src/templates/materials';
import { getMaterialsTemplate as deployedContract, renderSite as deployedRender } from '../src/templates/releases/industry-20260922.mjs';
import { renderSite } from '../src/templates';
import { draftFromMaterials } from '../src/worker/materials-service';
import type { Asset } from '../src/shared/model';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import manifest from '../src/templates/releases/industry-20260922.json';
import assets from '../src/templates/releases/industry-assets-20260922.json';

// A future standalone edit must not alter a pinned industry's contract or HTML.
vi.mock('../src/templates/themes/drinkwareCeramic', () => ({ renderDrinkwarePage: () => '<main>Future standalone drinkware layout</main>' }));
const templates = ['drinkware-ceramic-banner', 'drinkware-thermal-video', 'beauty-skincare-banner', 'beauty-glow-video', 'electronics-gadget-banner', 'electronics-smart-video', 'tools-precision-banner', 'tools-workshop-video', 'sports-trail-banner', 'sports-kinetic-video'];
const digest = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');

it.each(templates)('retains deployed revisions and gives %s a frozen identity release', async template => {
  const current = getMaterialsTemplate(template)!;
  expect(current.contractRevision).toBe(`2026-09-22.${template}-materials.5`);
  expect(current.rendererRevision).toBe('2026-09-22.industry-bafe6c1');
  expect(current.productApplicability?.preferredFamilies).toEqual([template.startsWith('sports-') ? 'outdoor' : template.split('-')[0]]);
  for (const revision of [`2026-09-19.${template}-materials.1`, `2026-09-20.${template}-materials.2`, `2026-09-22.${template}-materials.4`]) {
    expect(getMaterialsTemplate(template, revision)).toEqual(deployedContract(template, revision));
  }
  const input = await typedMaterialsFixture(template, 1);
  const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
  for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
    const options = { projectId: 'industry', lang: 'en' as const, page, assetUrl: (id: string) => `/media/${id}`, inquiryUrl: '/inquiry', preview: true };
    const legacy = { ...draft, materials: { ...draft.materials!, contractRevision: `2026-09-22.${template}-materials.4` } };
    expect(renderSite(draft, options)).toBe(deployedRender(legacy, options));
    expect(renderSite(draft, options)).not.toContain('Future standalone drinkware layout');
    expect(renderSite(legacy, options)).toBe(deployedRender(legacy, options));
    if (template.startsWith('drinkware-')) expect(renderSite({ ...draft, materials: undefined }, options)).toContain('Future standalone drinkware layout');
  }
});

it('locks the new renderer, its immutable baseline dependency and static assets', () => {
  const root = new URL('../src/templates/releases/', import.meta.url);
  expect(digest(readFileSync(new URL('industry-20260922.mjs', root)))).toBe(manifest.sha256);
  expect(manifest.sourceCommit).toBe('bafe6c189044667a5f996c9a542481ec61b34103');
  expect(manifest.inputs.every(path => !/^src\/(worker|client)\//.test(path))).toBe(true);
  for (const [path, hash] of Object.entries(manifest.dependencies)) expect(digest(readFileSync(new URL(path, root)))).toBe(hash);
  expect(assets.rendererSha256).toBe(manifest.sha256);
  for (const [path, hash] of Object.entries(assets.assets)) expect(digest(readFileSync(new URL(`../public${path}`, import.meta.url)))).toBe(hash);
});
