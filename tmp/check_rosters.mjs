import { readFileSync, statSync } from 'fs';

const files = [
  '/Users/jaba/Downloads/ncaa_roster.json',
  '/Users/jaba/Downloads/ncaa_roster_feb_12.json',
  '/Users/jaba/REPORTS/public/data/ncaa_roster.json',
  '/Users/jaba/REPORTS/public/data/ncaa_roster_feb_12.json',
  '/Users/jaba/JABA/public/data/ncaa_roster.json',
];

for (const f of files) {
  try {
    const stat = statSync(f);
    const sizeMB = (stat.size / 1024 / 1024).toFixed(1);
    const modified = stat.mtime.toISOString().slice(0, 10);

    const data = JSON.parse(readFileSync(f, 'utf8'));
    const count = Array.isArray(data) ? data.length : 'not array';

    // Check for follower data
    if (Array.isArray(data) && data.length > 0) {
      const sample = data[0];
      const keys = Object.keys(sample);
      const hasFollowers = sample?.metrics?.thirtyDays?.followers !== undefined;
      const schools = new Set(data.map(a => a?.schoolName || a?.school?.name || 'unknown'));

      // Count athletes with non-zero followers
      let withFollowers = 0;
      for (const a of data) {
        const f30 = a?.metrics?.thirtyDays?.followers || a?.followers || 0;
        if (f30 > 0) withFollowers++;
      }

      console.log(`\n${f}`);
      console.log(`  Size: ${sizeMB}MB, Modified: ${modified}, Records: ${count}`);
      console.log(`  Schools: ${schools.size}`);
      console.log(`  Athletes with followers: ${withFollowers} / ${count}`);
      console.log(`  Sample keys: ${keys.join(', ')}`);
    }
  } catch (e) {
    console.log(`\n${f}: ${e.message}`);
  }
}
