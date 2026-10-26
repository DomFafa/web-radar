import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import puppeteer from '@cloudflare/puppeteer';
import { d1 } from './sqlite';
import { handleSiteMessageQueue, type SiteMessageQueueMessage } from '../../src/outreach/server/queues/site-message.queue';
import type { Bindings } from '../../src/outreach/shared/types';

vi.mock('@cloudflare/puppeteer', () => ({ default: { launch: vi.fn() } }));

let sqlite: DatabaseSync;
let env: Bindings;
let browser: any;
let visited: string[];
let pages: any[];
const send = vi.fn();

beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of ['0007_outreach.sql', '0011_customer_inbox.sql', '0013_customer_management.sql', '0014_crm_activity_groups.sql']) {
    sqlite.exec(readFileSync(`migrations/${file}`, 'utf8'));
  }
  sqlite.exec('ALTER TABLE edm_site_message_jobs ADD COLUMN created_by TEXT;');
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('workspace','Test','test@example.com',0,0);
    INSERT INTO edm_site_message_jobs(id,user_id,name,sender_name,sender_email,message,status,created_at,updated_at)
    VALUES ('job','workspace','Inquiry','Test','test@example.com','Please send your catalog','running',0,0);`);
  visited = [];
  pages = [];
  browser = {
    newPage: vi.fn(async () => {
      const page = {
        setUserAgent: vi.fn(), setViewport: vi.fn(), setRequestInterception: vi.fn(), on: vi.fn(),
        goto: vi.fn(async (url: string) => { visited.push(url); return { status: () => 404 }; }),
        close: vi.fn(async () => {}),
      };
      pages.push(page);
      return page;
    }),
    close: vi.fn(async () => {}),
  };
  vi.mocked(puppeteer.launch).mockResolvedValue(browser);
  send.mockReset().mockResolvedValue(undefined);
  env = { DB: d1(sqlite), SITE_MESSAGE_QUEUE: { send } } as unknown as Bindings;
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected external request'); }));
});

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); sqlite.close(); });

function target(id: string, position: number, status = 'queued', resultCode: string | null = null) {
  sqlite.prepare(`INSERT INTO edm_site_message_targets(id,job_id,website_url,normalized_host,status,result_code,position,created_at,updated_at)
    VALUES (?,'job',?,?,?, ?,?,0,?)`).run(id, `https://${id}.example.com`, `${id}.example.com`, status, resultCode, position, Math.floor(Date.now() / 1000));
}

function delivery(attempts = 1) {
  const message = { body: { kind: 'site-message-runner', jobId: 'job' } satisfies SiteMessageQueueMessage, attempts, ack: vi.fn(), retry: vi.fn() };
  return { message, run: () => handleSiteMessageQueue({ messages: [message] } as unknown as MessageBatch<SiteMessageQueueMessage>, env) };
}

function states() {
  return sqlite.prepare('SELECT id,status,result_code FROM edm_site_message_targets ORDER BY position').all();
}

