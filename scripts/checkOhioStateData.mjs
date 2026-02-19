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

// Signal computation
const signal = (flag) => {
  const withSignal = posts.filter(p => Boolean(p[flag]));
  const withoutSignal = posts.filter(p => !p[flag]);
  const withLikes = avg(withSignal, 'likes');
  const withComments = avg(withSignal, 'comments');
  const withEngRate = avg(withSignal, 'engagementRate');
  const withoutLikes = avg(withoutSignal, 'likes');
  const withoutComments = avg(withoutSignal, 'comments');
  const withoutEngRate = avg(withoutSignal, 'engagementRate');
  const delta = withoutEngRate > 0 ? ((withEngRate - withoutEngRate) / withoutEngRate) * 100 : 0;
  return {
    posts: withSignal.length,
    likes: withLikes,
    comments: withComments,
    engagementRate: withEngRate,
    delta,
    emv: withSignal.reduce((s,p) => s + computeEmv(p), 0),
    baselineEngRate: withoutEngRate,
    baselinePosts: withoutSignal.length,
    baselineLikes: withoutLikes,
    baselineComments: withoutComments,
  };
};

const collaboration = signal('isOrganizationCollaboration');
const logo = signal('hasOrganizationLogo');
const mention = signal('hasOrganizationInCaption');

console.log('\n=== SIGNALS ===');
console.log('Collab:', collaboration.posts, 'posts, delta:', collaboration.delta.toFixed(1) + '%');
console.log('Logo:', logo.posts, 'posts, delta:', logo.delta.toFixed(1) + '%');
console.log('Mention:', mention.posts, 'posts, delta:', mention.delta.toFixed(1) + '%');

// Partnerships
const excludeBrands = new Set([
  '@on3recruits', '@rivalsdotcom', '@247sports',
  '@ohiostateathletics', '@ohiostathletics',
  '@nil.store', '@athletesthread', '@colab_collective',
  '@pressplay', '@postgame.official',
]);

const sponsored = posts.filter(p => p.sponsorPartner && p.sponsorPartner.trim());
const brandMap = {};
for (const p of sponsored) {
  const brand = p.sponsorPartner.trim();
  if (excludeBrands.has(brand)) continue;
  if (brand.startsWith('#')) continue;
  if (!brandMap[brand]) brandMap[brand] = { posts: [], brand };
  brandMap[brand].posts.push(p);
}

const overallAvgLikes = avg(posts, 'likes');
const partnerships = Object.values(brandMap).map(b => {
  const bPosts = b.posts;
  const avgLikes = bPosts.reduce((s, p) => s + (p.metrics?.likes || 0), 0) / bPosts.length;
  const avgComments = Math.round(bPosts.reduce((s, p) => s + (p.metrics?.comments || 0), 0) / bPosts.length);
  const emv = bPosts.reduce((s, p) => s + computeEmv(p), 0);
  const engRate = bPosts.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / bPosts.length;
  const liftMult = overallAvgLikes > 0 ? Math.round(((avgLikes - overallAvgLikes) / overallAvgLikes) * 10) / 10 : 0;
  return {
    brand: b.brand,
    posts: bPosts.length,
    avgLikes: Math.round(avgLikes * 100) / 100,
    avgComments,
    emv: Math.round(emv * 100) / 100,
    engagementRate: Math.round(engRate * 10000) / 10000,
    liftMultiplier: liftMult,
  };
}).sort((a, b) => b.emv - a.emv);

console.log('\n=== TOP 30 PARTNERSHIPS ===');
for (const p of partnerships.slice(0, 30)) {
  console.log(`{ brand: "${p.brand}", posts: ${p.posts}, avgLikes: ${p.avgLikes}, avgComments: ${p.avgComments}, emv: ${p.emv}, engagementRate: ${p.engagementRate}, liftMultiplier: ${p.liftMultiplier} },`);
}
console.log('Total brands:', partnerships.length);

