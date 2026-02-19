/**
 * Generate ALL remaining tab data from last_ip_data_contents.json for Ohio State
 * Outputs: top athletes, signal stats, sport breakdown, Big 10 schools, NCAA D1 schools, conference averages
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

// ═══════════════════════════════════════════
// 1. TOP ATHLETES FOR OHIO STATE
// ═══════════════════════════════════════════
const ohioPosts = postsBySchool['Ohio State'];
const ohioOverallEngRate = avgEngRate(ohioPosts);

function topAthletesForSignal(posts, signalFn, overallEngRate) {
  const signalPosts = posts.filter(signalFn);
  const byAthlete = {};
  signalPosts.forEach(p => {
    const id = p.athlete?._id;
    if (!id) return;
    if (!byAthlete[id]) byAthlete[id] = { name: p.athlete.name, sport: p.athlete.sport, posts: [] };
    byAthlete[id].posts.push(p);
  });

  return Object.values(byAthlete)
    .map((a, i) => {
      const emv = sumEmv(a.posts);
      const engRate = avgEngRate(a.posts);
      const lift = Math.round(liftPct(engRate, overallEngRate));
      return { name: a.name, sport: a.sport, posts: a.posts.length, emv: Math.round(emv), lift };
    })
    .sort((a, b) => b.emv - a.emv)
    .slice(0, 5)
    .map((a, i) => ({ rank: i + 1, ...a }));
}

// Sport name formatting
function formatSport(sport) {
  const map = {
    'FOOTBALL': 'Football',
    'MENS_BASKETBALL': 'M. Basketball',
    'WOMENS_BASKETBALL': 'W. Basketball',
    'MENS_WRESTLING': 'M. Wrestling',
    'WOMENS_GYMNASTICS': 'W. Gymnastics',
    'MENS_GYMNASTICS': 'M. Gymnastics',
    'WOMENS_SOCCER': 'W. Soccer',
    'MENS_SOCCER': 'M. Soccer',
    'SOFTBALL': 'Softball',
    'MENS_BASEBALL': 'Baseball',
    'BASEBALL': 'Baseball',
    'DANCE': 'Dance',
    'CHEER': 'Cheer',
    'WOMENS_LACROSSE': 'W. Lacrosse',
    'MENS_LACROSSE': 'M. Lacrosse',
    'WOMENS_VOLLEYBALL': 'W. Volleyball',
    'MENS_VOLLEYBALL': 'M. Volleyball',
    'WOMENS_SWIM': 'W. Swimming',
    'MENS_SWIM': 'M. Swimming',
    'SWIMMING_AND_DIVING': 'Swimming',
    'SYNCHRONIZED_SWIMMING': 'Sync. Swimming',
    'FENCING': 'Fencing',
    'WOMENS_FIELD_HOCKEY': 'Field Hockey',
    'WOMENS_ROWING': 'Rowing',
    'WOMENS_HOCKEY': 'W. Hockey',
    'MENS_HOCKEY': 'M. Hockey',
    'PISTOL': 'Pistol',
    'RIFLING': 'Rifle',
    'MENS_TRACK_AND_FIELD': 'M. Track & Field',
    'WOMENS_TRACK_AND_FIELD': 'W. Track & Field',
    'CROSS_COUNTRY': 'Cross Country',
    'WOMENS_CROSS_COUNTRY': 'W. Cross Country',
    'MENS_CROSS_COUNTRY': 'M. Cross Country',
    'MENS_TENNIS': 'M. Tennis',
    'WOMENS_TENNIS': 'W. Tennis',
    'MENS_GOLF': 'M. Golf',
    'WOMENS_GOLF': 'W. Golf',
    'EQUESTRIAN': 'Equestrian',
  };
  return map[sport] || sport;
}

const ohioCollabTop = topAthletesForSignal(ohioPosts, p => p.isOrganizationCollaboration, ohioOverallEngRate);
const ohioLogoTop = topAthletesForSignal(ohioPosts, p => p.hasOrganizationLogo, ohioOverallEngRate);
const ohioMentionTop = topAthletesForSignal(ohioPosts, p => p.hasOrganizationInCaption, ohioOverallEngRate);

console.log('\n═══ OHIO STATE TOP ATHLETES ═══');
console.log('Collab:', ohioCollabTop.map(a => `${a.name} (${formatSport(a.sport)}, ${a.posts}p, $${a.emv})`).join(', '));
console.log('Logo:', ohioLogoTop.map(a => `${a.name} (${formatSport(a.sport)}, ${a.posts}p, $${a.emv})`).join(', '));
console.log('Mention:', ohioMentionTop.map(a => `${a.name} (${formatSport(a.sport)}, ${a.posts}p, $${a.emv})`).join(', '));

// ═══════════════════════════════════════════
// 2. SIGNAL STATS FOR OHIO STATE
// ═══════════════════════════════════════════
function signalStatsFor(posts, signalFn, overallEngRate) {
  const sp = posts.filter(signalFn);
  const emv = sumEmv(sp);
  const athletes = new Set(sp.map(p => p.athlete?._id));
  const avgEmv = athletes.size > 0 ? emv / athletes.size : 0;
  const engRate = avgEngRate(sp);
  const lift = Math.round(liftPct(engRate, overallEngRate));
  return { posts: sp.length, totalEmv: Math.round(emv), avgEmv: Math.round(avgEmv), lift };
}

const ohioSignalStats = {
  collab: signalStatsFor(ohioPosts, p => p.isOrganizationCollaboration, ohioOverallEngRate),
  logo: signalStatsFor(ohioPosts, p => p.hasOrganizationLogo, ohioOverallEngRate),
  mention: signalStatsFor(ohioPosts, p => p.hasOrganizationInCaption, ohioOverallEngRate),
};
console.log('\nSignal stats:', JSON.stringify(ohioSignalStats));

// ═══════════════════════════════════════════
// 3. FALLBACK SPORT DATA FOR OHIO STATE
// ═══════════════════════════════════════════
function sportBreakdown(posts, sport) {
  const sp = sport === 'ALL_SPORTS' ? posts : posts.filter(p => p.athlete?.sport === sport);
  if (sp.length === 0) return null;

  const withMention = sp.filter(p => p.hasOrganizationInCaption);
  const withoutMention = sp.filter(p => !p.hasOrganizationInCaption);
  const withLogo = sp.filter(p => p.hasOrganizationLogo);
  const withoutLogo = sp.filter(p => !p.hasOrganizationLogo);
  const withCollab = sp.filter(p => p.isOrganizationCollaboration);
  const withoutCollab = sp.filter(p => !p.isOrganizationCollaboration);

  return {
    mention: {
      with: { posts: withMention.length, avgLikes: Math.round(avg(withMention, 'likes')), avgComments: Math.round(avg(withMention, 'comments')), engagementRate: Math.round(avgEngRate(withMention) * 10000) / 10000 },
      without: { posts: withoutMention.length, avgLikes: Math.round(avg(withoutMention, 'likes')), avgComments: Math.round(avg(withoutMention, 'comments')), engagementRate: Math.round(avgEngRate(withoutMention) * 10000) / 10000 },
    },
    logo: {
      with: { posts: withLogo.length, avgLikes: Math.round(avg(withLogo, 'likes')), avgComments: Math.round(avg(withLogo, 'comments')), engagementRate: Math.round(avgEngRate(withLogo) * 10000) / 10000 },
      without: { posts: withoutLogo.length, avgLikes: Math.round(avg(withoutLogo, 'likes')), avgComments: Math.round(avg(withoutLogo, 'comments')), engagementRate: Math.round(avgEngRate(withoutLogo) * 10000) / 10000 },
    },
    collab: {
      with: { posts: withCollab.length, avgLikes: Math.round(avg(withCollab, 'likes')), avgComments: Math.round(avg(withCollab, 'comments')), engagementRate: Math.round(avgEngRate(withCollab) * 10000) / 10000 },
      without: { posts: withoutCollab.length, avgLikes: Math.round(avg(withoutCollab, 'likes')), avgComments: Math.round(avg(withoutCollab, 'comments')), engagementRate: Math.round(avgEngRate(withoutCollab) * 10000) / 10000 },
    },
  };
}

const ohioSports = ['ALL_SPORTS', 'FOOTBALL', 'MENS_BASKETBALL', 'MENS_WRESTLING', 'WOMENS_BASKETBALL', 'MENS_GYMNASTICS'];
const ohioFallbackSportData = {};
for (const sport of ohioSports) {
  const data = sportBreakdown(ohioPosts, sport);
  if (data) ohioFallbackSportData[sport] = data;
}

console.log('\nFallback sport data generated for:', Object.keys(ohioFallbackSportData).join(', '));

// ═══════════════════════════════════════════
// 4. BIG 10 SCHOOLS
// ═══════════════════════════════════════════
const schoolNameMap = {
  'Ohio State': { display: 'Ohio State', conf: 'Big 10' },
  'Penn State University': { display: 'Penn State', conf: 'Big 10' },
  'Michigan': { display: 'Michigan', conf: 'Big 10' },
  'Michigan State': { display: 'Michigan State', conf: 'Big 10' },
  'University of Nebraska': { display: 'Nebraska', conf: 'Big 10' },
  'University of Maryland': { display: 'Maryland', conf: 'Big 10' },
  'Purdue University': { display: 'Purdue', conf: 'Big 10' },
  'Rutgers': { display: 'Rutgers', conf: 'Big 10' },
  'Iowa': { display: 'Iowa', conf: 'Big 10' },
  'Indiana': { display: 'Indiana', conf: 'Big 10' },
  'Washington': { display: 'Washington', conf: 'Big 10' },
  'Minnesota': { display: 'Minnesota', conf: 'Big 10' },
  'Illinois': { display: 'Illinois', conf: 'Big 10' },
  'University of Wisconsin': { display: 'Wisconsin', conf: 'Big 10' },
  'University of California, Los Angeles': { display: 'UCLA', conf: 'Big 10' },
  'University of Southern California (USC)': { display: 'USC', conf: 'Big 10' },
  'Oregon': { display: 'Oregon', conf: 'Big 10' },
};

function computeSchoolRow(schoolName, displayName, conf) {
  const posts = postsBySchool[schoolName];
  if (!posts || posts.length === 0) return null;

  const logo = posts.filter(p => p.hasOrganizationLogo);
  const mention = posts.filter(p => p.hasOrganizationInCaption);
  const collab = posts.filter(p => p.isOrganizationCollaboration);
  const anyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);

  const byAthlete = {};
  posts.forEach(p => {
    const id = p.athlete?._id;
    const f = p.metrics?.followers || 0;
    if (id && (!byAthlete[id] || f > byAthlete[id])) byAthlete[id] = f;
  });
  const followers = Object.values(byAthlete).reduce((a, b) => a + b, 0);

  return {
    name: displayName,
    conf,
    posts: posts.length,
    adoption: Math.round(anyIP.length / posts.length * 1000) / 10,
    logo: Math.round(logo.length / posts.length * 1000) / 10,
    mention: Math.round(mention.length / posts.length * 1000) / 10,
    collab: Math.round(collab.length / posts.length * 1000) / 10,
    followers,
  };
}

const big10Schools = [];
for (const [name, info] of Object.entries(schoolNameMap)) {
  const row = computeSchoolRow(name, info.display, info.conf);
  if (row) big10Schools.push(row);
}
big10Schools.sort((a, b) => b.adoption - a.adoption);

console.log('\n═══ BIG 10 SCHOOLS ═══');
big10Schools.forEach(s => console.log(`  ${s.name}: ${s.posts} posts, ${s.adoption}% adoption, followers: ${s.followers}`));

// ═══════════════════════════════════════════
// 5. NCAA D1 SCHOOLS (all schools)
// ═══════════════════════════════════════════
const allSchoolsMap = {
  'Ohio State': { display: 'Ohio State', conf: 'Big 10' },
  'Penn State University': { display: 'Penn State', conf: 'Big 10' },
  'Arizona State University': { display: 'Arizona State', conf: 'Big 12' },
  'Baylor': { display: 'Baylor', conf: 'Big 12' },
  'University of California, Los Angeles': { display: 'UCLA', conf: 'Big 10' },
  'University Of Georgia': { display: 'Georgia', conf: 'SEC' },
  'University of Virginia': { display: 'Virginia', conf: 'ACC' },
  'Auburn University': { display: 'Auburn', conf: 'SEC' },
  'University Of Texas': { display: 'Texas', conf: 'SEC' },
  'University of Wisconsin': { display: 'Wisconsin', conf: 'Big 10' },
  'University of Southern California (USC)': { display: 'USC', conf: 'Big 10' },
  'The University of Alabama': { display: 'Alabama', conf: 'SEC' },
  'University of Missouri': { display: 'Missouri', conf: 'SEC' },
  'University of Arkansas': { display: 'Arkansas', conf: 'SEC' },
  'Louisiana State University': { display: 'LSU', conf: 'SEC' },
  'Purdue University': { display: 'Purdue', conf: 'Big 10' },
  'Brigham Young University(BYU)': { display: 'BYU', conf: 'Big 12' },
  'University of Cincinnati': { display: 'Cincinnati', conf: 'Big 12' },
  'The University of Arizona': { display: 'Arizona', conf: 'Big 12' },
  'Texas A&M': { display: 'Texas A&M', conf: 'SEC' },
  'Kentucky': { display: 'Kentucky', conf: 'SEC' },
  'Michigan': { display: 'Michigan', conf: 'Big 10' },
  'University of Nebraska': { display: 'Nebraska', conf: 'Big 10' },
  'Boise State': { display: 'Boise State', conf: 'MWC' },
  'Virginia Tech': { display: 'Virginia Tech', conf: 'ACC' },
  'University of Texas at San Antonio (UTSA)': { display: 'UTSA', conf: 'AAC' },
  'San Diego State University': { display: 'San Diego State', conf: 'MWC' },
  'Clemson': { display: 'Clemson', conf: 'ACC' },
  'Illinois': { display: 'Illinois', conf: 'Big 10' },
  'University of North Carolina (UNC)': { display: 'UNC', conf: 'ACC' },
  'Iowa': { display: 'Iowa', conf: 'Big 10' },
  'Washington': { display: 'Washington', conf: 'Big 10' },
  'Michigan State': { display: 'Michigan State', conf: 'Big 10' },
  'Oklahoma': { display: 'Oklahoma', conf: 'SEC' },
  'University of Maryland': { display: 'Maryland', conf: 'Big 10' },
  'Notre Dame': { display: 'Notre Dame', conf: 'ACC' },
  'Rutgers': { display: 'Rutgers', conf: 'Big 10' },
  'Florida': { display: 'Florida', conf: 'SEC' },
  'Robert Morris University': { display: 'Robert Morris', conf: 'Horizon' },
  'Oregon': { display: 'Oregon', conf: 'Big 10' },
  'Indiana': { display: 'Indiana', conf: 'Big 10' },
  'Creighton University': { display: 'Creighton', conf: 'Big East' },
  'North Carolina State': { display: 'NC State', conf: 'ACC' },
  'Pittsburgh': { display: 'Pittsburgh', conf: 'ACC' },
  'Brigham Young University (BYU)': { display: 'BYU (2)', conf: 'Big 12' }, // duplicate entry
  'Tennessee': { display: 'Tennessee', conf: 'SEC' },
  'Kansas': { display: 'Kansas', conf: 'Big 12' },
  'University of Central Florida': { display: 'UCF', conf: 'Big 12' },
  'Texas Tech': { display: 'Texas Tech', conf: 'Big 12' },
  'Minnesota': { display: 'Minnesota', conf: 'Big 10' },
  'Ole Miss': { display: 'Ole Miss', conf: 'SEC' },
  'West Virginia': { display: 'West Virginia', conf: 'Big 12' },
  'Mississippi': { display: 'Mississippi', conf: 'SEC' },
  'Iowa State': { display: 'Iowa State', conf: 'Big 12' },
  'Vanderbilt': { display: 'Vanderbilt', conf: 'SEC' },
  'Utah': { display: 'Utah', conf: 'Big 12' },
  'Florida State': { display: 'Florida State', conf: 'ACC' },
  'Miami': { display: 'Miami', conf: 'ACC' },
  'Georgia Tech': { display: 'Georgia Tech', conf: 'ACC' },
  'University of San Diego': { display: 'San Diego', conf: 'WCC' },
  'Houston': { display: 'Houston', conf: 'Big 12' },
  'George Mason': { display: 'George Mason', conf: 'A-10' },
  'DUKE': { display: 'Duke', conf: 'ACC' },
  'Oklahoma State': { display: 'Oklahoma State', conf: 'Big 12' },
  'Southern Methodist University (SMU)': { display: 'SMU', conf: 'AAC' },
  'Wichita State University': { display: 'Wichita State', conf: 'AAC' },
  'Texas Christian University': { display: 'TCU', conf: 'Big 12' },
  'Kansas State': { display: 'Kansas State', conf: 'Big 12' },
  'Old Dominion University': { display: 'Old Dominion', conf: 'Sun Belt' },
  'Boston College': { display: 'Boston College', conf: 'ACC' },
  'Colorado': { display: 'Colorado', conf: 'Big 12' },
  'University of New Mexico': { display: 'New Mexico', conf: 'MWC' },
  'New Mexico State University': { display: 'New Mexico State', conf: 'CUSA' },
  'Washington State': { display: 'Washington State', conf: 'Pac-12' },
  'Depaul': { display: 'DePaul', conf: 'Big East' },
  'Providence College': { display: 'Providence', conf: 'Big East' },
  'Rice University': { display: 'Rice', conf: 'AAC' },
};

// Merge BYU entries
const ncaaD1Schools = [];
const seen = new Set();
for (const [name, info] of Object.entries(allSchoolsMap)) {
  if (info.display === 'BYU (2)') continue; // skip duplicate
  if (seen.has(info.display)) continue;
  seen.add(info.display);

  let schoolPosts = postsBySchool[name] || [];
  // Merge BYU entries
  if (name === 'Brigham Young University(BYU)') {
    const extra = postsBySchool['Brigham Young University (BYU)'] || [];
    schoolPosts = [...schoolPosts, ...extra];
  }

  if (schoolPosts.length === 0) continue;

  const logo = schoolPosts.filter(p => p.hasOrganizationLogo);
  const mention = schoolPosts.filter(p => p.hasOrganizationInCaption);
  const collab = schoolPosts.filter(p => p.isOrganizationCollaboration);
  const anyIP = schoolPosts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);

  const byAthlete = {};
  schoolPosts.forEach(p => {
    const id = p.athlete?._id;
    const f = p.metrics?.followers || 0;
    if (id && (!byAthlete[id] || f > byAthlete[id])) byAthlete[id] = f;
  });
  const followers = Object.values(byAthlete).reduce((a, b) => a + b, 0);

  ncaaD1Schools.push({
    name: info.display,
    conf: info.conf,
    posts: schoolPosts.length,
    adoption: Math.round(anyIP.length / schoolPosts.length * 1000) / 10,
    logo: Math.round(logo.length / schoolPosts.length * 1000) / 10,
    mention: Math.round(mention.length / schoolPosts.length * 1000) / 10,
    collab: Math.round(collab.length / schoolPosts.length * 1000) / 10,
    followers,
  });
}
ncaaD1Schools.sort((a, b) => b.adoption - a.adoption);

console.log(`\n═══ NCAA D1 SCHOOLS (${ncaaD1Schools.length}) ═══`);
ncaaD1Schools.slice(0, 5).forEach(s => console.log(`  ${s.name}: ${s.posts} posts, ${s.adoption}%`));
console.log(`  ...`);
ncaaD1Schools.slice(-3).forEach(s => console.log(`  ${s.name}: ${s.posts} posts, ${s.adoption}%`));

// Compute conference and D1 averages
const big10Avg = {
  adoption: Math.round(big10Schools.reduce((s, sc) => s + sc.adoption, 0) / big10Schools.length * 10) / 10,
  logo: Math.round(big10Schools.reduce((s, sc) => s + sc.logo, 0) / big10Schools.length * 10) / 10,
  mention: Math.round(big10Schools.reduce((s, sc) => s + sc.mention, 0) / big10Schools.length * 10) / 10,
  collab: Math.round(big10Schools.reduce((s, sc) => s + sc.collab, 0) / big10Schools.length * 10) / 10,
};
const ncaaD1Avg = {
  adoption: Math.round(ncaaD1Schools.reduce((s, sc) => s + sc.adoption, 0) / ncaaD1Schools.length * 10) / 10,
  logo: Math.round(ncaaD1Schools.reduce((s, sc) => s + sc.logo, 0) / ncaaD1Schools.length * 10) / 10,
  mention: Math.round(ncaaD1Schools.reduce((s, sc) => s + sc.mention, 0) / ncaaD1Schools.length * 10) / 10,
  collab: Math.round(ncaaD1Schools.reduce((s, sc) => s + sc.collab, 0) / ncaaD1Schools.length * 10) / 10,
};

console.log(`\nBig 10 avg: adoption=${big10Avg.adoption}, logo=${big10Avg.logo}, mention=${big10Avg.mention}, collab=${big10Avg.collab}`);
console.log(`NCAA D1 avg: adoption=${ncaaD1Avg.adoption}, logo=${ncaaD1Avg.logo}, mention=${ncaaD1Avg.mention}, collab=${ncaaD1Avg.collab}`);

// ═══════════════════════════════════════════
// OUTPUT TSX BLOCKS
// ═══════════════════════════════════════════

function athleteArrayTsx(name, athletes) {
  const lines = athletes.map(a =>
    `  { rank: ${a.rank}, name: "${a.name}", sport: "${formatSport(a.sport)}", posts: ${a.posts}, emv: ${a.emv}, lift: ${a.lift} },`
  ).join('\n');
  return `const ${name} = [\n${lines}\n];`;
}

function signalStatsTsx(stats) {
  return `const signalStats = {
  collab: { posts: ${stats.collab.posts}, totalEmv: ${stats.collab.totalEmv}, avgEmv: ${stats.collab.avgEmv}, lift: ${stats.collab.lift} },
  logo: { posts: ${stats.logo.posts}, totalEmv: ${stats.logo.totalEmv}, avgEmv: ${stats.logo.avgEmv}, lift: ${stats.logo.lift} },
  mention: { posts: ${stats.mention.posts}, totalEmv: ${stats.mention.totalEmv}, avgEmv: ${stats.mention.avgEmv}, lift: ${stats.mention.lift} },
};`;
}

function sportDataTsx(data) {
  const entries = Object.entries(data).map(([sport, d]) => {
    return `  '${sport}': {
    mention: { with: { posts: ${d.mention.with.posts}, avgLikes: ${d.mention.with.avgLikes}, avgComments: ${d.mention.with.avgComments}, engagementRate: ${d.mention.with.engagementRate} }, without: { posts: ${d.mention.without.posts}, avgLikes: ${d.mention.without.avgLikes}, avgComments: ${d.mention.without.avgComments}, engagementRate: ${d.mention.without.engagementRate} } },
    logo: { with: { posts: ${d.logo.with.posts}, avgLikes: ${d.logo.with.avgLikes}, avgComments: ${d.logo.with.avgComments}, engagementRate: ${d.logo.with.engagementRate} }, without: { posts: ${d.logo.without.posts}, avgLikes: ${d.logo.without.avgLikes}, avgComments: ${d.logo.without.avgComments}, engagementRate: ${d.logo.without.engagementRate} } },
    collab: { with: { posts: ${d.collab.with.posts}, avgLikes: ${d.collab.with.avgLikes}, avgComments: ${d.collab.with.avgComments}, engagementRate: ${d.collab.with.engagementRate} }, without: { posts: ${d.collab.without.posts}, avgLikes: ${d.collab.without.avgLikes}, avgComments: ${d.collab.without.avgComments}, engagementRate: ${d.collab.without.engagementRate} } }
  }`;
  });
  return entries.join(',\n');
}

function schoolArrayTsx(schools) {
  return schools.map(s =>
    `  { name: '${s.name}', conf: '${s.conf}', posts: ${s.posts}, adoption: ${s.adoption}, logo: ${s.logo}, mention: ${s.mention}, collab: ${s.collab}, followers: ${s.followers} },`
  ).join('\n');
}

const output = `// ═══ TOP ATHLETES ═══
${athleteArrayTsx('topCollabAthletes', ohioCollabTop)}
${athleteArrayTsx('topLogoAthletes', ohioLogoTop)}
${athleteArrayTsx('topMentionAthletes', ohioMentionTop)}
${signalStatsTsx(ohioSignalStats)}

// ═══ FALLBACK SPORT DATA ═══
// Paste inside: const fallbackSportData = {
${sportDataTsx(ohioFallbackSportData)}

// ═══ BIG 10 SCHOOLS ═══
// const big10Schools = [
${schoolArrayTsx(big10Schools)}
// ];

// ═══ NCAA D1 SCHOOLS ═══
// const ncaaD1Schools = [
${schoolArrayTsx(ncaaD1Schools)}
// ];

// ═══ AVERAGES ═══
const conferenceAvg = { adoption: ${big10Avg.adoption}, logo: ${big10Avg.logo}, mention: ${big10Avg.mention}, collab: ${big10Avg.collab} };
const ncaaD1Avg = { adoption: ${ncaaD1Avg.adoption}, logo: ${ncaaD1Avg.logo}, mention: ${ncaaD1Avg.mention}, collab: ${ncaaD1Avg.collab} };
`;

writeFileSync('/tmp/ohio_all_tabs_data.txt', output);
console.log('\nWritten: /tmp/ohio_all_tabs_data.txt');
console.log('✓ All tab data generated');
