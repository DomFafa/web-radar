-- New routes retain their selected forwarding destination. Legacy routes with
-- NULL continue to use their receiving configuration's forwarding mailbox.
ALTER TABLE wr_inbox_routes ADD COLUMN forward_to TEXT;
