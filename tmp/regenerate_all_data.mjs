/**
 * Regenerate ALL report data from last_ip_data_contents.json
 * Generates:
 *   1. Ohio State ipData block (TSX) + ohio-state-athlete-overview.json
 *   2. Georgia ipData block (TSX) + georgia-athlete-overview.json
 *   3. Playfly school JSON files (ip-impact, partnerships, athletes) for all 15 schools
 *   4. brand-partnership-summary.json
 */

import { readFileSync, writeFileSync } from 'fs';

const RAW = JSON.parse(readFileSync('public/data/last_ip_data_contents.json', 'utf8'));
console.log(`Loaded ${RAW.length} posts from last_ip_data_contents.json`);

// ─── SCHOOL NAME MAPPINGS ───────────────────────────────
const PLAYFLY_SCHOOLS = {
  'Auburn University': 'auburn-university',
  'Baylor': 'baylor',
  'Louisiana State University': 'louisiana-state-university',
  'Michigan State': 'michigan-state',
  'Penn State University': 'penn-state-university',
  'Texas A&M': 'texas-a-m',
  'University of Central Florida': 'university-of-central-florida',
  'University of Maryland': 'university-of-maryland',
  'University of Nebraska': 'university-of-nebraska',
  'George Mason': 'george-mason',
  'Old Dominion University': 'old-dominion-university',
  'University of New Mexico': 'university-of-new-mexico',
  'University of Texas at San Antonio (UTSA)': 'university-of-texas-at-san-antonio-utsa',
  'University of Virginia': 'university-of-virginia',
  'Wichita State University': 'wichita-state-university',
};

const OHIO_STATE_NAME = 'Ohio State';
const GEORGIA_NAME = 'University Of Georgia';

// ─── HELPER FUNCTIONS ───────────────────────────────────
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

function uniqueAthletes(posts) {
  return new Set(posts.map(p => p.athlete?._id)).size;
}

function liftPct(withRate, withoutRate) {
  if (withoutRate === 0) return 0;
  return ((withRate - withoutRate) / withoutRate) * 100;
}

// ─── GENERATE PLAYFLY IP-IMPACT JSON ────────────────────
function generateIPImpact(schoolName, posts) {
  const followers = getFollowers(posts);
  const schoolId = posts[0]?.athlete?.school?._id || '';

  const totalLikes = sum(posts, 'likes');
  const totalComments = sum(posts, 'comments');
  const totalEmv = sumEmv(posts);
  const overallEngRate = avgEngRate(posts);

  const withLogo = posts.filter(p => p.hasOrganizationLogo);
  const withoutLogo = posts.filter(p => !p.hasOrganizationLogo);
  const withMention = posts.filter(p => p.hasOrganizationInCaption);
  const withoutMention = posts.filter(p => !p.hasOrganizationInCaption);
  const withCollab = posts.filter(p => p.isOrganizationCollaboration);
  const withoutCollab = posts.filter(p => !p.isOrganizationCollaboration);
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);

  return {
    followers,
    school: { _id: schoolId, name: schoolName },
    overall: {
      totalContents: posts.length,
      totalLikes,
      totalComments,
      engagementRate: overallEngRate,
      emv: totalEmv,
    },
    counts: {
      hasOrganizationInCaption: withMention.length,
      isOrganizationCollaboration: withCollab.length,
      hasOrganizationLogo: withLogo.length,
      withIp: withAnyIP.length,
    },
    orgInCaption: {
      yes: {
        contents: withMention.length,
        likes: avg(withMention, 'likes'),
        comments: avg(withMention, 'comments'),
        engagementRate: avgEngRate(withMention),
        emv: sumEmv(withMention) / (withMention.length || 1),
      },
      no: {
        contents: withoutMention.length,
        likes: avg(withoutMention, 'likes'),
        comments: avg(withoutMention, 'comments'),
        engagementRate: avgEngRate(withoutMention),
      },
      avgLift: liftPct(avgEngRate(withMention), avgEngRate(withoutMention)),
    },
    collaboration: {
      yes: {
        contents: withCollab.length,
        likes: avg(withCollab, 'likes'),
        comments: avg(withCollab, 'comments'),
        engagementRate: avgEngRate(withCollab),
        emv: sumEmv(withCollab) / (withCollab.length || 1),
      },
      no: {
        contents: withoutCollab.length,
        likes: avg(withoutCollab, 'likes'),
        comments: avg(withoutCollab, 'comments'),
        engagementRate: avgEngRate(withoutCollab),
      },
      avgLift: liftPct(avgEngRate(withCollab), avgEngRate(withoutCollab)),
    },
    logo: {
      yes: {
        contents: withLogo.length,
        likes: avg(withLogo, 'likes'),
        comments: avg(withLogo, 'comments'),
        engagementRate: avgEngRate(withLogo),
        emv: sumEmv(withLogo) / (withLogo.length || 1),
      },
      no: {
        contents: withoutLogo.length,
        likes: avg(withoutLogo, 'likes'),
        comments: avg(withoutLogo, 'comments'),
        engagementRate: avgEngRate(withoutLogo),
      },
      avgLift: liftPct(avgEngRate(withLogo), avgEngRate(withoutLogo)),
    },
  };
}

