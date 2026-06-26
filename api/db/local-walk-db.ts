import Database from 'better-sqlite3';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const DB_DIR = path.join(ROOT, '.data');
const DB_PATH = path.join(DB_DIR, 'walk.sqlite');
const MIGRATION_PATH = path.join(ROOT, 'migrations/0001_walk_content.sql');

let rawDb: Database.Database | null = null;

function getRawDb(): Database.Database {
  if (!rawDb) {
    mkdirSync(DB_DIR, { recursive: true });
    rawDb = new Database(DB_PATH);
    rawDb.pragma('journal_mode = WAL');
    rawDb.pragma('foreign_keys = ON');
  }
  return rawDb;
}

/** D1 兼容的 async adapter（本地 better-sqlite3） */
export function createLocalWalkDbAdapter() {
  const db = getRawDb();
  return {
    prepare(sql: string) {
      const stmt = db.prepare(sql);
      return {
        bind(...args: unknown[]) {
          return {
            all: async () => ({ results: stmt.all(...args) }),
            first: async () => stmt.get(...args) ?? null,
            run: async () => {
              stmt.run(...args);
            },
          };
        },
      };
    },
  };
}

export function runWalkMigrations() {
  const db = getRawDb();
  const sql = readFileSync(MIGRATION_PATH, 'utf8');
  db.exec(sql);
}

export function isWalkDbSeeded(): boolean {
  const db = getRawDb();
  const row = db.prepare('SELECT COUNT(*) AS count FROM walk_fences').get() as { count: number };
  return row.count > 0;
}

export function clearWalkContent() {
  const db = getRawDb();
  db.exec(`
    DELETE FROM walk_acts;
    DELETE FROM walk_jokes;
    DELETE FROM walk_fences;
    DELETE FROM walk_areas;
  `);
}

export function getLocalWalkDbPath(): string {
  return DB_PATH;
}

export function closeLocalWalkDb() {
  if (rawDb) {
    rawDb.close();
    rawDb = null;
  }
}

export function execLocalSql(sql: string) {
  getRawDb().exec(sql);
}

export function getLocalWalkDbForSeed() {
  return getRawDb();
}
