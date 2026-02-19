import { readFileSync, writeFileSync, readdirSync } from 'fs';

// Load all partnership data
const dir = './public/data/';
const files = readdirSync(dir).filter(f => f.endsWith('-partnerships.json') && !f.includes('('));
const allPartners = new Map();

files.forEach(f => {
  const d = JSON.parse(readFileSync(dir + f, 'utf8'));
  if (!d.sponsorPartners) return;
  const schoolName = d.school?.name || f;
  d.sponsorPartners.forEach(p => {
    const key = p.sponsorPartner.toLowerCase().replace(/^@/, '');
    const existing = allPartners.get(key) || { names: new Set(), posts: 0, schools: new Set() };
    existing.names.add(p.sponsorPartner);
    existing.posts += p.totalContents;
    existing.schools.add(schoolName);
    allPartners.set(key, existing);
  });
});

console.log(`Total unique brand keys: ${allPartners.size}`);

// ============================
// EXCLUSION PATTERNS
// ============================

const excluded = new Set();

const normalize = (s) => s.toLowerCase().replace(/^@/, '').replace(/[\s._-]+/g, '');

// NIL Collectives / Boosters
const nilCollectivePatterns = [
  'ontovictory', 'houseofvictory', 'houseofvictorynil', 'cavfutures', 'iptay',
  '12thmanfoundation', '12thmanfound', 'charitablegiftamerica', 'pursuityourself',
  'nilcollective', 'nilfund', 'nilstore', 'nil_store', 'nilthread',
  'nilstore___', 'thenilstore', 'baylornil', 'msunil', 'sdsunil',
  'nilstoreofficial', 'bfrfund', 'stompinggroundsnil', 'tigerlandnil',
  'prideofodunil', 'wareaglenil', 'spartannil', 'tigernil', 'knightnil',
  'cougnil', 'bearnil', 'aggienil', 'huskernil', 'nittanynil',
  'gobigrednil', 'knightsnil', 'monarchsnil', 'bearcatsnil',
  'odumonarchsnil', 'ucfknightsnil', 'roadrunnernil',
  'growtheopportunity', 'onlygators', 'gatorscollective',
  'yoakerraise', 'yoakeraise', 'aggiefaithful',
];

// Influxer
const influxerPatterns = [
  'influxer', 'influxerbyu', 'influxeruva', 'influxermerch', 'influxerusd',
  'influxerucf', 'influxerodu', 'influxerpsu', 'influxerutsa', 'influxerlsu',
  'influxerau', 'influxermsu', 'influxerbu', 'influxerumd', 'influxerusc',
];

// Media / News / Recruiting
const mediaPatterns = [
  'on3recruits', 'on3', 'on3sports', 'on3nil', 'rivalsdotcom', 'rivals',
  'perfectgameusa', 'perfectgame', 'sportsillustrated', 'cbssports', 'foxnation',
  'foxsports', 'accnetwork', 'bigtennetwork', 'secnetwork', 'espn', 'espnw',
  'ncaa', 'nfmpics', 'centerstmedia', 'cornermediaco', 'ballislife',
  'nextgenstats', 'flowrestling', 'flotrack', 'flosoftball', 'flogymnastics',
  'swimswam', 'heismantrophy', 'daveyobrien', 'johnnyu', 'maxwellfootball',
  'theassociatedpress', 'usatoday', 'bleacherreport', 'barstoolsports',
  'barstool', 'overtime', 'overtimewbb', 'overtimembb', 'houseofsparks',
  'victoryplustv', 'thefamilie', 'athletenarrative',
  'complexsports', 'worldstar', 'worldstarhiphop', 'tmz', 'tmzsports',
  'siswimsuit', 'theathletesmedia',
];

// Podcasts
const podcastPatterns = [
  'driventhepodcast', 'chargeonpodcast', 'yourchoicepod', 'plainsman_podcast',
  'btg45podcast', 'gameballpodcast', 'themodestsportsshow', 'allthingsgympod',
  'whatsup_pod', 'turnonthelamppodcast', 'bfmpod', 'podcast',
];

