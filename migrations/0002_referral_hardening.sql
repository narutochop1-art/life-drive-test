ALTER TABLE events ADD COLUMN visitor_id TEXT;
CREATE INDEX IF NOT EXISTS idx_events_visitor ON events(visitor_id);
