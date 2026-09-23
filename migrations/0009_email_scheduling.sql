-- Durable pacing survives Queue retries, concurrent consumers and Worker restarts.
CREATE TABLE edm_email_clocks (
  id TEXT PRIMARY KEY,
  next_at INTEGER NOT NULL DEFAULT 0,
  token TEXT
);
CREATE TABLE edm_email_schedule (
  recipient_id TEXT PRIMARY KEY REFERENCES edm_campaign_recipients(id) ON DELETE CASCADE,
  due_at INTEGER NOT NULL
);
ALTER TABLE edm_resend_deliveries ADD COLUMN checked_at INTEGER;
CREATE INDEX edm_resend_sync ON edm_resend_deliveries(provider_id, checked_at);
CREATE TABLE edm_resend_sync_runs (
  provider_id TEXT PRIMARY KEY REFERENCES edm_providers(id) ON DELETE CASCADE,
  run_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  checked INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  lease_token TEXT
);
