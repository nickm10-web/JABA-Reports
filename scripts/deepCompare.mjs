import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const newData = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));
const oldData = JSON.parse(fs.readFileSync(path.join(dataDir, 'last_ip_data_contents.json'), 'utf8'));

const targets = [
  ['Michigan', 'Michigan'],
  ['University of California, Los Angeles', 'UCLA'],
  ['University of Southern California (USC)', 'USC'],
  ['University of Wisconsin', 'Wisconsin'],
  ['University Of Georgia', 'Georgia'],
];

for (const [dataName, label] of targets) {
  const newPosts = newData.filter(p => p?.athlete?.school?.name === dataName);
  const oldPosts = oldData.filter(p => p?.athlete?.school?.name === dataName);
  const fields = ['hasOrganizationLogo', 'hasOrganizationInCaption', 'isOrganizationCollaboration'];
  console.log(`\n${label} (${newPosts.length} posts):`);
  for (const f of fields) {
    const oldCount = oldPosts.filter(p => p[f] === true).length;
    const newCount = newPosts.filter(p => p[f] === true).length;
    const flag = oldCount !== newCount ? ' *** CHANGED' : '';
    console.log(`  ${f}: ${oldCount} -> ${newCount}${flag}`);
  }
}
