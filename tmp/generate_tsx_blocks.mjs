/**
 * Generate exact TSX ipData blocks for Ohio State and Georgia
 * Applies brand filtering for Ohio State
 */

import { readFileSync, writeFileSync } from 'fs';

const RAW = JSON.parse(readFileSync('public/data/last_ip_data_contents.json', 'utf8'));
console.log(`Loaded ${RAW.length} posts`);

// Index by school
const postsBySchool = {};
RAW.forEach(p => {
  const school = p.athlete?.school?.name;
  if (!school) return;
  if (!postsBySchool[school]) postsBySchool[school] = [];
  postsBySchool[school].push(p);
});

// Helper functions
function avg(arr, field) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length;
}

function sum(arr, field) {
  return arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0);
}

function avgEngRate(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / arr.length;
}

function computeEmv(post) {
  const e = post.metrics?.emv || 0;
  if (e > 0) return e;
  return (post.metrics?.likes || 0) * 0.5 + (post.metrics?.comments || 0) * 1.5;
}

function sumEmv(arr) {
  return arr.reduce((s, p) => s + computeEmv(p), 0);
}

function getFollowers(posts) {
  const byAthlete = {};
  posts.forEach(p => {
    const id = p.athlete?._id;
    const f = p.metrics?.followers || 0;
    if (id && (!byAthlete[id] || f > byAthlete[id])) {
      byAthlete[id] = f;
    }
  });
  return Object.values(byAthlete).reduce((a, b) => a + b, 0);
}

function liftPct(withRate, withoutRate) {
  if (withoutRate === 0) return 0;
  return ((withRate - withoutRate) / withoutRate) * 100;
}

// Ohio State brands to exclude (from previous session)
const OHIO_EXCLUDE = new Set([
  'accessthewalk', '@flocheer', '@flowrestling', '@journeymenwrestling',
  '@thehenrylegacy', '@lv', '@easportsofficial', '@easportscollege',
  // apartments/housing
  '@theviewonfifth', '@thriveresidents', '@ramblercolumbus',
]);

