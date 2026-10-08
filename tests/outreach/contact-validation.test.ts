import { afterEach, beforeEach, expect, test } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { Hono } from 'hono';
import { contactRoutes } from '../../src/outreach/server/routes/contact.routes';
import { d1 } from './sqlite';

let sqlite: DatabaseSync;
let app: Hono<any>;
const request = (path: string, method = 'POST', body?: unknown, userId = 'u', role = 'member') => app.request('/contacts' + path, {
  method, headers: { 'Content-Type': 'application/json', 'x-user': userId, 'x-role': role },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
}, { DB: d1(sqlite) });

beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync('migrations/0007_outreach.sql', 'utf8'));
  sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES
    ('u','User','user@example.com',0,0), ('other','Other','other@example.com',0,0);
    INSERT INTO edm_contact_groups(id,user_id,name,created_at,updated_at) VALUES
    ('own-group','u','Customers',0,0), ('foreign-group','other','Private',0,0);
    INSERT INTO edm_contacts(id,user_id,email,name,created_at,updated_at) VALUES
    ('contact','u','customer@example.com','Customer',0,0);`);
  app = new Hono<any>();
  app.use('*', async (c, next) => {
    c.set('user', { id: c.req.header('x-user') || 'u', role: c.req.header('x-role') || 'member' });
    await next();
  });
  app.route('/contacts', contactRoutes);
});
afterEach(() => sqlite.close());

test.each(['not-an-email', 'customer@nodot', 'customer @example.com', 123, null])('rejects invalid manual contact email %s before creating a row', async email => {
  const response = await request('', 'POST', { email, groupId: 'own-group' });
  expect(response.status).toBe(400);
  expect(sqlite.prepare("SELECT count(*) n FROM edm_contacts WHERE user_id='u'").get()!.n).toBe(1);
  expect(sqlite.prepare("SELECT contact_count n FROM edm_contact_groups WHERE id='own-group'").get()!.n).toBe(0);
});

test('accepts a normalized valid address and preserves duplicate rejection', async () => {
  const response = await request('', 'POST', { email: '  Sales+Buyer@Example.com  ', groupId: 'own-group' });
  expect(response.status).toBe(201);
  const contact = (await response.json() as any).data;
  expect(contact.email).toBe('sales+buyer@example.com'); expect(contact.groupId).toBe('own-group');
  expect((await request('', 'POST', { email: 'SALES+BUYER@example.com' })).status).toBe(409);
});

test('an invalid address included in a contact edit is rejected without changing its other fields', async () => {
  const response = await request('/contact', 'PUT', { email: 'invalid', name: 'Changed', groupId: 'own-group' });
  expect(response.status).toBe(400);
  expect(sqlite.prepare("SELECT email,name,group_id FROM edm_contacts WHERE id='contact'").get())
    .toEqual({ email: 'customer@example.com', name: 'Customer', group_id: null });
  expect(sqlite.prepare("SELECT contact_count n FROM edm_contact_groups WHERE id='own-group'").get()!.n).toBe(0);
});

test('ordinary contact edits keep the address unchanged and still allow clearing its group', async () => {
  expect((await request('/contact', 'PUT', { name: 'Changed', groupId: 'own-group' })).status).toBe(200);
  expect((await request('/contact', 'PUT', { email: 'customer@example.com', groupId: '' })).status).toBe(200);
  expect(sqlite.prepare("SELECT email,name,group_id FROM edm_contacts WHERE id='contact'").get())
    .toEqual({ email: 'customer@example.com', name: 'Changed', group_id: null });
  expect(sqlite.prepare("SELECT contact_count n FROM edm_contact_groups WHERE id='own-group'").get()!.n).toBe(0);
});

test.each(['POST', 'PUT'])('keeps the existing workspace group guard for %s contact requests', async method => {
  const response = await request(method === 'POST' ? '' : '/contact', method, { email: 'valid@example.com', name: 'Changed', groupId: 'foreign-group' });
  expect(response.status).toBe(404);
  expect(sqlite.prepare("SELECT count(*) n FROM edm_contacts WHERE user_id='u'").get()!.n).toBe(1);
  expect(sqlite.prepare("SELECT name,group_id FROM edm_contacts WHERE id='contact'").get())
    .toEqual({ name: 'Customer', group_id: null });
  expect(sqlite.prepare("SELECT contact_count n FROM edm_contact_groups WHERE id='foreign-group'").get()!.n).toBe(0);
});

test('a viewer cannot create a contact even with a valid email and owned group', async () => {
  expect((await request('', 'POST', { email: 'valid@example.com', groupId: 'own-group' }, 'u', 'viewer')).status).toBe(403);
  expect(sqlite.prepare("SELECT count(*) n FROM edm_contacts WHERE user_id='u'").get()!.n).toBe(1);
});

test('imports deduplicate only inside the target workspace and overwrites preserve subscription status', async () => {
  sqlite.exec("INSERT INTO edm_contacts(id,user_id,email,name,group_id,created_at,updated_at) VALUES('other-contact','other','shared@example.com','Private customer','foreign-group',0,0)");
  const imported = await request('/import', 'POST', { groupId: 'own-group', contacts: [
    { email: 'shared@example.com', name: 'Workspace customer' },
    { email: 'CUSTOMER@example.com' },
    { email: 'new@example.com' },
    { email: 'NEW@example.com' },
  ] });
  expect(imported.status).toBe(200);
  expect((await imported.json() as any).data).toEqual({ imported: 2, updated: 0, skipped: 2, failed: 0, total: 4 });
  sqlite.exec("UPDATE edm_contacts SET subscription_status='unsubscribed' WHERE user_id='u' AND email='shared@example.com'");
  const overwritten = await request('/import', 'POST', { overwrite: true, groupId: 'own-group',
    contacts: [{ email: 'shared@example.com', name: 'Updated customer' }] });
  expect(overwritten.status).toBe(200);
  expect((await overwritten.json() as any).data).toEqual({ imported: 0, updated: 1, skipped: 0, failed: 0, total: 1 });
  expect(sqlite.prepare("SELECT name,subscription_status FROM edm_contacts WHERE user_id='u' AND email='shared@example.com'").get())
    .toEqual({ name: 'Updated customer', subscription_status: 'unsubscribed' });
  expect(sqlite.prepare("SELECT name,group_id FROM edm_contacts WHERE id='other-contact'").get())
    .toEqual({ name: 'Private customer', group_id: 'foreign-group' });
  expect(sqlite.prepare("SELECT contact_count n FROM edm_contact_groups WHERE id='own-group'").get()!.n).toBe(2);
});
