import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'public', 'data');

const data = JSON.parse(fs.readFileSync(path.join(dataDir, 'ncaa_roster_updated_feb_17.json'), 'utf8'));
console.log('Total posts:', data.length);

// Follower totals per school (from hardcoded benchmark data — metrics.followers is not in post data)
const schoolFollowers = {
  'Ohio State': 5546349, 'Michigan': 2381406, 'Penn State University': 4114531,
  'University of Nebraska': 3126161, 'University of California, Los Angeles': 5487049,
  'University of Southern California (USC)': 4376029, 'Oregon': 1904523,
  'Iowa': 1004448, 'University of Maryland': 863472, 'Indiana': 1198872,
  'Minnesota': 882398, 'Michigan State': 827265, 'Rutgers': 702547,
  'Purdue University': 1299880, 'University of Wisconsin': 1812655,
  'Washington': 1005485, 'Illinois': 956415,
  // NCAA D1 schools
  'Louisiana State University': 5170563, 'Texas': 3552007, 'Alabama': 3966222,
  'Auburn University': 2323541, 'Arkansas': 2827038, 'University Of Georgia': 2864099,
  'University of Kentucky': 1671393, 'Baylor University': 2110678,
  'Texas A&M': 1878601, 'Virginia Tech': 1872167, 'Notre Dame': 1578114,
  'Miami': 1703801, 'Virginia': 2044598, 'Missouri': 1271953,
  'Arizona State University': 2269788, 'Brigham Young University(BYU)': 2693744,
  'Arizona': 3260269, 'Cincinnati': 1043067, 'UCF': 1202431,
  'Houston': 1237637, 'Old Dominion University': 406916,
  'University of New Mexico': 304204, 'Washington State University': 186487,
  'University of Texas at San Antonio (UTSA)': 835260, 'Wichita State University': 347584,
  'Colorado': 1506666, 'Iowa State': 1238932, 'Kansas': 1266884,
  'TCU': 732360, 'Oklahoma': 1703577, 'SMU': 994666,
  'West Virginia': 956180, 'Clemson': 1726437, 'Duke': 1435498,
  'Florida State': 1333391, 'NC State': 1238519, 'UNC': 1434088,
  'Georgia Tech': 990980, 'Boston College': 590503, 'Pittsburgh': 740916,
  'Tennessee': 1848323, 'Florida': 3163738, 'Mississippi': 986747,
  'Vanderbilt': 962963, 'Oklahoma State': 1059619, 'Kansas State': 634620,
  'Utah': 1383229, 'Boise State University': 724157, 'San Diego State University': 907225,
  'Texas Tech University': 957605, 'Ole Miss': 2032007, 'Alabama': 3966222,
  'San Diego': 439463, 'Creighton': 438009, 'DePaul': 121473,
  'Providence': 366758, 'George Mason University': 403604, 'Robert Morris University': 465010,
  'Rice University': 0, 'New Mexico State University': 0,
};

// Group posts by school+sport
const schoolSportMap = {}; // `${school}|${sport}` -> aggregated metrics
const schoolSports = {}; // school -> Set of sports (to distribute followers evenly)

for (const p of data) {
  const school = p?.athlete?.school?.name;
  const sport = p?.athlete?.sport;
  const conference = p?.athlete?.conference?.name;
  if (!school || !sport) continue;

  const likes = p?.metrics?.likes || 0;
  const comments = p?.metrics?.comments || 0;
  const engRate = p?.metrics?.engagementRate || 0;

  const key = `${school}|${sport}`;
  if (!schoolSportMap[key]) {
    schoolSportMap[key] = { school, sport, conference: conference || '', posts: 0, likes: 0, comments: 0, engRateSum: 0 };
    if (!schoolSports[school]) schoolSports[school] = new Set();
    schoolSports[school].add(sport);
  }
  schoolSportMap[key].posts++;
  schoolSportMap[key].likes += likes;
  schoolSportMap[key].comments += comments;
  schoolSportMap[key].engRateSum += engRate;
}

// Build output rows — distribute school followers evenly across sports
const rows = [];
for (const [key, d] of Object.entries(schoolSportMap)) {
  const totalSchoolFollowers = schoolFollowers[d.school] || 0;
  const numSports = schoolSports[d.school]?.size || 1;
  const followers = Math.round(totalSchoolFollowers / numSports);
  const engRate = d.posts > 0 ? d.engRateSum / d.posts : 0;
  rows.push({
    schoolName: d.school,
    conferenceName: d.conference,
    sport: d.sport,
    metrics: {
      thirtyDays: {
        followers,
        contentCount: d.posts,
        likes: d.likes,
        comments: d.comments,
        engagementRate: Math.round(engRate * 10000) / 10000,
      },
    },
  });
}

const outPath = path.join(dataDir, 'ip-roster-teams.json');
fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));
console.log('Written', rows.length, 'rows to', outPath);

// Sanity check
const ohioRows = rows.filter(r => r.schoolName === 'Ohio State');
const ohioFollowers = ohioRows.reduce((s, r) => s + (r.metrics.thirtyDays.followers || 0), 0);
console.log('Ohio State sports:', ohioRows.length, '| total followers:', ohioFollowers.toLocaleString());

const big10Schools = [...new Set(rows.filter(r => r.conferenceName === 'Big 10').map(r => r.schoolName))].sort();
console.log('Big 10 schools:', big10Schools.length, '-', big10Schools.join(', '));