// ─── GENERATE PLAYFLY PARTNERSHIPS JSON ─────────────────
function generatePartnerships(schoolName, posts) {
  const followers = getFollowers(posts);
  const schoolId = posts[0]?.athlete?.school?._id || '';
  const totalEmv = sumEmv(posts);
  const overallEngRate = avgEngRate(posts);

  const sponsored = posts.filter(p => p.isSponsored && (p.sponsorPartner || '').trim());
  const brands = {};
  sponsored.forEach(p => {
    const tag = p.sponsorPartner.trim();
    if (!brands[tag]) brands[tag] = [];
    brands[tag].push(p);
  });

  const sponsorPartners = Object.entries(brands)
    .map(([name, bposts]) => ({
      sponsorPartner: name,
      totalContents: bposts.length,
      avgLikes: avg(bposts, 'likes'),
      avgComments: avg(bposts, 'comments'),
      engagementRate: avgEngRate(bposts),
      emv: sumEmv(bposts),
      engagementRateLift: liftPct(avgEngRate(bposts), overallEngRate),
    }))
    .sort((a, b) => b.emv - a.emv);

  return {
    school: { _id: schoolId, name: schoolName },
    followers,
    overall: {
      totalContents: posts.length,
      avgLikes: avg(posts, 'likes'),
      avgComments: avg(posts, 'comments'),
      engagementRate: overallEngRate,
      emv: totalEmv / (posts.length || 1),
    },
    sponsorPartners,
  };
}

// ─── GENERATE PLAYFLY ATHLETES JSON ─────────────────────
function generateAthletes(schoolName, posts) {
  const schoolId = posts[0]?.athlete?.school?._id || '';
  const overallEngRate = avgEngRate(posts);

  function topAthletesForSignal(signalFn, signalName) {
    const signalPosts = posts.filter(signalFn);
    const byAthlete = {};
    signalPosts.forEach(p => {
      const id = p.athlete?._id;
      if (!id) return;
      if (!byAthlete[id]) {
        byAthlete[id] = {
          name: p.athlete.name,
          sport: p.athlete.sport || '',
          posts: [],
        };
      }
      byAthlete[id].posts.push(p);
    });

    const athleteStats = Object.values(byAthlete).map(a => {
      const athleteEngRate = avgEngRate(a.posts);
      const emv = sumEmv(a.posts);
      return {
        athlete: { name: a.name, sport: a.sport },
        posts: a.posts.length,
        emv: Math.round(emv * 100) / 100,
        engagementRate: Math.round(athleteEngRate * 1000000) / 1000000,
        lift: Math.round(liftPct(athleteEngRate, overallEngRate) * 10000) / 10000,
      };
    });

    athleteStats.sort((a, b) => b.emv - a.emv);
    const top5 = athleteStats.slice(0, 5);

    const avgEmvVal = signalPosts.length > 0 ? sumEmv(signalPosts) / Object.keys(byAthlete).length : 0;
    const avgLiftVal = athleteStats.length > 0
      ? athleteStats.reduce((s, a) => s + a.lift, 0) / athleteStats.length
      : 0;

    return {
      avgEmv: Math.round(avgEmvVal * 100) / 100,
      avgLift: Math.round(avgLiftVal * 10000) / 10000,
      top5Athletes: top5,
    };
  }

  return {
    school: { _id: schoolId, name: schoolName },
    collaboration: topAthletesForSignal(p => p.isOrganizationCollaboration, 'collaboration'),
    logo: topAthletesForSignal(p => p.hasOrganizationLogo, 'logo'),
    'mention (in caption)': topAthletesForSignal(p => p.hasOrganizationInCaption, 'mention'),
    partnership: topAthletesForSignal(p => p.isSponsored, 'partnership'),
  };
}

