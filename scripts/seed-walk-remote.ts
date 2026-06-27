import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEEDS_DIR = path.join(ROOT, 'seeds');

const files = readdirSync(SEEDS_DIR)
  .filter((name) => name.endsWith('.sql'))
  .sort();

if (!files.length) {
  throw new Error('joyjoy no seed SQL found');
}

for (const file of files) {
  const filePath = path.join(SEEDS_DIR, file);
  console.log('joyjoy remote seed:', file);
  execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', 'buddy-walk', '--remote', `--file=${filePath}`],
    {
      stdio: 'inherit',
      cwd: ROOT,
      env: { ...process.env, CI: 'true' },
    },
  );
}

console.log('joyjoy remote seed complete:', files.length, 'files');
