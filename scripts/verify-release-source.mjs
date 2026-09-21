#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

function repositoryIdentity(value) {
  return value.trim().replace(/^git@github\.com:/, 'https://github.com/').replace(/\.git\/?$/, '').replace(/\/$/, '');
}

// Candidate checks are offline. A release additionally checks the live upstream
// tip, so a stale remote-tracking ref cannot authorize overwriting newer work.
export function verifyReleaseSource({ cwd = process.cwd(), candidate = false } = {}) {
  const git = (args, allowFailure = false) => {
    const result = spawnSync('git', args, { cwd, encoding: 'utf8', timeout: 30_000 });
    if (result.status !== 0 && !allowFailure) throw new Error(`Git ${args[0]} failed; verify repository access and fetch its complete history.`);
    return result;
  };
  const readGit = args => git(args).stdout.trim();
  const policy = JSON.parse(readFileSync(resolve(cwd, '.github/release-source.json'), 'utf8'));
  if (typeof policy.repository !== 'string' || !policy.repository ||
      typeof policy.releaseBranch !== 'string' || !policy.releaseBranch ||
      !Array.isArray(policy.requiredAncestors) || !policy.requiredAncestors.length ||
      policy.requiredAncestors.some(sha => typeof sha !== 'string' || !/^[a-f0-9]{40}$/.test(sha))) {
    throw new Error('Release policy requires an upstream repository, release branch, and full baseline commit SHAs.');
  }
  const releaseRef = `refs/heads/${policy.releaseBranch}`;
  git(['check-ref-format', releaseRef]);
  if (repositoryIdentity(readGit(['remote', 'get-url', 'origin'])) !== repositoryIdentity(policy.repository)) {
    throw new Error('origin does not identify the approved upstream repository.');
  }
  const sourceCommit = readGit(['rev-parse', 'HEAD']);
  for (const baseline of policy.requiredAncestors) {
    if (git(['merge-base', '--is-ancestor', baseline, sourceCommit], true).status !== 0) {
      throw new Error(`Source does not contain required integration baseline ${baseline}; integrate the released fixes before continuing.`);
    }
  }
  if (!candidate) {
    if (readGit(['status', '--porcelain=v1', '--untracked-files=normal'])) {
      throw new Error('Release requires a clean working tree, including untracked source files. Commit the candidate and build from an isolated checkout.');
    }
    const refs = readGit(['ls-remote', '--exit-code', '--heads', 'origin', releaseRef]).split('\n').map(line => line.split(/\s+/));
    if (refs.length !== 1 || refs[0][0] !== sourceCommit || refs[0][1] !== releaseRef) {
      throw new Error('HEAD must equal the approved remote branch tip. Have the repository owner merge the reviewed PR, then fetch and build that commit.');
    }
  }
  return { mode: candidate ? 'candidate' : 'release', repository: policy.repository, releaseBranch: policy.releaseBranch, sourceCommit, requiredAncestors: policy.requiredAncestors };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv.slice(2).some(arg => arg !== '--candidate')) throw new Error('Usage: node scripts/verify-release-source.mjs [--candidate]');
    console.log(JSON.stringify(verifyReleaseSource({ candidate: process.argv.includes('--candidate') }), null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Release source verification failed.');
    process.exitCode = 1;
  }
}
