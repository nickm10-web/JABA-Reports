import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/organizations.roster.json', 'utf8'));
const allSchools = [...new Set(data.map(a => a?.schoolName).filter(Boolean))].sort();

// Print ALL school names so we can find them
console.log(`Total schools: ${allSchools.length}\n`);
for (const s of allSchools) {
  console.log(s);
}
