CREATE TABLE character_sheets (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'user'
    CHECK (type IN ('user', 'sample')),
  pc_name TEXT NOT NULL,
  pl_name TEXT,
  rank INTEGER NOT NULL,
  primary_ryugi_id TEXT,
  ikizama_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_character_sheets_user_updated_at
  ON character_sheets (type, updated_at DESC);

CREATE INDEX idx_character_sheets_sample_created_at
  ON character_sheets (type, created_at ASC);
