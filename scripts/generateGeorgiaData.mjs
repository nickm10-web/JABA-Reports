import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');
const outputPath = path.join(dataDir, 'georgia-athlete-overview.json');

// Load data
const sourceFile = 'ncaa_roster_updated_feb_17.json';
const rosterFile = 'ncaa_roster_feb_12.json';
const allPosts = JSON.parse(fs.readFileSync(path.join(dataDir, sourceFile), 'utf8'));
const rosterRows = JSON.parse(fs.readFileSync(path.join(dataDir, rosterFile), 'utf8'));

// Filter Georgia posts
const targetSchoolNames = new Set(['University Of Georgia']);
const posts = allPosts.filter(p => targetSchoolNames.has(p?.athlete?.school?.name));
console.log(`Georgia posts: ${posts.length}`);

// Build follower map from roster
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const rosterFollowerMap = new Map();
for (const athlete of rosterRows) {
  const schoolName = athlete?.schoolName || '';
  if (!schoolName.toLowerCase().includes('georgia') || schoolName.toLowerCase().includes('georgia tech')) continue;
  const key = `${normalize(`${athlete?.firstName || ''}${athlete?.lastName || ''}`)}|${normalize(athlete?.sport)}`;
  const followers = Number(athlete?.metrics?.thirtyDays?.followers || 0);
  const existing = rosterFollowerMap.get(key) || 0;
  if (followers > existing) rosterFollowerMap.set(key, followers);
}
console.log(`Roster followers mapped: ${rosterFollowerMap.size} athletes`);

// Helpers
const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;
const sum = (arr, field) => arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0);
// Compute EMV from likes/comments when source EMV is 0
const computeEmv = (p) => {
  const rawEmv = p.metrics?.emv || 0;
  if (rawEmv > 0) return rawEmv;
  return (p.metrics?.likes || 0) * 0.5 + (p.metrics?.comments || 0) * 1.5;
};
const sumEmv = (arr) => arr.reduce((s, p) => s + computeEmv(p), 0);
const getFollowers = (post) => {
  const key = `${normalize(post?.athlete?.name)}|${normalize(post?.athlete?.sport)}`;
  return Number(rosterFollowerMap.get(key) || 0);
};

// Signal computation
const signal = (flag) => {
  const withSignal = posts.filter(p => Boolean(p[flag]));
  const withoutSignal = posts.filter(p => !p[flag]);

  const withInteractions = sum(withSignal, 'likes') + sum(withSignal, 'comments');
  const withoutInteractions = sum(withoutSignal, 'likes') + sum(withoutSignal, 'comments');
  const withFollowers = withSignal.reduce((s, p) => s + getFollowers(p), 0);
  const withoutFollowers = withoutSignal.reduce((s, p) => s + getFollowers(p), 0);
  const withEngRate = withFollowers > 0 ? withInteractions / withFollowers : 0;
  const withoutEngRate = withoutFollowers > 0 ? withoutInteractions / withoutFollowers : 0;

  return {
    posts: withSignal.length,
    likes: avg(withSignal, 'likes'),
    comments: avg(withSignal, 'comments'),
    engagementRate: withEngRate,
    delta: withoutEngRate > 0 ? ((withEngRate - withoutEngRate) / withoutEngRate) * 100 : 0,
    emv: sumEmv(withSignal),
    baselineEngRate: withoutEngRate,
    baselinePosts: withoutSignal.length,
    baselineLikes: avg(withoutSignal, 'likes'),
    baselineComments: avg(withoutSignal, 'comments'),
  };
};

const collaboration = signal('isOrganizationCollaboration');
const logo = signal('hasOrganizationLogo');
const mention = signal('hasOrganizationInCaption');

const totalLikes = sum(posts, 'likes');
const totalComments = sum(posts, 'comments');
const totalEmv = sumEmv(posts);
const postsWithIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;
const athletes = [...new Set(posts.map(p => p.athlete?.name).filter(Boolean))];

const weightedLiftDen = collaboration.posts + logo.posts + mention.posts;
const avgLift = weightedLiftDen > 0
  ? (collaboration.delta * collaboration.posts + logo.delta * logo.posts + mention.delta * mention.posts) / weightedLiftDen
  : 0;

