import { expect, it } from 'vitest';
import { defaultDraft, editDraft, assetReferences, publicAssetReferences } from '../src/worker/domain';
import { withFavicon } from '../src/shared/favicon';
import { renderSiteFiles } from '../src/templates';
import { renderCloneFiles } from '../src/worker/clone-service';
import { materializeSiteFiles, siteFilePath } from '../src/worker/static-site';

const options = { projectId: 'project', assetUrl: (id: string) => `https://app.example/public/assets/${id}`, inquiryUrl: 'https://app.example/inquiries', publicBaseUrl: 'https://site.example' };
it('uses the selected tab icon on every template and generated page, including the root redirect', () => {
  const draft = defaultDraft();
  draft.company.faviconAssetId = 'tab-icon';
  for (const template of ['senseng-clean', 'senseng-video', 'natural'] as const) {
    draft.template = template;
    for (const html of Object.values(renderSiteFiles(draft, options))) expect(html).toContain('<link rel="icon" href="https://app.example/public/assets/tab-icon">');
  }
  const files = Object.fromEntries(['home', 'catalog', 'about', 'contact'].map(page => [siteFilePath('en', page), '<html><head><link rel="shortcut icon" href="old.ico"></head><body>Generated page</body></html>']));
  for (const html of Object.values(materializeSiteFiles(files, draft, options))) {
    expect(html).toContain('/assets/tab-icon');
    expect(html).not.toContain('old.ico');
  }
  draft.buildBranch = 'clone';
  draft.cloneConfig = { generatedHtml: files['en/index.html'] };
  for (const html of Object.values(renderCloneFiles(draft, options))) expect(html).toContain('/assets/tab-icon');
});
it('preserves saved page designs when a favicon is added or removed and authorizes its public media', () => {
  const draft = defaultDraft();
  draft.siteDesign = { revision: 2, pages: { home: { imageAssetId: 'design' } }, build: { jobId: 'build', artifactKey: 'artifact' } };
  const next = editDraft(draft, { ...draft, company: { ...draft.company, faviconAssetId: 'tab-icon' } });
  expect(next.siteDesign).toEqual(draft.siteDesign);
  expect(assetReferences(next)).toContain('tab-icon');
  expect(publicAssetReferences(next)).toContain('tab-icon');
  const removed = editDraft(next, { ...next, company: { ...next.company, faviconAssetId: undefined } });
  expect(removed.siteDesign).toEqual(draft.siteDesign);
  expect(publicAssetReferences(removed)).not.toContain('tab-icon');
});
it('overrides only icon links and escapes URLs for private preview', () => {
  const draft = defaultDraft();
  const html = '<html><head><link rel="stylesheet" href="style.css"><link href="old.ico" rel=icon></head><body></body></html>';
  expect(withFavicon(html, draft, options.assetUrl)).toBe(html);
  draft.company.faviconAssetId = 'icon';
  const result = withFavicon(html, draft, () => '/api/assets/icon?a=1&b="2"');
  expect(result).toContain('href="/api/assets/icon?a=1&amp;b=&quot;2&quot;"');
  expect(result).toContain('rel="stylesheet"');
  expect(result).not.toContain('old.ico');
});
