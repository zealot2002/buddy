/**
 * 坐标系转换工具。
 *
 * 浏览器 Geolocation API 返回 WGS84。
 * 高德/腾讯地图拾取 → GCJ-02；百度地图拾取 → BD-09。
 * 围栏中心必须存 WGS84，否则会出现数百米级偏差。
 */

const PI = Math.PI;
const A = 6378245.0;
const EE = 0.00669342162296594323;

function outOfChina(lng: number, lat: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(lng: number, lat: number): number {
  let ret =
    -100.0 +
    2.0 * lng +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lng * lat +
    0.2 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(lng: number, lat: number): number {
  let ret =
    300.0 +
    lng +
    2.0 * lat +
    0.1 * lng * lng +
    0.1 * lng * lat +
    0.1 * Math.sqrt(Math.abs(lng));
  ret += ((20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lng * PI) + 40.0 * Math.sin((lng / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lng / 12.0) * PI) + 300.0 * Math.sin((lng / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

export type CoordSystem = 'wgs84' | 'gcj02' | 'bd09';

export function gcj02ToWgs84(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  const radlat = (lat / 180.0) * PI;
  let magic = Math.sin(radlat);
  magic = 1 - EE * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((A * (1 - EE)) / (magic * sqrtmagic)) * PI);
  dlng = (dlng * 180.0) / ((A / sqrtmagic) * Math.cos(radlat) * PI);
  return [lng - dlng, lat - dlat];
}

export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  const radlat = (lat / 180.0) * PI;
  let magic = Math.sin(radlat);
  magic = 1 - EE * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((A * (1 - EE)) / (magic * sqrtmagic)) * PI);
  dlng = (dlng * 180.0) / ((A / sqrtmagic) * Math.cos(radlat) * PI);
  return [lng + dlng, lat + dlat];
}

export function bd09ToGcj02(lng: number, lat: number): [number, number] {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * PI * 3000.0 / 180.0);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * PI * 3000.0 / 180.0);
  return [z * Math.cos(theta), z * Math.sin(theta)];
}

export function bd09ToWgs84(lng: number, lat: number): [number, number] {
  const [gcjLng, gcjLat] = bd09ToGcj02(lng, lat);
  return gcj02ToWgs84(gcjLng, gcjLat);
}

export function toWgs84(lng: number, lat: number, from: CoordSystem): [number, number] {
  if (from === 'wgs84') return [lng, lat];
  if (from === 'gcj02') return gcj02ToWgs84(lng, lat);
  return bd09ToWgs84(lng, lat);
}

/** 在 WGS84 平面上按米偏移（短距离足够精确） */
export function offsetWgs84Meters(
  lat: number,
  lng: number,
  eastMeters: number,
  northMeters: number,
): [number, number] {
  const dLat = northMeters / 111_320;
  const dLng = eastMeters / (111_320 * Math.cos((lat * PI) / 180));
  return [lng + dLng, lat + dLat];
}

/** GCJ-02 相对偏移 → 应用到已知 WGS84 锚点（批量建围栏推荐） */
export function gcj02OffsetToWgs84(
  anchorWgsLat: number,
  anchorWgsLng: number,
  anchorGcjLat: number,
  anchorGcjLng: number,
  targetGcjLat: number,
  targetGcjLng: number,
): [number, number] {
  const cosLat = Math.cos((anchorGcjLat * PI) / 180);
  const northM = (targetGcjLat - anchorGcjLat) * 111_320;
  const eastM = (targetGcjLng - anchorGcjLng) * 111_320 * cosLat;
  return offsetWgs84Meters(anchorWgsLat, anchorWgsLng, eastM, northM);
}
