import { readFileSync } from 'fs';

// Use the newer roster file
const data = JSON.parse(readFileSync('/Users/jaba/REPORTS/public/data/ncaa_roster_feb_12.json', 'utf8'));

const schools = {};
for (const a of data) {
  const school = a?.schoolName || 'unknown';
  if (!schools[school]) schools[school] = { athletes: new Map(), total: 0 };

  const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
  const followers = a?.metrics?.thirtyDays?.followers || 0;

  // Keep max followers per athlete name
  const existing = schools[school].athletes.get(name) || 0;
  if (followers > existing) {
    schools[school].athletes.set(name, followers);
  }
}

// Sum up
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
