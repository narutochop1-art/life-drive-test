CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at);
CREATE TABLE IF NOT EXISTS unlocks (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  friend_id TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unlocks_pair ON unlocks(owner_id, friend_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_owner ON unlocks(owner_id);
