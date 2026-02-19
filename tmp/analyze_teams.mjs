import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('./public/data/roster_teams.json', 'utf8'));
const big10 = data.filter(d => d.conferenceName === 'Big 10');
const big10Schools = [...new Set(big10.map(d => d.schoolName))];
console.log('Big 10 schools:', big10Schools.length, big10Schools.join(', '));

const schoolFollowers = {};
data.forEach(d => {
  const s = d.schoolName;
  if (!schoolFollowers[s]) schoolFollowers[s] = { followers: 0, posts: 0, likes: 0, teams: 0, conf: d.conferenceName };
  schoolFollowers[s].followers += d.metrics?.thirtyDays?.followers || 0;
  schoolFollowers[s].posts += d.metrics?.thirtyDays?.contentCount || 0;
  schoolFollowers[s].likes += d.metrics?.thirtyDays?.likes || 0;
  schoolFollowers[s].teams += 1;
});

const sorted = Object.entries(schoolFollowers).sort((a,b) => b[1].followers - a[1].followers);
console.log('\nTop 20 schools by team page followers:');
sorted.slice(0,20).forEach(([name, d], i) => {
  console.log(`${i+1}. ${name} (${d.conf}) - ${d.followers.toLocaleString()} followers, ${d.teams} teams, ${d.posts} posts`);
});

const osu = Object.entries(schoolFollowers).find(([k]) => k.includes('Ohio State'));
console.log('\nOhio State:', JSON.stringify(osu));
console.log('\nTotal schools:', Object.keys(schoolFollowers).length);

// team_contents analysis
const contents = JSON.parse(readFileSync('./public/data/team_contents (1).json', 'utf8'));
console.log('\nTeam contents: ' + contents.length + ' posts');
const contentSchools = [...new Set(contents.map(c => c.team?.schoolName || c.team?.organizationName || 'unknown'))];
console.log('Content schools:', contentSchools.length);
console.log('Sample team keys:', Object.keys(contents[0].team || {}).join(', '));
