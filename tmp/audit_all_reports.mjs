/**
 * AUDIT: Verify all report data matches the source (last_ip_data_contents.json)
 * Checks Ohio State TSX, Georgia TSX, and all 15 Playfly school JSONs
 */

import { readFileSync } from 'fs';

const RAW = JSON.parse(readFileSync('public/data/last_ip_data_contents.json', 'utf8'));

// Index by school
const postsBySchool = {};
RAW.forEach(p => {
  const school = p.athlete?.school?.name;
  if (!school) return;
  if (!postsBySchool[school]) postsBySchool[school] = [];
  postsBySchool[school].push(p);
});

// Helpers
function avg(arr, field) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length;
}
function avgEngRate(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, p) => s + (p.metrics?.engagementRate || 0), 0) / arr.length;
}
function computeEmv(p) {
  const e = p.metrics?.emv || 0;
  if (e > 0) return e;
  return (p.metrics?.likes || 0) * 0.5 + (p.metrics?.comments || 0) * 1.5;
}
function sumEmv(arr) { return arr.reduce((s, p) => s + computeEmv(p), 0); }
function liftPct(w, wo) { return wo === 0 ? 0 : ((w - wo) / wo) * 100; }

let totalErrors = 0;
let totalWarnings = 0;

function check(label, expected, actual, tolerance = 0.02) {
  if (typeof expected === 'number' && typeof actual === 'number') {
    if (expected === 0 && actual === 0) return;
    const diff = Math.abs(expected - actual);
    const relDiff = expected !== 0 ? diff / Math.abs(expected) : diff;
    if (relDiff > tolerance) {
      console.log(`  ❌ ${label}: expected ${expected}, got ${actual} (diff: ${(relDiff * 100).toFixed(1)}%)`);
      totalErrors++;
    }
  } else if (expected !== actual) {
    console.log(`  ❌ ${label}: expected ${expected}, got ${actual}`);
    totalErrors++;
  }
}

function warn(label, msg) {
  console.log(`  ⚠️  ${label}: ${msg}`);
  totalWarnings++;
}

function computeSchoolMetrics(schoolName) {
  const posts = postsBySchool[schoolName] || [];
  if (posts.length === 0) return null;

  const withLogo = posts.filter(p => p.hasOrganizationLogo);
  const withoutLogo = posts.filter(p => !p.hasOrganizationLogo);
  const withMention = posts.filter(p => p.hasOrganizationInCaption);
  const withoutMention = posts.filter(p => !p.hasOrganizationInCaption);
  const withCollab = posts.filter(p => p.isOrganizationCollaboration);
  const withoutCollab = posts.filter(p => !p.isOrganizationCollaboration);
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);
  const withoutIP = posts.filter(p => !p.hasOrganizationLogo && !p.hasOrganizationInCaption && !p.isOrganizationCollaboration);

  return {
    totalPosts: posts.length,
    totalLikes: posts.reduce((s, p) => s + (p.metrics?.likes || 0), 0),
    totalComments: posts.reduce((s, p) => s + (p.metrics?.comments || 0), 0),
    totalEmv: sumEmv(posts),
    ipPosts: withAnyIP.length,
    ipAdoption: Math.round(withAnyIP.length / posts.length * 1000) / 10,
    engRate: avgEngRate(posts),
    baselineEngRate: avgEngRate(withoutIP),
    avgLift: liftPct(avgEngRate(withAnyIP), avgEngRate(withoutIP)),
    logo: {
      posts: withLogo.length,
      avgLikes: avg(withLogo, 'likes'),
      avgComments: avg(withLogo, 'comments'),
      engRate: avgEngRate(withLogo),
      emv: sumEmv(withLogo),
      baselineEngRate: avgEngRate(withoutLogo),
      lift: liftPct(avgEngRate(withLogo), avgEngRate(withoutLogo)),
    },
    mention: {
      posts: withMention.length,
      avgLikes: avg(withMention, 'likes'),
      avgComments: avg(withMention, 'comments'),
      engRate: avgEngRate(withMention),
      emv: sumEmv(withMention),
      baselineEngRate: avgEngRate(withoutMention),
      lift: liftPct(avgEngRate(withMention), avgEngRate(withoutMention)),
    },
    collab: {
      posts: withCollab.length,
      avgLikes: avg(withCollab, 'likes'),
      avgComments: avg(withCollab, 'comments'),
      engRate: avgEngRate(withCollab),
      emv: sumEmv(withCollab),
      baselineEngRate: avgEngRate(withoutCollab),
      lift: liftPct(avgEngRate(withCollab), avgEngRate(withoutCollab)),
    },
  };
}