// ─── GENERATE BRAND PARTNERSHIP SUMMARY ─────────────────
function generateBrandSummary(allPlayflyPosts) {
  const sponsored = allPlayflyPosts.filter(p => p.isSponsored && (p.sponsorPartner || '').trim());

  const brandMap = {};
  const schoolMap = {};

  sponsored.forEach(p => {
    const brand = p.sponsorPartner.trim().replace(/^@/, '').toLowerCase();
    const school = p.athlete?.school?.name || 'unknown';

    if (!brandMap[brand]) brandMap[brand] = { posts: 0, schools: new Set(), engRates: [] };
    brandMap[brand].posts++;
    brandMap[brand].schools.add(school);
    brandMap[brand].engRates.push(p.metrics?.engagementRate || 0);

    if (!schoolMap[school]) schoolMap[school] = { posts: 0, brands: new Set(), engRates: [] };
    schoolMap[school].posts++;
    schoolMap[school].brands.add(brand);
    schoolMap[school].engRates.push(p.metrics?.engagementRate || 0);
  });

  const brandStats = Object.entries(brandMap)
    .map(([name, d]) => ({
      brandName: name,
      postCount: d.posts,
      schoolCount: d.schools.size,
      avgEngagementRate: d.engRates.reduce((a, b) => a + b, 0) / d.engRates.length,
    }))
    .sort((a, b) => b.postCount - a.postCount);

  const schoolStats = Object.entries(schoolMap)
    .map(([name, d]) => ({
      schoolName: name,
      postCount: d.posts,
      brandCount: d.brands.size,
      avgEngagementRate: d.engRates.reduce((a, b) => a + b, 0) / d.engRates.length,
    }))
    .sort((a, b) => b.postCount - a.postCount);

  return {
    totalPosts: sponsored.length,
    activeBrands: Object.keys(brandMap).length,
    activeSchools: Object.keys(schoolMap).length,
    totalSchools: Object.keys(schoolMap).length,
    avgPostsPerBrand: Math.round(sponsored.length / Object.keys(brandMap).length),
    brandStats,
    schoolStats,
  };
}

