#!/usr/bin/env node
// The production workflow is the supported caller. Local development cannot
// turn a candidate check into authorization to deploy.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyReleaseSource } from './verify-release-source.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const readJson = file => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const fullSha = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const repositoryName = policy => policy.repository.replace(/^git@github\.com:/, '').replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
function requireValue(condition, message) { if (!condition) throw new Error(message); }

export function assertDispatch(env, policy, sourceCommit) {
  const repository = repositoryName(policy), ref = `refs/heads/${policy.releaseBranch}`;
  requireValue(fullSha(sourceCommit), 'Supply the full source SHA, not a branch or abbreviated SHA.');
  requireValue(env.GITHUB_ACTIONS === 'true' && env.GITHUB_EVENT_NAME === 'workflow_dispatch' &&
    env.GITHUB_REPOSITORY === repository && env.GITHUB_REF === ref && env.GITHUB_SHA === sourceCommit &&
    env.GITHUB_WORKFLOW_REF === `${repository}/.github/workflows/production-release.yml@${ref}`,
  'Production release requires a dispatch of the approved workflow at the exact release branch SHA.');
}

export function assertWorkflowRun(run, jobs, required, policy, sourceCommit) {
  requireValue(run && run.head_sha === sourceCommit && run.head_branch === policy.releaseBranch &&
    run.head_repository?.full_name === repositoryName(policy) && run.event === 'push' &&
    run.path === `.github/workflows/${required.file}` && run.status === 'completed' && run.conclusion === 'success',
  `Required workflow ${required.file} has no successful latest push run for this exact source SHA.`);
  for (const name of required.jobs) {
    const matching = jobs.filter(job => job.name === name);
    requireValue(matching.length === 1 && matching[0].head_sha === sourceCommit &&
      matching[0].status === 'completed' && matching[0].conclusion === 'success',
    `Required job ${name} is absent, stale, pending, skipped or unsuccessful.`);
  }
}

export async function verifyRequiredChecks(policy, sourceCommit, request) {
  requireValue(Array.isArray(policy.requiredWorkflows) && policy.requiredWorkflows.length > 0, 'Missing required workflow policy.');
  const evidence = [];
  for (const required of policy.requiredWorkflows) {
    requireValue(/^[a-z0-9-]+\.yml$/.test(required.file) && required.jobs?.length > 0, 'Invalid required workflow policy.');
    const query = new URLSearchParams({ head_sha: sourceCommit, branch: policy.releaseBranch, event: 'push', per_page: '100' });
    const data = await request(`/actions/workflows/${required.file}/runs?${query}`);
    requireValue(data.total_count <= 100, 'Too many workflow runs; refusing ambiguous check history.');
    // Never select an older green run when a newer run or rerun is pending/failed.
    const latest = data.workflow_runs?.toSorted((a, b) => b.id - a.id)[0];
    requireValue(latest, `Missing required workflow ${required.file} for source SHA.`);
    const result = await request(`/actions/runs/${latest.id}/jobs?filter=latest&per_page=100`);
    requireValue(result.total_count <= 100, 'Too many jobs; refusing an incomplete job list.');
    assertWorkflowRun(latest, result.jobs, required, policy, sourceCommit);
    evidence.push({ workflow: required.file, runId: latest.id, attempt: latest.run_attempt, sourceCommit, jobs: required.jobs });
  }
  return evidence;
}

function fileInventory(root, prefix = '') {
  const files = {};
  for (const entry of readdirSync(join(root, prefix), { withFileTypes: true }).toSorted((a, b) => a.name.localeCompare(b.name))) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    requireValue(!entry.isSymbolicLink(), `Artifact contains a symbolic link: ${name}`);
    if (entry.isDirectory()) Object.assign(files, fileInventory(root, name));
    else {
      requireValue(entry.isFile(), `Unsupported artifact entry: ${name}`);
      if (name !== 'manifest.json') files[name] = hash(readFileSync(join(root, name)));
    }
  }
  return files;
}

export function createManifest(root, metadata) {
  const manifest = { format: 'wr-production-artifact-v1', ...metadata, files: fileInventory(root) };
  writeJson(join(root, 'manifest.json'), manifest);
  return { manifest, digest: hash(readFileSync(join(root, 'manifest.json'))) };
}

export function verifyArtifact(root, expectedDigest, sourceCommit, productRadarCommit) {
  requireValue(/^[a-f0-9]{64}$/.test(expectedDigest ?? '') && hash(readFileSync(join(root, 'manifest.json'))) === expectedDigest,
    'Artifact manifest digest differs from the trusted build-job output.');
  const manifest = readJson(join(root, 'manifest.json'));
  requireValue(manifest.format === 'wr-production-artifact-v1' && manifest.sourceCommit === sourceCommit &&
    manifest.productRadarCommit === productRadarCommit, 'Artifact source pair does not match this release.');
  requireValue(JSON.stringify(fileInventory(root)) === JSON.stringify(manifest.files), 'Artifact content changed, disappeared or gained extra files.');
  requireValue(manifest.files['worker/index.js'] && manifest.files['assets/index.html'] && manifest.files['wrangler.json'], 'Incomplete production artifact.');
  return manifest;
}