// ═══════════════════════════════════════════════════════
// AUDIT OHIO STATE TSX
// ═══════════════════════════════════════════════════════
console.log('\n═══ AUDIT: Ohio State TSX ═══');
const ohioSrc = readFileSync('src/components/OhioStateIPImpact.tsx', 'utf8');
const ohioMetrics = computeSchoolMetrics('Ohio State');

// Extract key values from TSX using regex
function extractTsxValue(src, key) {
  const regex = new RegExp(`${key}:\\s*([\\d.]+)`);
  const match = src.match(regex);
  return match ? parseFloat(match[1]) : null;
}

const ohioTotalPosts = extractTsxValue(ohioSrc, 'totalPosts');
const ohioPostsWithIP = extractTsxValue(ohioSrc, 'postsWithIP');
const ohioIpAdoption = extractTsxValue(ohioSrc, 'ipAdoptionRate');
const ohioAvgLift = extractTsxValue(ohioSrc, 'avgLift');
const ohioTotalEmv = extractTsxValue(ohioSrc, 'totalEmv');

check('totalPosts', ohioMetrics.totalPosts, ohioTotalPosts, 0);
check('postsWithIP', ohioMetrics.ipPosts, ohioPostsWithIP, 0);
check('ipAdoptionRate', ohioMetrics.ipAdoption, ohioIpAdoption, 0.01);
check('avgLift', Math.round(ohioMetrics.avgLift * 10) / 10, ohioAvgLift, 0.02);
check('totalEmv', Math.round(ohioMetrics.totalEmv), ohioTotalEmv, 0.01);

// Check signal data in TSX
const ohioCollabMatch = ohioSrc.match(/collaboration:\s*\{[^}]*posts:\s*(\d+)[^}]*delta:\s*([\d.-]+)/);
if (ohioCollabMatch) {
  check('collab.posts', ohioMetrics.collab.posts, parseInt(ohioCollabMatch[1]), 0);
  check('collab.delta', Math.round(ohioMetrics.collab.lift * 10) / 10, parseFloat(ohioCollabMatch[2]), 0.02);
}

const ohioLogoMatch = ohioSrc.match(/logo:\s*\{[^}]*posts:\s*(\d+)[^}]*delta:\s*([\d.-]+)/);
if (ohioLogoMatch) {
  check('logo.posts', ohioMetrics.logo.posts, parseInt(ohioLogoMatch[1]), 0);
  check('logo.delta', Math.round(ohioMetrics.logo.lift * 10) / 10, parseFloat(ohioLogoMatch[2]), 0.02);
}

const ohioMentionMatch = ohioSrc.match(/mention:\s*\{[^}]*posts:\s*(\d+)[^}]*delta:\s*([\d.-]+)/);
if (ohioMentionMatch) {
  check('mention.posts', ohioMetrics.mention.posts, parseInt(ohioMentionMatch[1]), 0);
  check('mention.delta', Math.round(ohioMetrics.mention.lift * 10) / 10, parseFloat(ohioMentionMatch[2]), 0.02);
}

console.log(`  Total posts: ${ohioMetrics.totalPosts}, IP: ${ohioMetrics.ipPosts} (${ohioMetrics.ipAdoption}%)`);
console.log(`  EMV: $${Math.round(ohioMetrics.totalEmv).toLocaleString()}`);
console.log(`  Logo: ${ohioMetrics.logo.posts} posts, lift: ${Math.round(ohioMetrics.logo.lift * 10) / 10}%`);
console.log(`  Mention: ${ohioMetrics.mention.posts} posts, lift: ${Math.round(ohioMetrics.mention.lift * 10) / 10}%`);
console.log(`  Collab: ${ohioMetrics.collab.posts} posts, lift: ${Math.round(ohioMetrics.collab.lift * 10) / 10}%`);

// ═══════════════════════════════════════════════════════
// AUDIT GEORGIA TSX
// ═══════════════════════════════════════════════════════
console.log('\n═══ AUDIT: Georgia TSX ═══');
const gaSrc = readFileSync('src/components/GeorgiaIPImpact.tsx', 'utf8');
const gaMetrics = computeSchoolMetrics('University Of Georgia');

