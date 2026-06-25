import { writeFileSync } from 'node:fs';
import { stories } from '../api/data/stories.js';
import { companions } from '../api/data/companions.js';
import { walkSnippets } from '../api/data/walk-snippets.js';
import { WALK_OFFSITE_CHATTER } from '../api/data/walk-offsite-chatter.js';

const payload = {
  stories,
  companions,
  walkSnippets,
  walkOffsiteChatter: WALK_OFFSITE_CHATTER,
};

writeFileSync(
  new URL('../functions/api/stories-data.json', import.meta.url),
  `${JSON.stringify(payload, null, 2)}\n`,
);

console.log('joyjoy synced functions/api/stories-data.json');
