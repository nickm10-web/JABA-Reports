import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./public/data/Big10roster.json', 'utf8'));

console.log('Total records:', data.length);
console.log('Sample keys:', Object.keys(data[0]));

// Check for follower data
const sample = data[0];
console.log('metrics keys:', Object.keys(sample?.metrics || {}));
if (sample?.metrics?.thirtyDays) console.log('thirtyDays keys:', Object.keys(sample.metrics.thirtyDays));

// Aggregate followers per school
const schools = {};
for (const a of data) {
  const school = a?.schoolName || 'unknown';
  if (!schools[school]) schools[school] = { athletes: new Map() };

  const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
  const followers = a?.metrics?.thirtyDays?.followers || a?.metrics?.followers || a?.followers || 0;

  const existing = schools[school].athletes.get(name) || 0;
  if (followers > existing) {
    schools[school].athletes.set(name, followers);
  }
}

const results = [];
for (const [school, data] of Object.entries(schools)) {
  let total = 0;
  for (const f of data.athletes.values()) total += f;
  results.push({ school, followers: total, athletes: data.athletes.size });
}

results.sort((a, b) => b.followers - a.followers);
for (const r of results) {
  console.log(`${r.school}: ${r.followers.toLocaleString()} (${r.athletes} athletes)`);
}
