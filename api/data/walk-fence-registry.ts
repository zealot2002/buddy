import { bd09ToGcj02, gcj02OffsetToWgs84, toWgs84, type CoordSystem } from './coord-utils.js';
import { getFenceRadiusMeters } from '../config/walk-config.js';

export type WalkFenceCoordSource =
  | 'wgs84-osm'
  | 'wgs84-field'
  | 'gcj02-converted'
  | 'gcj02-offset-from-wgs84-anchor';

export interface WalkFenceDefinition {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  coordSource: WalkFenceCoordSource;
  address?: string;
}

/** 百度 BD-09 拾取坐标（仅用于计算相对位置，勿直接写入围栏） */
const SANHAO_BD09 = {
  bainaohui: { lat: 41.771231, lng: 123.441431, label: '百脑汇', address: '和平区三好街90甲5号' },
  huaqiang: { lat: 41.77085, lng: 123.44412, label: '华强广场', address: '和平区三好街96号' },
  weiyong: { lat: 41.7702, lng: 123.4452, label: '维用科技大厦', address: '和平区三好街84号' },
  dongruan: { lat: 41.7695, lng: 123.4468, label: '东软电脑城', address: '和平区三好街66号' },
  wencui: { lat: 41.7625, lng: 123.4328, label: '文萃路三好街路口', address: '文萃路与三好街交叉口' },
} as const;

/** 百脑汇写字间现场 WGS84（浏览器 GPS 实测，作为三好街唯一需要现场标定的锚点） */
export const SANHAO_WGS84_ANCHOR = {
  lat: 41.7621,
  lng: 123.4207,
  label: '百脑汇',
} as const;

function bd09AsGcj02(lat: number, lng: number): { lat: number; lng: number } {
  const [gcjLng, gcjLat] = bd09ToGcj02(lng, lat);
  return { lat: gcjLat, lng: gcjLng };
}

function buildSanhaoFencesFromAnchor(): WalkFenceDefinition[] {
  const anchor = SANHAO_WGS84_ANCHOR;
  const anchorGcj = bd09AsGcj02(SANHAO_BD09.bainaohui.lat, SANHAO_BD09.bainaohui.lng);

  const sanhaoRadius = getFenceRadiusMeters('shenyang-sanhao');
  const points = [
    { key: 'bainaohui', id: 'walk-sy-bainaohui', radiusMeters: sanhaoRadius },
    { key: 'huaqiang', id: 'walk-sy-huaqiang', radiusMeters: sanhaoRadius },
    { key: 'weiyong', id: 'walk-sy-weiyong', radiusMeters: sanhaoRadius },
    { key: 'dongruan', id: 'walk-sy-dongruan', radiusMeters: sanhaoRadius },
    { key: 'wencui', id: 'walk-sy-sanhao-wencui', radiusMeters: sanhaoRadius },
  ] as const;

  return points.map(({ key, id, radiusMeters }) => {
    const ref = SANHAO_BD09[key];
    const isAnchor = key === 'bainaohui';
    const targetGcj = bd09AsGcj02(ref.lat, ref.lng);
    const [lng, lat] = isAnchor
      ? [anchor.lng, anchor.lat]
      : gcj02OffsetToWgs84(
          anchor.lat,
          anchor.lng,
          anchorGcj.lat,
          anchorGcj.lng,
          targetGcj.lat,
          targetGcj.lng,
        );

    return {
      id,
      label: ref.label,
      lat,
      lng,
      radiusMeters,
      coordSource: isAnchor ? 'wgs84-field' : 'gcj02-offset-from-wgs84-anchor',
      address: ref.address,
    };
  });
}

export const SHENYANG_SANHAO_FENCES: WalkFenceDefinition[] = buildSanhaoFencesFromAnchor();

export const WALK_FENCE_LABELS: Record<string, string> = Object.fromEntries(
  SHENYANG_SANHAO_FENCES.map((fence) => [fence.id, fence.label]),
);

/** 从高德/百度复制单点坐标时，显式声明来源再转 WGS84 */
export function fenceFromMapPick(
  id: string,
  label: string,
  lat: number,
  lng: number,
  from: Exclude<CoordSystem, 'wgs84'>,
  radiusMeters: number,
  address?: string,
): WalkFenceDefinition {
  const [wgsLng, wgsLat] = toWgs84(lng, lat, from);
  return {
    id,
    label,
    lat: wgsLat,
    lng: wgsLng,
    radiusMeters,
    coordSource: 'gcj02-converted',
    address,
  };
}
