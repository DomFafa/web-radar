import { afterEach, expect, it, vi } from 'vitest';
import { productGalleryRuntime } from '../src/shared/product-gallery-runtime';

afterEach(() => vi.unstubAllGlobals());

function galleryRuntimeFixture(reduced = false) {
  const node = () => {
    const attrs = new Map<string, string>();
    const events = new Map<string, (event?: any) => void>();
    return {
      attrs, events, alt: '', src: '', tabIndex: 0, textContent: '', isConnected: true,
      getAttribute: (name: string) => attrs.get(name) ?? null,
      setAttribute: (name: string, value: string) => attrs.set(name, value),
      removeAttribute: (name: string) => attrs.delete(name),
      addEventListener: (name: string, handler: (event?: any) => void) => events.set(name, handler),
      querySelector: (_selector: string): any => null,
      querySelectorAll: (_selector: string): any[] => [],
      closest: (_selector: string): any => null,
      focus: vi.fn(), scrollIntoView: vi.fn(), animate: vi.fn(() => ({ cancel: vi.fn() })),
    };
  };
  const main = node(), stage = node(), status = node(), group = node();
  main.src = '/main'; main.alt = 'Main';
  main.setAttribute('srcset', '/main-640 640w, /main-1280 1280w');
  main.setAttribute('sizes', '50vw');
  const buttons = [0, 1, 2].map(index => {
    const button = node(), image = node();
    image.src = index ? `/gallery-${index}` : '/main';
    image.alt = index ? `Detail ${index}` : 'Main';
    image.setAttribute('src', image.src);
    image.setAttribute('srcset', `${image.src}-640 640w, ${image.src}-1280 1280w`);
    image.setAttribute('style', 'object-fit:contain');
    button.setAttribute('data-src', image.src);
    button.setAttribute('aria-label', `Image ${index + 1} / 3: ${image.alt}`);
    button.setAttribute('aria-pressed', String(index === 0));
    button.querySelector = () => image;
    return { button, image };
  });
  const root = Object.assign(node(), { dataset: { wrGalleryLoading: 'Loading', wrGalleryFailed: 'Failed: retry' } });
  root.querySelector = selector => selector === '#wr-detail-main-img' ? main : selector === '[data-wr-gallery-stage]' ? stage : selector === '.wr-gallery-status' ? status : group;
  root.querySelectorAll = () => buttons.map(value => value.button);
  const pending: FakeImage[] = [];
  class FakeImage {
    complete = false; naturalWidth = 0; sizes = ''; srcset = ''; src = '';
    onload: () => void = () => {}; onerror: () => void = () => {};
    constructor() { pending.push(this); }
  }
  const preference = { matches: reduced, addEventListener: vi.fn() };
  const events = new Map<string, () => void>();
  vi.stubGlobal('document', { querySelectorAll: () => [root] });
  vi.stubGlobal('window', { addEventListener: (name: string, handler: () => void) => events.set(name, handler) });
  vi.stubGlobal('matchMedia', () => preference);
  vi.stubGlobal('getComputedStyle', () => ({ getPropertyValue: () => '' }));
  vi.stubGlobal('Image', FakeImage);
  productGalleryRuntime();
  return { main, stage, status, root, buttons, pending, preference, events };
}

it('waits for a real image load, then switches srcset, alt and selected state together', () => {
  const f = galleryRuntimeFixture();
  f.buttons[1].button.events.get('click')!();
  expect(f.main.src).toBe('/main');
  expect(f.buttons[0].button.getAttribute('aria-pressed')).toBe('true');
  expect(f.stage.getAttribute('aria-busy')).toBe('true');
  expect(f.pending[0].srcset).toContain('/gallery-1-1280 1280w');
  expect(f.pending[0].sizes).toBe('50vw');
  f.pending[0].onload();
  expect(f.main.src).toBe('/gallery-1');
  expect(f.main.alt).toBe('Detail 1');
  expect(f.main.getAttribute('srcset')).toContain('/gallery-1-1280 1280w');
  expect(f.main.getAttribute('sizes')).toBe('50vw');
  expect(f.buttons[1].button.getAttribute('aria-pressed')).toBe('true');
  expect(f.buttons[0].button.getAttribute('aria-pressed')).toBe('false');
  expect(f.stage.getAttribute('aria-busy')).toBeNull();
  expect(f.main.animate).toHaveBeenCalledOnce();
});

it('keeps the visible image on failure and allows an explicit retry', () => {
  const f = galleryRuntimeFixture();
  f.buttons[1].button.events.get('click')!(); f.pending[0].onerror();
  expect(f.main.src).toBe('/main');
  expect(f.status.textContent).toBe('Failed: retry');
  expect(f.buttons[0].button.getAttribute('aria-pressed')).toBe('true');
  f.buttons[1].button.events.get('click')!(); f.pending[1].onload();
  expect(f.main.src).toBe('/gallery-1');
  expect(f.status.textContent).toContain('Detail 1');
});

it('ignores an older load after a newer selection and after returning to the main image', () => {
  const f = galleryRuntimeFixture();
  f.buttons[1].button.events.get('click')!();
  f.buttons[2].button.events.get('click')!();
  f.pending[0].onload();
  expect(f.main.src).toBe('/main');
  f.pending[1].onload();
  expect(f.main.src).toBe('/gallery-2');
  f.buttons[1].button.events.get('click')!();
  f.buttons[2].button.events.get('click')!(); // Cancels the request for image 1.
  f.pending[2].onload();
  expect(f.main.src).toBe('/gallery-2');
});

it('uses the current authorized blob and removes stale picture and responsive URLs', () => {
  const f = galleryRuntimeFixture();
  const removed = vi.fn();
  f.main.closest = () => ({ querySelectorAll: () => [{ remove: removed }] });
  f.buttons[1].image.src = 'blob:authorized-detail';
  f.buttons[1].image.setAttribute('src', 'blob:authorized-detail');
  f.buttons[1].button.events.get('click')!();
  expect(f.pending[0].src).toBe('blob:authorized-detail');
  expect(f.pending[0].srcset).toBe('');
  f.pending[0].onload();
  expect(f.main.src).toBe('blob:authorized-detail');
  expect(f.main.getAttribute('srcset')).toBeNull();
  expect(f.main.getAttribute('sizes')).toBeNull();
  expect(removed).toHaveBeenCalledOnce();
});

it('supports arrow and end navigation without motion when the visitor requests reduced motion', () => {
  const f = galleryRuntimeFixture(true);
  const event = { key: 'End', preventDefault: vi.fn() };
  f.buttons[0].button.events.get('keydown')!(event);
  expect(event.preventDefault).toHaveBeenCalledOnce();
  expect(f.buttons[2].button.focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(f.buttons[2].button.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  f.pending[0].onload();
  expect(f.main.src).toBe('/gallery-2');
  expect(f.main.animate).not.toHaveBeenCalled();
  f.buttons[2].button.events.get('keydown')!({ key: 'ArrowRight', preventDefault: vi.fn() });
  f.pending[1].onload();
  expect(f.main.src).toBe('/main');
});

it('does not request protected media before the preview has supplied its image source', () => {
  const f = galleryRuntimeFixture();
  f.buttons[1].image.removeAttribute('src');
  f.buttons[1].button.events.get('click')!();
  expect(f.pending).toHaveLength(0);
  expect(f.main.src).toBe('/main');
  expect(f.status.textContent).toBe('Loading');
  f.buttons[1].image.setAttribute('src', '/gallery-1');
  f.events.get('wr:materials-media-ready')!();
  f.buttons[1].button.events.get('click')!();
  expect(f.pending).toHaveLength(1);
});
