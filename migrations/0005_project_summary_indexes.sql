-- List summaries sort by modification time without loading full draft JSON into the Worker.
CREATE INDEX IF NOT EXISTS projects_owner_updated ON projects(owner_id, json_extract(data,'$.updatedAt') DESC, json_extract(data,'$.createdAt') DESC, id DESC);
CREATE INDEX IF NOT EXISTS projects_workspace_updated ON projects(workspace_id, json_extract(data,'$.updatedAt') DESC, json_extract(data,'$.createdAt') DESC, id DESC);
CREATE INDEX IF NOT EXISTS projects_updated ON projects(json_extract(data,'$.updatedAt') DESC, json_extract(data,'$.createdAt') DESC, id DESC);
CREATE INDEX IF NOT EXISTS jobs_project_created ON jobs(project_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS releases_project_created ON releases(project_id, created_at DESC, id DESC);
