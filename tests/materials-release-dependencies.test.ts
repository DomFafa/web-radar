import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import type { Draft } from '../src/shared/model';
import * as preview from '../src/worker/project-preview';
import releaseHashes from './fixtures/materials-release-hashes.json';

vi.mock('../src/shared/materials-runtime', () => ({ materialsRuntime: function futureStandaloneRuntime() { return 'future-standalone-interaction'; } }));

const releaseDir = new URL('../src/templates/releases/', import.meta.url);
const digest = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

describe('immutable confirmed-materials runtime and static dependencies', () => {
  it('selects the frozen trusted interaction runtime for every published contract despite later standalone changes', () => {
    expect(preview.projectPreviewRuntime).toContain('future-standalone-interaction');
    const select = Reflect.get(preview, 'projectPreviewRuntimeForDraft');
    expect(select).toBeTypeOf('function');
    const manifest = JSON.parse(readFileSync(new URL('baseline-preview-20260922.json', releaseDir), 'utf8'));
    expect(digest(readFileSync(new URL('baseline-preview-20260922.ts', releaseDir)))).toBe(manifest.snapshotSha256);
    for (const identity of Object.keys(releaseHashes)) {
      const [template, contractRevision] = identity.split('@');
      const runtime = select({ template, materials: { contractRevision } } as Draft);
      expect(runtime).not.toContain('future-standalone-interaction');
      expect(digest(runtime)).toBe(manifest.runtimeSha256);
      expect(() => new Function(runtime)).not.toThrow();
    }
    expect(select({ template: 'senseng-clean' } as Draft)).toBe(preview.projectPreviewRuntime);
  });

  it('retains the exact static bytes used by the frozen renderer, including linked styles and their dependencies', () => {
    const manifest = JSON.parse(readFileSync(new URL('baseline-assets-20260922.json', releaseDir), 'utf8')) as { rendererSha256: string; assets: Record<string, string> };
    expect(digest(readFileSync(new URL('baseline-20260922.mjs', releaseDir)))).toBe(manifest.rendererSha256);
    expect(manifest.assets).toHaveProperty('/templates/references/corpox-ai-agency.inline.css');
    expect(Object.keys(manifest.assets).some(path => /\.(woff2?|ttf)$/.test(path))).toBe(true);
    const renderer = readFileSync(new URL('baseline-20260922.mjs', releaseDir), 'utf8');
    const publicDir = new URL('../public/', import.meta.url);
    for (const path of readdirSync(new URL('templates/', publicDir), { recursive: true }).map(String)) {
      const url = '/templates/' + path;
      if (renderer.includes(url) && /\.[a-z0-9]+$/i.test(path)) expect(manifest.assets, url).toHaveProperty(url);
    }
    for (const [path, sha256] of Object.entries(manifest.assets)) {
      const bytes = readFileSync(new URL('.' + path, publicDir));
      expect(digest(bytes), path).toBe(sha256);
      if (path.endsWith('.css')) for (const match of bytes.toString('utf8').matchAll(/(?:url\(\s*|@import\s+)["']?([^\s"')]+)["']?/g)) {
        if (/^(?:data:|#)/.test(match[1])) continue;
        const target = new URL(match[1], 'https://local.invalid' + path);
        if (target.origin === 'https://local.invalid' && target.pathname.startsWith('/templates/') && existsSync(new URL('.' + target.pathname, publicDir)))
          expect(manifest.assets, target.pathname).toHaveProperty(target.pathname);
      }
    }
  });
});