// ─── GENERATE TSX ipData BLOCK ──────────────────────────
function generateTSXIpData(schoolName, posts) {
  const totalLikes = sum(posts, 'likes');
  const totalComments = sum(posts, 'comments');
  const totalEmv = sumEmv(posts);
  const athletes = uniqueAthletes(posts);
  const followers = getFollowers(posts);
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

  // Logo signal
  const logoEngRate = avgEngRate(withLogo);
  const logoBaselineEngRate = avgEngRate(withoutLogo);
  const logoDelta = liftPct(logoEngRate, logoBaselineEngRate);

  // Mention signal
  const mentionEngRate = avgEngRate(withMention);
  const mentionBaselineEngRate = avgEngRate(withoutMention);
  const mentionDelta = liftPct(mentionEngRate, mentionBaselineEngRate);

  // Collab signal
  const collabEngRate = avgEngRate(withCollab);
  const collabBaselineEngRate = avgEngRate(withoutCollab);
  const collabDelta = liftPct(collabEngRate, collabBaselineEngRate);

  // Partnerships
  const brands = {};
  sponsored.forEach(p => {
    const tag = p.sponsorPartner.trim();
    if (!brands[tag]) brands[tag] = [];
    brands[tag].push(p);
  });

  const partnerships = Object.entries(brands)
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

  // Unique brands count
  const uniqueBrands = new Set(
    sponsored.map(p => p.sponsorPartner.trim().replace(/^@/, '').toLowerCase())
  ).size;

  return {
    totalPosts: posts.length,
    totalAthletes: athletes,
    totalFollowers: followers,
    totalLikes,
    totalComments,
    engagementRate: Math.round(overallEngRate * 10000) / 10000,
    baseline: { posts: withoutIP.length, engagementRate: Math.round(baselineEngRate * 10000) / 10000 },
    postsWithIP: withAnyIP.length,
    ipAdoptionRate: Math.round(withAnyIP.length / posts.length * 1000) / 10,
    avgLift: Math.round(avgLift * 10) / 10,
    totalEmv: Math.round(totalEmv),
    collaboration: {
      posts: withCollab.length,
      likes: Math.round(avg(withCollab, 'likes') * 100) / 100,
      comments: Math.round(avg(withCollab, 'comments') * 100) / 100,
      engagementRate: Math.round(collabEngRate * 10000) / 10000,
      delta: Math.round(collabDelta * 10) / 10,
      emv: Math.round(sumEmv(withCollab)),
      baselineEngRate: Math.round(collabBaselineEngRate * 10000) / 10000,
      baselinePosts: withoutCollab.length,
      baselineLikes: Math.round(avg(withoutCollab, 'likes') * 100) / 100,
      baselineComments: Math.round(avg(withoutCollab, 'comments') * 100) / 100,
    },
    logo: {
      posts: withLogo.length,
      likes: Math.round(avg(withLogo, 'likes') * 100) / 100,
      comments: Math.round(avg(withLogo, 'comments') * 100) / 100,
      engagementRate: Math.round(logoEngRate * 10000) / 10000,
      delta: Math.round(logoDelta * 10) / 10,
      emv: Math.round(sumEmv(withLogo)),
      baselineEngRate: Math.round(logoBaselineEngRate * 10000) / 10000,
      baselinePosts: withoutLogo.length,
      baselineLikes: Math.round(avg(withoutLogo, 'likes') * 100) / 100,
      baselineComments: Math.round(avg(withoutLogo, 'comments') * 100) / 100,
    },
    mention: {
      posts: withMention.length,
      likes: Math.round(avg(withMention, 'likes') * 100) / 100,
      comments: Math.round(avg(withMention, 'comments') * 100) / 100,
      engagementRate: Math.round(mentionEngRate * 10000) / 10000,
      delta: Math.round(mentionDelta * 10) / 10,
      emv: Math.round(sumEmv(withMention)),
      baselineEngRate: Math.round(mentionBaselineEngRate * 10000) / 10000,
      baselinePosts: withoutMention.length,
      baselineLikes: Math.round(avg(withoutMention, 'likes') * 100) / 100,
      baselineComments: Math.round(avg(withoutMention, 'comments') * 100) / 100,
    },
    signals: [
      {
        id: 'logo',
        label: 'Visual IP (Logo)',
        totalPosts: withLogo.length,
        percentage: Math.round(withLogo.length / posts.length * 1000) / 10,
        with: { posts: withLogo.length, avgLikes: Math.round(avg(withLogo, 'likes')), avgComments: Math.round(avg(withLogo, 'comments')), engagementRate: Math.round(logoEngRate * 10000) / 10000 },
        without: { posts: withoutLogo.length, avgLikes: Math.round(avg(withoutLogo, 'likes')), avgComments: Math.round(avg(withoutLogo, 'comments')), engagementRate: Math.round(logoBaselineEngRate * 10000) / 10000 },
      },
      {
        id: 'mention',
        label: 'Caption Mention',
        totalPosts: withMention.length,
        percentage: Math.round(withMention.length / posts.length * 1000) / 10,
        with: { posts: withMention.length, avgLikes: Math.round(avg(withMention, 'likes')), avgComments: Math.round(avg(withMention, 'comments')), engagementRate: Math.round(mentionEngRate * 10000) / 10000 },
        without: { posts: withoutMention.length, avgLikes: Math.round(avg(withoutMention, 'likes')), avgComments: Math.round(avg(withoutMention, 'comments')), engagementRate: Math.round(mentionBaselineEngRate * 10000) / 10000 },
      },
      {
        id: 'collab',
        label: 'Collaboration',
        totalPosts: withCollab.length,
        percentage: Math.round(withCollab.length / posts.length * 1000) / 10,
        with: { posts: withCollab.length, avgLikes: Math.round(avg(withCollab, 'likes')), avgComments: Math.round(avg(withCollab, 'comments')), engagementRate: Math.round(collabEngRate * 10000) / 10000 },
        without: { posts: withoutCollab.length, avgLikes: Math.round(avg(withoutCollab, 'likes')), avgComments: Math.round(avg(withoutCollab, 'comments')), engagementRate: Math.round(collabBaselineEngRate * 10000) / 10000 },
      },
    ],
    sponsoredPosts: sponsored.length,
    totalBrands: uniqueBrands,
    totalEMV: Math.round(totalEmv),
    partnerships,
  };
}

