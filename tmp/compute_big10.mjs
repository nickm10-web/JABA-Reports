import { readFileSync } from 'fs';
const d = JSON.parse(readFileSync('./public/data/Big10Contents.json', 'utf8'));
const schools = {};
d.forEach(p => {
  const s = p?.athlete?.school?.name || 'unknown';
  if (!schools[s]) schools[s] = { posts: [], name: s };
  schools[s].posts.push(p);
});
const results = [];
for (const [name, info] of Object.entries(schools)) {
  const posts = info.posts;
  const total = posts.length;
  const withLogo = posts.filter(p => p.hasOrganizationLogo).length;
  const withMention = posts.filter(p => p.hasOrganizationInCaption).length;
  const withCollab = posts.filter(p => p.isOrganizationCollaboration).length;
  const withAny = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;
  results.push({
    name,
    posts: total,
    adoption: +(withAny / total * 100).toFixed(1),
    logo: +(withLogo / total * 100).toFixed(1),
    mention: +(withMention / total * 100).toFixed(1),
    collab: +(withCollab / total * 100).toFixed(1),
  });
}
results.sort((a, b) => b.adoption - a.adoption);
results.forEach(r => console.log(JSON.stringify(r)));
