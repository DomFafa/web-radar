import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { testDb } from './helpers/db';
import { ProviderSettings } from '../src/worker/provider-settings';
import { DomainService } from '../src/worker/domain-service';
import { defaultDraft } from '../src/worker/domain';
import type { AppEnv } from '../src/worker/env';
import type { Project, Principal, Inquiry } from '../src/shared/model';
let env: AppEnv, settings: ProviderSettings, project: Project;
const token = 'test-cloudflare-token-not-real',
  other = 'test-resend-key-not-real';
const zone = {
  id: 'zone1',
  name: 'example.com',
  status: 'active',
  account: { id: 'account1', name: 'Company' },
};
let records: any[],
  domains: any[],
  calls: { url: string; method: string; body: any; authorization: string | null }[];
let cloudflareId: string;
beforeEach(async () => {
  const DB = testDb();
  for (const name of [
    '0002_business',
    '0003_source_reviews',
    '0004_unlimited_quota',
    '0005_project_summary_indexes',
    '0006_provider_accounts',
  ])
    await DB.exec(readFileSync(`migrations/${name}.sql`, 'utf8'));
  env = {
    DB,
    ASSET_SIGNING_KEY: 'a-long-random-test-key',
    CLOUDFLARE_ACCOUNT_ID: 'account1',
    CLOUDFLARE_API_TOKEN: 'pages-account-secret',
    APP_ORIGIN: 'https://admin.example.net',
    RESEND_API_KEY: 'old-env-key',
    MAIL_FROM: 'old@example.com',
  } as AppEnv;
  settings = new ProviderSettings(env);
  project = {
    id: 'p1',
    ownerId: 'owner',
    workspaceId: 'workspace',
    version: 1,
    draft: defaultDraft(),
    name: 'Test',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    offline: false,
    publishedReleaseId: 'release1',
    hostingTarget: { accountId: 'account1', pagesProjectName: 'wr-test' },
  };
  await DB.prepare('INSERT INTO projects(id,owner_id,workspace_id,version,data) VALUES(?,?,?,?,?)')
    .bind(project.id, project.ownerId, project.workspaceId, 1, JSON.stringify(project))
    .run();
  records = [];
  domains = [];
  calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const u = new URL(url),
        method = init.method ?? 'GET',
        body = init.body ? JSON.parse(init.body as string) : null;
      calls.push({
        url,
        method,
        body,
        authorization: new Headers(init.headers).get('Authorization'),
      });
      let result: any = [];
      if (u.hostname === 'api.resend.com') return Response.json({ id: 'sent1' });
      if (u.pathname.endsWith('/zones'))
        return Response.json({ success: true, result: [zone], result_info: { total_pages: 1 } });
      if (u.pathname.endsWith('/dns_records')) {
        if (method === 'POST') {
          result = { ...body, id: 'dns1' };
          records.push(result);
        } else result = records;
      } else if (u.pathname.endsWith('/dns_records/dns1')) {
        if (method === 'DELETE') records = [];
        result = { id: 'dns1' };
      } else if (u.pathname.endsWith('/domains')) {
        if (method === 'POST') {
          result = { ...body, status: 'pending' };
          domains.push(result);
        } else result = domains;
      } else if (u.pathname.includes('/domains/')) {
        if (method === 'DELETE') domains = [];
        result = { name: 'www.example.com', status: 'active' };
      }
      return Response.json({ success: true, result });
    }),
  );
  cloudflareId = (await settings.add({ kind: 'cloudflare', label: 'DNS', apiKey: token }, 'global'))
    .id;
});
afterEach(() => vi.unstubAllGlobals());
const bind = () =>
  settings.bind(project, {
    credentialId: cloudflareId,
    zoneId: 'zone1',
    hostname: 'www.example.com',
  });
async function resend(label = 'Mail') {
  return settings.add(
    { kind: 'resend', label, apiKey: other, mailFrom: 'Website <hello@example.com>' },
    'global',
  );
}

