import { connectResendWebhook } from '../lib/resend-tracking';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { eq, and } from 'drizzle-orm';
import { createDb } from '../../db';
import { providers } from '../../db/schema';
import type { Bindings, Variables } from '../../shared/types';
import { decodeProvider } from '../lib/credentials';
import {
  resendRequest,
  listResendDomains,
  RESEND_EVENTS,
  verifyResendSignature,
  applyResendEvent,
} from '../lib/resend';
type Env = { Bindings: Bindings; Variables: Variables };
export function registerResendRoutes(app: Hono<Env>) {
  const get = async (c: any) => {
    const db = createDb(c.env.DB);
    const row = await db
      .select()
      .from(providers)
      .where(
        and(
          eq(providers.id, c.req.param('id')),
          eq(providers.userId, c.get('user').id),
          eq(providers.provider, 'resend'),
        ),
      )
      .get();
    if (!row) throw new Error('Resend 帐号不存在');
    return decodeProvider(row, c.env);
  };
  app.get('/:id/resend/domains', async (c) => {
    try {
      const p = await get(c);
      const domains = await listResendDomains(p.apiKey);
      return c.json({ data: domains });
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.get('/:id/resend/domains/:domainId', async (c) => {
    try {
      const p = await get(c);
      return c.json({
        data: await resendRequest(
          p.apiKey,
          '/domains/' + encodeURIComponent(c.req.param('domainId')),
        ),
      });
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.post('/:id/resend/domains/:domainId/tracking', async (c) => {
    try {
      const p = await get(c),
        body = await c.req.json();
      if (typeof body.openTracking !== 'boolean' || typeof body.clickTracking !== 'boolean')
        return c.json({ error: '请选择打开和点击追踪状态' }, 400);
      const id = encodeURIComponent(c.req.param('domainId'));
      await resendRequest(p.apiKey, '/domains/' + id, {
        method: 'PATCH',
        body: JSON.stringify({
          open_tracking: body.openTracking,
          click_tracking: body.clickTracking,
        }),
      });
      return c.json({ data: await resendRequest(p.apiKey, '/domains/' + id) });
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.post('/:id/resend/webhook', async (c) => {
    try {
      const data = await connectResendWebhook(c.env, await get(c));
      return c.json({message:'Resend 数据回调已连接；请确认发信域名已启用打开和点击追踪', data});
    } catch (e: any) {
      return c.json({ error: e.message }, 400);
    }
  });
}
export const resendWebhookRoutes = new Hono<Env>();
resendWebhookRoutes.use(
  '*',
  bodyLimit({ maxSize: 256 * 1024, onError: (c) => c.text('Payload too large', 413) }),
);
resendWebhookRoutes.post('/api/outreach/webhooks/resend/:id', async (c) => {
  const row = await createDb(c.env.DB)
    .select()
    .from(providers)
    .where(and(eq(providers.id, c.req.param('id')), eq(providers.provider, 'resend')))
    .get();
  if (!row) return c.text('Invalid webhook', 400);
  const provider = await decodeProvider(row, c.env),
    config = JSON.parse(provider.config || '{}'),
    body = await c.req.text();
  if (!(await verifyResendSignature(body, c.req.raw.headers, config.resendWebhookSecret || '')))
    return c.text('Invalid signature', 401);
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return c.text('Invalid payload', 400);
  }
  if (!RESEND_EVENTS.includes(event.type)) return c.json({ received: true, ignored: true });
  const applied = await applyResendEvent(c.env.DB, provider.id, event);
  // A callback may arrive before the send response has persisted its email id.
  // Retry recent unmatched events briefly; unrelated account emails are ignored.
  if (!applied && Date.now() - Date.parse(event.created_at) < 600000)
    return c.text('Awaiting send record', 503);
  return c.json({ received: true, ignored: !applied });
});
