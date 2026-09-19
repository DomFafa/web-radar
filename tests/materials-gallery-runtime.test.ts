import { afterEach, expect, it, vi } from 'vitest';
import { materialsRuntime } from '../src/shared/materials-runtime';
afterEach(() => vi.unstubAllGlobals());
it('selects the full original gallery image and clears stale picture/srcset candidates', () => {
  const attributes = new Map([
    ['srcset', '/main?width=1280 1280w'],
    ['sizes', '50vw'],
  ]);
  const source = { remove: vi.fn() };
  const main = {
    src: '/main',
    alt: 'Main',
    style: { cssText: '' },
    closest: () => ({ querySelectorAll: () => [source] }),
    removeAttribute: (name: string) => attributes.delete(name),
  };
  let clicked: () => void = () => {};
  const image = {
    src: '/original-detail',
    currentSrc: '/detail?width=320',
    alt: 'Side view',
    style: { cssText: 'object-fit:contain' },
  };
  const button = {
    classList: { contains: () => false, toggle: vi.fn() },
    querySelector: () => image,
    getAttribute: () => null,
    setAttribute: vi.fn(),
    addEventListener: (name: string, handler: () => void) => {
      if (name === 'click') clicked = handler;
    },
  };
  const group = {
    querySelectorAll: (selector: string) => (selector === '.senseng-thumb-arrow' ? [] : [button]),
  };
  vi.stubGlobal('document', {
    querySelector: (selector: string) => (selector === '.wr-materials-site' ? null : main),
    querySelectorAll: () => [group],
  });
  materialsRuntime();
  clicked();
  expect(main.src).toBe('/original-detail');
  expect(main.alt).toBe('Side view');
  expect(attributes.size).toBe(0);
  expect(source.remove).toHaveBeenCalledOnce();
});