export function deploymentArguments(artifact, sourceCommit, digest) {
  return ['deploy', '--config', join(artifact, 'wrangler.json'), '--env', '', '--no-bundle', '--keep-vars', '--strict',
    '--tag', `git-${sourceCommit.slice(0, 12)}`, '--message', `source ${sourceCommit}; artifact ${digest}`];
}

function run(command, args, cwd, { env = process.env, log } = {}) {
  const result = spawnSync(command, args, { cwd, env, stdio: log ? ['ignore', 'pipe', 'pipe'] : 'inherit', maxBuffer: 20 * 1024 * 1024 });
  if (log) writeFileSync(log, Buffer.concat([result.stdout ?? Buffer.alloc(0), result.stderr ?? Buffer.alloc(0)]), { mode: 0o600 });
  requireValue(result.status === 0, releaseCommandFailure(command === process.execPath ? 'Node/Wrangler' : command,
    log ? Buffer.concat([result.stdout ?? Buffer.alloc(0), result.stderr ?? Buffer.alloc(0)]).toString() : ''));
}

export function releaseCommandFailure(command, output) {
  // Numeric Cloudflare codes are safe to retain; raw Wrangler output may contain
  // configuration or credentials and stays in the runner's private log.
  const codes = [...new Set([...output.matchAll(/\[code:\s*(\d{3,6})\]/g)].map(match => match[1]))];
  return `${command} failed${codes.length ? ` (Cloudflare codes: ${codes.join(', ')})` : ''}; no automatic deployment retry or rollback.`;
}

function githubRequest(policy, token) {
  return async path => {
    const response = await fetch(`https://api.github.com/repos/${repositoryName(policy)}${path}`, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2026-03-10' },
      redirect: 'error', signal: AbortSignal.timeout(30_000),
    });
    requireValue(response.ok, `GitHub verification HTTP ${response.status}; release denied.`);
    return response.json();
  };
}

async function verifySources(root, pr, policy, sourceCommit, productRadarCommit) {
  requireValue(fullSha(productRadarCommit), 'Supply the full compatible Product Radar SHA.');
  const wrSource = verifyReleaseSource({ cwd: root, expectedCommit: sourceCommit });
  const prSource = verifyReleaseSource({ cwd: pr, expectedCommit: productRadarCommit });
  requireValue(repositoryName(prSource) === repositoryName(policy.productRadar) && prSource.releaseBranch === policy.productRadar.releaseBranch,
    'Product Radar source is not the approved repository/branch.');
  const wrChecks = await verifyRequiredChecks(policy, sourceCommit, githubRequest(policy, process.env.GITHUB_TOKEN));
  const prChecks = await verifyRequiredChecks(policy.productRadar, productRadarCommit,
    githubRequest(policy.productRadar, process.env.RADAR_READ_TOKEN || process.env.GITHUB_TOKEN));
  return { wrSource, prSource, wrChecks, prChecks };
}

export function artifactConfig(config) {
  // Retain every binding/setting, but select only production and the sealed files.
  const { $schema, env, ...production } = config;
  requireValue(!production.build && !production.rules && !production.find_additional_modules,
    'Custom builds/modules require a reviewed artifact packager before release.');
  return { ...production, main: 'worker/index.js', assets: { ...production.assets, directory: './assets' }, no_bundle: true };
}

