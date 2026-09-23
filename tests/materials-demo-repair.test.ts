import { describe, expect, it, vi } from 'vitest';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { getMaterialsTemplate } from '../src/templates/materials';
import { renderSite, renderSiteFiles } from '../src/templates';
import { materialsDemoDraft } from '../src/worker/template-guides/materials-demo';
import { runInNewContext } from 'node:vm';
import { repairMaterialsDemo } from '../src/templates/releases/demo-20260923.mjs';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import manifest from '../src/templates/releases/demo-20260923.json';
import type { MaterialsTemplateRelease } from '../src/templates/materials-release-registry';
import { renderMaterialsTemplateRelease, validateMaterialsTemplateRelease } from '../src/templates/materials-releases';
import { createPagesGateway } from '../src/worker/providers/pages';

const options = { projectId: 'demo', lang: 'en' as const, page: 'home', assetUrl: (id: string) => id.startsWith('/') ? id : `/media/${id}`, inquiryUrl: '/inquiry', preview: true };
const images = (html: string) => {
  const values: string[] = [];
  const walk = (node: DefaultTreeAdapterMap['node']) => {
    if ('tagName' in node && node.tagName === 'img') values.push(node.attrs.find(a => a.name === 'src')?.value ?? '');
    if ('childNodes' in node) node.childNodes.forEach(walk);
  };
  walk(parse(html)); return values;
};