// Pro Sports Teams / Leagues
const proTeamPatterns = [
  'hockeycanada', 'phillies', 'caahockey', 'nhlflames', 'dallasstars',
  'nhl', 'nba', 'mlb', 'nfl', 'mls', 'wnba', 'pga', 'lpga', 'wwe',
  'ufc', 'aew', 'pll', 'nwsl',
];

// Religious Organizations
const religiousPatterns = [
  'realgodsstories', 'jesuswonapparel', 'busportsministry', 'tausiliakanafoundation',
  'godseconomy', 'gods.economy', 'faithbasedathlete', 'fca', 'fcaathlete',
  'athletesinfaith', 'christinculture', 'i_am_second', 'iamsecond',
];

// Campus Bookstores
const bookstorePatterns = [
  'universitybookstore', 'thebuckeyecorner', 'tamubookstore', 'barnesandnoble',
  'bncollege', 'campusbookstore', 'follett', 'textbooks',
];

// Build full exclusion set from patterns
function matchesAnyPattern(key, patterns) {
  const norm = normalize(key);
  return patterns.some(p => norm.includes(normalize(p)) || normalize(p).includes(norm));
}

// Classify each brand
for (const [key, data] of allPartners.entries()) {
  const norm = normalize(key);

  // NIL Collectives
  if (matchesAnyPattern(key, nilCollectivePatterns) || norm.includes('nil') && (norm.includes('store') || norm.includes('collective') || norm.includes('fund'))) {
    excluded.add(key);
    continue;
  }

  // Influxer
  if (matchesAnyPattern(key, influxerPatterns) || norm.startsWith('influxer')) {
    excluded.add(key);
    continue;
  }

  // Media/News/Recruiting
  if (matchesAnyPattern(key, mediaPatterns)) {
    excluded.add(key);
    continue;
  }

  // Podcasts
  if (matchesAnyPattern(key, podcastPatterns)) {
    excluded.add(key);
    continue;
  }

  // Pro Teams
  if (matchesAnyPattern(key, proTeamPatterns)) {
    excluded.add(key);
    continue;
  }

  // Religious
  if (matchesAnyPattern(key, religiousPatterns)) {
    excluded.add(key);
    continue;
  }

  // Campus Bookstores
  if (matchesAnyPattern(key, bookstorePatterns)) {
    excluded.add(key);
    continue;
  }
}

// School team accounts - match pattern: school alias + sport keyword
const schoolAliases = {
  'auburn': ['auburn', 'tigers', 'wareagle', 'au'],
  'baylor': ['baylor', 'bears', 'bu', 'sic'],
  'penn state': ['pennstate', 'psu', 'nittany', 'nittanylion'],
  'michigan state': ['msu', 'spartan', 'spartans', 'michiganstate'],
  'nebraska': ['husker', 'huskers', 'nebraska', 'gobigred'],
  'lsu': ['lsu', 'tigers', 'geaux'],
  'texas a&m': ['tamu', 'aggie', 'aggies', 'texasam', 'tam'],
  'usc': ['usc', 'trojans', 'trojan'],
  'ucf': ['ucf', 'knights', 'goknights'],
  'maryland': ['terps', 'terp', 'umd', 'maryland'],
  'virginia': ['uva', 'cavs', 'cavaliers', 'wahoos', 'virginia'],
  'old dominion': ['odu', 'monarch', 'monarchs', 'olddominion'],
  'utsa': ['utsa', 'roadrunners', 'meepmeep'],
  'byu': ['byu', 'cougars', 'brighamyoung'],
  'clemson': ['clemson', 'tigers', 'cu'],
  'ohio state': ['osu', 'ohiostate', 'buckeye', 'buckeyes'],
  'wisconsin': ['badger', 'badgers', 'wisconsin', 'uw'],
  'kentucky': ['kentucky', 'wildcats', 'uk'],
  'cincinnati': ['cincy', 'bearcats', 'cincinnati', 'uc'],
  'pittsburgh': ['pitt', 'panthers', 'pittsburgh'],
  'virginia tech': ['vt', 'hokies', 'hokie', 'virginiatech'],
  'washington state': ['wsu', 'wazzu', 'cougs', 'washingtonstate'],
  'depaul': ['depaul', 'bluedemons'],
  'creighton': ['creighton', 'bluejays', 'jays'],
  'kansas': ['ku', 'jayhawks', 'kansas'],
  'san diego state': ['sdsu', 'aztecs', 'sandiegostate'],
  'san diego': ['usd', 'toreros', 'sandiego'],
  'robert morris': ['rmu', 'robertmorris', 'colonials'],
};

