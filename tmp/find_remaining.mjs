import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/organizations.roster.json', 'utf8'));

// Search for Rice, George Mason, New Mexico, New Mexico State, Wichita State
const terms = ['rice', 'george mason', 'new mexico', 'wichita'];
const allSchools = new Set(data.map(a => a?.schoolName).filter(Boolean));

for (const term of terms) {
  const matches = [...allSchools].filter(s => s.toLowerCase().includes(term));
  console.log(`"${term}":`, matches.length > 0 ? matches : 'NOT FOUND');
}

// Also check NC State
const ncEntries = data.filter(a => a?.schoolName === 'North Carolina State');
if (ncEntries.length > 0) {
  const athletes = new Map();
  for (const a of ncEntries) {
    const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
    const f = Math.max(a?.metrics?.sevenDays?.followers || 0, a?.metrics?.thirtyDays?.followers || 0, a?.metrics?.ninetyDays?.followers || 0);
    const existing = athletes.get(name) || 0;
    if (f > existing) athletes.set(name, f);
  }
  let total = 0;
  for (const f of athletes.values()) total += f;
  console.log(`NC State (North Carolina State): ${total.toLocaleString()} (${athletes.size} athletes)`);
}

// Print ALL unique school names
console.log('\n=== All school names in organizations.roster.json ===');
for (const s of [...allSchools].sort()) {
  console.log(s);
}
