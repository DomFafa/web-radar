import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { d1 } from './sqlite';
import {
  emailSendDelay,
  deferEmail,
  resendCooldown,
  validSendRate,
  pausedCampaignPacingReset,
} from '../../src/outreach/server/lib/email-pacing';
let sqlite: DatabaseSync, db: D1Database;
beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  for (const f of ['0007_outreach.sql', '0008_resend_tracking.sql', '0009_email_scheduling.sql'])
    sqlite.exec(readFileSync('migrations/' + f, 'utf8'));
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','test','test@example.com',0,0);
 INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','test@example.com',0,0);
 INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,created_at,updated_at) VALUES ('c','u','Test','test@example.com','Test',0,0),('other','u','Test','test@example.com','Test',0,0);`);
  for (let i = 0; i < 210; i++)
    sqlite
      .prepare(
        "INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,created_at) VALUES (?,'c','contact',0)",
      )
      .run('r' + i);
  db = d1(sqlite) as any;
});
afterEach(() => {
  sqlite.close();
  vi.restoreAllMocks();
});
test('50/minute reserves 1200ms slots across concurrent batches and survives redelivery', async () => {
  const delays = await Promise.all(
    Array.from({ length: 51 }, (_, i) => emailSendDelay(db, 'r' + i, 'c', 50, true, 100000)),
  );
  expect(delays).toEqual(Array.from({ length: 51 }, (_, i) => i * 1200));
  expect(await emailSendDelay(db, 'r50', 'c', 50, true, 100000)).toBe(60000);
  const accepted: number[] = [];
  for (let i = 1; i < 51; i++)
    if ((await emailSendDelay(db, 'r' + i, 'c', 50, true, 100000 + i * 1200)) === 0)
      accepted.push(i);
  expect(accepted).toHaveLength(50);
  expect(sqlite.prepare('SELECT count(*) n FROM edm_email_schedule').get()!.n).toBe(51);
});
test('late delivery cannot catch up in a burst; separate campaigns share Resend ceiling', async () => {
  await emailSendDelay(db, 'r0', 'c', 200, true, 100000);
  expect(await emailSendDelay(db, 'r1', 'other', 200, true, 100000)).toBe(250);
  expect(await emailSendDelay(db, 'r2', 'c', 200, true, 100000)).toBe(500);
  expect(await emailSendDelay(db, 'r1', 'other', 200, true, 110000)).toBe(0);
  expect(await emailSendDelay(db, 'r2', 'c', 200, true, 110000)).toBeGreaterThan(0);
});
test('200/minute uses 300ms campaign slots without the obsolete 120/minute Resend cap', async () => {
  const delays = [];
  for (let i = 0; i <= 200; i++) delays.push(await emailSendDelay(db, 'r' + i, 'c', 200, true, 100000));
  expect(delays).toEqual(Array.from({ length: 201 }, (_, i) => i * 300));
  for (let i = 1; i < 200; i++) expect(await emailSendDelay(db, 'r' + i, 'c', 200, true, 100000 + i * 300)).toBe(0);
});

test('paused rate reset preserves other campaigns, existing attempts and the shared cooldown atomically', async () => {
  sqlite.exec(`UPDATE edm_campaigns SET status='paused',send_rate=50 WHERE id='c';
    UPDATE edm_campaign_recipients SET status='sending' WHERE id IN ('r0','r1');
    INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,created_at) VALUES ('other-r','other','contact',0);
    INSERT INTO edm_email_send_attempts(recipient_id,started_at) VALUES ('r1',90000);
    INSERT INTO edm_email_schedule VALUES ('r0',900000),('r1',400000),('other-r',500000);
    INSERT INTO edm_email_clocks(id,next_at) VALUES ('reserve:campaign:c',901200),('reserve:account:resend',900500),
      ('dispatch:campaign:c',100300),('dispatch:account:resend',600000),('reserve:campaign:other',501200);`);
  const reset = () => [...pausedCampaignPacingReset(db, 'c', 50, 100000),
    db.prepare("UPDATE edm_campaigns SET send_rate=200 WHERE id='c' AND status='paused' AND send_rate=50")];
  const result = await db.batch(reset());
  expect(result.at(-1)!.meta.changes).toBe(1);
  expect(sqlite.prepare("SELECT status,send_rate FROM edm_campaigns WHERE id='c'").get()).toEqual({ status: 'paused', send_rate: 200 });
  expect(sqlite.prepare('SELECT * FROM edm_email_schedule ORDER BY recipient_id').all()).toEqual([
    { recipient_id: 'other-r', due_at: 500000 }, { recipient_id: 'r1', due_at: 400000 },
  ]);
  expect(sqlite.prepare("SELECT next_at FROM edm_email_clocks WHERE id='reserve:campaign:c'").get()!.next_at).toBe(100300);
  expect(sqlite.prepare("SELECT next_at FROM edm_email_clocks WHERE id='reserve:account:resend'").get()!.next_at).toBe(600000);
  expect(sqlite.prepare("SELECT next_at FROM edm_email_clocks WHERE id='reserve:campaign:other'").get()!.next_at).toBe(501200);
  expect(sqlite.prepare('SELECT COUNT(*) n FROM edm_email_send_attempts').get()!.n).toBe(1);
  const before = sqlite.prepare('SELECT * FROM edm_email_clocks ORDER BY id').all();
  expect((await db.batch(reset())).at(-1)!.meta.changes).toBe(0);
  expect(sqlite.prepare('SELECT * FROM edm_email_clocks ORDER BY id').all()).toEqual(before);
});

test('a rate reset rolls back its schedule changes if the configuration update fails', async () => {
  sqlite.exec(`UPDATE edm_campaigns SET status='paused' WHERE id='c'; INSERT INTO edm_email_schedule VALUES ('r0',900000);`);
  await expect(db.batch([...pausedCampaignPacingReset(db, 'c', 50, 100000),
    db.prepare("UPDATE edm_campaigns SET nonexistent_column=1 WHERE id='c'")])).rejects.toThrow();
  expect(sqlite.prepare('SELECT * FROM edm_email_schedule').get()).toEqual({ recipient_id: 'r0', due_at: 900000 });
  expect(sqlite.prepare("SELECT status,send_rate FROM edm_campaigns WHERE id='c'").get()).toEqual({ status: 'paused', send_rate: 50 });
});
test('cooldown prevents future dispatch across campaigns and normal delay does not use failure retries', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(100000);
  await resendCooldown(db, 37);
  expect(await emailSendDelay(db, 'r0', 'c', 50, true, 100000)).toBe(37000);
  const message = { body: { recipientId: 'r0' }, ack: vi.fn(), retry: vi.fn() },
    send = vi.fn();
  await deferEmail({ EMAIL_QUEUE: { send } }, message, 37001);
  expect(send).toHaveBeenCalledWith(message.body, { delaySeconds: 38 });
  expect(message.ack).toHaveBeenCalledOnce();
  expect(message.retry).not.toHaveBeenCalled();
  message.ack.mockClear();
  send.mockRejectedValueOnce(Error('queue offline'));
  await expect(deferEmail({ EMAIL_QUEUE: { send } }, message, 1000)).rejects.toThrow(
    'queue offline',
  );
  expect(message.ack).not.toHaveBeenCalled();
});
test('invalid rates are rejected; reservations longer than queue delay limit stay deferred', async () => {
  for (const n of [0, -1, 201, 1.2, NaN, '50', null]) expect(validSendRate(n)).toBe(false);
  expect(validSendRate(50)).toBe(true);
  const send = vi.fn(),
    message = { body: {}, ack: vi.fn(), retry: vi.fn() };
  await deferEmail({ EMAIL_QUEUE: { send } }, message, 90000000);
  expect(send).toHaveBeenCalledWith({}, { delaySeconds: 86400 });
});