// ─── GENERATE ATHLETE OVERVIEW JSON ─────────────────────
function generateAthleteOverview(schoolName, posts) {
  const totalLikes = sum(posts, 'likes');
  const totalComments = sum(posts, 'comments');
  const totalEmv = sumEmv(posts);
  const followers = getFollowers(posts);

  const withLogo = posts.filter(p => p.hasOrganizationLogo);
  const withoutLogo = posts.filter(p => !p.hasOrganizationLogo);
  const withMention = posts.filter(p => p.hasOrganizationInCaption);
  const withoutMention = posts.filter(p => !p.hasOrganizationInCaption);
  const withCollab = posts.filter(p => p.isOrganizationCollaboration);
  const withoutCollab = posts.filter(p => !p.isOrganizationCollaboration);
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
  const withoutIP = posts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

  const ipEngRate = avgEngRate(withAnyIP);
  const baselineEngRate = avgEngRate(withoutIP);
  const avgLift = liftPct(ipEngRate, baselineEngRate);

  return {
    sourceFile: 'last_ip_data_contents.json',
    generatedAt: new Date().toISOString(),
    school: schoolName,
    totalPosts: posts.length,
    totalLikes,
    totalComments,
    postsWithIP: withAnyIP.length,
    ipAdoptionRate: Math.round(withAnyIP.length / posts.length * 1000) / 10,
    avgLift: Math.round(avgLift * 10) / 10,
    totalEmv: Math.round(totalEmv * 10) / 10,
    collaboration: {
      posts: withCollab.length,
      likes: avg(withCollab, 'likes'),
      comments: avg(withCollab, 'comments'),
      engagementRate: avgEngRate(withCollab),
      delta: liftPct(avgEngRate(withCollab), avgEngRate(withoutCollab)),
      emv: Math.round(sumEmv(withCollab)),
      baselineEngRate: avgEngRate(withoutCollab),
      baselinePosts: withoutCollab.length,
      baselineLikes: avg(withoutCollab, 'likes'),
      baselineComments: avg(withoutCollab, 'comments'),
    },
    logo: {
      posts: withLogo.length,
      likes: avg(withLogo, 'likes'),
      comments: avg(withLogo, 'comments'),
      engagementRate: avgEngRate(withLogo),
      delta: liftPct(avgEngRate(withLogo), avgEngRate(withoutLogo)),
      emv: Math.round(sumEmv(withLogo)),
      baselineEngRate: avgEngRate(withoutLogo),
      baselinePosts: withoutLogo.length,
      baselineLikes: avg(withoutLogo, 'likes'),
      baselineComments: avg(withoutLogo, 'comments'),
    },
    mention: {
      posts: withMention.length,
      likes: avg(withMention, 'likes'),
      comments: avg(withMention, 'comments'),
      engagementRate: avgEngRate(withMention),
      delta: liftPct(avgEngRate(withMention), avgEngRate(withoutMention)),
      emv: Math.round(sumEmv(withMention)),
      baselineEngRate: avgEngRate(withoutMention),
      baselinePosts: withoutMention.length,
      baselineLikes: avg(withoutMention, 'likes'),
      baselineComments: avg(withoutMention, 'comments'),
    },
    counters: {
      isSponsored: posts.filter(p => p.isSponsored).length,
      sponsorPartner: posts.filter(p => (p.sponsorPartner || '').trim()).length,
      isOrganizationCollaboration: withCollab.length,
      hasOrganizationInCaption: withMention.length,
      hasOrganizationLogo: withLogo.length,
      isCollaboration: posts.filter(p => p.isCollaboration).length,
    },
  };
}

