import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const allPosts = JSON.parse(fs.readFileSync(path.join(dataDir, 'last_ip_data_contents.json'), 'utf8'));
const posts = allPosts.filter(p => p?.athlete?.school?.name === 'Ohio State');
console.log('Ohio State posts:', posts.length);

const computeSignal = (sportPosts, flag) => {
  const withSignal = sportPosts.filter(p => Boolean(p[flag]));
  const withoutSignal = sportPosts.filter(p => !p[flag]);
  const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;
  return {
    with: {
      posts: withSignal.length,
      avgLikes: Math.round(avg(withSignal, 'likes')),
      avgComments: Math.round(avg(withSignal, 'comments')),
      engagementRate: Math.round(avg(withSignal, 'engagementRate') * 10000) / 10000,
    },
    without: {
      posts: withoutSignal.length,
      avgLikes: Math.round(avg(withoutSignal, 'likes')),
      avgComments: Math.round(avg(withoutSignal, 'comments')),
      engagementRate: Math.round(avg(withoutSignal, 'engagementRate') * 10000) / 10000,
    },
  };
};

// Build by-sport map
const sportMap = {};
for (const p of posts) {
  const sport = p.athlete?.sport || 'Unknown';
  if (!sportMap[sport]) sportMap[sport] = [];
  sportMap[sport].push(p);
}

const result = {};

// ALL_SPORTS first
result['ALL_SPORTS'] = {
  totalPosts: posts.length,
  mention: computeSignal(posts, 'hasOrganizationInCaption'),
  logo: computeSignal(posts, 'hasOrganizationLogo'),
  collab: computeSignal(posts, 'isOrganizationCollaboration'),
};

// Per sport (only sports with >= 10 posts)
for (const [sport, sportPosts] of Object.entries(sportMap).sort((a, b) => b[1].length - a[1].length)) {
  if (sportPosts.length < 10) continue;
  result[sport] = {
    totalPosts: sportPosts.length,
    mention: computeSignal(sportPosts, 'hasOrganizationInCaption'),
    logo: computeSignal(sportPosts, 'hasOrganizationLogo'),
    collab: computeSignal(sportPosts, 'isOrganizationCollaboration'),
  };
}

const outPath = path.join(dataDir, 'ohio-state-by-sport.json');
fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
console.log('Written to', outPath);

// Summary
console.log('\nALL_SPORTS collab:', JSON.stringify(result.ALL_SPORTS.collab));
console.log('Sports generated:', Object.keys(result).join(', '));
