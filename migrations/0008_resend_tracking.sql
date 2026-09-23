CREATE TABLE edm_resend_deliveries (
 recipient_id TEXT PRIMARY KEY REFERENCES edm_campaign_recipients(id) ON DELETE CASCADE,
 provider_id TEXT NOT NULL REFERENCES edm_providers(id) ON DELETE CASCADE,
 email_id TEXT,
 bounced_at INTEGER,
 complained_at INTEGER,
 failed_at INTEGER,
 created_at INTEGER NOT NULL,
 UNIQUE(provider_id, email_id)
);
CREATE INDEX edm_resend_provider ON edm_resend_deliveries(provider_id);