describe('a new self-contained demo renderer revision', () => {
  it.each(['senseng-clean', 'tools-workshop-video', 'tools-precision-banner'])('publishes the repair without changing %s identity contracts', template => {
    const latest = getMaterialsTemplate(template)!;
    expect(latest.contractRevision).toBe(`2026-09-23.${template}-materials.6`);
    const previous = getMaterialsTemplate(template, `2026-09-22.${template}-materials.5`)!;
    expect(latest.imageSlots).toEqual(previous.imageSlots);
    expect(latest.textSlots).toEqual(previous.textSlots);
    expect(latest.requiredCapabilities).toEqual(previous.requiredCapabilities);
    expect(latest.rendererRevision).not.toBe(previous.rendererRevision);
  });

  it.each(Object.keys(manifest.contracts).filter(id => /^(luggage|jewelry|homedecor|furniture|kitchen|drinkware|beauty|electronics|tools|sports)-/.test(id)))('uses a logo asset URL only when provided in %s', template => {
    const draft = materialsDemoDraft(getMaterialsTemplate(template)!, 'en');
    const withoutLogo = renderSite(draft, options);
    expect(images(withoutLogo)).not.toContain('Example Brand');
    expect(withoutLogo).toContain('Example Brand');
    draft.company.logoAssetId = 'brand-logo';
    const withLogo = images(renderSite(draft, options));
    expect(withLogo).toContain('/media/brand-logo');
    expect(withLogo.every(src => !src.includes('<img'))).toBe(true);
    expect(withLogo.filter(src => src !== '/media/brand-logo')).toEqual(images(withoutLogo));
  });

  it('restores actual rebundled helper names with esbuild name semantics, without guessing their suffixes', () => {
    const draft = materialsDemoDraft(getMaterialsTemplate('senseng-clean')!, 'en');
    const html = repairMaterialsDemo('<!doctype html><script>(()=>{const callback=__name27(()=>true,"retainedName");globalThis.result=__name105(()=>callback.name,"outer")();})();</script>', draft, options);
    const script = html.match(/<script>([\s\S]*?)<\/script>/)![1];
    const context = {} as { result?: string };
    runInNewContext(script, context);
    expect(context.result).toBe('retainedName');
    const json = '<script type="application/ld+json">{"name":"__name999(example)"}</script>';
    expect(repairMaterialsDemo(json, draft, options)).toContain(json);
  });

  it('freezes the repair bundle, prior renderers, trusted runtimes, assets and both contract revisions', () => {
    const root = new URL('../src/templates/releases/', import.meta.url);
    const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
    const snapshot = readFileSync(new URL('demo-20260923.mjs', root));
    expect(digest(snapshot)).toBe(manifest.snapshotSha256);
    expect(snapshot.toString()).not.toMatch(/^import\s/m);
    for (const [path, sha256] of Object.entries(manifest.dependencies)) expect(digest(readFileSync(new URL(path, root))), path).toBe(sha256);
    for (const [path, sha256] of Object.entries(manifest.assets)) expect(digest(readFileSync(new URL(`../public${path}`, import.meta.url))), path).toBe(sha256);
    for (const [id, locked] of Object.entries(manifest.contracts)) {
      expect(digest(JSON.stringify(getMaterialsTemplate(id, locked.contractRevision))), id).toBe(locked.sha256);
      expect(digest(JSON.stringify(getMaterialsTemplate(id, locked.previousContractRevision))), id).toBe(locked.previousSha256);
    }
  });

  it('lets a new plug-in explicitly bind the repaired renderer and rejects mixed renderer revisions', () => {
    const source = getMaterialsTemplate('tools-workshop-video')!;
    const draft = materialsDemoDraft(source, 'en');
    const release: MaterialsTemplateRelease = { name: 'Repaired integration example',
      contract: { ...source, templateId: 'integration-repaired-tools', contractRevision: '2026-09-23.integration-repaired-tools.1' },
      rendererTemplateId: source.templateId, rendererContractRevision: source.contractRevision,
      imageSlotMap: Object.fromEntries(source.imageSlots.map(slot => [slot.id, slot.id])),
      textSlotMap: Object.fromEntries(source.textSlots.map(slot => [slot.id, slot.id])) };
    expect(validateMaterialsTemplateRelease(release)).toEqual([]);
    expect(renderMaterialsTemplateRelease(release, draft, options)).toBe(renderSite(draft, options));
    expect(images(renderMaterialsTemplateRelease(release, draft, options))).not.toContain('Example Brand');
    release.rendererContractRevision = '2026-09-22.tools-workshop-video-materials.5';
    expect(validateMaterialsTemplateRelease(release)).toContain('renderer_release_unavailable');
    expect(() => renderMaterialsTemplateRelease(release, draft, options)).toThrow('Unknown materials renderer release');
  });

  it.each(['2026-09-19.tools-workshop-video-materials.1', '2026-09-20.tools-workshop-video-materials.2'])('rejects a repaired alias that shadows frozen industry revision %s', revision => {
    const source = getMaterialsTemplate('tools-workshop-video')!;
    const release: MaterialsTemplateRelease = { name: 'Unsafe historical override',
      contract: { ...source, contractRevision: revision }, rendererTemplateId: source.templateId, rendererContractRevision: source.contractRevision,
      imageSlotMap: Object.fromEntries(source.imageSlots.map(slot => [slot.id, slot.id])), textSlotMap: Object.fromEntries(source.textSlots.map(slot => [slot.id, slot.id])) };
    expect(validateMaterialsTemplateRelease(release)).toContain('published_template_revision_collision');
    expect(() => renderMaterialsTemplateRelease(release, materialsDemoDraft(source, 'en'), options)).toThrow('Unknown materials renderer release');
  });

  it('publishes the frozen Corpox texture from the canonical WR origin, outside the Pages file allowlist', async () => {
    const draft = materialsDemoDraft(getMaterialsTemplate('corpox-ai-agency')!, 'en');
    const texture = '/templates/releases/demo-20260923/corpox-noise.d1c5169bfca278bd.gif';
    const files = renderSiteFiles(draft, { ...options, preview: false, publicBaseUrl: 'https://wr.example/public/sites/demo', inquiryUrl: '/api/public/sites/demo/inquiries' });
    const worker = (await import(`data:text/javascript;base64,${Buffer.from(createPagesGateway('https://wr.example', 'demo', 'released', undefined, { current: Object.keys(files), previous: [] })).toString('base64')}`)).default;
    vi.stubGlobal('fetch', vi.fn(async url => { expect(String(url)).toBe('https://wr.example/public/sites/demo/gate/released'); return new Response(null, { status: 204 }); }));
    try {
      const env = { ASSETS: { fetch: async (request: Request) => new Response(files[new URL(request.url).pathname.slice(1)] || '', { status: files[new URL(request.url).pathname.slice(1)] ? 200 : 404 }) } };
      const response = await worker.fetch(new Request('https://customer.pages.dev/en/index.html'), env);
      expect(response.status).toBe(200);
      expect(await response.text()).toContain(`background-image:url("https://wr.example${texture}")`);
      expect((await worker.fetch(new Request(`https://customer.pages.dev${texture}`), env)).status).toBe(404);
    } finally { vi.unstubAllGlobals(); }
    expect(renderSite(draft, options)).toContain(`background-image:url("${texture}")`);
    expect(renderSite(draft, { ...options, publicBaseUrl: '/relative-preview/' })).toContain(`background-image:url("${texture}")`);
    const legacy = materialsDemoDraft(getMaterialsTemplate('corpox-ai-agency', '2026-09-22.corpox-ai-agency-materials.5')!, 'en');
    expect(renderSite(legacy, options)).not.toContain(texture);
  });
});
