/** 景区 → 围栏 → 段子 → 幕 */

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

export interface WalkFenceLocation {
  lat: number;
  lng: number;
  radiusMeters: number;
}

export interface WalkFence {
  id: string;
  label: string;
  triggerHint?: string;
  primaryCompanionId: string;
  location: WalkFenceLocation;
  jokes: WalkJoke[];
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
