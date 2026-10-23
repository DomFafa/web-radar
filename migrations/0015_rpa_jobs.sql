-- RPA Excel jobs use existing Web Radar workspace, identity, D1 and private R2.
CREATE TABLE wr_rpa_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  workspace_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  robot_uuid TEXT NOT NULL,
  input_json TEXT NOT NULL,
  domain_count INTEGER NOT NULL CHECK (domain_count BETWEEN 1 AND 100),
  input_sha256 TEXT,
  input_artifact_key TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued','claimed','running','unverified','awaiting_review','business_accepted','needs_reconciliation')),
  attempt_id TEXT UNIQUE,
  lease_until INTEGER,
  result_sha256 TEXT,
  artifact_key TEXT,
  evidence_json TEXT,
  verification_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX idx_wr_rpa_claim ON wr_rpa_jobs(status,robot_uuid,created_at,id);
CREATE INDEX idx_wr_rpa_lease ON wr_rpa_jobs(status,lease_until);
CREATE INDEX idx_wr_rpa_workspace ON wr_rpa_jobs(workspace_id,created_by,created_at DESC);
