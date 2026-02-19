import fs from 'fs';

const dir = "./public/data/";
const files = fs.readdirSync(dir).filter(f => f.endsWith("-partnerships.json") && f.indexOf("(") === -1);
const allBrands = new Map();

files.forEach(f => {
  const d = JSON.parse(fs.readFileSync(dir + f, "utf8"));
  if (!d.sponsorPartners) return;
  d.sponsorPartners.forEach(p => {
    const existing = allBrands.get(p.sponsorPartner) || { posts: 0, schools: new Set(), totalLikes: 0 };
    existing.posts += p.totalContents;
    existing.schools.add(d.school ? d.school.name : f);
    existing.totalLikes += p.avgLikes * p.totalContents;
    allBrands.set(p.sponsorPartner, existing);
  });
});

// Normalize name for matching (lowercase, remove @)
function norm(name) {
  return name.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Identify "threads" shops (school threads accounts)
const threadsPattern = /thread/i;
const sorted = [...allBrands.entries()].sort((a,b) => b[1].posts - a[1].posts);

// Find all threads accounts
console.log("=== THREADS SHOP ACCOUNTS ===");
let threadsTotal = 0;
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (n.includes('thread') && !n.includes('athlete')) {
    console.log(`${name} | ${data.posts} posts | ${data.schools.size} schools | ${Math.round(data.totalLikes)} likes`);
    threadsTotal += data.posts;
  }
});
console.log(`Total threads posts: ${threadsTotal}\n`);

// Find personal accounts (no @ prefix, look like usernames)
console.log("=== NO @ PREFIX (possibly personal accounts/non-brands) ===");
let personalTotal = 0;
sorted.forEach(([name, data]) => {
  if (!name.startsWith('@') && name !== name.toUpperCase()) {
    console.log(`${name} | ${data.posts} posts | ${data.schools.size} schools | ${Math.round(data.totalLikes)} likes | Schools: ${[...data.schools].join(', ')}`);
    personalTotal += data.posts;
  }
});
console.log(`Total non-@ posts: ${personalTotal}\n`);

// Find school team/athletic accounts
console.log("=== POTENTIAL SCHOOL TEAM/ATHLETIC ACCOUNTS ===");
const teamPatterns = ['football', 'basketball', 'baseball', 'softball', 'soccer', 'volleyball', 'hockey', 'lacrosse', 'golf', 'swimming', 'diving', 'track', 'wrestling', 'gymnastics', 'tennis', 'rowing', 'equestrian', 'cheer', 'wbb', 'mbb', 'fball', 'fb'];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  // Check if it contains a school identifier + sport
  const hasSchool = ['baylor', 'byu', 'clemson', 'lsu', 'auburn', 'osu', 'ohiostate', 'pennstate', 'texasam', 'aggie', 'husker', 'nebraska', 'maryland', 'terp', 'usc', 'virginia', 'hokie', 'badger', 'buckeye', 'cougar', 'bearcat', 'pitt', 'panther', 'knight', 'ucf', 'utsa', 'odu', 'monarch', 'msu', 'spartan', 'depaul', 'creighton', 'bluejay', 'jayhawk', 'kansas', 'kentucky', 'wildcat', 'uk', 'rmu', 'sdsu', 'aztec', 'wichita', 'shocker', 'usd', 'torero', 'mason', 'patriot'].some(s => n.includes(s));
  const hasSport = teamPatterns.some(s => n.includes(s));
  if (hasSchool && hasSport && data.posts >= 1) {
    console.log(`${name} | ${data.posts} posts | Schools: ${[...data.schools].join(', ')}`);
  }
});
console.log();

// Find influxer accounts (student media/NIL platform school reps)
console.log("=== INFLUXER ACCOUNTS ===");
let influxerTotal = 0;
sorted.forEach(([name, data]) => {
  if (norm(name).includes('influxer')) {
    console.log(`${name} | ${data.posts} posts | ${data.schools.size} schools | ${Math.round(data.totalLikes)} likes`);
    influxerTotal += data.posts;
  }
});
console.log(`Total influxer posts: ${influxerTotal}\n`);

// Find NIL store accounts
console.log("=== NIL STORE ACCOUNTS ===");
sorted.forEach(([name, data]) => {
  if (norm(name).includes('nilstore') || norm(name).includes('nil.store') || name.includes('.nil.store') || name.includes('nilstore')) {
    console.log(`${name} | ${data.posts} posts | ${data.schools.size} schools`);
  }
});
console.log();

// Find case-sensitivity duplicates
console.log("=== CASE-SENSITIVITY DUPLICATES ===");
const byNormalized = new Map();
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (!byNormalized.has(n)) byNormalized.set(n, []);
  byNormalized.get(n).push({ name, ...data, schools: [...data.schools] });
});

byNormalized.forEach((entries, normalized) => {
  if (entries.length > 1) {
    const totalPosts = entries.reduce((s, e) => s + e.posts, 0);
    console.log(`\nNormalized: "${normalized}" (${totalPosts} total posts)`);
    entries.forEach(e => console.log(`  ${e.name} | ${e.posts} posts | ${e.schools.join(', ')}`));
  }
});
