CREATE TABLE edm_assistant_sessions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES edm_users(id) ON DELETE CASCADE,
 created_by TEXT NOT NULL, create_request_id TEXT NOT NULL,
 title TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
 draft TEXT NOT NULL, messages TEXT NOT NULL DEFAULT '[]', operations TEXT NOT NULL DEFAULT '[]',
 pending_request_id TEXT, pending_since INTEGER,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 UNIQUE(user_id, created_by, create_request_id)
);
CREATE INDEX edm_assistant_sessions_actor ON edm_assistant_sessions(user_id, created_by, updated_at);
CREATE TABLE edm_assistant_requests (
 session_id TEXT NOT NULL REFERENCES edm_assistant_sessions(id) ON DELETE CASCADE,
 request_id TEXT NOT NULL, request_hash TEXT NOT NULL, kind TEXT NOT NULL,
 status TEXT NOT NULL, error TEXT, created_at TEXT NOT NULL,
 PRIMARY KEY(session_id, request_id)
);
CREATE TABLE edm_assistant_snapshots (
 session_id TEXT NOT NULL REFERENCES edm_assistant_sessions(id) ON DELETE CASCADE,
 channel TEXT NOT NULL, task_id TEXT NOT NULL UNIQUE, snapshot TEXT NOT NULL,
 PRIMARY KEY(session_id, channel)
);
-- Recipient snapshots remain one row per recipient, below D1's per-row size limit.
CREATE TABLE edm_assistant_recipients (
 session_id TEXT NOT NULL REFERENCES edm_assistant_sessions(id) ON DELETE CASCADE,
 task_id TEXT NOT NULL, recipient_id TEXT NOT NULL PRIMARY KEY, contact_id TEXT NOT NULL,
 email TEXT NOT NULL, name TEXT NOT NULL, company TEXT NOT NULL, industry TEXT NOT NULL
);
CREATE INDEX edm_assistant_recipients_task ON edm_assistant_recipients(task_id);
