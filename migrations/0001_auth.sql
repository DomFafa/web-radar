CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, workspace_id TEXT NOT NULL, expires_at INTEGER NOT NULL, test_identity TEXT, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS handoffs (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, request_id TEXT NOT NULL, fingerprint TEXT NOT NULL, code_hash TEXT NOT NULL UNIQUE, code_nonce TEXT NOT NULL, expires_at INTEGER NOT NULL, consumed_at INTEGER, payload TEXT NOT NULL, project_id TEXT, UNIQUE(user_id,request_id));
CREATE TABLE IF NOT EXISTS auth_attempts (id TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at INTEGER NOT NULL);
