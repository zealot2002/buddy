-- 边走边听语料：景区 → 围栏 → 旅伴 → 段子 → 幕

CREATE TABLE IF NOT EXISTS walk_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area_tag TEXT NOT NULL,
  sim_base_lat REAL,
  sim_base_lng REAL,
  sim_coord_step_lat REAL,
  sim_radius_meters INTEGER
);

CREATE TABLE IF NOT EXISTS walk_fences (
  id TEXT PRIMARY KEY,
  area_id TEXT NOT NULL REFERENCES walk_areas(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  trigger_hint TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  radius_meters INTEGER NOT NULL DEFAULT 30,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS walk_jokes (
  id TEXT NOT NULL,
  fence_id TEXT NOT NULL REFERENCES walk_fences(id) ON DELETE CASCADE,
  companion_id TEXT NOT NULL,
  label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (fence_id, companion_id, id)
);

CREATE TABLE IF NOT EXISTS walk_acts (
  fence_id TEXT NOT NULL,
  companion_id TEXT NOT NULL,
  joke_id TEXT NOT NULL,
  act_index INTEGER NOT NULL,
  version_id TEXT NOT NULL,
  content TEXT NOT NULL,
  label TEXT,
  PRIMARY KEY (fence_id, companion_id, joke_id, act_index),
  FOREIGN KEY (fence_id, companion_id, joke_id)
    REFERENCES walk_jokes(fence_id, companion_id, id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_walk_acts_version_id ON walk_acts(version_id);
CREATE INDEX IF NOT EXISTS idx_walk_fences_area ON walk_fences(area_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_walk_jokes_fence_companion ON walk_jokes(fence_id, companion_id, sort_order);
