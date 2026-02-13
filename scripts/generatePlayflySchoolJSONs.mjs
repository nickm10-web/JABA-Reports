import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

// School name → file slug mapping for Playfly partner schools
const SCHOOL_SLUG_MAP = {
  // Playfly Max schools
  'Auburn University': 'auburn-university',
  'Baylor': 'baylor',
  'Louisiana State University': 'louisiana-state-university',
  'Texas A&M': 'texas-a-m',
  'University of Central Florida': 'university-of-central-florida',
  'University of Nebraska': 'university-of-nebraska',
  'Michigan State': 'michigan-state',
  'Penn State University': 'penn-state-university',
  'University of Maryland': 'university-of-maryland',
  'University of Southern California (USC)': 'university-of-southern-california-usc',
  // Regular Playfly schools
  'George Mason': 'george-mason',
  'Old Dominion University': 'old-dominion-university',
  'University of Texas at San Antonio (UTSA)': 'university-of-texas-at-san-antonio-utsa',
  'Brigham Young University (BYU)': 'brigham-young-university-byu',
  'University of Cincinnati': 'university-of-cincinnati',
  'Wichita State University': 'wichita-state-university',
  'University of New Mexico': 'university-of-new-mexico',
  // Not in data yet: Oral Roberts, University of Denver, San Jose State
  // Ohio State excluded - has its own dedicated report
};

// Name aliases: map alternate data names → canonical SCHOOL_SLUG_MAP key
const NAME_ALIASES = {
  'Brigham Young University(BYU)': 'Brigham Young University (BYU)',
};

console.log('Loading raw data files...');
const contentsPath = path.join(dataDir, 'ncaa_roster_contents_feb_12.json');
const rosterPath = path.join(dataDir, 'ncaa_roster_feb_12.json');

if (!fs.existsSync(contentsPath) || !fs.existsSync(rosterPath)) {
  console.log('Raw data files not found, skipping generation.');
  process.exit(0);
}

const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));

console.log(`Loaded ${contents.length} content records, ${roster.length} roster records`);

// Build follower map: school name → total followers (merging aliases)
const schoolFollowers = {};
for (const athlete of roster) {
  let school = athlete?.schoolName;
  if (!school) continue;
  // Resolve aliases
  if (NAME_ALIASES[school]) school = NAME_ALIASES[school];
  const followers = Number(athlete?.metrics?.thirtyDays?.followers || 0);
  schoolFollowers[school] = (schoolFollowers[school] || 0) + followers;
}

// Build school ID map from first matching content record (merging aliases)
const schoolIdMap = {};
for (const row of contents) {
  let name = row?.athlete?.school?.name;
  const id = row?.athlete?.school?._id;
  if (!name || !id) continue;
  if (NAME_ALIASES[name]) name = NAME_ALIASES[name];
  if (!schoolIdMap[name]) {
    schoolIdMap[name] = id;
  }
}

// Group content by school (merging name aliases)
const schoolContents = {};
for (const row of contents) {
  let school = row?.athlete?.school?.name;
  if (!school) continue;
  // Resolve aliases to canonical name
  if (NAME_ALIASES[school]) school = NAME_ALIASES[school];
  if (!SCHOOL_SLUG_MAP[school]) continue;
  if (!schoolContents[school]) schoolContents[school] = [];
  schoolContents[school].push(row);
}

console.log(`Schools with content: ${Object.keys(schoolContents).length}`);

// Helper functions
const avg = (arr) => arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length;
const sum = (arr) => arr.reduce((s, v) => s + v, 0);

