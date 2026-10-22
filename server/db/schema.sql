-- =============================================================
-- Hobbies Time Tracker — database schema (SQLite)
--
-- This file runs every time the server starts. `IF NOT EXISTS`
-- makes it safe to re-run: existing tables and data are untouched.
--
-- Model:
--   entrants  (dimension)  — the people tracking time
--   hobbies   (dimension)  — a shared catalogue of hobbies
--   time_entries (fact)    — one row per timed session,
--                            linking an entrant to a hobby
--
-- All timestamps are stored as ISO-8601 text in UTC
-- (e.g. '2026-10-22 09:30:00'). Convert to local time in the UI.
-- =============================================================

CREATE TABLE IF NOT EXISTS entrants (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hobbies (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS time_entries (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    entrant_id        INTEGER NOT NULL REFERENCES entrants(id) ON DELETE CASCADE,
    hobby_id          INTEGER NOT NULL REFERENCES hobbies(id)  ON DELETE CASCADE,
    started_at        TEXT    NOT NULL,           -- when "Start" was pressed
    ended_at          TEXT,                       -- when "Stop" was pressed (NULL while running)
    duration_seconds  INTEGER NOT NULL DEFAULT 0  -- active time only, pauses excluded
                      CHECK (duration_seconds >= 0),
    created_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Speeds up "total time per entrant per hobby" queries (the accumulated-time feature).
CREATE INDEX IF NOT EXISTS idx_time_entries_entrant_hobby
    ON time_entries (entrant_id, hobby_id);
