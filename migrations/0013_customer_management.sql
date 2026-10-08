CREATE TABLE wr_crm_outbound_snapshots (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, owner_id TEXT,
 source TEXT NOT NULL CHECK(source IN ('edm','site')),
 business_id TEXT NOT NULL, target_id TEXT NOT NULL, attempt_id TEXT NOT NULL,
 contact_id TEXT, website_url TEXT, recipient_email TEXT, sender_email TEXT, sender_name TEXT, reply_to TEXT,
 subject TEXT NOT NULL DEFAULT '',
 body_html TEXT, body_text TEXT NOT NULL DEFAULT '', provider TEXT,
 status TEXT NOT NULL DEFAULT 'prepared', provider_message_id TEXT, error_message TEXT,
 created_at TEXT NOT NULL, completed_at TEXT,
 UNIQUE(source,target_id,attempt_id)
);
CREATE INDEX wr_crm_snapshot_target ON wr_crm_outbound_snapshots(workspace_id,source,target_id,created_at);
CREATE TABLE wr_crm_customer_links (
 workspace_id TEXT NOT NULL, site_url TEXT NOT NULL, contact_id TEXT NOT NULL,
 created_by TEXT NOT NULL, created_at TEXT NOT NULL,
 PRIMARY KEY(workspace_id,site_url),
 FOREIGN KEY(contact_id) REFERENCES edm_contacts(id) ON DELETE CASCADE
);
CREATE INDEX wr_crm_link_contact ON wr_crm_customer_links(workspace_id,contact_id);
CREATE TABLE wr_crm_notes (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, customer_key TEXT NOT NULL,
 author_id TEXT NOT NULL, content TEXT NOT NULL, follow_up_at TEXT,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','done')),
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX wr_crm_notes_customer ON wr_crm_notes(workspace_id,customer_key,created_at);
CREATE INDEX wr_crm_follow_up ON wr_crm_notes(workspace_id,author_id,status,follow_up_at);
CREATE TABLE wr_crm_audit (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, actor_id TEXT NOT NULL,
 customer_key TEXT NOT NULL, action TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX wr_crm_audit_customer ON wr_crm_audit(workspace_id,customer_key,created_at);
