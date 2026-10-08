import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { d1 } from './sqlite';
import { emptyDraft, mergeDraft } from '../../src/outreach/server/lib/assistant';
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

test('compose clarification explicitly stays needs_facts even when the old email is nonempty', async () => {
  const draft = emptyDraft(['email']);
  draft.email = { ...draft.email, subject: 'Hello', bodyHtml: '<p>hello</p>', bodyText: 'hello' };
  mockReply({ message: '请告诉我具体产品和希望客户采取的行动。', draftingStatus: 'needs_facts', draft: {} });
  const result = await generateAssistantDraft(env, 'w', draft, [], '请起草邮件', options, ['email']);
  expect(result.draftingStatus).toBe('needs_facts');
  expect(result.draftingChannels).toEqual(['email']);
  expect(result.draft.email).toEqual(draft.email);
});

test('compose partial clarification does not replace old string fields with undefined', async () => {
  const draft = emptyDraft(['email', 'site']);
  draft.email = { ...draft.email, subject: 'Existing email', bodyHtml: '<p>Existing email body</p>', bodyText: 'Existing email body' };
  draft.site = { ...draft.site, subject: 'Existing site subject', message: 'An existing website inquiry' };
  for (const channel of ['email', 'site'] as const) {
    mockReply({ message: '请补充产品资料。', draftingStatus: 'needs_facts', draft: { [channel]: { subject: 'Partial subject' } } });
    const result = await generateAssistantDraft(env, 'w', draft, [], '请帮我起草', options, [channel]);
    expect(result.draft).toEqual(draft); expect(result.draftingStatus).toBe('needs_facts');
  }
});

test('compose ready must explicitly supply the full requested content instead of completing it from old fields', async () => {
  const draft = emptyDraft(['email', 'site']);
  draft.email = { ...draft.email, subject: 'Hello', bodyHtml: '<p>hello</p>', bodyText: 'hello' };
  for (const output of [
    { draftingStatus: 'ready', draft: {} },
    { draftingStatus: 'ready', draft: { email: { subject: 'New subject' } } },
    { draftingStatus: 'ready', draft: { email: { subject: 'New subject', bodyHtml: '<p><br></p>', bodyText: '' } } },
    { draft: { email: { subject: 'New subject', bodyHtml: '<p>Would you like a sample?</p>' } } },
  ]) {
    mockReply({ message: '已准备好。', ...output });
    await expect(generateAssistantDraft(env, 'w', draft, [], '请起草邮件', options, ['email'])).rejects.toMatchObject({ code: 'ai_generation_failed' });
  }
  mockReply({ message: '已准备好。', draftingStatus: 'ready', draft: { email: { subject: 'New subject', bodyHtml: '<p>Would you like a sample?</p>' } } });
  await expect(generateAssistantDraft(env, 'w', draft, [], '请起草邮件和留言', options, ['email', 'site'])).rejects.toMatchObject({ code: 'ai_generation_failed' });
});

test('compose updates only the requested channel content and cannot change sender, recipients or the other channel', async () => {
  const draft = emptyDraft(['email', 'site']);
  draft.sender = { ...draft.sender, name: 'Seller', email: 'sales@example.com' };
  draft.email = { ...draft.email, groupId: 'buyers', replyTo: 'reply@example.com', sendRate: 12 };
  draft.site = { ...draft.site, targets: ['https://old.example.com/contact'], subject: 'Previous site subject', message: 'An existing website inquiry' };
  mockReply({ message: '邮件已起草，请预览。', draftingStatus: 'ready', draftingChannels: ['site'],
    draft: { channels: ['site'], language: 'zh', sender: { name: 'Other', email: 'other@example.com' },
      email: { subject: 'A sample invitation', bodyHtml: '<p>Would you like a sample?</p><img src="https://track.example">', bodyText: 'Would you like a sample?', replyTo: 'other@example.com', sendRate: 100 },
      site: { subject: 'Replaced site subject', message: 'A different website inquiry' } },
    audience: { tag: 'vip' }, websites: ['https://new.example.com/contact'] });
  const result = await generateAssistantDraft(env, 'w', draft, [], 'Other other@example.com vip https://new.example.com/contact', options, ['email']);
  expect(result.draftingStatus).toBe('ready'); expect(result.draftingChannels).toEqual(['email']);
  expect(result.draft.channels).toEqual(draft.channels); expect(result.draft.language).toBe('en');
  expect(result.draft.sender).toEqual(draft.sender); expect(result.draft.site).toEqual(draft.site);
  expect(result.draft.email).toEqual({ ...draft.email, subject: 'A sample invitation', bodyHtml: '<p>Would you like a sample?</p>', bodyText: 'Would you like a sample?' });
});

test('compose site content does not replace an existing email and exposes the requested channel to the model', async () => {
  const draft = emptyDraft(['email', 'site']);
  draft.email = { ...draft.email, subject: 'Email snapshot', bodyHtml: '<p>Keep this email</p>' };
  mockReply({ message: '网站留言已起草。', draftingStatus: 'ready', draft: { email: { subject: 'Do not apply' }, site: { message: 'Would your team like a catalog?' } } });
  const result = await generateAssistantDraft(env, 'w', draft, [], '请起草网站留言', options, ['site']);
  expect(result.draftingChannels).toEqual(['site']); expect(result.draft.email).toEqual(draft.email);
  expect(result.draft.site.message).toBe('Would your team like a catalog?');
  const payload = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
  expect(JSON.parse(payload.messages[1].content).composeChannels).toEqual(['site']);
});

test('legacy chat marks ready only for the channel whose valid content actually changed', async () => {
  const draft = emptyDraft(['email', 'site']);
  draft.email = { ...draft.email, subject: 'Old subject', bodyHtml: '<p>Would you like a sample?</p>' };
  draft.site.message = 'An existing website message';
  mockReply({ message: '已修改主题。', draft: { email: { subject: 'Updated subject' } } });
  const result = await generateAssistantDraft(env, 'w', draft, [], 'Please change the email subject', options);
  expect(result.draftingStatus).toBe('ready'); expect(result.draftingChannels).toEqual(['email']);
  mockReply({ message: '请补充具体产品。', draft: {} });
  const followup = await generateAssistantDraft(env, 'w', draft, [], 'Hello', options);
  expect(followup.draftingStatus).toBeUndefined(); expect(followup.draftingChannels).toEqual([]);
});

test('template metadata survives unchanged content but content changes remove it and AI cannot set it', async () => {
  const draft = emptyDraft(['email']);
  draft.email = { ...draft.email, subject: 'Template subject', bodyHtml: '<p>Saved copy</p>', templateId: 'saved-template' };
  expect(mergeDraft(draft, { sender: { name: 'Seller' } }).email.templateId).toBe('saved-template');
  expect(mergeDraft(draft, { email: { subject: 'Template subject' } }).email.templateId).toBe('saved-template');
  expect(mergeDraft(draft, { email: { subject: 'Changed' } }).email.templateId).toBeUndefined();
  expect(mergeDraft(draft, { email: { bodyHtml: '<p>Changed body</p>' } }).email.templateId).toBeUndefined();
  mockReply({ message: 'Draft', draft: { email: { templateId: 'forged-template' } } });
  await expect(generateAssistantDraft(env, 'w', draft, [], 'Hello', options)).rejects.toMatchObject({ code: 'ai_generation_failed' });
});
