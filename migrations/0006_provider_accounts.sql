CREATE TABLE IF NOT EXISTS provider_accounts (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('cloudflare','resend')),
 scope TEXT NOT NULL, label TEXT NOT NULL, secret TEXT NOT NULL, mail_from TEXT,
 is_default INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS provider_one_default ON provider_accounts(kind) WHERE is_default=1;
CREATE INDEX IF NOT EXISTS provider_scope ON provider_accounts(scope,kind);
CREATE TABLE IF NOT EXISTS project_delivery_settings (
 project_id TEXT PRIMARY KEY REFERENCES projects(id), resend_account_id TEXT REFERENCES provider_accounts(id)
);
CREATE TABLE IF NOT EXISTS project_domains (
 hostname TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
 credential_id TEXT NOT NULL REFERENCES provider_accounts(id), zone_id TEXT NOT NULL,
 zone_name TEXT NOT NULL, status TEXT NOT NULL, dns_record_id TEXT, owns_dns INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS domains_project ON project_domains(project_id);
