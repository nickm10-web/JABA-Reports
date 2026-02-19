// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Data Layer
// Real data loaded from pre-processed JSON files.
// Items marked [MOCK] have no real data equivalent yet.
// ═══════════════════════════════════════════════════════════════
import { SponsorPost, PeerSchool, MonthlyTrend, BrandGapEntry } from './uclaTypes';

// ─── Real Data Loaders ──────────────────────────────────────
let _cachedPosts: SponsorPost[] | null = null;

export async function loadUCLAPosts(): Promise<SponsorPost[]> {
  if (_cachedPosts) return _cachedPosts;
  const res = await fetch('/data/ucla-all-posts.json');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = await res.json();
  // Fill back fields stripped for compactness
  _cachedPosts = raw.map(p => ({
    ...p,
    hashtags: p.hashtags || [],
    sponsorPartner: p.sponsorPartner || '',
    isSponsored: p.isSponsored || false,
    isCollaboration: p.isCollaboration || false,
    isOrganizationCollaboration: p.isOrganizationCollaboration || false,
    hasOrganizationLogo: p.hasOrganizationLogo || false,
    hasOrganizationInCaption: p.hasOrganizationInCaption || false,
    athlete: {
      ...p.athlete,
      school: { name: 'University of California, Los Angeles' },
      conference: { name: 'Big Ten' },
    },
    metrics: {
      ...p.metrics,
      shares: p.metrics.shares || 0,
      saves: p.metrics.saves || 0,
      videoViews: p.metrics.videoViews || 0,
      impressions: p.metrics.impressions || 0,
      reach: p.metrics.reach || 0,
      followers: p.metrics.followers || 0,
    },
  })) as SponsorPost[];
  return _cachedPosts;
}

