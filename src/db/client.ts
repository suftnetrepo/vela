import * as SQLite from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as schema from './schema'

const sqlite = SQLite.openDatabaseSync('vela.db')
export const db = drizzle(sqlite, { schema })

export async function initDatabase(): Promise<void> {
  await sqlite.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS cycles (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      start_date    TEXT NOT NULL,
      end_date      TEXT,
      period_length INTEGER,
      cycle_length  INTEGER,
      is_active     INTEGER DEFAULT 1,
      notes         TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      date          TEXT NOT NULL UNIQUE,
      cycle_id      INTEGER REFERENCES cycles(id),
      flow          TEXT,
      mood          TEXT,
      energy_level  INTEGER,
      sexual_desire INTEGER,
      temperature   REAL,
      weight        REAL,
      notes         TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS symptom_logs (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      date         TEXT NOT NULL,
      daily_log_id INTEGER REFERENCES daily_logs(id),
      symptom_key  TEXT NOT NULL,
      intensity    INTEGER DEFAULT 1,
      created_at   TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      type         TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      expo_id      TEXT,
      delivered    INTEGER DEFAULT 0,
      created_at   TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
    CREATE INDEX IF NOT EXISTS idx_symptom_logs_date ON symptom_logs(date);
    CREATE INDEX IF NOT EXISTS idx_cycles_start_date ON cycles(start_date);
  `)
}

export default db
