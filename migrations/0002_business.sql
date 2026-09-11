CREATE TABLE IF NOT EXISTS projects (
 id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, workspace_id TEXT NOT NULL, version INTEGER NOT NULL, data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS projects_workspace ON projects(workspace_id);
CREATE TABLE IF NOT EXISTS assets (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS assets_project ON assets(project_id);
CREATE TABLE IF NOT EXISTS jobs (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), user_id TEXT NOT NULL,
 kind TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS jobs_queue ON jobs(status,created_at);
CREATE INDEX IF NOT EXISTS jobs_project ON jobs(project_id);
CREATE TABLE IF NOT EXISTS quotas (
 user_id TEXT PRIMARY KEY, image_limit INTEGER NOT NULL DEFAULT 0 CHECK(image_limit>=0), video_limit INTEGER NOT NULL DEFAULT 0 CHECK(video_limit>=0),
 image_used INTEGER NOT NULL DEFAULT 0 CHECK(image_used>=0), video_used INTEGER NOT NULL DEFAULT 0 CHECK(video_used>=0),
 image_reserved INTEGER NOT NULL DEFAULT 0 CHECK(image_reserved>=0), video_reserved INTEGER NOT NULL DEFAULT 0 CHECK(video_reserved>=0)
);
CREATE TABLE IF NOT EXISTS quota_ledger (
 job_id TEXT PRIMARY KEY REFERENCES jobs(id), user_id TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('image','video')),
 state TEXT NOT NULL CHECK(state IN ('reserved','committed','released')), updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS releases (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), created_at TEXT NOT NULL, data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS releases_project ON releases(project_id);
CREATE TABLE IF NOT EXISTS inquiries (
 id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id), request_id TEXT NOT NULL, created_at TEXT NOT NULL, data TEXT NOT NULL,
 UNIQUE(project_id,request_id)
);
CREATE INDEX IF NOT EXISTS inquiries_project ON inquiries(project_id);
CREATE TABLE IF NOT EXISTS idempotency (
 scope TEXT NOT NULL, request_id TEXT NOT NULL, fingerprint TEXT NOT NULL, result TEXT NOT NULL, PRIMARY KEY(scope,request_id)
);
CREATE TABLE IF NOT EXISTS provider_attempts (
 id TEXT PRIMARY KEY, job_id TEXT NOT NULL REFERENCES jobs(id), provider TEXT NOT NULL, operation TEXT NOT NULL,
 outcome TEXT NOT NULL, created_at TEXT NOT NULL, completed_at TEXT
);
CREATE TABLE IF NOT EXISTS inquiry_limits (
 key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL
);
