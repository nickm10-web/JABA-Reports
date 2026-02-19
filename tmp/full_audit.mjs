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

function norm(name) {
  return name.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

const sorted = [...allBrands.entries()].sort((a,b) => b[1].posts - a[1].posts);

// Build normalized map
const byNormalized = new Map();
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (!byNormalized.has(n)) byNormalized.set(n, []);
  byNormalized.get(n).push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes), schoolCount: data.schools.size });
});

// ============================================================
// GROUP 1: NOT ACTUAL BRAND DEALS
// ============================================================

console.log("=".repeat(80));
console.log("GROUP 1: NOT ACTUAL BRAND DEALS");
console.log("=".repeat(80));

// 1A: School Threads Shops
console.log("\n--- 1A: SCHOOL THREADS SHOP ACCOUNTS ---");
console.log("(Student-run merchandise shops affiliated with specific schools)\n");

const threadsEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  // School threads shops - contain "thread" and are school-specific
  const schoolThreads = [
    'baylorthreads', 'aggiethreads', 'auburnthread', 'buckeyethreads', 'nebraskathread',
    'olddominionthreads', 'ucfthreads', 'utsathreads', 'wisconsinthreads', 'nittanylionthreads',
    'lsuthreads', 'marylandthreadss', 'byuthreads', 'clemsonthreads', 'kentuckythread',
    'uscthreads', 'uvathreads', 'washingtonstatethreads', 'pantherthread', 'depaulthreads',
    'msuthread', 'rmuthreads', 'usdthreads', 'virginiatechthreads', 'creightonthreads',
    'rtithreads', 'olemissthread', 'usfthreads', 'iowastatethreads', 'mizzouthreads',
    'ucberkeleythreads', 'wkuthread', 'cowboythreads', 'nilthreads'
  ];
  if (schoolThreads.includes(n)) {
    threadsEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
// Also add athletesthread and onlyelitethreads
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (['athletesthread', 'onlyelitethreads', 'onlyelitehoopers', 'threadsbysahara'].includes(n)) {
    threadsEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
threadsEntries.sort((a,b) => b.posts - a.posts);
let threadsTotal = 0;
threadsEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  threadsTotal += e.posts;
});
console.log(`\nSubtotal: ${threadsEntries.length} entries, ${threadsTotal} posts`);

// 1B: School Team / Athletic Department Accounts
console.log("\n--- 1B: SCHOOL TEAM / ATHLETIC DEPARTMENT ACCOUNTS ---");
console.log("(Official team social media accounts, not external brands)\n");

const teamAccounts = [];
const teamPatterns = [
  // Specific known team accounts
  'clemsonfb', 'terpswbb', 'byufootball', 'huskermbb', 'byumbb', 'byumvolleyball',
  'byucheerandstunt', 'clemsonsoftball', 'gobearcatsfb', 'baylortrack', 'baylorsoftball',
  'baylorwbb', 'baylorbears', 'baylorfutbol', 'bayloracrotumb', 'bufootball', 'baylorvball',
  'byuwbb', 'byuwsoccer', 'byubaseball', 'byugymnastics', 'byutrackfieldxc', 'byuequipment',
  'byuswimdive', 'byuwvolleyball', 'byuxcapp',
  'clemsonmbb', 'clemsonbaseball',
  'auburnfootball', 'auburntfxc', 'auburnequestrian',
  'lsufootball', 'lsuwbkb', 'lsusoftball', 'lsusoccer', 'lsubeachvb',
  'ukgymnastics', 'ukfootball',
  'msufootball',
  'odufootball', 'oduwbb',
  'pennstatefball', 'pennstatebase', 'pennstatewrest', 'pennstatemsoc', 'pennstatewlax',
  'pennstatemlax', 'pennstatewgolf', 'pennstatesb', 'pennstatewhky', 'pennstatetfxc',
  'pittfb',
  'aggiefootball', 'aggiemensgolf', 'aggiewomensgolf', 'aggiebaseball', 'aggievolleyball',
  'ucfvolleyball',
  'terpsfootball',
  'huskerfootball', 'huskerwbb', 'huskervb', 'huskermgym',
  'usdvolleyball',
  'uscwbb', 'uscfb', 'uscathletics', 'uscmensvolley',
  'utsawgolf', 'utsaathletics',
  'gobearcats', 'gobearcatswten', 'gobearcatsfb',
  'ohiostswimdive', 'ohiostatemgolf', 'wrestlingbucks',
  'badgerfootball', 'badgerwrestling', 'badgerwbb', 'badgervb', 'badgermhockey',
  'badgerswimdive', 'badgerwrowing',
  'hokieswbb', 'hokiessoftball', 'hokiesswimdive',
  'dukefootball', 'bluejayfootball',
  'marylandterrapins', 'terrapinhoops',
  'pennstatewlax', 'pennstatemlax',
  // Other school sport accounts that appear
  'greenwavefb', 'cyclonefb', 'meangreenfb', 'usufootball', 'wvubaseball',
  'wyo_football', 'stcbaseball',
  'fbyuzmesubesi', // Fenerbahce swimming (foreign club tagged)
];

sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (teamPatterns.includes(n)) {
    teamAccounts.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
teamAccounts.sort((a,b) => b.posts - a.posts);
let teamTotal = 0;
teamAccounts.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  teamTotal += e.posts;
});
console.log(`\nSubtotal: ${teamAccounts.length} entries, ${teamTotal} posts`);

// 1C: NIL Collectives / Booster Organizations / School-Affiliated NIL
console.log("\n--- 1C: NIL COLLECTIVES / BOOSTER ORGANIZATIONS ---");
console.log("(School-affiliated fundraising, NIL collectives, booster clubs)\n");

const nilCollectives = [
  'ontovictory', 'ontovictorycom', 'ontovictorynil',
  'houseofvictorynil', 'houseofvictory',
  'cavfutures',
  'iptay', 'clemsontigerscomiptay',
  '12thmanfoundation',
  'royalbluecollective',
  'badgerconnect',
  'baylorplus',
  'charitablegiftamerica',
  'pursuityourself',
  'varsitycollective',
  'onemarylandnil',
  'prideofodunil',
  'wareagleplus',
  'happyvalleyunited',
  'roarpluspsu',
  'auburnnil',
  'heartheturtle', // Maryland NIL
  'happyvalleyagventures',
  'thefoundationohio',
  'theprideofodu',
  'hometownheronil',
  'brightsidenil',
  'risingspearnil',
  'amplifynil',
  'rollthequadnil',
  'azteclinknil', 'azteclink',
  'leveragenil',
  'the15clubnil',
  'kycauses',
];

const nilEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (nilCollectives.includes(n)) {
    nilEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
nilEntries.sort((a,b) => b.posts - a.posts);
let nilTotal = 0;
nilEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  nilTotal += e.posts;
});
console.log(`\nSubtotal: ${nilEntries.length} entries, ${nilTotal} posts`);

// 1D: NIL Store Accounts
console.log("\n--- 1D: NIL STORE ACCOUNTS ---");
console.log("(School-specific NIL merchandise stores)\n");

const nilStoreEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (n.includes('nilstore') || name.includes('.nil.store') || name.includes('nil.store')) {
    nilStoreEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
nilStoreEntries.sort((a,b) => b.posts - a.posts);
let nilStoreTotal = 0;
nilStoreEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  nilStoreTotal += e.posts;
});
console.log(`\nSubtotal: ${nilStoreEntries.length} entries, ${nilStoreTotal} posts`);

// 1E: Influxer Accounts
console.log("\n--- 1E: INFLUXER PLATFORM ACCOUNTS ---");
console.log("(Influxer is a creator/content platform for college athletes, not an external brand)\n");

const influxerEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (n.includes('influxer')) {
    influxerEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
influxerEntries.sort((a,b) => b.posts - a.posts);
let influxerTotal = 0;
influxerEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  influxerTotal += e.posts;
});
console.log(`\nSubtotal: ${influxerEntries.length} entries, ${influxerTotal} posts`);

// 1F: Individual People / Personal Accounts
console.log("\n--- 1F: INDIVIDUAL PEOPLE / PERSONAL ACCOUNTS ---");
console.log("(Athletes, students, content creators - not brands)\n");

