import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));

const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;

const schoolMap = {
  'Michigan': 'Michigan',
  'University of California, Los Angeles': 'UCLA',
  'University of Southern California (USC)': 'USC',
  'University of Wisconsin': 'Wisconsin',
  'University Of Georgia': 'Georgia',
};

for (const [dataName, label] of Object.entries(schoolMap)) {
  const posts = data.filter(p => p?.athlete?.school?.name === dataName);
  const logo = posts.filter(p => p.hasOrganizationLogo).length;
  const mention = posts.filter(p => p.hasOrganizationInCaption).length;
  const collab = posts.filter(p => p.isOrganizationCollaboration).length;
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration).length;
  const mentionPosts = posts.filter(p => p.hasOrganizationInCaption);
  const mentionEng = avg(mentionPosts, 'engagementRate') * 100;
  const adoption = (withAnyIP / posts.length * 100).toFixed(1);
  console.log(`${label}: adoption ${adoption}%, mentionEng ${mentionEng.toFixed(2)}%`);
  console.log(`  posts: ${posts.length}, logo: ${logo} (${(logo/posts.length*100).toFixed(1)}%), mention: ${mention} (${(mention/posts.length*100).toFixed(1)}%), collab: ${collab}`);
}
