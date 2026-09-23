import {Hono} from "hono";
import type {Bindings,Variables} from "../shared/types";
const api=new Hono<{Bindings:Bindings;Variables:Variables}>();
// ====== 退订处理 (无需认证) ======
api.get("/api/outreach/unsubscribe", async (c) => {
  const token = c.req.query("token");
  if (!token) {
    return c.text("Invalid unsubscribe link", 400);
  }

  try {
    const payload = await verifyTrackingToken(token, c.env.BETTER_AUTH_SECRET);
    const contactId = payload?.cid;

    if (!contactId) {
      return c.text("Invalid token", 400);
    }

    const { createDb } = await import("../db");
    const { contacts } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");

    const db = createDb(c.env.DB);
    await db
      .update(contacts)
      .set({
        subscriptionStatus: "unsubscribed",
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contacts.id, contactId));

    return c.html(`
      <!DOCTYPE html>
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:system-ui;background:#0f172a;color:#e2e8f0">
          <div style="text-align:center;padding:40px;background:#1e293b;border-radius:16px;max-width:400px">
            <h1 style="font-size:24px;margin-bottom:16px">✅ Successfully Unsubscribed</h1>
            <p style="color:#94a3b8">You have been removed from our mailing list. You will no longer receive emails from us.</p>
          </div>
        </body>
      </html>
    `);
  } catch {
    return c.text("Invalid unsubscribe link", 400);
  }
});

// Lightweight preference page used by the standard email footer.
api.get("/api/outreach/preferences", async (c) => {
  const token = c.req.query("token");
  if (!(await verifyTrackingToken(token,c.env.BETTER_AUTH_SECRET))?.cid) return c.text("Invalid preferences link", 400);
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8"><title>Email preferences</title></head>
      <body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;font-family:system-ui;background:#f5f7fb;color:#172033">
        <main style="text-align:center;padding:40px;background:white;border:1px solid #e5e7eb;border-radius:12px;max-width:420px">
          <h1 style="font-size:24px;margin:0 0 12px">Email preferences</h1>
          <p style="color:#667085;line-height:1.6">You can stop receiving campaign emails at any time.</p>
          <a href="/api/outreach/unsubscribe?token=${encodeURIComponent(token!)}" style="display:inline-block;margin-top:12px;padding:12px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px">Unsubscribe</a>
        </main>
      </body>
    </html>
  `);
});

// ====== First-party engagement tracking ======
// These endpoints are public because email clients request them without an
// application session. Updates are idempotent per recipient.
function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  return Uint8Array.from(atob(padded), ch => ch.charCodeAt(0)).buffer as ArrayBuffer;
}

async function verifyTrackingToken(token: string | undefined, secret: string): Promise<Record<string, string> | null> {
  if (!token || !secret) return null;
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;
  try {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, fromBase64Url(signaturePart), new TextEncoder().encode(payloadPart));
    if (!valid) return null;
    return JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart)));
  } catch {
    return null;
  }
}

api.get("/api/outreach/tracking/open", async (c) => {
  const payload = await verifyTrackingToken(c.req.query("token"), c.env.BETTER_AUTH_SECRET);
  const recipientId = payload?.rid;
  const transparentGif = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="), ch => ch.charCodeAt(0));
  if (recipientId) {
    const { createDb } = await import("../db");
    const { campaignRecipients, campaigns } = await import("../db/schema");
    const { and, eq, isNull, sql } = await import("drizzle-orm");
    const db = createDb(c.env.DB);
    const result: any = await db.update(campaignRecipients)
      .set({ status: "opened", openedAt: new Date() })
      .where(and(eq(campaignRecipients.id, recipientId), isNull(campaignRecipients.openedAt)))
      .run();
    if (Number(result?.meta?.changes || 0) > 0) {
      const [recipient] = await db.select({ campaignId: campaignRecipients.campaignId }).from(campaignRecipients).where(eq(campaignRecipients.id, recipientId));
      if (recipient) {
        await db.update(campaigns).set({ totalOpened: sql`${campaigns.totalOpened} + 1`, updatedAt: new Date() }).where(eq(campaigns.id, recipient.campaignId));
      }
    }
  }
  return c.body(transparentGif, 200, {
    "Content-Type": "image/gif",
    "Cache-Control": "no-store, no-cache, must-revalidate",
  });
});

api.get("/api/outreach/tracking/click", async (c) => {
  const payload = await verifyTrackingToken(c.req.query("token"), c.env.BETTER_AUTH_SECRET);
  const recipientId = payload?.rid;
  const destination = payload?.url;
  if (!recipientId || !destination) return c.text("Invalid tracking link", 400);
  let target: URL;
  try {
    target = new URL(destination);
    if (!["http:", "https:"].includes(target.protocol)) throw new Error("unsupported protocol");
  } catch {
    return c.text("Invalid destination", 400);
  }

  const { createDb } = await import("../db");
  const { campaignRecipients, campaigns } = await import("../db/schema");
  const { and, eq, isNull, sql } = await import("drizzle-orm");
  const db = createDb(c.env.DB);
  const [recipient] = await db.select().from(campaignRecipients).where(eq(campaignRecipients.id, recipientId));
  if (recipient) {
    const now = new Date();
    const clickResult: any = await db.update(campaignRecipients)
      .set({ status: "clicked", clickedAt: now })
      .where(and(eq(campaignRecipients.id, recipientId), isNull(campaignRecipients.clickedAt)))
      .run();
    if (Number(clickResult?.meta?.changes || 0) > 0) {
      await db.update(campaigns).set({ totalClicked: sql`${campaigns.totalClicked} + 1`, updatedAt: now }).where(eq(campaigns.id, recipient.campaignId));
    }
    if (!recipient.openedAt) {
      const openResult: any = await db.update(campaignRecipients)
        .set({ openedAt: now })
        .where(and(eq(campaignRecipients.id, recipientId), isNull(campaignRecipients.openedAt)))
        .run();
      if (Number(openResult?.meta?.changes || 0) > 0) {
        await db.update(campaigns).set({ totalOpened: sql`${campaigns.totalOpened} + 1`, updatedAt: now }).where(eq(campaigns.id, recipient.campaignId));
      }
    }
  }
  return c.redirect(target.toString(), 302);
});


export default api;
