/**
 * 客户端 / 脚本用：类型与地理计算。
 * 服务端 walk 播放逻辑见 walk-service.ts（D1）与 functions/api/walk-db.js。
 */
export type {
  WalkAct,
  WalkArea,
  WalkCompanionJokes,
  WalkFence,
  WalkFenceLocation,
  WalkJoke,
} from './walk-area-types.js';

export { GONG_WANG_FU_AREA, GONG_WANG_FU_FENCES, WALK_AREAS } from './walk-areas.js';

export interface WalkSnippetMeta {
  id: string;
  label?: string;
  lat: number;
  lng: number;
  radius: number;
}

export interface WalkNearbyStatus extends WalkSnippetMeta {
  distanceMeters: number;
  inside: boolean;
}

export interface WalkPlayPayload {
  snippetId: string;
  companionId: string;
  versionId: string;
  content: string;
  styleNote: string;
  duration: number;
  triggerType: 'auto' | 'tap' | 'offsite';
  jokeId?: string;
  jokeLabel?: string;
  actIndex?: number;
  actCount?: number;
  actLabel?: string;
  fenceLabel?: string;
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
