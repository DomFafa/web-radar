import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  assertWorkflowRun, assertDispatch, createManifest, verifyArtifact,
  deploymentArguments, verifyRequiredChecks, artifactConfig,
} from './release-production.mjs';
import * as release from './release-production.mjs';

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

test('the checked-in production configuration can be sealed by the release packager', () => {
  const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  const artifact = artifactConfig(config);
  assert.equal(artifact.name, 'web-radar');
  assert.equal(artifact.vars.APP_ORIGIN, 'https://web-radar.net');
  assert.equal(artifact.browser.binding, 'BROWSER');
  assert.deepEqual(artifact.queues, config.queues);
});

test('release preflight refuses to remove existing non-secret production bindings', () => {
  const settings = { bindings: [
    { name: 'DB', type: 'd1' }, { name: 'MEDIA', type: 'r2_bucket' },
    { name: 'COORDINATOR', type: 'durable_object_namespace' },
    { name: 'EDM_EMAIL_QUEUE', type: 'queue' }, { name: 'BROWSER', type: 'browser' },
    { name: 'ASSETS', type: 'assets' }, { name: 'API_KEY', type: 'secret_text' },
    { name: 'ENVIRONMENT', type: 'plain_text' },
  ] };
  const config = { d1_databases: [{ binding: 'DB' }], r2_buckets: [{ binding: 'MEDIA' }],
    durable_objects: { bindings: [{ name: 'COORDINATOR' }] },
    queues: { producers: [{ binding: 'EDM_EMAIL_QUEUE' }] }, browser: { binding: 'BROWSER' } };
  assert.equal(typeof release.assertProductionBindingsPreserved, 'function');
  assert.doesNotThrow(() => release.assertProductionBindingsPreserved(settings, config));
  assert.throws(() => release.assertProductionBindingsPreserved(settings, { ...config, queues: undefined }), /EDM_EMAIL_QUEUE/);
  assert.throws(() => release.assertProductionBindingsPreserved(settings, { ...config, browser: undefined }), /BROWSER/);
});

test('failed Wrangler diagnostics expose numeric API codes without raw logs or credentials', () => {
  assert.equal(typeof release.releaseCommandFailure, 'function');
  const message = release.releaseCommandFailure('Node/Wrangler', 'Authorization: Bearer private-token\n [ERROR] API denied [code: 10000]\naccount secret-value [code: 10000]');
  assert.match(message, /10000/);
  assert.doesNotMatch(message, /private-token|secret-value|Authorization/);
  assert.match(release.releaseCommandFailure('Node/Wrangler', 'private-token'), /no automatic deployment retry/);
});

const observedAt = '2026-09-28T10:00:00.000Z';
const observedTime = Date.parse(observedAt);
const pairedPolicy = { repository: 'git@github.com:DomFafa/product-radar.git', releaseBranch: 'main', requiredWorkflows: [{file:'radar-integration.yml',jobs:['product-radar-integration']}] };
function localChecksFixture() {
  const directory=mkdtempSync(join(tmpdir(),'wr-local-checks-')); roots.push(directory);
  const wrRoot=join(directory,'web-radar'),prRoot=join(directory,'product-radar');
  mkdirSync(wrRoot);mkdirSync(prRoot);
  const targets=[{root:wrRoot,policy:{...policy,requiredWorkflows:[required]},sourceCommit:sha},{root:prRoot,policy:pairedPolicy,sourceCommit:other}];
  const receipt={format:'radar-local-checks-v1',observedAt,repositories:targets.map((target,index)=>({
    repository:target.policy.repository.replace('git@github.com:','').replace('.git',''),branch:target.policy.releaseBranch,sha:target.sourceCommit,
    workflows:target.policy.requiredWorkflows.map((workflow,workflowIndex)=>({file:workflow.file,runId:index+100,attempt:1,event:'push',status:'completed',conclusion:'success',
      jobs:workflow.jobs.map((name,jobIndex)=>({id:1000+index*100+workflowIndex*10+jobIndex,name,headSHA:target.sourceCommit,status:'completed',conclusion:'success'}))})),
  }))};
  const file=join(directory,'checks.json');
  const save=()=>writeFileSync(file,JSON.stringify(receipt));save();
  return {directory,wrRoot,prRoot,targets,receipt,file,save};
}

test('local release is explicit, cannot run in Actions and still requires owner enablement',()=>{
  const env={RELEASE_EXECUTION:'local',RELEASE_CHECKS_FILE:'/outside/checks.json',PRODUCTION_RELEASE_ENABLED:'true'};
  assert.doesNotThrow(()=>assertDispatch(env,policy,sha));
  for(const change of [{RELEASE_EXECUTION:undefined},{RELEASE_EXECUTION:'unexpected'},{RELEASE_CHECKS_FILE:undefined},{RELEASE_CHECKS_FILE:'checks.json'},{PRODUCTION_RELEASE_ENABLED:undefined},{GITHUB_ACTIONS:'true'}])
    assert.throws(()=>assertDispatch({...env,...change},policy,sha));
  assert.throws(()=>assertDispatch(env,policy,sha.slice(0,7)));
});

