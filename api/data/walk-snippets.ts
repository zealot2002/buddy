import {
  FORBIDDEN_CITY_NARRATIONS,
  SUMMER_PALACE_NARRATIONS,
  type NarrationScript,
  estimateSpeechDuration,
  pickRandomScript,
  normalizeCompanionId,
} from './narrations.js';
import { SHENYANG_SANHAO_NARRATIONS } from './shenyang-sanhao-narrations.js';

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
  lat: number;
  lng: number;
  radius: number;
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

/** 沈阳三好街测试围栏（WGS84），半径略大便于真机 GPS 触发 */
const SANHAO_FENCES = [
  { id: 'walk-sy-sanhao-wencui', lat: 41.75442, lng: 123.42005 },
  { id: 'walk-sy-bainaohui', lat: 41.76307, lng: 123.428712 },
  { id: 'walk-sy-huaqiang', lat: 41.762654, lng: 123.431419 },
  { id: 'walk-sy-weiyong', lat: 41.761989, lng: 123.432507 },
  { id: 'walk-sy-dongruan', lat: 41.761266, lng: 123.43412 },
];

export const walkSnippets: WalkSnippet[] = [
  ...FORBIDDEN_FENCES.map((fence, index) => ({
    id: fence.id,
    areaTag: 'forbidden-city',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: 30,
    },
    scripts: buildScriptsForFence(FORBIDDEN_CITY_NARRATIONS, index, FORBIDDEN_FENCES.length),
  })),
  ...SUMMER_FENCES.map((fence, index) => ({
    id: fence.id,
    areaTag: 'summer-palace',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: 35,
    },
    scripts: buildScriptsForFence(SUMMER_PALACE_NARRATIONS, index, SUMMER_FENCES.length),
  })),
  ...SANHAO_FENCES.map((fence, index) => ({
    id: fence.id,
    areaTag: 'shenyang-sanhao',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: 50,
    },
    scripts: buildScriptsForFence(SHENYANG_SANHAO_NARRATIONS, index, SANHAO_FENCES.length),
  })),
];

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

export function getNearbyWalkMetas(lat: number, lng: number, limit = 20): WalkSnippetMeta[] {
  return walkSnippets
    .map((snippet) => ({
      meta: toWalkSnippetMeta(snippet),
      distance: haversineMeters(lat, lng, snippet.location.lat, snippet.location.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ meta }) => meta);
}
