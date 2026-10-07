import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { d1 } from './sqlite';
import { emptyDraft } from '../../src/outreach/server/lib/assistant';
import { generateAssistantDraft } from '../../src/outreach/server/lib/assistant-ai';
import { safeAssistantHtml } from '../../src/outreach/server/lib/assistant-content';
import type { Bindings } from '../../src/outreach/shared/types';

let sqlite: DatabaseSync, env: Bindings;
const options = { groups: [{ id: 'buyers', name: 'Existing buyers', contactCount: 5 }], tags: ['vip'] };
beforeEach(() => {
  sqlite = new DatabaseSync(':memory:');
  for (const file of readdirSync('migrations').filter(f => f.endsWith('.sql')).sort()) sqlite.exec(readFileSync('migrations/' + file, 'utf8'));
  env = { DB: d1(sqlite), TEXT_API_BASE_URL: 'https://text.example.com/v1', TEXT_API_KEY: 'secret-unit-test-key', TEXT_MODEL: 'unit-test-model', TEST_MODE: false } as unknown as Bindings;
});
afterEach(() => { sqlite.close(); vi.unstubAllGlobals(); });
const mockReply = (data: unknown) => vi.stubGlobal('fetch', vi.fn(async () => Response.json({ choices: [{ message: { content: JSON.stringify(data) } }] })));

test('structured generation can update both content channels without acquiring send authority', async () => {
  mockReply({ message: '已生成草稿，请确认对象和内容。', draft: { channels: ['email', 'site'], brief: 'Introduce a sample',
    email: { subject: 'A sample for your team', bodyHtml: '<p>Hello</p><script>bad()</script><img src="https://track.example">', bodyText: 'Hello' },
    site: { message: 'Hello, would your team like a sample?' } } });
  const result = await generateAssistantDraft(env, 'w', emptyDraft(), [], 'Please introduce our sample by email and website message', options);
  expect(result.draft.channels).toEqual(['email', 'site']); expect(result.draft.email.bodyHtml).toBe('<p>Hello</p>');
  expect(result.draft.site.message).toBe('Hello, would your team like a sample?');
  expect(sqlite.prepare('SELECT count(*) n FROM edm_campaigns').get()!.n).toBe(0);
});

test('platform requests use the Workers-supported redirect policy and reject redirects', async () => {
  const fetchMock = vi.fn(async (_url: unknown, init?: RequestInit) => {
    if (init?.redirect === 'error') throw new TypeError('Workers does not support redirect:error');
    return Response.json({ choices: [{ message: { content: JSON.stringify({ message: 'Draft', draft: {} }) } }] });
  });
  vi.stubGlobal('fetch', fetchMock);
  await generateAssistantDraft(env, 'w', emptyDraft(), [], 'Hello', options);
  expect(fetchMock.mock.calls[0][1]?.redirect).toBe('manual');

  fetchMock.mockImplementation(async () => new Response(null, { status: 302, headers: { Location: 'https://other.example.com' } }));
  await expect(generateAssistantDraft(env, 'w', emptyDraft(), [], 'Hello', options)).rejects.toMatchObject({ code: 'ai_generation_failed' });
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('the model cannot invent an audience, sender address or target website', async () => {
  mockReply({ message: 'Draft', draft: { sender: { email: 'invented@example.com', name: 'Invented Seller', company: 'Invented Company' }, email: { contactIds: ['unknown'], groupId: 'buyers', replyTracking: true }, site: { targets: ['https://unknown.example'], replyTracking: true } }, audience: { groupId: 'buyers', tag: 'vip' }, websites: ['https://unknown.example'] });
  const result = await generateAssistantDraft(env, 'w', emptyDraft(['email']), [], 'Make the wording shorter', options);
  expect(result.draft.sender.email).toBe(''); expect(result.draft.email.contactIds).toEqual([]);
  expect(result.draft.email.groupId).toBe(''); expect(result.draft.email.tag).toBe(''); expect(result.draft.site.targets).toEqual([]);
  expect(result.draft.sender.name).toBe(''); expect(result.draft.sender.company).toBe('');
  expect(result.draft.email.replyTracking).toBe(false); expect(result.draft.site.replyTracking).toBe(false);
});

test('an email domain is not explicit authorization to add its website as a target', async () => {
  mockReply({ message: 'Draft', draft: {}, websites: ['https://sender.example.com'] });
  const result = await generateAssistantDraft(env, 'w', emptyDraft(['site']), [], 'My email is sales@sender.example.com', options);
  expect(result.draft.site.targets).toEqual([]);
});

test('an AI channel change cannot restore an old target or content from the inactive channel', async () => {
  const draft = emptyDraft(['email']);
  draft.brief = 'Old email proposal';
  draft.email = { ...draft.email, subject: 'Old email', bodyHtml: '<p>Old email body</p>', bodyText: 'Old email body', groupId: 'buyers' };
  draft.site = { ...draft.site, subject: 'Old site subject', message: 'An earlier website inquiry', targets: ['https://old-buyer.example.com/contact'] };
  mockReply({ message: 'Prepared a new website message', draft: { channels: ['site'], site: { message: 'May we share a new catalog with your team?' } } });
  const result = await generateAssistantDraft(env, 'w', draft, [], 'Use only website messages this time', options);
  expect(result.draft.site).toEqual({ subject: '', message: 'May we share a new catalog with your team?', targets: [], replyTracking: false });
  expect(result.draft.email).toMatchObject({ subject: '', bodyHtml: '', bodyText: '', groupId: '', contactIds: [] });
  expect(result.draft.brief).toBe('');
});

test('an explicit recipient not in contacts clears the previous group instead of confirming the old audience', async () => {
  const draft = emptyDraft(['email']); draft.email.groupId = 'buyers';
  mockReply({ message: 'Prepared', draft: {}, audience: { emails: ['new-buyer@example.com'] } });
  const result = await generateAssistantDraft(env, 'w', draft, [], 'This time only send to new-buyer@example.com', options);
  expect(result.draft.email).toMatchObject({ groupId: '', tag: '', contactIds: [] });
  expect(result.content).toContain('new-buyer@example.com');
});

test('malformed, overlong and action-bearing model outputs fail without exposing provider details', async () => {
  for (const data of [{ message: 'Sent', draft: {}, send: true }, { message: 'x', draft: { site: { message: 'a'.repeat(5001) } } }]) {
    mockReply(data); await expect(generateAssistantDraft(env, 'w', emptyDraft(), [], 'Hello', options)).rejects.toMatchObject({ code: 'ai_generation_failed' });
  }
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('secret-unit-test-key'); }));
  await expect(generateAssistantDraft(env, 'w', emptyDraft(), [], 'Hello', options)).rejects.not.toThrow('secret-unit-test-key');
});

test('HTML cleanup removes active content and unsafe links but retains readable email text', () => {
  expect(safeAssistantHtml('<p onclick="bad()">Hi <b>Buyer</b><a href="javascript:alert(1)">bad link</a><a href="https://example.com" onclick="bad()">visit</a></p><iframe src="https://x"></iframe>'))
    .toBe('<p>Hi <b>Buyer</b><a>bad link</a><a href="https://example.com">visit</a></p>');
});
