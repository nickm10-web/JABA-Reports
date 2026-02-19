import { readFileSync } from 'fs';
const d = JSON.parse(readFileSync('./public/data/Big10Contents.json', 'utf8'));
const sample = d[0];
console.log('Top-level keys:', Object.keys(sample));
console.log('athlete keys:', Object.keys(sample.athlete || {}));
console.log('metrics keys:', Object.keys(sample.metrics || {}));

// Search for anything follower-related
function findFollowers(obj, prefix = '') {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k.toLowerCase().includes('follow')) console.log(`${prefix}${k} =`, v);
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) findFollowers(v, `${prefix}${k}.`);
  }
}
findFollowers(sample);

// Aggregate followers per school from athlete data
const schools = {};
for (const p of d) {
  const s = p?.athlete?.school?.name || 'unknown';
  const name = p?.athlete?.name || '';
  if (!schools[s]) schools[s] = { athletes: new Map() };
  const existing = schools[s].athletes.get(name) || 0;
  const followers = p?.athlete?.followers || p?.athlete?.followerCount || p?.metrics?.followers || 0;
  if (followers > existing) schools[s].athletes.set(name, followers);
}
for (const [school, data] of Object.entries(schools)) {
  let total = 0;
  for (const f of data.athletes.values()) total += f;
  console.log(`${school}: ${total} followers (${data.athletes.size} athletes)`);
}
