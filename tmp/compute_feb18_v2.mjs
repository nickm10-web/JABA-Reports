import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));

const avg = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.engagementRate||0), 0) / posts.length * 100 : 0;

const targets = [
  'Depaul',              // DePaul in our component
  'San Diego State University',  // San Diego State in our component
  'Texas Christian University',  // TCU in our component
  'Providence College',          // Providence in our component
  'Robert Morris University',    // Robert Morris in our component
  'DUKE',                        // Duke in our component
  'New Mexico State University', // New Mexico State in our component
];

targets.forEach(name => {
  const all = data.filter(p => p?.athlete?.school?.name === name);
  if (!all.length) { console.log(name + ': NOT FOUND'); return; }
  const logo = all.filter(p => p.hasOrganizationLogo);
  const mention = all.filter(p => p.hasOrganizationInCaption);
  const collab = all.filter(p => p.isOrganizationCollaboration);
  const withAny = all.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
  console.log(`${name}: ${all.length} posts, adoption ${(withAny.length/all.length*100).toFixed(1)}%`);
  console.log(`  logo: ${logo.length} eng=${avg(logo).toFixed(2)}%  mention: ${mention.length} eng=${avg(mention).toFixed(2)}%  collab: ${collab.length} eng=${avg(collab).toFixed(2)}%`);
});
