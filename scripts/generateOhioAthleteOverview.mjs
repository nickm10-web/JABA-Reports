import fs from 'fs';
import path from 'path';

const dataDir = '/Users/jaba/REPORTS/public/data';
const outputPath = path.join(dataDir, 'ohio-state-athlete-overview.json');

const ncaaFiles = fs
  .readdirSync(dataDir)
  .filter((name) => /^NCAA_contents.*\.json$/i.test(name))
  .map((name) => ({
    name,
    mtimeMs: fs.statSync(path.join(dataDir, name)).mtimeMs,
  }))
  .sort((a, b) => b.mtimeMs - a.mtimeMs);

if (ncaaFiles.length === 0) {
  throw new Error('No NCAA_contents*.json file found in /public/data.');
}

const sourceFile = ncaaFiles[0].name;
const sourcePath = path.join(dataDir, sourceFile);
const rows = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rosterRows = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster.json'), 'utf8'));

const targetSchoolNames = new Set(['Ohio State', 'Ohio']);
const ohioPosts = rows.filter((row) => targetSchoolNames.has(row?.athlete?.school?.name));

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
  const withSignal = ohioPosts.filter((post) => Boolean(post[flag]));
  const withoutSignal = ohioPosts.filter((post) => !post[flag]);

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

const totalLikes = sum(ohioPosts, (post) => post?.metrics?.likes);
const totalComments = sum(ohioPosts, (post) => post?.metrics?.comments);
const matchedSchools = [...new Set(ohioPosts.map((post) => post?.athlete?.school?.name).filter(Boolean))];

const postsWithIP = ohioPosts.filter(
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
  school: 'Ohio State',
  matchedSchools,
  totalPosts: ohioPosts.length,
  totalLikes,
  totalComments,
  postsWithIP,
  ipAdoptionRate: ohioPosts.length > 0 ? Number(((postsWithIP / ohioPosts.length) * 100).toFixed(1)) : 0,
  avgLift: Number(avgLift.toFixed(1)),
  totalEmv: Number(((totalLikes * 0.5) + (totalComments * 1.5)).toFixed(2)),
  collaboration,
  logo,
  mention,
  counters: {
    isSponsored: ohioPosts.filter((post) => Boolean(post.isSponsored)).length,
    sponsorPartner: ohioPosts.filter(
      (post) => typeof post.sponsorPartner === 'string' && post.sponsorPartner.trim().length > 0,
    ).length,
    isOrganizationCollaboration: ohioPosts.filter((post) => Boolean(post.isOrganizationCollaboration)).length,
    hasOrganizationInCaption: ohioPosts.filter((post) => Boolean(post.hasOrganizationInCaption)).length,
    hasOrganizationLogo: ohioPosts.filter((post) => Boolean(post.hasOrganizationLogo)).length,
    isCollaboration: ohioPosts.filter((post) => Boolean(post.isCollaboration)).length,
  },
  engagementRateMethod: 'Estimated rate = total likes+comments divided by summed mapped athlete followers (name+sport match against ncaa_roster).',
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Generated ${outputPath} from ${sourceFile}`);