// ─── Brand Category Mapping ─────────────────────────────────
// Built from real UCLA sponsor partners
const BRAND_CATEGORY_MAP: Record<string, string> = {
  // Apparel & Fashion
  '@nike': 'Apparel', '@nikela': 'Apparel', '@nikewomen': 'Apparel',
  '@adidasbasketball': 'Apparel', '@adidasfootball': 'Apparel', '@adidasusfootball': 'Apparel',
  '@lululemon': 'Apparel', '@skims': 'Apparel', '@nikeskims': 'Apparel',
  '@vuoriclothing': 'Apparel', '@aritzia': 'Apparel', '@alo': 'Apparel',
  '@puma': 'Apparel', '@hollister': 'Apparel', '@edikted': 'Apparel',
  '@prettylittlething': 'Apparel', '@everlane': 'Apparel', '@bonobos': 'Apparel',
  '@johnnieobrand': 'Apparel', '@urbanoutfitters': 'Apparel', '@zara': 'Apparel',
  '@splits59': 'Apparel', '@renttherunway': 'Apparel', '@crocs': 'Apparel',
  '@leftonfriday': 'Apparel', '@coach': 'Apparel', '@newera': 'Apparel',
  '@neweracap': 'Apparel', '@jolynclothing': 'Apparel', '@jolyncollegiate': 'Apparel',
  '@brightswimwear': 'Apparel', '@pakalohabikinis': 'Apparel', '@journeys': 'Apparel',
  '@jumpman23': 'Apparel', '@klimonbrand': 'Apparel', '@vybewear.co': 'Apparel',
  // F&B
  '@chipotle': 'F&B', '@raisingcanes': 'F&B', '@gopuff': 'F&B',
  '@drinkolipop': 'F&B', '@mcdonalds': 'F&B', '@mcdonaldsnorthcarolina': 'F&B',
  '@cheesecakefactory': 'F&B', '@applebees': 'F&B', '@ihop': 'F&B',
  '@arbys': 'F&B', '@hardees': 'F&B', '@doordash': 'F&B',
  '@sweetfin': 'F&B', '@insomniacookies': 'F&B', '@erewhon': 'F&B',
  '@honeymamas': 'F&B', '@ugliessnacks': 'F&B', '@vaquerosnacks': 'F&B',
  '@flaminhot': 'F&B', '@sprouts': 'F&B', '@perfectbar': 'F&B',
  '@krak': 'F&B',
  // Sports & Fitness
  '@c4energy': 'Sports & Fitness', '@hyperice': 'Sports & Fitness',
  '@gatorade': 'Sports & Fitness', '@gatoradepoy': 'Sports & Fitness',
  '@clifbar': 'Sports & Fitness', '@drinkdripdrop': 'Sports & Fitness',
  '@dripdrop': 'Sports & Fitness', '@drinkreignstorm': 'Sports & Fitness',
  '@nocco.usa': 'Sports & Fitness', '@parbarprotein': 'Sports & Fitness',
  '@proteinpints': 'Sports & Fitness', '@powerade_us': 'Sports & Fitness',
  '@redbullusa': 'Sports & Fitness', '@corepoweryoga': 'Sports & Fitness',
  '@physiqsupplements': 'Sports & Fitness', '@incrediwear': 'Sports & Fitness',
  '@blumaka': 'Sports & Fitness', '@hoka': 'Sports & Fitness',
  '@monarcsport': 'Sports & Fitness', '@alaninutrition': 'Sports & Fitness',
  '@kumquatenergy': 'Sports & Fitness', '@bownet': 'Sports & Fitness',
  // Tech & Audio
  '@beatsbydre': 'Tech', '@apple': 'Tech', '@sony': 'Tech',
  '@jblaudio': 'Tech', '@samsung': 'Tech', '@ultrahumanhq': 'Tech',
  // Health & Beauty
  '@clearstem': 'Health & Beauty', '@herocosmetics': 'Health & Beauty',
  '@goodmolecules': 'Health & Beauty', '@ultabeauty': 'Health & Beauty',
  '@opill_otc': 'Health & Beauty', '@welovecoco': 'Health & Beauty',
  '@cvspharmacy': 'Health & Beauty', '@cudis_wellness': 'Health & Beauty',
  '@emsculptneo': 'Health & Beauty', '@dove': 'Health & Beauty',
  '@lasikplus': 'Health & Beauty', '@si_swimsuit': 'Health & Beauty',
  '@wilhelminamodels': 'Health & Beauty',
  // Sports Equipment
  '@oakley': 'Sports Equipment', '@oakley_us': 'Sports Equipment',
  '@rawlingssg': 'Sports Equipment', '@easton': 'Sports Equipment',
  '@eastonbaseball': 'Sports Equipment', '@eastonfastpitch': 'Sports Equipment',
  '@rapsodobaseball': 'Sports Equipment', '@taylormade': 'Sports Equipment',
  '@pxg': 'Sports Equipment', '@apachegolf': 'Sports Equipment',
  '@goodr': 'Sports Equipment', '@sportsgoodr': 'Sports Equipment',
  '@gkelite': 'Sports Equipment', '@dickssportinggoods': 'Sports Equipment',
  // Entertainment & Media
  '@audible': 'Entertainment', '@slam': 'Entertainment',
  '@linkedin': 'Entertainment', '@postgame.official': 'Entertainment',
  // Jewelry & Accessories
  '@gorjana': 'Jewelry', '@happyjewelers': 'Jewelry',
  '@maisonmiru': 'Jewelry',
  // Travel & Lifestyle
  '@royalcaribbean': 'Travel', '@marriottbonvoy': 'Travel',
  '@tavaruaislandresort': 'Travel', '@lifeisgoodco': 'Lifestyle',
  // Financial & Services
  '@statefarm': 'Finance', '@tmobile': 'Telecom',
  '@wescom': 'Finance', '@wescomfinancial': 'Finance',
  // Automotive
  '@toyota': 'Auto',
  // UCLA NIL / Athletics
  '@ucla.nil.store': 'UCLA NIL', '@uclagymnastics': 'UCLA Athletics',
  '@uclawbb': 'UCLA Athletics', '@uclabeachvb': 'UCLA Athletics',
  '@uclawomensvb': 'UCLA Athletics', '@uclawsoccer': 'UCLA Athletics',
  '@uclabruinsforlife': 'UCLA Athletics', '@ucladeltagamma': 'UCLA Athletics',
  // Agency & Sports Services
  '@apsportsagency': 'Agency', '@powerhausagency': 'Agency',
  '@hometownheroagency': 'Agency', '@myplayersports': 'Agency',
  '@opendorse': 'Agency', '@future': 'Agency',
};

