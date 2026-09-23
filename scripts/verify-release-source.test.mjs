import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyReleaseSource } from './verify-release-source.mjs';

const roots = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'radar-release-guard-'));
  roots.push(root);
  const cwd = join(root, 'source');
  const remote = join(root, 'upstream.git');
  mkdirSync(cwd);
  const git = (...args) => execFileSync('git', ['-c', 'user.name=Release Guard Test', '-c', 'user.email=test@example.invalid', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-b', 'main');
  git('init', '--bare', remote);
  git('remote', 'add', 'origin', remote);
  writeFileSync(join(cwd, 'app.txt'), 'integration baseline\n');
  git('add', '.');
  git('commit', '-m', 'baseline');
  const baseline = git('rev-parse', 'HEAD');
  mkdirSync(join(cwd, '.github'));
  const policy = { repository: remote, releaseBranch: 'main', requiredAncestors: [baseline] };
  const savePolicy = () => writeFileSync(join(cwd, '.github/release-source.json'), JSON.stringify(policy));
  savePolicy();
  git('add', '.');
  git('commit', '-m', 'release policy');
  git('push', 'origin', 'main');
  return { cwd, git, policy, savePolicy, baseline };
}

test('a clean approved remote tip passes; candidate mode permits in-progress edits', () => {
  const f = fixture();
  assert.equal(verifyReleaseSource({ cwd: f.cwd }).mode, 'release');
  writeFileSync(join(f.cwd, 'app.txt'), 'candidate work\n');
  assert.equal(verifyReleaseSource({ cwd: f.cwd, candidate: true }).mode, 'candidate');
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd }), /clean working tree/);
});

test('untracked source cannot silently enter a release archive', () => {
  const f = fixture();
  writeFileSync(join(f.cwd, 'uncommitted.ts'), 'export const enabled = true;\n');
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd }), /clean working tree/);
});

test('a locally complete candidate must be merged into the approved remote branch', () => {
  const f = fixture();
  f.git('commit', '--allow-empty', '-m', 'candidate only');
  assert.equal(verifyReleaseSource({ cwd: f.cwd, candidate: true }).mode, 'candidate');
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd }), /approved remote branch tip/);
});

test('a stale local tracking ref cannot authorize a release after upstream advances', () => {
  const f = fixture();
  const oldHead = f.git('rev-parse', 'HEAD');
  f.git('commit', '--allow-empty', '-m', 'other release');
  f.git('push', 'origin', 'main');
  f.git('checkout', '--detach', oldHead);
  f.git('update-ref', 'refs/remotes/origin/main', oldHead);
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd }), /approved remote branch tip/);
});

test('a candidate lacking the integration baseline fails before release', () => {
  const f = fixture();
  f.git('checkout', '--orphan', 'stale');
  f.git('commit', '-m', 'unrelated history');
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd, candidate: true }), /required integration baseline/);
});

test('a fork cannot pass as the approved upstream repository', () => {
  const f = fixture();
  f.git('remote', 'set-url', 'origin', join(f.cwd, 'other.git'));
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd, candidate: true }), /approved upstream repository/);
});

test('a requested release SHA must be complete and equal the checkout HEAD', () => {
  const f = fixture();
  const head = f.git('rev-parse', 'HEAD');
  assert.equal(verifyReleaseSource({ cwd: f.cwd, expectedCommit: head }).sourceCommit, head);
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd, expectedCommit: head.slice(0, 7) }), /requested full release SHA/);
  assert.throws(() => verifyReleaseSource({ cwd: f.cwd, expectedCommit: f.baseline }), /requested full release SHA/);
});
