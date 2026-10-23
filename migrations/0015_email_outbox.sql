-- Freeze the approved envelope per recipient and the shared content in R2.
-- Publication is at-least-once; the consumer's durable attempt lock prevents double delivery.
CREATE TABLE IF NOT EXISTS edm_email_outbox (
  recipient_id TEXT PRIMARY KEY REFERENCES edm_campaign_recipients(id) ON DELETE CASCADE,
  campaign_id TEXT NOT NULL REFERENCES edm_campaigns(id) ON DELETE CASCADE,
  snapshot_key TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  reply_to TEXT,
  variables TEXT NOT NULL,
  engagement_tracking_source TEXT,
  publish_claimed_at INTEGER NOT NULL DEFAULT 0,
  published_at INTEGER,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_outbox_publish ON edm_email_outbox(published_at, publish_claimed_at, campaign_id);