test('local receipt verifies both exact source pairs and is reread on every validation',()=>{
  const f=localChecksFixture();
  assert.equal(typeof release.readLocalChecks,'function');
  const result=release.readLocalChecks(f.file,f.targets,observedTime);
  assert.equal(result.observedAt,observedAt);
  assert.equal(result.checks[0][0].sourceCommit,sha);
  assert.equal(result.checks[1][0].sourceCommit,other);
  assert.match(result.digest,/^[a-f0-9]{64}$/);
  f.receipt.repositories[0].workflows[0].jobs[0].conclusion='failure';f.save();
  assert.throws(()=>release.readLocalChecks(f.file,f.targets,observedTime),/job|successful/);
});

test('local receipt refuses expired, future, malformed or ambiguous observations',()=>{
  const mutations=[
    r=>{r.format='other';},r=>{r.extra=true;},r=>{r.observedAt='not-a-date';},r=>{r.observedAt='2026-09-28';},
    r=>{r.observedAt=new Date(observedTime+1).toISOString();},r=>{r.observedAt=new Date(observedTime-30*60*1000-1).toISOString();},
    r=>{r.repositories.push(structuredClone(r.repositories[0]));},r=>{r.repositories[1].repository=r.repositories[0].repository;},
    r=>{r.repositories.pop();},r=>{r.repositories[0].branch='feature';},r=>{r.repositories[0].sha=other;},
    r=>{r.repositories[0].workflows.push(structuredClone(r.repositories[0].workflows[0]));},
    r=>{r.repositories[0].workflows[0].jobs.push(structuredClone(r.repositories[0].workflows[0].jobs[0]));},
    r=>{r.repositories[0].workflows[0].jobs[1].id=r.repositories[0].workflows[0].jobs[0].id;},
    r=>{r.repositories[0].workflows[0].jobs[1].name=r.repositories[0].workflows[0].jobs[0].name;},
    r=>{r.repositories[0].workflows[0].jobs[0].headSHA=other;},
    r=>{r.repositories[0].workflows[0].runId=0;},r=>{r.repositories[0].workflows[0].attempt=1.5;},
    r=>{r.repositories[0].workflows[0].event='pull_request';},r=>{r.repositories[0].workflows[0].status='in_progress';},
    r=>{r.repositories[0].workflows[0].conclusion='failure';},r=>{r.repositories[0].workflows[0].jobs[0].conclusion='skipped';},
    r=>{r.repositories[0].workflows[0].jobs[0].status='queued';},r=>{r.repositories[0].workflows[0].jobs.shift();},
    r=>{r.repositories[0].workflows[0].file='other.yml';},r=>{r.repositories[0].workflows[0].jobs[0].unknown=true;},
  ];
  for(const mutate of mutations){const f=localChecksFixture();mutate(f.receipt);f.save();assert.throws(()=>release.readLocalChecks(f.file,f.targets,observedTime));}
  const boundary=localChecksFixture();boundary.receipt.observedAt=new Date(observedTime-30*60*1000).toISOString();boundary.save();
  assert.doesNotThrow(()=>release.readLocalChecks(boundary.file,boundary.targets,observedTime));
});

test('local receipt must be an absolute file outside both source trees, including symlink targets',()=>{
  const f=localChecksFixture();
  assert.throws(()=>release.readLocalChecks('checks.json',f.targets,observedTime),/absolute/);
  for(const root of [f.wrRoot,f.prRoot]){
    const inside=join(root,'checks.json');writeFileSync(inside,JSON.stringify(f.receipt));
    assert.throws(()=>release.readLocalChecks(inside,f.targets,observedTime),/outside/);
    const link=join(f.directory,root===f.wrRoot?'wr-link.json':'pr-link.json');symlinkSync(inside,link);
    assert.throws(()=>release.readLocalChecks(link,f.targets,observedTime),/outside/);
  }
});

test('local receipt cannot omit a required workflow or reuse a job from another repository',()=>{
  const f=localChecksFixture();
  f.targets[0].policy.requiredWorkflows.push({file:'radar-integration.yml',jobs:['web-radar-integration']});
  assert.throws(()=>release.readLocalChecks(f.file,f.targets,observedTime),/Missing required workflow/);
  f.targets[0].policy.requiredWorkflows.pop();
  f.receipt.repositories[1].workflows[0].jobs[0].id=f.receipt.repositories[0].workflows[0].jobs[0].id;f.save();
  assert.throws(()=>release.readLocalChecks(f.file,f.targets,observedTime),/Duplicate.*job/);
});

test('artifact records the executing controller independently of application SHAs and rejects another controller',()=>{
  const root=fixture();
  const controllerDigest=createHash('sha256').update(readFileSync(new URL('./release-production.mjs',import.meta.url))).digest('hex');
  const {manifest,digest}=createManifest(root,{sourceCommit:sha,productRadarCommit:other,controllerSHA256:'0'.repeat(64)});
  assert.equal(manifest.controllerSHA256,controllerDigest);
  assert.equal(verifyArtifact(root,digest,sha,other).controllerSHA256,controllerDigest);
  manifest.controllerSHA256='0'.repeat(64);
  writeFileSync(join(root,'manifest.json'),JSON.stringify(manifest));
  const alteredDigest=createHash('sha256').update(readFileSync(join(root,'manifest.json'))).digest('hex');
  assert.throws(()=>verifyArtifact(root,alteredDigest,sha,other),/different release controller/);
});
