import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clearWalkContent,
  execLocalSql,
  isWalkDbSeeded,
  runWalkMigrations,
} from '../api/db/local-walk-db.js';

const SEEDS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../seeds');

export function seedWalkFromSql(options: { force?: boolean } = {}) {
  runWalkMigrations();

  if (!options.force && isWalkDbSeeded()) {
    console.log('joyjoy walk DB already seeded, skip (use --force to replace)');
    return { seeded: false };
  }

  if (options.force) {
    clearWalkContent();
  }

  const files = readdirSync(SEEDS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  if (!files.length) {
    throw new Error('joyjoy no seed SQL found in seeds/');
  }

  for (const file of files) {
    const sql = readFileSync(path.join(SEEDS_DIR, file), 'utf8');
    execLocalSql(sql);
    console.log('joyjoy applied seed:', file);
  }

  return { seeded: true, files: files.length };
}