// ─── INDEX POSTS BY SCHOOL ──────────────────────────────
console.log('\nIndexing posts by school...');
const postsBySchool = {};
RAW.forEach(p => {
  const school = p.athlete?.school?.name;
  if (!school) return;
  if (!postsBySchool[school]) postsBySchool[school] = [];
  postsBySchool[school].push(p);
});

// ─── OHIO STATE ─────────────────────────────────────────
console.log('\n═══ OHIO STATE ═══');
const ohioPosts = postsBySchool[OHIO_STATE_NAME] || [];
console.log(`Posts: ${ohioPosts.length}`);
const ohioIpData = generateTSXIpData(OHIO_STATE_NAME, ohioPosts);
writeFileSync('/tmp/ohio_state_ipdata.json', JSON.stringify(ohioIpData, null, 2));
console.log('Written: /tmp/ohio_state_ipdata.json');

const ohioOverview = generateAthleteOverview('Ohio State', ohioPosts);
writeFileSync('public/data/ohio-state-athlete-overview.json', JSON.stringify(ohioOverview, null, 2));
console.log('Written: public/data/ohio-state-athlete-overview.json');

// Print key metrics
console.log(`  totalPosts: ${ohioIpData.totalPosts}`);
console.log(`  totalAthletes: ${ohioIpData.totalAthletes}`);
console.log(`  totalFollowers: ${ohioIpData.totalFollowers}`);
console.log(`  totalEmv: $${ohioIpData.totalEmv.toLocaleString()}`);
console.log(`  postsWithIP: ${ohioIpData.postsWithIP} (${ohioIpData.ipAdoptionRate}%)`);
console.log(`  avgLift: ${ohioIpData.avgLift}%`);
console.log(`  logo: ${ohioIpData.logo.posts} posts, delta=${ohioIpData.logo.delta}%`);
console.log(`  mention: ${ohioIpData.mention.posts} posts, delta=${ohioIpData.mention.delta}%`);
console.log(`  collab: ${ohioIpData.collaboration.posts} posts, delta=${ohioIpData.collaboration.delta}%`);
console.log(`  sponsored: ${ohioIpData.sponsoredPosts} posts, ${ohioIpData.totalBrands} brands`);
console.log(`  partnerships: ${ohioIpData.partnerships.length} (showing top 5):`);
ohioIpData.partnerships.slice(0, 5).forEach(p => {
  console.log(`    ${p.brand}: ${p.posts} posts, $${p.emv} EMV`);
});

