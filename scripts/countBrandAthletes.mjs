import { readFileSync } from 'fs';

const d = JSON.parse(readFileSync('./public/data/playfly-content-processed.json', 'utf8'));
const posts = [...(d.all.topSponsoredWithIp || []), ...(d.all.topSponsoredWithoutIp || [])];

const brandAthletes = new Map();
for (const post of posts) {
  const brand = post.sponsorPartner;
  const athlete = post.athlete && post.athlete.name;
  if (!brand || !athlete) continue;
  if (!brandAthletes.has(brand)) brandAthletes.set(brand, new Set());
  brandAthletes.get(brand).add(athlete);
}

const sorted = [...brandAthletes.entries()]
  .map(([brand, athletes]) => ({ brand, athleteCount: athletes.size }))
  .sort((a, b) => b.athleteCount - a.athleteCount);

console.log("Top 20 brands by athlete count:");
sorted.slice(0, 20).forEach(b => console.log(`  ${b.brand}: ${b.athleteCount} athletes`));
console.log(`\nTotal brands with athlete data: ${sorted.length}`);
console.log(`Total posts analyzed: ${posts.length}`);
