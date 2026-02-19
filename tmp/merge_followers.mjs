/**
 * Extract existing follower counts from OhioStateIPImpact.tsx to preserve them
 */

import { readFileSync, writeFileSync } from 'fs';

const src = readFileSync('src/components/OhioStateIPImpact.tsx', 'utf8');

// Extract big10Schools follower data
const followerMap = {};
const schoolPattern = /name:\s*'([^']+)'.*?followers:\s*(\d+)/g;
let match;
while ((match = schoolPattern.exec(src)) !== null) {
  const [, name, followers] = match;
  if (parseInt(followers) > 0) {
    followerMap[name] = parseInt(followers);
  }
}

console.log('Existing follower counts:');
Object.entries(followerMap).sort((a, b) => b[1] - a[1]).forEach(([name, f]) => {
  console.log(`  ${name}: ${f.toLocaleString()}`);
});

writeFileSync('/tmp/existing_followers.json', JSON.stringify(followerMap, null, 2));
console.log(`\nSaved ${Object.keys(followerMap).length} school follower counts`);
