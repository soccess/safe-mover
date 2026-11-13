CREATE TABLE IF NOT EXISTS learning_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game TEXT NOT NULL,
  class_name TEXT NOT NULL DEFAULT '기본반',
  character_id TEXT NOT NULL DEFAULT 'bunny',
  student_name TEXT NOT NULL DEFAULT '토끼',
  stage TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL DEFAULT '',
  payload_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

CREATE INDEX IF NOT EXISTS idx_learning_records_game_id
  ON learning_records (game, id DESC);

CREATE INDEX IF NOT EXISTS idx_learning_records_class_game
  ON learning_records (class_name, game, id DESC);

CREATE TABLE IF NOT EXISTS classes (
  name TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);

INSERT OR IGNORE INTO classes (name) VALUES ('기본반');

CREATE TABLE IF NOT EXISTS kv_state (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', '+9 hours'))
);