function generateIPImpact(schoolName, posts, followers) {
  const totalLikes = sum(posts.map(p => Number(p?.metrics?.likes || 0)));
  const totalComments = sum(posts.map(p => Number(p?.metrics?.comments || 0)));
  const totalContents = posts.length;

  // IP signal filters
  const withLogo = posts.filter(p => Boolean(p.hasOrganizationLogo));
  const withoutLogo = posts.filter(p => !p.hasOrganizationLogo);
  const withCollab = posts.filter(p => Boolean(p.isOrganizationCollaboration));
  const withoutCollab = posts.filter(p => !p.isOrganizationCollaboration);
  const withCaption = posts.filter(p => Boolean(p.hasOrganizationInCaption));
  const withoutCaption = posts.filter(p => !p.hasOrganizationInCaption);

  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.isOrganizationCollaboration || p.hasOrganizationInCaption);

  function signalStats(withSignal, withoutSignal) {
    const yesLikes = withSignal.map(p => Number(p?.metrics?.likes || 0));
    const yesComments = withSignal.map(p => Number(p?.metrics?.comments || 0));
    const noLikes = withoutSignal.map(p => Number(p?.metrics?.likes || 0));
    const noComments = withoutSignal.map(p => Number(p?.metrics?.comments || 0));

    const yesAvgLikes = avg(yesLikes);
    const yesAvgComments = avg(yesComments);
    const noAvgLikes = avg(noLikes);
    const noAvgComments = avg(noComments);

    // Engagement rate = total interactions / (posts * followers)
    const yesTotalInteractions = sum(yesLikes) + sum(yesComments);
    const noTotalInteractions = sum(noLikes) + sum(noComments);
    const yesEngRate = followers > 0 && withSignal.length > 0
      ? yesTotalInteractions / (withSignal.length * followers)
      : 0;
    const noEngRate = followers > 0 && withoutSignal.length > 0
      ? noTotalInteractions / (withoutSignal.length * followers)
      : 0;

    const lift = noEngRate > 0 ? ((yesEngRate - noEngRate) / noEngRate) * 100 : 0;

    // EMV per post = (avgLikes * 0.50) + (avgComments * 1.50)
    const yesEmv = (yesAvgLikes * 0.50) + (yesAvgComments * 1.50);

    return {
      yes: {
        contents: withSignal.length,
        likes: yesAvgLikes,
        comments: yesAvgComments,
        engagementRate: yesEngRate,
        emv: Number(yesEmv.toFixed(2)),
      },
      no: {
        contents: withoutSignal.length,
        likes: noAvgLikes,
        comments: noAvgComments,
        engagementRate: noEngRate,
      },
      avgLift: lift,
    };
  }

  // Overall engagement rate
  const overallEngRate = followers > 0
    ? (totalLikes + totalComments) / (totalContents * followers)
    : 0;

  // Overall EMV = (totalLikes * 0.50) + (totalComments * 1.50)
  const overallEmv = (totalLikes * 0.50) + (totalComments * 1.50);

  return {
    followers,
    school: {
      _id: schoolIdMap[schoolName] || schoolName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: schoolName,
    },
    overall: {
      totalContents,
      totalLikes,
      totalComments,
      engagementRate: overallEngRate,
      emv: Number(overallEmv.toFixed(2)),
    },
    counts: {
      hasOrganizationInCaption: withCaption.length,
      isOrganizationCollaboration: withCollab.length,
      hasOrganizationLogo: withLogo.length,
      withIp: withAnyIP.length,
    },
    orgInCaption: signalStats(withCaption, withoutCaption),
    collaboration: signalStats(withCollab, withoutCollab),
    logo: signalStats(withLogo, withoutLogo),
  };
}

function generatePartnerships(schoolName, posts, followers) {
  const sponsoredPosts = posts.filter(p =>
    typeof p.sponsorPartner === 'string' && p.sponsorPartner.trim().length > 0
  );

  // Group by sponsor
  const brandMap = {};
  for (const post of sponsoredPosts) {
    const brand = post.sponsorPartner.trim();
    if (!brandMap[brand]) brandMap[brand] = [];
    brandMap[brand].push(post);
  }

  const sponsorPartners = Object.entries(brandMap)
    .map(([brand, brandPosts]) => {
      const avgLikes = avg(brandPosts.map(p => Number(p?.metrics?.likes || 0)));
      const avgComments = avg(brandPosts.map(p => Number(p?.metrics?.comments || 0)));
      const brandEngRate = followers > 0 && brandPosts.length > 0
        ? (sum(brandPosts.map(p => Number(p?.metrics?.likes || 0))) + sum(brandPosts.map(p => Number(p?.metrics?.comments || 0)))) / (brandPosts.length * followers)
        : 0;

      // Overall engagement rate for comparison
      const overallEngRate = followers > 0
        ? posts.reduce((s, p) => s + Number(p?.metrics?.likes || 0) + Number(p?.metrics?.comments || 0), 0) / (posts.length * followers)
        : 0;

      const liftVsOverall = overallEngRate > 0 ? ((brandEngRate - overallEngRate) / overallEngRate) * 100 : 0;

      return {
        sponsorPartner: brand,
        totalContents: brandPosts.length,
        avgLikes,
        avgComments,
        engagementRate: brandEngRate,
        emv: Number(((avgLikes * 0.50) + (avgComments * 1.50)).toFixed(2)),
        engagementRateLift: liftVsOverall,
      };
    })
    .sort((a, b) => (b.avgLikes * b.totalContents) - (a.avgLikes * a.totalContents));

  const totalContents = posts.length;
  const totalAvgLikes = avg(posts.map(p => Number(p?.metrics?.likes || 0)));
  const totalAvgComments = avg(posts.map(p => Number(p?.metrics?.comments || 0)));
  const overallEngRate = followers > 0
    ? posts.reduce((s, p) => s + Number(p?.metrics?.likes || 0) + Number(p?.metrics?.comments || 0), 0) / (totalContents * followers)
    : 0;
  const overallEmv = (totalAvgLikes * 0.50) + (totalAvgComments * 1.50);

  return {
    school: {
      _id: schoolIdMap[schoolName] || schoolName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: schoolName,
    },
    followers,
    overall: {
      totalContents,
      avgLikes: totalAvgLikes,
      avgComments: totalAvgComments,
      engagementRate: overallEngRate,
      emv: Number(overallEmv.toFixed(2)),
    },
    sponsorPartners,
  };
}

