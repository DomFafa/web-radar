import { testMode, type AppEnv } from './env';
import type { Project } from '../shared/model';
import type { ProviderAccount, CloudflareZone } from '../shared/provider-settings';
import { DomainError, requireCondition } from './domain';
import { requestJson } from './providers/http';
import { hostingAccounts } from './providers/pages';
import { sendInquiry } from './providers/email';
import type { Inquiry } from '../shared/model';

type AccountRow = {
  id: string;
  kind: 'cloudflare' | 'resend';
  scope: string;
  label: string;
  secret: string;
  mail_from: string | null;
  is_default: number;
  created_at: string;
};
type BindingRow = {
  hostname: string;
  project_id: string;
  credential_id: string;
  zone_id: string;
  zone_name: string;
  status: string;
  dns_record_id: string | null;
  owns_dns: number;
  created_at: string;
};
const safe = (r: AccountRow): ProviderAccount => ({
  id: r.id,
  kind: r.kind,
  scope: r.scope,
  label: r.label,
  mailFrom: r.mail_from ?? undefined,
  isDefault: !!r.is_default,
  createdAt: r.created_at,
});
function check(value: unknown, message: string): asserts value {
  requireCondition(value, 400, 'invalid_provider_setting', message);
}
const enc = encodeURIComponent;
export class ProviderSettings {
  constructor(private env: AppEnv) {}
  private get db() {
    return this.env.DB;
  }
  private async key() {
    check(this.env.ASSET_SIGNING_KEY, '尚未配置凭据加密密钥。');
    const raw = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode('web-radar/provider-credentials/v1:' + this.env.ASSET_SIGNING_KEY),
    );
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  async encrypt(value: string, id: string) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(id) },
        await this.key(),
        new TextEncoder().encode(value),
      ),
    );
    return JSON.stringify({ iv: Array.from(iv), data: Array.from(ciphertext) });
  }
  private async token(row: AccountRow) {
    try {
      const v = JSON.parse(row.secret);
      return new TextDecoder().decode(
        await crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv: new Uint8Array(v.iv),
            additionalData: new TextEncoder().encode(row.id),
          },
          await this.key(),
          new Uint8Array(v.data),
        ),
      );
    } catch {
      throw new DomainError(
        503,
        'credential_unavailable',
        '保存的凭据无法读取，请管理员核对加密密钥。',
      );
    }
  }
  private async row(id: string, projectId?: string) {
    const r = await this.db
      .prepare('SELECT * FROM provider_accounts WHERE id=?')
      .bind(id)
      .first<AccountRow>();
    requireCondition(
      r && (r.scope === 'global' || r.scope === projectId),
      404,
      'provider_not_found',
      '账号不存在或无权使用。',
    );
    return r;
  }
  async list(projectId?: string) {
    const result = await this.db
      .prepare('SELECT * FROM provider_accounts WHERE scope=? OR scope=? ORDER BY created_at DESC')
      .bind('global', projectId ?? 'global')
      .all<AccountRow>();
    return result.results.map(safe);
  }
  async add(body: Record<string, unknown>, scope: string) {
    check(body.kind === 'cloudflare' || body.kind === 'resend', '账号类型无效。');
    check(
      typeof body.label === 'string' && body.label.trim().length > 0 && body.label.length <= 100,
      '请输入账号名称（最多 100 字）。',
    );
    check(
      typeof body.apiKey === 'string' &&
        body.apiKey.trim().length >= 10 &&
        body.apiKey.length <= 4096 &&
        !/\s/.test(body.apiKey.trim()),
      'API Token / Key 格式无效。',
    );
    check(scope === 'global' || body.kind === 'cloudflare', '网站内仅可添加 Cloudflare 账号。');
    const mailFrom = typeof body.mailFrom === 'string' ? body.mailFrom.trim() : '';
    if (body.kind === 'resend')
      check(
        /^(?:[^<>\r\n]+\s*<)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/.test(mailFrom) &&
          mailFrom.length <= 320,
        '请输入 Resend 已验证域名的发信地址。',
      );
    const id = crypto.randomUUID(),
      created = new Date().toISOString();
    const row: AccountRow = {
      id,
      kind: body.kind,
      scope,
      label: body.label.trim(),
      secret: await this.encrypt(body.apiKey.trim(), id),
      mail_from: mailFrom || null,
      is_default: 0,
      created_at: created,
    };
    // Sending-only Resend keys cannot list domains. Save without sending a test email.
    if (row.kind === 'cloudflare') await this.zonesWithToken(body.apiKey.trim());
    await this.db
      .prepare(
        'INSERT INTO provider_accounts(id,kind,scope,label,secret,mail_from,is_default,created_at) VALUES(?,?,?,?,?,?,0,?)',
      )
      .bind(id, row.kind, scope, row.label, row.secret, row.mail_from, created)
      .run();
    return safe(row);
  }
  async setDefault(id: string | null) {
    if (id) {
      const row = await this.row(id);
      check(row.kind === 'resend', '默认发信账号必须是 Resend。');
    }
    await this.db.batch([
      this.db.prepare("UPDATE provider_accounts SET is_default=0 WHERE kind='resend'"),
      ...(id
        ? [this.db.prepare('UPDATE provider_accounts SET is_default=1 WHERE id=?').bind(id)]
        : []),
    ]);
  }
  async remove(id: string, scope: string) {
    const row = await this.row(id, scope);
    check(row.scope === scope, '不能在网站内删除后台共享账号。');
    const used = await this.db
      .prepare(
        "SELECT (SELECT count(*) FROM project_domains WHERE credential_id=?) + (SELECT count(*) FROM project_delivery_settings WHERE resend_account_id=?) + (SELECT count(*) FROM jobs WHERE kind='email' AND json_extract(data,'$.input.resendAccountId')=? AND status!='succeeded') AS n",
      )
      .bind(id, id, id)
      .first<{ n: number }>();
    requireCondition(
      !used?.n,
      409,
      'provider_in_use',
      '该账号仍被网站、域名或未完成邮件使用，请先解除关联。',
    );
    await this.db.prepare('DELETE FROM provider_accounts WHERE id=?').bind(id).run();
  }
  private async cf(token: string, path: string, method = 'GET', body?: unknown) {
    requireCondition(
      !testMode(this.env) || this.env.CONNECTIONS_TEST_NETWORK === 'mock',
      409,
      'test_connections_disabled',
      '本地演示模式不修改真实域名，请在正式环境配置域名。',
    );
    const data = await requestJson(
      'https://api.cloudflare.com/client/v4' + path,
      {
        method,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
      { provider: 'cloudflare', mutation: method !== 'GET', timeoutMs: 20000 },
    );
    check(data.success === true, 'Cloudflare 未成功处理请求。');
    return data;
  }
  private async zonesWithToken(token: string): Promise<CloudflareZone[]> {
    const zones: CloudflareZone[] = [];
    for (let page = 1; page <= 100; page++) {
      const data = await this.cf(token, `/zones?per_page=50&page=${page}`);
      for (const z of data.result ?? [])
        zones.push({
          id: z.id,
          name: z.name,
          accountId: z.account.id,
          accountName: z.account.name,
          status: z.status,
        });
      if (page >= (data.result_info?.total_pages ?? 1)) return zones;
    }
    throw new DomainError(400, 'too_many_zones', '该 Token 可访问域名过多，请缩小授权范围。');
  }
  async zones(id: string, projectId?: string) {
    const row = await this.row(id, projectId);
    check(row.kind === 'cloudflare', '请选择 Cloudflare 账号。');
    return this.zonesWithToken(await this.token(row));
  }
  async settings(project: Project) {
    const delivery = await this.db
      .prepare('SELECT resend_account_id FROM project_delivery_settings WHERE project_id=?')
      .bind(project.id)
      .first<{ resend_account_id: string | null }>();
    const bindings = await this.db
      .prepare('SELECT * FROM project_domains WHERE project_id=? ORDER BY created_at DESC')
      .bind(project.id)
      .all<BindingRow>();
    return {
      accounts: await this.list(project.id),
      resendAccountId: delivery?.resend_account_id ?? null,
      environmentEmail: !!(this.env.RESEND_API_KEY && this.env.MAIL_FROM),
      published: !!project.publishedReleaseId,
      domains: bindings.results.map((r) => ({
        hostname: r.hostname,
        status: r.status,
        credentialId: r.credential_id,
        zoneName: r.zone_name,
        createdAt: r.created_at,
      })),
    };
  }
  async selectEmail(projectId: string, id: unknown) {
    check(id === null || typeof id === 'string', '发信账号无效。');
    if (id) {
      const row = await this.row(id);
      check(row.kind === 'resend', '请选择 Resend 账号。');
    }
    await this.db
      .prepare(
        'INSERT INTO project_delivery_settings(project_id,resend_account_id) VALUES(?,?) ON CONFLICT(project_id) DO UPDATE SET resend_account_id=excluded.resend_account_id',
      )
      .bind(projectId, id)
      .run();
  }
  async emailAccount(projectId: string): Promise<string> {
    const row = await this.db
      .prepare(
        "SELECT COALESCE((SELECT resend_account_id FROM project_delivery_settings WHERE project_id=?),(SELECT id FROM provider_accounts WHERE kind='resend' AND is_default=1)) AS id",
      )
      .bind(projectId)
      .first<{ id: string | null }>();
    return row?.id ?? 'environment';
  }
  async email(id: string, inquiry: Inquiry, recipient: string, key: string) {
    const row = await this.row(id);
    check(row.kind === 'resend', '发信账号不可用。');
    if (testMode(this.env)) return { id: `test-email-${inquiry.id}`, testMode: true };
    return sendInquiry(
      { ...this.env, RESEND_API_KEY: await this.token(row), MAIL_FROM: row.mail_from! },
      inquiry,
      recipient,
      key,
    );
  }
  private pages(project: Project) {
    requireCondition(
      project.publishedReleaseId && project.hostingTarget,
      409,
      'publish_first',
      '请先发布网站，再绑定域名。',
    );
    const target = project.hostingTarget,
      account = hostingAccounts(this.env).find((a) => a.accountId === target.accountId);
    requireCondition(
      account,
      409,
      'hosting_account_missing',
      '网站发布账号未配置，请恢复原 Cloudflare 托管凭据。',
    );
    return {
      token: account.apiToken,
      accountId: account.accountId,
      path: `/accounts/${enc(account.accountId)}/pages/projects/${enc(target.pagesProjectName)}/domains`,
      target: target.pagesProjectName + '.pages.dev',
    };
  }
  async bind(project: Project, body: Record<string, unknown>) {
    check(
      typeof body.credentialId === 'string' &&
        typeof body.zoneId === 'string' &&
        typeof body.hostname === 'string',
      '请选择账号、域名并填写主机名。',
    );
    const row = await this.row(body.credentialId, project.id),
      token = await this.token(row);
    check(row.kind === 'cloudflare', '账号类型无效。');
    const zone = (await this.zonesWithToken(token)).find((z) => z.id === body.zoneId);
    check(zone, '所选域名不在此 Token 的授权范围内。');
    const hostname = body.hostname.trim().toLowerCase().replace(/\.$/, '');
    check(
      hostname.length <= 253 &&
        hostname.split('.').every((s) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(s)) &&
        (hostname === zone.name || hostname.endsWith('.' + zone.name)),
      '主机名必须属于所选域名，不支持通配符。',
    );
    check(zone.status === 'active', '域名尚未在 Cloudflare 激活，请先完成 NS 配置。');
    const pages = this.pages(project);
    check(hostname !== new URL(this.env.APP_ORIGIN!).hostname, '不能绑定管理平台自身的域名。');
    check(
      hostname !== zone.name || zone.accountId === pages.accountId,
      '根域名必须与网站 Pages 项目在同一个 Cloudflare 账号；跨账号请选择 www 等子域名。',
    );
    const existing = await this.db
      .prepare('SELECT * FROM project_domains WHERE hostname=?')
      .bind(hostname)
      .first<BindingRow>();
    requireCondition(
      !existing || existing.project_id === project.id,
      409,
      'domain_in_use',
      '该域名已绑定另一个网站。',
    );
    check(
      !existing || existing.credential_id === row.id,
      '已有绑定请使用原账号重试，或先解除绑定。',
    );
    const records = (
      await this.cf(token, `/zones/${enc(zone.id)}/dns_records?name=${enc(hostname)}&per_page=100`)
    ).result as any[];
    const cname = records.find(
      (r) =>
        r.type === 'CNAME' && String(r.content).replace(/\.$/, '').toLowerCase() === pages.target,
    );
    requireCondition(
      records.every((r) => r === cname || !['A', 'AAAA', 'CNAME', 'NS'].includes(r.type)) &&
        (!records.length || !!cname || records.every((r) => ['TXT', 'MX', 'CAA'].includes(r.type))),
      409,
      'dns_conflict',
      '该主机名已有冲突 DNS 记录，请使用空闲子域名或先在 Cloudflare 处理原记录。',
    );
    if (!existing)
      await this.db
        .prepare(
          "INSERT INTO project_domains(hostname,project_id,credential_id,zone_id,zone_name,status,created_at) VALUES(?,?,?,?,?,'pending',?)",
        )
        .bind(hostname, project.id, row.id, zone.id, zone.name, new Date().toISOString())
        .run();
    const domains = (await this.cf(pages.token, pages.path)).result as any[];
    if (!domains.some((d) => d.name === hostname))
      await this.cf(pages.token, pages.path, 'POST', { name: hostname });
    if (!cname) {
      const record = (
        await this.cf(token, `/zones/${enc(zone.id)}/dns_records`, 'POST', {
          type: 'CNAME',
          name: hostname,
          content: pages.target,
          ttl: 1,
          proxied: true,
          comment: `web-radar:${project.id}`,
        })
      ).result;
      await this.db
        .prepare('UPDATE project_domains SET dns_record_id=?,owns_dns=1 WHERE hostname=?')
        .bind(record.id, hostname)
        .run();
    } else if (cname.comment === `web-radar:${project.id}`) {
      await this.db
        .prepare('UPDATE project_domains SET dns_record_id=?,owns_dns=1 WHERE hostname=?')
        .bind(cname.id, hostname)
        .run();
    }
    return this.refresh(project, hostname);
  }
  async refresh(project: Project, hostname: string) {
    await this.binding(project.id, hostname);
    const pages = this.pages(project);
    const result = (await this.cf(pages.token, pages.path + '/' + enc(hostname))).result;
    const status = typeof result.status === 'string' ? result.status : 'pending';
    await this.db
      .prepare('UPDATE project_domains SET status=? WHERE project_id=? AND hostname=?')
      .bind(status, project.id, hostname)
      .run();
    return { status };
  }
  private async binding(projectId: string, hostname: string) {
    const row = await this.db
      .prepare('SELECT * FROM project_domains WHERE project_id=? AND hostname=?')
      .bind(projectId, hostname)
      .first<BindingRow>();
    requireCondition(row, 404, 'domain_not_found', '域名绑定不存在。');
    return row;
  }
  async unbind(project: Project, hostname: string) {
    const binding = await this.binding(project.id, hostname),
      pages = this.pages(project),
      row = await this.row(binding.credential_id, project.id),
      token = await this.token(row);
    const domains = (await this.cf(pages.token, pages.path)).result as any[];
    if (domains.some((d) => d.name === hostname))
      await this.cf(pages.token, pages.path + '/' + enc(hostname), 'DELETE');
    {
      const records = (
        await this.cf(
          token,
          `/zones/${enc(binding.zone_id)}/dns_records?name=${enc(hostname)}&per_page=100`,
        )
      ).result as any[];
      const record = records.find((r) =>
        binding.dns_record_id
          ? r.id === binding.dns_record_id
          : r.type === 'CNAME' &&
            r.content === pages.target &&
            r.comment === `web-radar:${project.id}`,
      );
      if (
        record &&
        record.type === 'CNAME' &&
        record.content === pages.target &&
        record.comment === `web-radar:${project.id}`
      )
        await this.cf(
          token,
          `/zones/${enc(binding.zone_id)}/dns_records/${enc(record.id)}`,
          'DELETE',
        );
    }
    await this.db
      .prepare('DELETE FROM project_domains WHERE project_id=? AND hostname=?')
      .bind(project.id, hostname)
      .run();
  }
}

/** Reflect database-managed senders without exposing their keys in public configuration. */
export async function withStoredEmailStatus(
  env: AppEnv,
  statuses: import('../shared/model').ServiceStatus[],
) {
  const result = await env.DB.prepare(
    "SELECT count(*) AS n FROM provider_accounts WHERE kind='resend' AND scope='global'",
  ).first<{ n: number }>();
  if (!result?.n) return statuses;
  return statuses.map((status) =>
    status.name === 'email'
      ? {
          ...status,
          configured: true,
          mode: 'live' as const,
          detail: '已配置 Resend 账号，可在网站选择或跟随默认账号。',
        }
      : status,
  );
}