describe('provider accounts and domain binding', () => {
  it('encrypts credentials and never returns secret material in lists or site settings', async () => {
    const row = await env.DB.prepare('SELECT secret FROM provider_accounts WHERE id=?')
      .bind(cloudflareId)
      .first<{ secret: string }>();
    expect(row!.secret).not.toContain(token);
    expect(JSON.stringify(await settings.list())).not.toContain('secret');
    expect(JSON.stringify(await settings.settings(project))).not.toContain(token);
    expect((await settings.zones(cloudflareId)).map((z) => z.name)).toEqual(['example.com']);
  });
  it('isolates inline credentials to their own website', async () => {
    const account = await settings.add(
      { kind: 'cloudflare', label: 'Private', apiKey: token },
      'p1',
    );
    expect((await settings.list('p2')).some((a) => a.id === account.id)).toBe(false);
    await expect(settings.zones(account.id, 'p2')).rejects.toMatchObject({ status: 404 });
  });
  it('uses hosting credentials for Pages and selected credentials for DNS; retries without duplicates', async () => {
    await bind();
    await bind();
    expect(calls.filter((c) => c.method === 'POST' && c.url.endsWith('/domains'))).toHaveLength(1);
    expect(calls.filter((c) => c.method === 'POST' && c.url.endsWith('/dns_records'))).toHaveLength(
      1,
    );
    expect(calls.find((c) => c.url.endsWith('/domains'))?.authorization).toBe(
      'Bearer pages-account-secret',
    );
    expect(calls.find((c) => c.url.includes('/dns_records'))?.authorization).toBe(
      'Bearer ' + token,
    );
    expect((await settings.settings(project)).domains[0].status).toBe('active');
  });
  it('does not overwrite conflicting DNS', async () => {
    records = [{ id: 'existing', type: 'A', name: 'www.example.com', content: '192.0.2.1' }];
    await expect(bind()).rejects.toMatchObject({ code: 'dns_conflict' });
    expect(calls.some((c) => c.method !== 'GET')).toBe(false);
  });
  it('rejects domains outside the token zone and wildcard names', async () => {
    for (const hostname of ['attacker.example.org', 'example.com.attacker.test', '*.example.com'])
      await expect(
        settings.bind(project, { credentialId: cloudflareId, zoneId: 'zone1', hostname }),
      ).rejects.toMatchObject({ status: 400 });
    expect(calls.some((c) => c.method !== 'GET')).toBe(false);
  });
  it('rejects cross-account apex but allows cross-account www', async () => {
    env.CLOUDFLARE_ACCOUNT_ID = 'account2';
    project.hostingTarget!.accountId = 'account2';
    await expect(
      settings.bind(project, {
        credentialId: cloudflareId,
        zoneId: 'zone1',
        hostname: 'example.com',
      }),
    ).rejects.toThrow('根域名必须');
    await bind();
  });
  it('allows an apex domain with TXT and MX without deleting them', async () => {
    records = [
      { id: 'txt1', type: 'TXT', content: 'verification' },
      { id: 'mx1', type: 'MX', content: 'mail.example.com' },
    ];
    await settings.bind(project, {
      credentialId: cloudflareId,
      zoneId: 'zone1',
      hostname: 'example.com',
    });
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    expect(records).toHaveLength(3);
  });
  it('blocks binding collisions between projects', async () => {
    await bind();
    await expect(
      settings.bind(
        { ...project, id: 'p2' },
        { credentialId: cloudflareId, zoneId: 'zone1', hostname: 'www.example.com' },
      ),
    ).rejects.toMatchObject({ code: 'domain_in_use' });
  });
  it('unbinds only app-owned unmodified DNS', async () => {
    await bind();
    records[0].content = 'other.pages.dev';
    await settings.unbind(project, 'www.example.com');
    expect(records).toHaveLength(1);
    expect((await settings.settings(project)).domains).toHaveLength(0);
  });
  it('keeps pre-existing matching CNAME records on unbind', async () => {
    records = [
      { id: 'dns1', name: 'www.example.com', type: 'CNAME', content: 'wr-test.pages.dev' },
    ];
    await bind();
    await settings.unbind(project, 'www.example.com');
    expect(records).toHaveLength(1);
  });
  it('removes DNS created by this application on unbind', async () => {
    await bind();
    await settings.unbind(project, 'www.example.com');
    expect(records).toHaveLength(0);
    expect(domains).toHaveLength(0);
  });
  it('supports default and per-site Resend accounts, with environment fallback', async () => {
    const a = await resend('Mail A'),
      b = await resend('Mail B');
    expect(await settings.emailAccount('p1')).toBe('environment');
    await settings.setDefault(a.id);
    expect(await settings.emailAccount('p1')).toBe(a.id);
    await settings.selectEmail('p1', b.id);
    await settings.setDefault(b.id);
    await settings.setDefault(null);
    expect(await settings.emailAccount('p1')).toBe(b.id);
    await settings.selectEmail('p1', null);
    expect(await settings.emailAccount('p1')).toBe('environment');
    expect(calls.some((c) => c.url.includes('resend'))).toBe(false);
  });
  it('dispatches with selected key and sender without modifying environment defaults', async () => {
    const a = await resend();
    await settings.email(
      a.id,
      {
        id: 'inq',
        name: 'Buyer',
        email: 'buyer@example.net',
        message: 'Hello',
        createdAt: new Date().toISOString(),
      } as Inquiry,
      'sales@example.com',
      'wr-inquiry-inq',
    );
    const call = calls.find((c) => c.url.includes('api.resend.com'))!;
    expect(call.authorization).toBe('Bearer ' + other);
    expect(call.body.from).toBe('Website <hello@example.com>');
    expect(env.RESEND_API_KEY).toBe('old-env-key');
  });
  it('prevents deleting in-use accounts and non-Resend defaults', async () => {
    await expect(settings.setDefault(cloudflareId)).rejects.toMatchObject({ status: 400 });
    await bind();
    await expect(settings.remove(cloudflareId, 'global')).rejects.toMatchObject({
      code: 'provider_in_use',
    });
    const a = await resend();
    await settings.selectEmail('p1', a.id);
    await expect(settings.remove(a.id, 'global')).rejects.toMatchObject({
      code: 'provider_in_use',
    });
  });
  it('enforces platform admin and project access at API routes', async () => {
    const service = new DomainService(env, { schedule: async () => {} });
    const principal = {
      userId: 'owner',
      workspaceId: 'workspace',
      workspaceRole: 'member',
      systemRole: 'user',
    } as Principal;
    const request = (path: string, p = principal, method = 'GET', body?: unknown) =>
      service.fetch(
        new Request('https://admin.example.net' + path, {
          method,
          headers: {
            'X-WR-Principal': encodeURIComponent(JSON.stringify(p)),
            'Content-Type': 'application/json',
          },
          ...(body ? { body: JSON.stringify(body) } : {}),
        }),
      );
    expect((await request('/api/admin/provider-accounts')).status).toBe(403);
    expect(
      (
        await request('/api/projects/p1/connections', {
          ...principal,
          userId: 'other',
          workspaceId: 'other',
        })
      ).status,
    ).toBe(404);
    expect((await request('/api/projects/p1/connections')).status).toBe(200);
    const admin = { ...principal, systemRole: 'super_admin' } as Principal;
    expect((await request('/api/admin/provider-accounts', admin)).status).toBe(200);
    const a = await resend();
    expect(
      (await request('/api/projects/p1/connections/email', principal, 'PUT', { accountId: a.id }))
        .status,
    ).toBe(200);
  });
});

