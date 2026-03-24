import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Heart, MessageCircle, Eye, Award, Search, ExternalLink, TrendingUp, BarChart3, Star, Globe, Zap } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface RawPost {
  _id: string;
  athlete: {
    _id: string;
    name: string;
    image: string;
    bio?: string;
    sport: string;
    position: string;
    school: { name: string };
  };
  caption: string;
  createdAt: { $date: string };
  publishedAt: { $date: string };
  source: string;
  isSponsored: boolean;
  sponsorPartner: string;
  mediaType: string;
  url: string;
  permalink: string;
  metrics: {
    likes: number;
    comments: number;
    engagementRate: number;
    shares: number;
    saves: number;
    impressions: number;
    reach: number;
    videoViews: number;
    profileLinksTaps: number;
    followers: number;
    totalInteractions: number;
    accountsEngaged: number;
  };
}

interface AthleteSummary {
  id: string;
  name: string;
  image: string;
  bio: string;
  sport: string;
  position: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  sponsoredPosts: number;
  avgEngagementRate: number;
  topPost: RawPost;
  uniqueSponsors: string[];
  instagramPosts: number;
  tiktokPosts: number;
}

interface ReligionOfSportReportProps {
  onBack?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatSport(sport: string): string {
  const s = sport
    .replace(/^MENS_/, "Men's ")
    .replace(/^WOMENS_/, "Women's ")
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return s
    .replace(/^Men's /i, "Men's ")
    .replace(/^Women's /i, "Women's ");
}

function formatPercent(rate: number): string {
  if (rate <= 0) return '0%';
  const pct = rate < 1 ? rate * 100 : rate;
  return pct.toFixed(2) + '%';
}

function formatShortDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getPostHeadline(post: RawPost): string {
  const caption = (post.caption || '').replace(/\s+/g, ' ').trim();
  if (!caption) return `${formatSport(post.athlete.sport)} Post`;
  return caption.length > 64 ? `${caption.slice(0, 61)}...` : caption;
}

function getUniquePostKey(post: RawPost): string {
  return (
    post.permalink ||
    `${post.athlete?._id || post.athlete?.name}::${post.url || ''}::${post.publishedAt?.$date || post.createdAt?.$date || ''}::${post.caption || ''}`
  );
}

// Marketability scores & follower counts from JABA ReligionRosterV2.json (source of truth)
const ROSTER_DATA: Record<string, { marketability: number; followers: number }> = {
  'Dwyane Wade': { marketability: 91, followers: 19572672 },
  'Michael Strahan': { marketability: 87, followers: 1695213 },
  'Tom Brady': { marketability: 94, followers: 15476666 },
  'Simone Biles': { marketability: 97, followers: 12067709 },
  'Naomi Osaka': { marketability: 93, followers: 2984209 },
  'Alex Morgan': { marketability: 89, followers: 9478495 },
  'Megan Rapinoe': { marketability: 89, followers: 1971351 },
  'Serena Williams': { marketability: 91, followers: 18155302 },
  "Shaquille O'Neal": { marketability: 93, followers: 35579371 },
  'Russell Wilson': { marketability: 92, followers: 5547800 },
  'Tony Hawk': { marketability: 91, followers: 9670063 },
  'Chloe Kim': { marketability: 91, followers: 1072428 },
  'Stephen Curry': { marketability: 94, followers: 58316834 },
  'LeBron James': { marketability: 94, followers: 157488877 },
  'Usain Bolt': { marketability: 89, followers: 14108050 },
  'Shohei Ohtani': { marketability: 96, followers: 10410980 },
  'Shaun White': { marketability: 95, followers: 2431100 },
  'Kelly Slater': { marketability: 91, followers: 3370830 },
  'Coco Gauff': { marketability: 96, followers: 2300963 },
  'Conor McGregor': { marketability: 90, followers: 46389773 },
  'Katie Ledecky': { marketability: 87, followers: 914152 },
  'Marcus Rashford': { marketability: 99, followers: 22007137 },
  'Scout Bassett': { marketability: 69, followers: 59477 },
  'Letícia Bufoni': { marketability: 93, followers: 3667907 },
  'Lindsey Vonn': { marketability: 97, followers: 3223491 },
  'Russell Westbrook': { marketability: 88, followers: 22508269 },
  'Aaron Rodgers': { marketability: 99, followers: 2297916 },
  'Alex Rodriguez': { marketability: 91, followers: 4399515 },
  'Curt Schilling': { marketability: 55, followers: 4339 },
  'David Ortiz': { marketability: 94, followers: 2540274 },
  'Madison Chock': { marketability: 80, followers: 228510 },
  'Evan Bates': { marketability: 73, followers: 125124 },
  'Paul Poirier': { marketability: 71, followers: 50972 },
  'Piper Gilles': { marketability: 74, followers: 87881 },
  'Bubba Wallace': { marketability: 83, followers: 563492 },
  'Julio Rodríguez': { marketability: 85, followers: 583237 },
  'Draymond Green': { marketability: 88, followers: 4063186 },
  'Justise Winslow': { marketability: 79, followers: 485279 },
  'Nathan Braaten': { marketability: 31, followers: 40 },
  'Hayden Hurst': { marketability: 74, followers: 106353 },
  'Bryce Underwood': { marketability: 86, followers: 267762 },
  'Devin Sanchez': { marketability: 72, followers: 62764 },
  'Devin sanchez': { marketability: 72, followers: 62764 },
  'Dakorien Moore': { marketability: 75, followers: 50000 },
  'Malachi Goodman': { marketability: 45, followers: 1000 },
};

const CURATED_ATHLETE_BIOS: Record<string, string> = {
  'Dwyane Wade':
    'Three-time NBA Champion and clutch performer known as "Flash." Fashion icon and LGBTQ+ advocate. Featured in Shut Up and Dribble.',
  'Michael Strahan':
    'Dominant defensive end with the all-time single-season sack record and Super Bowl champion. Reinvented as a beloved TV personality. Co-founder of Religion of Sports.',
  'Tom Brady':
    'The greatest quarterback ever with seven Super Bowls and five Finals MVPs. Drafted 199th overall, he spent two decades proving everyone wrong. Co-founder of Religion of Sports; featured in Tom vs Time, Man in the Arena, Greatness Code, and Built in Birmingham: Brady & The Blues.',
  'Simone Biles':
    'Most decorated gymnast in history with 41 World and Olympic medals. Showed courage by prioritizing mental health at Tokyo 2020. Featured in Simone vs Herself and Simone Biles Rising.',
  'Naomi Osaka':
    'Four-time Grand Slam champion who sparked global conversation about athlete mental health. Former World No. 1 and authentic voice for change. Featured in Naomi Osaka (Netflix).',
  'Alex Morgan':
    "Prolific U.S. women's soccer star and two-time World Cup champion. Advocate for equal pay and gender equity. Featured in Greatness Code.",
  'Megan Rapinoe':
    'Two-time World Cup champion and Golden Boot winner. Outspoken fighter for LGBTQ+ rights, equal pay, and racial justice.',
  'Serena Williams':
    "23-time Grand Slam champion who redefined women's tennis. Played through injury and systemic bias for four decades. Featured in In The Arena: Serena Williams.",
  "Shaquille O'Neal":
    'Dominant four-time NBA Champion and league MVP. Built a second empire as businessman, entertainer, and philanthropist.',
  'Russell Wilson':
    'Super Bowl champion and nine-time Pro Bowler. Winner of the Walter Payton NFL Man of the Year Award. Featured in Greatness Code Season 2.',
  'Tony Hawk':
    'Pioneer who made skateboarding mainstream and first to land a 900. Built hundreds of free public skateparks through the Skatepark Project.',
  'Chloe Kim':
    'Back-to-back Olympic halfpipe gold medalist and youngest woman to win Olympic snowboarding gold at 17. Speaks out against anti-Asian racism.',
  'Stephen Curry':
    'Greatest shooter in basketball history who changed how the game is played. Four-time NBA Champion and two-time MVP. Featured in Stephen vs The Game.',
  'LeBron James':
    'Four-time NBA Champion and all-time leading scorer. Rose from poverty in Akron, Ohio to dominate for two decades. Featured in Shut Up and Dribble and Greatness Code.',
  'Usain Bolt':
    'Fastest human ever with eight Olympic gold medals and multiple world records. Brought joyful showmanship to track and field. Featured in Greatness Code.',
  'Shohei Ohtani':
    'Generational two-way talent who pitches like an ace and hits like a cleanup hitter. Multiple MVP awards and World Series ring. Featured in Searching for Shohei.',
  'Shaun White':
    'Three-time Olympic gold medalist and 15-time X Games gold medalist. "Flying Tomato" defined action sports for a generation. Featured in Greatness Code.',
  'Kelly Slater':
    "11-time world surfing champion and youngest and oldest men's world champion. Transcended professional surfing as sport's greatest ambassador. Featured in Greatness Code.",
  'Coco Gauff':
    'US Open champion at 19 and next great American tennis player. Fierce competitor and passionate voice for social justice. Featured in Coco Gauff x Naked Juice.',
  'Conor McGregor':
    'First fighter to hold UFC featherweight and lightweight titles simultaneously. Brash and brilliant, he transformed MMA into must-watch entertainment. Featured in McGregor Forever.',
  'Katie Ledecky':
    'Most dominant distance swimmer with nine Olympic gold medals and 21 World Championship titles. Wins races by historic margins. Featured in Greatness Code.',
  'Marcus Rashford':
    "Manchester United forward who changed the world off the pitch. Forced UK government to reverse school meals cuts, earning an MBE at 23. Featured in Greatness Code Season 2.",
  'Scout Bassett':
    'Lost her right leg to a chemical fire as a toddler in China. Became a seven-time U.S. Paralympic national champion in sprinting. Featured in Greatness Code Season 2.',
  'Bryce Underwood':
    'Five-star recruit and 2024-2025 Gatorade Player of the Year in Michigan. Became the youngest starting quarterback in Michigan football history at 18 years and 11 days old.',
  'Devin Sanchez':
    'No. 1 cornerback in the country and standout at Ohio State. Determined athlete working his way from the bottom to the top.',
  'Dakorien Moore':
    'Top-ranked wide receiver in the 2025 recruiting class with 1,523 receiving yards and 18 touchdowns in junior high. Also a record-setting track athlete who initially committed to LSU before flipping to Oregon.',
  'Malachi Goodman':
    'Highly-touted offensive tackle recruit for Penn State (No. 46 overall prospect). Showcases athletic versatility competing in track and field with shot put and discus.',
  'Letícia Bufoni':
    'Six-time X Games gold medalist and most decorated street skateboarder. Moved from Brazil to Los Angeles at 14 to chase her dream. Featured in Greatness Code Season 2.',
  'Lindsey Vonn':
    'Most successful alpine ski racer in American history with 82 World Cup victories. Overcame devastating injuries to return stronger each time. Featured in Greatness Code Season 2.',
  'Russell Westbrook':
    "NBA's all-time triple-double leader and 2017 MVP. Plays every possession with relentless, ferocious intensity. Featured in Passion Play: Russell Westbrook.",
  'Aaron Rodgers':
    'Four-time NFL MVP and Super Bowl champion. Most talented pure passer ever, openly explores mindfulness and personal growth. Featured in Aaron Rodgers: Enigma.',
  'Alex Rodriguez':
    '14-time All-Star and three-time AL MVP with Hall of Fame-caliber numbers. Remarkable reinvention as businessman and media personality. Featured in Alex vs ARod.',
  'Curt Schilling':
    `Three-time World Series champion and dominant postseason pitcher. His "bloody sock" game in 2004 remains iconic. Featured in Believers: Boston Red Sox.`,
  'David Ortiz':
    `"Big Papi," three-time World Series champion and most beloved clutch hitter. His defiant speech after the 2013 Boston Marathon bombing cemented his place in Boston's soul. Featured in Believers: Boston Red Sox.`,
  'Madison Chock':
    'Three-time World Champion and Olympic gold medalist in ice dance. Brings breathtaking artistry to every performance. Featured in Glitter & Gold: Ice Dancing.',
  'Evan Bates':
    'Two-time World Champion and Olympic silver medalist in ice dance. Over a decade at elite level, combines athletic power with artistry. Featured in Glitter & Gold: Ice Dancing.',
  'Paul Poirier':
    'Five-time Canadian national champion and 2026 Olympic bronze medalist. Known for boundary-pushing choreography and authentic voice. Featured in Glitter & Gold: Ice Dancing.',
  'Piper Gilles':
    'Five-time Canadian national champion and 2026 Olympic bronze medalist. Bravely returned to elite competition after ovarian cancer diagnosis. Featured in Glitter & Gold: Ice Dancing.',
  'Bubba Wallace':
    "Only full-time Black American driver in NASCAR's national series. Instrumental in getting the Confederate flag banned from NASCAR. Featured in Greatness Code Season 2.",
  'Julio Rodríguez':
    "Seattle Mariners' electrifying center fielder and 2022 AL Rookie of the Year. Taught himself English in the minors to connect with teammates and fans.",
  'Draymond Green':
    'Four-time NBA Champion and defensive engine of the Warriors dynasty. Relentless communicator and elite playmaker who redefined the power forward position. Featured in The Sessions: Draymond Green.',
  'Justise Winslow':
    'NBA forward and 2015 NCAA champion. Openly speaks about mental health to break stigma in sport. Featured in Headstrong: Mental Health and Sports.',
  'Nathan Braaten':
    'Former college soccer player who turned tragedy into purpose. Co-founded Dam Worth It, a mental health advocacy organization for student-athletes. Featured in Headstrong: Mental Health and Sports.',
  'Hayden Hurst':
    'First-round NFL Draft pick and courageous mental health advocate. Founded a foundation to support young people after surviving a suicide attempt. Featured in Headstrong: Mental Health and Sports.',
};

function normalizeAthleteBioKey(name: string): string {
  return name
    .normalize('NFKC')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeAthleteNameKey(name: string): string {
  return normalizeAthleteBioKey(name).toLowerCase();
}

const CANONICAL_ATHLETE_NAME_MAP = new Map<string, string>(
  [...new Set([...Object.keys(ROSTER_DATA), ...Object.keys(CURATED_ATHLETE_BIOS)])].map((name) => [
    normalizeAthleteNameKey(name),
    name,
  ])
);
CANONICAL_ATHLETE_NAME_MAP.set(normalizeAthleteNameKey('Devin sanchez'), 'Devin Sanchez');

function canonicalizeAthleteName(name: string): string {
  return CANONICAL_ATHLETE_NAME_MAP.get(normalizeAthleteNameKey(name)) || normalizeAthleteBioKey(name);
}

const TOTAL_ROSTER_FOLLOWERS = Object.values(ROSTER_DATA).reduce((s, r) => s + r.followers, 0);
const ATHLETE_PORTRAIT_X_OFFSET: Record<string, string> = {
  'Katie Ledecky': 'translateX(20px)',
};

const PARTNER_DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  athleta: 'Athleta',
  tyrsport: 'TYR Sport',
  lululemon: 'lululemon',
  mindthegamepod: 'Mind the Game',
  netflix: 'Netflix',
  drinkplezi: 'Drink Plezi',
  honorthegift: 'Honor The Gift',
  bareknucklefc: 'Bare Knuckle FC',
  miumiu: 'Miu Miu',
  michaelstrahanbrand: 'Michael Strahan Brand',
  nike: 'Nike',
  togethxr: 'TOGETHXR',
  googlepixel: 'Google Pixel',
  wyn: 'WYN',
  puma: 'Puma',
  cocacola: 'Coca-Cola',
  lincoln: 'Lincoln',
  lexususa: 'Lexus',
  newbalance: 'New Balance',
  gkelite: 'GK Elite',
  draftkingssportsbook: 'DraftKings Sportsbook',
  draftkings_sportsbook: 'DraftKings Sportsbook',
  wynetwork: 'WY Network',
  jcpenney: 'JCPenney',
  woosurfboards: 'Woo Surfboards',
  outerknown: 'Outerknown',
  lacroixwater: 'LaCroix',
  hbomax: 'HBO Max',
  sobeys: 'Sobeys',
  rakuten: 'Rakuten',
  roco: 'Ro',
};

const PARTNER_LOGO_OVERRIDES: Record<string, string> = {
  hollister: '/logo_hollister.png',
  dudewipes: '/dudewipes-logo.png',
  qcollar: '/q-collar-logo.png',
  stjude: '/st-jude-logo.svg',
  roccos: '/roccos_logo.png',
  baumhowers: '/baumhowers-logo.jpg',
  playfly: '/playfly-logo.jpg',
  postgame: '/Postgame_logo.png',
};

function getMarketabilityScore(athlete: AthleteSummary): number {
  const data = ROSTER_DATA[canonicalizeAthleteName(athlete.name)];
  return data?.marketability ?? 50;
}

function normalizePartnerKey(partner: string): string {
  return partner
    .trim()
    .replace(/^@/, '')
    .toLowerCase()
    .replace(/[.\s-]+/g, '')
    .replace(/[^a-z0-9_]/g, '');
}

function formatPartnerDisplayName(partner: string): string {
  const noAt = partner.trim().replace(/^@/, '');
  const key = normalizePartnerKey(partner);
  if (PARTNER_DISPLAY_NAME_OVERRIDES[key]) return PARTNER_DISPLAY_NAME_OVERRIDES[key];
  if (!noAt) return partner;
  return noAt
    .replace(/[._]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPartnerLogoSrc(partner: string): string | null {
  const key = normalizePartnerKey(partner);
  return PARTNER_LOGO_OVERRIDES[key] || null;
}

function getPartnerMonogram(partner: string): string {
  const label = formatPartnerDisplayName(partner);
  const words = label.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function ReligionOfSportReport({ onBack }: ReligionOfSportReportProps) {
  const [posts, setPosts] = useState<RawPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'likes' | 'posts' | 'engagement' | 'sponsored'>('likes');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [showAllAthletes, setShowAllAthletes] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'talent' | 'benchmark' | 'sponsors'>('overview');
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | null>(null);
  const [overviewSubTab, setOverviewSubTab] = useState<'metrics' | 'audience' | 'ai-insights'>('metrics');
  const [selectedPlatformMetric, setSelectedPlatformMetric] = useState<'likes' | 'comments' | 'engagement' | 'videoViews' | 'posts'>('likes');

  useEffect(() => {
    fetch('/data/ReligionAllContents.json')
      .then((res) => res.json())
      .then((data: RawPost[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // ─── Aggregate Data ───
  const athletes = useMemo(() => {
    const map = new Map<string, AthleteSummary>();
    for (const post of posts) {
      const canonicalName = canonicalizeAthleteName(post.athlete.name);
      if (!map.has(canonicalName)) {
        map.set(canonicalName, {
          id: canonicalName,
          name: canonicalName,
          image: post.athlete.image,
          bio: post.athlete.bio || '',
          sport: post.athlete.sport,
          position: post.athlete.position,
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          sponsoredPosts: 0,
          avgEngagementRate: 0,
          topPost: post,
          uniqueSponsors: [],
          instagramPosts: 0,
          tiktokPosts: 0,
        });
      }
      const athlete = map.get(canonicalName)!;
      if (!athlete.bio && post.athlete.bio) athlete.bio = post.athlete.bio;
      athlete.totalPosts += 1;
      athlete.totalLikes += post.metrics.likes || 0;
      athlete.totalComments += post.metrics.comments || 0;
      athlete.totalShares += post.metrics.shares || 0;
      if (post.isSponsored) athlete.sponsoredPosts += 1;
      if (post.sponsorPartner && !athlete.uniqueSponsors.includes(post.sponsorPartner)) {
        athlete.uniqueSponsors.push(post.sponsorPartner);
      }
      if ((post.metrics.likes || 0) > (athlete.topPost.metrics.likes || 0)) {
        athlete.topPost = post;
      }
      if (post.source === 'INSTAGRAM') athlete.instagramPosts += 1;
      else if (post.source === 'TIKTOK') athlete.tiktokPosts += 1;
    }

    for (const [name, athlete] of map) {
      const athletePosts = posts.filter((p) => canonicalizeAthleteName(p.athlete.name) === name);
      const rates = athletePosts
        .map((p) => p.metrics.engagementRate)
        .filter((r) => r > 0);
      athlete.avgEngagementRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    }

    return Array.from(map.values());
  }, [posts]);

  const kpis = useMemo(() => {
    const totalLikes = posts.reduce((s, p) => s + (p.metrics.likes || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.metrics.comments || 0), 0);
    const sponsoredPosts = posts.filter((p) => p.isSponsored).length;
    const uniqueSponsors = new Set(posts.filter((p) => p.sponsorPartner).map((p) => p.sponsorPartner));
    const sports = new Set(posts.map((p) => p.athlete.sport));
    const instagramPosts = posts.filter((p) => p.source === 'INSTAGRAM').length;
    const tiktokPosts = posts.filter((p) => p.source === 'TIKTOK').length;
    const totalVideoViews = posts.reduce((s, p) => s + (p.metrics.videoViews || 0), 0);
    const rates = posts.map((p) => p.metrics.engagementRate).filter((r) => r > 0);
    const avgEngagement = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

    return {
      totalAthletes: athletes.length,
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      sponsoredPosts,
      uniqueSponsors: uniqueSponsors.size,
      sportsCount: sports.size,
      instagramPosts,
      tiktokPosts,
      totalVideoViews,
      avgEngagement,
    };
  }, [posts, athletes]);

  const sports = useMemo(() => {
    const map = new Map<string, { posts: number; athletes: Set<string> }>();
    for (const post of posts) {
      const sport = post.athlete.sport;
      if (!map.has(sport)) map.set(sport, { posts: 0, athletes: new Set() });
      const entry = map.get(sport)!;
      entry.posts += 1;
      entry.athletes.add(post.athlete._id);
    }
    return Array.from(map.entries())
      .map(([sport, data]) => ({ sport, posts: data.posts, athletes: data.athletes.size }))
      .sort((a, b) => b.posts - a.posts);
  }, [posts]);

  const dedupedPosts = useMemo(() => {
    const seen = new Set<string>();
    return posts.filter((post) => {
      const key = getUniquePostKey(post);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [posts]);

  const topPosts = useMemo(() => {
    return [...dedupedPosts].sort((a, b) => (b.metrics.likes || 0) - (a.metrics.likes || 0)).slice(0, 20);
  }, [dedupedPosts]);

  const postContribution = useMemo(() => {
    const leaders = topPosts.slice(0, 6);
    const totalLikes = leaders.reduce((sum, post) => sum + (post.metrics.likes || 0), 0);
    const totalComments = leaders.reduce((sum, post) => sum + (post.metrics.comments || 0), 0);
    const palette = ['#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#f59e0b'];

    let cursor = 0;
    const segments = leaders.map((post, index) => {
      const likes = post.metrics.likes || 0;
      const pct = totalLikes > 0 ? (likes / totalLikes) * 100 : 0;
      const start = cursor;
      const end = cursor + pct;
      cursor = end;
      return {
        post,
        likes,
        comments: post.metrics.comments || 0,
        pct,
        color: palette[index % palette.length],
        gradient: `${palette[index % palette.length]} ${start.toFixed(2)}% ${end.toFixed(2)}%`,
      };
    });

    return { leaders, totalLikes, totalComments, segments };
  }, [topPosts]);

  const sponsorAnalysis = useMemo(() => {
    const map = new Map<string, { partner: string; posts: number; likes: number; comments: number; athletes: Set<string> }>();
    for (const post of posts) {
      if (!post.isSponsored || !post.sponsorPartner) continue;
      const key = normalizePartnerKey(post.sponsorPartner);
      if (!map.has(key)) {
        map.set(key, {
          partner: post.sponsorPartner,
          posts: 0,
          likes: 0,
          comments: 0,
          athletes: new Set(),
        });
      }
      const entry = map.get(key)!;
      entry.posts += 1;
      entry.likes += post.metrics.likes || 0;
      entry.comments += post.metrics.comments || 0;
      entry.athletes.add(canonicalizeAthleteName(post.athlete.name));
    }
    return Array.from(map.entries())
      .map(([, data]) => ({
        partner: data.partner,
        displayName: formatPartnerDisplayName(data.partner),
        logoSrc: getPartnerLogoSrc(data.partner),
        posts: data.posts,
        likes: data.likes,
        comments: data.comments,
        athletes: data.athletes.size,
        avgLikes: data.posts > 0 ? data.likes / data.posts : 0,
      }))
      .sort((a, b) => b.posts - a.posts || b.likes - a.likes)
      .slice(0, 25);
  }, [posts]);

  const performancePosts = useMemo(() => {
    const scored = dedupedPosts
      .filter((p) => p.url)
      .map((p) => {
        const eng = (p.metrics.engagementRate || 0) < 1 ? (p.metrics.engagementRate || 0) * 100 : (p.metrics.engagementRate || 0);
        return { ...p, engPercent: eng };
      });
    const sorted = [...scored].sort((a, b) => b.engPercent - a.engPercent);
    return scored.map((p) => {
      const rank = sorted.findIndex((s) => s._id === p._id);
      const percentile = ((sorted.length - rank) / sorted.length) * 100;
      let label: 'Top Performer' | 'Above Average' | 'Average' | 'Below Average';
      if (percentile >= 75) label = 'Top Performer';
      else if (percentile >= 60) label = 'Above Average';
      else if (percentile >= 40) label = 'Average';
      else label = 'Below Average';
      return { ...p, percentile: Math.round(percentile), performanceLabel: label };
    });
  }, [dedupedPosts]);

  const perfBenchmarks = useMemo(() => {
    const sponsored = performancePosts.filter((p) => p.isSponsored);
    const nonSponsored = performancePosts.filter((p) => !p.isSponsored);
    const avgEng = (arr: typeof performancePosts) => arr.length > 0 ? arr.reduce((s, p) => s + p.engPercent, 0) / arr.length : 0;
    const avgLikes = (arr: typeof performancePosts) => arr.length > 0 ? arr.reduce((s, p) => s + (p.metrics.likes || 0), 0) / arr.length : 0;
    const avgComments = (arr: typeof performancePosts) => arr.length > 0 ? arr.reduce((s, p) => s + (p.metrics.comments || 0), 0) / arr.length : 0;
    const sponsoredAvg = avgEng(sponsored);
    const nonSponsoredAvg = avgEng(nonSponsored);
    const lift = nonSponsoredAvg > 0 ? ((sponsoredAvg - nonSponsoredAvg) / nonSponsoredAvg) * 100 : 0;
    const topPost = performancePosts.sort((a, b) => b.engPercent - a.engPercent)[0];
    return {
      sponsoredAvg,
      nonSponsoredAvg,
      lift,
      avgLikesSponsor: avgLikes(sponsored),
      avgLikesOrganic: avgLikes(nonSponsored),
      avgCommentsSponsor: avgComments(sponsored),
      avgCommentsOrganic: avgComments(nonSponsored),
      topPost,
      sponsoredCount: sponsored.length,
      organicCount: nonSponsored.length,
    };
  }, [performancePosts]);

  const sponsorMatrix = useMemo(() => {
    const topPartners = sponsorAnalysis.slice(0, 6);
    const partnerKeys = topPartners.map((partner) => normalizePartnerKey(partner.partner));
    const athleteRows = athletes
      .filter((athlete) => athlete.sponsoredPosts > 0)
      .sort((a, b) => b.sponsoredPosts - a.sponsoredPosts || b.totalLikes - a.totalLikes)
      .slice(0, 8)
      .map((athlete) => {
        const counts = Object.fromEntries(partnerKeys.map((key) => [key, 0]));
        posts.forEach((post) => {
          if (!post.isSponsored || !post.sponsorPartner) return;
          if (canonicalizeAthleteName(post.athlete.name) !== athlete.name) return;
          const partnerKey = normalizePartnerKey(post.sponsorPartner);
          if (partnerKey in counts) counts[partnerKey] += 1;
        });
        return { athlete, counts };
      });

    return { topPartners, athleteRows };
  }, [athletes, posts, sponsorAnalysis]);

  const engagementTiers = useMemo(() => {
    const tiers = { elite: 0, strong: 0, average: 0, developing: 0 };
    for (const a of athletes) {
      const eng = a.avgEngagementRate < 1 ? a.avgEngagementRate * 100 : a.avgEngagementRate;
      if (eng >= 5) tiers.elite++;
      else if (eng >= 2) tiers.strong++;
      else if (eng >= 1) tiers.average++;
      else tiers.developing++;
    }
    return tiers;
  }, [athletes]);

  const sportEngagement = useMemo(() => {
    const map = new Map<string, { totalEng: number; count: number; likes: number; posts: number }>();
    for (const p of posts) {
      const sport = p.athlete.sport;
      if (!map.has(sport)) map.set(sport, { totalEng: 0, count: 0, likes: 0, posts: 0 });
      const entry = map.get(sport)!;
      const eng = p.metrics.engagementRate > 0 ? (p.metrics.engagementRate < 1 ? p.metrics.engagementRate * 100 : p.metrics.engagementRate) : 0;
      if (eng > 0) { entry.totalEng += eng; entry.count++; }
      entry.likes += p.metrics.likes || 0;
      entry.posts++;
    }
    return Array.from(map.entries())
      .map(([sport, d]) => ({ sport, avgEng: d.count > 0 ? d.totalEng / d.count : 0, likes: d.likes, posts: d.posts }))
      .sort((a, b) => b.avgEng - a.avgEng);
  }, [posts]);

  const contentLeaderboards = useMemo(() => {
    const topBy = (selector: (post: typeof performancePosts[number]) => number) =>
      [...performancePosts].sort((a, b) => selector(b) - selector(a)).slice(0, 5);

    return [
      {
        id: 'engagement',
        title: 'Top 5 Engagement',
        accent: '#E2F500',
        posts: topBy((post) => post.engPercent),
        value: (post: typeof performancePosts[number]) => `${post.engPercent.toFixed(2)}%`,
        subvalue: (post: typeof performancePosts[number]) => `${formatNumber(post.metrics.likes || 0)} likes`,
        empty: false,
      },
      {
        id: 'likes',
        title: 'Top 5 Likes',
        accent: '#22c55e',
        posts: topBy((post) => post.metrics.likes || 0),
        value: (post: typeof performancePosts[number]) => formatNumber(post.metrics.likes || 0),
        subvalue: (post: typeof performancePosts[number]) => `${post.engPercent.toFixed(2)}% engagement`,
        empty: false,
      },
      {
        id: 'comments',
        title: 'Top 5 Comments',
        accent: '#60a5fa',
        posts: topBy((post) => post.metrics.comments || 0),
        value: (post: typeof performancePosts[number]) => formatNumber(post.metrics.comments || 0),
        subvalue: (post: typeof performancePosts[number]) => `${formatNumber(post.metrics.likes || 0)} likes`,
        empty: false,
      },
      {
        id: 'impressions',
        title: 'Top 5 Impressions',
        accent: '#a78bfa',
        posts: topBy((post) => post.metrics.impressions || 0),
        value: (post: typeof performancePosts[number]) => formatNumber(post.metrics.impressions || 0),
        subvalue: (post: typeof performancePosts[number]) => `${formatNumber(post.metrics.likes || 0)} likes`,
        empty: performancePosts.every((post) => (post.metrics.impressions || 0) === 0),
      },
    ] as const;
  }, [performancePosts]);

  // ─── Content Type Metrics ───
  // ─── Monthly Trend Data ───
  const monthlyTrend = useMemo(() => {
    const map = new Map<string, { likes: number; comments: number; posts: number; videoViews: number; engTotal: number; engCount: number }>();
    for (const p of posts) {
      const d = p.publishedAt?.$date || p.createdAt?.$date;
      if (!d) continue;
      const date = new Date(d);
      if (isNaN(date.getTime())) continue;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { likes: 0, comments: 0, posts: 0, videoViews: 0, engTotal: 0, engCount: 0 });
      const entry = map.get(key)!;
      entry.likes += p.metrics.likes || 0;
      entry.comments += p.metrics.comments || 0;
      entry.posts++;
      entry.videoViews += p.metrics.videoViews || 0;
      const eng = p.metrics.engagementRate || 0;
      if (eng > 0) { entry.engTotal += (eng < 1 ? eng * 100 : eng); entry.engCount++; }
    }
    return Array.from(map.entries())
      .map(([month, data]) => {
        const [y, m] = month.split('-');
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          month,
          label: `${labels[parseInt(m) - 1]} ${y.slice(2)}`,
          likes: data.likes,
          comments: data.comments,
          posts: data.posts,
          videoViews: data.videoViews,
          engagement: data.engCount > 0 ? data.engTotal / data.engCount : 0,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-8); // last 8 months
  }, [posts]);

  const avgLikesPerPost = useMemo(() => kpis.totalPosts > 0 ? Math.round(kpis.totalLikes / kpis.totalPosts) : 0, [kpis]);
  const avgCommentsPerPost = useMemo(() => kpis.totalPosts > 0 ? Math.round(kpis.totalComments / kpis.totalPosts) : 0, [kpis]);

  const contentTypeMetrics = useMemo(() => {
    const video = posts.filter((p) => p.mediaType === 'VIDEO');
    const photo = posts.filter((p) => p.mediaType === 'PHOTO');
    const avgEng = (arr: RawPost[]) => {
      const rates = arr.map((p) => p.metrics.engagementRate).filter((r) => r > 0);
      return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    };
    const avgLikes = (arr: RawPost[]) => arr.length > 0 ? arr.reduce((s, p) => s + (p.metrics.likes || 0), 0) / arr.length : 0;
    return {
      video: { count: video.length, avgEng: avgEng(video), avgLikes: avgLikes(video) },
      photo: { count: photo.length, avgEng: avgEng(photo), avgLikes: avgLikes(photo) },
    };
  }, [posts]);

  // ─── Benchmark Data ───
  const benchmarkData = useMemo(() => {
    const totalInteractions = kpis.totalLikes + kpis.totalComments;
    const emv = Math.round((kpis.totalLikes * 0.05) + (kpis.totalComments * 0.15));
    const rosMetrics = {
      name: 'Religion of Sports',
      athleteCount: athletes.length,
      totalReach: totalInteractions,
      avgEngagement: kpis.avgEngagement < 1 ? kpis.avgEngagement * 100 : kpis.avgEngagement,
      contentVolume: kpis.totalPosts,
      emv,
      color: '#ADFF2F',
    };
    const competitors = [
      { name: 'Overtime', athleteCount: 120, totalReach: 890_000_000, avgEngagement: 3.1, contentVolume: 12400, emv: 18_200_000, color: '#FF6B35' },
      { name: 'Bleacher Report', athleteCount: 85, totalReach: 1_200_000_000, avgEngagement: 1.8, contentVolume: 28000, emv: 42_000_000, color: '#00D4FF' },
      { name: 'Barstool Sports', athleteCount: 65, totalReach: 950_000_000, avgEngagement: 2.5, contentVolume: 18500, emv: 28_000_000, color: '#FF4444' },
      { name: 'House of Highlights', athleteCount: 35, totalReach: 750_000_000, avgEngagement: 2.8, contentVolume: 9200, emv: 15_000_000, color: '#FFD700' },
      { name: 'UNINTERRUPTED', athleteCount: 28, totalReach: 320_000_000, avgEngagement: 2.2, contentVolume: 4800, emv: 8_500_000, color: '#9B59B6' },
    ];
    const compAvg = {
      athleteCount: Math.round(competitors.reduce((s, c) => s + c.athleteCount, 0) / competitors.length),
      totalReach: Math.round(competitors.reduce((s, c) => s + c.totalReach, 0) / competitors.length),
      avgEngagement: competitors.reduce((s, c) => s + c.avgEngagement, 0) / competitors.length,
      contentVolume: Math.round(competitors.reduce((s, c) => s + c.contentVolume, 0) / competitors.length),
      emv: Math.round(competitors.reduce((s, c) => s + c.emv, 0) / competitors.length),
    };
    return { rosMetrics, competitors, compAvg };
  }, [athletes, kpis]);

  const filteredAthletes = useMemo(() => {
    let result = [...athletes];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (sportFilter !== 'all') {
      result = result.filter((a) => a.sport === sportFilter);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'likes': return b.totalLikes - a.totalLikes;
        case 'posts': return b.totalPosts - a.totalPosts;
        case 'engagement': return b.avgEngagementRate - a.avgEngagementRate;
        case 'sponsored': return b.sponsoredPosts - a.sponsoredPosts;
      }
    });
    if (!showAllAthletes) result = result.slice(0, 12);
    return result;
  }, [athletes, searchQuery, sortBy, sportFilter, showAllAthletes]);


  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
          <p className="text-white/40 text-sm tracking-[0.2em] uppercase">Loading roster data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ═══ HEADER ═══ */}
      <div className="border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              {onBack && (
                <button onClick={onBack} className="text-white/30 hover:text-white transition-colors duration-300">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <div>
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.3em] mb-2">Brand Impact Report</p>
                <div className="flex items-center gap-5">
                  {/* ROS Logo */}
                  <img src="/religion_of_sports_logo.png" alt="Religion of Sports" className="h-16 w-auto flex-shrink-0" />
                  <h1 className="text-[2rem] font-black tracking-tight text-white/92">RELIGION OF SPORTS</h1>
                </div>
                <p className="text-white/30 text-sm mt-2">Roster Performance & Content Analytics</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-sm font-light">{kpis.totalAthletes} Athletes</p>
              <p className="text-white/30 text-xs">{kpis.totalPosts.toLocaleString()} Posts Analyzed</p>
            </div>
          </div>

          {/* ─── Tab Navigation ─── */}
          <div className="flex gap-1 mt-8 flex-wrap">
            {(['overview', 'content', 'talent', 'benchmark', 'sponsors'] as const).map((tab) => {
              const labels: Record<string, string> = { 'overview': 'Overview', 'content': 'Content', 'talent': 'Talent', 'benchmark': 'Benchmark', 'sponsors': 'Partnerships' };
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'text-white border-white'
                      : 'text-white/30 border-transparent hover:text-white/60'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-10">
        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Platform Header */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src="/religion_of_sports_logo.png" alt="Religion of Sports" className="h-14 w-auto flex-shrink-0 rounded-xl" />
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-white/90">RELIGION OF SPORTS</h2>
                    <span className="px-2 py-0.5 rounded bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[9px] font-bold uppercase tracking-wider">Sports Media</span>
                  </div>
                </div>
                {/* Platform + Time Range */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-400/15 border border-lime-400/30">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-lime-400" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                    <span className="text-lime-400 text-[11px] font-bold uppercase tracking-wider">Instagram</span>
                  </div>
                  <span className="text-white/20 text-xs">·</span>
                  <div className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-white/50 text-[11px] font-medium">
                    Last 90 days
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-tabs: METRICS / AUDIENCE / AI INSIGHTS */}
            <div className="flex items-center gap-2">
              {(['metrics', 'audience', 'ai-insights'] as const).map((tab) => {
                const labels = { metrics: 'METRICS', audience: 'AUDIENCE', 'ai-insights': 'AI INSIGHTS' };
                return (
                  <button
                    key={tab}
                    onClick={() => setOverviewSubTab(tab)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      overviewSubTab === tab
                        ? 'bg-lime-400/15 border border-lime-400/30 text-lime-400'
                        : 'bg-white/[0.03] border border-white/10 text-white/40 hover:text-white/60'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* METRICS Sub-tab */}
            {overviewSubTab === 'metrics' && (
              <div className="space-y-8">
                {/* 4 KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Followers', value: formatNumber(TOTAL_ROSTER_FOLLOWERS), subtitle: `Across ${kpis.totalAthletes} athletes`, change: '+12.4%', icon: Users },
                    { label: 'Engagement Rate', value: formatPercent(kpis.avgEngagement), subtitle: `Across ${kpis.totalPosts.toLocaleString()} posts`, change: '+3.2%', icon: TrendingUp },
                    { label: 'Avg Likes', value: formatNumber(avgLikesPerPost), subtitle: 'Per post average', change: '+8.7%', icon: Heart },
                    { label: 'Avg Comments', value: formatNumber(avgCommentsPerPost), subtitle: 'Per post average', change: '+5.1%', icon: MessageCircle },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-lime-400/20 transition-all duration-300 cursor-pointer group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-lime-400/[0.08] flex items-center justify-center">
                          <kpi.icon className="w-4.5 h-4.5 text-lime-400/70" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{kpi.change}</span>
                      </div>
                      <p className="text-2xl font-black text-white mb-0.5 group-hover:text-lime-400 transition-colors duration-300">{kpi.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">{kpi.label}</p>
                      <p className="text-[9px] text-white/20 mt-0.5">{kpi.subtitle}</p>
                    </div>
                  ))}
                </div>

                {/* Platform Performance + Trending Chart */}
                {(() => {
                  const metricRows = [
                    { key: 'likes' as const, label: 'Total Likes', value: formatNumber(kpis.totalLikes), subtitle: `${kpis.totalPosts.toLocaleString()} posts analyzed`, change: '+14.2%', color: '#E2F500', chartTitle: 'Total Likes' },
                    { key: 'comments' as const, label: 'Total Comments', value: formatNumber(kpis.totalComments), subtitle: `${kpis.totalPosts.toLocaleString()} posts analyzed last 90 days`, change: '+8.6%', color: '#4ADE80', chartTitle: 'Total Comments' },
                    { key: 'engagement' as const, label: 'Engagement Rate', value: formatPercent(kpis.avgEngagement), subtitle: `Across ${kpis.totalPosts.toLocaleString()} posts last 90 days`, change: '+3.2%', color: '#A78BFA', chartTitle: 'Engagement Rate' },
                    { key: 'videoViews' as const, label: 'Video Views', value: formatNumber(kpis.totalVideoViews), subtitle: 'Video post view total', change: kpis.totalVideoViews > 0 ? '+6.1%' : 'No source data', color: '#38BDF8', chartTitle: 'Video Views' },
                    { key: 'posts' as const, label: 'Posts Analyzed', value: kpis.totalPosts.toLocaleString(), subtitle: 'Instagram last 90 days', change: `${kpis.totalAthletes} athletes`, color: '#F472B6', chartTitle: 'Posts Analyzed' },
                  ];
                  const activeMetric = metricRows.find((r) => r.key === selectedPlatformMetric) || metricRows[0];
                  const trendValues = monthlyTrend.map((m) => {
                    if (selectedPlatformMetric === 'likes') return m.likes;
                    if (selectedPlatformMetric === 'comments') return m.comments;
                    if (selectedPlatformMetric === 'engagement') return m.engagement;
                    if (selectedPlatformMetric === 'videoViews') return m.videoViews;
                    return m.posts;
                  });
                  const formatVal = (v: number) => {
                    if (selectedPlatformMetric === 'engagement') return v.toFixed(2) + '%';
                    return formatNumber(Math.round(v));
                  };

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Platform Performance List */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Platform Performance</h3>
                          <span className="text-[9px] text-white/20 uppercase tracking-wider">Instagram · Last 90 days</span>
                        </div>
                        <div className="space-y-1">
                          {metricRows.map((row) => {
                            const isActive = selectedPlatformMetric === row.key;
                            return (
                              <div
                                key={row.key}
                                onClick={() => setSelectedPlatformMetric(row.key)}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                                  isActive
                                    ? 'bg-white/[0.06] border border-white/10'
                                    : 'hover:bg-white/[0.03] border border-transparent'
                                }`}
                              >
                                <div
                                  className="w-1 h-8 rounded-full flex-shrink-0 transition-opacity duration-200"
                                  style={{ background: row.color, opacity: isActive ? 1 : 0.35 }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/60'}`}>{row.label}</span>
                                    {row.change !== '—' && !row.change.includes('athletes') && (
                                      <span className={`text-[9px] font-bold transition-opacity duration-200 ${isActive ? 'text-emerald-400' : 'text-emerald-400/50'}`}>{row.change}</span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-white/25 mt-0.5 truncate">{row.subtitle}</p>
                                </div>
                                <span className={`font-black text-lg tabular-nums transition-colors duration-200 ${isActive ? 'text-white' : 'text-white/50'}`}>{row.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Trending Chart */}
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="flex items-center justify-between mb-5">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full">Trending</span>
                              {activeMetric.change !== '—' && !activeMetric.change.includes('athletes') && (
                                <span className="text-[9px] font-bold text-emerald-400">{activeMetric.change}</span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-white">{activeMetric.chartTitle}</h3>
                          </div>
                        </div>
                        {monthlyTrend.length > 1 ? (() => {
                          const maxVal = Math.max(...trendValues);
                          const minVal = Math.min(...trendValues);
                          const range = maxVal - minVal || 1;
                          const chartW = 460;
                          const chartH = 200;
                          const padX = 45;
                          const padY = 20;
                          const plotW = chartW - padX * 2;
                          const plotH = chartH - padY * 2;
                          const points = monthlyTrend.map((m, i) => ({
                            x: padX + (i / (monthlyTrend.length - 1)) * plotW,
                            y: padY + plotH - ((trendValues[i] - minVal) / range) * plotH,
                            ...m,
                            val: trendValues[i],
                          }));
                          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                          const areaPath = `${linePath} L${points[points.length - 1].x},${padY + plotH} L${points[0].x},${padY + plotH} Z`;
                          const strokeColor = activeMetric.color;
                          return (
                            <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-auto">
                              <defs>
                                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
                                </linearGradient>
                              </defs>
                              {/* Y-axis labels */}
                              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                                const val = minVal + range * (1 - pct);
                                const y = padY + plotH * pct;
                                return (
                                  <g key={pct}>
                                    <line x1={padX} y1={y} x2={padX + plotW} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                    <text x={padX - 5} y={y + 3} textAnchor="end" fill="rgba(255,255,255,0.2)" fontSize="8" fontFamily="system-ui">{formatVal(val)}</text>
                                  </g>
                                );
                              })}
                              {/* Area fill */}
                              <path d={areaPath} fill="url(#trendGrad)" />
                              {/* Line */}
                              <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                              {/* Data points */}
                              {points.map((p, i) => (
                                <g key={i}>
                                  <circle cx={p.x} cy={p.y} r="4" fill="#0a0a0a" stroke={strokeColor} strokeWidth="2" />
                                  <text x={p.x} y={chartH + 15} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="system-ui">{p.label}</text>
                                </g>
                              ))}
                            </svg>
                          );
                        })() : (
                          <div className="flex items-center justify-center h-48 text-white/20 text-sm">Insufficient data for trend chart</div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Top Posts Overview */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <style>{`
                    .ros-top-posts-scroll {
                      scrollbar-width: thin;
                      scrollbar-color: rgba(190, 242, 100, 0.7) rgba(255, 255, 255, 0.06);
                    }
                    .ros-top-posts-scroll::-webkit-scrollbar {
                      height: 10px;
                    }
                    .ros-top-posts-scroll::-webkit-scrollbar-track {
                      background: rgba(255, 255, 255, 0.05);
                      border-radius: 999px;
                    }
                    .ros-top-posts-scroll::-webkit-scrollbar-thumb {
                      background: linear-gradient(90deg, rgba(163, 230, 53, 0.55), rgba(226, 245, 0, 0.95));
                      border-radius: 999px;
                      border: 1px solid rgba(255, 255, 255, 0.08);
                      box-shadow: 0 0 14px rgba(226, 245, 0, 0.18);
                    }
                    .ros-top-posts-scroll::-webkit-scrollbar-thumb:hover {
                      background: linear-gradient(90deg, rgba(163, 230, 53, 0.75), rgba(226, 245, 0, 1));
                    }
                  `}</style>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Posts</h3>
                    <span className="text-[9px] text-white/20 uppercase tracking-wider">{kpis.totalPosts.toLocaleString()} posts · {formatNumber(kpis.totalLikes)} total likes</span>
                  </div>
                  <div className="ros-top-posts-scroll flex gap-4 overflow-x-auto pb-3 pr-1">
                    {topPosts.slice(0, 8).map((post) => {
                      const likes = post.metrics.likes || 0;
                      const comments = post.metrics.comments || 0;
                      const publishedAt = post.publishedAt?.$date || post.createdAt?.$date;
                      return (
                        <a
                          key={post._id}
                          href={post.permalink || undefined}
                          target={post.permalink ? '_blank' : undefined}
                          rel={post.permalink ? 'noreferrer' : undefined}
                          className="group min-w-[240px] max-w-[240px] rounded-2xl overflow-hidden border border-white/10 bg-black/40 hover:border-lime-400/30 transition-all duration-200"
                        >
                          <div className="relative aspect-[4/5] bg-white/5 overflow-hidden">
                            {post.url ? (
                              <img
                                src={post.url}
                                alt={getPostHeadline(post)}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-white/5" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/70 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-lime-400">
                              {post.mediaType || post.source}
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-lime-400 transition-colors duration-200">
                              {getPostHeadline(post)}
                            </p>
                            <p className="text-white/30 text-[10px] mt-2 truncate">
                              {canonicalizeAthleteName(post.athlete.name)} · {formatSport(post.athlete.sport)}{publishedAt ? ` · ${formatShortDate(publishedAt)}` : ''}
                            </p>
                            <div className="flex items-center justify-between mt-4 text-[11px]">
                              <div>
                                <p className="text-white font-bold">{formatNumber(likes)}</p>
                                <p className="text-white/25 uppercase tracking-wider">Likes</p>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">{formatNumber(comments)}</p>
                                <p className="text-white/25 uppercase tracking-wider">Comments</p>
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Top Athletes Preview */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Top Athletes</h3>
                    <button onClick={() => setActiveTab('talent')} className="text-white/40 text-sm font-medium hover:text-white transition-colors duration-300">View All →</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...athletes].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 4).map((athlete) => (
                      <AthleteCard key={athlete.id} athlete={athlete} />
                    ))}
                  </div>
                </div>

                {/* Post Contribution */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Post Contribution</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/35">Sports Media • {postContribution.leaders.length} posts</span>
                      <div className="flex rounded-lg border border-white/10 overflow-hidden">
                        <div className="px-3 py-1 bg-lime-400 text-black text-[10px] font-bold uppercase tracking-wider">Likes</div>
                        <div className="px-3 py-1 bg-white/[0.03] text-white/40 text-[10px] font-bold uppercase tracking-wider">Comments</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/20 min-h-[360px] flex flex-col items-center justify-center p-6">
                      <div
                        className="relative w-52 h-52 rounded-full"
                        style={{
                          background: `conic-gradient(${postContribution.segments.map((segment) => segment.gradient).join(', ')})`,
                        }}
                      >
                        <div className="absolute inset-[22px] rounded-full bg-[#0a0a0a] border border-white/5 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black text-white">{formatNumber(postContribution.totalLikes)}</span>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 mt-1">Likes</span>
                        </div>
                      </div>
                      <p className="text-white/35 text-sm mt-6">
                        Likes {formatNumber(postContribution.totalLikes)} • Comments {formatNumber(postContribution.totalComments)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="divide-y divide-white/5">
                        {postContribution.segments.map((segment, index) => (
                          <div key={segment.post._id} className="grid grid-cols-[20px_14px_1fr_88px] gap-3 items-start py-4">
                            <span className="text-white/20 text-xs font-mono text-right pt-1">{index + 1}</span>
                            <span className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ background: segment.color }} />
                            <div className="min-w-0">
                              <p className="text-white text-sm font-semibold truncate">{getPostHeadline(segment.post)}</p>
                              <p className="text-white/30 text-[11px] mt-1 truncate">
                                Likes {formatNumber(segment.likes)} • Comments {formatNumber(segment.comments)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold text-sm">{formatNumber(segment.likes)}</p>
                              <p className="text-white/30 text-[11px]">{segment.pct.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-3 mt-4 text-white/30 text-xs">
                        <button className="w-6 h-6 rounded border border-white/10 hover:border-white/20 transition-colors">{'<'}</button>
                        <span>1–{postContribution.segments.length} of {kpis.totalPosts}</span>
                        <button className="w-6 h-6 rounded border border-white/10 hover:border-white/20 transition-colors">{'>'}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AUDIENCE Sub-tab */}
            {overviewSubTab === 'audience' && (() => {
              const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
              const dayCounts = [0, 0, 0, 0, 0, 0, 0];
              const hourCounts = Array(24).fill(0);
              posts.forEach((p) => {
                const d = new Date(p.publishedAt?.$date || p.createdAt.$date);
                dayCounts[d.getDay()]++;
                hourCounts[d.getHours()]++;
              });
              const maxDay = Math.max(...dayCounts);
              const bestDayIdx = dayCounts.indexOf(maxDay);
              const maxHour = Math.max(...hourCounts);
              const bestHourIdx = hourCounts.indexOf(maxHour);
              const hourLabel = (h: number) => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;

              const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','it','this','that','was','are','be','has','had','have','will','would','could','should','been','not','no','so','if','my','me','we','our','you','your','they','their','he','she','his','her','its','do','did','can','just','more','out','up','all','about','one','i','im','get','got','like','dont','than','over','into','only','also','now','new','what','when','how','who','which','where','some','them','these','those','then','each','other','very','most','much','after','before','here','there','back','first','last','way','may','even','still','us','de','la','el','en','es','un','que','por','con','los','las','del','al','lo','se','le','una','como','para','nos','te','mi','tu','su','ya']);
              const wordMap: Record<string, number> = {};
              const hashMap: Record<string, number> = {};

              posts.forEach((p) => {
                if (!p.caption) return;
                const tags = p.caption.match(/#\w+/g);
                tags?.forEach((t) => { hashMap[t.toLowerCase()] = (hashMap[t.toLowerCase()] || 0) + 1; });
                p.caption
                  .replace(/@\w+/g, '')
                  .replace(/#\w+/g, '')
                  .replace(/https?:\/\/\S+/g, '')
                  .replace(/[^a-zA-Z\s]/g, '')
                  .toLowerCase()
                  .split(/\s+/)
                  .filter((w) => w.length > 3 && !stopWords.has(w))
                  .forEach((w) => { wordMap[w] = (wordMap[w] || 0) + 1; });
              });

              const topWords = Object.entries(wordMap).sort((a, b) => b[1] - a[1]).slice(0, 20);
              const maxWordCount = topWords[0]?.[1] || 1;
              const topHashtags = Object.entries(hashMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
              const sportRows = Object.entries(
                posts.reduce<Record<string, number>>((acc, post) => {
                  const sport = formatSport(post.athlete.sport);
                  acc[sport] = (acc[sport] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 5);
              const topSportCount = sportRows[0]?.[1] || 1;

              return (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-lime-400/20 bg-lime-400/[0.04] p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-5 h-5 text-lime-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-lime-400/60 mb-1">Dataset Insight</p>
                      <p className="text-white text-sm">This audience view is limited to dataset-backed timing and caption signals. Posting activity peaks on <strong className="text-white italic">{dayNames[bestDayIdx]}s</strong> around <strong className="text-white italic">{hourLabel(bestHourIdx)}</strong>.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-4">Best Days to Post</p>
                      <div className="flex items-end gap-1.5 h-24">
                        {dayNames.map((day, i) => (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full rounded-md ${i === bestDayIdx ? 'bg-lime-400' : 'bg-white/10'}`} style={{ height: `${maxDay > 0 ? (dayCounts[i] / maxDay) * 100 : 0}%`, minHeight: '4px' }} />
                            <span className={`text-[9px] font-bold uppercase ${i === bestDayIdx ? 'text-lime-400' : 'text-white/30'}`}>{day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-4">Peak Activity Hours</p>
                      <div className="flex items-end gap-0.5 h-24">
                        {[6, 9, 12, 15, 18, 21, 0].map((h) => (
                          <div key={h} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full rounded-md ${h === bestHourIdx || (h <= bestHourIdx && bestHourIdx < h + 3) ? 'bg-lime-400' : 'bg-white/10'}`} style={{ height: `${maxHour > 0 ? (hourCounts[h] / maxHour) * 100 : 0}%`, minHeight: '4px' }} />
                            <span className={`text-[9px] font-bold ${h === bestHourIdx || (h <= bestHourIdx && bestHourIdx < h + 3) ? 'text-lime-400' : 'text-white/30'}`}>{hourLabel(h)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-5">Top Hashtags</p>
                      <div className="space-y-4">
                        {topHashtags.length > 0 ? topHashtags.map(([tag, count]) => (
                          <div key={tag}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-white/80 text-sm font-medium">{tag}</span>
                              <span className="text-lime-400 font-bold text-sm">{count}</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-lime-400" style={{ width: `${topHashtags[0] ? (count / topHashtags[0][1]) * 100 : 0}%` }} />
                            </div>
                          </div>
                        )) : (
                          <p className="text-white/30 text-sm">No hashtag data available in the imported captions.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Sport Coverage</p>
                      <p className="text-[10px] text-white/20 mb-5">Post volume by athlete sport from the imported dataset</p>
                      <div className="space-y-3">
                        {sportRows.map(([sport, count]) => (
                          <div key={sport}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-white/80 text-sm">{sport}</span>
                              <span className="text-lime-400 font-bold text-sm">{count.toLocaleString()} posts</span>
                            </div>
                            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-lime-400" style={{ width: `${(count / topSportCount) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Word Cloud</p>
                      <p className="text-[10px] text-white/20 mb-5">Most common words in post captions</p>
                      <div className="rounded-xl bg-black/40 border border-white/5 p-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                        {topWords.map(([word, count], i) => {
                          const size = 0.8 + (count / maxWordCount) * 2.2;
                          const opacity = 0.4 + (count / maxWordCount) * 0.6;
                          return (
                            <span
                              key={word}
                              className="font-black italic transition-all hover:text-lime-300"
                              style={{
                                fontSize: `${size}rem`,
                                color: `rgba(226, 245, 0, ${opacity})`,
                                transform: i % 3 === 1 ? 'rotate(-2deg)' : i % 3 === 2 ? 'rotate(1deg)' : 'none',
                              }}
                            >
                              {word.charAt(0).toUpperCase() + word.slice(1)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* AI INSIGHTS Sub-tab */}
            {overviewSubTab === 'ai-insights' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'Content Strategy',
                      insight: `Video content drives ${formatPercent(contentTypeMetrics.video.avgEng)} engagement vs ${formatPercent(contentTypeMetrics.photo.avgEng)} for photos. Consider increasing video content production to capitalize on ${((contentTypeMetrics.video.avgEng / (contentTypeMetrics.photo.avgEng || 1)) * 100 - 100).toFixed(0)}% higher engagement.`,
                      type: 'strategy',
                      icon: TrendingUp,
                    },
                    {
                      title: 'Sponsorship Optimization',
                      insight: `${kpis.sponsoredPosts} sponsored posts across ${kpis.uniqueSponsors} brand partners. ${perfBenchmarks.lift > 0 ? `Sponsored content shows +${perfBenchmarks.lift.toFixed(1)}% engagement lift — audiences respond positively to brand partnerships.` : `Organic content outperforms sponsored by ${Math.abs(perfBenchmarks.lift).toFixed(1)}% — consider more authentic integration strategies.`}`,
                      type: 'sponsorship',
                      icon: Star,
                    },
                    {
                      title: 'Top Performer Analysis',
                      insight: `The roster's top athlete averages ${formatNumber(Math.round(athletes.sort((a, b) => b.totalLikes - a.totalLikes)[0]?.totalLikes / (athletes.sort((a, b) => b.totalLikes - a.totalLikes)[0]?.totalPosts || 1) || 0))} likes per post. Elite tier athletes (${engagementTiers.elite} athletes with 5%+ engagement) represent ${((engagementTiers.elite / athletes.length) * 100).toFixed(0)}% of the roster.`,
                      type: 'performance',
                      icon: Award,
                    },
                    {
                      title: 'Growth Opportunity',
                      insight: `${kpis.sportsCount} sports represented across ${kpis.totalAthletes} athletes. ${sportEngagement[0] ? `${formatSport(sportEngagement[0].sport)} leads engagement at ${sportEngagement[0].avgEng.toFixed(2)}%. Expanding athlete roster in high-engagement sports could amplify brand reach.` : 'Diversifying sport coverage could expand audience reach.'}`,
                      type: 'growth',
                      icon: BarChart3,
                    },
                  ].map((card) => (
                    <div key={card.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-lime-400/20 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-lime-400/[0.08] flex items-center justify-center">
                          <card.icon className="w-5 h-5 text-lime-400/70" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">{card.title}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-lime-400/50">AI-Powered</span>
                        </div>
                      </div>
                      <p className="text-white/50 text-sm leading-relaxed">{card.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ BENCHMARK TAB ═══ */}
        {activeTab === 'benchmark' && (() => {
          const { rosMetrics: ros, competitors, compAvg } = benchmarkData;
          const selected = competitors.find((c) => c.name === selectedCompetitor) || null;
          const metrics = [
            { label: 'Athlete Count', key: 'athleteCount' as const, rosVal: ros.athleteCount, avgVal: compAvg.athleteCount, format: (v: number) => v.toString(), icon: Users },
            { label: 'Total Reach', key: 'totalReach' as const, rosVal: ros.totalReach, avgVal: compAvg.totalReach, format: formatNumber, icon: Globe },
            { label: 'Avg Engagement', key: 'avgEngagement' as const, rosVal: ros.avgEngagement, avgVal: compAvg.avgEngagement, format: (v: number) => v.toFixed(2) + '%', icon: TrendingUp },
            { label: 'Content Volume', key: 'contentVolume' as const, rosVal: ros.contentVolume, avgVal: compAvg.contentVolume, format: (v: number) => formatNumber(v), icon: BarChart3 },
            { label: 'Est. Media Value', key: 'emv' as const, rosVal: ros.emv, avgVal: compAvg.emv, format: (v: number) => '$' + formatNumber(v), icon: Zap },
          ];
          // Radar chart helpers
          const radarKeys = ['athleteCount', 'totalReach', 'avgEngagement', 'contentVolume', 'emv'] as const;
          const radarLabels = ['Athletes', 'Reach', 'Engagement', 'Volume', 'EMV'];
          const allEntities = [ros, ...competitors];
          const maxVals = radarKeys.map((k) => Math.max(...allEntities.map((e) => e[k])));
          const normalize = (entity: typeof ros, i: number) => maxVals[i] > 0 ? entity[radarKeys[i]] / maxVals[i] : 0;
          const cx = 150, cy = 150, r = 110;
          const pointCount = radarKeys.length;
          const toXY = (angle: number, pct: number) => ({ x: cx + r * pct * Math.cos(angle - Math.PI / 2), y: cy + r * pct * Math.sin(angle - Math.PI / 2) });
          const toPoints = (entity: typeof ros) => radarKeys.map((_, i) => toXY((2 * Math.PI * i) / pointCount, normalize(entity, i))).map((p) => `${p.x},${p.y}`).join(' ');
          const compareName = selected ? selected.name : 'Peer Average';
          const metricComparisons = metrics.map((m) => {
            const compareVal = selected ? selected[m.key] : m.avgVal;
            const delta = compareVal > 0 ? ((m.rosVal - compareVal) / compareVal) * 100 : 0;
            return {
              ...m,
              compareVal,
              delta,
              stronger: delta >= 0,
            };
          });
          const outperformers = [...metricComparisons].sort((a, b) => b.delta - a.delta).slice(0, 2);
          const underperformers = [...metricComparisons].sort((a, b) => a.delta - b.delta).slice(0, 2);
          const headlineSignal = outperformers[0];
          const benchmarkTone = headlineSignal && headlineSignal.delta >= 0 ? 'Strong Performer' : 'Needs Improvement';

          return (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">COMPETITIVE BENCHMARK</h2>
                <p className="text-white/30 text-sm mt-1">Compare Religion of Sports against leading sports media brands</p>
              </div>

              {/* Competitor Pills */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedCompetitor(null)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${!selectedCompetitor ? 'bg-lime-400 text-black' : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/60'}`}>All Competitors</button>
                {competitors.map((c) => (
                  <button key={c.name} onClick={() => setSelectedCompetitor(c.name === selectedCompetitor ? null : c.name)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 border ${selectedCompetitor === c.name ? 'text-black' : 'bg-white/5 text-white/40 border-white/10 hover:text-white/60'}`}
                    style={selectedCompetitor === c.name ? { background: c.color, borderColor: c.color } : {}}>
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Benchmark Summary */}
              <div className="rounded-[28px] border border-lime-400/18 bg-[linear-gradient(180deg,rgba(22,20,31,0.98),rgba(16,16,18,0.96))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5 mb-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-lime-400/12 border border-lime-400/18 flex items-center justify-center text-lime-300 font-black text-xl">1</div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-white tracking-tight">Benchmark Summary</h3>
                        <span className="px-3 py-1 rounded-full border border-lime-400/20 bg-lime-400/10 text-[10px] font-bold uppercase tracking-[0.18em] text-lime-300">{benchmarkTone}</span>
                      </div>
                      <p className="text-white/65 text-sm mt-2 max-w-2xl">
                        Religion of Sports compared against {compareName.toLowerCase()}. Best relative strength: {headlineSignal?.label.toLowerCase()} at {headlineSignal ? `${headlineSignal.delta >= 0 ? '+' : ''}${headlineSignal.delta.toFixed(1)}%` : '0%'}.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white/20 text-[10px] uppercase tracking-[0.18em]">Comparison Scope</p>
                    <p className="text-white font-bold mt-1">{compareName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {metricComparisons.slice(0, 4).map((m) => (
                    <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <m.icon className="w-4 h-4 text-lime-400/70" />
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">{m.label}</span>
                      </div>
                      <div className="flex items-end gap-3">
                        <p className="text-2xl font-black text-white">{m.format(m.rosVal)}</p>
                        <span className={`text-xs font-bold mb-1 ${m.stronger ? 'text-emerald-400' : 'text-orange-400'}`}>{m.stronger ? '+' : ''}{m.delta.toFixed(1)}%</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/25">
                          <span>Religion of Sports</span>
                          <span>{m.format(m.rosVal)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-lime-400" style={{ width: `${Math.min(100, Math.max(8, (m.rosVal / (Math.max(m.rosVal, m.compareVal) || 1)) * 100))}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/20">
                          <span>{compareName}</span>
                          <span>{m.format(m.compareVal)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full rounded-full bg-white/30" style={{ width: `${Math.min(100, Math.max(8, (m.compareVal / (Math.max(m.rosVal, m.compareVal) || 1)) * 100))}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Cards */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-lime-400/12 border border-lime-400/18 flex items-center justify-center text-lime-300 font-black text-xl">2</div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Outperforming Drivers</h3>
                      <p className="text-white/55 text-sm mt-2">Metrics where Religion of Sports leads {compareName.toLowerCase()}.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {outperformers.map((m) => (
                      <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white">{m.label}</span>
                          <span className="text-emerald-400 text-sm font-black">+{m.delta.toFixed(1)}%</span>
                        </div>
                        <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/25">
                              <span>Religion of Sports</span>
                              <span>{m.format(m.rosVal)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-lime-400" style={{ width: `${Math.min(100, Math.max(10, (m.rosVal / (Math.max(m.rosVal, m.compareVal) || 1)) * 100))}%` }} /></div>
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/20">
                              <span>{compareName}</span>
                              <span>{m.format(m.compareVal)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-white/35" style={{ width: `${Math.min(100, Math.max(10, (m.compareVal / (Math.max(m.rosVal, m.compareVal) || 1)) * 100))}%` }} /></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-400/10 border border-orange-400/18 flex items-center justify-center text-orange-300 font-black text-xl">3</div>
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Gap Analysis</h3>
                      <p className="text-white/55 text-sm mt-2">Metrics where Religion of Sports trails {compareName.toLowerCase()} most materially.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {underperformers.map((m) => (
                      <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white">{m.label}</span>
                          <span className="text-orange-400 text-sm font-black">{m.delta.toFixed(1)}%</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/25">
                            <span>Religion of Sports</span>
                            <span>{m.format(m.rosVal)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-lime-400" style={{ width: `${Math.min(100, Math.max(10, (m.rosVal / (Math.max(m.rosVal, m.compareVal) || 1)) * 100))}%` }} /></div>
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-white/20">
                            <span>{compareName}</span>
                            <span>{m.format(m.compareVal)}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-white/35" style={{ width: `${Math.min(100, Math.max(10, (m.compareVal / (Math.max(m.rosVal, m.compareVal) || 1)) * 100))}%` }} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Radar + Competitor Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SVG Radar */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Performance Radar</h3>
                  <svg viewBox="0 0 300 300" className="w-full max-w-[400px] mx-auto">
                    {/* Grid lines */}
                    {[0.25, 0.5, 0.75, 1].map((pct) => (
                      <polygon key={pct} points={Array.from({ length: pointCount }, (_, i) => toXY((2 * Math.PI * i) / pointCount, pct)).map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    ))}
                    {/* Axis lines */}
                    {Array.from({ length: pointCount }, (_, i) => {
                      const p = toXY((2 * Math.PI * i) / pointCount, 1);
                      return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
                    })}
                    {/* Axis labels */}
                    {radarLabels.map((label, i) => {
                      const p = toXY((2 * Math.PI * i) / pointCount, 1.18);
                      return <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="bold">{label}</text>;
                    })}
                    {/* Competitor polygon */}
                    {selected && <polygon points={toPoints(selected)} fill={selected.color + '20'} stroke={selected.color} strokeWidth="2" />}
                    {/* ROS polygon */}
                    <polygon points={toPoints(ros)} fill="rgba(173,255,47,0.15)" stroke="#ADFF2F" strokeWidth="2" />
                    {/* ROS dots */}
                    {radarKeys.map((_, i) => { const p = toXY((2 * Math.PI * i) / pointCount, normalize(ros, i)); return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ADFF2F" />; })}
                  </svg>
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-lime-400" /><span className="text-white/50 text-xs">Religion of Sports</span></div>
                    {selected && <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: selected.color }} /><span className="text-white/50 text-xs">{selected.name}</span></div>}
                  </div>
                </div>

                {/* Competitor Cards */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">Competitors</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {competitors.map((c) => (
                      <div key={c.name} onClick={() => setSelectedCompetitor(c.name === selectedCompetitor ? null : c.name)}
                        className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:bg-white/[0.05] ${selectedCompetitor === c.name ? 'border-white/30 bg-white/[0.05]' : 'border-white/10 bg-white/[0.03]'}`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-2 h-8 rounded-full" style={{ background: c.color }} />
                          <span className="text-white font-bold text-sm">{c.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div><p className="text-white font-black">{c.athleteCount}</p><p className="text-white/30 text-[9px] uppercase">Athletes</p></div>
                          <div><p className="text-white font-black">{c.avgEngagement.toFixed(1)}%</p><p className="text-white/30 text-[9px] uppercase">Eng</p></div>
                          <div><p className="text-white font-black">${formatNumber(c.emv)}</p><p className="text-white/30 text-[9px] uppercase">EMV</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ ATHLETES TAB ═══ */}
        {activeTab === 'talent' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search athletes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all duration-300"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer"
              >
                <option value="likes" className="bg-black">Sort by Likes</option>
                <option value="posts" className="bg-black">Sort by Posts</option>
                <option value="engagement" className="bg-black">Sort by Engagement</option>
                <option value="sponsored" className="bg-black">Sort by Sponsored</option>
              </select>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none cursor-pointer"
              >
                <option value="all" className="bg-black">All Sports</option>
                {sports.map((s) => (
                  <option key={s.sport} value={s.sport} className="bg-black">{formatSport(s.sport)}</option>
                ))}
              </select>
            </div>

            {/* Athlete Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAthletes.map((athlete) => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>

            {!showAllAthletes && athletes.length > 12 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllAthletes(true)}
                  className="px-8 py-3 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/5 hover:border-white/40 transition-all duration-300"
                >
                  Show All {athletes.length} Athletes
                </button>
              </div>
            )}
            {showAllAthletes && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowAllAthletes(false)}
                  className="px-8 py-3 border border-white/10 text-white/50 rounded-xl text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-300"
                >
                  Show Top 12
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ POSTS TAB ═══ */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {contentLeaderboards.map((board) => (
                <div key={board.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{board.title}</h3>
                    {board.empty && (
                      <span className="text-[9px] uppercase tracking-[0.15em] text-white/25">No Source Data</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {board.posts.map((post, index) => (
                      <div key={`${board.id}-${post._id}`} className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03] transition-colors duration-200">
                        <span className="text-white/20 text-xs font-mono w-4 text-right pt-1">{index + 1}</span>
                        <div className="w-11 h-11 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                          {post.url ? (
                            <img
                              src={post.url}
                              alt={getPostHeadline(post)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/10">
                              <Eye className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-semibold truncate">{getPostHeadline(post)}</p>
                          <p className="text-white/30 text-[11px] mt-0.5 truncate">{canonicalizeAthleteName(post.athlete.name)} · {formatSport(post.athlete.sport)}</p>
                        </div>
                        <div className="text-right flex-shrink-0 min-w-[84px]">
                          <p className="text-sm font-black" style={{ color: board.accent }}>{board.value(post)}</p>
                          <p className="text-white/25 text-[10px] mt-0.5">{board.subvalue(post)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Post Cards Grid */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Top Posts by Likes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {topPosts.map((post, i) => (
                  <PostCard key={post._id} post={post} rank={i + 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SPONSORS TAB ═══ */}
        {activeTab === 'sponsors' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">PARTNERSHIPS</h2>
              <p className="text-white/30 text-sm mt-1">A logo-first view of branded activity, athlete activation, and sponsored content performance.</p>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: 'Branded Posts',
                  value: formatNumber(kpis.sponsoredPosts),
                  sub: `${((kpis.sponsoredPosts / Math.max(1, kpis.totalPosts)) * 100).toFixed(1)}% of all ROS posts`,
                },
                {
                  label: 'Active Partners',
                  value: formatNumber(sponsorAnalysis.length),
                  sub: sponsorAnalysis[0] ? `${sponsorAnalysis[0].displayName} leads by volume` : 'No partner data',
                },
                {
                  label: 'Avg Likes / Sponsored Post',
                  value: formatNumber(Math.round(perfBenchmarks.avgLikesSponsor)),
                  sub: perfBenchmarks.lift >= 0 ? `${perfBenchmarks.lift.toFixed(1)}% engagement lift vs organic` : `${Math.abs(perfBenchmarks.lift).toFixed(1)}% below organic`,
                },
                {
                  label: 'Most Activated Athlete',
                  value: athletes.filter((a) => a.sponsoredPosts > 0).sort((a, b) => b.sponsoredPosts - a.sponsoredPosts)[0]?.name || 'N/A',
                  sub: athletes.filter((a) => a.sponsoredPosts > 0).sort((a, b) => b.sponsoredPosts - a.sponsoredPosts)[0] ? `${athletes.filter((a) => a.sponsoredPosts > 0).sort((a, b) => b.sponsoredPosts - a.sponsoredPosts)[0].sponsoredPosts} branded posts` : 'No sponsored activity',
                },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 mb-2">{card.label}</p>
                  <p className="text-2xl font-black text-white leading-tight">{card.value}</p>
                  <p className="text-white/30 text-xs mt-2">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Top Partners</h3>
                  <p className="text-sm text-white/30 mt-1">Highest-volume sponsor partners in the ROS post dataset.</p>
                </div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">Logo asset when available, branded tile otherwise</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {sponsorAnalysis.slice(0, 8).map((partner, index) => (
                  <div key={partner.partner} className="rounded-[22px] border border-lime-400/14 bg-[linear-gradient(180deg,rgba(15,15,15,0.98),rgba(8,8,8,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center overflow-hidden flex-shrink-0">
                          {partner.logoSrc ? (
                            <img src={partner.logoSrc} alt={partner.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(173,255,47,0.22),rgba(173,255,47,0.03)_60%,rgba(0,0,0,0)_100%)] flex items-center justify-center text-lime-300 font-black text-lg tracking-[-0.04em]">
                              {getPartnerMonogram(partner.partner)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm truncate">{partner.displayName}</p>
                          <p className="text-white/25 text-[10px] mt-1 truncate">{partner.partner}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-lime-400/75">#{index + 1}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-center">
                        <p className="text-white font-black text-base">{partner.posts}</p>
                        <p className="text-white/25 text-[9px] uppercase tracking-[0.16em] mt-1">Posts</p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-center">
                        <p className="text-white font-black text-base">{partner.athletes}</p>
                        <p className="text-white/25 text-[9px] uppercase tracking-[0.16em] mt-1">Athletes</p>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 text-center">
                        <p className="text-white font-black text-base">{formatNumber(Math.round(partner.avgLikes))}</p>
                        <p className="text-white/25 text-[9px] uppercase tracking-[0.16em] mt-1">Avg Likes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6 overflow-hidden">
                <h3 className="text-lg font-bold text-white">Athlete x Partner Matrix</h3>
                <p className="text-sm text-white/30 mt-1 mb-6">Top sponsored athletes against the most active partners. Filled cells show sponsored post count.</p>
                <div className="overflow-x-auto">
                  <div className="min-w-[720px]">
                    <div className="grid grid-cols-[180px_repeat(6,minmax(84px,1fr))] gap-2 mb-3">
                      <div />
                      {sponsorMatrix.topPartners.map((partner) => (
                        <div key={partner.partner} className="rounded-xl border border-white/8 bg-white/[0.03] p-2 text-center">
                          <div className="w-10 h-10 mx-auto rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center overflow-hidden mb-2">
                            {partner.logoSrc ? (
                              <img src={partner.logoSrc} alt={partner.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lime-300 font-black text-xs">{getPartnerMonogram(partner.partner)}</span>
                            )}
                          </div>
                          <p className="text-[10px] font-bold text-white/65 leading-tight line-clamp-2">{partner.displayName}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {sponsorMatrix.athleteRows.map(({ athlete, counts }) => (
                        <div key={athlete.id} className="grid grid-cols-[180px_repeat(6,minmax(84px,1fr))] gap-2 items-stretch">
                          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                            <p className="text-white text-sm font-bold truncate">{athlete.name}</p>
                            <p className="text-white/25 text-[10px] mt-1 uppercase tracking-[0.16em]">{athlete.sponsoredPosts} branded posts</p>
                          </div>
                          {sponsorMatrix.topPartners.map((partner) => {
                            const count = counts[normalizePartnerKey(partner.partner)] || 0;
                            return (
                              <div
                                key={`${athlete.id}-${partner.partner}`}
                                className={`rounded-xl border px-3 py-2.5 flex items-center justify-center text-sm font-black ${
                                  count > 0
                                    ? 'border-lime-400/30 bg-lime-400/[0.08] text-lime-300'
                                    : 'border-white/8 bg-white/[0.02] text-white/18'
                                }`}
                              >
                                {count > 0 ? count : '—'}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-lg font-bold text-white">Sponsored vs Organic</h3>
                  <p className="text-sm text-white/30 mt-1 mb-5">Performance comparison using the ROS post dataset.</p>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Avg Engagement',
                        sponsored: `${perfBenchmarks.sponsoredAvg.toFixed(2)}%`,
                        organic: `${perfBenchmarks.nonSponsoredAvg.toFixed(2)}%`,
                        stronger: perfBenchmarks.sponsoredAvg >= perfBenchmarks.nonSponsoredAvg,
                      },
                      {
                        label: 'Avg Likes',
                        sponsored: formatNumber(Math.round(perfBenchmarks.avgLikesSponsor)),
                        organic: formatNumber(Math.round(perfBenchmarks.avgLikesOrganic)),
                        stronger: perfBenchmarks.avgLikesSponsor >= perfBenchmarks.avgLikesOrganic,
                      },
                      {
                        label: 'Avg Comments',
                        sponsored: formatNumber(Math.round(perfBenchmarks.avgCommentsSponsor)),
                        organic: formatNumber(Math.round(perfBenchmarks.avgCommentsOrganic)),
                        stronger: perfBenchmarks.avgCommentsSponsor >= perfBenchmarks.avgCommentsOrganic,
                      },
                    ].map((row) => (
                      <div key={row.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold text-white">{row.label}</span>
                          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${row.stronger ? 'text-lime-400' : 'text-orange-400'}`}>
                            {row.stronger ? 'Sponsored Leads' : 'Organic Leads'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-lime-400/18 bg-lime-400/[0.05] px-3 py-3">
                            <p className="text-white/25 text-[9px] uppercase tracking-[0.16em]">Sponsored</p>
                            <p className="text-white font-black text-xl mt-2">{row.sponsored}</p>
                          </div>
                          <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
                            <p className="text-white/25 text-[9px] uppercase tracking-[0.16em]">Organic</p>
                            <p className="text-white font-black text-xl mt-2">{row.organic}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="text-lg font-bold text-white">Most Activated Athletes</h3>
                  <p className="text-sm text-white/30 mt-1 mb-5">Athletes carrying the most branded post volume.</p>
                  <div className="space-y-3">
                    {athletes
                      .filter((a) => a.sponsoredPosts > 0)
                      .sort((a, b) => b.sponsoredPosts - a.sponsoredPosts || b.totalLikes - a.totalLikes)
                      .slice(0, 8)
                      .map((athlete) => {
                        const rate = (athlete.sponsoredPosts / athlete.totalPosts) * 100;
                        return (
                          <div key={athlete.id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-white text-sm font-bold truncate">{athlete.name}</p>
                                <p className="text-white/25 text-[10px] mt-1">{athlete.sponsoredPosts} of {athlete.totalPosts} posts branded</p>
                              </div>
                              <span className="text-lime-400 font-black text-sm">{rate.toFixed(0)}%</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-lime-300 to-lime-500" style={{ width: `${Math.max(rate, 6)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function AthleteCard({ athlete }: { athlete: AthleteSummary }) {
  const [imgError, setImgError] = useState(false);
  const initials = athlete.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const [firstName, ...restNameParts] = athlete.name.trim().split(/\s+/);
  const lastNameLine = restNameParts.join(' ');
  const score = getMarketabilityScore(athlete);
  const engRate = athlete.avgEngagementRate < 1 ? athlete.avgEngagementRate * 100 : athlete.avgEngagementRate;
  const aboutText = CURATED_ATHLETE_BIOS[normalizeAthleteBioKey(athlete.name)]?.trim() || '';
  const hasCuratedBio = aboutText.length > 0;
  const portraitTransform = ATHLETE_PORTRAIT_X_OFFSET[athlete.name] || '';

  // Score ring: circumference for r=20 = 125.66
  const circumference = 125.66;
  const scoreOffset = circumference - (circumference * score) / 99;
  const scoreColor = score >= 80 ? '#ADFF2F' : score >= 60 ? '#a3e635' : '#84cc16';

  return (
    <div className="relative w-full group ros-card-shimmer ros-card-scan cursor-pointer overflow-hidden" style={{ aspectRatio: '3/4' }}>
      {/* Multi-layer glow effect on hover — contained within card bounds */}
      <div className="absolute inset-2 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-[25]"
        style={{ boxShadow: 'inset 0 0 30px rgba(173,255,47,0.06), inset 0 0 60px rgba(173,255,47,0.03)' }}
      />

      {/* Card content */}
      <div className="absolute inset-[6%] z-10 rounded-xl overflow-hidden transition-all duration-500 ease-out bg-black flex flex-col">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 24%, rgba(14,14,14,0.95) 0%, rgba(5,5,5,0.985) 24%, rgba(0,0,0,1) 60%, rgba(0,0,0,1) 100%)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 52%)' }} />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
        <div className="absolute inset-x-4 top-3 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent pointer-events-none" />

        {/* Hero / portrait area */}
        <div className="relative h-[40%] overflow-visible px-4 pt-2.5 shrink-0">
          {/* Score Badge */}
          <div className="absolute top-[18px] left-[18px] z-[5] overflow-visible p-3 -m-3 ros-score-pulse">
            <div
              className="absolute inset-[8px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${scoreColor}24 0%, ${scoreColor}14 38%, rgba(173,255,47,0.05) 55%, rgba(173,255,47,0) 76%)`,
                filter: 'blur(12px)',
              }}
            />
            <div
              className="absolute inset-[14px] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${scoreColor}30 0%, ${scoreColor}12 42%, rgba(173,255,47,0) 72%)`,
                filter: 'blur(6px)',
              }}
            />
            <div
              className="relative w-[62px] h-[62px] rounded-full overflow-visible"
              style={{
                background: `radial-gradient(circle at 50% 45%, rgba(14,14,14,0.98) 0%, rgba(0,0,0,0.96) 65%, rgba(0,0,0,0.9) 100%)`,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), inset 0 0 24px rgba(255,255,255,0.03)',
              }}
            >
              <svg viewBox="0 0 54 54" className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" />
                <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(173,255,47,0.10)" strokeWidth="5" />
                <circle
                  cx="27"
                  cy="27"
                  r="21"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={scoreOffset}
                  className="ros-score-ring"
                  style={{ filter: `drop-shadow(0 0 3px ${scoreColor})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white font-black text-[28px] leading-none" style={{ textShadow: `0 0 16px ${scoreColor}55` }}>{score}</span>
              </div>
            </div>
            <p className="text-[8px] font-bold text-lime-300/90 tracking-[0.28em] text-center mt-1">SCORE</p>
          </div>

          {/* Portrait integration */}
          <div className="absolute left-[38%] right-[2%] top-[12%] bottom-[-30px] z-[4] pointer-events-none">
            <div className="absolute left-[12%] right-[12%] top-[14%] h-[32%] rounded-full blur-3xl opacity-14" style={{ background: 'radial-gradient(circle, rgba(173,255,47,0.10) 0%, rgba(173,255,47,0.04) 38%, rgba(255,255,255,0.015) 54%, transparent 74%)' }} />
            {!imgError ? (
              <div
                className="absolute inset-0 z-[5] overflow-hidden"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 74%, rgba(0,0,0,0.96) 84%, rgba(0,0,0,0.72) 92%, rgba(0,0,0,0.26) 98%, rgba(0,0,0,0) 100%)',
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 74%, rgba(0,0,0,0.96) 84%, rgba(0,0,0,0.72) 92%, rgba(0,0,0,0.26) 98%, rgba(0,0,0,0) 100%)',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    WebkitMaskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.62) 20%, rgba(0,0,0,0.9) 28%, rgba(0,0,0,1) 36%, rgba(0,0,0,1) 100%)',
                    maskImage: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 10%, rgba(0,0,0,0.62) 20%, rgba(0,0,0,0.9) 28%, rgba(0,0,0,1) 36%, rgba(0,0,0,1) 100%)',
                  }}
                >
                  <img
                    src={athlete.image}
                    alt={athlete.name}
                    className="absolute right-0 top-0 h-[100%] w-auto max-w-none object-contain object-top scale-[1.03] group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                    style={{
                      filter: 'drop-shadow(0 18px 34px rgba(0,0,0,0.82)) drop-shadow(0 0 12px rgba(173,255,47,0.04))',
                      transform: portraitTransform,
                    }}
                    onError={() => setImgError(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-end pr-6 text-white/10 text-6xl font-black relative z-[5]" style={{ textShadow: '0 0 40px rgba(173,255,47,0.12)' }}>
                {initials}
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="absolute left-4 right-[48%] top-[66%] z-[6]">
            <div className="absolute -left-2 -right-4 -inset-y-2 rounded-[28px] opacity-85" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.58) 42%, rgba(0,0,0,0.18) 76%, rgba(0,0,0,0) 100%)', filter: 'blur(12px)' }} />
            <div className="relative">
              <p className="text-white font-black text-[18px] leading-[0.92] tracking-[-0.04em]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.72)' }}>
                {firstName?.toUpperCase()}
              </p>
              {lastNameLine ? (
                <p className="mt-1 text-white font-black text-[18px] leading-[0.92] tracking-[-0.04em]" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.72)' }}>
                  {lastNameLine.toUpperCase()}
                </p>
              ) : null}
              <div className="mt-2.5 text-[9px] font-bold tracking-[0.16em] uppercase text-lime-300">
                {athlete.position.toUpperCase()} <span className="text-white/28">|</span> <span className="text-lime-400/85">{formatSport(athlete.sport).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-[6] mt-auto px-4 pb-3">
          <div className="-mt-3 mb-3 h-px bg-gradient-to-r from-transparent via-lime-400/55 to-transparent pointer-events-none" />

          {/* KPI section */}
          <div className="pt-2 shrink-0">
            <div className="ros-kpi-grid grid grid-cols-3 gap-2.5">
                {[
                  { label: 'Likes', value: formatNumber(athlete.totalLikes), icon: <Heart className="w-3 h-3 text-lime-300/65" /> },
                  { label: 'Posts', value: athlete.totalPosts.toString(), icon: <BarChart3 className="w-3 h-3 text-lime-400/60" /> },
                  { label: 'Engagement', value: `${engRate.toFixed(1)}%`, icon: <TrendingUp className="w-3 h-3 text-lime-300/65" /> },
                ].map((stat) => (
                  <div key={stat.label} className="ros-kpi-cell relative overflow-hidden rounded-[16px] px-3 py-2.5 min-h-[84px]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-lime-300/40 to-transparent" />
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-lime-300/50 tracking-[0.2em] uppercase">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className="mt-2 text-white font-black text-[21px] leading-none tracking-[-0.05em]">{stat.value}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Bio section */}
          <div className="pt-3">
            <div className="ros-about-panel relative overflow-hidden rounded-[16px] px-3.5 py-3.5 min-h-[102px]">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
              <p className="text-[7px] font-bold tracking-[0.24em] uppercase text-white/24">About</p>
              {hasCuratedBio ? (
                <p className="mt-2 text-[11px] leading-[1.58] text-white/76 line-clamp-3">
                  {aboutText}
                </p>
              ) : (
                <p className="mt-2 text-[11px] leading-[1.58] text-white/36">
                  No curated bio available for this athlete yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Border overlay with idle glow animation */}
      <img
        src="/athlete_card_borders.png"
        alt=""
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20 ros-border-idle group-hover:brightness-125 transition-all duration-500"
      />
    </div>
  );
}

function PostCard({ post, rank }: { post: RawPost; rank: number }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(255,255,255,0.06)] hover:border-white/20 transition-all duration-300 ease-out">
      {/* Thumbnail */}
      <div className="relative aspect-square bg-white/5 overflow-hidden">
        {post.url && !imgError ? (
          <img
            src={post.url}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <Eye className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/10">
          #{rank}
        </div>
        {post.isSponsored && (
          <div className="absolute top-2 right-2 bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            SPONSORED
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white/70 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
          {post.source === 'INSTAGRAM' ? 'IG' : 'TK'}
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img
            src={post.athlete.image}
            alt=""
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-sm font-bold text-white">{canonicalizeAthleteName(post.athlete.name)}</span>
        </div>
        <p className="text-xs text-white/40 line-clamp-2 mb-3">{post.caption}</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-white font-bold">
            <Heart className="w-3.5 h-3.5 text-white/50" /> {formatNumber(post.metrics.likes)}
          </span>
          <span className="flex items-center gap-1 text-white/40">
            <MessageCircle className="w-3.5 h-3.5" /> {formatNumber(post.metrics.comments)}
          </span>
        </div>
        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-white/40 font-medium mt-2.5 hover:text-white transition-colors duration-200"
          >
            View Post <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
