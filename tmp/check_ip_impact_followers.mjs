import { readFileSync, readdirSync } from 'fs';
import path from 'path';

const dataDir = './public/data';
const files = readdirSync(dataDir).filter(f => f.includes('ip-impact'));

for (const f of files.sort()) {
  try {
    const data = JSON.parse(readFileSync(path.join(dataDir, f), 'utf8'));
    const followers = data?.followers || 0;
    const school = data?.school?.name || 'unknown';
    if (followers > 0) {
      console.log(`${school}: ${followers.toLocaleString()} [${f}]`);
    }
  } catch (e) {
    // skip
  }
}