it('recovers and cleans up DNS if its creation succeeded but recording the result failed', async () => {
  await bind();
  await env.DB.prepare(
    'UPDATE project_domains SET dns_record_id=NULL,owns_dns=0 WHERE project_id=?',
  )
    .bind(project.id)
    .run();
  await settings.unbind(project, 'www.example.com');
  expect(records).toHaveLength(0);
});
it('does not send live email or mutate real domains in local demonstration mode', async () => {
  env.ENVIRONMENT = 'test';
  env.TEST_PROVIDERS = 'true';
  await expect(bind()).rejects.toMatchObject({ code: 'test_connections_disabled' });
  const a = await resend();
  expect(
    await settings.email(a.id, { id: 'inq' } as Inquiry, 'sales@example.com', 'wr-test'),
  ).toEqual({ id: 'test-email-inq', testMode: true });
  expect(calls.some((c) => c.url.includes('resend'))).toBe(false);
});

it('offers and uses existing hosting credentials without saving another API token', async () => {
  await settings.remove(cloudflareId, 'global');
  const data = await settings.settings(project);
  expect(data.defaultCloudflareAccountId).toBe('environment-cloudflare:account1');
  expect(data.accounts).toHaveLength(1);
  expect(JSON.stringify(data)).not.toContain('pages-account-secret');
  expect((await settings.zones(data.defaultCloudflareAccountId!, project.id))[0].name).toBe(
    'example.com',
  );
  await settings.bind(project, {
    credentialId: data.defaultCloudflareAccountId,
    zoneId: 'zone1',
    hostname: 'www.example.com',
  });
  expect(
    calls
      .filter((c) => c.method === 'POST')
      .every((c) => c.authorization === 'Bearer pages-account-secret'),
  ).toBe(true);
  const ref = await env.DB.prepare('SELECT secret,scope FROM provider_accounts WHERE id=?')
    .bind(data.defaultCloudflareAccountId)
    .first();
  expect(ref).toEqual({ secret: '', scope: 'environment' });
  env.CLOUDFLARE_API_TOKEN = 'rotated-existing-secret';
  await settings.unbind(project, 'www.example.com');
  expect(
    calls
      .filter((c) => c.method === 'DELETE')
      .every((c) => c.authorization === 'Bearer rotated-existing-secret'),
  ).toBe(true);
  expect(records).toHaveLength(0);
});
it('limits the environment option to the project hosting account and its zones', async () => {
  env.CLOUDFLARE_HOSTING_ACCOUNTS = JSON.stringify([
    { accountId: 'account1', apiToken: 'first-configured-key' },
    { accountId: 'account2', apiToken: 'second-configured-key' },
  ]);
  await expect(settings.zones('environment-cloudflare:account2', project.id)).rejects.toMatchObject(
    { code: 'provider_not_found' },
  );
  await expect(settings.zones('environment-cloudflare:account1', 'missing')).rejects.toMatchObject({
    code: 'project_not_found',
  });
  project.hostingTarget!.accountId = 'account2';
  await env.DB.prepare('UPDATE projects SET data=? WHERE id=?')
    .bind(JSON.stringify(project), project.id)
    .run();
  expect((await settings.settings(project)).defaultCloudflareAccountId).toBe(
    'environment-cloudflare:account2',
  );
  expect(await settings.zones('environment-cloudflare:account2', project.id)).toEqual([]);
  await expect(
    settings.bind(project, {
      credentialId: 'environment-cloudflare:account2',
      zoneId: 'zone1',
      hostname: 'www.example.com',
    }),
  ).rejects.toMatchObject({ status: 400 });
});
it('predicts the configured account for an unpublished project and keeps manual accounts selectable', async () => {
  delete project.hostingTarget;
  delete project.publishedReleaseId;
  const data = await settings.settings(project);
  expect(data.defaultCloudflareAccountId).toBe('environment-cloudflare:account1');
  expect(data.accounts.some((a) => a.id === cloudflareId)).toBe(true);
  delete env.CLOUDFLARE_API_TOKEN;
  expect((await settings.settings(project)).defaultCloudflareAccountId).toBe(null);
  expect((await settings.settings(project)).accounts.some((a) => a.id === cloudflareId)).toBe(true);
});