// ─── GEORGIA ────────────────────────────────────────────
console.log('\n═══ GEORGIA ═══');
const georgiaPosts = postsBySchool[GEORGIA_NAME] || [];
console.log(`Posts: ${georgiaPosts.length}`);
const georgiaIpData = generateTSXIpData(GEORGIA_NAME, georgiaPosts);
writeFileSync('/tmp/georgia_ipdata.json', JSON.stringify(georgiaIpData, null, 2));
console.log('Written: /tmp/georgia_ipdata.json');

const georgiaOverview = generateAthleteOverview('Georgia', georgiaPosts);
writeFileSync('public/data/georgia-athlete-overview.json', JSON.stringify(georgiaOverview, null, 2));
console.log('Written: public/data/georgia-athlete-overview.json');

// Print key metrics
console.log(`  totalPosts: ${georgiaIpData.totalPosts}`);
console.log(`  totalAthletes: ${georgiaIpData.totalAthletes}`);
console.log(`  totalFollowers: ${georgiaIpData.totalFollowers}`);
console.log(`  totalEmv: $${georgiaIpData.totalEmv.toLocaleString()}`);
console.log(`  postsWithIP: ${georgiaIpData.postsWithIP} (${georgiaIpData.ipAdoptionRate}%)`);
console.log(`  avgLift: ${georgiaIpData.avgLift}%`);
console.log(`  logo: ${georgiaIpData.logo.posts} posts, delta=${georgiaIpData.logo.delta}%`);
console.log(`  mention: ${georgiaIpData.mention.posts} posts, delta=${georgiaIpData.mention.delta}%`);
console.log(`  collab: ${georgiaIpData.collaboration.posts} posts, delta=${georgiaIpData.collaboration.delta}%`);
console.log(`  sponsored: ${georgiaIpData.sponsoredPosts} posts, ${georgiaIpData.totalBrands} brands`);
console.log(`  partnerships: ${georgiaIpData.partnerships.length} (showing top 5):`);
georgiaIpData.partnerships.slice(0, 5).forEach(p => {
  console.log(`    ${p.brand}: ${p.posts, p.emv} posts, $${p.emv} EMV`);
});

// ─── PLAYFLY SCHOOLS ────────────────────────────────────
console.log('\n═══ PLAYFLY SCHOOLS ═══');
let allPlayflyPosts = [];

for (const [schoolName, fileSlug] of Object.entries(PLAYFLY_SCHOOLS)) {
  const posts = postsBySchool[schoolName] || [];
  if (posts.length === 0) {
    console.log(`  ⚠ ${schoolName}: NO POSTS FOUND`);
    continue;
  }
  allPlayflyPosts.push(...posts);

  console.log(`  ${schoolName}: ${posts.length} posts`);

  // IP Impact
  const ipImpact = generateIPImpact(schoolName, posts);
  writeFileSync(`public/data/${fileSlug}-ip-impact.json`, JSON.stringify(ipImpact, null, 2));

  // Partnerships
  const partnershipData = generatePartnerships(schoolName, posts);
  writeFileSync(`public/data/${fileSlug}-partnerships.json`, JSON.stringify(partnershipData, null, 2));

  // Athletes
  const athleteData = generateAthletes(schoolName, posts);
  writeFileSync(`public/data/${fileSlug}-top-athletes.json`, JSON.stringify(athleteData, null, 2));
}

// Brand partnership summary
console.log('\n═══ BRAND PARTNERSHIP SUMMARY ═══');
const brandSummary = generateBrandSummary(allPlayflyPosts);
writeFileSync('public/data/brand-partnership-summary.json', JSON.stringify(brandSummary, null, 2));
console.log(`  totalPosts: ${brandSummary.totalPosts}`);
console.log(`  activeBrands: ${brandSummary.activeBrands}`);
console.log(`  activeSchools: ${brandSummary.activeSchools}`);

console.log('\n✓ All data regenerated successfully!');
