import { readFileSync } from 'fs';

// Check ncaa_roster_contents for Minnesota, Michigan, Wisconsin
const data = JSON.parse(readFileSync('./public/data/ncaa_roster_contents_feb_12.json', 'utf8'));

const targets = ['Minnesota', 'Michigan', 'University of Wisconsin'];

for (const target of targets) {
  const posts = data.filter(p => {
    const school = p?.athlete?.school?.name || '';
    return school.includes(target);
  });

  const total = posts.length;
  const withLogo = posts.filter(p => p.hasOrganizationLogo).length;
  const withMention = posts.filter(p => p.hasOrganizationInCaption).length;
  const withCollab = posts.filter(p => p.isOrganizationCollaboration).length;
  const withAny = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;

  console.log(`\n${target}:`);
  console.log(`  Posts: ${total}`);
  console.log(`  Adoption: ${(withAny/total*100).toFixed(1)}%`);
  console.log(`  Logo: ${(withLogo/total*100).toFixed(1)}%`);
  console.log(`  Mention: ${(withMention/total*100).toFixed(1)}% (${withMention} posts)`);
  console.log(`  Collab: ${(withCollab/total*100).toFixed(1)}%`);
}

// Also check Big10Contents for these schools
const big10 = JSON.parse(readFileSync('./public/data/Big10Contents.json', 'utf8'));
console.log('\n=== Big10Contents.json ===');
const big10Schools = {};
big10.forEach(p => {
  const s = p?.athlete?.school?.name || 'unknown';
  if (!big10Schools[s]) big10Schools[s] = [];
  big10Schools[s].push(p);
});

// Check if Minnesota, Michigan, Wisconsin are in Big10Contents
for (const name of Object.keys(big10Schools)) {
  if (name.toLowerCase().includes('minnesota') || name.toLowerCase().includes('michigan') || name.toLowerCase().includes('wisconsin')) {
    const posts = big10Schools[name];
    const total = posts.length;
    const withLogo = posts.filter(p => p.hasOrganizationLogo).length;
    const withMention = posts.filter(p => p.hasOrganizationInCaption).length;
    const withCollab = posts.filter(p => p.isOrganizationCollaboration).length;
    const withAny = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;
    console.log(`\n${name}:`);
    console.log(`  Posts: ${total}`);
    console.log(`  Adoption: ${(withAny/total*100).toFixed(1)}%`);
    console.log(`  Logo: ${(withLogo/total*100).toFixed(1)}%`);
    console.log(`  Mention: ${(withMention/total*100).toFixed(1)}% (${withMention} posts)`);
    console.log(`  Collab: ${(withCollab/total*100).toFixed(1)}%`);
  }
}
