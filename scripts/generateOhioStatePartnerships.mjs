import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const allPosts = JSON.parse(fs.readFileSync(path.join(dataDir, 'last_ip_data_contents.json'), 'utf8'));
const posts = allPosts.filter(p => p?.athlete?.school?.name === 'Ohio State');
console.log('Ohio State posts:', posts.length);

const computeEmv = (p) => {
  const rawEmv = p.metrics?.emv || 0;
  if (rawEmv > 0) return rawEmv;
  return (p.metrics?.likes || 0) * 0.5 + (p.metrics?.comments || 0) * 1.5;
};
const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;
const overallAvgLikes = avg(posts, 'likes');
console.log('overallAvgLikes:', overallAvgLikes.toFixed(2));

const sponsored = posts.filter(p => p.sponsorPartner && p.sponsorPartner.trim());
const brandMap = {};
for (const p of sponsored) {
  const brand = p.sponsorPartner.trim();
  if (brand.startsWith('#')) continue;
  if (!brandMap[brand]) brandMap[brand] = { posts: [], brand };
  brandMap[brand].posts.push(p);
}

const partnerships = Object.values(brandMap).map(b => {
  const bPosts = b.posts;
  const avgLikes = bPosts.reduce((s, p) => s + (p.metrics?.likes || 0), 0) / bPosts.length;
  const avgComments = Math.round(bPosts.reduce((s, p) => s + (p.metrics?.comments || 0), 0) / bPosts.length);
  const emv = bPosts.reduce((s, p) => s + computeEmv(p), 0);
  const engRate = bPosts.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / bPosts.length;
  const liftMult = overallAvgLikes > 0 ? Math.round(((avgLikes - overallAvgLikes) / overallAvgLikes) * 10) / 10 : 0;
  return {
    brand: b.brand, posts: bPosts.length,
    avgLikes: Math.round(avgLikes * 100) / 100, avgComments,
    emv: Math.round(emv * 100) / 100,
    engagementRate: Math.round(engRate * 10000) / 10000,
    liftMultiplier: liftMult,
  };
}).sort((a, b) => b.emv - a.emv).slice(0, 100);

console.log('Total brands:', partnerships.length);

// Output as TSX-ready format
let out = '';
for (const p of partnerships) {
  out += `    { brand: "${p.brand}", posts: ${p.posts}, avgLikes: ${p.avgLikes}, avgComments: ${p.avgComments}, emv: ${p.emv}, engagementRate: ${p.engagementRate}, liftMultiplier: ${p.liftMultiplier} },\n`;
}
fs.writeFileSync('/tmp/ohio_partnerships.txt', out);
console.log('Written to /tmp/ohio_partnerships.txt');

// Signal computation for signalStats
const signalCompute = (flag) => {
  const withSignal = posts.filter(p => Boolean(p[flag]));
  const withoutSignal = posts.filter(p => !p[flag]);
  const withEngRate = avg(withSignal, 'engagementRate');
  const withoutEngRate = avg(withoutSignal, 'engagementRate');
  const delta = withoutEngRate > 0 ? ((withEngRate - withoutEngRate) / withoutEngRate) * 100 : 0;
  const totalEmv = withSignal.reduce((s,p) => s + computeEmv(p), 0);
  return {
    posts: withSignal.length,
    totalEmv: Math.round(totalEmv),
    avgEmv: withSignal.length > 0 ? Math.round(totalEmv / withSignal.length) : 0,
    lift: Math.round(delta),
  };
};

const collabStats = signalCompute('isOrganizationCollaboration');
const logoStats = signalCompute('hasOrganizationLogo');
const mentionStats = signalCompute('hasOrganizationInCaption');

console.log('\nSignal Stats:');
console.log(`  collab: { posts: ${collabStats.posts}, totalEmv: ${collabStats.totalEmv}, avgEmv: ${collabStats.avgEmv}, lift: ${collabStats.lift} }`);
console.log(`  logo: { posts: ${logoStats.posts}, totalEmv: ${logoStats.totalEmv}, avgEmv: ${logoStats.avgEmv}, lift: ${logoStats.lift} }`);
console.log(`  mention: { posts: ${mentionStats.posts}, totalEmv: ${mentionStats.totalEmv}, avgEmv: ${mentionStats.avgEmv}, lift: ${mentionStats.lift} }`);
