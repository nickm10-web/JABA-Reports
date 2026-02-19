import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('public/data/last_ip_data_contents.json', 'utf8'));

// Get unique schools
const schools = {};
data.forEach(d => {
  const school = d.athlete?.school?.name || 'unknown';
  if (!schools[school]) schools[school] = 0;
  schools[school]++;
});

const sorted = Object.entries(schools).sort((a, b) => b[1] - a[1]);
console.log('Schools and post counts:');
sorted.forEach(([name, count]) => {
  console.log(`  ${name}: ${count}`);
});
console.log(`\nTotal schools: ${sorted.length}`);
console.log(`Total posts: ${data.length}`);
