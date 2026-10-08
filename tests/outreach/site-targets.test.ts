import { afterEach, expect, test } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { Hono } from 'hono';
import { d1 } from './sqlite';
import { siteMessageRoutes } from '../../src/outreach/server/routes/site-message.routes';

const databases: DatabaseSync[] = [];
afterEach(() => databases.splice(0).forEach(database => database.close()));

function fixture() {
  const sqlite = new DatabaseSync(':memory:');
  databases.push(sqlite);
  sqlite.exec(readFileSync('migrations/0007_outreach.sql', 'utf8'));
  sqlite.exec(readFileSync('migrations/0011_customer_inbox.sql', 'utf8'));
  sqlite.exec('ALTER TABLE edm_site_message_jobs ADD COLUMN created_by TEXT;');
  sqlite.exec("INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('workspace','Test','test@example.com',0,0)");
  const queued: unknown[] = [];
  const app = new Hono<any>();
  app.use('*', async (c, next) => { c.set('user', { id: 'workspace', actorId: 'actor', role: 'admin', teamRead: true }); await next(); });
  app.route('/site-messages', siteMessageRoutes);
  const create = (targets: unknown) => app.request('/site-messages', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Partner inquiry', senderName: 'Test', senderEmail: 'test@example.com', message: 'Hello from our team', targets, authorized: true }),
  }, { DB: d1(sqlite), SITE_MESSAGE_QUEUE: { send: async (message: unknown) => { queued.push(message); } } });
  const start = (id: string) => app.request(`/site-messages/${id}/start`, { method: 'POST' }, { DB: d1(sqlite), SITE_MESSAGE_QUEUE: { send: async (message: unknown) => { queued.push(message); } } });
  return { create, start, queued, sqlite };
}

test('creating a site draft reports normalized duplicates and invalid URLs without starting it', async () => {
  const { create, queued, sqlite } = fixture();
  const response = await create(['Example.com/contact#details', 'https://www.example.com/about', 'localhost', 'https://10.0.0.1']);
  expect(response.status).toBe(201);
  const body = await response.json() as any;
  expect(body.meta).toEqual({ accepted: 1, duplicates: ['https://www.example.com/about'], invalid: ['localhost', 'https://10.0.0.1'] });
  expect(body.data.status).toBe('draft');
  expect(queued).toEqual([]);
  expect(sqlite.prepare('SELECT website_url, normalized_host FROM edm_site_message_targets').all()).toEqual([{ website_url: 'https://example.com/contact', normalized_host: 'example.com' }]);
});

test('only public HTTP sites can be prepared, including blocking private IPv4-mapped IPv6', async () => {
  const { create } = fixture();
  const invalid = ['http://[::ffff:127.0.0.1]', 'http://[::]', 'http://sub.localhost', 'ftp://example.com', 'https://user:password@example.com', 'not-a-public-domain'];
  const response = await create(invalid);
  expect(response.status).toBe(400);
  expect((await response.json() as any).error).toBe('请至少提供一个有效的公网网站地址');
});

test('public domain names beginning fc or fd are not mistaken for IPv6', async () => {
  const { create } = fixture();
  const response = await create(['fc-example.com', 'fd-example.com']);
  expect(response.status).toBe(201);
  expect((await response.json() as any).meta.accepted).toBe(2);
});

test('the 500-domain limit applies after domain deduplication', async () => {
  const { create, queued } = fixture();
  const urls = Array.from({ length: 500 }, (_, i) => `https://site${i}.example.com/contact`);
  expect((await create([...urls, 'https://www.site0.example.com/other'])).status).toBe(201);
  expect((await create([...urls, 'https://extra.example.com'])).status).toBe(400);
  expect(queued).toEqual([]);
});

test('concurrent confirmations claim a site job once before resetting targets or queuing', async () => {
  const { create, start, queued } = fixture();
  const { data: job } = await (await create(['https://example.com'])).json() as any;
  const responses = await Promise.all([start(job.id), start(job.id)]);
  expect(responses.map(response => response.status).sort()).toEqual([200, 409]);
  expect(queued).toHaveLength(1);
});
