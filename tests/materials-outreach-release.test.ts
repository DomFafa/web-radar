import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, it, vi } from 'vitest';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { getMaterialsTemplate } from '../src/templates/materials';
import { getMaterialsTemplate as deployedContract, renderSite as deployedRender } from '../src/templates/releases/outreach-20260923.mjs';
import { renderSite } from '../src/templates';
import { draftFromMaterials } from '../src/worker/materials-service';
import { projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
import { frozenIndustryPreviewRuntime } from '../src/templates/releases/industry-preview-20260922';
import type { Asset } from '../src/shared/model';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import manifest from '../src/templates/releases/outreach-20260923.json';
import assets from '../src/templates/releases/outreach-assets-20260923.json';
import demoManifest from '../src/templates/releases/outreach-demo-20260923.json';

vi.mock('../src/templates/themes/petSupplies', () => ({ renderPetSuppliesPage: () => '<main>Future standalone pet layout</main>' }));
const digest = (value: Buffer | string) => createHash('sha256').update(value).digest('hex');
const images = (html: string) => {
  const values: string[] = [];
  const walk = (node: DefaultTreeAdapterMap['node']) => {
    if ('tagName' in node && node.tagName === 'img') values.push(node.attrs.find(attr => attr.name === 'src')?.value ?? '');
    if ('childNodes' in node) node.childNodes.forEach(walk);
  };
  walk(parse(html)); return values;
};

it.each(manifest.templates)('renders %s brand text without a false image URL and uses a real logo only when supplied', template => {
  const draft = materialsDemoDraft(getMaterialsTemplate(template)!, 'en');
  const options = { projectId: 'outreach-logo', lang: 'en' as const, page: 'home', assetUrl: (id: string) => id.startsWith('/') ? id : `/media/${id}`, inquiryUrl: '/inquiry', preview: true };
  const without = renderSite(draft, options);
  expect(images(without)).not.toContain('Example Brand');
  expect(without).toContain('Example Brand');
  draft.company.logoAssetId = 'brand-logo';
  const withLogo = images(renderSite(draft, options));
  expect(withLogo).toContain('/media/brand-logo');
  expect(withLogo.some(src => src.includes('<img'))).toBe(false);
  expect(withLogo.filter(src => src !== '/media/brand-logo')).toEqual(images(without));
});

it.each(manifest.templates)('preserves deployed contracts and rendering for %s independently of later standalone edits', async template => {
  for (const revision of [`2026-09-19.${template}-materials.1`, `2026-09-20.${template}-materials.2`, `2026-09-22.${template}-materials.4`, `2026-09-22.${template}-materials.5`]) {
    expect(deployedContract(template, revision), revision).toBeDefined();
    expect(getMaterialsTemplate(template, revision)).toEqual(deployedContract(template, revision));
    const input = await typedMaterialsFixture(template, 1, revision);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(media => [media.id, { id: media.id } as Asset])));
    const options = { projectId: 'outreach', lang: 'en' as const, page: 'home', assetUrl: (id: string) => `/media/${id}`, inquiryUrl: '/inquiry', preview: true };
    for (const page of ['home', 'catalog', 'detail', 'about', 'contact']) {
      const html = renderSite(draft, { ...options, page });
      expect(html).toBe(deployedRender(draft, { ...options, page }));
      expect(html).not.toContain('Future standalone pet layout');
    }
    expect(projectPreviewRuntimeForDraft(draft)).toBe(frozenIndustryPreviewRuntime);
    if (template.startsWith('pet-')) expect(renderSite({ ...draft, materials: undefined }, options)).toContain('Future standalone pet layout');
  }
  expect(getMaterialsTemplate(template, 'unpublished')).toBeUndefined();
  const current = getMaterialsTemplate(template)!;
  expect(current.contractRevision).toBe(`2026-09-23.${template}-materials.6`);
  expect(current.rendererRevision).toBe('2026-09-23.outreach-demo-repair.1');
  expect(current.productApplicability?.preferredFamilies).toEqual(template.startsWith('poster-') ? ['flat', 'home'] : [template.split('-')[0]]);
});

it('freezes only the eight PR #8 identities and retains exact renderer dependencies and static bytes', () => {
  const root = new URL('../src/templates/releases/', import.meta.url);
  expect(manifest.templates).toHaveLength(8);
  expect(manifest.sourceCommit).toBe('ac2c8d3a581f3b934840ba0dbc5aaaf8ad10d9b1');
  expect(deployedContract('senseng-clean')).toBeUndefined();
  expect(manifest.inputs.every(path => !/^src\/(worker|client)\//.test(path))).toBe(true);
  expect(digest(readFileSync(new URL('outreach-20260923.mjs', root)))).toBe(manifest.sha256);
  for (const [path, hash] of Object.entries(manifest.dependencies)) expect(digest(readFileSync(new URL(path, root)))).toBe(hash);
  expect(assets.rendererSha256).toBe(manifest.sha256);
  for (const [path, hash] of Object.entries(assets.assets)) expect(digest(readFileSync(new URL(`../public${path}`, import.meta.url)))).toBe(hash);
  expect(digest(readFileSync(new URL('outreach-demo-20260923.mjs', root)))).toBe(demoManifest.snapshotSha256);
  for (const [path, hash] of Object.entries(demoManifest.dependencies)) expect(digest(readFileSync(new URL(path, root)))).toBe(hash);
  for (const [id, contract] of Object.entries(demoManifest.contracts)) expect(digest(JSON.stringify(getMaterialsTemplate(id, contract.contractRevision)))).toBe(contract.sha256);
});
