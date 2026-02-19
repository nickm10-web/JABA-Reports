import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const newData = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));
const oldData = JSON.parse(fs.readFileSync(path.join(dataDir, 'last_ip_data_contents.json'), 'utf8'));

// Build old lookup by school
const oldBySchool = {};
for (const p of oldData) {
  const s = p?.athlete?.school?.name;
  if (s) {
    if (!oldBySchool[s]) oldBySchool[s] = [];
    oldBySchool[s].push(p);
  }
}

const newBySchool = {};
for (const p of newData) {
  const s = p?.athlete?.school?.name;
  if (s) {
    if (!newBySchool[s]) newBySchool[s] = [];
    newBySchool[s].push(p);
  }
}

const results = [];
for (const school of Object.keys(newBySchool)) {
  const newPosts = newBySchool[school];
  const oldPosts = oldBySchool[school] || [];
  const newMention = newPosts.filter(p => p.hasOrganizationInCaption === true).length;
  const oldMention = oldPosts.filter(p => p.hasOrganizationInCaption === true).length;
  if (newMention !== oldMention) {
    results.push({
      school,
      posts: newPosts.length,
      oldMention,
      newMention,
      oldPct: (oldMention / newPosts.length * 100).toFixed(1),
      newPct: (newMention / newPosts.length * 100).toFixed(1),
    });
  }
}

results.sort((a, b) => b.posts - a.posts);
for (const r of results) {
  console.log(`${r.school} | posts: ${r.posts} | mention: ${r.oldMention} (${r.oldPct}%) -> ${r.newMention} (${r.newPct}%)`);
}
console.log('Total changed schools:', results.length);