async function build(root, pr, policy, artifact, sourceCommit, productRadarCommit) {
  requireValue(!existsSync(artifact), 'Use a fresh artifact directory; do not reuse a prior build.');
  const gates = await verifySources(root, pr, policy, sourceCommit, productRadarCommit);
  mkdirSync(artifact, { recursive: true });
  const evidence = join(artifact, 'evidence'); mkdirSync(evidence);
  run(process.execPath, ['tests/helpers/run-template-plugin-integration.mjs', '--product-radar-root', pr, '--web-radar-root', root], pr,
    { env: { ...process.env, MATERIALS_INTEGRATION_ARTIFACT_DIR: join(evidence, 'cross-repository') } });
  // A skip/empty green test run cannot manufacture acceptance.
  const cross = readJson(join(evidence, 'cross-repository/summary.json'));
  for (const assertion of ['real root Web Radar router', 'exact contract and renderer', 'real Product Radar quota charged once',
    'five-page private preview', 'foreign account denied', 'concurrent edit remains 409']) {
    requireValue(cross.assertions?.includes(assertion), `Cross-repository acceptance is incomplete: ${assertion}`);
  }
  run('npm', ['run', 'build'], root);
  const worker = join(artifact, 'worker');
  run(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--env', '', '--outdir', worker], root);
  requireValue(readdirSync(worker).every(name => ['index.js', 'index.js.map', 'README.md'].includes(name)),
    'Additional Worker modules require extending live module verification before release.');
  cpSync(join(root, 'dist'), join(artifact, 'assets'), { recursive: true });
  writeJson(join(artifact, 'wrangler.json'), artifactConfig(readJson(join(root, 'wrangler.jsonc'))));
  // Both clean upstream tips are checked again after build/gate execution.
  verifyReleaseSource({ cwd: root, expectedCommit: sourceCommit });
  verifyReleaseSource({ cwd: pr, expectedCommit: productRadarCommit });
  writeJson(join(evidence, 'checks.json'), gates);
  const result = createManifest(artifact, { sourceCommit, productRadarCommit });
  verifyArtifact(artifact, result.digest, sourceCommit, productRadarCommit);
  if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `manifest_digest=${result.digest}\n`, { flag: 'a' });
  console.log(JSON.stringify({ sourceCommit, productRadarCommit, manifestDigest: result.digest, files: Object.keys(result.manifest.files).length }));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
function settingsFingerprint(settings) {
  return hash(JSON.stringify(stable({
    bindings: settings.bindings.filter(binding => binding.type !== 'assets').toSorted((a, b) => a.name.localeCompare(b.name)),
    compatibility_date: settings.compatibility_date, compatibility_flags: settings.compatibility_flags,
    usage_model: settings.usage_model, limits: settings.limits, logpush: settings.logpush,
    observability: settings.observability, tail_consumers: settings.tail_consumers,
  })));
}

export function assertProductionBindingsPreserved(settings, config) {
  const names = new Set([
    ...(config.d1_databases || []).map(binding => binding.binding),
    ...(config.r2_buckets || []).map(binding => binding.binding),
    ...(config.durable_objects?.bindings || []).map(binding => binding.name),
    ...(config.queues?.producers || []).map(binding => binding.binding),
    config.browser?.binding,
  ].filter(Boolean));
  // Text variables are retained by --keep-vars and secrets by the Workers API;
  // assets are replaced by the sealed artifact. All other live bindings must
  // still be configured before any upload is attempted.
  const missing = settings.bindings.filter(binding =>
    !['plain_text', 'secret_text', 'assets'].includes(binding.type) && !names.has(binding.name));
  requireValue(!missing.length, `Release would remove production bindings: ${missing.map(binding => binding.name).join(', ')}.`);
}

async function deploy(root, pr, policy, artifact, sourceCommit, productRadarCommit, digest) {
  requireValue(process.env.PRODUCTION_RELEASE_ENABLED === 'true', 'Production environment is not enabled by the repository owner.');
  requireValue(process.env.CLOUDFLARE_API_TOKEN, 'Production environment Cloudflare credential is missing.');
  const manifest = verifyArtifact(artifact, digest, sourceCommit, productRadarCommit);
  const config = readJson(join(artifact, 'wrangler.json'));
  requireValue(JSON.stringify(config) === JSON.stringify(artifactConfig(readJson(join(root, 'wrangler.jsonc')))),
    'Artifact configuration does not match the verified source configuration.');
  requireValue(config.name === 'web-radar' && config.vars.APP_ORIGIN === 'https://web-radar.net', 'Unexpected production target.');
  const cf = async path => {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.account_id}/workers/scripts/${config.name}${path}`, {
      headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}` }, redirect: 'error', signal: AbortSignal.timeout(60_000),
    });
    requireValue(response.ok, `Cloudflare verification HTTP ${response.status}.`); return response;
  };
  const cfJson = async path => { const data = await (await cf(path)).json(); requireValue(data.success, 'Cloudflare verification rejected.'); return data.result; };
  const latest = async () => (await cfJson('/deployments')).deployments.toSorted((a, b) => b.created_on.localeCompare(a.created_on))[0];
  const before = await latest(), liveSettings = await cfJson('/settings');
  assertProductionBindingsPreserved(liveSettings, config);
  const beforeSettings = settingsFingerprint(liveSettings);
  const evidence = resolve(process.env.RELEASE_EVIDENCE_DIR || join(dirname(artifact), 'release-result'));
  requireValue(!existsSync(evidence), 'Use a fresh deployment evidence directory.'); mkdirSync(evidence, { recursive: true });
  const report = { sourceCommit, productRadarCommit, manifestDigest: digest, previousDeploymentId: before.id, verified: false };
  try {
    await verifySources(root, pr, policy, sourceCommit, productRadarCommit);
    requireValue((await latest()).id === before.id && settingsFingerprint(await cfJson('/settings')) === beforeSettings,
      'Production changed during preflight; re-evaluate before another release.');
    verifyArtifact(artifact, digest, sourceCommit, productRadarCommit);
    run(process.execPath, [join(root, 'node_modules/wrangler/bin/wrangler.js'), ...deploymentArguments(artifact, sourceCommit, digest)], artifact,
      { log: join(dirname(evidence), 'wrangler-production.private.log'), env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: config.account_id,
        WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: join(dirname(evidence), 'wrangler-debug.private.log') } });
    const deployed = await latest(); report.deploymentId = deployed.id; report.versions = deployed.versions;
    requireValue(deployed.id !== before.id && deployed.versions?.length === 1 && deployed.versions[0].percentage === 100 &&
      deployed.annotations?.['workers/message']?.includes(`source ${sourceCommit}; artifact ${digest}`),
    'Live deployment identity/traffic does not match the sealed artifact.');
    const form = await (await cf('')).formData(), part = form.get('index.js');
    requireValue(part, 'Live Worker module is missing.');
    const code = typeof part === 'string' ? Buffer.from(part) : Buffer.from(await part.arrayBuffer());
    report.workerExact = hash(code) === manifest.files['worker/index.js'];
    requireValue(report.workerExact, 'Live Worker bytes differ from the artifact.');
    report.settingsPreserved = settingsFingerprint(await cfJson('/settings')) === beforeSettings;
    requireValue(report.settingsPreserved, 'Production bindings/settings changed; inspect before another write.');
    const health = await fetch(`${config.vars.APP_ORIGIN}/api/health`, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
    const healthBody = await health.json();
    requireValue(health.ok && healthBody.ok && healthBody.testMode === false, 'Production health check failed.');
    const assetNames = Object.keys(manifest.files).filter(name => name.startsWith('assets/'));
    const results = [];
    // Bounded parallel reads of every uploaded static file, including images.
    for (let offset = 0; offset < assetNames.length; offset += 8) {
      const batch = await Promise.all(assetNames.slice(offset, offset + 8).map(async name => {
        const relative = name.slice('assets/'.length), path = relative === 'index.html' ? '/' : '/' + relative.split('/').map(encodeURIComponent).join('/');
        const response = await fetch(config.vars.APP_ORIGIN + path, { redirect: 'error', signal: AbortSignal.timeout(30_000), headers: { 'Cache-Control': 'no-cache' } });
        const exact = response.ok && hash(Buffer.from(await response.arrayBuffer())) === manifest.files[name];
        return { name, status: response.status, exact };
      }));
      results.push(...batch);
    }
    report.assets = results;
    requireValue(results.every(result => result.exact), 'Live static files differ from the artifact.');
    requireValue((await latest()).id === deployed.id, 'Production changed during live verification.');
    report.verified = true;
  } catch (error) {
    report.failure = error.message; throw error;
  } finally {
    report.checkedAt = new Date().toISOString(); writeJson(join(evidence, 'deployment.json'), report);
  }
  console.log(JSON.stringify({ sourceCommit, deploymentId: report.deploymentId, workerExact: report.workerExact,
    verifiedAssets: report.assets.length, settingsPreserved: report.settingsPreserved }));
}