const gaTotalPosts = extractTsxValue(gaSrc, 'totalPosts');
const gaPostsWithIP = extractTsxValue(gaSrc, 'postsWithIP');
const gaIpAdoption = extractTsxValue(gaSrc, 'ipAdoptionRate');
const gaAvgLift = extractTsxValue(gaSrc, 'avgLift');
const gaTotalEmv = extractTsxValue(gaSrc, 'totalEmv');

check('totalPosts', gaMetrics.totalPosts, gaTotalPosts, 0);
check('postsWithIP', gaMetrics.ipPosts, gaPostsWithIP, 0);
check('ipAdoptionRate', gaMetrics.ipAdoption, gaIpAdoption, 0.01);
check('avgLift', Math.round(gaMetrics.avgLift * 10) / 10, gaAvgLift, 0.02);
check('totalEmv', Math.round(gaMetrics.totalEmv), gaTotalEmv, 0.01);

const gaCollabMatch = gaSrc.match(/collaboration:\s*\{[^}]*posts:\s*(\d+)[^}]*delta:\s*([\d.-]+)/);
if (gaCollabMatch) {
  check('collab.posts', gaMetrics.collab.posts, parseInt(gaCollabMatch[1]), 0);
  check('collab.delta', Math.round(gaMetrics.collab.lift * 10) / 10, parseFloat(gaCollabMatch[2]), 0.02);
}

const gaLogoMatch = gaSrc.match(/logo:\s*\{[^}]*posts:\s*(\d+)[^}]*delta:\s*([\d.-]+)/);
if (gaLogoMatch) {
  check('logo.posts', gaMetrics.logo.posts, parseInt(gaLogoMatch[1]), 0);
  check('logo.delta', Math.round(gaMetrics.logo.lift * 10) / 10, parseFloat(gaLogoMatch[2]), 0.02);
}

const gaMentionMatch = gaSrc.match(/mention:\s*\{[^}]*posts:\s*(\d+)[^}]*delta:\s*([\d.-]+)/);
if (gaMentionMatch) {
  check('mention.posts', gaMetrics.mention.posts, parseInt(gaMentionMatch[1]), 0);
  check('mention.delta', Math.round(gaMetrics.mention.lift * 10) / 10, parseFloat(gaMentionMatch[2]), 0.02);
}

console.log(`  Total posts: ${gaMetrics.totalPosts}, IP: ${gaMetrics.ipPosts} (${gaMetrics.ipAdoption}%)`);
console.log(`  EMV: $${Math.round(gaMetrics.totalEmv).toLocaleString()}`);
console.log(`  Logo: ${gaMetrics.logo.posts} posts, lift: ${Math.round(gaMetrics.logo.lift * 10) / 10}%`);
console.log(`  Mention: ${gaMetrics.mention.posts} posts, lift: ${Math.round(gaMetrics.mention.lift * 10) / 10}%`);
console.log(`  Collab: ${gaMetrics.collab.posts} posts, lift: ${Math.round(gaMetrics.collab.lift * 10) / 10}%`);

// ═══════════════════════════════════════════════════════
// AUDIT PLAYFLY SCHOOL JSONs
// ═══════════════════════════════════════════════════════
console.log('\n═══ AUDIT: Playfly School JSONs ═══');

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