export function getBrandCategory(handle: string): string {
  const key = (handle || '').trim().toLowerCase();
  return BRAND_CATEGORY_MAP[key] || 'Other';
}

// ─── Full Dataset Summary (from all 7,077 posts) ───────────
export const UCLA_FULL_STATS = {
  totalPosts: 7077,
  totalLikes: 12326245,
  totalComments: 341183,
  totalAthletes: 506,
  totalSports: 23,
  sponsoredPosts: 378,
  collaborations: 243,
  logoPosts: 622,
  captionMentions: 5,
  anyIPSignal: 1162,
  uniqueBrands: 225,
  emv: 154657.36,
};

// ─── [MOCK] Benchmark Peer Data ─────────────────────────────
// No real peer comparison data available
export const UCLA_PEER_SCHOOLS: PeerSchool[] = [
  {
    id: 'usc', name: 'University of Southern California', shortName: 'USC',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/30.png', conference: 'Big Ten',
    totalDeals: 520, totalEMV: 3200000, avgEngagement: 4.2, topSport: 'Football',
    athleteCount: 78, brandCount: 105,
    monthlyRanks: [1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1],
  },
  {
    id: 'ohio-state', name: 'The Ohio State University', shortName: 'Ohio State',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/194.png', conference: 'Big Ten',
    totalDeals: 480, totalEMV: 2800000, avgEngagement: 3.8, topSport: 'Football',
    athleteCount: 85, brandCount: 98,
    monthlyRanks: [2, 2, 3, 1, 2, 2, 1, 2, 2, 2, 2, 2],
  },
  {
    id: 'michigan', name: 'University of Michigan', shortName: 'Michigan',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/130.png', conference: 'Big Ten',
    totalDeals: 410, totalEMV: 2500000, avgEngagement: 3.5, topSport: 'Football',
    athleteCount: 72, brandCount: 88,
    monthlyRanks: [3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3],
  },
  {
    id: 'penn-state', name: 'Penn State University', shortName: 'Penn State',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/213.png', conference: 'Big Ten',
    totalDeals: 320, totalEMV: 1800000, avgEngagement: 3.2, topSport: 'Football',
    athleteCount: 58, brandCount: 72,
    monthlyRanks: [5, 5, 5, 5, 5, 5, 5, 4, 5, 5, 5, 5],
  },
  {
    id: 'oregon', name: 'University of Oregon', shortName: 'Oregon',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png', conference: 'Big Ten',
    totalDeals: 380, totalEMV: 2200000, avgEngagement: 3.9, topSport: 'Football',
    athleteCount: 65, brandCount: 82,
    monthlyRanks: [4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 4, 4],
  },
  {
    id: 'wisconsin', name: 'University of Wisconsin', shortName: 'Wisconsin',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/275.png', conference: 'Big Ten',
    totalDeals: 240, totalEMV: 1200000, avgEngagement: 2.9, topSport: 'Football',
    athleteCount: 45, brandCount: 58,
    monthlyRanks: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
  },
  {
    id: 'iowa', name: 'University of Iowa', shortName: 'Iowa',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png', conference: 'Big Ten',
    totalDeals: 280, totalEMV: 1500000, avgEngagement: 3.1, topSport: "Women's Basketball",
    athleteCount: 52, brandCount: 65,
    monthlyRanks: [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
  },
  {
    id: 'minnesota', name: 'University of Minnesota', shortName: 'Minnesota',
    logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/135.png', conference: 'Big Ten',
    totalDeals: 190, totalEMV: 900000, avgEngagement: 2.7, topSport: 'Football',
    athleteCount: 38, brandCount: 45,
    monthlyRanks: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  },
];

// [MOCK] UCLA's own benchmark data
export const UCLA_BENCHMARK: PeerSchool = {
  id: 'ucla', name: 'University of California, Los Angeles', shortName: 'UCLA',
  logoUrl: 'https://a.espncdn.com/i/teamlogos/ncaa/500/26.png', conference: 'Big Ten',
  totalDeals: 376, totalEMV: 154657, avgEngagement: 22.9, topSport: "Women's Gymnastics",
  athleteCount: 506, brandCount: 225,
  monthlyRanks: [5, 5, 5, 5, 5, 4, 4, 5, 5, 4, 4, 4],
};

// ─── [MOCK] Monthly Trends ──────────────────────────────────
// No real monthly breakdown available
export const UCLA_MONTHLY_TRENDS: MonthlyTrend[] = [
  { month: '2025-01', label: 'Jan', deals: 22, emv: 130000, athletes: 18, engagement: 3.2 },
  { month: '2025-02', label: 'Feb', deals: 25, emv: 155000, athletes: 20, engagement: 3.4 },
  { month: '2025-03', label: 'Mar', deals: 35, emv: 210000, athletes: 28, engagement: 3.8 },
  { month: '2025-04', label: 'Apr', deals: 30, emv: 185000, athletes: 24, engagement: 3.5 },
  { month: '2025-05', label: 'May', deals: 28, emv: 170000, athletes: 22, engagement: 3.3 },
  { month: '2025-06', label: 'Jun', deals: 20, emv: 120000, athletes: 16, engagement: 3.0 },
  { month: '2025-07', label: 'Jul', deals: 18, emv: 105000, athletes: 14, engagement: 2.8 },
  { month: '2025-08', label: 'Aug', deals: 32, emv: 195000, athletes: 26, engagement: 3.6 },
  { month: '2025-09', label: 'Sep', deals: 38, emv: 235000, athletes: 30, engagement: 4.0 },
  { month: '2025-10', label: 'Oct', deals: 42, emv: 260000, athletes: 32, engagement: 4.2 },
  { month: '2025-11', label: 'Nov', deals: 35, emv: 215000, athletes: 28, engagement: 3.7 },
  { month: '2025-12', label: 'Dec', deals: 25, emv: 150000, athletes: 20, engagement: 3.1 },
];

// ─── [MOCK] Brand Gap Matrix ────────────────────────────────
// No real competitive gap data available
const BRAND_CATEGORIES = ['Apparel', 'F&B', 'Tech', 'Finance', 'Auto', 'Health & Beauty', 'Sports & Fitness', 'Jewelry', 'Entertainment', 'Sports Equipment'];
const GAP_SPORTS = ['FOOTBALL', 'MENS_BASKETBALL', 'WOMENS_BASKETBALL', 'SOFTBALL', 'WOMENS_GYMNASTICS', 'WOMENS_VOLLEYBALL', 'WOMENS_SOCCER', 'WOMENS_TRACK_AND_FIELD'];

// Deterministic seeded random for consistent mock gap matrix
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

export function generateBrandGapMatrix(): BrandGapEntry[] {
  const entries: BrandGapEntry[] = [];
  for (const category of BRAND_CATEGORIES) {
    for (const sport of GAP_SPORTS) {
      const r = rand();
      let status: BrandGapEntry['status'];
      let brandCount: number;
      let competitorBrands: string[] | undefined;

      if (r < 0.45) {
        status = 'active';
        brandCount = randInt(1, 5);
      } else if (r < 0.75) {
        status = 'competitor';
        brandCount = 0;
        competitorBrands = ['USC', 'Ohio State', 'Oregon'].filter(() => rand() > 0.4);
        if (competitorBrands.length === 0) competitorBrands = ['USC'];
      } else {
        status = 'none';
        brandCount = 0;
      }

      entries.push({ category, sport, status, brandCount, competitorBrands });
    }
  }
  return entries;
}

export { BRAND_CATEGORIES, GAP_SPORTS };
