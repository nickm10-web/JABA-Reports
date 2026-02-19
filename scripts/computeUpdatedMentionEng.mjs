import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));

const changedSchools = [
  'University of California, Los Angeles',
  'University Of Georgia',
  'University of Wisconsin',
  'University of Southern California (USC)',
  'Michigan',
];

const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;

for (const school of changedSchools) {
  const posts = data.filter(p => p?.athlete?.school?.name === school);
  const mentionPosts = posts.filter(p => p.hasOrganizationInCaption === true);
  const mentionEng = avg(mentionPosts, 'engagementRate') * 100;
  const totalEng = avg(posts, 'engagementRate') * 100;
  console.log(`${school}:`);
  console.log(`  total posts: ${posts.length}, mention posts: ${mentionPosts.length} (${(mentionPosts.length/posts.length*100).toFixed(1)}%)`);
  console.log(`  mentionEng: ${mentionEng.toFixed(2)}%  (overall eng: ${totalEng.toFixed(2)}%)`);
}
