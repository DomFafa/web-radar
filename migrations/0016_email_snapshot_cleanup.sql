-- Keep R2 object keys independently of campaigns so transient storage errors
-- remain retryable after their database rows have been deleted.
CREATE TABLE IF NOT EXISTS edm_email_snapshot_cleanup (
  snapshot_key TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_email_snapshot_cleanup_campaign ON edm_email_snapshot_cleanup(campaign_id);
