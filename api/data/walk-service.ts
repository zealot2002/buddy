import { APP_CONFIG } from '../config/index.js';
import {
  createLocalWalkDbAdapter,
  isWalkDbSeeded,
  runWalkMigrations,
} from '../db/local-walk-db.js';
import { seedWalkFromSql } from '../../scripts/seed-walk-from-sql.js';
import {
  findActiveFence,
  getFencesByArea,
  getNearbyWalkMetas,
  getNearbyWalkStatus,
  resolveWalkAutoPlay,
  resolveWalkPlay,
} from '../../functions/api/walk-db.js';

let readyPromise: Promise<void> | null = null;

async function ensureReady() {
  if (!readyPromise) {
    readyPromise = (async () => {
      runWalkMigrations();
      if (!isWalkDbSeeded()) {
        seedWalkFromSql();
      }
    })();
  }
  await readyPromise;
}

function getDb() {
  return createLocalWalkDbAdapter();
}

function getSpeechConfig() {
  return APP_CONFIG.speech;
}

export async function walkGetFences(areaId = 'gong-wang-fu') {
  await ensureReady();
  return getFencesByArea(getDb(), areaId);
}

export async function walkGetNearbyMetas(lat: number, lng: number, limit?: number) {
  await ensureReady();
  return getNearbyWalkMetas(getDb(), lat, lng, limit ?? APP_CONFIG.walk.nearby.limit);
}

export async function walkGetNearbyStatus(lat: number, lng: number, limit?: number) {
  await ensureReady();
  return getNearbyWalkStatus(getDb(), lat, lng, limit ?? APP_CONFIG.walk.nearby.limit);
}

export async function walkFindActiveFence(lat: number, lng: number) {
  await ensureReady();
  return findActiveFence(getDb(), lat, lng);
}

export async function walkResolvePlay(
  fenceId: string,
  companionId?: string,
  options: Parameters<typeof resolveWalkPlay>[3] = {},
) {
  await ensureReady();
  return resolveWalkPlay(getDb(), fenceId, companionId, options, getSpeechConfig());
}

export async function walkResolveAutoPlay(
  fenceId: string,
  companionId?: string,
  excludeJokeIds: string[] = [],
) {
  await ensureReady();
  return resolveWalkAutoPlay(getDb(), fenceId, companionId, excludeJokeIds, getSpeechConfig());
}

export { ensureReady as ensureWalkDbReady };
