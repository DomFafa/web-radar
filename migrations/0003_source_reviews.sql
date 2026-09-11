CREATE TABLE IF NOT EXISTS source_reviews (
 project_id TEXT NOT NULL REFERENCES projects(id), user_id TEXT NOT NULL,
 reviewed_at INTEGER NOT NULL, data TEXT NOT NULL, PRIMARY KEY(project_id,user_id)
);
