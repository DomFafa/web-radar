import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

vi.mock('node:fs', () => ({ existsSync: vi.fn(), readFileSync: vi.fn() }));
vi.mock('node:child_process', () => ({ spawn: vi.fn() }));

const root = fileURLToPath(new URL('../', import.meta.url));
const launcher = '../scripts/start-site-builder.mjs';
const configKeys = ['SITE_BUILDER_KEY', 'OPENAI_API_KEY', 'OPENAI_BASE_URL', 'IMAGE_API_KEY', 'IMAGE_API_BASE_URL', 'IMAGE_MODEL', 'PROVIDER_MEDIA_ORIGINS'] as const;
const files = new Map<string, string>();
let signals: Map<string, () => void>;
let exit: (code: number | null) => void;
let kill: ReturnType<typeof vi.fn>;
let originalArgv: string[];
let originalExitCode: typeof process.exitCode;

beforeEach(() => {
  vi.resetModules();
  originalArgv = process.argv;
  originalExitCode = process.exitCode;
  process.argv = [process.execPath, `${root}scripts/start-site-builder.mjs`];
  for (const key of configKeys) vi.stubEnv(key, undefined);
  vi.stubEnv('SITE_BUILDER_DB', undefined);
  files.clear();
  files.set(`${root}.dev.vars`, `SITE_BUILDER_KEY=local-builder-key
TEXT_API_KEY=local-text-key
TEXT_API_BASE_URL=https://text.example/v1
IMAGE_API_KEY=local-image-key
IMAGE_API_BASE_URL=https://images.example/v1
IMAGE_MODEL=custom-image-model
PROVIDER_MEDIA_ORIGINS=https://media.example
`);
  vi.mocked(existsSync).mockReset().mockImplementation(path => String(path).endsWith('/.venv/bin/python') || files.has(String(path)));
  vi.mocked(readFileSync).mockReset().mockImplementation((path: any) => {
    const value = files.get(String(path));
    if (value === undefined) throw new Error('Unexpected config file');
    return value as any;
  });
  signals = new Map();
  vi.spyOn(process, 'on').mockImplementation(((signal: string, callback: () => void) => {
    signals.set(signal, callback);
    return process;
  }) as typeof process.on);
  kill = vi.fn();
  vi.mocked(spawn).mockReset().mockReturnValue({
    kill,
    on: (_event: string, callback: typeof exit) => { exit = callback; },
  } as any);
});

