ALTER TABLE wr_crm_outbound_snapshots ADD COLUMN group_id_at_send TEXT;
ALTER TABLE wr_crm_outbound_snapshots ADD COLUMN group_name_at_send TEXT;
ALTER TABLE wr_crm_outbound_snapshots ADD COLUMN group_snapshot_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE wr_crm_outbound_snapshots ADD COLUMN engagement_tracking_available INTEGER NOT NULL DEFAULT 0;
ALTER TABLE wr_crm_outbound_snapshots ADD COLUMN engagement_tracking_source TEXT;
CREATE INDEX wr_crm_activity_group ON wr_crm_outbound_snapshots(workspace_id,owner_id,group_id_at_send,created_at);
