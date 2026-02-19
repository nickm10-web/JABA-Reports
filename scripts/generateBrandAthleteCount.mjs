import { readFileSync, writeFileSync } from 'fs';

const d = JSON.parse(readFileSync('./public/data/playfly-content-processed.json', 'utf8'));

// Gather all sponsored posts across all sources
const allPosts = [];

// From the 'all' top-level
if (d.all) {
  if (d.all.topSponsoredWithIp) allPosts.push(...d.all.topSponsoredWithIp);
  if (d.all.topSponsoredWithoutIp) allPosts.push(...d.all.topSponsoredWithoutIp);
  if (d.all.topWithIp) allPosts.push(...d.all.topWithIp.filter(p => p.isSponsored));
  if (d.all.topWithoutIp) allPosts.push(...d.all.topWithoutIp.filter(p => p.isSponsored));
}

// From bySchool data
if (d.bySchool) {
  for (const schoolData of Object.values(d.bySchool)) {
    if (schoolData.topSponsoredWithIp) allPosts.push(...schoolData.topSponsoredWithIp);
    if (schoolData.topSponsoredWithoutIp) allPosts.push(...schoolData.topSponsoredWithoutIp);
    if (schoolData.topWithIp) allPosts.push(...schoolData.topWithIp.filter(p => p.isSponsored));
    if (schoolData.topWithoutIp) allPosts.push(...schoolData.topWithoutIp.filter(p => p.isSponsored));
  }
}

console.log(`Total sponsored posts gathered: ${allPosts.length}`);

// Deduplicate by post _id
const seen = new Set();
const uniquePosts = allPosts.filter(p => {
  if (!p._id || seen.has(p._id)) return false;
  seen.add(p._id);
  return true;
});
console.log(`Unique sponsored posts: ${uniquePosts.length}`);

// Count unique athletes per brand
const brandAthletes = new Map();
for (const post of uniquePosts) {
  const brand = post.sponsorPartner;
  const athlete = post.athlete && post.athlete.name;
  if (!brand || !athlete) continue;
  if (!brandAthletes.has(brand)) brandAthletes.set(brand, new Set());
  brandAthletes.get(brand).add(athlete);
}

// Build the lookup object
const lookup = {};
for (const [brand, athletes] of brandAthletes.entries()) {
  lookup[brand] = athletes.size;
}

console.log(`Brands with athlete data: ${Object.keys(lookup).length}`);
console.log('Top 10:', Object.entries(lookup).sort((a, b) => b[1] - a[1]).slice(0, 10));

writeFileSync('./public/data/brand-athlete-counts.json', JSON.stringify(lookup, null, 2));
console.log('Written to public/data/brand-athlete-counts.json');
