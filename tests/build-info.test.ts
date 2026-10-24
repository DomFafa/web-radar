import { afterEach, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }));
afterEach(() => vi.clearAllMocks());

it.each([
  ['DomFafa', 'Dom'], ['domfafa', 'Dom'],
  ['Larrybin', 'Bing'], ['larrybin', 'Bing'],
  ['wuyueerhao', 'Dai'], ['WUYUEERHAO', 'Dai'],
  ['Dom', 'Dom'], ['Other author', 'Other author'],
  ['constructor', 'constructor'], ['__proto__', '__proto__'],
])('records source author %s as %s in the actual build metadata', async (author, expected) => {
  vi.resetModules();
  vi.mocked(execFileSync).mockReturnValueOnce(author + '\n');
  const { default: config } = await import('../vite.config');
  expect(JSON.parse(config.define!.__BUILD_UPDATED_BY__)).toBe(expected);
});
