import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('./public/data/Ohio_contents.json', 'utf8'));

// Brands to exclude (non-brand entries we flagged earlier)
const excludeBrands = new Set([
  '@on3recruits', '@rivalsdotcom', '@ohiostatefb', '@wrestlingbucks',
  '@phillies', '@brody_marcet9', '@qpeezy_0', '@his_huddle',
  '@the.courageousathlete', '@gvartwork', '@slaneglover', '@aabonnbc',
  '@dannydlawn', '@postgame.official', '@the.nil.store', '@thefoundationohio',
  '@locationfootball', '@whereimfrom', '@campusparc', '@buckeye.threads',
  '@colab_collective', '@pursuityourself', '@Nash',
  // Additional cleanup
  '@pressplay', '@ohiostathletics', '@indiana.nil.store', '@athletesthread',
  '@xx_xyathletics', '@blitz_athletics_ohio', 'buckeye.threads', '@mizzouthreads',
]);

const totalPosts = data.length;
const athletes = new Set(data.map(p => p.athlete?.name)).size;

const withLogo = data.filter(p => p.hasOrganizationLogo);
const noLogo = data.filter(p => !p.hasOrganizationLogo);
const withMention = data.filter(p => p.hasOrganizationInCaption);
const noMention = data.filter(p => !p.hasOrganizationInCaption);
const withCollab = data.filter(p => p.isOrganizationCollaboration);
const noCollab = data.filter(p => !p.isOrganizationCollaboration);
const withAnyIP = data.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);

const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;
const sum = (arr, field) => arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0);

console.log('=== OVERVIEW ===');
console.log('totalPosts:', totalPosts);
console.log('totalAthletes:', athletes);
console.log('ipAdoptionRate:', (withAnyIP.length / totalPosts * 100).toFixed(1) + '%');
console.log('postsWithIP:', withAnyIP.length);
console.log('totalEMV: $' + sum(data, 'emv').toLocaleString());

console.log('\n=== SIGNALS ===');
console.log('LOGO:');
console.log('  posts:', withLogo.length, '(' + (withLogo.length / totalPosts * 100).toFixed(1) + '%)');
console.log('  avgLikes with:', Math.round(avg(withLogo, 'likes')));
console.log('  avgLikes without:', Math.round(avg(noLogo, 'likes')));
console.log('  avgComments with:', Math.round(avg(withLogo, 'comments')));
console.log('  avgComments without:', Math.round(avg(noLogo, 'comments')));
console.log('  engRate with:', avg(withLogo, 'engagementRate').toFixed(4));
console.log('  engRate without:', avg(noLogo, 'engagementRate').toFixed(4));
const logoLift = ((avg(withLogo, 'likes') - avg(noLogo, 'likes')) / avg(noLogo, 'likes') * 100).toFixed(1);
console.log('  lift:', logoLift + '%');

console.log('MENTION:');
console.log('  posts:', withMention.length, '(' + (withMention.length / totalPosts * 100).toFixed(1) + '%)');
console.log('  avgLikes with:', Math.round(avg(withMention, 'likes')));
console.log('  avgLikes without:', Math.round(avg(noMention, 'likes')));
console.log('  avgComments with:', Math.round(avg(withMention, 'comments')));
console.log('  avgComments without:', Math.round(avg(noMention, 'comments')));
console.log('  engRate with:', avg(withMention, 'engagementRate').toFixed(4));
console.log('  engRate without:', avg(noMention, 'engagementRate').toFixed(4));
const mentionLift = ((avg(withMention, 'likes') - avg(noMention, 'likes')) / avg(noMention, 'likes') * 100).toFixed(1);
console.log('  lift:', mentionLift + '%');

console.log('COLLAB:');
console.log('  posts:', withCollab.length, '(' + (withCollab.length / totalPosts * 100).toFixed(1) + '%)');
console.log('  avgLikes with:', Math.round(avg(withCollab, 'likes')));
console.log('  avgLikes without:', Math.round(avg(noCollab, 'likes')));
console.log('  avgComments with:', Math.round(avg(withCollab, 'comments')));
console.log('  avgComments without:', Math.round(avg(noCollab, 'comments')));
console.log('  engRate with:', avg(withCollab, 'engagementRate').toFixed(4));
console.log('  engRate without:', avg(noCollab, 'engagementRate').toFixed(4));
const collabLift = ((avg(withCollab, 'likes') - avg(noCollab, 'likes')) / avg(noCollab, 'likes') * 100).toFixed(1);
console.log('  lift:', collabLift + '%');

// === PARTNERSHIPS ===
const sponsored = data.filter(p => p.sponsorPartner && p.sponsorPartner.trim());
const brandMap = {};
for (const p of sponsored) {
  const brand = p.sponsorPartner.trim();
  if (excludeBrands.has(brand)) continue;
  if (!brandMap[brand]) brandMap[brand] = { posts: [], brand };
  brandMap[brand].posts.push(p);
}