afterEach(() => {
  process.argv = originalArgv;
  process.exitCode = originalExitCode;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function childEnv() {
  const env = vi.mocked(spawn).mock.calls[0][2]!.env!;
  return Object.fromEntries(configKeys.map(key => [key, env[key]]));
}

test('default local startup forwards dedicated image config along with existing text mappings', async () => {
  await import(launcher);
  expect(vi.mocked(readFileSync).mock.calls.map(call => call[0])).toEqual([`${root}.dev.vars`]);
  expect(childEnv()).toEqual({
    SITE_BUILDER_KEY: 'local-builder-key', OPENAI_API_KEY: 'local-text-key', OPENAI_BASE_URL: 'https://text.example/v1',
    IMAGE_API_KEY: 'local-image-key', IMAGE_API_BASE_URL: 'https://images.example/v1',
    IMAGE_MODEL: 'custom-image-model', PROVIDER_MEDIA_ORIGINS: 'https://media.example',
  });
});

test('explicit process config wins over file config for all forwarded values', async () => {
  for (const key of configKeys) vi.stubEnv(key, `explicit-${key}`);
  await import(launcher);
  expect(childEnv()).toEqual(Object.fromEntries(configKeys.map(key => [key, `explicit-${key}`])));
});

test('explicitly empty image configuration does not refill a file credential or allowlist', async () => {
  for (const key of configKeys.slice(3)) vi.stubEnv(key, '');
  await import(launcher);
  for (const key of configKeys.slice(3)) expect(childEnv()[key]).toBe('');
  expect(childEnv().OPENAI_API_KEY).toBe('local-text-key');
});

test('missing image config never reuses the text key or endpoint', async () => {
  files.set(`${root}.dev.vars`, 'SITE_BUILDER_KEY=local-builder-key\nTEXT_API_KEY=local-text-key\nTEXT_API_BASE_URL=https://text.example/v1');
  await import(launcher);
  for (const key of configKeys.slice(3)) expect(childEnv()[key]).toBeUndefined();
  expect(childEnv().OPENAI_API_KEY).toBe('local-text-key');
});

test('test startup reads only its isolated vars file without borrowing missing default values', async () => {
  process.argv.push('--env', 'test');
  files.set(`${root}.dev.vars.test`, 'SITE_BUILDER_KEY=test-builder-key\nTEXT_API_KEY=test-text-key');
  await import(launcher);
  expect(vi.mocked(readFileSync).mock.calls.map(call => call[0])).toEqual([`${root}.dev.vars.test`]);
  expect(childEnv().SITE_BUILDER_KEY).toBe('test-builder-key');
  expect(childEnv().OPENAI_API_KEY).toBe('test-text-key');
  for (const key of configKeys.slice(3)) expect(childEnv()[key]).toBeUndefined();
});

test('missing test vars fails closed even when the default vars file is fully configured', async () => {
  process.argv.push('--env', 'test');
  await expect(import(launcher)).rejects.toThrow(/\.dev\.vars\.test/);
  expect(readFileSync).not.toHaveBeenCalled();
  expect(spawn).not.toHaveBeenCalled();
});

test('test mode defaults to a separate database and cache parent directory', async () => {
  process.argv.push('--env', 'test');
  files.set(`${root}.dev.vars.test`, 'SITE_BUILDER_KEY=test-builder-key\nTEXT_API_KEY=test-text-key');
  await import(launcher);
  expect(vi.mocked(spawn).mock.calls[0][2]?.env?.SITE_BUILDER_DB).toBe(`${root}services/site-builder/data/test/builds.sqlite3`);
});

test('explicit test database settings preserve process priority and intentionally empty values', async () => {
  process.argv.push('--env', 'test');
  for (const [processValue, fileValue, expected] of [
    ['/explicit/process.sqlite3', '/explicit/file.sqlite3', '/explicit/process.sqlite3'],
    ['', '/explicit/file.sqlite3', ''],
    [undefined, '/explicit/file.sqlite3', '/explicit/file.sqlite3'],
    [undefined, '', ''],
  ]) {
    vi.resetModules();
    vi.mocked(spawn).mockClear();
    vi.stubEnv('SITE_BUILDER_DB', processValue);
    files.set(`${root}.dev.vars.test`, `SITE_BUILDER_KEY=test-builder-key\nTEXT_API_KEY=test-text-key\nSITE_BUILDER_DB=${fileValue}`);
    await import(launcher);
    expect(vi.mocked(spawn).mock.calls[0][2]?.env?.SITE_BUILDER_DB).toBe(expected);
  }
});

test('default startup retains its existing database environment and ignores a file-only database setting', async () => {
  files.set(`${root}.dev.vars`, files.get(`${root}.dev.vars`)! + 'SITE_BUILDER_DB=/file/default.sqlite3\n');
  for (const value of [undefined, '/explicit/default.sqlite3', '']) {
    vi.resetModules();
    vi.mocked(spawn).mockClear();
    vi.stubEnv('SITE_BUILDER_DB', value);
    await import(launcher);
    expect(vi.mocked(spawn).mock.calls[0][2]?.env?.SITE_BUILDER_DB).toBe(value);
  }
});

test.each([['--env', 'production'], ['--env', 'staging'], ['--unknown'], ['test']])('unsupported launcher arguments are rejected: %s', async (...args) => {
  process.argv.push(...args);
  await expect(import(launcher)).rejects.toThrow();
  expect(readFileSync).not.toHaveBeenCalled();
  expect(spawn).not.toHaveBeenCalled();
});

test('the mock child retains loopback binding, one worker, signal forwarding and exit status', async () => {
  await import(launcher);
  const [command, args, options] = vi.mocked(spawn).mock.calls[0];
  expect(command).toBe(`${root}services/site-builder/.venv/bin/python`);
  expect(args).toEqual(['-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', '7002', '--workers', '1']);
  expect(options?.cwd).toBe(`${root}services/site-builder`);
  expect(options?.stdio).toBe('inherit');
  signals.get('SIGINT')!();
  signals.get('SIGTERM')!();
  expect(kill.mock.calls).toEqual([['SIGINT'], ['SIGTERM']]);
  exit(0);
  expect(process.exitCode).toBe(0);
  exit(7);
  expect(process.exitCode).toBe(7);
  exit(null);
  expect(process.exitCode).toBe(1);
});

test('missing text config rejects startup without exposing dedicated credentials', async () => {
  files.set(`${root}.dev.vars`, 'SITE_BUILDER_KEY=builder-secret-do-not-log\nIMAGE_API_KEY=image-secret-do-not-log');
  let error: unknown;
  try { await import(launcher); } catch (caught) { error = caught; }
  expect(error).toBeInstanceOf(Error);
  expect(String(error)).not.toMatch(/builder-secret-do-not-log|image-secret-do-not-log/);
  expect(spawn).not.toHaveBeenCalled();
});
