import { readFileSync, writeFileSync } from 'fs';

// The missing schools we need follower data for
const targetSchools = new Set([
  'Texas Tech', 'Miami', 'Houston', 'Ole Miss', 'West Virginia', 'SMU', 'Rice',
  'Georgia Tech', 'Florida State', 'Boston College', 'Mississippi State', 'BYU',
  'George Mason', 'Vanderbilt', 'TCU', 'Colorado', 'New Mexico State', 'Wichita State',
  'Iowa State', 'Kansas State', 'Utah', 'Oklahoma State', 'Duke', 'Providence',
  'NC State', 'New Mexico'
]);

// Also common alternate names
const altNames = {
  'brigham young university': 'BYU',
  'brigham young': 'BYU',
  'byu': 'BYU',
  'texas christian': 'TCU',
  'texas christian university': 'TCU',
  'southern methodist': 'SMU',
  'southern methodist university': 'SMU',
  'north carolina state': 'NC State',
  'nc state': 'NC State',
  'mississippi state': 'Mississippi State',
  'ole miss': 'Ole Miss',
  'university of mississippi': 'Ole Miss',
  'george mason': 'George Mason',
  'george mason university': 'George Mason',
  'georgia tech': 'Georgia Tech',
  'georgia institute of technology': 'Georgia Tech',
  'boston college': 'Boston College',
  'florida state': 'Florida State',
  'florida state university': 'Florida State',
  'iowa state': 'Iowa State',
  'iowa state university': 'Iowa State',
  'kansas state': 'Kansas State',
  'kansas state university': 'Kansas State',
  'oklahoma state': 'Oklahoma State',
  'oklahoma state university': 'Oklahoma State',
  'west virginia': 'West Virginia',
  'west virginia university': 'West Virginia',
  'texas tech': 'Texas Tech',
  'texas tech university': 'Texas Tech',
  'miami': 'Miami',
  'university of miami': 'Miami',
  'houston': 'Houston',
  'university of houston': 'Houston',
  'rice': 'Rice',
  'rice university': 'Rice',
  'vanderbilt': 'Vanderbilt',
  'vanderbilt university': 'Vanderbilt',
  'colorado': 'Colorado',
  'university of colorado': 'Colorado',
  'new mexico state': 'New Mexico State',
  'new mexico state university': 'New Mexico State',
  'new mexico': 'New Mexico',
  'university of new mexico': 'New Mexico',
  'wichita state': 'Wichita State',
  'wichita state university': 'Wichita State',
  'utah': 'Utah',
  'university of utah': 'Utah',
  'duke': 'Duke',
  'duke university': 'Duke',
  'providence': 'Providence',
  'providence college': 'Providence',
  'smu': 'SMU',
  'tcu': 'TCU',
};

function matchSchool(name) {
  if (!name) return null;
  // Direct match
  if (targetSchools.has(name)) return name;
  // Alt name match
  const lower = name.toLowerCase().trim();
  if (altNames[lower]) return altNames[lower];
  // Partial match
  for (const [alt, canonical] of Object.entries(altNames)) {
    if (lower.includes(alt) || alt.includes(lower)) return canonical;
  }
  return null;
}

console.log('Reading organizations.roster.json...');
const data = JSON.parse(readFileSync('./public/data/organizations.roster.json', 'utf8'));
console.log('Total records:', data.length);

// Get all unique school names
const allSchools = new Set();
for (const a of data) {
  const school = a?.schoolName || a?.school?.name || a?.school;
  if (school) allSchools.add(school);
}
console.log('Unique schools:', allSchools.size);

// Aggregate followers for target schools
const schools = {};
let matched = 0;
for (const a of data) {
  const rawSchool = a?.schoolName || a?.school?.name || a?.school || '';
  const canonical = matchSchool(rawSchool);
  if (!canonical) continue;
  matched++;

  if (!schools[canonical]) schools[canonical] = { athletes: new Map(), rawNames: new Set() };
  schools[canonical].rawNames.add(rawSchool);

  const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
  const f7 = a?.metrics?.sevenDays?.followers || 0;
  const f30 = a?.metrics?.thirtyDays?.followers || 0;
  const f90 = a?.metrics?.ninetyDays?.followers || 0;
  const followers = Math.max(f7, f30, f90);

  const existing = schools[canonical].athletes.get(name) || 0;
  if (followers > existing) schools[canonical].athletes.set(name, followers);
}

console.log('Matched records:', matched);
console.log('\nResults:');
const results = [];
for (const [name, data] of Object.entries(schools)) {
  let total = 0;
  for (const f of data.athletes.values()) total += f;
  results.push({ name, totalFollowers: total, athletes: data.athletes.size, rawNames: [...data.rawNames] });
}
results.sort((a, b) => b.totalFollowers - a.totalFollowers);

for (const r of results) {
  console.log(`${r.name}: ${r.totalFollowers.toLocaleString()} (${r.athletes} athletes) [raw: ${r.rawNames.join(', ')}]`);
}

// Check which targets we still didn't find
const found = new Set(results.map(r => r.name));
const stillMissing = [...targetSchools].filter(s => !found.has(s));
if (stillMissing.length > 0) {
  console.log('\nStill missing:', stillMissing.join(', '));
  // Print unmatched school names that might be these
  console.log('\nUnmatched school names in file:');
  for (const s of [...allSchools].sort()) {
    if (!matchSchool(s)) {
      // Check if it might be related to a missing school
      const lower = s.toLowerCase();
      for (const m of stillMissing) {
        if (lower.includes(m.toLowerCase().split(' ')[0])) {
          console.log(`  "${s}" (might be ${m})`);
        }
      }
    }
  }
}
