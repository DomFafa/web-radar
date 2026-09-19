import { afterEach, expect, it, vi } from 'vitest';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import type { Asset } from '../src/shared/model';
import { templateMediaRequirements } from '../src/shared/template-media';
import { renderSite } from '../src/templates';
import { draftFromMaterials } from '../src/worker/materials-service';
import { typedMaterialsFixture } from './fixtures/materials-typed';
import { productImageViewerRuntime } from '../src/shared/product-image-viewer';

afterEach(() => vi.unstubAllGlobals());

it('opens the currently selected original, supports keyboard, and restores focus and scrolling on close', () => {
  const node = () => {
    const attrs = new Map<string, string>();
    const events = new Map<string, (event?: any) => void>();
    return {
      attrs, events, src: '', alt: '', id: '', open: false, children: [] as any[],
      style: { overflow: '' }, focus: vi.fn(),
      setAttribute: (key: string, value: string) => attrs.set(key, value),
      getAttribute: (key: string) => attrs.get(key),
      removeAttribute: (key: string) => attrs.delete(key),
      addEventListener: (key: string, handler: (event?: any) => void) => events.set(key, handler),
      appendChild(child: any) { this.children.push(child); },
      showModal() { this.open = true; },
      close() { this.open = false; events.get('close')?.(); },
    };
  };
  const main = node(), body = node();
  const created: ReturnType<typeof node>[] = [];
  body.style.overflow = 'auto';
  vi.stubGlobal('document', {
    querySelectorAll: () => [main],
    getElementById: (id: string) => created.find(n => n.id === id),
    documentElement: { lang: 'en' }, head: node(), body,
    createElement: () => { const n = node(); created.push(n); return n; },
  });
  productImageViewerRuntime();
  const dialog = body.children[0], [close, image] = dialog.children;
  main.events.get('click')!();
  expect(dialog.open).toBe(false); // Preview assets have not arrived yet.
  main.src = 'blob:authorized-side-view';
  main.alt = 'Selected side view';
  main.setAttribute('src', main.src);
  Object.assign(main, { currentSrc: '/small-thumbnail.webp' });
  main.events.get('click')!();
  expect(dialog.open).toBe(true);
  expect(image.src).toBe('blob:authorized-side-view');
  expect(image.alt).toBe('Selected side view');
  expect(body.style.overflow).toBe('hidden');
  expect(close.focus).toHaveBeenCalledOnce();
  dialog.events.get('click')({ target: image });
  expect(dialog.open).toBe(true);
  dialog.events.get('click')({ target: dialog });
  expect(dialog.open).toBe(false);
  expect(body.style.overflow).toBe('auto');
  expect(main.focus).toHaveBeenCalledWith({ preventScroll: true });
  main.src = '/original-front.png';
  for (const key of ['Enter', ' ']) {
    const event = { key, preventDefault: vi.fn() };
    main.events.get('keydown')!(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(dialog.open).toBe(true);
    expect(image.src).toBe('/original-front.png');
    close.events.get('click')();
    expect(dialog.open).toBe(false);
  }
  productImageViewerRuntime();
  expect(body.children).toHaveLength(1);
});

type Node = DefaultTreeAdapterMap['node'];
function mainImages(node: Node): DefaultTreeAdapterMap['element'][] {
  const own = 'tagName' in node && node.tagName === 'img' && node.attrs.some(
    a => a.name === 'id' && ['detailMainImg', 'wr-detail-main-img'].includes(a.value),
  ) ? [node] : [];
  return [...own, ...('childNodes' in node ? node.childNodes.flatMap(mainImages) : [])];
}

it.each(Object.keys(templateMediaRequirements))('%s can enlarge the selected product in standalone and confirmed-materials details', async template => {
  for (const revision of [undefined, `2026-09-19.${template}-materials.1`]) {
    const input = await typedMaterialsFixture(template, 2, revision);
    const draft = draftFromMaterials(input, Object.fromEntries(input.materials.media.map(m => [m.id, { id: m.id } as Asset])));
    const options = { projectId: 'fixture', lang: 'en' as const, page: 'detail', productId: 'p1', assetUrl: (id: string) => `/images/${id}`, inquiryUrl: '/inquiry' };
    for (const materials of [draft.materials, undefined]) {
      const html = renderSite({ ...draft, materials }, options);
      const images = mainImages(parse(html));
      expect(images, `${template}:${revision || 'current'}:${Boolean(materials)} main`).toHaveLength(1);
      expect(images[0].attrs.find(a => a.name === 'src')?.value).toBe('/images/m1');
      expect(html.match(/<script id="wr-product-image-viewer-script">/g)).toHaveLength(1);
    }
    for (const page of ['home', 'catalog', 'about', 'contact']) {
      expect(renderSite(draft, { ...options, page })).not.toContain('id="wr-product-image-viewer-script"');
    }
    // A single original still needs an enlargement target, even without thumbnails.
    draft.products[1].gallery = [];
    draft.materials!.imageBindings = draft.materials!.imageBindings.filter(b => b.slotId !== 'product-gallery');
    expect(mainImages(parse(renderSite(draft, options)))).toHaveLength(1);
  }
});
