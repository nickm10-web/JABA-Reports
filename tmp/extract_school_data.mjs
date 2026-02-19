import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('public/data/last_ip_data_contents.json', 'utf8'));
const schoolName = process.argv[2] || 'Ohio State';

const posts = data.filter(d => d.athlete?.school?.name === schoolName);
console.log(`\n=== ${schoolName} ===`);
console.log(`Total posts: ${posts.length}`);

// Unique athletes
const athletes = new Set(posts.map(p => p.athlete._id));
console.log(`Unique athletes: ${athletes.size}`);

// Total followers
const athleteFollowers = {};
posts.forEach(p => {
  const id = p.athlete._id;
  const f = p.metrics?.followers || 0;
  if (!athleteFollowers[id] || f > athleteFollowers[id]) {
    athleteFollowers[id] = f;
  }
});
const totalFollowers = Object.values(athleteFollowers).reduce((a, b) => a + b, 0);
console.log(`Total followers: ${totalFollowers.toLocaleString()}`);

// Metrics totals
let totalLikes = 0, totalComments = 0, totalEmv = 0, totalShares = 0, totalSaves = 0;
let totalViews = 0, totalImpressions = 0, totalReach = 0;
posts.forEach(p => {
  totalLikes += p.metrics?.likes || 0;
  totalComments += p.metrics?.comments || 0;
  totalEmv += p.metrics?.emv || 0;
  totalShares += p.metrics?.shares || 0;
  totalSaves += p.metrics?.saves || 0;
  totalViews += p.metrics?.videoViews || 0;
  totalImpressions += p.metrics?.impressions || 0;
  totalReach += p.metrics?.reach || 0;
});
console.log(`Total likes: ${totalLikes.toLocaleString()}`);
console.log(`Total comments: ${totalComments.toLocaleString()}`);
console.log(`Total EMV: $${totalEmv.toLocaleString()}`);
console.log(`Total shares: ${totalShares.toLocaleString()}`);
console.log(`Total saves: ${totalSaves.toLocaleString()}`);
console.log(`Total views: ${totalViews.toLocaleString()}`);
console.log(`Total impressions: ${totalImpressions.toLocaleString()}`);
console.log(`Total reach: ${totalReach.toLocaleString()}`);

// IP signals
const withLogo = posts.filter(p => p.hasOrganizationLogo);
const withMention = posts.filter(p => p.hasOrganizationInCaption);
const withCollab = posts.filter(p => p.isOrganizationCollaboration);
const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const sponsored = posts.filter(p => p.isSponsored);

console.log(`\n--- IP Signals ---`);
console.log(`Posts with any IP: ${withAnyIP.length} (${(withAnyIP.length / posts.length * 100).toFixed(1)}%)`);
console.log(`  Logo: ${withLogo.length} (${(withLogo.length / posts.length * 100).toFixed(1)}%)`);
console.log(`  Mention: ${withMention.length} (${(withMention.length / posts.length * 100).toFixed(1)}%)`);
console.log(`  Collab: ${withCollab.length} (${(withCollab.length / posts.length * 100).toFixed(1)}%)`);
console.log(`  Sponsored: ${sponsored.length}`);
console.log(`  isCollaboration: ${posts.filter(p => p.isCollaboration).length}`);

// Engagement rates
function avgEng(subset) {
  if (subset.length === 0) return 0;
  return subset.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / subset.length;
}

function avgLikes(subset) {
  if (subset.length === 0) return 0;
  return subset.reduce((s, p) => s + (p.metrics?.likes || 0), 0) / subset.length;
}

function avgComments(subset) {
  if (subset.length === 0) return 0;
  return subset.reduce((s, p) => s + (p.metrics?.comments || 0), 0) / subset.length;
}

function totalEmvOf(subset) {
  return subset.reduce((s, p) => s + (p.metrics?.emv || 0), 0);
}

const withoutIP = posts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

console.log(`\n--- With vs Without IP ---`);
console.log(`With IP engagement rate: ${(avgEng(withAnyIP) * 100).toFixed(2)}%`);
console.log(`Without IP engagement rate: ${(avgEng(withoutIP) * 100).toFixed(2)}%`);
const lift = withoutIP.length > 0 ? ((avgEng(withAnyIP) - avgEng(withoutIP)) / avgEng(withoutIP) * 100).toFixed(1) : 'N/A';
console.log(`Lift: ${lift}%`);

