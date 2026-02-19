import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('./public/data/ncaa_updated_ip_contents_feb_18.json', 'utf8'));
const all = data.filter(p => p?.athlete?.school?.name === 'Kentucky');

const avg = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.engagementRate||0), 0) / posts.length : 0;
const avgLikes = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.likes||0), 0) / posts.length : 0;
const avgComments = posts => posts.length ? posts.reduce((s,p) => s + (p.metrics?.comments||0), 0) / posts.length : 0;

const logo = all.filter(p => p.hasOrganizationLogo);
const mention = all.filter(p => p.hasOrganizationInCaption);
const collab = all.filter(p => p.isOrganizationCollaboration);
const withAny = all.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
const withoutLogo = all.filter(p => !p.hasOrganizationLogo);
const withoutMention = all.filter(p => !p.hasOrganizationInCaption);
const withoutCollab = all.filter(p => !p.isOrganizationCollaboration);
const withoutAny = all.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

console.log('=== ipData ===');
console.log('totalPosts:', all.length);
console.log('totalFollowers: 1671393 (from profile)');
const totalLikes = all.reduce((s,p) => s + (p.metrics?.likes||0), 0);
const totalComments = all.reduce((s,p) => s + (p.metrics?.comments||0), 0);
console.log('totalLikes:', totalLikes);
console.log('totalComments:', totalComments);
console.log('totalEMV:', ((totalLikes * 0.5) + (totalComments * 1.5)).toFixed(0));
console.log('postsWithIP:', withAny.length);
console.log('ipAdoptionRate:', (withAny.length/all.length*100).toFixed(1));

const logoEng = avg(logo) * 100;
const logoBaseline = avg(withoutLogo) * 100;
const logoDelta = logoBaseline > 0 ? ((logoEng - logoBaseline) / logoBaseline * 100) : 0;
console.log('\n--- logo ---');
console.log(`posts: ${logo.length}, eng: ${logoEng.toFixed(4)}, avgLikes: ${avgLikes(logo).toFixed(2)}, avgComments: ${avgComments(logo).toFixed(2)}`);
console.log(`baselineEng: ${logoBaseline.toFixed(4)}, baselinePosts: ${withoutLogo.length}, baselineLikes: ${avgLikes(withoutLogo).toFixed(2)}, baselineComments: ${avgComments(withoutLogo).toFixed(2)}`);
console.log(`delta: ${logoDelta.toFixed(2)}`);
console.log(`EMV for logo: ${(logo.length * ((avgLikes(logo)*0.5) + (avgComments(logo)*1.5))).toFixed(0)}`);

const mentionEng = avg(mention) * 100;
const mentionBaseline = avg(withoutMention) * 100;
const mentionDelta = mentionBaseline > 0 ? ((mentionEng - mentionBaseline) / mentionBaseline * 100) : 0;
console.log('\n--- mention ---');
console.log(`posts: ${mention.length}, eng: ${mentionEng.toFixed(4)}, avgLikes: ${avgLikes(mention).toFixed(2)}, avgComments: ${avgComments(mention).toFixed(2)}`);
console.log(`baselineEng: ${mentionBaseline.toFixed(4)}, baselinePosts: ${withoutMention.length}, baselineLikes: ${avgLikes(withoutMention).toFixed(2)}, baselineComments: ${avgComments(withoutMention).toFixed(2)}`);
console.log(`delta: ${mentionDelta.toFixed(2)}`);
console.log(`EMV for mention: ${(mention.length * ((avgLikes(mention)*0.5) + (avgComments(mention)*1.5))).toFixed(0)}`);

