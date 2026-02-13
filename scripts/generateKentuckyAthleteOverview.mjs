import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');
const outputPath = path.join(dataDir, 'kentucky-athlete-overview.json');

// Skip generation if data dir or source files don't exist (e.g. on Vercel)
if (!fs.existsSync(dataDir)) {
  console.log('Data directory not found, skipping generation.');
  process.exit(0);
}

// Prefer newer data files, fall back to legacy
const contentsFileCandidates = [
  'ncaa_roster_contents_feb_12.json',
  ...fs.readdirSync(dataDir).filter((name) => /^NCAA_contents.*\.json$/i.test(name))
    .map((name) => ({ name, mtimeMs: fs.statSync(path.join(dataDir, name)).mtimeMs }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
    .map((f) => f.name),
];

const rosterFileCandidates = ['ncaa_roster_feb_12.json', 'ncaa_roster.json'];

const sourceFile = contentsFileCandidates.find((f) => fs.existsSync(path.join(dataDir, f)));
const rosterFile = rosterFileCandidates.find((f) => fs.existsSync(path.join(dataDir, f)));

if (!sourceFile) {
  console.log('No contents file found, skipping generation.');
  process.exit(0);
}

if (!rosterFile) {
  console.log('No roster file found, skipping generation.');
  process.exit(0);
}

console.log(`Using contents: ${sourceFile}, roster: ${rosterFile}`);
const rows = JSON.parse(fs.readFileSync(path.join(dataDir, sourceFile), 'utf8'));
const rosterRows = JSON.parse(fs.readFileSync(path.join(dataDir, rosterFile), 'utf8'));

const targetSchoolNames = new Set(['Kentucky']);
const kyPosts = rows.filter((row) => targetSchoolNames.has(row?.athlete?.school?.name));

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const rosterFollowerMap = new Map();
for (const athlete of rosterRows) {
  if (!targetSchoolNames.has(athlete?.schoolName)) continue;
  const key = `${normalize(`${athlete?.firstName || ''}${athlete?.lastName || ''}`)}|${normalize(athlete?.sport)}`;
  const followers = Number(athlete?.metrics?.thirtyDays?.followers || 0);
  const existing = rosterFollowerMap.get(key) || 0;
  if (followers > existing) {
    rosterFollowerMap.set(key, followers);
  }
}

const average = (arr, getter) => {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, row) => sum + Number(getter(row) || 0), 0) / arr.length;
};

const sum = (arr, getter) => arr.reduce((total, row) => total + Number(getter(row) || 0), 0);

const signal = (flag) => {
  const withSignal = kyPosts.filter((post) => Boolean(post[flag]));
  const withoutSignal = kyPosts.filter((post) => !post[flag]);

  const getFollowers = (post) => {
    const key = `${normalize(post?.athlete?.name)}|${normalize(post?.athlete?.sport)}`;
    return Number(rosterFollowerMap.get(key) || 0);
  };

  const withInteractions = sum(withSignal, (post) => Number(post?.metrics?.likes || 0) + Number(post?.metrics?.comments || 0));
  const withoutInteractions = sum(withoutSignal, (post) => Number(post?.metrics?.likes || 0) + Number(post?.metrics?.comments || 0));
  const withFollowers = sum(withSignal, (post) => getFollowers(post));
  const withoutFollowers = sum(withoutSignal, (post) => getFollowers(post));

  const withEngagementRate = withFollowers > 0 ? withInteractions / withFollowers : 0;
  const withoutEngagementRate = withoutFollowers > 0 ? withoutInteractions / withoutFollowers : 0;

  return {
    posts: withSignal.length,
    likes: average(withSignal, (post) => post?.metrics?.likes),
    comments: average(withSignal, (post) => post?.metrics?.comments),
    engagementRate: withEngagementRate,
    delta:
      withoutEngagementRate > 0
        ? ((withEngagementRate - withoutEngagementRate) / withoutEngagementRate) * 100
        : 0,
    baselineEngRate: withoutEngagementRate,
    baselinePosts: withoutSignal.length,
    baselineLikes: average(withoutSignal, (post) => post?.metrics?.likes),
    baselineComments: average(withoutSignal, (post) => post?.metrics?.comments),
  };
};

const collaboration = signal('isOrganizationCollaboration');
const logo = signal('hasOrganizationLogo');
const mention = signal('hasOrganizationInCaption');

const totalLikes = sum(kyPosts, (post) => post?.metrics?.likes);
const totalComments = sum(kyPosts, (post) => post?.metrics?.comments);
const matchedSchools = [...new Set(kyPosts.map((post) => post?.athlete?.school?.name).filter(Boolean))];

const postsWithIP = kyPosts.filter(
  (post) => post.hasOrganizationLogo || post.hasOrganizationInCaption || post.isOrganizationCollaboration,
).length;

const weightedLiftDenominator = collaboration.posts + logo.posts + mention.posts;
const avgLift =
  weightedLiftDenominator > 0
    ? (collaboration.delta * collaboration.posts + logo.delta * logo.posts + mention.delta * mention.posts) /
      weightedLiftDenominator
    : 0;

const output = {
  sourceFile,
  generatedAt: new Date().toISOString(),
  school: 'Kentucky',
  matchedSchools,
  totalPosts: kyPosts.length,
  totalLikes,
  totalComments,
  postsWithIP,
  ipAdoptionRate: kyPosts.length > 0 ? Number(((postsWithIP / kyPosts.length) * 100).toFixed(1)) : 0,
  avgLift: Number(avgLift.toFixed(1)),
  totalEmv: Number(((totalLikes * 0.5) + (totalComments * 1.5)).toFixed(2)),
  collaboration,
  logo,
  mention,
  counters: {
    isSponsored: kyPosts.filter((post) => Boolean(post.isSponsored)).length,
    sponsorPartner: kyPosts.filter(
      (post) => typeof post.sponsorPartner === 'string' && post.sponsorPartner.trim().length > 0,
    ).length,
    isOrganizationCollaboration: kyPosts.filter((post) => Boolean(post.isOrganizationCollaboration)).length,
    hasOrganizationInCaption: kyPosts.filter((post) => Boolean(post.hasOrganizationInCaption)).length,
    hasOrganizationLogo: kyPosts.filter((post) => Boolean(post.hasOrganizationLogo)).length,
    isCollaboration: kyPosts.filter((post) => Boolean(post.isCollaboration)).length,
  },
  engagementRateMethod: 'Estimated rate = total likes+comments divided by summed mapped athlete followers (name+sport match against ncaa_roster).',
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${outputPath} from ${sourceFile}`);