for (const [schoolName, fileSlug] of Object.entries(PLAYFLY_SCHOOLS)) {
  const metrics = computeSchoolMetrics(schoolName);
  if (!metrics) {
    console.log(`  ❌ ${schoolName}: NO SOURCE DATA`);
    totalErrors++;
    continue;
  }

  // Check IP Impact JSON
  try {
    const ipJson = JSON.parse(readFileSync(`public/data/${fileSlug}-ip-impact.json`, 'utf8'));
    const jsonPosts = ipJson.overall.totalContents;
    const jsonIpPosts = ipJson.counts.withIp;
    const jsonLogo = ipJson.counts.hasOrganizationLogo;
    const jsonMention = ipJson.counts.hasOrganizationInCaption;
    const jsonCollab = ipJson.counts.isOrganizationCollaboration;

    let schoolErrors = 0;
    if (jsonPosts !== metrics.totalPosts) { schoolErrors++; console.log(`  ❌ ${schoolName} IP: totalContents ${jsonPosts} != ${metrics.totalPosts}`); }
    if (jsonIpPosts !== metrics.ipPosts) { schoolErrors++; console.log(`  ❌ ${schoolName} IP: withIp ${jsonIpPosts} != ${metrics.ipPosts}`); }
    if (jsonLogo !== metrics.logo.posts) { schoolErrors++; console.log(`  ❌ ${schoolName} IP: logo ${jsonLogo} != ${metrics.logo.posts}`); }
    if (jsonMention !== metrics.mention.posts) { schoolErrors++; console.log(`  ❌ ${schoolName} IP: mention ${jsonMention} != ${metrics.mention.posts}`); }
    if (jsonCollab !== metrics.collab.posts) { schoolErrors++; console.log(`  ❌ ${schoolName} IP: collab ${jsonCollab} != ${metrics.collab.posts}`); }

    totalErrors += schoolErrors;
    if (schoolErrors === 0) {
      console.log(`  ✅ ${schoolName}: ${metrics.totalPosts} posts, IP=${metrics.ipPosts} (${metrics.ipAdoption}%), L=${metrics.logo.posts} M=${metrics.mention.posts} C=${metrics.collab.posts}`);
    }
  } catch (e) {
    console.log(`  ❌ ${schoolName}: Failed to read IP JSON: ${e.message}`);
    totalErrors++;
  }

  // Check Partnerships JSON
  try {
    const partJson = JSON.parse(readFileSync(`public/data/${fileSlug}-partnerships.json`, 'utf8'));
    if (partJson.overall.totalContents !== metrics.totalPosts) {
      console.log(`  ❌ ${schoolName} Partners: totalContents ${partJson.overall.totalContents} != ${metrics.totalPosts}`);
      totalErrors++;
    }
  } catch (e) {
    console.log(`  ❌ ${schoolName}: Failed to read partnerships JSON: ${e.message}`);
    totalErrors++;
  }

  // Check Athletes JSON
  try {
    const athJson = JSON.parse(readFileSync(`public/data/${fileSlug}-top-athletes.json`, 'utf8'));
    if (!athJson.collaboration || !athJson.logo || !athJson['mention (in caption)'] || !athJson.partnership) {
      console.log(`  ❌ ${schoolName} Athletes: Missing signal sections`);
      totalErrors++;
    }
  } catch (e) {
    console.log(`  ❌ ${schoolName}: Failed to read athletes JSON: ${e.message}`);
    totalErrors++;
  }
}

// ═══════════════════════════════════════════════════════
// AUDIT: Runtime Overview JSONs
// ═══════════════════════════════════════════════════════
console.log('\n═══ AUDIT: Runtime Overview JSONs ═══');

const ohioOverview = JSON.parse(readFileSync('public/data/ohio-state-athlete-overview.json', 'utf8'));
check('Ohio State overview totalPosts', ohioMetrics.totalPosts, ohioOverview.totalPosts, 0);
check('Ohio State overview postsWithIP', ohioMetrics.ipPosts, ohioOverview.postsWithIP, 0);
check('Ohio State overview ipAdoption', ohioMetrics.ipAdoption, ohioOverview.ipAdoptionRate, 0.01);
console.log(`  Ohio State overview: ${ohioOverview.totalPosts} posts, IP=${ohioOverview.postsWithIP} (${ohioOverview.ipAdoptionRate}%)`);

const gaOverview = JSON.parse(readFileSync('public/data/georgia-athlete-overview.json', 'utf8'));
check('Georgia overview totalPosts', gaMetrics.totalPosts, gaOverview.totalPosts, 0);
check('Georgia overview postsWithIP', gaMetrics.ipPosts, gaOverview.postsWithIP, 0);
check('Georgia overview ipAdoption', gaMetrics.ipAdoption, gaOverview.ipAdoptionRate, 0.01);
console.log(`  Georgia overview: ${gaOverview.totalPosts} posts, IP=${gaOverview.postsWithIP} (${gaOverview.ipAdoptionRate}%)`);

// ═══════════════════════════════════════════════════════
// AUDIT: Brand Partnership Summary
// ═══════════════════════════════════════════════════════
console.log('\n═══ AUDIT: Brand Partnership Summary ═══');
const brandSummary = JSON.parse(readFileSync('public/data/brand-partnership-summary.json', 'utf8'));
check('Brand summary activeSchools', 15, brandSummary.activeSchools, 0);
console.log(`  Brands: ${brandSummary.activeBrands}, Schools: ${brandSummary.activeSchools}, Posts: ${brandSummary.totalPosts}`);

// ═══════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════
console.log('\n═══════════════════════════════════════════');
console.log(`AUDIT COMPLETE: ${totalErrors} errors, ${totalWarnings} warnings`);
if (totalErrors === 0) {
  console.log('✅ ALL DATA VERIFIED AGAINST SOURCE');
} else {
  console.log('❌ ERRORS FOUND — see above');
}
