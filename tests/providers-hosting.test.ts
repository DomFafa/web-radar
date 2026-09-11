import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProviders } from '../src/worker/providers';
import type { Secrets } from '../src/worker/env';
import type { HostingTarget } from '../src/shared/model';

const accountA = { accountId: 'account-a', apiToken: 'test-token-a' };
const accountB = { accountId: 'account-b', apiToken: 'test-token-b' };
const envFor = (accounts: unknown): Secrets => ({
  APP_ORIGIN: 'https://wr.example',
  CLOUDFLARE_HOSTING_ACCOUNTS: JSON.stringify(accounts),
});
afterEach(() => vi.unstubAllGlobals());

describe('persisted Cloudflare hosting assignment', () => {
  it('allocates a deterministic initial account and Pages name without exposing tokens', async () => {
    const a = createProviders(envFor([accountA, accountB]));
    const b = createProviders(envFor([accountB, accountA]));
    const target = await a.resolveHostingTarget('project-one');
    expect(await a.resolveHostingTarget('project-one')).toEqual(target);
    expect(await b.resolveHostingTarget('project-one')).toEqual(target);
    expect(['account-a', 'account-b']).toContain(target.accountId);
    expect(target.pagesProjectName).toMatch(/^wr-[a-f0-9]{32}$/);
    expect(Object.keys(target).sort()).toEqual(['accountId', 'pagesProjectName']);
    expect(JSON.stringify(target)).not.toContain('token');
    expect(JSON.stringify(a.status())).not.toContain(accountA.apiToken);
  });

  it('keeps the stored account and URL while using its rotated token', async () => {
    const initial = createProviders(envFor([accountA, accountB]));
    const stored = await initial.resolveHostingTarget('project-one');
    const observed: { url: string; authorization: string | null }[] = [];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      observed.push({ url, authorization: new Headers(init.headers).get('authorization') });
      expect(url).toContain(
        `/accounts/${stored.accountId}/pages/projects/${stored.pagesProjectName}`,
      );
      const result = url.includes('/deployments?')
        ? [
            {
              id: 'deployed',
              deployment_trigger: { metadata: { commit_message: 'Web Radar release release-one' } },
              latest_stage: { name: 'deploy', status: 'success' },
              uses_functions: true,
            },
          ]
        : {
            name: stored.pagesProjectName,
            deployment_configs: Object.fromEntries(
              ['production', 'preview'].map((k) => [
                k,
                { fail_open: false, env_vars: { WR_PROJECT_ID: { value: 'project-one' } } },
              ]),
            ),
          };
      return Response.json({ success: true, result });
    });
    const oldResult = await initial.publish(
      'project-one',
      'release-one',
      { 'index.html': 'approved' },
      undefined,
      stored,
    );
    const rotated = createProviders(
      envFor([
        { ...accountB, apiToken: 'rotated-b' },
        { ...accountA, apiToken: 'rotated-a' },
      ]),
    );
    expect(await rotated.resolveHostingTarget('project-one', stored)).toEqual(stored);
    const newResult = await rotated.publish(
      'project-one',
      'release-one',
      { 'index.html': 'approved' },
      undefined,
      stored,
    );
    expect(newResult.url).toBe(oldResult.url);
    expect(newResult.url).toBe(`https://${stored.pagesProjectName}.pages.dev`);
    expect(
      observed
        .slice(0, 2)
        .every(
          (r) =>
            r.authorization === `Bearer test-token-${stored.accountId.endsWith('a') ? 'a' : 'b'}`,
        ),
    ).toBe(true);
    expect(
      observed
        .slice(2)
        .every(
          (r) => r.authorization === `Bearer rotated-${stored.accountId.endsWith('a') ? 'a' : 'b'}`,
        ),
    ).toBe(true);
  });

  it('fails when the stored account disappears even if another and a legacy token are configured', async () => {
    const stored: HostingTarget = { accountId: 'account-a', pagesProjectName: 'wr-existing-site' };
    const provider = createProviders({
      ...envFor([accountB]),
      CLOUDFLARE_ACCOUNT_ID: 'account-a',
      CLOUDFLARE_API_TOKEN: 'legacy-a',
    });
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(provider.resolveHostingTarget('project-one', stored)).rejects.toMatchObject({
      code: 'pages_hosting_account_missing',
    });
    await expect(
      provider.publish(
        'project-one',
        'release-one',
        { 'index.html': 'approved' },
        'previous',
        stored,
      ),
    ).rejects.toMatchObject({ code: 'pages_hosting_account_missing' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('preserves an existing Pages name and does not reassign on pool growth', async () => {
    const stored: HostingTarget = { accountId: 'account-a', pagesProjectName: 'wr-existing-site' };
    expect(
      await createProviders(
        envFor([accountB, accountA, { accountId: 'account-c', apiToken: 'token-c' }]),
      ).resolveHostingTarget('project-one', stored),
    ).toEqual(stored);
  });

  it('supports the legacy single-account configuration only when no array is supplied', async () => {
    const provider = createProviders({
      CLOUDFLARE_ACCOUNT_ID: 'legacy-account',
      CLOUDFLARE_API_TOKEN: 'legacy-token',
      APP_ORIGIN: 'https://wr.example',
    });
    const target = await provider.resolveHostingTarget('project-one');
    expect(target.accountId).toBe('legacy-account');
    expect(
      await createProviders({
        CLOUDFLARE_ACCOUNT_ID: 'legacy-account',
        CLOUDFLARE_API_TOKEN: 'rotated-legacy',
        CLOUDFLARE_HOSTING_ACCOUNTS: '',
      }).resolveHostingTarget('project-one', target),
    ).toEqual(target);
    await expect(
      createProviders({
        CLOUDFLARE_ACCOUNT_ID: 'different-account',
        CLOUDFLARE_API_TOKEN: 'other-token',
      }).resolveHostingTarget('project-one', target),
    ).rejects.toMatchObject({ code: 'pages_hosting_account_missing' });
  });

  it('rejects malformed, empty or ambiguous account arrays without a single-account fallback', async () => {
    for (const raw of [
      'not-json',
      '[]',
      JSON.stringify([accountA, accountA]),
      JSON.stringify([{ accountId: 'account-a', apiToken: '' }]),
    ]) {
      const provider = createProviders({
        CLOUDFLARE_HOSTING_ACCOUNTS: raw,
        CLOUDFLARE_ACCOUNT_ID: 'legacy',
        CLOUDFLARE_API_TOKEN: 'must-not-fallback',
        APP_ORIGIN: 'https://wr.example',
      });
      await expect(provider.resolveHostingTarget('project-one')).rejects.toMatchObject({
        code: 'pages_hosting_config_invalid',
      });
      expect(provider.status().find((s) => s.name === 'pages')?.mode).toBe('unconfigured');
    }
  });

  it('requires a persisted target at publish time before any network operation', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await expect(
      createProviders(envFor([accountA])).publish('project-one', 'release-one', {
        'index.html': 'approved',
      }),
    ).rejects.toMatchObject({ code: 'pages_hosting_target_required' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('uses an explicit local-test binding and refuses to adopt a live target in test mode', async () => {
    const provider = createProviders({ ENVIRONMENT: 'test', TEST_PROVIDERS: 'true' });
    const target = await provider.resolveHostingTarget('project-one');
    expect(target.accountId).toBe('LOCAL_TEST');
    expect(target.pagesProjectName).toMatch(/^wr-[a-f0-9]{32}$/);
    expect(await provider.resolveHostingTarget('project-one', target)).toEqual(target);
    await expect(
      provider.resolveHostingTarget('project-one', {
        accountId: 'account-a',
        pagesProjectName: 'existing',
      }),
    ).rejects.toMatchObject({ code: 'pages_hosting_account_missing' });
    await expect(provider.publish('project-one', 'release-one', {})).rejects.toMatchObject({
      code: 'pages_hosting_target_required',
    });
    expect(
      (await provider.publish('project-one', 'release-one', {}, undefined, target)).testMode,
    ).toBe(true);
  });
});
