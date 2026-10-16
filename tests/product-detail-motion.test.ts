import { Script } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';
import type { Draft } from '../src/shared/model';
import type { RenderOptions } from '../src/templates/themes/types';
import { productNativeTemplateIds } from '../src/shared/product-native-materials';
import { staticProductDetailRuntime, withStaticProductDetail } from '../src/templates/product-detail-motion';
import { projectPreviewPrepareForDraft, projectPreviewRuntimeForDraft } from '../src/worker/project-preview';
import { referenceTemplatePreviewPrepare, referenceTemplatePreviewRuntime } from '../src/client/reference-template-preview';

const templates = ['pawfect-groom', ...productNativeTemplateIds];
const html = '<!doctype html><html><head><script>globalThis.headMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;</script></head><body><main><img></main><script>globalThis.bodyMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;</script><script type="application/ld+json">{"name":"Product"}</script></body></html>';
const draft = (template: string, version: number) => ({ template, materials: { contractRevision: `2026-10-03.${template}-materials.${version}` } }) as Draft;
const options = (page: string) => ({ page }) as RenderOptions;

describe.each(templates)('%s static current product details', template => {
  it('marks only the .5 detail and wraps its trusted inline runtime before paint', () => {
    const current = withStaticProductDetail(html, draft(template, 5), options('detail'));
    expect(current).toContain('<html data-wr-static-detail>');
    expect(current).toContain('<body data-wr-static-detail>');
    expect(current.indexOf('id="wr-product-detail-static"')).toBeLessThan(current.indexOf('<script>'));
    expect(current).toContain('animation:none!important');
    expect(current).toContain('transition:none!important');
    expect(current).toContain('transform:none!important');
    expect(current).toContain('<script type="application/ld+json">{"name":"Product"}</script>');
    expect(withStaticProductDetail(html, draft(template, 4), options('detail'))).toBe(html);
    for (const page of ['home', 'catalog', 'about', 'contact']) expect(withStaticProductDetail(html, draft(template, 5), options(page))).toBe(html);
  });
  it('includes the same local motion policy in both trusted preview entry points', async () => {
    for (const source of [projectPreviewPrepareForDraft(draft(template, 5)), projectPreviewRuntimeForDraft(draft(template, 5)), referenceTemplatePreviewPrepare(draft(template, 5)), await referenceTemplatePreviewRuntime(draft(template, 5))]) {
      expect(source).toContain("document.documentElement.hasAttribute('data-wr-static-detail')");
    }
    for (const source of [projectPreviewPrepareForDraft(draft(template, 4)), projectPreviewRuntimeForDraft(draft(template, 4)), referenceTemplatePreviewPrepare(draft(template, 4)), await referenceTemplatePreviewRuntime(draft(template, 4))]) {
      expect(source).not.toContain('wr-product-detail-static');
    }
  });
});

it.each([false, true])('uses instant interactions only when the rendered detail marker exists: %s', marker => {
  const browserQuery = vi.fn((query: string) => ({ matches: query === '(max-width:600px)', addEventListener: vi.fn() }));
  // PR inserts its trusted prepare script before the stylesheet: only the opening html marker exists then.
  const context = { window: { matchMedia: browserQuery }, document: { documentElement: { hasAttribute: (name: string) => marker && name === 'data-wr-static-detail' }, getElementById: () => null }, matchMedia: browserQuery };
  new Script(staticProductDetailRuntime('globalThis.reduced=matchMedia("(prefers-reduced-motion: reduce)");globalThis.mobile=matchMedia("(max-width:600px)").matches;')).runInNewContext(context);
  expect((context as any).reduced.matches).toBe(marker);
  expect((context as any).mobile).toBe(true);
  expect(context.window.matchMedia).toBe(browserQuery);
  expect(() => (context as any).reduced.addEventListener('change', () => {})).not.toThrow();
});
