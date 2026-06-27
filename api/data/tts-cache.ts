import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CACHE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../.data/tts-cache',
);

/** 缓存键：voice_id + 合成文本 digest（SHA-256 前 32 位，等价于 MD5 长度） */
export function ttsCacheObjectKey(voiceId: string, synthesisText: string): string {
  const digest = createHash('sha256').update(synthesisText, 'utf8').digest('hex').slice(0, 32);
  return `tts/${voiceId}/${digest}.mp3`;
}

export function getLocalTtsCachePath(objectKey: string): string {
  return path.join(CACHE_ROOT, objectKey);
}

export function readLocalTtsCache(objectKey: string): Buffer | null {
  const filePath = getLocalTtsCachePath(objectKey);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath);
}

export function writeLocalTtsCache(objectKey: string, data: Buffer | ArrayBuffer): void {
  const filePath = getLocalTtsCachePath(objectKey);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, Buffer.from(data));
}