function generateTopAthletes(schoolName, posts, followers) {
  // Group posts by athlete+signal
  function topBySignal(signalFilter, signalName) {
    const signalPosts = posts.filter(signalFilter);
    const nonSignalPosts = posts.filter(p => !signalFilter(p));

    // Group by athlete
    const athleteMap = {};
    for (const post of signalPosts) {
      const name = post?.athlete?.name || 'Unknown';
      const sport = post?.athlete?.sport || '';
      const key = `${name}|${sport}`;
      if (!athleteMap[key]) {
        athleteMap[key] = { name, sport, posts: [] };
      }
      athleteMap[key].posts.push(post);
    }

    // For each athlete, compute their baseline engagement rate (from non-signal posts)
    const athleteBaselineMap = {};
    for (const post of nonSignalPosts) {
      const name = post?.athlete?.name || 'Unknown';
      const sport = post?.athlete?.sport || '';
      const key = `${name}|${sport}`;
      if (!athleteBaselineMap[key]) athleteBaselineMap[key] = [];
      athleteBaselineMap[key].push(post);
    }

    const athletes = Object.values(athleteMap).map(({ name, sport, posts: aPosts }) => {
      const key = `${name}|${sport}`;
      const likes = sum(aPosts.map(p => Number(p?.metrics?.likes || 0)));
      const comments = sum(aPosts.map(p => Number(p?.metrics?.comments || 0)));
      const emvTotal = (likes * 0.50) + (comments * 1.50);
      const engRate = followers > 0 ? (likes + comments) / (aPosts.length * followers) : 0;

      // Baseline from the same athlete's non-signal posts
      const basePosts = athleteBaselineMap[key] || [];
      let lift = 0;
      if (basePosts.length > 0) {
        const baseLikes = sum(basePosts.map(p => Number(p?.metrics?.likes || 0)));
        const baseComments = sum(basePosts.map(p => Number(p?.metrics?.comments || 0)));
        const baseEngRate = followers > 0 ? (baseLikes + baseComments) / (basePosts.length * followers) : 0;
        lift = baseEngRate > 0 ? (engRate - baseEngRate) / baseEngRate : 0;
      }

      return {
        athlete: { name, sport },
        posts: aPosts.length,
        emv: Number((emvTotal / aPosts.length).toFixed(2)),
        engagementRate: Number(engRate.toFixed(6)),
        lift: Number(lift.toFixed(4)),
      };
    });

    // Sort by EMV descending and take top 5
    athletes.sort((a, b) => b.emv - a.emv);
    const top5 = athletes.slice(0, 5);

    const avgEmv = athletes.length > 0 ? avg(athletes.map(a => a.emv)) : 0;
    const avgLift = athletes.length > 0 ? avg(athletes.map(a => a.lift)) : 0;

    return {
      avgEmv: Number(avgEmv.toFixed(2)),
      avgLift: Number(avgLift.toFixed(4)),
      top5Athletes: top5,
    };
  }

  return {
    school: {
      _id: schoolIdMap[schoolName] || schoolName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: schoolName,
    },
    collaboration: topBySignal(p => Boolean(p.isOrganizationCollaboration), 'collaboration'),
    logo: topBySignal(p => Boolean(p.hasOrganizationLogo), 'logo'),
    'mention (in caption)': topBySignal(p => Boolean(p.hasOrganizationInCaption), 'mention'),
    partnership: topBySignal(
      p => typeof p.sponsorPartner === 'string' && p.sponsorPartner.trim().length > 0,
      'partnership'
    ),
  };
}

