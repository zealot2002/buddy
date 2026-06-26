import gongWangFuData from './gong-wang-fu.json';
import type { WalkArea } from './walk-area-types.js';

export const GONG_WANG_FU_AREA = gongWangFuData as WalkArea;

/** 已接入的景区语料（一景区一 JSON） */
export const WALK_AREAS: WalkArea[] = [GONG_WANG_FU_AREA];

export const GONG_WANG_FU_FENCES = GONG_WANG_FU_AREA.fences;

export const GONG_WANG_FU_FENCE_LABELS: Record<string, string> = Object.fromEntries(
  GONG_WANG_FU_FENCES.map((fence) => [fence.id, fence.label]),
);