const sportKeywords = [
  'football', 'fb', 'fball', 'basketball', 'mbb', 'wbb', 'hoops',
  'baseball', 'softball', 'soccer', 'volleyball', 'vb', 'vball',
  'track', 'xc', 'crosscountry', 'wrestling', 'golf', 'tennis',
  'lacrosse', 'lax', 'hockey', 'swim', 'swimming', 'gymnastics', 'gym',
  'fieldhockey', 'rowing', 'crew', 'athletics', 'equestrian', 'diving',
  'rifle', 'fencing', 'bowling', 'acrobatics', 'cheer', 'dance',
  'womens', 'mens', 'men', 'women', 'w_', 'm_',
];

const teamContextWords = [
  'athletics', 'sports', 'official', 'recruiting', 'recruits',
  'studentathlete', 'gameday', 'alumni', 'booster',
];

for (const [key, data] of allPartners.entries()) {
  if (excluded.has(key)) continue;
  const norm = normalize(key);

  // Check if it matches school + sport pattern
  for (const [school, aliases] of Object.entries(schoolAliases)) {
    const hasSchool = aliases.some(a => norm.includes(a));
    if (!hasSchool) continue;

    const hasSport = sportKeywords.some(s => norm.includes(s));
    const hasContext = teamContextWords.some(t => norm.includes(t));

    if (hasSport || hasContext) {
      excluded.add(key);
      break;
    }

    // Exact match to a school alias (e.g., @huskers, @lsu)
    if (aliases.some(a => a === norm)) {
      excluded.add(key);
      break;
    }
  }
}

// Individual people - heuristic: 1-2 posts, only 1 school, name looks personal
// We'll use the content data to identify personal accounts more precisely
const contentData = JSON.parse(readFileSync('./public/data/playfly-content-processed.json', 'utf8'));
const allPosts = [];
if (contentData.all) {
  ['topSponsoredWithIp', 'topSponsoredWithoutIp', 'topWithIp', 'topWithoutIp'].forEach(k => {
    if (contentData.all[k]) allPosts.push(...contentData.all[k]);
  });
}
if (contentData.bySchool) {
  for (const schoolData of Object.values(contentData.bySchool)) {
    ['topSponsoredWithIp', 'topSponsoredWithoutIp', 'topWithIp', 'topWithoutIp'].forEach(k => {
      if (schoolData[k]) allPosts.push(...schoolData[k]);
    });
  }
}

// Find sponsor partners that are actually athlete names
const athleteNames = new Set();
const seen = new Set();
for (const post of allPosts) {
  if (!post._id || seen.has(post._id)) continue;
  seen.add(post._id);
  if (post.athlete?.name) athleteNames.add(post.athlete.name.toLowerCase());

  // If the sponsor partner matches an athlete name in the dataset
  if (post.sponsorPartner && post.athlete?.name) {
    const sponsorNorm = normalize(post.sponsorPartner);
    const athleteNorm = post.athlete.name.toLowerCase().replace(/[\s._-]+/g, '');
    // Check if the sponsor partner name is very similar to an athlete name
    if (sponsorNorm.includes(athleteNorm) || athleteNorm.includes(sponsorNorm)) {
      excluded.add(normalize(post.sponsorPartner));
    }
  }
}

// Also add known individual/personal accounts from the audit
const knownPersonalAccounts = [
  'olivmadison_', 'flaujae', 'trevinknell', 'travis_trackstar',
  'postgame.official', // content creator platform, not a brand
];
knownPersonalAccounts.forEach(a => excluded.add(normalize(a)));

// Count excluded posts
let excludedPosts = 0;
let excludedEntries = 0;
for (const [key, data] of allPartners.entries()) {
  if (excluded.has(key)) {
    excludedPosts += data.posts;
    excludedEntries++;
  }
}

