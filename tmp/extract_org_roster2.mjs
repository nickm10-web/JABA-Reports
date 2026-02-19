import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./public/data/organizations.roster.json', 'utf8'));

// Map of exact schoolName -> our canonical name
const schoolMap = {
  'Texas Tech': 'Texas Tech',
  'Miami': 'Miami',
  'Houston': 'Houston',
  'Ole Miss': 'Ole Miss',
  'West Virginia': 'West Virginia',
  'Southern Methodist University (SMU)': 'SMU',
  'Rice': 'Rice',
  'Georgia Tech': 'Georgia Tech',
  'Florida State': 'Florida State',
  'Boston College': 'Boston College',
  'Mississippi': 'Mississippi State',
  'BYU': 'BYU',
  'George Mason': 'George Mason',
  'Vanderbilt': 'Vanderbilt',
  'TCU': 'TCU',
  'Colorado': 'Colorado',
  'New Mexico State': 'New Mexico State',
  'Wichita State': 'Wichita State',
  'Iowa State': 'Iowa State',
  'Kansas State': 'Kansas State',
  'Utah': 'Utah',
  'Oklahoma State': 'Oklahoma State',
  'DUKE': 'Duke',
  'Providence': 'Providence',
  'North Carolina State': 'NC State',
  'New Mexico': 'New Mexico',
  // Common alt names
  'University of New Mexico': 'New Mexico',
  'New Mexico State University': 'New Mexico State',
  'Wichita State University': 'Wichita State',
  'Rice University': 'Rice',
  'George Mason University': 'George Mason',
  'Providence College': 'Providence',
};

// Pro teams / non-college to exclude
const proTeams = new Set([
  'Houston Rockets', 'Houston Texans', 'Miami Heats', 'Miami Dolphins',
  'Utah Jazz', 'Utah Mammoth', 'Colorado Avalanche', 'Florida',
  'Virginia', 'Oklahoma', 'Iowa', 'Kansas', 'North Carolina State',
  'Illinois', 'Minnesota', 'Kentucky', 'Michigan', 'Tennessee',
]);

// Also check league field - only want NCAA
const schools = {};
for (const a of data) {
  const rawSchool = a?.schoolName || '';

  // Skip pro teams
  if (proTeams.has(rawSchool)) continue;

  const canonical = schoolMap[rawSchool];
  if (!canonical) continue;

  // Extra validation: skip if leagueId suggests pro sports
  const league = a?.leagueId || a?.league || '';

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

console.log('Results (college only):');
const results = [];
for (const [name, data] of Object.entries(schools)) {
  let total = 0;
  for (const f of data.athletes.values()) total += f;
  results.push({ name, totalFollowers: total, athletes: data.athletes.size, rawNames: [...data.rawNames] });
}
results.sort((a, b) => b.totalFollowers - a.totalFollowers);

for (const r of results) {
  console.log(`${r.name}: ${r.totalFollowers.toLocaleString()} (${r.athletes} athletes) [${r.rawNames.join(', ')}]`);
}

// Still missing?
const targetSchools = new Set([
  'Texas Tech', 'Miami', 'Houston', 'Ole Miss', 'West Virginia', 'SMU', 'Rice',
  'Georgia Tech', 'Florida State', 'Boston College', 'Mississippi State', 'BYU',
  'George Mason', 'Vanderbilt', 'TCU', 'Colorado', 'New Mexico State', 'Wichita State',
  'Iowa State', 'Kansas State', 'Utah', 'Oklahoma State', 'Duke', 'Providence',
  'NC State', 'New Mexico'
]);
const found = new Set(results.map(r => r.name));
const stillMissing = [...targetSchools].filter(s => !found.has(s));
if (stillMissing.length > 0) console.log('\nStill missing:', stillMissing.join(', '));

// Check what "Florida State" actually maps to - there might be a specific name
const floridaEntries = data.filter(a => a?.schoolName && a.schoolName.toLowerCase().includes('florida'));
const floridaSchools = new Set(floridaEntries.map(a => a.schoolName));
console.log('\nAll Florida-related school names:', [...floridaSchools]);

// Same for others that might have collisions
for (const term of ['virginia', 'iowa', 'kansas', 'oklahoma', 'colorado', 'utah', 'mississippi', 'miami', 'houston', 'duke']) {
  const entries = data.filter(a => a?.schoolName?.toLowerCase().includes(term));
  const names = new Set(entries.map(a => a.schoolName));
  console.log(`"${term}" school names:`, [...names]);
}
