import {
  FORBIDDEN_CITY_NARRATIONS,
  SUMMER_PALACE_NARRATIONS,
  type NarrationScript,
  estimateSpeechDuration,
  pickRandomScript,
  normalizeCompanionId,
} from './narrations.js';
import { SHENYANG_SANHAO_NARRATIONS } from './shenyang-sanhao-narrations.js';
import { SHENYANG_SANHAO_FENCES, WALK_FENCE_LABELS } from './walk-fence-registry.js';
import { getFenceRadiusMeters, WALK_LISTEN_CONFIG } from '../config/walk-config.js';

export interface WalkScriptVariant {
  versionId: string;
  content: string;
  styleNote?: string;
}

export interface WalkCompanionScripts {
  /** 场景A：围栏自动触发，与眼前画面强绑定 */
  auto: { variants: WalkScriptVariant[] };
  /** 场景B：围栏内点击头像，延伸解读，与 auto 不同稿 */
  tap: { variants: WalkScriptVariant[] };
}

export interface WalkSnippet {
  id: string;
  label?: string;
  areaTag?: string;
  location: {
    lat: number;
    lng: number;
    radiusMeters: number;
  };
  scripts: Record<string, WalkCompanionScripts>;
}

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

export type WalkTriggerType = 'auto' | 'tap' | 'offsite';

export interface WalkPlayPayload {
  snippetId: string;
  companionId: string;
  versionId: string;
  content: string;
  styleNote: string;
  duration: number;
  triggerType: WalkTriggerType;
}

const COMPANION_IDS = ['su-dongpo', 'lin-huiyin', 'gentle-lady', 'sharp-elder'] as const;

function splitIntoParts(content: string, partIndex: number, totalParts: number): string {
  const sentences = content.match(/[^。！？]+[。！？]/g) ?? [content];
  const chunkSize = Math.max(1, Math.ceil(sentences.length / totalParts));
  const start = partIndex * chunkSize;
  return sentences.slice(start, start + chunkSize).join('').trim() || content;
}

function buildScriptsForFence(
  narrations: Record<string, NarrationScript[]>,
  autoPartIndex: number,
  totalParts: number,
): Record<string, WalkCompanionScripts> {
  const scripts: Record<string, WalkCompanionScripts> = {};
  const tapPartIndex = (autoPartIndex + 1) % totalParts;

  for (const companionId of COMPANION_IDS) {
    const primary = narrations[companionId]?.[0];
    if (!primary) continue;

    const autoContent = splitIntoParts(primary.content, autoPartIndex, totalParts);
    const tapContent = splitIntoParts(primary.content, tapPartIndex, totalParts);

    scripts[companionId] = {
      auto: {
        variants: [
          {
            versionId: `${primary.versionId}-auto-${autoPartIndex + 1}`,
            content: autoContent,
            styleNote: primary.styleNote,
          },
        ],
      },
      tap: {
        variants: [
          {
            versionId: `${primary.versionId}-tap-${tapPartIndex + 1}`,
            content: tapContent,
            styleNote: `${primary.styleNote} · 延伸解读`,
          },
        ],
      },
    };
  }

  return scripts;
}

const FORBIDDEN_FENCES = [
  { id: 'walk-fc-wumen', lat: 39.9139, lng: 116.3974 },
  { id: 'walk-fc-taihedian', lat: 39.9163, lng: 116.3972 },
  { id: 'walk-fc-qianqing', lat: 39.918, lng: 116.3973 },
  { id: 'walk-fc-yuhuayuan', lat: 39.9238, lng: 116.3967 },
];

const SUMMER_FENCES = [
  { id: 'walk-sp-dongdi', lat: 39.9995, lng: 116.278 },
  { id: 'walk-sp-foxiangge', lat: 39.9978, lng: 116.2755 },
  { id: 'walk-sp-shifang', lat: 39.998, lng: 116.273 },
  { id: 'walk-sp-qikongqiao', lat: 39.9988, lng: 116.279 },
];

export const walkSnippets: WalkSnippet[] = [
  ...FORBIDDEN_FENCES.map((fence, index) => ({
    id: fence.id,
    areaTag: 'forbidden-city',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: getFenceRadiusMeters('forbidden-city'),
    },
    scripts: buildScriptsForFence(FORBIDDEN_CITY_NARRATIONS, index, FORBIDDEN_FENCES.length),
  })),
  ...SUMMER_FENCES.map((fence, index) => ({
    id: fence.id,
    areaTag: 'summer-palace',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: getFenceRadiusMeters('summer-palace'),
    },
    scripts: buildScriptsForFence(SUMMER_PALACE_NARRATIONS, index, SUMMER_FENCES.length),
  })),
  ...SHENYANG_SANHAO_FENCES.map((fence, index) => ({
    id: fence.id,
    label: fence.label,
    areaTag: 'shenyang-sanhao',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: fence.radiusMeters,
    },
    scripts: buildScriptsForFence(SHENYANG_SANHAO_NARRATIONS, index, SHENYANG_SANHAO_FENCES.length),
  })),
];

export { WALK_FENCE_LABELS };

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
  };
}

export function resolveWalkPlay(
  snippetId: string,
  companionId: string,
  trigger: 'auto' | 'tap' = 'auto',
): WalkPlayPayload | null {
  const snippet = findWalkSnippet(snippetId);
  if (!snippet) return null;

  const normalizedId = normalizeCompanionId(companionId);
  const companionScripts = snippet.scripts[normalizedId];
  const pool = trigger === 'tap' ? companionScripts?.tap : companionScripts?.auto;
  if (!pool?.variants.length) return null;

  const picked = pickRandomScript(
    pool.variants.map((variant) => ({
      versionId: variant.versionId,
      content: variant.content,
      styleNote: variant.styleNote ?? '',
    })),
  );

  return {
    snippetId,
    companionId: normalizedId,
    versionId: picked.versionId,
    content: picked.content,
    styleNote: picked.styleNote,
    duration: estimateSpeechDuration(picked.content),
    triggerType: trigger,
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
