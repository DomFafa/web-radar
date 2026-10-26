import { it, expect, vi, afterEach } from 'vitest';
import { createHmac } from 'node:crypto';
import gateway from '../deploy/inbox-gateway/worker';
import { digest, sign } from '../src/worker/inbox/core';
const firstId = 'aaaa1111-1111-1111-1111-111111111111';
const secondId = 'bbbb2222-2222-2222-2222-222222222222';
afterEach(() => vi.restoreAllMocks());
function fixture() {
  const objects = new Map(),
    jobs: any[] = [];
  return {
    objects,
    jobs,
    env: {
      TARGETS: JSON.stringify({
        'reply.example.com': [
          {
            id: 'aaaa1111-1111-1111-1111-111111111111',
            endpoint: 'https://cloud.example/api/inbox/receive/' + firstId,
            secret: 'key-a',
            forwardTo: 'sales@example.com',
            default: true,
          },
          {
            id: 'bbbb2222-2222-2222-2222-222222222222',
            endpoint: 'https://server.example/api/inbox/receive/' + secondId,
            secret: 'key-b',
            forwardTo: 'sales@example.com',
          },
        ],
      }),
      RAW: {
        put: async (k: any, v: any, o: any) => objects.set(k, { ...o, arrayBuffer: async () => v }),
        get: async (k: any) => objects.get(k),
        delete: async (k: any) => objects.delete(k),
      },
      INGEST: { send: async (j: any) => jobs.push(j) },
    } as any,
  };
}
function mail(to: string) {
  return {
    to,
    from: 'customer@example.org',
    rawSize: 20,
    raw: new Blob(['Subject: Hi\r\n\r\nHello']).stream(),
    forward: vi.fn(async () => {}),
    setReject: vi.fn(),
  } as any;
}
it('same-domain traffic goes only to its originating instance and is signed', async () => {
  const { env, jobs, objects } = fixture(),
    fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
      if (String(url).includes('/resolve/')) {
        const headers = init!.headers as Record<string, string>;
        expect(url).toBe('https://server.example/api/inbox/resolve/' + secondId);
        expect(headers['X-Inbox-Signature']).toBe(createHmac('sha256', 'key-b').update(['inbox-route-resolve-v1', secondId, headers['X-Inbox-Time'], headers['X-Inbox-To']].join('\n')).digest('hex'));
        return Response.json({ id: secondId, recipient: headers['X-Inbox-To'], forwardTo: 'codeisworld@gmail.com' });
      }
      return Response.json({});
    });
  const m = mail('reply+e2-bbbb22222222-' + 'a'.repeat(32) + '@reply.example.com');
  await gateway.email(m, env);
  expect(jobs).toHaveLength(1);
  expect(m.forward).toHaveBeenCalledExactlyOnceWith('codeisworld@gmail.com');
  const ack = vi.fn(),
    retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect(fetch.mock.calls[1][0]).toBe('https://server.example/api/inbox/receive/' + secondId);
  expect(fetch.mock.calls[1][1]?.redirect).toBe('manual');
  expect((fetch.mock.calls[1][1]?.headers as any)['X-Inbox-Forward-To']).toBe('codeisworld@gmail.com');
  expect((fetch.mock.calls[1][1]?.headers as any)['X-Inbox-Signature']).toHaveLength(64);
  expect(ack).toHaveBeenCalledOnce();
  expect(objects.size).toBe(0);
});
it.each(['unavailable', 'old app', 'redirect', 'wrong instance', 'wrong address', 'loop', 'invalid destination'])('does not forward unresolved aliases to a default mailbox: %s', async (failure) => {
  const { env, jobs, objects } = fixture();
  const to = 'reply+e2-aaaa11111111-' + 'a'.repeat(32) + '@reply.example.com';
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (String(url).includes('/resolve/')) {
      if (failure === 'unavailable') return new Response('Unavailable', { status: 503 });
      if (failure === 'old app') return new Response('Not found', { status: 404 });
      if (failure === 'redirect') return new Response(null, { status: 302, headers: { Location: 'https://untrusted.example' } });
      return Response.json({ id: failure === 'wrong instance' ? secondId : firstId,
        recipient: failure === 'wrong address' ? 'other@reply.example.com' : to,
        forwardTo: failure === 'loop' ? to : failure === 'invalid destination' ? 'not-an-email' : 'custom@example.com' });
    }
    return Response.json({});
  });
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const m = mail(to);
  await gateway.email(m, env);
  expect(m.forward).not.toHaveBeenCalled();
  expect(jobs).toHaveLength(1);
  expect([...objects.values()][0].customMetadata).toMatchObject({ forward: 'failed', forwardTo: '' });
  const ack = vi.fn(), retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect((fetch.mock.calls[1][1]?.headers as any)['X-Inbox-Forward-To']).toBe('');
  expect((fetch.mock.calls[1][1]?.headers as any)['X-Inbox-Forward']).toBe('failed');
  expect(ack).toHaveBeenCalledOnce();
  expect(retry).not.toHaveBeenCalled();
});
it('retains a resolved custom destination when Cloudflare rejects mailbox forwarding', async () => {
  const { env, jobs, objects } = fixture();
  const to = 'reply+e2-aaaa11111111-' + 'a'.repeat(32) + '@reply.example.com';
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ id: firstId, recipient: to, forwardTo: 'custom@example.com' }));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const m = mail(to);
  m.forward.mockRejectedValue(new Error('Destination not verified'));
  await gateway.email(m, env);
  expect(m.forward).toHaveBeenCalledExactlyOnceWith('custom@example.com');
  expect(jobs).toHaveLength(1);
  expect([...objects.values()][0].customMetadata).toMatchObject({ forward: 'failed', forwardTo: 'custom@example.com' });
});
it('uses only administrator endpoints and rejects endpoint query, redirect and id substitution', async () => {
  for (const endpoint of ['https://cloud.example/api/inbox/receive/other', 'https://cloud.example/api/inbox/receive/' + firstId + '?next=https://evil.example', 'http://cloud.example/api/inbox/receive/' + firstId]) {
    const { env, jobs } = fixture();
    const targets = JSON.parse(env.TARGETS);
    targets['reply.example.com'][0].endpoint = endpoint;
    env.TARGETS = JSON.stringify(targets);
    const fetch = vi.spyOn(globalThis, 'fetch');
    const m = mail('e-aaaa11111111-route@reply.example.com');
    await gateway.email(m, env);
    expect(m.setReject).toHaveBeenCalledOnce();
    expect(jobs).toHaveLength(0);
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  }
});
it('does not deliver an unknown instance prefix to the default mailbox', async () => {
  const { env, jobs } = fixture(),
    m = mail('e-unknown-prefix@reply.example.com');
  await gateway.email(m, env);
  expect(m.setReject).toHaveBeenCalledOnce();
  expect(jobs).toHaveLength(0);
});
it.each(['e', 's'])('keeps legacy %s aliases working without a route-resolution endpoint', async source => {
  const { env, jobs } = fixture();
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({}));
  const m = mail(source + '-bbbb22222222-legacy@reply.example.com');
  await gateway.email(m, env);
  expect(m.forward).toHaveBeenCalledExactlyOnceWith('sales@example.com');
  expect(fetch).not.toHaveBeenCalled();
  await gateway.queue({ messages: [{ body: jobs[0], ack: vi.fn(), retry: vi.fn(), attempts: 1 }] } as any, env);
  expect(fetch).toHaveBeenCalledExactlyOnceWith('https://server.example/api/inbox/receive/' + secondId, expect.anything());
});
it.each(['e', 's'])('routes a complete reply+%s alias to exactly one instance and signs its full recipient', async source => {
  const { env, jobs, objects } = fixture();
  const recipient = 'reply+' + source + '-bbbb22222222-' + 'a'.repeat(32) + '@reply.example.com', m = mail(recipient);
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({}));
  await gateway.email(m, env);
  expect(m.setReject).not.toHaveBeenCalled(); expect(jobs).toHaveLength(1);
  expect([...objects.values()][0].customMetadata.to).toBe(recipient);
  const ack = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry: vi.fn(), attempts: 1 }] } as any, env);
  expect(m.forward).toHaveBeenCalledExactlyOnceWith('sales@example.com');
  expect(fetch).toHaveBeenCalledOnce(); expect(fetch.mock.calls[0][0]).toBe('https://server.example/api/inbox/receive/' + secondId);
  const request = fetch.mock.calls[0][1]!, headers = request.headers as Record<string, string>;
  expect(headers['X-Inbox-To']).toBe(recipient);
  expect(headers['X-Inbox-Signature']).toBe(await sign('key-b', ['bbbb2222-2222-2222-2222-222222222222', headers['X-Inbox-Time'], recipient, m.from, 'forwarded', 'sales@example.com', await digest(request.body as ArrayBuffer)].join('\n')));
  expect(ack).toHaveBeenCalledOnce(); expect(objects.size).toBe(0);
});
it.each([
  'reply+e2-cccc33333333-' + 'a'.repeat(32),
  'reply+e2-bbbb22222222-short',
  'reply+e-cccc33333333-' + 'a'.repeat(32),
  'reply+e-bbbb22222222-short',
  'reply+s-bbbb22222222-' + 'g'.repeat(32),
  'reply+e-bbbb22222222-' + 'a'.repeat(32) + '+extra',
  'reply+', 'reply+unknown', 'other+e-bbbb22222222-' + 'a'.repeat(32),
])('rejects unknown or malformed plus alias %s without falling back to the default mailbox', async local => {
  const { env, jobs, objects } = fixture(), m = mail(local + '@reply.example.com');
  await gateway.email(m, env);
  expect(m.setReject).toHaveBeenCalledOnce(); expect(m.forward).not.toHaveBeenCalled(); expect(jobs).toHaveLength(0); expect(objects.size).toBe(0);
});
it('retains the message on delivery failure and reports forwarding failure', async () => {
  const { env, jobs, objects } = fixture(),
    m = mail('sales@reply.example.com');
  m.forward.mockRejectedValue(new Error('unavailable'));
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  await gateway.email(m, env);
  expect([...objects.values()][0].customMetadata.forward).toBe('failed');
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('retry', { status: 503 }));
  const ack = vi.fn(),
    retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect(ack).not.toHaveBeenCalled();
  expect(retry).toHaveBeenCalled();
  expect(objects.size).toBe(1);
});
it.each([
  { stage: 'fetch', failure: new Error('Fetch failed: Unknown error (1042); customer@example.org key-a Subject: Hi Hello'), name: 'Error', code: '1042' },
  { stage: 'read', failure: new TypeError('RAW.get unavailable for customer@example.org key-a Subject: Hi Hello'), name: 'TypeError', code: undefined },
])('logs a safe diagnostic for $stage failures while retaining the message for retry', async ({ stage, failure, name, code }) => {
  const { env, jobs, objects } = fixture(), log = vi.spyOn(console, 'error').mockImplementation(() => {});
  await gateway.email(mail('sales@reply.example.com'), env);
  if (stage === 'read') vi.spyOn(env.RAW, 'get').mockRejectedValue(failure);
  else vi.spyOn(globalThis, 'fetch').mockRejectedValue(failure);
  const ack = vi.fn(), retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect(log).toHaveBeenCalledWith('Inbox delivery retry', { stage, name, code, status: undefined, attempt: 1 });
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/customer@example\.org|key-a|Subject: Hi|Hello|sales@|reply\.example\.com/);
  expect(ack).not.toHaveBeenCalled(); expect(retry).toHaveBeenCalledWith({ delaySeconds: 120 }); expect(objects.size).toBe(1);
});
it('logs only the HTTP status for rejected ingestion without logging the response body', async () => {
  const { env, jobs, objects } = fixture(), log = vi.spyOn(console, 'error').mockImplementation(() => {});
  await gateway.email(mail('sales@reply.example.com'), env);
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('key-a customer@example.org private message', { status: 401 }));
  const ack = vi.fn(), retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect(log).toHaveBeenCalledWith('Inbox delivery retry', { stage: 'fetch', name: 'Error', code: undefined, status: 401, attempt: 1 });
  expect(JSON.stringify(log.mock.calls)).not.toMatch(/key-a|customer@example\.org|private message/);
  expect(ack).not.toHaveBeenCalled(); expect(retry).toHaveBeenCalledWith({ delaySeconds: 120 }); expect(objects.size).toBe(1);
});
it('does not follow an ingestion redirect or acknowledge the retained message', async () => {
  const { env, jobs, objects } = fixture();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  await gateway.email(mail('sales@reply.example.com'), env);
  const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 302, headers: { Location: 'https://untrusted.example/inbox' } }));
  const ack = vi.fn(), retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect(fetch).toHaveBeenCalledOnce();
  expect(fetch.mock.calls[0][0]).toBe('https://cloud.example/api/inbox/receive/' + firstId);
  expect(fetch.mock.calls[0][1]?.redirect).toBe('manual');
  expect(ack).not.toHaveBeenCalled(); expect(retry).toHaveBeenCalledWith({ delaySeconds: 120 }); expect(objects.size).toBe(1);
});
