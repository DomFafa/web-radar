// Separate durable ingress: aliases resolve only at administrator-provisioned endpoints.
interface Target {
  id: string;
  endpoint: string;
  secret: string;
  forwardTo: string;
  default?: boolean;
}
interface Env {
  RAW: R2Bucket;
  INGEST: Queue<{ key: string }>;
  TARGETS: string;
}
const enc = new TextEncoder();
const RESOLVE_PURPOSE = 'inbox-route-resolve-v1';
function validMailbox(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s<>@]+@[a-z\d](?:[a-z\d.-]*[a-z\d])?\.[a-z]{2,63}$/i.test(value);
}
function endpoint(t: Target, operation: 'receive' | 'resolve') {
  const url = new URL(t.endpoint);
  const suffix = '/receive/' + encodeURIComponent(t.id);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.endsWith(suffix))
    throw new Error('Invalid provisioned inbox endpoint');
  url.pathname = url.pathname.slice(0, -suffix.length) + '/' + operation + '/' + encodeURIComponent(t.id);
  return url;
}
function destination(env: Env, to: string, value: unknown): string {
  if (!validMailbox(value)) throw new Error('Invalid forwarding destination');
  const address = value.toLowerCase();
  const domains = Object.keys(JSON.parse(env.TARGETS || '{}')).map(domain => domain.toLowerCase());
  if (address === to || domains.includes(address.split('@')[1])) throw new Error('Forwarding loop');
  return value;
}
async function hash(bytes: ArrayBuffer) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
async function hmac(secret: string, text: string) {
  const k = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(text)))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
function target(env: Env, recipient: string): Target {
  if (!validMailbox(recipient)) throw new Error('Invalid receiving address');
  const [local, domain] = recipient.toLowerCase().split('@'),
    routes = JSON.parse(env.TARGETS || '{}')[domain];
  const options: Target[] = Array.isArray(routes) ? routes : routes ? [routes] : [];
  if (options.filter((r) => r.default).length > 1) throw new Error('Multiple default inboxes');
  const plus = local.includes('+'),
    alias = plus ? local.slice('reply+'.length) : local;
  if (plus && (!local.startsWith('reply+') || !/^(?:e2|e|s)-[a-f0-9]{12}-[a-f0-9]{32}$/.test(alias)))
    throw new Error('Invalid receiving alias');
  const t =
    options.find(
      (r) =>
        alias.startsWith('e2-' + r.id.replaceAll('-', '').slice(0, 12) + '-') ||
        alias.startsWith('e-' + r.id.replaceAll('-', '').slice(0, 12) + '-') ||
        alias.startsWith('s-' + r.id.replaceAll('-', '').slice(0, 12) + '-'),
    ) || (!plus && !/^(?:e2|e|s)-/.test(local) ? options.find((r) => r.default) : undefined);
  if (!t || !t.id || !t.secret || !t.forwardTo)
    throw new Error('Receiving domain not provisioned');
  endpoint(t, 'receive');
  return t;
}
async function resolveDestination(env: Env, t: Target, to: string) {
  // Only versioned EDM aliases require the new application endpoint. Existing
  // aliases and site-message traffic retain their original static destination,
  // including instances that have not yet deployed route resolution.
  if (!/^(?:reply\+)?e2-/.test(to.split('@')[0])) return destination(env, to, t.forwardTo);
  const time = String(Date.now());
  const response = await fetch(endpoint(t, 'resolve').toString(), {
    method: 'POST', redirect: 'manual',
    headers: {
      'X-Inbox-To': to,
      'X-Inbox-Time': time,
      'X-Inbox-Signature': await hmac(t.secret, [RESOLVE_PURPOSE, t.id, time, to].join('\n')),
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Inbox route resolution failed');
  const result = await response.json() as { id?: unknown; recipient?: unknown; forwardTo?: unknown };
  if (result.id !== t.id || result.recipient !== to) throw new Error('Inbox route mismatch');
  return destination(env, to, result.forwardTo);
}
export default {
  async email(message: ForwardableEmailMessage, env: Env) {
    const to = message.to.toLowerCase();
    let t: Target;
    try {
      t = target(env, to);
    } catch {
      message.setReject('Receiving address not configured');
      return;
    }
    if (message.rawSize > 15 * 1024 * 1024) {
      message.setReject('Maximum mail size 15 MB');
      return;
    }
    // Save before accepting. The queue retries HTTP delivery independently of mailbox forwarding.
    const raw = await new Response(message.raw).arrayBuffer(),
      key = 'pending/' + crypto.randomUUID();
    await env.RAW.put(key, raw, {
      customMetadata: { to, from: message.from, forward: 'failed', forwardTo: '' },
    });
    let forwarded = false;
    let forwardTo = '';
    try {
      forwardTo = await resolveDestination(env, t, to);
      await message.forward(forwardTo);
      forwarded = true;
    } catch {
      console.warn('Mailbox forwarding failed; retained for inbox delivery');
    }
    await env.RAW.put(key, raw, {
      customMetadata: {
        to,
        from: message.from,
        forward: forwarded ? 'forwarded' : 'failed',
        forwardTo,
      },
    });
    await env.INGEST.send({ key });
  },
  async queue(batch: MessageBatch<{ key: string }>, env: Env) {
    for (const m of batch.messages) {
      let stage = 'read', status: number | undefined;
      try {
        const obj = await env.RAW.get(m.body.key);
        if (!obj) {
          m.ack();
          continue;
        }
        stage = 'prepare';
        const { to, from, forward, forwardTo } = obj.customMetadata!,
          t = target(env, to),
          time = String(Date.now()),
          raw = await obj.arrayBuffer();
        const signature = await hmac(
          t.secret,
          [t.id, time, to, from, forward, forwardTo, await hash(raw)].join('\n'),
        );
        stage = 'fetch';
        const response = await fetch(endpoint(t, 'receive').toString(), {
          method: 'POST',
          redirect: 'manual',
          headers: {
            'Content-Type': 'message/rfc822',
            'X-Inbox-To': to,
            'X-Inbox-From': from,
            'X-Inbox-Forward': forward,
            'X-Inbox-Forward-To': forwardTo,
            'X-Inbox-Time': time,
            'X-Inbox-Signature': signature,
          },
          body: raw,
          signal: AbortSignal.timeout(25000),
        });
        status = response.status;
        if (!response.ok) throw new Error('Inbox delivery failed: ' + response.status);
        stage = 'delete';
        await env.RAW.delete(m.body.key);
        m.ack();
      } catch (error) {
        // Log only coarse diagnostics: exception text can contain mail or target credentials.
        const name = error instanceof Error && ['Error', 'TypeError', 'SyntaxError', 'AbortError', 'TimeoutError', 'OperationError'].includes(error.name) ? error.name : 'UnknownError';
        const code = error instanceof Error ? error.message.match(/(?:\berror(?: code)?[: ]+|\bcode[: ]+|\()(\d{3,5})\b/i)?.[1] : undefined;
        console.error('Inbox delivery retry', { stage, name, code, status, attempt: m.attempts });
        m.retry({ delaySeconds: Math.min(3600, 60 * 2 ** Math.min(m.attempts, 6)) });
      }
    }
  },
  async fetch() {
    return new Response('Customer inbox ingress', { headers: { 'Cache-Control': 'no-store' } });
  },
};
