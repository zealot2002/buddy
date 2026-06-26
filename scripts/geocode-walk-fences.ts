/**
 * 围栏坐标工具 — 恭王府 MVP
 *
 * 用法：
 *   npm run geocode:fences -- convert --from gcj02 --lat 39.937 --lng 116.386
 *   npm run geocode:fences -- validate --lat 39.9371 --lng 116.3862
 *   npm run geocode:fences -- list
 */
import { toWgs84, type CoordSystem } from '../api/data/coord-utils.js';
import { GONG_WANG_FU_AREA, GONG_WANG_FU_FENCES } from '../api/data/walk-areas.js';
import { getNearbyWalkStatus, haversineMeters } from '../api/data/walk-snippets.js';

function parseArgs(argv: string[]) {
  const args = argv.slice(2);
  const command = args[0] ?? 'help';
  const flags: Record<string, string> = {};
  for (let i = 1; i < args.length; i += 1) {
    if (args[i]?.startsWith('--')) {
      flags[args[i].slice(2)] = args[i + 1] ?? 'true';
      i += 1;
    }
  }
  return { command, flags };
}

function printHelp() {
  console.log(`围栏坐标工具（输出均为 WGS84，与手机 GPS 一致）

命令:
  convert --from gcj02|bd09 --lat <纬度> --lng <经度>
  validate --lat <纬度> --lng <经度>   查看距恭王府各围栏距离
  list                                 列出恭王府围栏 WGS84

注意:
  - 浏览器 Geolocation → WGS84
  - 高德/腾讯拾取 → GCJ-02，需 convert --from gcj02
  - 百度拾取 → BD-09，需 convert --from bd09
  - 语料坐标写在 api/data/gong-wang-fu.json`);
}

function cmdConvert(flags: Record<string, string>) {
  const from = (flags.from ?? 'gcj02') as CoordSystem;
  const lat = parseFloat(flags.lat ?? '');
  const lng = parseFloat(flags.lng ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('请提供 --lat 和 --lng');
    process.exit(1);
  }
  if (from === 'wgs84') {
    console.log('已是 WGS84，无需转换:', { lat, lng });
    return;
  }
  const [wgsLng, wgsLat] = toWgs84(lng, lat, from);
  console.log('WGS84（写入围栏 JSON）:', { lat: wgsLat, lng: wgsLng });
}

function cmdValidate(flags: Record<string, string>) {
  const lat = parseFloat(flags.lat ?? '');
  const lng = parseFloat(flags.lng ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('请提供 --lat 和 --lng');
    process.exit(1);
  }

  const sim = GONG_WANG_FU_AREA.simulation;
  console.log('joyjoy 恭王府围栏校验 @', lat, lng);
  if (sim) {
    console.log('模拟基准点:', { lat: sim.baseLat, lng: sim.baseLng });
  }
  console.log('');

  const nearby = getNearbyWalkStatus(lat, lng, 20);
  for (const item of nearby) {
    const tag = item.inside ? '✓ 围栏内' : '  围栏外';
    console.log(
      `${tag}  ${item.label ?? item.id}  距离 ${item.distanceMeters}m / 半径 ${item.radius}m  [${item.id}]`,
    );
  }

  if (sim) {
    const baseDist = Math.round(haversineMeters(lat, lng, sim.baseLat, sim.baseLng));
    console.log('');
    console.log(`距模拟基准点 ${baseDist}m`);
  }
}

function cmdList() {
  console.log('恭王府围栏（WGS84）:\n');
  for (const fence of GONG_WANG_FU_FENCES) {
    console.log(`${fence.label} [${fence.id}]`);
    console.log(
      `  lat: ${fence.location.lat}, lng: ${fence.location.lng}, radius: ${fence.location.radiusMeters}m`,
    );
    if (fence.triggerHint) {
      console.log(`  hint: ${fence.triggerHint}`);
    }
    console.log('');
  }
}

const { command, flags } = parseArgs(process.argv);

switch (command) {
  case 'convert':
    cmdConvert(flags);
    break;
  case 'validate':
    cmdValidate(flags);
    break;
  case 'list':
    cmdList();
    break;
  default:
    printHelp();
}
