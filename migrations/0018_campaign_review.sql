CREATE TABLE edm_campaign_reviews (
 campaign_id TEXT PRIMARY KEY REFERENCES edm_campaigns(id) ON DELETE CASCADE,
 run_id TEXT NOT NULL,
 status TEXT NOT NULL,
 started_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL,
 checked INTEGER NOT NULL DEFAULT 0,
 resolved INTEGER NOT NULL DEFAULT 0,
 recipient_after TEXT NOT NULL DEFAULT '',
 cursor TEXT NOT NULL DEFAULT '',
 candidates TEXT NOT NULL DEFAULT '[]',
 pages INTEGER NOT NULL DEFAULT 0,
 error TEXT,
 lease_until INTEGER NOT NULL DEFAULT 0,
 lease_token TEXT
);