// Top athletes by signal
const athleteMap = {};
for (const p of posts) {
  const name = p.athlete?.name;
  if (!name) continue;
  if (!athleteMap[name]) athleteMap[name] = { name, sport: p.athlete?.sport || '', logo: 0, mention: 0, collab: 0, totalLikes: 0, logoEmv: 0, mentionEmv: 0, collabEmv: 0 };
  athleteMap[name].totalLikes += (p.metrics?.likes || 0);
  const emv = computeEmv(p);
  if (p.hasOrganizationLogo) { athleteMap[name].logo++; athleteMap[name].logoEmv += emv; }
  if (p.hasOrganizationInCaption) { athleteMap[name].mention++; athleteMap[name].mentionEmv += emv; }
  if (p.isOrganizationCollaboration) { athleteMap[name].collab++; athleteMap[name].collabEmv += emv; }
}

const athleteList = Object.values(athleteMap);
const topLogo = athleteList.filter(a => a.logo > 0).sort((a, b) => b.logoEmv - a.logoEmv).slice(0, 5);
const topMention = athleteList.filter(a => a.mention > 0).sort((a, b) => b.mentionEmv - a.mentionEmv).slice(0, 5);
const topCollab = athleteList.filter(a => a.collab > 0).sort((a, b) => b.collabEmv - a.collabEmv).slice(0, 5);

console.log('\n=== TOP ATHLETES ===');
console.log('Logo:');
for (const [i, a] of topLogo.entries()) {
  console.log(`  rank ${i+1}: ${a.name} (${a.sport}): ${a.logo} posts, EMV $${Math.round(a.logoEmv).toLocaleString()}`);
}
console.log('Mention:');
for (const [i, a] of topMention.entries()) {
  console.log(`  rank ${i+1}: ${a.name} (${a.sport}): ${a.mention} posts, EMV $${Math.round(a.mentionEmv).toLocaleString()}`);
}
console.log('Collab:');
for (const [i, a] of topCollab.entries()) {
  console.log(`  rank ${i+1}: ${a.name} (${a.sport}): ${a.collab} posts, EMV $${Math.round(a.collabEmv).toLocaleString()}`);
}

// Signal stats
const collabLift = Math.round(collaboration.delta);
const logoLift = Math.round(logo.delta);
const mentionLift = Math.round(mention.delta);

console.log('\n=== SIGNAL STATS ===');
console.log(`collab: posts ${collaboration.posts}, totalEmv ${Math.round(collaboration.emv)}, avgEmv ${Math.round(collaboration.emv/collaboration.posts)}, lift ${collabLift}`);
console.log(`logo: posts ${logo.posts}, totalEmv ${Math.round(logo.emv)}, avgEmv ${Math.round(logo.emv/logo.posts)}, lift ${logoLift}`);
console.log(`mention: posts ${mention.posts}, totalEmv ${Math.round(mention.emv)}, avgEmv ${Math.round(mention.emv/mention.posts)}, lift ${mentionLift}`);

// Sport breakdown
const sportMap = {};
for (const p of posts) {
  const sport = p.athlete?.sport || 'Unknown';
  if (!sportMap[sport]) sportMap[sport] = { total: 0, logo: 0, mention: 0, collab: 0, likes: 0, comments: 0, engRate: 0 };
  sportMap[sport].total++;
  sportMap[sport].likes += (p.metrics?.likes || 0);
  sportMap[sport].comments += (p.metrics?.comments || 0);
  sportMap[sport].engRate += (p.metrics?.engagementRate || 0);
  if (p.hasOrganizationLogo) sportMap[sport].logo++;
  if (p.hasOrganizationInCaption) sportMap[sport].mention++;
  if (p.isOrganizationCollaboration) sportMap[sport].collab++;
}

console.log('\n=== SPORT BREAKDOWN (top 10) ===');
for (const [sport, d] of Object.entries(sportMap).sort((a, b) => b[1].total - a[1].total).slice(0, 10)) {
  const avgL = Math.round(d.likes / d.total);
  const avgC = Math.round(d.comments / d.total);
  const avgE = (d.engRate / d.total).toFixed(4);
  const logoWithout = d.total - d.logo;
  const logoAvgLikesWith = d.logo > 0 ? Math.round(/* need separate */ 0) : 0;
  console.log(`  ${sport}: ${d.total} posts, logo ${d.logo}, mention ${d.mention}, collab ${d.collab}, avgLikes ${avgL}, avgComments ${avgC}, avgEng ${avgE}`);
}
