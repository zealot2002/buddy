import { execFileSync } from 'node:child_process';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getElevenLabsApiKey } from '../api/config/tts-config.js';
import {
  readCachedTtsAudio,
  synthesizeSpeechWithFallback,
  resolveTtsCacheKey,
} from '../api/data/tts-synthesize.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB_PATH = path.join(ROOT, '.data/walk.sqlite');
const BUCKET = 'buddy-tts-cache';

interface WalkActRow {
  companion_id: string;
  content: string;
  version_id: string;
}

function loadWalkActs(): WalkActRow[] {
  const db = new Database(DB_PATH, { readonly: true });
  try {
    return db.prepare(`
      SELECT companion_id, content, version_id
      FROM walk_acts
      ORDER BY fence_id, companion_id, joke_id, act_index
    `).all() as WalkActRow[];
  } finally {
    db.close();
  }
}

async function ensureCached(companionId: string, content: string): Promise<string> {
  const existing = readCachedTtsAudio(companionId, content);
  if (existing) {
    const { objectKey } = resolveTtsCacheKey(companionId, content);
    return objectKey;
  }

  if (!getElevenLabsApiKey()) {
    throw new Error('ELEVENLABS_API_KEY is required for pregenerate');
  }

  const result = await synthesizeSpeechWithFallback({ text: content, companionId });
  const { objectKey } = resolveTtsCacheKey(companionId, content);
  console.log('joyjoy generated:', objectKey, `(${result.provider})`);
  return objectKey;
}

function uploadToR2(objectKey: string): void {
  const filePath = path.join(ROOT, '.data/tts-cache', objectKey);
  execFileSync(
    'npx',
    ['wrangler', 'r2', 'object', 'put', `${BUCKET}/${objectKey}`, `--file=${filePath}`, '--remote'],
    { stdio: 'inherit', cwd: ROOT, env: { ...process.env, CI: 'true' } },
  );
}

async function main() {
  const uploadRemote = process.argv.includes('--remote');
  const acts = loadWalkActs();
  console.log('joyjoy pregenerate walk TTS:', acts.length, 'acts');

  const keys = new Set<string>();
  for (const act of acts) {
    const objectKey = await ensureCached(act.companion_id, act.content);
    keys.add(objectKey);
    if (uploadRemote) {
      uploadToR2(objectKey);
    }
  }

  console.log('joyjoy done:', keys.size, 'unique audio objects');
  if (!uploadRemote) {
    console.log('joyjoy local cache at .data/tts-cache/ — add --remote to upload to R2');
  }
}

main().catch((error) => {
  console.error('joyjoy pregenerate failed:', error);
  process.exit(1);
});
