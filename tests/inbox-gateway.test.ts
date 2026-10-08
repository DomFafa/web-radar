import { it, expect, vi, afterEach } from 'vitest';
import gateway from '../deploy/inbox-gateway/worker';
import { digest, sign } from '../src/worker/inbox/core';
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
            endpoint: 'https://cloud.example/api/inbox/receive/a',
            secret: 'key-a',
            forwardTo: 'sales@example.com',
            default: true,
          },
          {
            id: 'bbbb2222-2222-2222-2222-222222222222',
            endpoint: 'https://server.example/api/inbox/receive/b',
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
    fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
  const m = mail('e-bbbb22222222-random@reply.example.com');
  await gateway.email(m, env);
  expect(jobs).toHaveLength(1);
  expect(m.forward).toHaveBeenCalledOnce();
  const ack = vi.fn(),
    retry = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry, attempts: 1 }] } as any, env);
  expect(fetch.mock.calls[0][0]).toBe('https://server.example/api/inbox/receive/b');
  expect((fetch.mock.calls[0][1]?.headers as any)['X-Inbox-Forward-To']).toBe('sales@example.com');
  expect((fetch.mock.calls[0][1]?.headers as any)['X-Inbox-Signature']).toHaveLength(64);
  expect(ack).toHaveBeenCalledOnce();
  expect(objects.size).toBe(0);
});
it('does not deliver an unknown instance prefix to the default mailbox', async () => {
  const { env, jobs } = fixture(),
    m = mail('e-unknown-prefix@reply.example.com');
  await gateway.email(m, env);
  expect(m.setReject).toHaveBeenCalledOnce();
  expect(jobs).toHaveLength(0);
});
it.each(['e', 's'])('routes a complete reply+%s alias to exactly one instance and signs its full recipient', async source => {
  const { env, jobs, objects } = fixture(), fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
  const recipient = 'reply+' + source + '-bbbb22222222-' + 'a'.repeat(32) + '@reply.example.com', m = mail(recipient);
  await gateway.email(m, env);
  expect(m.setReject).not.toHaveBeenCalled(); expect(jobs).toHaveLength(1);
  expect([...objects.values()][0].customMetadata.to).toBe(recipient);
  const ack = vi.fn();
  await gateway.queue({ messages: [{ body: jobs[0], ack, retry: vi.fn(), attempts: 1 }] } as any, env);
  expect(fetch).toHaveBeenCalledOnce(); expect(fetch.mock.calls[0][0]).toBe('https://server.example/api/inbox/receive/b');
  const request = fetch.mock.calls[0][1]!, headers = request.headers as Record<string, string>;
  expect(headers['X-Inbox-To']).toBe(recipient);
  expect(headers['X-Inbox-Signature']).toBe(await sign('key-b', ['bbbb2222-2222-2222-2222-222222222222', headers['X-Inbox-Time'], recipient, m.from, 'forwarded', 'sales@example.com', await digest(request.body as ArrayBuffer)].join('\n')));
  expect(ack).toHaveBeenCalledOnce(); expect(objects.size).toBe(0);
});
it.each([
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
