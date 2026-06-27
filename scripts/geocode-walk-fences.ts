/**
 * 围栏坐标工具 — 恭王府 MVP（语料来自 D1 seeds）
 *
 * 用法：
 *   npm run geocode:fences -- convert --from gcj02 --lat 39.937 --lng 116.386
 *   npm run geocode:fences -- validate --lat 39.9371 --lng 116.3862
 *   npm run geocode:fences -- list
 */
import { toWgs84, type CoordSystem } from '../api/data/coord-utils.js';
import { haversineMeters } from '../api/data/walk-snippets.js';
import { walkGetFences, walkGetNearbyStatus } from '../api/data/walk-service.js';

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
  validate --lat <纬度> --lng <经度>
  list

语料坐标在 seeds/*.sql，改后 npm run db:seed:local -- --force`);
}

function cmdConvert(flags: Record<string, string>) {
  const from = (flags.from ?? 'gcj02') as CoordSystem;
  const lat = parseFloat(flags.lat ?? '');
  const lng = parseFloat(flags.lng ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('请提供 --lat 和 --lng');
    process.exit(1);
  }
  const wgs = toWgs84(lat, lng, from);
  console.log(JSON.stringify({ from, input: { lat, lng }, wgs84: wgs }, null, 2));
}

async function cmdValidate(flags: Record<string, string>) {
  const lat = parseFloat(flags.lat ?? '');
  const lng = parseFloat(flags.lng ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.error('请提供 --lat 和 --lng');
    process.exit(1);
  }

  console.log('joyjoy 恭王府围栏校验 @', lat, lng);
  console.log('');

  const nearby = await walkGetNearbyStatus(lat, lng, 20);
  for (const item of nearby) {
    const tag = item.inside ? '✓ 围栏内' : '  围栏外';
    console.log(
      `${tag}  ${item.label ?? item.id}  距离 ${item.distanceMeters}m / 半径 ${item.radius}m  [${item.id}]`,
    );
  }
}

async function cmdList() {
  const fences = await walkGetFences();
  console.log('恭王府围栏（WGS84）:\n');
  for (const fence of fences) {
    console.log(`${fence.label} [${fence.id}]`);
    console.log(`  lat: ${fence.lat}, lng: ${fence.lng}, radius: ${fence.radiusMeters}m`);
    if (fence.triggerHint) {
      console.log(`  hint: ${fence.triggerHint}`);
    }
    console.log('');
  }
}

const { command, flags } = parseArgs(process.argv);

(async () => {
  switch (command) {
    case 'convert':
      cmdConvert(flags);
      break;
    case 'validate':
      await cmdValidate(flags);
      break;
    case 'list':
      await cmdList();
      break;
    default:
      printHelp();
  }
})().catch((error) => {
  console.error('joyjoy geocode failed:', error);
  process.exit(1);
});
