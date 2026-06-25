import {
  FORBIDDEN_CITY_NARRATIONS,
  SUMMER_PALACE_NARRATIONS,
  type NarrationScript,
  estimateSpeechDuration,
  pickRandomScript,
  normalizeCompanionId,
} from './narrations.js';

export interface WalkScriptVariant {
  versionId: string;
  content: string;
  styleNote?: string;
}

export interface WalkCompanionScripts {
  variants: WalkScriptVariant[];
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

export interface WalkPlayPayload {
  snippetId: string;
  companionId: string;
  versionId: string;
  content: string;
  styleNote: string;
  duration: number;
}

const COMPANION_IDS = ['su-dongpo', 'lin-huiyin', 'gentle-lady', 'sharp-elder'] as const;

function splitIntoParts(content: string, partIndex: number, totalParts: number): string {
  const sentences = content.match(/[^。！？]+[。！？]/g) ?? [content];
  const chunkSize = Math.max(1, Math.ceil(sentences.length / totalParts));
  const start = partIndex * chunkSize;
  return sentences.slice(start, start + chunkSize).join('').trim() || content;
}

function buildScriptsForPart(
  narrations: Record<string, NarrationScript[]>,
  partIndex: number,
  totalParts: number,
): Record<string, WalkCompanionScripts> {
  const scripts: Record<string, WalkCompanionScripts> = {};

  for (const companionId of COMPANION_IDS) {
    const primary = narrations[companionId]?.[0];
    if (!primary) continue;

    const partContent = splitIntoParts(primary.content, partIndex, totalParts);
    scripts[companionId] = {
      variants: [
        {
          versionId: `${primary.versionId}-part-${partIndex + 1}`,
          content: partContent,
          styleNote: primary.styleNote,
        },
      ],
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
      radiusMeters: 30,
    },
    scripts: buildScriptsForPart(FORBIDDEN_CITY_NARRATIONS, index, FORBIDDEN_FENCES.length),
  })),
  ...SUMMER_FENCES.map((fence, index) => ({
    id: fence.id,
    areaTag: 'summer-palace',
    location: {
      lat: fence.lat,
      lng: fence.lng,
      radiusMeters: 35,
    },
    scripts: buildScriptsForPart(SUMMER_PALACE_NARRATIONS, index, SUMMER_FENCES.length),
  })),
];

export function findWalkSnippet(id: string): WalkSnippet | undefined {
  return walkSnippets.find((snippet) => snippet.id === id);
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
): WalkPlayPayload | null {
  const snippet = findWalkSnippet(snippetId);
  if (!snippet) return null;

  const normalizedId = normalizeCompanionId(companionId);
  const companionScripts = snippet.scripts[normalizedId];
  if (!companionScripts?.variants.length) return null;

  const picked = pickRandomScript(
    companionScripts.variants.map((variant) => ({
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
