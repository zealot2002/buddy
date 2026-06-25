import type { NarratorVersion } from './stories.js';
import {
  type NarrationScript,
  estimateSpeechDuration,
  pickRandomScript,
} from './narrations.js';

export interface ResolvedNarrator extends NarratorVersion {
  versionId?: string;
}

function scriptPool(narrator: NarratorVersion): NarrationScript[] {
  const primary: NarrationScript = {
    versionId: narrator.versionId || `${narrator.companionId}-default`,
    content: narrator.content,
    styleNote: narrator.styleNote,
  };

  const extras = (narrator.variants || []).map((variant) => ({
    versionId: variant.versionId,
    content: variant.content,
    styleNote: variant.styleNote || narrator.styleNote,
  }));

  return [primary, ...extras];
}

/** 从主稿 + variants 中随机选取一套讲解，用于播放与展示 */
export function resolveNarratorScript(narrator: NarratorVersion): ResolvedNarrator {
  const picked = pickRandomScript(scriptPool(narrator));
  const duration = estimateSpeechDuration(picked.content);

  return {
    ...narrator,
    versionId: picked.versionId,
    content: picked.content,
    styleNote: picked.styleNote,
    duration,
  };
}

export function findNarratorForCompanion(
  narrators: NarratorVersion[],
  companionId: string,
): NarratorVersion | undefined {
  return narrators.find((n) => n.companionId === companionId);
}

/** 旅伴选择 UI 用：每个 companionId 只保留一条 */
export function uniqueNarratorsByCompanion(narrators: NarratorVersion[]): NarratorVersion[] {
  const seen = new Set<string>();
  return narrators.filter((narrator) => {
    if (seen.has(narrator.companionId)) return false;
    seen.add(narrator.companionId);
    return true;
  });
}
