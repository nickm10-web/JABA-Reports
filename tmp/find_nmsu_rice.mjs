import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/organizations.roster.json', 'utf8'));

// Search for anything matching new mexico state or rice
const allSchools = new Set(data.map(a => a?.schoolName).filter(Boolean));

for (const s of [...allSchools].sort()) {
  const lower = s.toLowerCase();
  if (lower.includes('new mexico') || lower.includes('nmsu') || lower.includes('rice')) {
    // Get followers
    const athletes = new Map();
    for (const a of data) {
      if (a?.schoolName !== s) continue;
      const name = `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
      const f = Math.max(
        a?.metrics?.sevenDays?.followers || 0,
        a?.metrics?.thirtyDays?.followers || 0,
        a?.metrics?.ninetyDays?.followers || 0
      );
      const existing = athletes.get(name) || 0;
      if (f > existing) athletes.set(name, f);
    }
    let total = 0;
    for (const f of athletes.values()) total += f;
    console.log(`"${s}": ${total.toLocaleString()} followers (${athletes.size} athletes)`);
  }
}
