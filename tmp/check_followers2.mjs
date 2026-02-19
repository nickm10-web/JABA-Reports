import { readFileSync } from 'fs';
const d = JSON.parse(readFileSync('./public/data/Big10Contents.json', 'utf8'));

// Count how many posts have non-zero metrics.followers
let nonZero = 0;
let total = d.length;
const athleteFollowers = {};

for (const p of d) {
  const f = p?.metrics?.followers || 0;
  if (f > 0) {
    nonZero++;
    const name = p?.athlete?.name || 'unknown';
    const school = p?.athlete?.school?.name || 'unknown';
    const key = `${name}|${school}`;
    if (!athleteFollowers[key] || f > athleteFollowers[key].followers) {
      athleteFollowers[key] = { name, school, followers: f };
    }
  }
}

console.log(`Posts with non-zero metrics.followers: ${nonZero} / ${total}`);

// Aggregate by school
const schoolFollowers = {};
for (const a of Object.values(athleteFollowers)) {
  if (!schoolFollowers[a.school]) schoolFollowers[a.school] = { total: 0, athletes: 0 };
  schoolFollowers[a.school].total += a.followers;
  schoolFollowers[a.school].athletes++;
}
for (const [school, data] of Object.entries(schoolFollowers)) {
  console.log(`${school}: ${data.total.toLocaleString()} followers (${data.athletes} athletes)`);
}
