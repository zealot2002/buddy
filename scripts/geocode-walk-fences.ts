/**
 * 围栏坐标工具 — 不必逐个现场跑点。
 *
 * 用法：
 *   npm run geocode:fences -- convert --from gcj02 --lat 41.768 --lng 123.427
 *   npm run geocode:fences -- convert --from bd09 --lat 41.771 --lng 123.441
 *   npm run geocode:fences -- validate --lat 41.7621 --lng 123.4207
 *   npm run geocode:fences -- list
 *
 * 批量建围栏推荐流程（每个区域只需 1 次现场锚点）：
 *   1. 在目标 POI 用浏览器 GPS 拿到 WGS84，写入 registry 的 ANCHOR
 *   2. 在同区域地图（高德/百度）拾取各 POI 坐标，写入 BD09/GCJ02 参考表
 *   3. 运行 npm run geocode:fences -- list 核对输出 WGS84
 *   4. 任意位置运行 validate，确认距离合理
 */
import { toWgs84, type CoordSystem } from '../api/data/coord-utils.js';
import {
  SHENYANG_SANHAO_FENCES,
  SANHAO_WGS84_ANCHOR,
} from '../api/data/walk-fence-registry.js';
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
  validate --lat <纬度> --lng <经度>   查看距各围栏距离
  list                                 列出三好街围栏 WGS84

注意:
  - 浏览器 Geolocation → WGS84
  - 高德/腾讯拾取 → GCJ-02，需 convert --from gcj02
  - 百度拾取 → BD-09，需 convert --from bd09
  - 切勿把地图坐标直接写进 walk-snippets`);
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
  console.log('WGS84（写入围栏）:', { lat: wgsLat, lng: wgsLng });
}

function cmdValidate(flags: Record<string, string>) {
  const lat = parseFloat(flags.lat ?? '');
  const lng = parseFloat(flags.lng ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('请提供 --lat 和 --lng');
    process.exit(1);
  }

  console.log('joyjoy 围栏校验 @', lat, lng);
  console.log('锚点（百脑汇现场 WGS84）:', SANHAO_WGS84_ANCHOR);
  console.log('');

  const nearby = getNearbyWalkStatus(lat, lng, 15);
  for (const item of nearby) {
    const tag = item.inside ? '✓ 围栏内' : '  围栏外';
    console.log(
      `${tag}  ${item.label ?? item.id}  距离 ${item.distanceMeters}m / 半径 ${item.radius}m  [${item.id}]`,
    );
  }

  const anchorDist = Math.round(
    haversineMeters(lat, lng, SANHAO_WGS84_ANCHOR.lat, SANHAO_WGS84_ANCHOR.lng),
  );
  console.log('');
  console.log(`距百脑汇锚点 ${anchorDist}m`);
}

function cmdList() {
  console.log('沈阳三好街围栏（WGS84）:\n');
  for (const fence of SHENYANG_SANHAO_FENCES) {
    console.log(`${fence.label} [${fence.id}]`);
    console.log(`  lat: ${fence.lat}, lng: ${fence.lng}, radius: ${fence.radiusMeters}m`);
    console.log(`  source: ${fence.coordSource}, address: ${fence.address ?? '-'}`);
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