console.log(`\nExcluded: ${excludedEntries} entries, ${excludedPosts} posts`);
console.log(`Remaining: ${allPartners.size - excludedEntries} entries`);

// Write exclusion list
writeFileSync('./public/data/brand-exclusions.json', JSON.stringify([...excluded].sort(), null, 2));
console.log(`Written ${excluded.size} exclusions to public/data/brand-exclusions.json`);

// ============================
// NORMALIZATION MAP
// ============================

const normalizationMap = {};

const brandFamilies = {
  'Nike': [
    'nike', 'nikerunning', 'usnikefootball', 'nikeeyb', 'nike_wrestling',
    'nikelacrosse', 'nikebasketball', 'nikeeybl', 'nikestrength', 'nikboa',
    'nikegirlseybl', 'nikeskims', 'nikesportswear', 'nikefootball', 'niketraining',
    'nikewomen', 'nikenyc', 'nikesb', 'justdoit',
  ],
  'Adidas': [
    'adidas', 'adidasusfootball', 'adidasmy', 'adidasbasketball', 'adidasrunning',
    'adidasusfootball', 'adidastennis', 'adidasgolf', 'adidasph', 'adidasoriginals',
    'adidasfootball', 'adidasfballus', 'adidaswrestling', 'adidasswim',
  ],
  'Under Armour': [
    'underarmour', 'underarmour150', 'uanextvolleyball', 'underarmor',
    'underarmourwomen', 'uafootball',
  ],
  'MyPlayer': [
    'myplayersports', 'myplayerathlete', 'myplayersoftball', 'myplayermerch',
    'myplayer',
  ],
  "McDonald's": [
    'mcdonalds', 'mcdonaldsnebraska', 'mcdonaldsinlandnw', 'mcdonaldscarolinas',
    'mcdonaldsphillyregion', 'mcdonalds_greaterohio', 'mcdonaldsofthreerivers',
    'mcdonaldsrockymtn', 'mcdonaldscentralpa',
  ],
  'Brooks Running': [
    'brooksrunning', 'brooks', 'brooksnil',
  ],
  'C4 Energy': [
    'c4energy', 'c4',
  ],
  'Gatorade': [
    'gatorade', 'gatoradepoy', 'dcgatorade', 'gatoradefuel',
  ],
  'EA Sports': [
    'easportscollege', 'easportsnhl', 'easports', 'easportsfc',
  ],
  'On Running': [
    'on', 'onrunning',
  ],
  "Dick's Sporting Goods": [
    'dickssportinggoods', 'dickshouseofsport', 'dicks',
  ],
  'Coach': [
    'coach', 'coachny',
  ],
  'SeatGeek': [
    'seatgeek',
  ],
  'Monster Energy': [
    'monsterenergy', 'monster',
  ],
  'Gordon McKernan': [
    'getgordon', 'gordonmckernan',
  ],
  'Red Bull': [
    'redbullusa', 'redbull', 'redbulletin', 'redbullracing',
  ],
  'Dove': [
    'dove', 'dovemencare',
  ],
  'Puma': [
    'puma', 'pumausa', 'pumahoops', 'pumagolf',
  ],
  'New Balance': [
    'newbalance', 'thetrackatnewbalance',
  ],
  'Celsius': [
    'celsiusofficial', 'celsiusbrandpartner',
  ],
  'Mizuno': [
    'mizunofastpitchusa', 'mizunoswimusa', 'mizunolongbeach', 'mizuno',
  ],
  'New Era': [
    'neweracap', 'newera',
  ],
  'Fabletics': [
    'fabletics', 'fableticsmen',
  ],
  'Arena': [
    'arenainternational', 'arena_mexico', 'arenausa', 'arenaracing', 'arenagraffiti',
  ],
  'Turtlebox': [
    'turtleboxaudio', 'turtlebox',
  ],
  'Popeyes': [
    'popeyes', 'popeyespartner',
  ],
  'Powerade': [
    'powerade_us', 'powerade',
  ],
  'Callaway': [
    'callawaygolf', 'callawaynexteu', 'callawaygolfeu', 'callaway',
  ],
  "Hardee's": [
    'hardees', 'hardeespartner',
  ],
  'Homage': [
    'homage', 'homagepartner',
  ],
  'Clever Made': [
    'clever_made', 'clevermade',
  ],
  'Sonic': [
    'sonicdrivein', 'sonic', 'sonicpartner',
  ],
  'Prime': [
    'drinkprime', 'drinkprimegirls',
  ],
  'Exact Sciences': [
    'exactsciences', 'exactsciencesathletes',
  ],
  'VKTRY': [
    'teamvktry', 'vktry',
  ],
  "Dillard's": [
    'dillards', 'dillardscampuscollective',
  ],
  'Garmin': [
    'garminrunning', 'garminchile', 'garmin',
  ],
  'Planet Fitness': [
    'planetfitness',
  ],
  'Starbucks': [
    'starbucks',
  ],
  'Columbia': [
    'columbiapfg', 'columbia',
  ],
  'Dr Pepper': [
    'drpepper',
  ],
  'Wendy\'s': [
    'wendys',
  ],
  'T-Mobile': [
    'tmobile',
  ],
  'Savage X Fenty': [
    'savagexfenty',
  ],
  'Hollister': [
    'hollister',
  ],
  'CVS': [
    'cvspharmacy',
  ],
  'MSUFCU': [
    'msufcu',
  ],
  'Allstate': [
    'allstate',
  ],
  'HOKA': [
    'hoka',
  ],
  'Rhoback': [
    'rhoback',
  ],
  'Target': [
    'target',
  ],
  'Midas': [
    'midasofficial',
  ],
  'Omaha Steaks': [
    'omahasteaks',
  ],
  'Wells Fargo': [
    'wellsfargo',
  ],
  'Dexcom': [
    'dexcom',
  ],
  'Blue Cross Blue Shield': [
    'bluecrossblueshield',
  ],
  'Carhartt': [
    'carhartt',
  ],
  'Beats by Dre': [
    'beatsbydre',
  ],
  'Cracker Barrel': [
    'crackerbarrel',
  ],
  'TurboTax': [
    'turbotax',
  ],
  'Six Star Pro': [
    'sixstarpronutrition',
  ],
  'Quest Nutrition': [
    'questnutrition',
  ],
  'Taco Bell': [
    'tacobell',
  ],
  'Raising Cane\'s': [
    'raisingcanes', 'raisingcaneschickenfingers',
  ],
  'Lockton': [
    'lockton_usa', 'locktonusa',
  ],
  'Gametime': [
    'gametimeapp',
  ],
};

