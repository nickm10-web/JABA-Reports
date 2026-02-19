import { readFileSync } from 'fs';
console.log('Loading feb_18...');
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));
console.log('Loaded', data.length, 'records');

const avg = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.engagementRate||0), 0) / posts.length * 100 : 0;

// Gather all unique school names
const allSchoolNames = new Set();
data.forEach(p => { if (p?.athlete?.school?.name) allSchoolNames.add(p.athlete.school.name); });

// Schools we need to check (using exact names from dataset)
// First let's discover the right names
const targets = [
  'University Of Georgia',
  'North Carolina State',
  'Oklahoma',
  'Ole Miss',
  'West Virginia',
  'Southern Methodist University (SMU)',
  'Rice University',
  'Florida State',
  'Boston College',
  'DePaul',
  'Vanderbilt',
  'San Diego State',
  'TCU',
  'Mississippi',
  'Colorado',
  'Kansas',
  'Utah',
  'Oklahoma State',
  'Kansas State',
  'Providence',
  'Boise State',
  'Pittsburgh',
  'Robert Morris',
  'Michigan',
  'Texas Tech',
  'Houston',
  'Florida',
  'Georgia Tech',
  'Duke',
  'New Mexico State',
];

console.log('\n--- All school names in dataset (sample) ---');
const sortedNames = [...allSchoolNames].sort();
// Show all
sortedNames.forEach(n => console.log(' ', n));

console.log('\n--- Matches for our targets ---');
targets.forEach(name => {
  const all = data.filter(p => p?.athlete?.school?.name === name);
  if (!all.length) {
    // Try case-insensitive partial
    const variants = sortedNames.filter(s => s.toLowerCase().includes(name.toLowerCase().split(' ').filter(Boolean).pop() || ''));
    console.log(`${name}: NOT FOUND (possible: ${variants.slice(0,3).join(', ')})`);
    return;
  }
  const logo = all.filter(p => p.hasOrganizationLogo);
  const mention = all.filter(p => p.hasOrganizationInCaption);
  const collab = all.filter(p => p.isOrganizationCollaboration);
  const withAny = all.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
  console.log(`${name}: ${all.length} posts, adoption ${(withAny.length/all.length*100).toFixed(1)}%`);
  console.log(`  logo: ${logo.length} eng=${avg(logo).toFixed(2)}%  mention: ${mention.length} eng=${avg(mention).toFixed(2)}%  collab: ${collab.length} eng=${avg(collab).toFixed(2)}%`);
});
