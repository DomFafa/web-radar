import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { d1 } from './outreach/sqlite';
import inbox from '../src/worker/inbox/api';
import { trackedAddress, digest, sign, plain, ingest, INBOX_RESOLVE_PURPOSE } from '../src/worker/inbox/core';
vi.mock('../src/worker/auth', () => ({
  authenticate: async (req: Request) => {
    const name = req.headers.get('X-Test-User') || 'admin';
    return {
      principal: {
        userId: name,
        workspaceId: name === 'outsider' ? 'other' : 'w',
        systemRole: 'user',
        workspaceRole: name === 'admin' ? 'admin' : 'member',
        appRole:
          name === 'analyst'
            ? 'analyst'
            : name === 'viewer'
              ? 'viewer'
              : name === 'admin'
                ? 'admin'
                : 'member',
      },
    };
  },
}));
let db: any, env: any, cfg: any;
const bodies = new Map<string, ArrayBuffer>();
async function req(path: string, method = 'GET', body?: unknown, user = 'admin') {
  return inbox.request(
    'https://app.example' + path,
    {
      method,
      headers: {
        'X-Test-User': user,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    env,
  );
}
async function receive(text: string, to: string, signature = true, forwardTo = 'sales@work.example', forward = 'forwarded') {
  const raw = new TextEncoder().encode(text).buffer,
    time = String(Date.now()),
    from = 'customer@client.example';
  const headers = {
    'Content-Type': 'message/rfc822',
    'X-Inbox-To': to,
    'X-Inbox-From': from,
    'X-Inbox-Forward': forward,
    'X-Inbox-Forward-To': forwardTo,
    'X-Inbox-Time': time,
    'X-Inbox-Signature': signature
      ? await sign(
          cfg.secret,
          [cfg.id, time, to, from, forward, forwardTo, await digest(raw)].join('\n'),
        )
      : 'bad',
  };
  return inbox.request(
    'https://app.example/receive/' + cfg.id,
    { method: 'POST', headers, body: raw },
    env,
  );
}
async function resolveRoute(to: string, options: { id?: string; secret?: string; time?: string; purpose?: string; signedTo?: string } = {}) {
  const id = options.id || cfg.id, time = options.time || String(Date.now());
  return inbox.request('https://app.example/resolve/' + id, { method: 'POST', headers: {
    'X-Inbox-To': to, 'X-Inbox-Time': time,
    'X-Inbox-Signature': await sign(options.secret || cfg.secret, [options.purpose || INBOX_RESOLVE_PURPOSE, id, time, options.signedTo || to].join('\n')),
  } }, env);
}
const email = (id: string, extra = '', body = 'Please provide a quotation') =>
  `From: Customer <customer@client.example>\r\nTo: Sales <sales@reply.example.com>\r\nSubject: Re: Product enquiry\r\nMessage-ID: <${id}@client.example>\r\n${extra}Content-Type: text/plain; charset=utf-8\r\n\r\n${body}`;
async function enable() {
  expect((await receive(email('test'), 'setup@reply.example.com')).status).toBe(200);
  expect(
    (
      await req('/configs/' + cfg.id, 'PUT', {
        enabled: true,
        trackEdm: true,
        trackSites: true,
        teamBody: false,
      })
    ).status,
  ).toBe(200);
}
beforeEach(async () => {
  bodies.clear();
  const sqlite = new DatabaseSync(':memory:');
  db = Object.assign(d1(sqlite), { sqlite, close: () => sqlite.close() });
  for (const f of readdirSync('migrations')
    .filter((f) => f.endsWith('.sql'))
    .sort())
    db.sqlite.exec(readFileSync('migrations/' + f, 'utf8'));
  env = {
    DB: db,
    ASSET_SIGNING_KEY: 'test-only-inbox-key',
    MEDIA: {
      put: async (k: string, b: any) => {
        bodies.set(k, await new Response(b).arrayBuffer());
      },
      get: async (k: string) => (bodies.has(k) ? { body: bodies.get(k) } : null),
    },
  };
  db.sqlite
    .exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES('w','Workspace','w@example.test',1,1);
 INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES('contact','w','customer@client.example',1,1);
 INSERT INTO edm_campaigns(id,user_id,created_by,name,sender_email,sender_name,reply_tracking,total_sent,created_at,updated_at) VALUES('campaign','w','owner','Campaign','sales@example.com','Sales',1,1,1,1);
 INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,sent_at,opened_at,created_at) VALUES('recipient','campaign','contact','opened',1,2,1);
 INSERT INTO edm_site_message_jobs(id,user_id,created_by,name,sender_name,sender_email,message,reply_tracking,total_submitted,created_at,updated_at) VALUES('job','w','owner','Site job','Sales','sales@example.com','Please contact us',1,1,1,1);
 INSERT INTO edm_site_message_targets(id,job_id,website_url,normalized_host,status,created_at,updated_at) VALUES('target','job','https://client.example/','client.example','submitted',1,1);
 `);
  const response = await req('/configs', 'POST', {
    domain: 'reply.example.com',
    forwardTo: 'sales@work.example',
    trackEdm: true,
    trackSites: true,
    teamBody: false,
  });
  expect(response.status).toBe(200);
  cfg = await response.json();
});
afterEach(() => db.close());
describe('customer inbox', () => {
  it('requires receiving verification before enabling and preserves fixed addresses without it', async () => {
    expect(await trackedAddress(db, 'edm', 'recipient', 'snapshot', 'subject')).toBeNull();
    expect(
      (
        await req('/configs/' + cfg.id, 'PUT', {
          enabled: true,
          trackEdm: true,
          trackSites: true,
          teamBody: false,
        })
      ).status,
    ).toBe(409);
    expect((await req('/configs', 'GET', undefined, 'owner')).status).toBe(200);
    expect(JSON.stringify(await (await req('/configs')).json())).not.toContain(cfg.secret);
  });
  it('rejects invalid signatures and foreign envelope domains', async () => {
    expect((await receive(email('bad'), 'setup@reply.example.com', false)).status).toBe(401);
    expect((await receive(email('bad'), 'setup@other.example')).status).toBe(401);
    expect(db.sqlite.prepare('SELECT COUNT(*) n FROM wr_inbox_messages').get().n).toBe(0);
  });
  it('tracks per recipient and target with stable instance-specific aliases and snapshots', async () => {
    await enable();
    const a = await trackedAddress(db, 'edm', 'recipient', 'original body', 'subject'),
      b = await trackedAddress(db, 'site', 'target', 'original form', 'subject');
    expect(a).toMatch(new RegExp('^reply\\+e2-' + cfg.id.replaceAll('-', '').slice(0, 12) + '-[a-f0-9]{32}@reply\\.example\\.com$'));
    expect(b).toMatch(/^reply\+s-[a-f0-9]{12}-[a-f0-9]{32}@reply\.example\.com$/);
    expect(await trackedAddress(db, 'edm', 'recipient', 'edited body', 'changed')).toBe(a);
    expect(
      db.sqlite.prepare("SELECT snapshot FROM wr_inbox_routes WHERE source='edm'").get().snapshot,
    ).toBe('original body');
  });
  it('preserves legacy route addresses and matches new aliases using their complete signed recipient', async () => {
    await enable();
    const legacy = 'e-' + cfg.id.replaceAll('-', '').slice(0, 12) + '-old@reply.example.com';
    db.sqlite.prepare(`INSERT INTO wr_inbox_routes(id,config_id,workspace_id,owner_id,source,business_id,target_id,address,original_email,subject,snapshot,created_at) VALUES('legacy',?,'w','owner','edm','campaign','recipient',?,'customer@client.example','Legacy subject','Legacy body','2026-10-09')`).run(cfg.id, legacy);
    expect(await trackedAddress(db, 'edm', 'recipient', 'Edited body', 'Edited subject')).toBe(legacy);
    const site = (await trackedAddress(db, 'site', 'target', 'Original site body', 'Subject'))!;
    expect((await receive(email('legacy-reply'), legacy)).status).toBe(200);
    expect((await receive(email('same-id'), site)).status).toBe(200);
    const result = db.sqlite.prepare('SELECT recipient,match_method FROM wr_inbox_messages WHERE recipient=?').get(site);
    expect(result).toEqual({ recipient: site, match_method: 'address' });
    const raw = new TextEncoder().encode(email('tampered-to')).buffer, time = String(Date.now());
    const signature = await sign(cfg.secret, [cfg.id,time,'reply@reply.example.com','customer@client.example','forwarded','sales@work.example',await digest(raw)].join('\n'));
    const rejected = await inbox.request('https://app.example/receive/' + cfg.id, { method: 'POST', headers: { 'Content-Type': 'message/rfc822', 'X-Inbox-To': site, 'X-Inbox-From': 'customer@client.example', 'X-Inbox-Forward': 'forwarded', 'X-Inbox-Forward-To': 'sales@work.example', 'X-Inbox-Time': time, 'X-Inbox-Signature': signature }, body: raw }, env);
    expect(rejected.status).toBe(401);
    expect(db.sqlite.prepare("SELECT COUNT(*) n FROM wr_inbox_messages WHERE message_id='<tampered-to@client.example>'").get().n).toBe(0);
  });
  it('keeps full plus aliases distinct for deduplication and cannot match a route in another workspace', async () => {
    await enable();
    const edm = (await trackedAddress(db, 'edm', 'recipient', 'Body', 'Subject'))!, site = (await trackedAddress(db, 'site', 'target', 'Body', 'Subject'))!;
    await receive(email('shared-message-id'), edm); await receive(email('shared-message-id'), site);
    expect(db.sqlite.prepare("SELECT COUNT(*) n FROM wr_inbox_messages WHERE message_id='<shared-message-id@client.example>'").get().n).toBe(2);
    const foreignAlias = 'reply+e-aaaaaaaaaaaa-' + '1'.repeat(32) + '@reply.example.com';
    db.sqlite.exec("INSERT INTO wr_inbox_configs(id,workspace_id,domain,forward_to,secret,created_at) VALUES('foreign-config','other','other.example.com','other@work.example','not-used','2026-10-09')");
    db.sqlite.prepare("INSERT INTO wr_inbox_routes(id,config_id,workspace_id,owner_id,source,business_id,target_id,address,rfc_message_id,created_at) VALUES('foreign-route','foreign-config','other','outsider','edm','foreign-campaign','foreign-target',?,'<foreign-sent@example.com>','2026-10-09')").run(foreignAlias);
    await receive(email('wrong-workspace', 'In-Reply-To: <foreign-sent@example.com>\r\n'), foreignAlias);
    expect(db.sqlite.prepare("SELECT workspace_id,match_method FROM wr_inbox_messages WHERE message_id='<wrong-workspace@client.example>'").get()).toEqual({ workspace_id: 'w', match_method: 'unmatched' });
    expect(db.sqlite.prepare("SELECT COUNT(*) n FROM wr_inbox_threads WHERE route_id='foreign-route'").get().n).toBe(0);
  });
  it('deduplicates redelivery, groups replies and prevents cross-user or workspace access', async () => {
    await enable();
    const a = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    await receive(email('reply1'), a);
    await receive(email('reply1'), a);
    await receive(email('reply2'), a);
    const list = (await (
      await req('/threads?source=edm', 'GET', undefined, 'owner')
    ).json()) as any;
    expect(list.threads).toHaveLength(1);
    expect(list.threads[0].message_count).toBe(2);
    const id = list.threads[0].id;
    expect((await req('/threads/' + id, 'GET', undefined, 'outsider')).status).toBe(404);
    expect((await req('/threads/' + id, 'GET', undefined, 'member')).status).toBe(404);
    const analyst: any = await (await req('/threads/' + id, 'GET', undefined, 'analyst')).json();
    expect(analyst.canBody).toBe(false);
    expect(analyst.messages[0].text_body).toBeNull();
    expect(analyst.thread.snapshot).toBeNull();
  });
  it('counts confirmed customer replies once without changing sent/opened states and supports correction', async () => {
    await enable();
    const a = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    await receive(email('reply1'), a);
    await receive(email('reply2', 'Auto-Submitted: auto-replied\r\n'), a);
    const m = db.sqlite
      .prepare('SELECT id,kind FROM wr_inbox_messages WHERE recipient=? ORDER BY received_at')
      .all(a);
    expect(m[0].kind).toBe('unknown');
    expect(m[1].kind).toBe('automatic');
    expect(
      (await req('/messages/' + m[0].id + '/kind', 'PUT', { kind: 'human' }, 'owner')).status,
    ).toBe(200);
    expect(db.sqlite.prepare('SELECT total_replied FROM edm_campaigns').get().total_replied).toBe(
      1,
    );
    expect(db.sqlite.prepare('SELECT status FROM edm_campaign_recipients').get().status).toBe(
      'opened',
    );
    expect(((await (await req('/report?source=edm')).json()) as any).reports[0]).toEqual({
      source: 'edm',
      sent: 1,
      tracked: 1,
      replied: 1,
    });
    await req('/messages/' + m[0].id + '/kind', 'PUT', { kind: 'automatic' }, 'owner');
    expect(db.sqlite.prepare('SELECT total_replied FROM edm_campaigns').get().total_replied).toBe(
      0,
    );
  });
  it('matches standard reply headers within a config, never guesses from sender domain', async () => {
    await enable();
    const a = (await trackedAddress(db, 'site', 'target', 'form', 'subject'))!;
    await receive(email('first'), a);
    await receive(
      email('second', 'In-Reply-To: <first@client.example>\r\n'),
      'sales@reply.example.com',
    );
    await receive(email('unrelated'), 'sales@reply.example.com');
    const t = db.sqlite.prepare('SELECT id FROM wr_inbox_threads WHERE route_id IS NOT NULL').get();
    expect(
      db.sqlite.prepare('SELECT COUNT(*) n FROM wr_inbox_messages WHERE thread_id=?').get(t.id).n,
    ).toBe(2);
    expect(
      db.sqlite
        .prepare(
          "SELECT match_method FROM wr_inbox_messages WHERE message_id='<unrelated@client.example>'",
        )
        .get().match_method,
    ).toBe('unmatched');
  });
  it('supports manual association, disassociation, owner changes and immutable audit history', async () => {
    await enable();
    await trackedAddress(db, 'site', 'target', 'form', 'subject');
    await receive(email('unmatched'), 'sales@reply.example.com');
    const t = db.sqlite
        .prepare(
          "SELECT thread_id FROM wr_inbox_messages WHERE message_id='<unmatched@client.example>'",
        )
        .get().thread_id,
      r = db.sqlite.prepare('SELECT id FROM wr_inbox_routes').get().id;
    expect((await req('/threads/' + t + '/link', 'PUT', { routeId: r }, 'owner')).status).toBe(403);
    const linked: any = await (await req('/threads/' + t + '/link', 'PUT', { routeId: r })).json();
    expect((await req('/threads/' + linked.threadId, 'GET', undefined, 'owner')).status).toBe(200);
    const unlinked: any = await (
      await req('/threads/' + linked.threadId + '/link', 'PUT', { routeId: null })
    ).json();
    expect((await req('/threads/' + unlinked.threadId, 'GET', undefined, 'owner')).status).toBe(
      404,
    );
    expect(
      db.sqlite.prepare("SELECT COUNT(*) n FROM wr_inbox_audit WHERE action='thread.link'").get().n,
    ).toBe(2);
  });
  it('uses plain text rendering, gates attachments and classifies machine replies', async () => {
    expect(plain('<style>hidden</style><script>attack()</script><p>Hello</p>')).toContain('Hello');
    expect(plain('<script>attack()</script>')).not.toContain('attack');
    await enable();
    const a = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    const raw = `From: customer@client.example\r\nMessage-ID: <attachment@client.example>\r\nSubject: Attachment\r\nContent-Type: multipart/mixed; boundary=b\r\n\r\n--b\r\nContent-Type: text/html\r\n\r\n<script>alert(1)</script><p>Quotation</p>\r\n--b\r\nContent-Type: text/plain\r\nContent-Disposition: attachment; filename="quote.txt"\r\n\r\nquote content\r\n--b--`;
    await receive(raw, a);
    const m = db.sqlite
      .prepare('SELECT id,text_body FROM wr_inbox_messages WHERE recipient=?')
      .get(a);
    expect(m.text_body).not.toContain('alert');
    expect(
      (await req('/messages/' + m.id + '/attachments/0', 'GET', undefined, 'member')).status,
    ).toBe(404);
    expect(
      (await req('/messages/' + m.id + '/attachments/0', 'GET', undefined, 'analyst')).status,
    ).toBe(403);
    const download = await req('/messages/' + m.id + '/attachments/0', 'GET', undefined, 'owner');
    expect(download.headers.get('Content-Type')).toBe('application/octet-stream');
    expect(await download.text()).toContain('quote content');
  });
  it('read receipts are per user, mutations require writer role and stale versions are rejected', async () => {
    await enable();
    const a = (await trackedAddress(db, 'site', 'target', 'body', 'subject'))!;
    await receive(email('first'), a);
    const t = db.sqlite.prepare('SELECT * FROM wr_inbox_threads WHERE route_id IS NOT NULL').get();
    expect(
      (
        await req(
          '/threads/' + t.id,
          'PUT',
          { status: 'done', assigneeId: null, version: t.version },
          'analyst',
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await req(
          '/threads/' + t.id,
          'PUT',
          { status: 'done', assigneeId: null, version: t.version },
          'owner',
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await req(
          '/threads/' + t.id,
          'PUT',
          { status: 'pending', assigneeId: null, version: t.version },
          'owner',
        )
      ).status,
    ).toBe(409);
    await req('/threads/' + t.id + '/read', 'POST', {}, 'owner');
    const owner: any = await (
        await req('/threads?source=site&unread=1', 'GET', undefined, 'owner')
      ).json(),
      admin: any = await (await req('/threads?source=site&unread=1')).json();
    expect(owner.total).toBe(0);
    expect(admin.total).toBe(1);
    await receive(email('later'), a);
    expect(
      db.sqlite.prepare('SELECT status FROM wr_inbox_threads WHERE id=?').get(t.id).status,
    ).toBe('pending');
  });
  it('legacy and opted-out records remain untracked, including previously allocated aliases', async () => {
    await enable();
    await trackedAddress(db, 'edm', 'recipient', 'body', 'subject');
    db.sqlite.exec('UPDATE edm_campaigns SET reply_tracking=0');
    expect(await trackedAddress(db, 'edm', 'recipient', 'body', 'subject')).toBeNull();
  });
  it('custom and empty reply destinations are tracked with immutable per-route forwarding snapshots', async () => {
    await enable();
    db.sqlite.exec("UPDATE edm_campaigns SET reply_to='codeisworld@gmail.com'");
    const address = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    expect(address).toContain('@reply.example.com');
    expect(db.sqlite.prepare('SELECT forward_to FROM wr_inbox_routes WHERE address=?').get(address).forward_to).toBe('codeisworld@gmail.com');
    expect(await (await resolveRoute(address)).json()).toEqual({ id: cfg.id, recipient: address, forwardTo: 'codeisworld@gmail.com' });
    db.sqlite.exec("UPDATE edm_campaigns SET reply_to='changed@example.net'");
    expect(await trackedAddress(db, 'edm', 'recipient', 'changed body', 'changed subject')).toBe(address);
    expect((await (await resolveRoute(address)).json() as any).forwardTo).toBe('codeisworld@gmail.com');
    const site = (await trackedAddress(db, 'site', 'target', 'form', 'subject'))!;
    expect((await (await resolveRoute(site)).json() as any).forwardTo).toBe('sales@work.example');
    db.sqlite.exec('DELETE FROM wr_inbox_routes; UPDATE edm_campaigns SET reply_to=NULL');
    const empty = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    expect((await (await resolveRoute(empty)).json() as any).forwardTo).toBe('sales@work.example');
  });
  it('allocates routes from confirmed outbox destinations instead of later campaign edits', async () => {
    await enable();
    db.sqlite.exec("UPDATE edm_campaigns SET reply_to='later-edit@example.net'");
    const frozen = (await trackedAddress(db, 'edm', 'recipient', 'confirmed body', 'confirmed subject', 'confirmed@example.net'))!;
    expect((await (await resolveRoute(frozen)).json() as any).forwardTo).toBe('confirmed@example.net');
    db.sqlite.exec('DELETE FROM wr_inbox_routes');
    const empty = (await trackedAddress(db, 'edm', 'recipient', 'confirmed body', 'confirmed subject', null))!;
    expect((await (await resolveRoute(empty)).json() as any).forwardTo).toBe('sales@work.example');
    db.sqlite.exec('UPDATE wr_inbox_configs SET enabled=0');
    expect(await trackedAddress(db, 'edm', 'recipient', 'body', 'subject', null)).toBeNull();
    // Stopping future tracking never prevents replies to a previously sent alias.
    expect((await (await resolveRoute(empty)).json() as any).forwardTo).toBe('sales@work.example');
  });
  it('never reuses a conflicting route owned by another workspace', async () => {
    await enable();
    db.sqlite.exec("INSERT INTO wr_inbox_configs(id,workspace_id,domain,forward_to,secret,created_at) VALUES('foreign-config','other','other.example.com','other@work.example','not-used','2026-10-09')");
    db.sqlite.exec("INSERT INTO wr_inbox_routes(id,config_id,workspace_id,source,business_id,target_id,address,created_at) VALUES('foreign-route','foreign-config','other','edm','foreign-campaign','recipient','reply+e-foreign@other.example.com','2026-10-09')");
    expect(await trackedAddress(db, 'edm', 'recipient', 'body', 'subject')).toBeNull();
  });
  it('route resolution is purpose-bound, time-limited and exact to receiving configuration and address', async () => {
    await enable();
    const address = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    expect((await resolveRoute(address, { secret: 'wrong' })).status).toBe(401);
    expect((await resolveRoute(address, { purpose: 'receive' })).status).toBe(401);
    expect((await resolveRoute(address, { time: String(Date.now() - 600000) })).status).toBe(401);
    expect((await resolveRoute(address, { signedTo: 'different@reply.example.com' })).status).toBe(401);
    expect((await resolveRoute('unknown@reply.example.com')).status).toBe(404);
    expect((await resolveRoute(address.replace('@reply.example.com', '@other.example.com'))).status).toBe(401);
    const other: any = await (await req('/configs', 'POST', { domain: 'other.example.com', forwardTo: 'other@work.example', trackEdm: true, trackSites: true, teamBody: false })).json();
    db.sqlite.prepare('UPDATE wr_inbox_configs SET workspace_id=? WHERE id=?').run('other', other.id);
    expect((await resolveRoute(address, { id: other.id, secret: other.secret })).status).toBe(401);
    db.sqlite.prepare('UPDATE wr_inbox_routes SET config_id=? WHERE address=?').run(other.id, address);
    expect((await resolveRoute(address)).status).toBe(404);
  });
  it('legacy routes resolve through their configuration and reject receiving-domain loops', async () => {
    await enable();
    const address = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    db.sqlite.prepare('UPDATE wr_inbox_routes SET forward_to=NULL WHERE address=?').run(address);
    expect((await (await resolveRoute(address)).json() as any).forwardTo).toBe('sales@work.example');
    db.sqlite.prepare('UPDATE wr_inbox_routes SET forward_to=? WHERE address=?').run('loop@reply.example.com', address);
    expect((await resolveRoute(address)).status).toBe(409);
    db.sqlite.exec("DELETE FROM wr_inbox_routes; UPDATE edm_campaigns SET reply_to='loop@reply.example.com'");
    await expect(trackedAddress(db, 'edm', 'recipient', 'body', 'subject')).rejects.toThrow('循环');
  });
  it('receiving forwarding failures retains the message without claiming a destination or verification', async () => {
    await enable();
    const address = (await trackedAddress(db, 'edm', 'recipient', 'body', 'subject'))!;
    expect((await receive(email('unresolved'), address, true, '', 'failed')).status).toBe(200);
    expect(db.sqlite.prepare("SELECT forward_to,forward_status FROM wr_inbox_messages WHERE message_id='<unresolved@client.example>'").get()).toMatchObject({ forward_to: '', forward_status: 'failed' });
    expect((await receive(email('bad-empty'), address, true, '', 'forwarded')).status).toBe(401);
    expect((await receive(email('bad-disabled'), address, true, '', 'disabled')).status).toBe(401);
    expect((await receive(email('custom-destination'), address, true, 'codeisworld@gmail.com')).status).toBe(200);
    expect(db.sqlite.prepare("SELECT forward_to,forward_status FROM wr_inbox_messages WHERE message_id='<custom-destination@client.example>'").get()).toMatchObject({ forward_to: 'codeisworld@gmail.com', forward_status: 'forwarded' });
  });
  it('all authenticated members see only active verified reply defaults', async () => {
    expect((await (await req('/configs', 'GET', undefined, 'owner')).json() as any).replyDefaults).toEqual({ trackingAvailable: false, forwardTo: null });
    await enable();
    expect((await (await req('/configs', 'GET', undefined, 'owner')).json() as any).replyDefaults).toEqual({ trackingAvailable: true, forwardTo: 'sales@work.example' });
    db.sqlite.exec('UPDATE wr_inbox_configs SET track_edm=0');
    expect((await (await req('/configs', 'GET', undefined, 'owner')).json() as any).replyDefaults).toEqual({ trackingAvailable: false, forwardTo: 'sales@work.example' });
    db.sqlite.exec('UPDATE wr_inbox_configs SET enabled=0');
    expect((await (await req('/configs', 'GET', undefined, 'owner')).json() as any).replyDefaults).toEqual({ trackingAvailable: false, forwardTo: null });
  });
});
