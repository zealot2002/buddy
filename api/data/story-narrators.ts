import {
  FORBIDDEN_CITY_NARRATIONS,
  SUMMER_PALACE_NARRATIONS,
  estimateSpeechDuration,
} from './narrations.js';
import type { NarratorVersion } from './stories.js';

export interface NarratorVariant {
  versionId: string;
  content: string;
  styleNote?: string;
  duration?: number;
}

function buildNarrators(
  map: Record<string, Array<{ versionId: string; content: string; styleNote: string }>>,
): NarratorVersion[] {
  return Object.entries(map).map(([companionId, scripts]) => {
    const [primary, ...rest] = scripts;
    return {
      companionId,
      versionId: primary.versionId,
      content: primary.content,
      styleNote: primary.styleNote,
      duration: estimateSpeechDuration(primary.content),
      variants: rest.length
        ? rest.map((script) => ({
            versionId: script.versionId,
            content: script.content,
            styleNote: script.styleNote,
          }))
        : undefined,
    };
  });
}

export const forbiddenCityNarrators = buildNarrators(FORBIDDEN_CITY_NARRATIONS);
export const summerPalaceNarrators = buildNarrators(SUMMER_PALACE_NARRATIONS);
