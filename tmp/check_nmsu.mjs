import { readFileSync } from 'fs';

// Check ncaa_roster_contents for New Mexico State
const data = JSON.parse(readFileSync('./public/data/ncaa_roster_contents_feb_12.json', 'utf8'));
const nmsu = data.filter(p => {
  const school = p?.athlete?.school?.name || '';
  return school.toLowerCase().includes('new mexico state');
});
console.log('NMSU posts found:', nmsu.length);
if (nmsu.length > 0) {
  // Check for follower data in metrics
  const sample = nmsu[0];
  console.log('Sample metrics:', JSON.stringify(sample?.metrics, null, 2));
  console.log('Sample athlete:', JSON.stringify(sample?.athlete, null, 2));

  // Try to get unique athletes with followers
  const athletes = new Map();
  for (const p of nmsu) {
    const name = p?.athlete?.name || '';
    const followers = p?.metrics?.followers || p?.athlete?.followers || 0;
    const existing = athletes.get(name) || 0;
    if (followers > existing) athletes.set(name, followers);
  }
  let total = 0;
  for (const f of athletes.values()) total += f;
  console.log(`Total followers from posts: ${total} (${athletes.size} athletes)`);
}

// Also check the ncaa_roster_feb_12.json for any New Mexico entry
const roster = JSON.parse(readFileSync('./public/data/ncaa_roster_feb_12.json', 'utf8'));
const nmsuRoster = roster.filter(a => {
  const school = a?.schoolName || '';
  return school.toLowerCase().includes('new mexico');
});
console.log('\nNMSU in roster:', nmsuRoster.length);
if (nmsuRoster.length > 0) {
  console.log('School names:', [...new Set(nmsuRoster.map(a => a.schoolName))]);
}