console.log('\n=== OVERVIEW ===');
console.log(`Posts: ${posts.length}, Athletes: ${athletes.length}`);
console.log(`Total Likes: ${totalLikes.toLocaleString()}, Total Comments: ${totalComments.toLocaleString()}`);
console.log(`IP Adoption: ${(postsWithIP / posts.length * 100).toFixed(1)}% (${postsWithIP} posts)`);
console.log(`Total EMV: $${Math.round(totalEmv).toLocaleString()}`);
console.log(`Avg Lift: ${avgLift.toFixed(1)}%`);

console.log('\n=== SIGNALS ===');
for (const [name, sig] of [['Logo', logo], ['Mention', mention], ['Collab', collaboration]]) {
  console.log(`${name}: ${sig.posts} posts (${(sig.posts / posts.length * 100).toFixed(1)}%), avgLikes: ${Math.round(sig.likes)}, lift: ${sig.delta.toFixed(1)}%, EMV: $${Math.round(sig.emv).toLocaleString()}`);
}

// === PARTNERSHIPS ===
// Non-brand exclusion patterns
const excludeBrands = new Set([
  // Media / recruiting / news
  '@on3recruits', '@rivalsdotcom', '@247sports',
  // Team/school accounts
  '@georgiafootball', '@ugaathletics', '@thegeorgiadogs',
  // NIL collectives / threads
  '@nil.store', '@athletesthread', '@colab_collective',
  // Personal accounts
  '@pressplay', '@postgame.official',
]);

const sponsored = posts.filter(p => p.sponsorPartner && p.sponsorPartner.trim());
const brandMap = {};
for (const p of sponsored) {
  const brand = p.sponsorPartner.trim();
  if (excludeBrands.has(brand)) continue;
  if (brand.startsWith('#')) continue; // hashtags, not brands
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
  const liftMult = overallAvgLikes > 0 ? ((avgLikes - overallAvgLikes) / overallAvgLikes) : 0;
  return {
    brand: b.brand,
    posts: bPosts.length,
    avgLikes: Math.round(avgLikes * 100) / 100,
    avgComments,
    emv: Math.round(emv * 100) / 100,
    engagementRate: Math.round(engRate * 10000) / 10000,
    liftMultiplier: Math.round(liftMult * 10) / 10,
  };
}).sort((a, b) => b.emv - a.emv).slice(0, 100);

console.log(`\n=== PARTNERSHIPS ===`);
console.log(`Brands: ${partnerships.length}, Sponsored posts: ${sponsored.length}`);
console.log(`Total sponsored EMV: $${Math.round(partnerships.reduce((s, p) => s + p.emv, 0)).toLocaleString()}`);

// Top 20 for preview
console.log('\nTop 20 brands by EMV:');
for (const p of partnerships.slice(0, 20)) {
  console.log(`  ${p.brand}: ${p.posts} posts, avgLikes: ${Math.round(p.avgLikes)}, EMV: $${Math.round(p.emv).toLocaleString()}`);
}

// === TOP ATHLETES by signal ===
const athleteSignalMap = {};
for (const p of posts) {
  const name = p.athlete?.name;
  if (!name) continue;
  if (!athleteSignalMap[name]) athleteSignalMap[name] = { name, sport: p.athlete?.sport || '', logo: 0, mention: 0, collab: 0, totalLikes: 0, posts: 0 };
  athleteSignalMap[name].posts++;
  athleteSignalMap[name].totalLikes += (p.metrics?.likes || 0);
  if (p.hasOrganizationLogo) athleteSignalMap[name].logo++;
  if (p.hasOrganizationInCaption) athleteSignalMap[name].mention++;
  if (p.isOrganizationCollaboration) athleteSignalMap[name].collab++;
}

const athleteList = Object.values(athleteSignalMap);
const topLogo = athleteList.filter(a => a.logo > 0).sort((a, b) => b.logo - a.logo).slice(0, 5);
const topMention = athleteList.filter(a => a.mention > 0).sort((a, b) => b.mention - a.mention).slice(0, 5);
const topCollab = athleteList.filter(a => a.collab > 0).sort((a, b) => b.collab - a.collab).slice(0, 5);

