import { writeFileSync } from 'node:fs';
import { stories } from '../api/data/stories.js';
import { companions } from '../api/data/companions.js';

const payload = { stories, companions };

writeFileSync(
  new URL('../functions/api/stories-data.json', import.meta.url),
  `${JSON.stringify(payload, null, 2)}\n`,
);

console.log('joyjoy synced functions/api/stories-data.json');