function generateForSchool(schoolName, posts, excludeBrands, existingFollowers) {
  const totalLikes = sum(posts, 'likes');
  const totalComments = sum(posts, 'comments');
  const totalEmv = sumEmv(posts);
  const athletes = new Set(posts.map(p => p.athlete?._id)).size;
  const followers = getFollowers(posts) || existingFollowers;
  const overallEngRate = avgEngRate(posts);

  const withLogo = posts.filter(p => p.hasOrganizationLogo);
  const withoutLogo = posts.filter(p => !p.hasOrganizationLogo);
  const withMention = posts.filter(p => p.hasOrganizationInCaption);
  const withoutMention = posts.filter(p => !p.hasOrganizationInCaption);
  const withCollab = posts.filter(p => p.isOrganizationCollaboration);
  const withoutCollab = posts.filter(p => !p.isOrganizationCollaboration);
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
  const withoutIP = posts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);
  const sponsored = posts.filter(p => p.isSponsored && (p.sponsorPartner || '').trim());

  const ipEngRate = avgEngRate(withAnyIP);
  const baselineEngRate = avgEngRate(withoutIP);
  const avgLift = liftPct(ipEngRate, baselineEngRate);

  const logoEngRate = avgEngRate(withLogo);
  const logoBaselineEngRate = avgEngRate(withoutLogo);
  const mentionEngRate = avgEngRate(withMention);
  const mentionBaselineEngRate = avgEngRate(withoutMention);
  const collabEngRate = avgEngRate(withCollab);
  const collabBaselineEngRate = avgEngRate(withoutCollab);

  // Build partnerships
  const brands = {};
  sponsored.forEach(p => {
    const tag = p.sponsorPartner.trim();
    if (!brands[tag]) brands[tag] = [];
    brands[tag].push(p);
  });

  let partnerships = Object.entries(brands)
    .map(([name, bposts]) => {
      const bEngRate = avgEngRate(bposts);
      return {
        brand: name,
        posts: bposts.length,
        avgLikes: Math.round(avg(bposts, 'likes') * 100) / 100,
        avgComments: Math.round(avg(bposts, 'comments')),
        emv: Math.round(sumEmv(bposts) * 10) / 10,
        engagementRate: Math.round(bEngRate * 10000) / 10000,
        liftMultiplier: Math.round(liftPct(bEngRate, overallEngRate) * 10) / 10,
      };
    })
    .sort((a, b) => b.emv - a.emv);

  // Filter out excluded brands
  if (excludeBrands && excludeBrands.size > 0) {
    const beforeCount = partnerships.length;
    partnerships = partnerships.filter(p => {
      const normalized = p.brand.replace(/^@/, '').toLowerCase();
      const withAt = p.brand.toLowerCase();
      return !excludeBrands.has(normalized) && !excludeBrands.has(withAt) && !excludeBrands.has(p.brand);
    });
    console.log(`  Filtered brands: ${beforeCount} → ${partnerships.length}`);
  }

  // Take top brands (keep reasonable number for report)
  const topPartnerCount = Math.min(partnerships.length, 100);
  partnerships = partnerships.slice(0, topPartnerCount);

  // Unique brand count
  const uniqueBrands = new Set(
    sponsored.map(p => p.sponsorPartner.trim().replace(/^@/, '').toLowerCase())
  ).size;

  // Generate TSX string
  const r = (v, d=2) => {
    if (d === 0) return Math.round(v);
    return Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
  };

  const partnerLines = partnerships.map(p =>
    `    { brand: "${p.brand}", posts: ${p.posts}, avgLikes: ${p.avgLikes}, avgComments: ${p.avgComments}, emv: ${p.emv}, engagementRate: ${p.engagementRate}, liftMultiplier: ${p.liftMultiplier} },`
  ).join('\n');

  const tsx = `const ipData = {
  totalPosts: ${posts.length},
  totalAthletes: ${athletes},
  totalFollowers: ${followers},
  totalLikes: ${totalLikes},
  totalComments: ${totalComments},
  engagementRate: ${r(overallEngRate, 4)},
  baseline: { posts: ${withoutIP.length}, engagementRate: ${r(baselineEngRate, 4)} },
  postsWithIP: ${withAnyIP.length},
  ipAdoptionRate: ${r(withAnyIP.length / posts.length * 100, 1)},
  avgLift: ${r(avgLift, 1)},
  totalEmv: ${Math.round(totalEmv)},
  collaboration: { posts: ${withCollab.length}, likes: ${r(avg(withCollab, 'likes'))}, comments: ${r(avg(withCollab, 'comments'))}, engagementRate: ${r(collabEngRate, 4)}, delta: ${r(liftPct(collabEngRate, collabBaselineEngRate), 1)}, emv: ${Math.round(sumEmv(withCollab))}, baselineEngRate: ${r(collabBaselineEngRate, 4)}, baselinePosts: ${withoutCollab.length}, baselineLikes: ${r(avg(withoutCollab, 'likes'))}, baselineComments: ${r(avg(withoutCollab, 'comments'))} } as IPSignalData,
  logo: { posts: ${withLogo.length}, likes: ${r(avg(withLogo, 'likes'))}, comments: ${r(avg(withLogo, 'comments'))}, engagementRate: ${r(logoEngRate, 4)}, delta: ${r(liftPct(logoEngRate, logoBaselineEngRate), 1)}, emv: ${Math.round(sumEmv(withLogo))}, baselineEngRate: ${r(logoBaselineEngRate, 4)}, baselinePosts: ${withoutLogo.length}, baselineLikes: ${r(avg(withoutLogo, 'likes'))}, baselineComments: ${r(avg(withoutLogo, 'comments'))} } as IPSignalData,
  mention: { posts: ${withMention.length}, likes: ${r(avg(withMention, 'likes'))}, comments: ${r(avg(withMention, 'comments'))}, engagementRate: ${r(mentionEngRate, 4)}, delta: ${r(liftPct(mentionEngRate, mentionBaselineEngRate), 1)}, emv: ${Math.round(sumEmv(withMention))}, baselineEngRate: ${r(mentionBaselineEngRate, 4)}, baselinePosts: ${withoutMention.length}, baselineLikes: ${r(avg(withoutMention, 'likes'))}, baselineComments: ${r(avg(withoutMention, 'comments'))} } as IPSignalData,
  signals: [
    {
      id: 'logo' as const,
      label: 'Visual IP (Logo)',
      totalPosts: ${withLogo.length},
      percentage: ${r(withLogo.length / posts.length * 100, 1)},
      with: { posts: ${withLogo.length}, avgLikes: ${Math.round(avg(withLogo, 'likes'))}, avgComments: ${Math.round(avg(withLogo, 'comments'))}, engagementRate: ${r(logoEngRate, 4)} },
      without: { posts: ${withoutLogo.length}, avgLikes: ${Math.round(avg(withoutLogo, 'likes'))}, avgComments: ${Math.round(avg(withoutLogo, 'comments'))}, engagementRate: ${r(logoBaselineEngRate, 4)} },
    },
    {
      id: 'mention' as const,
      label: 'Caption Mention',
      totalPosts: ${withMention.length},
      percentage: ${r(withMention.length / posts.length * 100, 1)},
      with: { posts: ${withMention.length}, avgLikes: ${Math.round(avg(withMention, 'likes'))}, avgComments: ${Math.round(avg(withMention, 'comments'))}, engagementRate: ${r(mentionEngRate, 4)} },
      without: { posts: ${withoutMention.length}, avgLikes: ${Math.round(avg(withoutMention, 'likes'))}, avgComments: ${Math.round(avg(withoutMention, 'comments'))}, engagementRate: ${r(mentionBaselineEngRate, 4)} },
    },
    {
      id: 'collab' as const,
      label: 'Collaboration',
      totalPosts: ${withCollab.length},
      percentage: ${r(withCollab.length / posts.length * 100, 1)},
      with: { posts: ${withCollab.length}, avgLikes: ${Math.round(avg(withCollab, 'likes'))}, avgComments: ${Math.round(avg(withCollab, 'comments'))}, engagementRate: ${r(collabEngRate, 4)} },
      without: { posts: ${withoutCollab.length}, avgLikes: ${Math.round(avg(withoutCollab, 'likes'))}, avgComments: ${Math.round(avg(withoutCollab, 'comments'))}, engagementRate: ${r(collabBaselineEngRate, 4)} },
    },
  ],
  sponsoredPosts: ${sponsored.length},
  totalBrands: ${uniqueBrands},
  totalEMV: ${Math.round(totalEmv)},
  partnerships: [
${partnerLines}
  ] as Partnership[],
};`;

  return tsx;
}

// ─── OHIO STATE ─────────────────────────────────────────
console.log('\n═══ OHIO STATE ═══');
const ohioPosts = postsBySchool['Ohio State'] || [];
const ohioTsx = generateForSchool('Ohio State', ohioPosts, OHIO_EXCLUDE, 5546349);
writeFileSync('/tmp/ohio_state_tsx_block.txt', ohioTsx);
console.log(`Written: /tmp/ohio_state_tsx_block.txt (${ohioTsx.split('\n').length} lines)`);

// ─── GEORGIA ────────────────────────────────────────────
console.log('\n═══ GEORGIA ═══');
const georgiaPosts = postsBySchool['University Of Georgia'] || [];
const georgiaTsx = generateForSchool('University Of Georgia', georgiaPosts, null, 2864099);
writeFileSync('/tmp/georgia_tsx_block.txt', georgiaTsx);
console.log(`Written: /tmp/georgia_tsx_block.txt (${georgiaTsx.split('\n').length} lines)`);

console.log('\n✓ TSX blocks generated');
