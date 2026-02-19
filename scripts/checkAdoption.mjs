import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));

const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;

// Group by school
const bySchool = {};
for (const p of data) {
  const s = p?.athlete?.school?.name;
  if (s) {
    if (!bySchool[s]) bySchool[s] = [];
    bySchool[s].push(p);
  }
}

// Compute adoption for all schools with >= 500 posts
const results = [];
for (const [school, posts] of Object.entries(bySchool)) {
  if (posts.length < 500) continue;
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;
  const adoption = withAnyIP / posts.length * 100;
  results.push({ school, posts: posts.length, withAnyIP, adoption: +adoption.toFixed(1) });
}

results.sort((a, b) => b.adoption - a.adoption);
console.log('Top 20 schools by IP adoption (>=500 posts):');
for (const r of results.slice(0, 20)) {
  console.log(`  ${r.school}: ${r.adoption}% (${r.withAnyIP}/${r.posts} posts)`);
}

// Specifically check Old Dominion
const odu = bySchool['Old Dominion University'];
if (odu) {
  const logo = odu.filter(p => p.hasOrganizationLogo).length;
  const mention = odu.filter(p => p.hasOrganizationInCaption).length;
  const collab = odu.filter(p => p.isOrganizationCollaboration).length;
  const anyIP = odu.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;
  console.log(`\nOld Dominion breakdown:`);
  console.log(`  total: ${odu.length}, logo: ${logo}, mention: ${mention}, collab: ${collab}, anyIP: ${anyIP} (${(anyIP/odu.length*100).toFixed(1)}%)`);
}