// Personal accounts: no @ prefix AND look like a personal username (contain digits, underscores in name-like patterns)
// Plus known @ personal accounts
const knownPersonalAccounts = [
  'flaujae', 'travistrackstar', 'trevinknell', 'simpcalvin22', 'kadenchid13',
  'liamcliff2', 'olaivavega', 'levihaines77', 'beaubartlett', 'braedonford21',
  '14davin', 'bryantball11', 'amare91', 'connoressegian', 'bellahines3',
  'graceyyjamess', 'okutoyiangella', 'kyeu', 'caydenpope14', 'joshklug4',
  'lilcell', 'matthewbeachley', 'dawsonbundy', 'summergarrison', 'kylecrum02',
  'cajones777', 'haydenschott', 'chalupabatmxn', 'daltonriggs', 'nickantoine3',
  'thesavannahscott', 'jbxrks', 'taylorkittleman', 'saylorpoff', 'd1siah',
  'en3mi', 'brendanmillon', 'sn1perlewis', 'sophiegallagherpt', 'mccordgrice',
  'peytonguziec', 'kamlax26', 'rutgerson3', 'scotrehumphrey', 'nayahoward01',
  'jacobian00', 'rashadking', 'ciellapickett', 'alixmariefranklin', 'trentcaraway',
  'brodymarcet9', 'qpeezy0', 'alexdixon', 'jesseeleeepakele', 'nakashimabryce',
  'yourstulyrochele', 'r0be4t', 'jaydendavis15', 'coltonchmelar', 'miascranton',
  'lukemiller10', 'samsimmons05', 'ljbrown233', 'joshvaughn0', 'kennyoz6',
  'dominick9913', 'zekesaldana', 'jordanballin', 'daltonanderson7', 'tuckerrlarge',
  'willgarlock11', 'jevaughnpinnock', 'bernardoherzer', 'mayagessner',
  'trav66', 'jahmallll', 'jtmoney4', 'zeyy', 'crazyb10', 'giftofgabb3',
  'jamescorrigan', 'isaachedengren', 'lexxydamuni', 'lucykesler', 'emmabenedict',
  'kikimckenzie', 'paytongubler', 'kenzielung', 'jakegriffin54', 'addiejean8',
  'nolanficklin', 'abbeygillespie', '3gorr', '20creed', 'plxgrixhtj',
  'keemportfolio', 'kel4six', 'gtxgeneral', 'louiejaysienders',
  'cstory5', 'kobecloud', 'peoriacitysoccer',
  'aldotcomtigers', 'campbellsouperstar12', 'card0inc',
  'hishuddle', // personal ministry account
  'wepayaton', 'cadddden', 'castrosshutup', 'sayythatscarl',
  'jackbennett24', 'iraaustiniv', 'taliacotter',
  'olivmadison', // personal account
  'jeffersonmcmullin',
  'noezybuckets', 'brodyymarcet9',
  'rylenstockton', 'bmart42', 'loganlogan', 'bizbaglieri',
  'scottraterman', 'jalenworthley', 'kswarnock', 'joeysenstock', 'allie2021',
  'collinj',  'trytonmccladdie1',
  'maddenclem', 'brodiiee', 'chasessandro',
  'zakiyahmonae', 'swipathefox', // LSU athlete/person
  'livvydunne', // LSU gymnast
  'jackbennett', 'gillyg7', 'pupbuono4', 'kartis58', 'micbrice',
  'daniprunzik', 'jackeporterr', 'beauprib', 'maeliemonfils',
  'morgannmarshall1434', 'addielyon', 'gmerkel04', 'coopercousins',
  'lukewalstrum', 'tylerkasak', 'keatonpeters', 'carterschade2',
  'alexservagno', 'abydeverka', 'christianjdionne1', 'emmisellman',
  'hannahjordan', 'nathanpayneofficial',
  'colormehally', 'bodybyraventracy',
  'lydiaettema', 'juliastenvick', 'taravandewater',
  'ellalabrum', 'annablamires', 'sarahrmathis', 'schravalou',
  'luluuluave', 'shandonperez', 'kenzipooretephotography',
  'trece', // personal
  'tessamarielavender',
  'beejmoneyy', 'aceglass21',
  'gabbydoesmytattts', 'naileditbyangel',
  'jolithelook', 'bonitabrooklynn',
  'kristagrossrealtor',
  'stanleysborden', 'solsauche', 'craverenterprises',
  'swipathefox',
];

const personalEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  // Check if it's a known personal account
  if (knownPersonalAccounts.includes(n)) {
    personalEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes), reason: "Individual person/athlete" });
    return;
  }
  // No @ prefix accounts that look like personal usernames
  if (!name.startsWith('@') && !name.startsWith('On')) {
    // Check if it looks like a personal name pattern
    const hasDigits = /\d/.test(name);
    const hasDot = name.includes('.');
    const hasUnderscore = name.includes('_');
    const looksPersonal = (hasDigits && (hasDot || hasUnderscore)) ||
      /^[a-z]+[._][a-z]+\d*$/i.test(name) ||
      /^\w+\d{1,2}$/.test(name);
    // Already captured by other categories? skip
    const n2 = norm(name);
    const alreadyCaptured = n2.includes('thread') || n2.includes('influxer') || n2.includes('nilstore') ||
      n2.includes('football') || n2.includes('basketball') || n2.includes('softball') ||
      n2.includes('soccer') || n2.includes('volleyball') || n2.includes('baseball') ||
      n2.includes('hockey') || n2.includes('wrestling') || n2.includes('wbb') || n2.includes('mbb');
    if (looksPersonal && !alreadyCaptured) {
      personalEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes), reason: "Likely personal account (username pattern)" });
    }
  }
});
personalEntries.sort((a,b) => b.posts - a.posts);
let personalTotal = 0;
personalEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes | ${e.reason}`);
  personalTotal += e.posts;
});
console.log(`\nSubtotal: ${personalEntries.length} entries, ${personalTotal} posts`);

// 1G: Podcasts
console.log("\n--- 1G: PODCASTS ---");
console.log("(Podcast accounts, not brand deals)\n");

const podcastNames = [
  'driventhepodcast', 'btg45podcast', 'gameballpodcast', 'chargeonpodcast',
  'yourchoicepod', 'whatsuppod', 'allthingsgympod', 'themodestsportsshow',
  'turnonthelamppodcast', 'bfmpod', 'plainsmanpodcast',
];
const podcastEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (podcastNames.includes(n) || n.includes('podcast')) {
    podcastEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
podcastEntries.sort((a,b) => b.posts - a.posts);
let podcastTotal = 0;
podcastEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  podcastTotal += e.posts;
});
console.log(`\nSubtotal: ${podcastEntries.length} entries, ${podcastTotal} posts`);

// 1H: Sports Media / News Outlets / Recruiting Platforms
console.log("\n--- 1H: SPORTS MEDIA / NEWS / RECRUITING PLATFORMS ---");
console.log("(Media outlets, recruiting services, conference networks - not brand sponsors)\n");

const mediaNames = [
  'on3recruits', 'on3', 'nfmpics', 'rivalsdotcom', 'd1baseball', 'sportsillustrated',
  'cbssports', 'cbssportscfb', 'bigtennetwork', 'accnetwork', 'nflnetwork',
  'foxnation', 'dimemagazine', 'wslam', 'selfmagazine', 'atlargemagazine',
  'britishvogue', 'nytimes', 'baseballamerica', 'bleachertalkbaseball',
  'prepbaseball', 'perfectgameusa', 'milesplit', 'milesplitsoutheast',
  'hailvarsity', 'aldotcomtigers', 'sidelinesmagazine', 'flowrestling',
  'topdrawersoccer', 'accd1baseball', 'b1gvolleyball', 'nextgenstats',
  'eliteprospectshockey', 'wesh2', 'insidecheer', 'overtimeszn', 'overtime',
  'bigtimesoftball', 'ballislife', 'nfldraftdiamonds', 'vypehouston',
  'bigten', 'ncaa', 'marchmadnesswbb', 'elite11',
  'getupespn', // ESPN show
  'coursidefilms', 'courtsidefilms',
  'cornermediaco', // media company
  'centerstmedia', // BYU media
  'statemediapsu', // Penn State media
  'isedmedia', // media company
  'gfxwrld', 'recruitgfx', // graphics services
  'xposuresports',
  'dahsportsmedia',
  'risngballersusa', 'risingballersusa',
  'phenomhoops', 'phenomelite',
  'capitolhoops',
  'prepedigca', 'prepdigca',
  'prepredzoneaz',
  'boisesportstalk',
  'njhooprecruit',
  'heismantrophy', 'wuerffeltrophy', 'mannellyaward', 'thebowerman', // awards
  'secunfiltered',
  'nflflames', // meant to catch non-brand sports
  '1029espn', '406mtsports',
  'victoryplustv', // sports TV
  'showmesportz',
  'louisianaaloaded',
];

const mediaEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (mediaNames.includes(n)) {
    mediaEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
mediaEntries.sort((a,b) => b.posts - a.posts);
let mediaTotal = 0;
mediaEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  mediaTotal += e.posts;
});
console.log(`\nSubtotal: ${mediaEntries.length} entries, ${mediaTotal} posts`);

// 1I: Professional Sports Teams / Leagues
console.log("\n--- 1I: PROFESSIONAL SPORTS TEAMS / LEAGUES ---");
console.log("(Pro team accounts tagged in posts, not brand deals)\n");

const proTeamNames = [
  'nhlflames', 'nhljets', 'penguins', 'sanjosesharks', 'bluejacketsnhl',
  'predsnhl', 'nyislanders', 'nyislanders', 'phillies', 'bucks',
  'nbaafricaofficial', 'chlhockey', 'usahockey', 'caahockey',
  'hockeycanada', // national team org
];

const proTeamEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (proTeamNames.includes(n)) {
    proTeamEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
proTeamEntries.sort((a,b) => b.posts - a.posts);
let proTeamTotal = 0;
proTeamEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  proTeamTotal += e.posts;
});
console.log(`\nSubtotal: ${proTeamEntries.length} entries, ${proTeamTotal} posts`);

// 1J: Religious Organizations
console.log("\n--- 1J: RELIGIOUS ORGANIZATIONS ---");
console.log("(Religious ministries, faith-based orgs tagged as sponsors)\n");

const religiousNames = [
  'busportsministry', 'realgodsstories', 'jesuswonapparel', 'seekjesusco',
  'tausiliakanafoundation', 'varsitycatholic', 'holyathletes', 'thekingdomathletes',
  'younglifesav', 'godseconomy', 'moreto4foundation',
  'fcawpacnw', // Fellowship of Christian Athletes
  'shinethelighton',
];

const religiousEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (religiousNames.includes(n)) {
    religiousEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
religiousEntries.sort((a,b) => b.posts - a.posts);
let religiousTotal = 0;
religiousEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  religiousTotal += e.posts;
});
console.log(`\nSubtotal: ${religiousEntries.length} entries, ${religiousTotal} posts`);

// 1K: School Bookstores / Campus Services
console.log("\n--- 1K: SCHOOL BOOKSTORES / CAMPUS SERVICES ---");
console.log("(On-campus stores and services, not external brand partners)\n");

const campusNames = [
  'tamubookstore', 'universitybookstore', 'alumnihallmsu', 'vthokieshop',
  'thebuckeyecorner',
  'nebraskaentrepreneurship',
  'scarletandgoldshop',
  'sprtnshop', // spartan shop
];

const campusEntries = [];
sorted.forEach(([name, data]) => {
  const n = norm(name);
  if (campusNames.includes(n)) {
    campusEntries.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
  }
});
campusEntries.sort((a,b) => b.posts - a.posts);
let campusTotal = 0;
campusEntries.forEach(e => {
  console.log(`${e.name} | ${e.posts} posts | ${e.schools.join(', ')} | ${e.totalLikes} likes`);
  campusTotal += e.posts;
});
console.log(`\nSubtotal: ${campusEntries.length} entries, ${campusTotal} posts`);

// Summary
console.log("\n" + "=".repeat(80));
console.log("GROUP 1 SUMMARY");
console.log("=".repeat(80));
const g1Total = threadsTotal + teamTotal + nilTotal + nilStoreTotal + influxerTotal + personalTotal + podcastTotal + mediaTotal + proTeamTotal + religiousTotal + campusTotal;
console.log(`1A School Threads Shops:     ${threadsEntries.length} entries, ${threadsTotal} posts`);
console.log(`1B School Team Accounts:     ${teamAccounts.length} entries, ${teamTotal} posts`);
console.log(`1C NIL Collectives/Boosters: ${nilEntries.length} entries, ${nilTotal} posts`);
console.log(`1D NIL Store Accounts:       ${nilStoreEntries.length} entries, ${nilStoreTotal} posts`);
console.log(`1E Influxer Accounts:        ${influxerEntries.length} entries, ${influxerTotal} posts`);
console.log(`1F Personal Accounts:        ${personalEntries.length} entries, ${personalTotal} posts`);
console.log(`1G Podcasts:                 ${podcastEntries.length} entries, ${podcastTotal} posts`);
console.log(`1H Media/News/Recruiting:    ${mediaEntries.length} entries, ${mediaTotal} posts`);
console.log(`1I Pro Sports Teams:         ${proTeamEntries.length} entries, ${proTeamTotal} posts`);
console.log(`1J Religious Organizations:  ${religiousEntries.length} entries, ${religiousTotal} posts`);
console.log(`1K Campus Bookstores/Svcs:   ${campusEntries.length} entries, ${campusTotal} posts`);
console.log(`TOTAL GROUP 1:               ${g1Total} posts flagged as not actual brand deals`);

// ============================================================
// GROUP 2: SHOULD BE NORMALIZED/MERGED
// ============================================================

console.log("\n\n" + "=".repeat(80));
console.log("GROUP 2: SHOULD BE NORMALIZED/MERGED");
console.log("=".repeat(80));

// Helper: find all entries matching a list of normalized names
function findAll(normNames) {
  const results = [];
  sorted.forEach(([name, data]) => {
    const n = norm(name);
    if (normNames.includes(n)) {
      results.push({ name, posts: data.posts, schools: [...data.schools], totalLikes: Math.round(data.totalLikes) });
    }
  });
  return results.sort((a,b) => b.posts - a.posts);
}

function printMergeGroup(parentName, normNames) {
  const entries = findAll(normNames);
  if (entries.length <= 1) return 0;
  const totalPosts = entries.reduce((s,e) => s + e.posts, 0);
  console.log(`\n  PARENT: ${parentName} (${totalPosts} combined posts)`);
  entries.forEach(e => {
    console.log(`    ${e.name} | ${e.posts} posts | ${e.schools.join(', ')}`);
  });
  return totalPosts;
}

// 2A: Nike family
console.log("\n--- 2A: NIKE FAMILY ---");
const nikeNames = ['nike', 'nikebasketball', 'nikerunning', 'usnikefootball', 'nikelacrosse',
  'nikewrestling', 'nikeeyb', 'nikeeybl', 'nikegirlseybl', 'nikestrength',
  'nikesportswear', 'nikeskims', 'nikboa'];
printMergeGroup("Nike", nikeNames);

// 2B: Adidas family
console.log("\n--- 2B: ADIDAS FAMILY ---");
const adidasNames = ['adidas', 'adidasusfootball', 'adidasbasketball', 'adidasrunning',
  'adidastennis', 'adidasmy', 'adidasph', 'adidastrkiye', 'adidasoriginals',
  'adidasgolf', 'adidasfballus', 'adidasfootball'];
printMergeGroup("Adidas", adidasNames);

// 2C: Under Armour family
console.log("\n--- 2C: UNDER ARMOUR FAMILY ---");
printMergeGroup("Under Armour", ['underarmour', 'underarmour150', 'underarmor', 'uanextvolleyball']);

// 2D: All case-sensitivity duplicates
console.log("\n--- 2D: CASE-SENSITIVITY & SPELLING DUPLICATES ---");
console.log("(Same brand, different capitalization or missing @ prefix)\n");

let mergeCount = 0;
byNormalized.forEach((entries, normalized) => {
  if (entries.length > 1) {
    // Skip ones already covered in 2A-2C
    if (nikeNames.includes(normalized) || adidasNames.includes(normalized) ||
        ['underarmour', 'underarmour150', 'underarmor', 'uanextvolleyball'].includes(normalized)) return;

    const totalPosts = entries.reduce((s, e) => s + e.posts, 0);
    console.log(`  MERGE -> "${normalized}" (${totalPosts} combined posts)`);
    entries.forEach(e => console.log(`    ${e.name} | ${e.posts} posts | ${e.schools.join(', ')}`));
    console.log();
    mergeCount++;
  }
});
console.log(`Total merge groups: ${mergeCount}`);

// 2E: Brand sub-accounts / regional variants
console.log("\n--- 2E: BRAND SUB-ACCOUNTS / REGIONAL VARIANTS ---");
console.log("(Sub-brands or regional accounts that should merge with parent)\n");

const subBrandGroups = [
  { parent: "McDonald's", names: ['mcdonalds', 'mcdonaldsnebraska', 'mcdonaldscarolinas', 'mcdonaldsphillyregion', 'mcdonaldsgreaterohio', 'mcdonaldsinlandnw', 'mcdonaldsofthreerivers'] },
  { parent: "Puma", names: ['puma', 'pumausa', 'pumahoops', 'pumagolf'] },
  { parent: "Red Bull", names: ['redbullusa', 'redbull', 'redbulletin'] },
  { parent: "Monster Energy", names: ['monsterenergy', 'monster'] },
  { parent: "Dick's Sporting Goods", names: ['dickssportinggoods', 'dickshouseofsport', 'dicks'] },
  { parent: "Fabletics", names: ['fabletics', 'fableticsmen'] },
  { parent: "Prime (drink)", names: ['drinkprime', 'drinkprimegirls'] },
  { parent: "Gordon McKernan", names: ['getgordon', 'gordonmckernan'] },
  { parent: "Sonic", names: ['sonicdrivein', 'sonic', 'sonicpartner'] },
  { parent: "Turtlebox", names: ['turtleboxaudio', 'turtlebox'] },
  { parent: "Popeyes", names: ['popeyes', 'popeyespartner'] },
  { parent: "Homage", names: ['homage', 'homagepartner'] },
  { parent: "Hardee's", names: ['hardees', 'hardeespartner'] },
  { parent: "VKTRY", names: ['teamvktry', 'vktry'] },
  { parent: "Clever Made", names: ['clevermade', 'clevvermade'] },
  { parent: "Mizuno", names: ['mizunofastpitchusa', 'mizunoswimusa', 'mizunolongbeach'] },
  { parent: "Callaway Golf", names: ['callawaygolf', 'callawaynexteu', 'callawaygolfeu'] },
  { parent: "Arena (swim)", names: ['arenastore_cl', 'arenainternational', 'arenaracing', 'arenausa', 'arenamexico', 'arenagraffiti'] },
  { parent: "MyPlayer", names: ['myplayersports', 'myplayerathlete', 'myplayersoftball', 'myplayermerch'] },
  { parent: "Gatorade", names: ['gatorade', 'gatoradepoy', 'dcgatorade'] },
  { parent: "Coach", names: ['coach', 'coachny'] },
  { parent: "Dove", names: ['dove', 'dovemencare'] },
  { parent: "New Era", names: ['neweracap', 'newera'] },
  { parent: "Celsius", names: ['celsiusofficial', 'celsiusbrandpartner'] },
  { parent: "Columbia", names: ['columbiapfg'] },
  { parent: "Powerade", names: ['poweradeus', 'powerade'] },
  { parent: "Exact Sciences", names: ['exactsciences', 'exactsciencesathletes'] },
  { parent: "EA Sports", names: ['easportscollege', 'easportsnhl'] },
  { parent: "Dillard's", names: ['dillards', 'dillardscampuscollective'] },
  { parent: "C4 Energy", names: ['c4energy', 'c4'] },
  { parent: "Brooks Running", names: ['brooksrunning', 'brooks', 'brooksnil'] },
  { parent: "Starbucks", names: ['starbucks'] },
  { parent: "New Balance", names: ['newbalance', 'thetrackatnewbalance'] },
  { parent: "SeatGeek", names: ['seatgeek'] },
  { parent: "Garmin", names: ['garminrunning', 'garmin', 'garminchile'] },
  { parent: "On Running", names: ['on', 'onrunning'] },
];

subBrandGroups.forEach(group => {
  const entries = findAll(group.names);
  if (entries.length > 1) {
    const totalPosts = entries.reduce((s,e) => s + e.posts, 0);
    console.log(`  PARENT: ${group.parent} (${totalPosts} combined posts)`);
    entries.forEach(e => {
      console.log(`    ${e.name} | ${e.posts} posts | ${e.schools.join(', ')}`);
    });
    console.log();
  }
});