console.log('\n=== TOP ATHLETES ===');
console.log('Logo:');
for (const a of topLogo) console.log(`  ${a.name} (${a.sport}): ${a.logo} posts, ${a.totalLikes.toLocaleString()} total likes`);
console.log('Mention:');
for (const a of topMention) console.log(`  ${a.name} (${a.sport}): ${a.mention} posts, ${a.totalLikes.toLocaleString()} total likes`);
console.log('Collab:');
for (const a of topCollab) console.log(`  ${a.name} (${a.sport}): ${a.collab} posts, ${a.totalLikes.toLocaleString()} total likes`);

// === SPORT BREAKDOWN ===
const sportMap = {};
for (const p of posts) {
  const sport = p.athlete?.sport || 'Unknown';
  if (!sportMap[sport]) sportMap[sport] = { total: 0, ip: 0, likes: 0, comments: 0 };
  sportMap[sport].total++;
  sportMap[sport].likes += (p.metrics?.likes || 0);
  sportMap[sport].comments += (p.metrics?.comments || 0);
  if (p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration) sportMap[sport].ip++;
}
console.log('\n=== SPORT BREAKDOWN ===');
for (const [sport, d] of Object.entries(sportMap).sort((a, b) => b[1].total - a[1].total).slice(0, 10)) {
  console.log(`  ${sport}: ${d.total} posts, ${d.ip} IP (${(d.ip/d.total*100).toFixed(1)}%), ${d.likes.toLocaleString()} likes`);
}

// === WRITE TSX-READY OUTPUT ===
let tsx = '';

// ipData block
tsx += `const ipData = {\n`;
tsx += `  totalPosts: ${posts.length},\n`;
tsx += `  totalAthletes: ${athletes.length},\n`;
tsx += `  totalFollowers: 2864099,\n`;
tsx += `  totalLikes: ${totalLikes},\n`;
tsx += `  totalComments: ${totalComments},\n`;
tsx += `  engagementRate: ${(avg(posts, 'engagementRate')).toFixed(4)},\n`;
tsx += `  baseline: { posts: ${posts.length - postsWithIP}, engagementRate: ${avg(posts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration), 'engagementRate').toFixed(4)} },\n`;
tsx += `  postsWithIP: ${postsWithIP},\n`;
tsx += `  ipAdoptionRate: ${(postsWithIP / posts.length * 100).toFixed(1)},\n`;
tsx += `  avgLift: ${avgLift.toFixed(1)},\n`;
tsx += `  totalEmv: ${Math.round(totalEmv)},\n`;
tsx += `  collaboration: {\n`;
tsx += `    posts: ${collaboration.posts}, likes: ${collaboration.likes.toFixed(2)}, comments: ${collaboration.comments.toFixed(2)},\n`;
tsx += `    engagementRate: ${collaboration.engagementRate.toFixed(4)}, delta: ${collaboration.delta.toFixed(2)}, emv: ${Math.round(collaboration.emv)},\n`;
tsx += `    baselineEngRate: ${collaboration.baselineEngRate.toFixed(4)}, baselinePosts: ${collaboration.baselinePosts},\n`;
tsx += `    baselineLikes: ${collaboration.baselineLikes.toFixed(2)}, baselineComments: ${collaboration.baselineComments.toFixed(2)},\n`;
tsx += `  },\n`;
tsx += `  logo: {\n`;
tsx += `    posts: ${logo.posts}, likes: ${logo.likes.toFixed(2)}, comments: ${logo.comments.toFixed(2)},\n`;
tsx += `    engagementRate: ${logo.engagementRate.toFixed(4)}, delta: ${logo.delta.toFixed(2)}, emv: ${Math.round(logo.emv)},\n`;
tsx += `    baselineEngRate: ${logo.baselineEngRate.toFixed(4)}, baselinePosts: ${logo.baselinePosts},\n`;
tsx += `    baselineLikes: ${logo.baselineLikes.toFixed(2)}, baselineComments: ${logo.baselineComments.toFixed(2)},\n`;
tsx += `  },\n`;
tsx += `  mention: {\n`;
tsx += `    posts: ${mention.posts}, likes: ${mention.likes.toFixed(2)}, comments: ${mention.comments.toFixed(2)},\n`;
tsx += `    engagementRate: ${mention.engagementRate.toFixed(4)}, delta: ${mention.delta.toFixed(2)}, emv: ${Math.round(mention.emv)},\n`;
tsx += `    baselineEngRate: ${mention.baselineEngRate.toFixed(4)}, baselinePosts: ${mention.baselinePosts},\n`;
tsx += `    baselineLikes: ${mention.baselineLikes.toFixed(2)}, baselineComments: ${mention.baselineComments.toFixed(2)},\n`;
tsx += `  },\n`;

