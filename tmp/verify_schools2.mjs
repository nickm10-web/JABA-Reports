import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_roster_contents_feb_12.json', 'utf8'));

const targets = {
  'Minnesota': 'Minnesota',
  'Michigan (exact)': 'Michigan',
  'Wisconsin': 'University of Wisconsin',
};

for (const [label, target] of Object.entries(targets)) {
  const posts = data.filter(p => p?.athlete?.school?.name === target);
  const total = posts.length;
  if (total === 0) { console.log(`${label}: no posts found for "${target}"`); continue; }

  const withLogo = posts.filter(p => p.hasOrganizationLogo).length;
  const withMention = posts.filter(p => p.hasOrganizationInCaption).length;
  const withCollab = posts.filter(p => p.isOrganizationCollaboration).length;
  const withAny = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;

  console.log(`\n${label} (school name: "${target}"):`);
  console.log(`  Posts: ${total}`);
  console.log(`  Adoption: ${(withAny/total*100).toFixed(1)}%`);
  console.log(`  Logo: ${(withLogo/total*100).toFixed(1)}% (${withLogo})`);
  console.log(`  Mention: ${(withMention/total*100).toFixed(1)}% (${withMention} posts)`);
  console.log(`  Collab: ${(withCollab/total*100).toFixed(1)}% (${withCollab})`);
}

// Also check ip-impact files
console.log('\n=== IP Impact files ===');
const michiganIP = JSON.parse(readFileSync('./public/data/michigan-state-ip-impact.json', 'utf8'));
console.log('michigan-state-ip-impact.json:');
console.log('  school:', michiganIP?.school?.name);
console.log('  totalContents:', michiganIP?.overall?.totalContents);
console.log('  hasOrganizationInCaption:', michiganIP?.counts?.hasOrganizationInCaption);

// Check if there's a michigan ip-impact (not michigan state)
import { readdirSync } from 'fs';
const files = readdirSync('./public/data').filter(f => f.toLowerCase().includes('michigan') && f.includes('ip-impact'));
console.log('\nMichigan ip-impact files:', files);