test('a failed continuation retries the delivery, then processes only remaining queued targets', async () => {
  for (let i = 0; i < 5; i++) target(`target${i}`, i);
  target('sent', 5, 'submitted', 'confirmed');
  target('uncertain', 6, 'skipped', 'submission_uncertain');
  sqlite.exec(`INSERT INTO wr_crm_outbound_snapshots(id,workspace_id,source,business_id,target_id,attempt_id,status,created_at)
    VALUES ('receipt','workspace','site','job','sent','original','submitted','2026-10-24');`);
  send.mockRejectedValueOnce(new Error('Queue temporarily unavailable'));
  const first = delivery();
  await first.run();
  expect(first.message.ack).not.toHaveBeenCalled();
  expect(first.message.retry).toHaveBeenCalledExactlyOnceWith({ delaySeconds: 30 });
  expect(visited).toEqual(Array.from({ length: 4 }, (_, i) => `https://target${i}.example.com`));
  expect(states()).toEqual([
    ...Array.from({ length: 4 }, (_, i) => ({ id: `target${i}`, status: 'failed', result_code: 'http_404' })),
    { id: 'target4', status: 'queued', result_code: null },
    { id: 'sent', status: 'submitted', result_code: 'confirmed' },
    { id: 'uncertain', status: 'skipped', result_code: 'submission_uncertain' },
  ]);
  expect(browser.close).toHaveBeenCalledTimes(1);
  expect(pages.every(page => page.close.mock.calls.length === 1)).toBe(true);
  const second = delivery(2);
  await second.run();
  expect(second.message.ack).toHaveBeenCalledTimes(1);
  expect(second.message.retry).not.toHaveBeenCalled();
  expect(visited).toEqual(Array.from({ length: 5 }, (_, i) => `https://target${i}.example.com`));
  expect(send).toHaveBeenCalledTimes(1);
  expect(sqlite.prepare('SELECT status FROM edm_site_message_jobs').get()?.status).toBe('completed');
  expect(sqlite.prepare('SELECT target_id,attempt_id,status FROM wr_crm_outbound_snapshots').all()).toEqual([{ target_id: 'sent', attempt_id: 'original', status: 'submitted' }]);
  const duplicate = delivery(3);
  await duplicate.run();
  expect(duplicate.message.ack).toHaveBeenCalledTimes(1);
  expect(browser.newPage).toHaveBeenCalledTimes(5);
  expect(send).toHaveBeenCalledTimes(1);
  expect(globalThis.fetch).not.toHaveBeenCalled();
});

test('a successful continuation is awaited before acknowledging and delayed ten seconds', async () => {
  for (let i = 0; i < 5; i++) target(`target${i}`, i);
  const current = delivery();
  send.mockImplementationOnce(async () => { expect(current.message.ack).not.toHaveBeenCalled(); });
  await current.run();
  expect(send).toHaveBeenCalledExactlyOnceWith({ kind: 'site-message-runner', jobId: 'job' }, { delaySeconds: 10 });
  expect(current.message.ack).toHaveBeenCalledTimes(1);
  expect(current.message.retry).not.toHaveBeenCalled();
  expect(sqlite.prepare("SELECT status FROM edm_site_message_targets WHERE id='target4'").get()?.status).toBe('queued');
});

test('pausing between continuation failure and redelivery leaves remaining targets untouched', async () => {
  for (let i = 0; i < 5; i++) target(`target${i}`, i);
  send.mockRejectedValueOnce(new Error('Queue temporarily unavailable'));
  const first = delivery();
  await first.run();
  expect(first.message.retry).toHaveBeenCalledExactlyOnceWith({ delaySeconds: 30 });
  sqlite.exec("UPDATE edm_site_message_jobs SET status='paused'");
  const retry = delivery(2);
  await retry.run();
  expect(retry.message.ack).toHaveBeenCalledTimes(1);
  expect(retry.message.retry).not.toHaveBeenCalled();
  expect(visited).toHaveLength(4);
  expect(send).toHaveBeenCalledTimes(1);
  expect(sqlite.prepare("SELECT status FROM edm_site_message_targets WHERE id='target4'").get()?.status).toBe('queued');
});

test('redelivery preserves active submissions and quarantines stale uncertain submissions without visiting them', async () => {
  target('current', 0, 'submitting');
  target('stale', 1, 'submitting');
  sqlite.prepare("UPDATE edm_site_message_targets SET updated_at=? WHERE id='stale'").run(Math.floor(Date.now() / 1000) - 360);
  target('queued', 2);
  const current = delivery(2);
  await current.run();
  expect(current.message.ack).toHaveBeenCalledTimes(1);
  expect(visited).toEqual(['https://queued.example.com']);
  expect(states()).toEqual([
    { id: 'current', status: 'submitting', result_code: null },
    { id: 'stale', status: 'skipped', result_code: 'submission_uncertain' },
    { id: 'queued', status: 'failed', result_code: 'http_404' },
  ]);
  expect(send).not.toHaveBeenCalled();
  expect(globalThis.fetch).not.toHaveBeenCalled();
});
