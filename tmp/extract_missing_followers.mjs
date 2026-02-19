import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./public/data/ncaa_roster.json', 'utf8'));

const allSchools = new Set(data.map(a => a?.schoolName).filter(Boolean));
console.log('Total schools in ncaa_roster.json:', allSchools.size);
console.log('\nAll school names:');
for (const s of [...allSchools].sort()) {
  console.log(`  ${s}`);
}

const schools = {};
for (const a of data) {
  const school = a?.schoolName;
  if (!school) continue;
  if (!schools[school]) schools[school] = { athletes: new Map() };
  const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
  const f7 = a?.metrics?.sevenDays?.followers || 0;
  const f30 = a?.metrics?.thirtyDays?.followers || 0;
  const f90 = a?.metrics?.ninetyDays?.followers || 0;
  const followers = Math.max(f7, f30, f90);
  const existing = schools[school].athletes.get(name) || 0;
  if (followers > existing) schools[school].athletes.set(name, followers);
}

console.log('\nFollower totals:');
const results = Object.entries(schools).map(([name, data]) => {
  let total = 0;
  for (const f of data.athletes.values()) total += f;
  return { name, totalFollowers: total, athletes: data.athletes.size };
}).sort((a, b) => b.totalFollowers - a.totalFollowers);

for (const r of results) {
  console.log(`${r.name}: ${r.totalFollowers.toLocaleString()} (${r.athletes} athletes)`);
}
