import { seedWalkContentFromJson } from './seed-walk-d1.js';

const force = process.argv.includes('--force');
seedWalkContentFromJson({ force });
