import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./public/data/ncaa_roster_feb_12.json', 'utf8'));

// Get ALL unique school names
const schools = {};
for (const a of data) {
  const school = a?.schoolName || 'unknown';
  if (!schools[school]) schools[school] = { count: 0, withFollowers: 0, totalFollowers: 0, athletes: new Map() };
  schools[school].count++;

  const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
  const f7 = a?.metrics?.sevenDays?.followers || 0;
  const f30 = a?.metrics?.thirtyDays?.followers || 0;
  const f90 = a?.metrics?.ninetyDays?.followers || 0;
  const followers = Math.max(f7, f30, f90);

  if (followers > 0) schools[school].withFollowers++;

  const existing = schools[school].athletes.get(name) || 0;
  if (followers > existing) schools[school].athletes.set(name, followers);
}

console.log('Total unique school names:', Object.keys(schools).length);
console.log('\nAll schools:');
const results = Object.entries(schools).map(([name, data]) => {
  let total = 0;
  for (const f of data.athletes.values()) total += f;
  return { name, athletes: data.count, withFollowers: data.withFollowers, totalFollowers: total };
}).sort((a, b) => b.totalFollowers - a.totalFollowers);

for (const r of results) {
  console.log(`${r.name}: ${r.totalFollowers.toLocaleString()} followers (${r.athletes} athletes, ${r.withFollowers} with data)`);
}

// Specifically check for the missing schools
const missing = ['Texas Tech', 'Miami', 'Houston', 'Ole Miss', 'West Virginia', 'SMU', 'Rice', 'Georgia Tech', 'Florida State', 'Boston College', 'Mississippi State', 'BYU', 'George Mason', 'Vanderbilt', 'TCU', 'Colorado', 'New Mexico State', 'Wichita State', 'Iowa State', 'Kansas State', 'Utah', 'Oklahoma State', 'Duke', 'Providence', 'NC State', 'Oklahoma', 'New Mexico'];
console.log('\n=== Checking missing schools ===');
for (const m of missing) {
  // Try exact match and partial match
  const exact = schools[m];
  if (exact) {
    let total = 0;
    for (const f of exact.athletes.values()) total += f;
    console.log(`FOUND exact "${m}": ${total.toLocaleString()} followers`);
  } else {
    // Try partial match
    const partial = Object.keys(schools).filter(s => s.toLowerCase().includes(m.toLowerCase()));
    if (partial.length > 0) {
      console.log(`NOT exact "${m}" but found similar: ${partial.join(', ')}`);
    } else {
      console.log(`MISSING "${m}" - no match at all`);
    }
  }
}