// partnerships
tsx += `  partnerships: [\n`;
for (const p of partnerships) {
  tsx += `    { brand: "${p.brand}", posts: ${p.posts}, avgLikes: ${p.avgLikes}, avgComments: ${p.avgComments}, emv: ${p.emv}, engagementRate: ${p.engagementRate}, liftMultiplier: ${p.liftMultiplier} },\n`;
}
tsx += `  ],\n`;
tsx += `};\n`;

// Top athletes
tsx += `\nconst topLogoAthletes = [\n`;
for (const a of topLogo) tsx += `  { name: '${a.name.replace(/'/g, "\\'")}', sport: '${a.sport}', posts: ${a.logo}, totalLikes: ${a.totalLikes} },\n`;
tsx += `];\n`;
tsx += `const topMentionAthletes = [\n`;
for (const a of topMention) tsx += `  { name: '${a.name.replace(/'/g, "\\'")}', sport: '${a.sport}', posts: ${a.mention}, totalLikes: ${a.totalLikes} },\n`;
tsx += `];\n`;
tsx += `const topCollabAthletes = [\n`;
for (const a of topCollab) tsx += `  { name: '${a.name.replace(/'/g, "\\'")}', sport: '${a.sport}', posts: ${a.collab}, totalLikes: ${a.totalLikes} },\n`;
tsx += `];\n`;

// Signal stats
tsx += `\nconst signalStats = {\n`;
tsx += `  collab: { posts: ${collaboration.posts}, totalEmv: ${Math.round(collaboration.emv)}, avgEmv: ${collaboration.posts > 0 ? Math.round(collaboration.emv / collaboration.posts) : 0}, lift: ${Math.round(collaboration.delta)} },\n`;
tsx += `  logo: { posts: ${logo.posts}, totalEmv: ${Math.round(logo.emv)}, avgEmv: ${logo.posts > 0 ? Math.round(logo.emv / logo.posts) : 0}, lift: ${Math.round(logo.delta)} },\n`;
tsx += `  mention: { posts: ${mention.posts}, totalEmv: ${Math.round(mention.emv)}, avgEmv: ${mention.posts > 0 ? Math.round(mention.emv / mention.posts) : 0}, lift: ${Math.round(mention.delta)} },\n`;
tsx += `};\n`;

fs.writeFileSync('/tmp/georgia_tsx_data.txt', tsx);
console.log('\nTSX data written to /tmp/georgia_tsx_data.txt');

// === GENERATE OVERVIEW JSON ===
const output = {
  sourceFile,
  generatedAt: new Date().toISOString(),
  school: 'Georgia',
  matchedSchools: [...new Set(posts.map(p => p?.athlete?.school?.name).filter(Boolean))],
  totalPosts: posts.length,
  totalLikes,
  totalComments,
  postsWithIP,
  ipAdoptionRate: Number((postsWithIP / posts.length * 100).toFixed(1)),
  avgLift: Number(avgLift.toFixed(1)),
  totalEmv: Number(((totalLikes * 0.5) + (totalComments * 1.5)).toFixed(2)),
  collaboration,
  logo,
  mention,
  counters: {
    isSponsored: posts.filter(p => Boolean(p.isSponsored)).length,
    sponsorPartner: posts.filter(p => typeof p.sponsorPartner === 'string' && p.sponsorPartner.trim().length > 0).length,
    isOrganizationCollaboration: posts.filter(p => Boolean(p.isOrganizationCollaboration)).length,
    hasOrganizationInCaption: posts.filter(p => Boolean(p.hasOrganizationInCaption)).length,
    hasOrganizationLogo: posts.filter(p => Boolean(p.hasOrganizationLogo)).length,
    isCollaboration: posts.filter(p => Boolean(p.isCollaboration)).length,
  },
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`\nGenerated ${outputPath}`);