// Generate brand partnership summary
function generateBrandPartnershipSummary(allSchoolContents) {
  const allSponsoredPosts = [];
  const brandSchoolMap = {};
  const schoolBrandMap = {};

  for (const [school, posts] of Object.entries(allSchoolContents)) {
    const sponsored = posts.filter(p =>
      typeof p.sponsorPartner === 'string' && p.sponsorPartner.trim().length > 0
    );
    allSponsoredPosts.push(...sponsored);

    const schoolBrands = new Set();
    for (const p of sponsored) {
      const brand = p.sponsorPartner.trim();
      schoolBrands.add(brand);
      if (!brandSchoolMap[brand]) brandSchoolMap[brand] = new Set();
      brandSchoolMap[brand].add(school);
    }
    if (schoolBrands.size > 0) {
      schoolBrandMap[school] = schoolBrands;
    }
  }

  // Brand stats
  const brandPostCounts = {};
  for (const p of allSponsoredPosts) {
    const brand = p.sponsorPartner.trim();
    if (!brandPostCounts[brand]) brandPostCounts[brand] = [];
    brandPostCounts[brand].push(p);
  }

  const brandStats = Object.entries(brandPostCounts)
    .map(([brand, posts]) => ({
      brandName: brand.replace(/^@/, ''),
      postCount: posts.length,
      schoolCount: brandSchoolMap[brand]?.size || 0,
      avgEngagementRate: avg(posts.map(p => Number(p?.metrics?.likes || 0) + Number(p?.metrics?.comments || 0))),
    }))
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 50);

  const schoolStats = Object.entries(schoolBrandMap)
    .map(([school, brands]) => {
      const posts = allSchoolContents[school].filter(p =>
        typeof p.sponsorPartner === 'string' && p.sponsorPartner.trim().length > 0
      );
      return {
        schoolName: school,
        postCount: posts.length,
        brandCount: brands.size,
        avgEngagementRate: avg(posts.map(p =>
          (Number(p?.metrics?.likes || 0) + Number(p?.metrics?.comments || 0)) /
          Math.max(schoolFollowers[school] || 1, 1)
        )),
      };
    })
    .sort((a, b) => b.postCount - a.postCount);

  const activeSchools = Object.keys(schoolBrandMap).length;
  const activeBrands = Object.keys(brandSchoolMap).length;

  return {
    totalPosts: allSponsoredPosts.length,
    activeBrands,
    activeSchools,
    totalSchools: Object.keys(allSchoolContents).length,
    avgPostsPerBrand: activeBrands > 0 ? Math.round(allSponsoredPosts.length / activeBrands) : 0,
    brandStats,
    schoolStats,
  };
}

// Generate all files
let generated = 0;
for (const [schoolName, slug] of Object.entries(SCHOOL_SLUG_MAP)) {
  const posts = schoolContents[schoolName];
  if (!posts || posts.length === 0) {
    console.log(`  Skipping ${schoolName} (no content data)`);
    continue;
  }

  const followers = schoolFollowers[schoolName] || 0;
  console.log(`  ${schoolName}: ${posts.length} posts, ${followers.toLocaleString()} followers`);

  // Generate IP impact
  const ipImpact = generateIPImpact(schoolName, posts, followers);
  fs.writeFileSync(
    path.join(dataDir, `${slug}-ip-impact.json`),
    JSON.stringify(ipImpact, null, 2) + '\n'
  );

  // Generate partnerships
  const partnerships = generatePartnerships(schoolName, posts, followers);
  fs.writeFileSync(
    path.join(dataDir, `${slug}-partnerships.json`),
    JSON.stringify(partnerships, null, 2) + '\n'
  );

  // Generate top athletes
  const topAthletes = generateTopAthletes(schoolName, posts, followers);
  fs.writeFileSync(
    path.join(dataDir, `${slug}-top-athletes.json`),
    JSON.stringify(topAthletes, null, 2) + '\n'
  );

  generated++;
}

// Generate brand partnership summary
const brandSummary = generateBrandPartnershipSummary(schoolContents);
fs.writeFileSync(
  path.join(dataDir, 'brand-partnership-summary.json'),
  JSON.stringify(brandSummary, null, 2) + '\n'
);

console.log(`\nGenerated IP impact, partnership, and top-athlete files for ${generated} schools`);
console.log(`Generated brand-partnership-summary.json (${brandSummary.activeBrands} brands, ${brandSummary.activeSchools} schools)`);
