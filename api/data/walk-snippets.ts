import {
  estimateSpeechDuration,
  normalizeCompanionId,
} from './narrations.js';
import {
  GONG_WANG_FU_FENCE_LABELS,
  GONG_WANG_FU_RADIUS,
  GONG_WANG_FU_WALK_POINTS,
} from './gong-wang-fu-walk.js';
import { WALK_LISTEN_CONFIG } from '../config/walk-config.js';

export interface WalkScriptVariant {
  versionId: string;
  content: string;
  styleNote?: string;
  label?: string;
}

/** L1 + L2-A + L2-B + L3 树形语料 */
export interface WalkTreeContent {
  l1: WalkScriptVariant;
  l2A: WalkScriptVariant;
  l2B: WalkScriptVariant;
  l3: WalkScriptVariant;
}

/** @deprecated 旧版 auto/tap 结构，保留类型兼容 */
export interface WalkCompanionScripts {
  auto: { variants: WalkScriptVariant[] };
  tap: { variants: WalkScriptVariant[] };
}

export interface WalkSnippet {
  id: string;
  label?: string;
  areaTag?: string;
  primaryCompanionId: string;
  location: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };
  tree: WalkTreeContent;
  /** @deprecated */
  scripts?: Record<string, WalkCompanionScripts>;
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

export type WalkTreeLayer = 'L1' | 'L2' | 'L3';
export type WalkBranch = 'A' | 'B';
export type WalkTriggerType = 'auto' | 'tap' | 'offsite';

export interface WalkPlayOptions {
  layer?: WalkTreeLayer;
  branch?: WalkBranch;
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
  layer?: WalkTreeLayer;
  branch?: WalkBranch;
  label?: string;
}

export const walkSnippets: WalkSnippet[] = GONG_WANG_FU_WALK_POINTS.map((point) => ({
  id: point.id,
  label: point.label,
  areaTag: 'gong-wang-fu',
  primaryCompanionId: point.primaryCompanionId,
  location: {
    lat: point.lat,
    lng: point.lng,
    radiusMeters: GONG_WANG_FU_RADIUS,
  },
  tree: point.tree,
}));

export const WALK_FENCE_LABELS: Record<string, string> = {
  ...GONG_WANG_FU_FENCE_LABELS,
};

export function findWalkSnippet(id: string): WalkSnippet | undefined {
  return walkSnippets.find((snippet) => snippet.id === id);
}

export function findActiveWalkSnippet(lat: number, lng: number): WalkSnippet | undefined {
  return walkSnippets
    .map((snippet) => ({
      snippet,
      distance: haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
    }))
    .filter(({ snippet, distance }) => distance <= snippet.location.radiusMeters)
    .sort((a, b) => a.distance - b.distance)[0]?.snippet;
}

export function toWalkSnippetMeta(snippet: WalkSnippet): WalkSnippetMeta {
  return {
    id: snippet.id,
    label: snippet.label ?? WALK_FENCE_LABELS[snippet.id],
    lat: snippet.location.lat,
    lng: snippet.location.lng,
    radius: snippet.location.radiusMeters,
    primaryCompanionId: snippet.primaryCompanionId,
  };
}

function resolveTreeVariant(
  tree: WalkTreeContent,
  layer: WalkTreeLayer,
  branch: WalkBranch,
): WalkScriptVariant | null {
  switch (layer) {
    case 'L1':
      return tree.l1;
    case 'L2':
      return branch === 'B' ? tree.l2B : tree.l2A;
    case 'L3':
      return tree.l3;
    default:
      return null;
  }
}

export function resolveWalkPlay(
  snippetId: string,
  companionId?: string,
  options: WalkPlayOptions | WalkTriggerType = 'auto',
): WalkPlayPayload | null {
  const snippet = findWalkSnippet(snippetId);
  if (!snippet) return null;

  const resolvedOptions: WalkPlayOptions =
    typeof options === 'string' ? { trigger: options } : options;
  const layer = resolvedOptions.layer ?? 'L1';
  const branch = resolvedOptions.branch ?? 'A';
  const normalizedId = normalizeCompanionId(companionId || snippet.primaryCompanionId);
  const variant = resolveTreeVariant(snippet.tree, layer, branch);
  if (!variant) return null;

  const triggerType =
    resolvedOptions.trigger ?? (layer === 'L1' ? 'auto' : 'tap');

  return {
    snippetId,
    companionId: normalizedId,
    versionId: variant.versionId,
    content: variant.content,
    styleNote: variant.styleNote ?? '',
    duration: estimateSpeechDuration(variant.content),
    triggerType,
    layer,
    branch: layer === 'L2' ? branch : undefined,
    label:
      layer === 'L2'
        ? branch === 'B'
          ? snippet.tree.l2B.label
          : snippet.tree.l2A.label
        : snippet.label,
  };
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
    .map((snippet) => {
      const distanceMeters = haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng);
      const meta = toWalkSnippetMeta(snippet);
      return {
        ...meta,
        distanceMeters: Math.round(distanceMeters),
        inside: distanceMeters <= snippet.location.radiusMeters,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
}

export function getWalkPointById(id: string): WalkSnippet | undefined {
  return findWalkSnippet(id);
}