async function main() {
  const [command, ...extra] = process.argv.slice(2), root = process.cwd();
  requireValue(['build', 'deploy', 'verify-artifact'].includes(command) && !extra.length,
    'Usage: release-production.mjs build|deploy|verify-artifact (use production-release.yml; no local deploy).');
  const { RELEASE_SOURCE_SHA: sourceCommit, PRODUCT_RADAR_SHA: productRadarCommit, RELEASE_MANIFEST_DIGEST: digest } = process.env;
  requireValue(process.env.RELEASE_ARTIFACT_DIR, 'RELEASE_ARTIFACT_DIR is required.');
  const artifact = resolve(process.env.RELEASE_ARTIFACT_DIR);
  if (command === 'verify-artifact') { verifyArtifact(artifact, digest, sourceCommit, productRadarCommit); return; }
  const policy = readJson(join(root, '.github/release-source.json'));
  assertDispatch(process.env, policy, sourceCommit);
  requireValue(process.env.PRODUCT_RADAR_ROOT, 'PRODUCT_RADAR_ROOT is required.');
  const pr = resolve(process.env.PRODUCT_RADAR_ROOT);
  if (command === 'build') await build(root, pr, policy, artifact, sourceCommit, productRadarCommit);
  else await deploy(root, pr, policy, artifact, sourceCommit, productRadarCommit, digest);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
