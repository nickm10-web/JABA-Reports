import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));

const avg = (arr, field) => arr.length ? arr.reduce((s, p) => s + (p.metrics?.[field] || 0), 0) / arr.length : 0;

const targets = [
  ['Michigan', 'Michigan'],
  ['University of California, Los Angeles', 'UCLA'],
  ['University of Southern California (USC)', 'USC'],
  ['University of Wisconsin', 'Wisconsin'],
  ['University Of Georgia', 'Georgia'],
];

for (const [dataName, label] of targets) {
  const posts = data.filter(p => p?.athlete?.school?.name === dataName);
  const logoPosts = posts.filter(p => p.hasOrganizationLogo);
  const mentionPosts = posts.filter(p => p.hasOrganizationInCaption);
  const collabPosts = posts.filter(p => p.isOrganizationCollaboration);
  const withAnyIP = posts.filter(p => p.hasOrganizationLogo || p.hasOrganizationInCaption || p.isOrganizationCollaboration);

  const adoption = (withAnyIP.length / posts.length * 100).toFixed(1);
  const logoEng = (avg(logoPosts, 'engagementRate') * 100).toFixed(2);
  const mentionEng = (avg(mentionPosts, 'engagementRate') * 100).toFixed(2);
  const collabEng = collabPosts.length > 0 ? (avg(collabPosts, 'engagementRate') * 100).toFixed(2) : '0';

  console.log(`${label}:`);
  console.log(`  adoption: ${adoption}%, logoEng: ${logoEng}%, mentionEng: ${mentionEng}%, collabEng: ${collabEng}%`);
  console.log(`  logo: ${logoPosts.length}, mention: ${mentionPosts.length}, collab: ${collabPosts.length}`);
}
