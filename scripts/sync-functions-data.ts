import { writeFileSync } from 'node:fs';
import { APP_CONFIG } from '../api/config/index.js';
import { stories } from '../api/data/stories.js';
import { companions } from '../api/data/companions.js';
import { WALK_OFFSITE_CHATTER } from '../api/data/walk-offsite-chatter.js';

/** walk 语料已迁 D1；stories-data 仅保留 stories / companions / 配置 */
const payload = {
  stories,
  companions,
  walkOffsiteChatter: WALK_OFFSITE_CHATTER,
  appConfig: APP_CONFIG,
};

writeFileSync(
  new URL('../functions/api/stories-data.json', import.meta.url),
  `${JSON.stringify(payload, null, 2)}\n`,
);

console.log('joyjoy synced functions/api/stories-data.json (walk content in D1)');
