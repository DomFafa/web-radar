import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  assertWorkflowRun, assertDispatch, createManifest, verifyArtifact,
  deploymentArguments, verifyRequiredChecks, artifactConfig,
} from './release-production.mjs';

const sha = 'a'.repeat(40), other = 'b'.repeat(40);
const policy = { repository: 'git@github.com:DomFafa/web-radar.git', releaseBranch: 'codex/web-radar-v1' };
const required = { file: 'check.yml', jobs: ['local', 'browser', 'render-quality'] };
const run = () => ({ id: 12, head_sha: sha, head_branch: policy.releaseBranch, event: 'push',
  path: '.github/workflows/check.yml', status: 'completed', conclusion: 'success',
  head_repository: { full_name: 'DomFafa/web-radar' } });
const jobs = () => required.jobs.map(name => ({ name, head_sha: sha, status: 'completed', conclusion: 'success' }));

test('required jobs must succeed for the exact branch, workflow, repository and source SHA', () => {
  assert.doesNotThrow(() => assertWorkflowRun(run(), jobs(), required, policy, sha));
  for (const change of [{ head_sha: other }, { status: 'in_progress' }, { conclusion: 'failure' },
    { event: 'pull_request' }, { head_branch: 'feature' }, { path: '.github/workflows/other.yml' },
    { head_repository: { full_name: 'fork/web-radar' } }]) {
    assert.throws(() => assertWorkflowRun({ ...run(), ...change }, jobs(), required, policy, sha));
  }
  for (const conclusion of ['failure', 'skipped', 'neutral', null]) {
    const failed = jobs(); failed[1].conclusion = conclusion;
    assert.throws(() => assertWorkflowRun(run(), failed, required, policy, sha));
  }
  assert.throws(() => assertWorkflowRun(run(), jobs().slice(1), required, policy, sha));
  const stale = jobs(); stale[0].head_sha = other;
  assert.throws(() => assertWorkflowRun(run(), stale, required, policy, sha));
});

test('a new failed/pending run cannot fall back to an older green run', async () => {
  const request = async path => path.includes('/jobs') ? { jobs: jobs(), total_count: 3 } : {
    workflow_runs: [{ ...run(), id: 13, status: 'queued', conclusion: null }, run()], total_count: 2,
  };
  await assert.rejects(verifyRequiredChecks({ ...policy, requiredWorkflows: [required] }, sha, request));
});

test('deployment refuses local commands, feature dispatch, old workflow SHA and short SHAs', () => {
  const env = { GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'workflow_dispatch',
    GITHUB_REPOSITORY: 'DomFafa/web-radar', GITHUB_REF: `refs/heads/${policy.releaseBranch}`,
    GITHUB_SHA: sha, GITHUB_WORKFLOW_REF: `DomFafa/web-radar/.github/workflows/production-release.yml@refs/heads/${policy.releaseBranch}` };
  assert.doesNotThrow(() => assertDispatch(env, policy, sha));
  for (const change of [{ GITHUB_ACTIONS: '' }, { GITHUB_EVENT_NAME: 'push' }, { GITHUB_SHA: other },
    { GITHUB_REF: 'refs/heads/feature' }, { GITHUB_WORKFLOW_REF: 'other' }]) {
    assert.throws(() => assertDispatch({ ...env, ...change }, policy, sha));
  }
  assert.throws(() => assertDispatch(env, policy, sha.slice(0, 7)));
});

const roots = [];
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }); });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'wr-release-artifact-')); roots.push(root);
  mkdirSync(join(root, 'worker')); mkdirSync(join(root, 'assets'));
  writeFileSync(join(root, 'worker/index.js'), 'export default {fetch(){return new Response("ok")}}');
  writeFileSync(join(root, 'assets/index.html'), '<!doctype html>');
  writeFileSync(join(root, 'wrangler.json'), '{}');
  return root;
}

test('artifact verification binds every byte, added files and the source pair to the build digest', () => {
  const root = fixture();
  const { digest } = createManifest(root, { sourceCommit: sha, productRadarCommit: other });
  assert.equal(verifyArtifact(root, digest, sha, other).sourceCommit, sha);
  assert.throws(() => verifyArtifact(root, digest, other, sha), /source/);
  assert.throws(() => verifyArtifact(root, '0'.repeat(64), sha, other), /digest/);
  writeFileSync(join(root, 'worker/index.js'), 'tampered');
  assert.throws(() => verifyArtifact(root, digest, sha, other), /content/);
});

test('extra files, deleted files, and symlink payloads fail closed', () => {
  for (const mutate of [root => writeFileSync(join(root, 'assets/extra.js'), 'extra'),
    root => rmSync(join(root, 'worker/index.js')),
    root => symlinkSync(join(root, 'assets/index.html'), join(root, 'assets/link.html'))]) {
    const root = fixture(); const { digest } = createManifest(root, { sourceCommit: sha, productRadarCommit: other });
    mutate(root); assert.throws(() => verifyArtifact(root, digest, sha, other));
  }
});

test('deployment consumes the built worker without rebundling and retains variables', () => {
  const args = deploymentArguments('/artifact', sha, 'f'.repeat(64));
  assert.ok(args.includes('--no-bundle')); assert.ok(args.includes('--keep-vars')); assert.ok(args.includes('--strict'));
  assert.equal(args[args.indexOf('--config') + 1], '/artifact/wrangler.json');
  assert.ok(args[args.indexOf('--message') + 1].includes(sha));
  assert.equal(args.includes('--dry-run'), false);
});

test('artifact configuration retains production settings and refuses a second build hook', () => {
  const original = { name: 'web-radar', main: 'src/index.ts', compatibility_date: '2026-09-11',
    assets: { directory: './dist', binding: 'ASSETS', run_worker_first: true },
    vars: { ENVIRONMENT: 'production' }, d1_databases: [{ binding: 'DB', database_id: 'id' }],
    env: { test: { name: 'web-radar-test' } } };
  const artifact = artifactConfig(original);
  assert.deepEqual(artifact.d1_databases, original.d1_databases);
  assert.deepEqual(artifact.vars, original.vars);
  assert.equal(artifact.compatibility_date, original.compatibility_date);
  assert.equal(artifact.assets.run_worker_first, true);
  assert.equal(artifact.assets.directory, './assets');
  assert.equal(artifact.main, 'worker/index.js');
  assert.equal(artifact.env, undefined);
  assert.equal(artifact.no_bundle, true);
  assert.throws(() => artifactConfig({ ...original, build: { command: 'rebuild' } }), /Custom builds/);
});