const partnerships = Object.values(brandMap).map(b => {
  const posts = b.posts;
  const avgLikes = posts.reduce((s, p) => s + (p.metrics?.likes || 0), 0) / posts.length;
  const avgComments = posts.reduce((s, p) => s + (p.metrics?.comments || 0), 0) / posts.length;
  const emv = posts.reduce((s, p) => s + (p.metrics?.emv || 0), 0);
  const engRate = posts.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / posts.length;
  const overallAvgLikes = avg(data, 'likes');
  const liftMultiplier = overallAvgLikes > 0 ? ((avgLikes - overallAvgLikes) / overallAvgLikes) : 0;

  return {
    brand: b.brand,
    posts: posts.length,
    avgLikes: Math.round(avgLikes * 100) / 100,
    avgComments: Math.round(avgComments * 100) / 100,
    emv: Math.round(emv * 100) / 100,
    engagementRate: Math.round(engRate * 10000) / 10000,
    liftMultiplier: Math.round(liftMultiplier * 10) / 10
  };
}).sort((a, b) => b.emv - a.emv);

console.log('\n=== PARTNERSHIPS ===');
console.log('Total brands (after filtering):', partnerships.length);
const totalSponsoredPosts = partnerships.reduce((s, p) => s + p.posts, 0);
const totalSponsoredEMV = partnerships.reduce((s, p) => s + p.emv, 0);
console.log('Total sponsored posts:', totalSponsoredPosts);
console.log('Total sponsored EMV: $' + Math.round(totalSponsoredEMV).toLocaleString());

// Cap to top 100 by EMV
const topPartnerships = partnerships.slice(0, 100);

// Write partnerships as TSX-ready format
let tsx = 'partnerships: [\n';
for (const p of topPartnerships) {
  tsx += `    { brand: "${p.brand}", posts: ${p.posts}, avgLikes: ${p.avgLikes}, avgComments: ${p.avgComments}, emv: ${p.emv}, engagementRate: ${p.engagementRate}, liftMultiplier: ${p.liftMultiplier} },\n`;
}
tsx += '  ]';
writeFileSync('/tmp/ohio_partnerships_tsx.txt', tsx);
console.log('\nTSX partnerships written to /tmp/ohio_partnerships_tsx.txt');

// Write full ipData block
let ipBlock = `const ipData = {
  totalPosts: ${totalPosts},
  totalAthletes: ${athletes},
  totalFollowers: 5546349,
  ipAdoptionRate: ${(withAnyIP.length / totalPosts * 100).toFixed(1)},
  signals: [
    {
      id: 'logo' as const,
      label: 'Visual IP (Logo)',
      totalPosts: ${withLogo.length},
      percentage: ${(withLogo.length / totalPosts * 100).toFixed(1)},
      with: { posts: ${withLogo.length}, avgLikes: ${Math.round(avg(withLogo, 'likes'))}, avgComments: ${Math.round(avg(withLogo, 'comments'))}, engagementRate: ${avg(withLogo, 'engagementRate').toFixed(4)} },
      without: { posts: ${noLogo.length}, avgLikes: ${Math.round(avg(noLogo, 'likes'))}, avgComments: ${Math.round(avg(noLogo, 'comments'))}, engagementRate: ${avg(noLogo, 'engagementRate').toFixed(4)} },
    },
    {
      id: 'mention' as const,
      label: 'Caption Mention',
      totalPosts: ${withMention.length},
      percentage: ${(withMention.length / totalPosts * 100).toFixed(1)},
      with: { posts: ${withMention.length}, avgLikes: ${Math.round(avg(withMention, 'likes'))}, avgComments: ${Math.round(avg(withMention, 'comments'))}, engagementRate: ${avg(withMention, 'engagementRate').toFixed(4)} },
      without: { posts: ${noMention.length}, avgLikes: ${Math.round(avg(noMention, 'likes'))}, avgComments: ${Math.round(avg(noMention, 'comments'))}, engagementRate: ${avg(noMention, 'engagementRate').toFixed(4)} },
    },
    {
      id: 'collab' as const,
      label: 'Collaboration',
      totalPosts: ${withCollab.length},
      percentage: ${(withCollab.length / totalPosts * 100).toFixed(1)},
      with: { posts: ${withCollab.length}, avgLikes: ${Math.round(avg(withCollab, 'likes'))}, avgComments: ${Math.round(avg(withCollab, 'comments'))}, engagementRate: ${avg(withCollab, 'engagementRate').toFixed(4)} },
      without: { posts: ${noCollab.length}, avgLikes: ${Math.round(avg(noCollab, 'likes'))}, avgComments: ${Math.round(avg(noCollab, 'comments'))}, engagementRate: ${avg(noCollab, 'engagementRate').toFixed(4)} },
    },
  ],
  sponsoredPosts: ${totalSponsoredPosts},
  totalBrands: ${topPartnerships.length},
  totalEMV: ${Math.round(sum(data, 'emv'))},
`;
writeFileSync('/tmp/ohio_ipdata_tsx.txt', ipBlock);
console.log('TSX ipData block written to /tmp/ohio_ipdata_tsx.txt');
