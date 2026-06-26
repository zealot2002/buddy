import {
  estimateSpeechDuration,
  normalizeCompanionId,
} from './narrations.js';
import { GONG_WANG_FU_AREA, WALK_AREAS } from './walk-areas.js';
import type { WalkAct, WalkFence, WalkJoke } from './walk-area-types.js';
import { WALK_LISTEN_CONFIG } from '../config/walk-config.js';

export type { WalkAct, WalkFence, WalkJoke } from './walk-area-types.js';
export { GONG_WANG_FU_AREA, WALK_AREAS } from './walk-areas.js';

export type WalkTriggerType = 'auto' | 'tap' | 'offsite';

export interface WalkPlayOptions {
  jokeId?: string;
  actIndex?: number;
  randomJoke?: boolean;
  /** 随机选段子时排除已播放的 jokeId */
  excludeJokeIds?: string[];
  trigger?: WalkTriggerType;
}

export interface WalkPlayPayload {
  snippetId: string;
  companionId: string;
  versionId: string;
  content: string;
  styleNote: string;
  duration: number;
  triggerType: WalkTriggerType;
  jokeId?: string;
  jokeLabel?: string;
  actIndex?: number;
  actCount?: number;
  actLabel?: string;
  fenceLabel?: string;
}

/** @deprecated 兼容 sync 字段名，等同 WalkFence */
export interface WalkSnippet extends WalkFence {
  areaTag: string;
}

export interface WalkSnippetMeta {
  id: string;
  label?: string;
  lat: number;
  lng: number;
  radius: number;
  primaryCompanionId?: string;
}

export interface WalkNearbyStatus extends WalkSnippetMeta {
  distanceMeters: number;
  inside: boolean;
}

export const walkSnippets: WalkSnippet[] = WALK_AREAS.flatMap((area) =>
  area.fences.map((fence) => ({
    ...fence,
    areaTag: area.areaTag,
  })),
);

export const WALK_FENCE_LABELS: Record<string, string> = Object.fromEntries(
  walkSnippets.map((fence) => [fence.id, fence.label]),
);

export function findWalkFence(id: string): WalkFence | undefined {
  return walkSnippets.find((fence) => fence.id === id);
}

/** @deprecated */
export const findWalkSnippet = findWalkFence;

export function findActiveWalkFence(lat: number, lng: number): WalkFence | undefined {
  return walkSnippets
    .map((fence) => ({
      fence,
      distance: haversineMeters(lat, lng, fence.location.lat, fence.location.lng),
    }))
    .filter(({ fence, distance }) => distance <= fence.location.radiusMeters)
    .sort((a, b) => a.distance - b.distance)[0]?.fence;
}

/** @deprecated */
export const findActiveWalkSnippet = findActiveWalkFence;

export function findWalkJoke(fenceId: string, jokeId: string): WalkJoke | undefined {
  return findWalkFence(fenceId)?.jokes.find((joke) => joke.id === jokeId);
}

export function pickRandomJoke(fence: WalkFence, excludeJokeIds: string[] = []): WalkJoke | undefined {
  if (!fence.jokes.length) return undefined;
  const exclude = new Set(excludeJokeIds);
  const pool = fence.jokes.filter((joke) => !exclude.has(joke.id));
  if (!pool.length) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function countUnplayedJokes(fence: WalkFence, excludeJokeIds: string[] = []): number {
  const exclude = new Set(excludeJokeIds);
  return fence.jokes.filter((joke) => !exclude.has(joke.id)).length;
}

export function toWalkSnippetMeta(fence: WalkFence): WalkSnippetMeta {
  return {
    id: fence.id,
    label: fence.label ?? WALK_FENCE_LABELS[fence.id],
    lat: fence.location.lat,
    lng: fence.location.lng,
    radius: fence.location.radiusMeters,
    primaryCompanionId: fence.primaryCompanionId,
  };
}

export function resolveWalkPlay(
  fenceId: string,
  companionId?: string,
  options: WalkPlayOptions | WalkTriggerType = 'auto',
): WalkPlayPayload | null {
  const fence = findWalkFence(fenceId);
  if (!fence) return null;

  const resolvedOptions: WalkPlayOptions =
    typeof options === 'string' ? { trigger: options } : options;

  let joke: WalkJoke | undefined;
  if (resolvedOptions.jokeId) {
    joke = findWalkJoke(fenceId, resolvedOptions.jokeId);
  } else if (
    resolvedOptions.randomJoke !== false
    && (resolvedOptions.actIndex == null || resolvedOptions.actIndex === 0)
  ) {
    joke = pickRandomJoke(fence, resolvedOptions.excludeJokeIds ?? []);
  } else {
    joke = fence.jokes[0];
  }
  if (!joke?.acts.length) return null;

  const actIndex = Math.min(
    Math.max(resolvedOptions.actIndex ?? 0, 0),
    joke.acts.length - 1,
  );
  const act = joke.acts[actIndex];
  if (!act) return null;

  const normalizedId = normalizeCompanionId(companionId || fence.primaryCompanionId);
  const triggerType =
    resolvedOptions.trigger ?? (actIndex === 0 ? 'auto' : 'tap');

  return {
    snippetId: fenceId,
    companionId: normalizedId,
    versionId: act.versionId,
    content: act.content,
    styleNote: '',
    duration: estimateSpeechDuration(act.content),
    triggerType,
    jokeId: joke.id,
    jokeLabel: joke.label,
    actIndex,
    actCount: joke.acts.length,
    actLabel: act.label,
    fenceLabel: fence.label,
  };
}

export function resolveWalkAutoPlay(
  fenceId: string,
  companionId?: string,
  excludeJokeIds: string[] = [],
): WalkPlayPayload | null {
  return resolveWalkPlay(fenceId, companionId, {
    randomJoke: true,
    actIndex: 0,
    trigger: 'auto',
    excludeJokeIds,
  });
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

export function getNearbyWalkMetas(lat: number, lng: number, limit = WALK_LISTEN_CONFIG.nearby.limit): WalkSnippetMeta[] {
  return getNearbyWalkStatus(lat, lng, limit).map(({ distanceMeters: _d, inside: _i, ...meta }) => meta);
}

export function getNearbyWalkStatus(lat: number, lng: number, limit = WALK_LISTEN_CONFIG.nearby.limit): WalkNearbyStatus[] {
  return walkSnippets
    .map((fence) => {
      const distanceMeters = haversineMeters(lat, lng, fence.location.lat, fence.location.lng);
      const meta = toWalkSnippetMeta(fence);
      return {
        ...meta,
        distanceMeters: Math.round(distanceMeters),
        inside: distanceMeters <= fence.location.radiusMeters,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

export function getWalkPointById(id: string): WalkFence | undefined {
  return findWalkFence(id);
}