const collabEng = avg(collab) * 100;
const collabBaseline = avg(withoutCollab) * 100;
const collabDelta = collabBaseline > 0 ? ((collabEng - collabBaseline) / collabBaseline * 100) : 0;
console.log('\n--- collab ---');
console.log(`posts: ${collab.length}, eng: ${collabEng.toFixed(4)}, avgLikes: ${avgLikes(collab).toFixed(2)}, avgComments: ${avgComments(collab).toFixed(2)}`);
console.log(`baselineEng: ${collabBaseline.toFixed(4)}, baselinePosts: ${withoutCollab.length}, baselineLikes: ${avgLikes(withoutCollab).toFixed(2)}, baselineComments: ${avgComments(withoutCollab).toFixed(2)}`);
console.log(`delta: ${collabDelta.toFixed(2)}`);
console.log(`EMV for collab: ${(collab.length * ((avgLikes(collab)*0.5) + (avgComments(collab)*1.5))).toFixed(0)}`);

// Overall eng rate and baseline
const overallEng = avg(all) * 100;
const ipEng = avg(withAny) * 100;
const noIPEng = avg(withoutAny) * 100;
console.log('\n=== overall ===');
console.log(`overall eng: ${overallEng.toFixed(4)}`);
console.log(`withIP eng: ${ipEng.toFixed(4)}, noIP eng: ${noIPEng.toFixed(4)}`);
const avgLift = noIPEng > 0 ? ((ipEng - noIPEng) / noIPEng * 100) : 0;
console.log(`avgLift: ${avgLift.toFixed(2)}`);

console.log('\n=== fallbackSportData ALL_SPORTS ===');
console.log(`logo: with { posts: ${logo.length}, avgLikes: ${Math.round(avgLikes(logo))}, avgComments: ${Math.round(avgComments(logo))}, engagementRate: ${avg(logo).toFixed(4)} }, without { posts: ${withoutLogo.length}, avgLikes: ${Math.round(avgLikes(withoutLogo))}, avgComments: ${Math.round(avgComments(withoutLogo))}, engagementRate: ${avg(withoutLogo).toFixed(4)} }`);
console.log(`mention: with { posts: ${mention.length}, avgLikes: ${Math.round(avgLikes(mention))}, avgComments: ${Math.round(avgComments(mention))}, engagementRate: ${avg(mention).toFixed(4)} }, without { posts: ${withoutMention.length}, avgLikes: ${Math.round(avgLikes(withoutMention))}, avgComments: ${Math.round(avgComments(withoutMention))}, engagementRate: ${avg(withoutMention).toFixed(4)} }`);
console.log(`collab: with { posts: ${collab.length}, avgLikes: ${Math.round(avgLikes(collab))}, avgComments: ${Math.round(avgComments(collab))}, engagementRate: ${avg(collab).toFixed(4)} }, without { posts: ${withoutCollab.length}, avgLikes: ${Math.round(avgLikes(withoutCollab))}, avgComments: ${Math.round(avgComments(withoutCollab))}, engagementRate: ${avg(withoutCollab).toFixed(4)} }`);

// sponsored
const sponsored = all.filter(p => p.isSponsored && p.sponsorPartner);
const brandMap = {};
sponsored.forEach(p => {
  const brand = p.sponsorPartner?.trim();
  if (!brand) return;
  if (!brandMap[brand]) brandMap[brand] = [];
  brandMap[brand].push(p);
});
console.log('\n=== Top sponsored brands ===');
const sorted = Object.entries(brandMap).sort((a,b) => b[1].length - a[1].length).slice(0, 20);
sorted.forEach(([brand, posts]) => {
  const likes = posts.reduce((s,p) => s + (p.metrics?.likes||0), 0) / posts.length;
  const comments = posts.reduce((s,p) => s + (p.metrics?.comments||0), 0) / posts.length;
  const eng = posts.reduce((s,p) => s + (p.metrics?.engagementRate||0), 0) / posts.length * 100;
  const emv = posts.length * ((likes * 0.5) + (comments * 1.5));
  console.log(`${brand}: ${posts.length} posts, avgLikes: ${likes.toFixed(0)}, avgComments: ${comments.toFixed(1)}, eng: ${eng.toFixed(4)}, EMV: ${emv.toFixed(0)}`);
});