// Signal-by-signal
console.log(`\n--- Logo Signal ---`);
const withoutLogo = posts.filter(p => !p.hasOrganizationLogo);
console.log(`With logo avg likes: ${avgLikes(withLogo).toFixed(1)}`);
console.log(`Without logo avg likes: ${avgLikes(withoutLogo).toFixed(1)}`);
console.log(`With logo avg comments: ${avgComments(withLogo).toFixed(1)}`);
console.log(`Without logo avg comments: ${avgComments(withoutLogo).toFixed(1)}`);
console.log(`With logo eng rate: ${(avgEng(withLogo) * 100).toFixed(4)}%`);
console.log(`Without logo eng rate: ${(avgEng(withoutLogo) * 100).toFixed(4)}%`);
const logoLift = ((avgEng(withLogo) - avgEng(withoutLogo)) / avgEng(withoutLogo) * 100).toFixed(1);
console.log(`Logo lift: ${logoLift}%`);
console.log(`Logo EMV: $${totalEmvOf(withLogo).toLocaleString()}`);

console.log(`\n--- Mention Signal ---`);
const withoutMention = posts.filter(p => !p.hasOrganizationInCaption);
console.log(`With mention avg likes: ${avgLikes(withMention).toFixed(1)}`);
console.log(`Without mention avg likes: ${avgLikes(withoutMention).toFixed(1)}`);
console.log(`With mention avg comments: ${avgComments(withMention).toFixed(1)}`);
console.log(`Without mention avg comments: ${avgComments(withoutMention).toFixed(1)}`);
console.log(`With mention eng rate: ${(avgEng(withMention) * 100).toFixed(4)}%`);
console.log(`Without mention eng rate: ${(avgEng(withoutMention) * 100).toFixed(4)}%`);
const mentionLift = ((avgEng(withMention) - avgEng(withoutMention)) / avgEng(withoutMention) * 100).toFixed(1);
console.log(`Mention lift: ${mentionLift}%`);
console.log(`Mention EMV: $${totalEmvOf(withMention).toLocaleString()}`);

console.log(`\n--- Collab Signal ---`);
const withoutCollab = posts.filter(p => !p.isOrganizationCollaboration);
console.log(`With collab avg likes: ${avgLikes(withCollab).toFixed(1)}`);
console.log(`Without collab avg likes: ${avgLikes(withoutCollab).toFixed(1)}`);
console.log(`With collab avg comments: ${avgComments(withCollab).toFixed(1)}`);
console.log(`Without collab avg comments: ${avgComments(withoutCollab).toFixed(1)}`);
console.log(`With collab eng rate: ${(avgEng(withCollab) * 100).toFixed(4)}%`);
console.log(`Without collab eng rate: ${(avgEng(withoutCollab) * 100).toFixed(4)}%`);
const collabLift = ((avgEng(withCollab) - avgEng(withoutCollab)) / avgEng(withoutCollab) * 100).toFixed(1);
console.log(`Collab lift: ${collabLift}%`);
console.log(`Collab EMV: $${totalEmvOf(withCollab).toLocaleString()}`);

// Partnerships
console.log(`\n--- Partnerships (Top 20 by posts) ---`);
const brands = {};
sponsored.forEach(p => {
  const tag = (p.sponsorPartner || '').trim();
  if (!tag) return;
  if (!brands[tag]) brands[tag] = { posts: 0, likes: 0, comments: 0, emv: 0 };
  brands[tag].posts++;
  brands[tag].likes += p.metrics?.likes || 0;
  brands[tag].comments += p.metrics?.comments || 0;
  brands[tag].emv += p.metrics?.emv || 0;
});

const sortedBrands = Object.entries(brands)
  .sort((a, b) => b[1].posts - a[1].posts)
  .slice(0, 20);

sortedBrands.forEach(([name, d]) => {
  console.log(`  ${name}: ${d.posts} posts, avg ${(d.likes/d.posts).toFixed(0)} likes, avg ${(d.comments/d.posts).toFixed(0)} comments, $${d.emv.toFixed(0)} EMV`);
});
console.log(`Total unique sponsors: ${Object.keys(brands).length}`);

// Sport breakdown
console.log(`\n--- Sports ---`);
const sports = {};
posts.forEach(p => {
  const sport = p.athlete?.sport || 'unknown';
  if (!sports[sport]) sports[sport] = 0;
  sports[sport]++;
});
Object.entries(sports).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => {
  console.log(`  ${s}: ${c}`);
});
