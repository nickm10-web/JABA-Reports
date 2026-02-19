import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/organizations.roster.json', 'utf8'));

// Search ALL fields for rice or new mexico state
for (const a of data) {
  const all = JSON.stringify(a).toLowerCase();
  if (all.includes('rice university') || all.includes('new mexico state')) {
    const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
    const school = a?.schoolName || '';
    const org = a?.organizationId || '';
    const f30 = a?.metrics?.thirtyDays?.followers || 0;
    console.log(`FOUND: ${name} | school: "${school}" | org: ${org} | followers: ${f30}`);
  }
}
