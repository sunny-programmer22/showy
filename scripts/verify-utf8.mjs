import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

let bad = 0;
for (const f of execSync('git ls-files "*.tsx" "*.ts" "*.html" "*.md"', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)) {
  if (f.startsWith('scripts/')) continue;
  const s = readFileSync(f, 'utf8');
  const m = s.match(/[\u00E0\u00A7\u00B3]|[\u00E2][\u20AC]/g);
  if (m) {
    console.log('STILL BAD:', f, m.length);
    bad += m.length;
  }
}
console.log(bad ? 'TOTAL REMAINING: ' + bad : 'ALL CLEAN');
