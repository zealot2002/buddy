/**
 * 边走边听运营策略配置（单一数据源）
 * 后续运营端可直接读写此结构，通过 /api/config/walk 下发至客户端。
 */

export interface WalkGeoLocationConfig {
  enableHighAccuracy: boolean;
  maximumAgeMs: number;
  timeoutMs: number;
}

/** 场景 A：围栏自动触发节流 */
export interface WalkAutoTriggerConfig {
  /** 两条主动触发最小间隔（毫秒） */
  cooldownMs: number;
  /** 或自上次触发起移动超过此距离（米） */
  minDistanceMeters: number;
}

export interface WalkFenceRadiusConfig {
  /** 按区域标签覆盖默认半径（米） */
  byAreaTag: Record<string, number>;
  /** 未匹配 areaTag 时的默认半径（米） */
  defaultMeters: number;
}

export interface WalkNearbyConfig {
  /** /walk/nearby 返回的最大围栏数 */
  limit: number;
}

export interface WalkListenConfig {
  /** 配置版本，运营端迁移用 */
  version: number;
  autoTrigger: WalkAutoTriggerConfig;
  geolocation: WalkGeoLocationConfig;
  fence: WalkFenceRadiusConfig;
  nearby: WalkNearbyConfig;
}

export interface WalkAutoTriggerGate {
  at: number;
  lat: number;
  lng: number;
}

export const WALK_LISTEN_CONFIG: WalkListenConfig = {
  version: 1,
  autoTrigger: {
    cooldownMs: 2 * 60 * 1000,
    minDistanceMeters: 500,
  },
  geolocation: {
    enableHighAccuracy: true,
    maximumAgeMs: 5000,
    timeoutMs: 15000,
  },
  fence: {
    byAreaTag: {
      'forbidden-city': 30,
      'summer-palace': 35,
      'shenyang-sanhao': 80,
    },
    defaultMeters: 50,
  },
  nearby: {
    limit: 20,
  },
};

export function getFenceRadiusMeters(areaTag?: string): number {
  if (areaTag && WALK_LISTEN_CONFIG.fence.byAreaTag[areaTag] != null) {
    return WALK_LISTEN_CONFIG.fence.byAreaTag[areaTag];
  }
  return WALK_LISTEN_CONFIG.fence.defaultMeters;
}

/** 主动触发是否满足冷却 / 位移条件（需传入 haversine 距离函数，避免 config 层依赖 snippets） */
export function canAutoTriggerWalk(
  gate: WalkAutoTriggerGate | null,
  lat: number,
  lng: number,
  distanceMeters: (lat1: number, lng1: number, lat2: number, lng2: number) => number,
  config: WalkAutoTriggerConfig = WALK_LISTEN_CONFIG.autoTrigger,
): boolean {
  if (!gate) return true;
  if (Date.now() - gate.at >= config.cooldownMs) return true;
  return distanceMeters(lat, lng, gate.lat, gate.lng) >= config.minDistanceMeters;
}
