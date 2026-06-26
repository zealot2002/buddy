/** 景区 → 围栏 → 旅伴 → 段子 → 幕 */

export interface WalkAct {
  versionId: string;
  content: string;
  label?: string;
}

export interface WalkJoke {
  id: string;
  label?: string;
  acts: WalkAct[];
}

export interface WalkCompanionJokes {
  jokes: WalkJoke[];
}

export interface WalkFenceLocation {
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface WalkFence {
  id: string;
  label: string;
  triggerHint?: string;
  location: WalkFenceLocation;
  /** 每位旅伴在该围栏下的段子池（MVP：su-dongpo / sharp-elder） */
  byCompanion: Record<string, WalkCompanionJokes>;
}

export interface WalkAreaSimulation {
  baseLat: number;
  baseLng: number;
  coordStepLat: number;
  radiusMeters: number;
}

export interface WalkArea {
  id: string;
  name: string;
  areaTag: string;
  simulation?: WalkAreaSimulation;
  fences: WalkFence[];
}