// Build the normalization map: variant → parent name
for (const [parentName, variants] of Object.entries(brandFamilies)) {
  for (const variant of variants) {
    normalizationMap[variant] = parentName;
  }
}

writeFileSync('./public/data/brand-normalization.json', JSON.stringify(normalizationMap, null, 2));
console.log(`Written ${Object.keys(normalizationMap).length} normalization mappings to public/data/brand-normalization.json`);

// Print some stats
console.log('\n--- Verification ---');
let totalMergedPosts = 0;
const mergedBrands = new Map();
for (const [key, data] of allPartners.entries()) {
  if (excluded.has(key)) continue;
  const norm = normalize(key);
  const parentName = normalizationMap[norm] || data.names.values().next().value;
  const existing = mergedBrands.get(parentName) || { posts: 0, schools: new Set() };
  existing.posts += data.posts;
  for (const s of data.schools) existing.schools.add(s);
  mergedBrands.set(parentName, existing);
  totalMergedPosts += data.posts;
}

const sortedMerged = [...mergedBrands.entries()].sort((a, b) => b[1].posts - a[1].posts);
console.log(`\nTop 20 brands after exclusion + normalization:`);
sortedMerged.slice(0, 20).forEach(([name, data], i) => {
  console.log(`  ${i + 1}. ${name}: ${data.posts} posts, ${data.schools.size} schools`);
});
console.log(`\nTotal remaining: ${mergedBrands.size} brands, ${totalMergedPosts} posts`);
