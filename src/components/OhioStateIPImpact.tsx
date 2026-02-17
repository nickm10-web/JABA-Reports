import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  Heart,
  MessageCircle,
  TrendingUp,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  Tag,
  AtSign,
  Info,
  Handshake,
  Camera,
  Target,
  Lightbulb,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// THEME TOKENS
// ═══════════════════════════════════════════════════════════════
const colors = {
  scarlet: '#ba0c2f',
  scarletDark: '#8a0922',
  scarletLight: '#d4334f',
  gray: '#a7b1b7',
  white: '#ffffff',
  positive: '#10b981',
  negative: '#ef4444',
  accent: '#0369a1',
  lightBg: '#f8f8f8',
  warmGray: '#78716c',
  cardBg: '#ffffff',
  cardBorder: 'transparent',
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  headerGray: '#6b7280',
  glass: 'rgba(255,255,255,0.85)',
  glassBorder: 'rgba(0,0,0,0.06)',
};

type SignalComparison = {
  with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number };
  without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number };
};

type SportSignalData = Record<string, { collab: SignalComparison; logo: SignalComparison; mention: SignalComparison }>;

interface OhioRosterMetricWindow {
  contentCount?: number;
  logoContentCount?: number;
  collaborationContentCount?: number;
  organizationCollaborationContentCount?: number;
  avgLikesWithLogo?: number;
  avgLikesWithoutLogo?: number;
  avgCommentsWithLogo?: number;
  avgCommentsWithoutLogo?: number;
  avgEngagementRateWithLogo?: number;
  avgEngagementRateWithoutLogo?: number;
  avgLikesWithCollaboration?: number;
  avgLikesWithoutCollaboration?: number;
  avgCommentsWithCollaboration?: number;
  avgCommentsWithoutCollaboration?: number;
  avgEngagementRateWithCollaboration?: number;
  avgEngagementRateWithoutCollaboration?: number;
  avgLikesWithOrganizationCollaboration?: number;
  avgLikesWithoutOrganizationCollaboration?: number;
  avgCommentsWithOrganizationCollaboration?: number;
  avgCommentsWithoutOrganizationCollaboration?: number;
  avgEngagementRateWithOrganizationCollaboration?: number;
  avgEngagementRateWithoutOrganizationCollaboration?: number;
}

interface OhioRosterTeam {
  sport?: string;
  metrics?: {
    thirtyDays?: OhioRosterMetricWindow;
    sevenDays?: OhioRosterMetricWindow;
    ninetyDays?: OhioRosterMetricWindow;
  };
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatSportLabel(sportKey: string): string {
  if (sportKey === 'ALL_SPORTS') return 'All Sports';
  return sportKey
    .toLowerCase()
    .split('_')
    .map((word) => {
      if (word === 'mens') return "Men's";
      if (word === 'womens') return "Women's";
      if (word === 'and') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function buildSportDataFromRoster(rows: OhioRosterTeam[]): SportSignalData {
  type Accumulator = {
    withPosts: number;
    withoutPosts: number;
    withLikesTotal: number;
    withCommentsTotal: number;
    withEngagementTotal: number;
    withoutLikesTotal: number;
    withoutCommentsTotal: number;
    withoutEngagementTotal: number;
  };

  type SportAccumulator = Record<string, { collab: Accumulator; logo: Accumulator; mention: Accumulator }>;

  const createAccumulator = (): Accumulator => ({
    withPosts: 0,
    withoutPosts: 0,
    withLikesTotal: 0,
    withCommentsTotal: 0,
    withEngagementTotal: 0,
    withoutLikesTotal: 0,
    withoutCommentsTotal: 0,
    withoutEngagementTotal: 0,
  });

  const createSportAccumulator = () => ({
    collab: createAccumulator(),
    logo: createAccumulator(),
    mention: createAccumulator(),
  });

  const accumulators: SportAccumulator = {};

  const ensureSport = (sportKey: string) => {
    if (!accumulators[sportKey]) {
      accumulators[sportKey] = createSportAccumulator();
    }
    return accumulators[sportKey];
  };

  const addSignal = (
    acc: Accumulator,
    withPosts: number,
    withoutPosts: number,
    withLikes: number,
    withoutLikes: number,
    withComments: number,
    withoutComments: number,
    withEngagement: number,
    withoutEngagement: number,
  ) => {
    acc.withPosts += withPosts;
    acc.withoutPosts += withoutPosts;
    acc.withLikesTotal += withLikes * withPosts;
    acc.withCommentsTotal += withComments * withPosts;
    acc.withEngagementTotal += withEngagement * withPosts;
    acc.withoutLikesTotal += withoutLikes * withoutPosts;
    acc.withoutCommentsTotal += withoutComments * withoutPosts;
    acc.withoutEngagementTotal += withoutEngagement * withoutPosts;
  };

  for (const row of rows) {
    const sportKey = row.sport;
    if (!sportKey) continue;

    const metrics = row.metrics?.ninetyDays ?? row.metrics?.thirtyDays ?? row.metrics?.sevenDays;
    if (!metrics) continue;

    const totalPosts = toNumber(metrics.contentCount);
    if (totalPosts <= 0) continue;

    const sportAccumulator = ensureSport(sportKey);
    const allSportsAccumulator = ensureSport('ALL_SPORTS');

    const logoWith = toNumber(metrics.logoContentCount);
    const logoWithout = Math.max(0, totalPosts - logoWith);
    const collabWith = toNumber(metrics.collaborationContentCount);
    const collabWithout = Math.max(0, totalPosts - collabWith);
    const mentionWith = toNumber(metrics.organizationCollaborationContentCount);
    const mentionWithout = Math.max(0, totalPosts - mentionWith);

    const logoValues: [number, number, number, number, number, number] = [
      toNumber(metrics.avgLikesWithLogo),
      toNumber(metrics.avgLikesWithoutLogo),
      toNumber(metrics.avgCommentsWithLogo),
      toNumber(metrics.avgCommentsWithoutLogo),
      toNumber(metrics.avgEngagementRateWithLogo),
      toNumber(metrics.avgEngagementRateWithoutLogo),
    ];

    const collabValues: [number, number, number, number, number, number] = [
      toNumber(metrics.avgLikesWithCollaboration),
      toNumber(metrics.avgLikesWithoutCollaboration),
      toNumber(metrics.avgCommentsWithCollaboration),
      toNumber(metrics.avgCommentsWithoutCollaboration),
      toNumber(metrics.avgEngagementRateWithCollaboration),
      toNumber(metrics.avgEngagementRateWithoutCollaboration),
    ];

    const mentionValues: [number, number, number, number, number, number] = [
      toNumber(metrics.avgLikesWithOrganizationCollaboration),
      toNumber(metrics.avgLikesWithoutOrganizationCollaboration),
      toNumber(metrics.avgCommentsWithOrganizationCollaboration),
      toNumber(metrics.avgCommentsWithoutOrganizationCollaboration),
      toNumber(metrics.avgEngagementRateWithOrganizationCollaboration),
      toNumber(metrics.avgEngagementRateWithoutOrganizationCollaboration),
    ];

    addSignal(sportAccumulator.logo, logoWith, logoWithout, ...logoValues);
    addSignal(sportAccumulator.collab, collabWith, collabWithout, ...collabValues);
    addSignal(sportAccumulator.mention, mentionWith, mentionWithout, ...mentionValues);

    addSignal(allSportsAccumulator.logo, logoWith, logoWithout, ...logoValues);
    addSignal(allSportsAccumulator.collab, collabWith, collabWithout, ...collabValues);
    addSignal(allSportsAccumulator.mention, mentionWith, mentionWithout, ...mentionValues);
  }

  const toSignalComparison = (acc: Accumulator): SignalComparison => ({
    with: {
      posts: acc.withPosts,
      avgLikes: acc.withPosts > 0 ? acc.withLikesTotal / acc.withPosts : 0,
      avgComments: acc.withPosts > 0 ? acc.withCommentsTotal / acc.withPosts : 0,
      engagementRate: acc.withPosts > 0 ? acc.withEngagementTotal / acc.withPosts : 0,
    },
    without: {
      posts: acc.withoutPosts,
      avgLikes: acc.withoutPosts > 0 ? acc.withoutLikesTotal / acc.withoutPosts : 0,
      avgComments: acc.withoutPosts > 0 ? acc.withoutCommentsTotal / acc.withoutPosts : 0,
      engagementRate: acc.withoutPosts > 0 ? acc.withoutEngagementTotal / acc.withoutPosts : 0,
    },
  });

  const result: SportSignalData = {};
  for (const [sportKey, signalAcc] of Object.entries(accumulators)) {
    result[sportKey] = {
      collab: toSignalComparison(signalAcc.collab),
      logo: toSignalComparison(signalAcc.logo),
      mention: toSignalComparison(signalAcc.mention),
    };
  }

  return result;
}

const transition = 'all 180ms cubic-bezier(0.4, 0, 0.2, 1)';

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════
interface Partnership {
  brand: string;
  posts: number;
  avgLikes: number;
  avgComments: number;
  emv: number;
  engagementRate: number;
  liftMultiplier: number;
}

interface IPSignalData {
  posts: number;
  likes: number;
  comments: number;
  engagementRate: number;
  delta: number;
  emv?: number;
  baselineEngRate: number;
  baselinePosts: number;
  baselineLikes: number;
  baselineComments: number;
}

interface OverviewData {
  sourceFile?: string;
  generatedAt?: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  postsWithIP: number;
  ipAdoptionRate: number;
  avgLift: number;
  totalEmv: number;
  collaboration: IPSignalData;
  logo: IPSignalData;
  mention: IPSignalData;
}

// ═══════════════════════════════════════════════════════════════
// OHIO STATE IP DATA (Source of Truth)
// ═══════════════════════════════════════════════════════════════
const ipData = {
  totalPosts: 12384,
  totalAthletes: 707,
  totalFollowers: 5546349,
  totalLikes: 24070416,
  totalComments: 567404,
  engagementRate: 0.3538,
  baseline: { posts: 6461, engagementRate: 0.1501 },
  postsWithIP: 5923,
  ipAdoptionRate: 47.8,
  avgLift: 217.7,
  totalEmv: 12886314,
  collaboration: { posts: 195, likes: 12935.5, comments: 112.73, engagementRate: 0.6456, delta: 631.7, emv: 1294184, baselineEngRate: 0.3491, baselinePosts: 12189, baselineLikes: 1767.82, baselineComments: 44.75 } as IPSignalData,
  logo: { posts: 5245, likes: 3144.56, comments: 57.43, engagementRate: 0.5685, delta: 196.3, emv: 8698443, baselineEngRate: 0.1961, baselinePosts: 7139, baselineLikes: 1061.38, baselineComments: 37.29 } as IPSignalData,
  mention: { posts: 2506, likes: 2546.85, comments: 43.43, engagementRate: 0.8783, delta: 42.2, emv: 3354479, baselineEngRate: 0.2208, baselinePosts: 9878, baselineLikes: 1790.65, baselineComments: 46.42 } as IPSignalData,
  signals: [
    {
      id: 'logo' as const,
      label: 'Visual IP (Logo)',
      totalPosts: 5245,
      percentage: 42.4,
      with: { posts: 5245, avgLikes: 3145, avgComments: 57, engagementRate: 0.5685 },
      without: { posts: 7139, avgLikes: 1061, avgComments: 37, engagementRate: 0.1961 },
    },
    {
      id: 'mention' as const,
      label: 'Caption Mention',
      totalPosts: 2506,
      percentage: 20.2,
      with: { posts: 2506, avgLikes: 2547, avgComments: 43, engagementRate: 0.8783 },
      without: { posts: 9878, avgLikes: 1791, avgComments: 46, engagementRate: 0.2208 },
    },
    {
      id: 'collab' as const,
      label: 'Collaboration',
      totalPosts: 195,
      percentage: 1.6,
      with: { posts: 195, avgLikes: 12935, avgComments: 113, engagementRate: 0.6456 },
      without: { posts: 12189, avgLikes: 1768, avgComments: 45, engagementRate: 0.3491 },
    },
  ],
  sponsoredPosts: 883,
  totalBrands: 100,
  totalEMV: 12886314,
  partnerships: [
    { brand: "@redbullusa", posts: 2, avgLikes: 233021.5, avgComments: 647, emv: 234962.5, engagementRate: 0.3079, liftMultiplier: 118.9 },
    { brand: "@accessthewalk", posts: 3, avgLikes: 94091.33, avgComments: 354.33, emv: 142731.5, engagementRate: 2.6174, liftMultiplier: 47.4 },
    { brand: "@easportsofficial", posts: 1, avgLikes: 260247, avgComments: 1851, emv: 132900, engagementRate: 0.3454, liftMultiplier: 132.9 },
    { brand: "@easportscollege", posts: 6, avgLikes: 41390.33, avgComments: 262.5, emv: 126533.5, engagementRate: 0.1261, liftMultiplier: 20.3 },
    { brand: "@beatsbydre", posts: 3, avgLikes: 43950, avgComments: 326, emv: 67392, engagementRate: 0.1331, liftMultiplier: 21.6 },
    { brand: "@hollister", posts: 89, avgLikes: 1277.65, avgComments: 20.31, emv: 59567.5, engagementRate: 0.0986, liftMultiplier: -0.3 },
    { brand: "@paniniamerica", posts: 2, avgLikes: 48993, avgComments: 147.5, emv: 49435.5, engagementRate: 0.1523, liftMultiplier: 24.2 },
    { brand: "@nxtrnd", posts: 3, avgLikes: 17270.67, avgComments: 80, emv: 26266, engagementRate: 0.0522, liftMultiplier: 7.9 },
    { brand: "@7eleven", posts: 1, avgLikes: 47435, avgComments: 347, emv: 24238, engagementRate: 0.063, liftMultiplier: 23.4 },
    { brand: "@adidasusfootball", posts: 1, avgLikes: 43424, avgComments: 534, emv: 22513, engagementRate: 0.0579, liftMultiplier: 21.3 },
    { brand: "@clever_made", posts: 20, avgLikes: 2157.6, avgComments: 15.45, emv: 22039.5, engagementRate: 0.1075, liftMultiplier: 0.1 },
    { brand: "@epicpartner", posts: 1, avgLikes: 42691, avgComments: 133, emv: 21545, engagementRate: 0.2416, liftMultiplier: 21 },
    { brand: "@dickssportinggoods", posts: 2, avgLikes: 20959.5, avgComments: 175.5, emv: 21486, engagementRate: 0.0454, liftMultiplier: 9.8 },
    { brand: "@chipotle", posts: 5, avgLikes: 7848.8, avgComments: 80.4, emv: 20225, engagementRate: 0.0324, liftMultiplier: 3 },
    { brand: "@paycomsoftware", posts: 5, avgLikes: 5339.2, avgComments: 30, emv: 13573, engagementRate: 0.5884, liftMultiplier: 1.7 },
    { brand: "@discover", posts: 1, avgLikes: 24054, avgComments: 114, emv: 12198, engagementRate: 0.0319, liftMultiplier: 11.4 },
    { brand: "@heydude", posts: 12, avgLikes: 2648.25, avgComments: 42.92, emv: 16761.5, engagementRate: 0.0796, liftMultiplier: 0.4 },
    { brand: "@gianteagle", posts: 5, avgLikes: 5478.6, avgComments: 65.6, emv: 15181.5, engagementRate: 0.0491, liftMultiplier: 1.8 },
    { brand: "@directv", posts: 5, avgLikes: 4530.4, avgComments: 40.6, emv: 11630.5, engagementRate: 0.2326, liftMultiplier: 1.3 },
    { brand: "@att", posts: 1, avgLikes: 21526, avgComments: 237, emv: 11118.5, engagementRate: 0.0287, liftMultiplier: 10.1 },
    { brand: "@thehenrylegacy", posts: 2, avgLikes: 9863, avgComments: 151, emv: 10316, engagementRate: 0.5565, liftMultiplier: 4.1 },
    { brand: "@jlabaudio", posts: 3, avgLikes: 6473.33, avgComments: 52.67, emv: 9947, engagementRate: 0.062, liftMultiplier: 2.3 },
    { brand: "@doordash", posts: 2, avgLikes: 9016, avgComments: 28.5, emv: 9101.5, engagementRate: 0.0272, liftMultiplier: 3.6 },
    { brand: "@joandjax", posts: 5, avgLikes: 3261.6, avgComments: 32.4, emv: 8397, engagementRate: 0.0657, liftMultiplier: 0.7 },
    { brand: "@americaneagle", posts: 22, avgLikes: 638.77, avgComments: 37.68, emv: 8270, engagementRate: 0.0305, liftMultiplier: -0.7 },
    { brand: "@valvolineinstantoilchange", posts: 4, avgLikes: 3743.75, avgComments: 24.5, emv: 7634.5, engagementRate: 0.0309, liftMultiplier: 0.9 },
    { brand: "@allstate", posts: 2, avgLikes: 7134.5, avgComments: 44.5, emv: 7268, engagementRate: 0.0875, liftMultiplier: 2.7 },
    { brand: "@wingstop", posts: 2, avgLikes: 5588.5, avgComments: 256.5, emv: 6358, engagementRate: 0.7279, liftMultiplier: 1.9 },
    { brand: "@KeyBank", posts: 2, avgLikes: 5849.5, avgComments: 49.5, emv: 5998, engagementRate: 0.0078, liftMultiplier: 2 },
    { brand: "@naturemadevitamins", posts: 1, avgLikes: 11205, avgComments: 21, emv: 5634, engagementRate: 0.2991, liftMultiplier: 4.8 },
    { brand: "@rebelcrystalofficial", posts: 2, avgLikes: 5462.5, avgComments: 1, emv: 5465.5, engagementRate: 0.0919, liftMultiplier: 1.8 },
    { brand: "@lv", posts: 1, avgLikes: 10043, avgComments: 148, emv: 5243.5, engagementRate: 0.1501, liftMultiplier: 4.2 },
    { brand: "@adidas", posts: 2, avgLikes: 4895, avgComments: 104, emv: 5207, engagementRate: 0.0782, liftMultiplier: 1.5 },
    { brand: "@paycom", posts: 1, avgLikes: 10182, avgComments: 36, emv: 5145, engagementRate: 0.2991, liftMultiplier: 4.2 },
    { brand: "@defensesoap", posts: 1, avgLikes: 10145, avgComments: 33, emv: 5122, engagementRate: 0.2979, liftMultiplier: 4.2 },
    { brand: "@tmobile", posts: 1, avgLikes: 9905, avgComments: 54, emv: 5033.5, engagementRate: 0.0299, liftMultiplier: 4.1 },
    { brand: "@flocheer", posts: 2, avgLikes: 4873.5, avgComments: 7.5, emv: 4896, engagementRate: 0.0821, liftMultiplier: 1.5 },
    { brand: "@athleteps", posts: 1, avgLikes: 8398, avgComments: 45, emv: 4266.5, engagementRate: 0.2471, liftMultiplier: 3.3 },
    { brand: "@crocs", posts: 6, avgLikes: 1315.33, avgComments: 23, emv: 4153, engagementRate: 0.0042, liftMultiplier: -0.3 },
    { brand: "@brooksrunning", posts: 5, avgLikes: 1543, avgComments: 30.2, emv: 4084, engagementRate: 0.1099, liftMultiplier: -0.2 },
    { brand: "@peppermayo", posts: 4, avgLikes: 1833.75, avgComments: 41.75, emv: 3918, engagementRate: 0.0312, liftMultiplier: -0.1 },
    { brand: "@amazonmusic", posts: 1, avgLikes: 6974, avgComments: 30, emv: 3532, engagementRate: 0.0944, liftMultiplier: 2.6 },
    { brand: "@cliffkeenathletic", posts: 1, avgLikes: 6980, avgComments: 16, emv: 3514, engagementRate: 3.4294, liftMultiplier: 2.6 },
    { brand: "@journeymenwrestling", posts: 1, avgLikes: 6521, avgComments: 24, emv: 3296.5, engagementRate: 0.1916, liftMultiplier: 2.4 },
    { brand: "@fifththirdbank", posts: 2, avgLikes: 2969.5, avgComments: 15, emv: 3014.5, engagementRate: 0.0109, liftMultiplier: 0.5 },
    { brand: "@celsiusofficial", posts: 3, avgLikes: 1828.33, avgComments: 22, emv: 2841.5, engagementRate: 0.0055, liftMultiplier: -0.1 },
    { brand: "@flowrestling", posts: 1, avgLikes: 5362, avgComments: 11, emv: 2697.5, engagementRate: 1.2963, liftMultiplier: 1.8 },
    { brand: "@serialashaeco", posts: 1, avgLikes: 5029, avgComments: 72, emv: 2622.5, engagementRate: 0.284, liftMultiplier: 1.6 },
    { brand: "@drinkaccelerator", posts: 45, avgLikes: 87.58, avgComments: 7.67, emv: 2488, engagementRate: 0.0231, liftMultiplier: -1 },
    { brand: "@ParamountPlus", posts: 1, avgLikes: 4823, avgComments: 32, emv: 2459.5, engagementRate: 0.0705, liftMultiplier: 1.5 },
    { brand: "@marathonfuel", posts: 1, avgLikes: 3988, avgComments: 49, emv: 2067.5, engagementRate: 0.1114, liftMultiplier: 1.1 },
    { brand: "@donatospizza", posts: 4, avgLikes: 975.25, avgComments: 18.25, emv: 2060, engagementRate: 0.3075, liftMultiplier: -0.5 },
    { brand: "@neweracap", posts: 7, avgLikes: 513.43, avgComments: 19.71, emv: 2004, engagementRate: 0.0351, liftMultiplier: -0.7 },
    { brand: "@c4energy", posts: 19, avgLikes: 244.37, avgComments: 22.68, emv: 2998.5, engagementRate: 0.0464, liftMultiplier: -0.9 },
    { brand: "@goodfoodcro", posts: 2, avgLikes: 1403, avgComments: 194, emv: 1985, engagementRate: 0.0127, liftMultiplier: -0.3 },
    { brand: "@theviewonfifth", posts: 10, avgLikes: 373.5, avgComments: 6.3, emv: 1962, engagementRate: 0.0189, liftMultiplier: -0.8 },
    { brand: "@bumpboxx", posts: 3, avgLikes: 1128.33, avgComments: 40.67, emv: 1875.5, engagementRate: 0.0633, liftMultiplier: -0.4 },
    { brand: "@tytusgrills", posts: 5, avgLikes: 719, avgComments: 6.6, emv: 1847, engagementRate: 0.0177, liftMultiplier: -0.6 },
    { brand: "@seatgeek", posts: 2, avgLikes: 1755.5, avgComments: 23, emv: 1824.5, engagementRate: 0.0144, liftMultiplier: -0.1 },
    { brand: "@shootaway", posts: 3, avgLikes: 1079, avgComments: 27.67, emv: 1743, engagementRate: 0.0129, liftMultiplier: -0.4 },
    { brand: "@elementelectronics", posts: 7, avgLikes: 443, avgComments: 15.43, emv: 1712.5, engagementRate: 0.0555, liftMultiplier: -0.8 },
    { brand: "@aladdinseatery", posts: 3, avgLikes: 1060.33, avgComments: 20.67, emv: 1683.5, engagementRate: 0.1285, liftMultiplier: -0.5 },
    { brand: "@rootsnk", posts: 8, avgLikes: 351.25, avgComments: 10.63, emv: 1532.5, engagementRate: 0.0181, liftMultiplier: -0.8 },
    { brand: "@raisingcanes", posts: 4, avgLikes: 659.25, avgComments: 27.25, emv: 1482, engagementRate: 0.0258, liftMultiplier: -0.7 },
    { brand: "@crackerbarrel", posts: 2, avgLikes: 1298.5, avgComments: 49.5, emv: 1447, engagementRate: 0.0372, liftMultiplier: -0.3 },
    { brand: "@leesfamouschick", posts: 1, avgLikes: 2802, avgComments: 28, emv: 1443, engagementRate: 0.0571, liftMultiplier: 0.4 },
    { brand: "@nike_wrestling", posts: 1, avgLikes: 2659, avgComments: 20, emv: 1359.5, engagementRate: 0.0784, liftMultiplier: 0.4 },
    { brand: "@uber", posts: 4, avgLikes: 622.25, avgComments: 8, emv: 1292.5, engagementRate: 0.0129, liftMultiplier: -0.7 },
    { brand: "@OIKOS", posts: 1, avgLikes: 2458, avgComments: 33, emv: 1278.5, engagementRate: 0.0075, liftMultiplier: 0.3 },
    { brand: "@stxmlax", posts: 2, avgLikes: 1245, avgComments: 5, emv: 1260, engagementRate: 0.0787, liftMultiplier: -0.4 },
    { brand: "@thriveresidents", posts: 3, avgLikes: 665, avgComments: 51.67, emv: 1230, engagementRate: 0.0029, liftMultiplier: -0.7 },
    { brand: "@nikelacrosse", posts: 2, avgLikes: 1088, avgComments: 34.5, emv: 1191.5, engagementRate: 0.2847, liftMultiplier: -0.4 },
    { brand: "@bauerhockey", posts: 2, avgLikes: 1044.5, avgComments: 39, emv: 1161.5, engagementRate: 0.1611, liftMultiplier: -0.5 },
    { brand: "@gametimeapp", posts: 1, avgLikes: 2191, avgComments: 41, emv: 1157, engagementRate: 0.1208, liftMultiplier: 0.1 },
    { brand: "@spartancombat", posts: 1, avgLikes: 1969, avgComments: 73, emv: 1094, engagementRate: 0.1932, liftMultiplier: 0 },
    { brand: "@tommyjohnwear", posts: 1, avgLikes: 2028, avgComments: 14, emv: 1035, engagementRate: 0.0544, liftMultiplier: 0 },
    { brand: "@honeystinger", posts: 2, avgLikes: 965, avgComments: 18, emv: 1019, engagementRate: 0.162, liftMultiplier: -0.5 },
    { brand: "@wingsandrings.lc", posts: 1, avgLikes: 2018, avgComments: 0, emv: 1009, engagementRate: 0.0297, liftMultiplier: 0 },
    { brand: "@ricartautomotive", posts: 1, avgLikes: 1840, avgComments: 55, emv: 1002.5, engagementRate: 0.1745, liftMultiplier: -0.1 },
    { brand: "@drinkolipop", posts: 8, avgLikes: 195.63, avgComments: 16, emv: 974.5, engagementRate: 0.1139, liftMultiplier: -0.9 },
    { brand: "@paramountplus", posts: 1, avgLikes: 1879, avgComments: 21, emv: 971, engagementRate: 0.0276, liftMultiplier: 0 },
    { brand: "@popeyes", posts: 3, avgLikes: 567, avgComments: 15, emv: 918, engagementRate: 0.0141, liftMultiplier: -0.7 },
    { brand: "@mcdonalds_greaterohio", posts: 1, avgLikes: 1629, avgComments: 8, emv: 826.5, engagementRate: 0.3864, liftMultiplier: -0.2 },
    { brand: "@ramblercolumbus", posts: 7, avgLikes: 204.14, avgComments: 5.57, emv: 773, engagementRate: 0.0736, liftMultiplier: -0.9 },
    { brand: "@chickfila", posts: 5, avgLikes: 307.8, avgComments: 27.4, emv: 768, engagementRate: 0.0411, liftMultiplier: -0.8 },
    { brand: "@gatorade", posts: 3, avgLikes: 480, avgComments: 21.67, emv: 764, engagementRate: 0.199, liftMultiplier: -0.8 },
    { brand: "@princesspolly", posts: 2, avgLikes: 653, avgComments: 26.5, emv: 732.5, engagementRate: 0.0531, liftMultiplier: -0.7 },
    { brand: "@drpepper", posts: 2, avgLikes: 563, avgComments: 33, emv: 662, engagementRate: 0.0571, liftMultiplier: -0.7 },
    { brand: "@selectproformance", posts: 4, avgLikes: 248.5, avgComments: 10.75, emv: 561.5, engagementRate: 0.014, liftMultiplier: -0.9 },
    { brand: "@adoreme", posts: 2, avgLikes: 525, avgComments: 41, emv: 554, engagementRate: 0.1242, liftMultiplier: -0.7 },
    { brand: "@goodr", posts: 5, avgLikes: 188.8, avgComments: 7.2, emv: 526, engagementRate: 0.0614, liftMultiplier: -0.9 },
    { brand: "@slimchickens", posts: 1, avgLikes: 985, avgComments: 16, emv: 516.5, engagementRate: 0.1078, liftMultiplier: -0.5 },
    { brand: "@starbucks", posts: 2, avgLikes: 553, avgComments: 9.5, emv: 541, engagementRate: 0.0143, liftMultiplier: -0.7 },
    { brand: "@7BrewCoffee", posts: 2, avgLikes: 563, avgComments: 6, emv: 581, engagementRate: 0.0021, liftMultiplier: -0.7 },
    { brand: "@bobboydlincoln", posts: 1, avgLikes: 950, avgComments: 35, emv: 527.5, engagementRate: 0.1411, liftMultiplier: -0.5 },
    { brand: "@kamaruclothing", posts: 1, avgLikes: 969, avgComments: 77, emv: 600, engagementRate: 0.0566, liftMultiplier: -0.5 },
  ] as Partnership[],
};

// ═══════════════════════════════════════════════════════════════
// ATHLETE & BENCHMARK DATA
// ═══════════════════════════════════════════════════════════════
const topCollabAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 4, emv: 149407, lift: 63 },
  { rank: 2, name: "Brandon Inniss", sport: "Football", posts: 3, emv: 80632, lift: 63 },
  { rank: 3, name: "Jayden Fielding", sport: "Football", posts: 5, emv: 42335, lift: 63 },
  { rank: 4, name: "Jaylen McClain", sport: "Football", posts: 3, emv: 36554, lift: 63 },
  { rank: 5, name: "Jermaine Mathews Jr.", sport: "Football", posts: 3, emv: 30145, lift: 63 },
];
const topLogoAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 23, emv: 435632, lift: 86 },
  { rank: 2, name: "James Peoples", sport: "Football", posts: 22, emv: 119833, lift: 86 },
  { rank: 3, name: "John Mobley Jr.", sport: "M. Basketball", posts: 22, emv: 75391, lift: 86 },
  { rank: 4, name: "Kayden McDonald", sport: "Football", posts: 24, emv: 67640, lift: 86 },
  { rank: 5, name: "Devin Royal", sport: "M. Basketball", posts: 24, emv: 47693, lift: 86 },
];
const topMentionAthletes = [
  { rank: 1, name: "John Mobley Jr.", sport: "M. Basketball", posts: 14, emv: 64042, lift: 79 },
  { rank: 2, name: "Kennedy Cambridge", sport: "W. Basketball", posts: 32, emv: 23293, lift: 79 },
  { rank: 3, name: "Devontae Armstrong", sport: "Football", posts: 12, emv: 21620, lift: 79 },
  { rank: 4, name: "Brandon Cannon", sport: "M. Wrestling", posts: 12, emv: 16006, lift: 79 },
  { rank: 5, name: "Nic Bouzakis", sport: "M. Wrestling", posts: 12, emv: 13631, lift: 79 },
];
const signalStats = {
  collab: { posts: 116, totalEmv: 781253, avgEmv: 6735, lift: 63 },
  logo: { posts: 4252, totalEmv: 6678514, avgEmv: 1571, lift: 86 },
  mention: { posts: 1933, totalEmv: 2707472, avgEmv: 1401, lift: 79 },
};

const fallbackSportData: Record<string, Record<string, { with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number }; without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number } }>> = {
  'ALL_SPORTS': {
    mention: { with: { posts: 1933, avgLikes: 2659, avgComments: 47, engagementRate: 0.2365 }, without: { posts: 7696, avgLikes: 1550, avgComments: 43, engagementRate: 0.1321 } },
    logo: { with: { posts: 4252, avgLikes: 2972, avgComments: 57, engagementRate: 0.1869 }, without: { posts: 5377, avgLikes: 825, avgComments: 34, engagementRate: 0.1003 } },
    collab: { with: { posts: 116, avgLikes: 13138, avgComments: 111, engagementRate: 0.2402 }, without: { posts: 9513, avgLikes: 1634, avgComments: 43, engagementRate: 0.147 } }
  },
  'FOOTBALL': {
    mention: { with: { posts: 310, avgLikes: 9553, avgComments: 99, engagementRate: 0.2779 }, without: { posts: 1399, avgLikes: 6091, avgComments: 94, engagementRate: 0.1404 } },
    logo: { with: { posts: 999, avgLikes: 9416, avgComments: 124, engagementRate: 0.1955 }, without: { posts: 710, avgLikes: 2925, avgComments: 54, engagementRate: 0.0894 } },
    collab: { with: { posts: 73, avgLikes: 19179, avgComments: 160, engagementRate: 0.2408 }, without: { posts: 1636, avgLikes: 6163, avgComments: 92, engagementRate: 0.1538 } }
  },
  'MENS_BASKETBALL': {
    mention: { with: { posts: 82, avgLikes: 4530, avgComments: 35, engagementRate: 0.0983 }, without: { posts: 176, avgLikes: 2177, avgComments: 36, engagementRate: 0.0497 } },
    logo: { with: { posts: 146, avgLikes: 4178, avgComments: 43, engagementRate: 0.0967 }, without: { posts: 112, avgLikes: 1291, avgComments: 26, engagementRate: 0.028 } },
    collab: { with: { posts: 13, avgLikes: 6693, avgComments: 51, engagementRate: 0.2048 }, without: { posts: 245, avgLikes: 2725, avgComments: 35, engagementRate: 0.0603 } }
  },
  'MENS_WRESTLING': {
    mention: { with: { posts: 139, avgLikes: 2261, avgComments: 25, engagementRate: 0.3016 }, without: { posts: 218, avgLikes: 1307, avgComments: 21, engagementRate: 0.2123 } },
    logo: { with: { posts: 187, avgLikes: 1936, avgComments: 25, engagementRate: 0.2884 }, without: { posts: 170, avgLikes: 1395, avgComments: 20, engagementRate: 0.21 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 357, avgLikes: 1678, avgComments: 23, engagementRate: 0.2512 } }
  },
  'WOMENS_BASKETBALL': {
    mention: { with: { posts: 105, avgLikes: 1452, avgComments: 18, engagementRate: 0.0969 }, without: { posts: 109, avgLikes: 1992, avgComments: 54, engagementRate: 0.1411 } },
    logo: { with: { posts: 134, avgLikes: 1790, avgComments: 28, engagementRate: 0.1178 }, without: { posts: 80, avgLikes: 1621, avgComments: 50, engagementRate: 0.121 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 214, avgLikes: 1727, avgComments: 36, engagementRate: 0.1189 } }
  },
  'MENS_GYMNASTICS': {
    mention: { with: { posts: 58, avgLikes: 3602, avgComments: 23, engagementRate: 1.1645 }, without: { posts: 202, avgLikes: 423, avgComments: 29, engagementRate: 0.1405 } },
    logo: { with: { posts: 98, avgLikes: 2193, avgComments: 29, engagementRate: 0.6433 }, without: { posts: 162, avgLikes: 490, avgComments: 27, engagementRate: 0.1704 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 260, avgLikes: 1132, avgComments: 28, engagementRate: 0.3632 } }
  }
};

const fallbackTeamFollowersBySport: Record<string, number> = {
  FENCING: 5082,
  WOMENS_SOCCER: 24623,
  MENS_TENNIS: 8102,
  MENS_SOCCER: 33516,
  MENS_BASKETBALL: 221116,
  WOMENS_GOLF: 6370,
  TRACK_AND_FIELD: 59348,
  MENS_GOLF: 16802,
  WOMENS_VOLLEYBALL: 78505,
  WOMENS_GYMNASTICS: 58197,
  MENS_HOCKEY: 50004,
  MENS_LACROSSE: 71497,
  WOMENS_BASKETBALL: 44648,
  FOOTBALL: 1529934,
  SOFTBALL: 39411,
  WOMENS_TENNIS: 4355,
  SWIMMING_AND_DIVING: 17053,
  BASEBALL: 81936,
};

const big10Schools = [
  { name: 'Nebraska', conf: 'Big 10', posts: 4026, adoption: 50.8, logo: 47.5, mention: 15.4, collab: 2.9, followers: 3126161 },
  { name: 'Maryland', conf: 'Big 10', posts: 2790, adoption: 47.5, logo: 40.8, mention: 17.6, collab: 3.5, followers: 863472 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.1, logo: 50.0, mention: 0.0, collab: 0.1, followers: 2381406 },
  { name: 'Ohio State', conf: 'Big 10', posts: 12384, adoption: 47.8, logo: 42.4, mention: 20.2, collab: 1.6, followers: 5546349 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2887, adoption: 45.1, logo: 39.9, mention: 15.4, collab: 4.0, followers: 827265 },
  { name: 'Indiana', conf: 'Big 10', posts: 2604, adoption: 41.2, logo: 35.6, mention: 5.3, collab: 1.8, followers: 1198872 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logo: 39.7, mention: 16.8, collab: 2.1, followers: 4114531 },
  { name: 'Purdue', conf: 'Big 10', posts: 5286, adoption: 36.5, logo: 34.1, mention: 12.8, collab: 3.4, followers: 1299880 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2754, adoption: 32.8, logo: 26.6, mention: 5.1, collab: 2.3, followers: 702547 },
  { name: 'Iowa', conf: 'Big 10', posts: 3002, adoption: 33.3, logo: 25.4, mention: 6.9, collab: 2.5, followers: 1004448 },
  { name: 'Washington', conf: 'Big 10', posts: 2949, adoption: 27.6, logo: 20.8, mention: 4.0, collab: 5.3, followers: 1005485 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.2, logo: 11.5, mention: 0.0, collab: 5.4, followers: 882398 },
  { name: 'Illinois', conf: 'Big 10', posts: 3328, adoption: 16.3, logo: 10.3, mention: 4.8, collab: 2.3, followers: 956415 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5982, adoption: 12.0, logo: 11.0, mention: 0.2, collab: 1.3, followers: 1812655 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 11.6, logo: 8.7, mention: 0.3, collab: 3.4, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 11.0, logo: 8.6, mention: 0.2, collab: 2.8, followers: 4376029 },
  { name: 'Oregon', conf: 'Big 10', posts: 2683, adoption: 43.2, logo: 34.9, mention: 7.2, collab: 3.8, followers: 1904523 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1577, adoption: 60.1, logo: 57.8, mention: 14.5, collab: 1.3, followers: 406916 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 55.6, logo: 53.3, mention: 21.7, collab: 4.6, followers: 304204 },
  { name: 'Kentucky', conf: 'SEC', posts: 2900, adoption: 53.4, logo: 47.0, mention: 13.7, collab: 6.7, followers: 1671393 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 53.0, logo: 52.4, mention: 0.0, collab: 1.2, followers: 957605 },
  { name: 'Texas A&M', conf: 'SEC', posts: 4316, adoption: 51.4, logo: 46.8, mention: 19.8, collab: 3.2, followers: 1878601 },
  { name: 'Virginia Tech', conf: 'ACC', posts: 3978, adoption: 51.3, logo: 48.4, mention: 15.2, collab: 0.1, followers: 1872167 },
  { name: 'Nebraska', conf: 'Big 10', posts: 4026, adoption: 50.8, logo: 47.5, mention: 15.4, collab: 2.9, followers: 3126161 },
  { name: 'Washington State', conf: 'Pac-12', posts: 948, adoption: 50.4, logo: 46.1, mention: 19.4, collab: 4.7, followers: 186487 },
  { name: 'Maryland', conf: 'Big 10', posts: 2790, adoption: 47.5, logo: 40.8, mention: 17.6, collab: 3.5, followers: 863472 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.1, logo: 50.0, mention: 0.0, collab: 0.1, followers: 2381406 },
  { name: 'Miami', conf: 'ACC', posts: 2083, adoption: 49.4, logo: 44.7, mention: 1.5, collab: 7.0, followers: 1703801 },
  { name: 'Notre Dame', conf: 'ACC', posts: 2786, adoption: 48.9, logo: 46.8, mention: 18.9, collab: 0.1, followers: 1578114 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.7, logo: 47.3, mention: 0.0, collab: 4.0, followers: 1237637 },
  { name: 'Ohio State', conf: 'Big 10', posts: 12384, adoption: 47.8, logo: 42.4, mention: 20.2, collab: 1.6, followers: 5546349 },
  { name: 'Auburn', conf: 'SEC', posts: 6405, adoption: 48.1, logo: 40.0, mention: 21.7, collab: 8.9, followers: 2323541 },
  { name: 'Oregon', conf: 'Big 10', posts: 2683, adoption: 43.2, logo: 34.9, mention: 7.2, collab: 3.8, followers: 1904523 },
  { name: 'LSU', conf: 'SEC', posts: 5454, adoption: 46.1, logo: 40.7, mention: 14.7, collab: 3.3, followers: 5170563 },
  { name: 'UTSA', conf: 'AAC', posts: 3773, adoption: 46.0, logo: 39.7, mention: 16.9, collab: 10.8, followers: 835260 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2813, adoption: 45.6, logo: 45.6, mention: 0.0, collab: 0.0, followers: 1703577 },
  { name: 'NC State', conf: 'ACC', posts: 2565, adoption: 45.6, logo: 44.7, mention: 0.0, collab: 3.1, followers: 1238519 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2887, adoption: 45.1, logo: 39.9, mention: 15.4, collab: 4.0, followers: 827265 },
  { name: 'Baylor', conf: 'Big 12', posts: 7298, adoption: 45.1, logo: 41.0, mention: 21.4, collab: 4.5, followers: 2110678 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 44.8, logo: 40.9, mention: 17.9, collab: 2.6, followers: 347584 },
  { name: 'UCF', conf: 'Big 12', posts: 2409, adoption: 44.3, logo: 40.5, mention: 8.0, collab: 7.1, followers: 1202431 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4968, adoption: 43.7, logo: 39.6, mention: 16.2, collab: 1.1, followers: 1043067 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logo: 39.7, mention: 16.8, collab: 2.1, followers: 4114531 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.5, logo: 43.1, mention: 0.0, collab: 1.3, followers: 2032007 },
  { name: 'Indiana', conf: 'Big 10', posts: 2604, adoption: 41.2, logo: 35.6, mention: 5.3, collab: 1.8, followers: 1198872 },
  { name: 'Arizona', conf: 'Big 12', posts: 4371, adoption: 43.1, logo: 41.1, mention: 9.6, collab: 1.7, followers: 3260269 },
  { name: 'Missouri', conf: 'SEC', posts: 5726, adoption: 42.3, logo: 38.1, mention: 20.5, collab: 2.0, followers: 1271953 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.7, logo: 41.7, mention: 0.0, collab: 0.0, followers: 956180 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logo: 41.5, mention: 0.0, collab: 0.5, followers: 994666 },
  { name: 'Alabama', conf: 'SEC', posts: 5742, adoption: 40.4, logo: 37.5, mention: 16.9, collab: 2.6, followers: 3966222 },
  { name: 'Georgia Tech', conf: 'ACC', posts: 2066, adoption: 40.4, logo: 38.9, mention: 0.0, collab: 5.6, followers: 990980 },
  { name: 'Florida State', conf: 'ACC', posts: 2130, adoption: 40.1, logo: 40.1, mention: 0.0, collab: 0.0, followers: 1333391 },
  { name: 'Virginia', conf: 'ACC', posts: 6496, adoption: 40.0, logo: 37.1, mention: 16.5, collab: 1.4, followers: 2044598 },
  { name: 'Boston College', conf: 'ACC', posts: 1539, adoption: 40.0, logo: 38.6, mention: 0.0, collab: 6.1, followers: 590503 },
  { name: 'Arkansas', conf: 'SEC', posts: 5711, adoption: 36.6, logo: 34.2, mention: 10.6, collab: 0.9, followers: 2827038 },
  { name: 'DePaul', conf: 'Big East', posts: 746, adoption: 36.5, logo: 35.7, mention: 0.0, collab: 3.1, followers: 121473 },
  { name: 'Purdue', conf: 'Big 10', posts: 5286, adoption: 36.5, logo: 34.1, mention: 12.8, collab: 3.4, followers: 1299880 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2754, adoption: 32.8, logo: 26.6, mention: 5.1, collab: 2.3, followers: 702547 },
  { name: 'Arizona State', conf: 'Big 12', posts: 7777, adoption: 34.4, logo: 32.0, mention: 9.9, collab: 3.4, followers: 2269788 },
  { name: 'Mississippi', conf: 'SEC', posts: 2239, adoption: 34.4, logo: 34.4, mention: 0.0, collab: 0.0, followers: 986747 },
  { name: 'BYU', conf: 'Big 12', posts: 7519, adoption: 34.3, logo: 31.6, mention: 10.1, collab: 2.3, followers: 2693744 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 33.8, logo: 32.4, mention: 12.0, collab: 0.3, followers: 403604 },
  { name: 'Iowa', conf: 'Big 10', posts: 3002, adoption: 33.3, logo: 25.4, mention: 6.9, collab: 2.5, followers: 1004448 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 30.0, logo: 29.3, mention: 0.0, collab: 1.1, followers: 962963 },
  { name: 'Washington', conf: 'Big 10', posts: 2949, adoption: 27.6, logo: 20.8, mention: 4.0, collab: 5.3, followers: 1005485 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.8, logo: 26.7, mention: 0.0, collab: 0.0, followers: 907225 },
  { name: 'Texas', conf: 'SEC', posts: 6196, adoption: 26.4, logo: 25.2, mention: 0.4, collab: 1.8, followers: 3552007 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.8, logo: 25.8, mention: 0.0, collab: 0.0, followers: 732360 },
  { name: 'San Diego', conf: 'WCC', posts: 2024, adoption: 25.2, logo: 23.2, mention: 9.2, collab: 0.0, followers: 439463 },
  { name: 'Creighton', conf: 'Big East', posts: 2592, adoption: 24.6, logo: 20.7, mention: 8.6, collab: 2.0, followers: 438009 },
  { name: 'Colorado', conf: 'Big 12', posts: 1418, adoption: 24.6, logo: 24.6, mention: 0.0, collab: 0.0, followers: 1506666 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.1, logo: 22.5, mention: 0.0, collab: 0.8, followers: 1266884 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.6, logo: 22.5, mention: 0.0, collab: 0.1, followers: 1238932 },
  { name: 'Clemson', conf: 'ACC', posts: 3351, adoption: 20.4, logo: 17.5, mention: 1.2, collab: 2.6, followers: 1726437 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1680, adoption: 18.3, logo: 18.3, mention: 0.0, collab: 0.0, followers: 634620 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logo: 18.2, mention: 0.0, collab: 0.0, followers: 1383229 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1934, adoption: 18.0, logo: 18.0, mention: 0.0, collab: 0.0, followers: 1059619 },
  { name: 'Duke', conf: 'ACC', posts: 1951, adoption: 16.6, logo: 15.5, mention: 0.0, collab: 1.9, followers: 1435498 },
  { name: 'UNC', conf: 'ACC', posts: 3056, adoption: 16.3, logo: 15.7, mention: 0.5, collab: 0.2, followers: 1434088 },
  { name: 'Providence', conf: 'Big East', posts: 679, adoption: 15.8, logo: 12.7, mention: 0.0, collab: 4.7, followers: 366758 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.2, logo: 11.5, mention: 0.0, collab: 5.4, followers: 882398 },
  { name: 'Georgia', conf: 'SEC', posts: 5376, adoption: 14.8, logo: 13.5, mention: 0.8, collab: 0.9, followers: 2864099 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 13.8, logo: 12.4, mention: 0.0, collab: 1.7, followers: 1848323 },
  { name: 'Illinois', conf: 'Big 10', posts: 3328, adoption: 16.3, logo: 10.3, mention: 4.8, collab: 2.3, followers: 956415 },
  { name: 'Florida', conf: 'SEC', posts: 2735, adoption: 12.7, logo: 12.7, mention: 0.0, collab: 0.0, followers: 3163738 },
  { name: 'Boise State', conf: 'MWC', posts: 4000, adoption: 12.3, logo: 11.8, mention: 0.0, collab: 1.0, followers: 724157 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5982, adoption: 12.0, logo: 11.0, mention: 0.2, collab: 1.3, followers: 1812655 },
  { name: 'Pittsburgh', conf: 'ACC', posts: 2475, adoption: 11.8, logo: 11.6, mention: 0.0, collab: 0.2, followers: 740916 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 11.6, logo: 8.7, mention: 0.3, collab: 3.4, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 11.0, logo: 8.6, mention: 0.2, collab: 2.8, followers: 4376029 },
  { name: 'Robert Morris', conf: 'Horizon', posts: 2687, adoption: 7.4, logo: 7.4, mention: 0.0, collab: 0.0, followers: 465010 },
];

const conferenceAvg = { adoption: 33.8, logo: 31.6, mention: 5.8, collab: 2.3 };
const ncaaD1Avg = { adoption: 34.7, logo: 32.7, mention: 6.2, collab: 2.2 };
// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}
function formatCurrency(num: number): string {
  if (num >= 1000000) return '$' + (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
  return '$' + num.toFixed(0);
}
function formatPercent(num: number, decimals = 2): string {
  return (num * 100).toFixed(decimals) + '%';
}
function formatDelta(num: number): string {
  const sign = num >= 0 ? '+' : '';
  return sign + num.toFixed(1) + '%';
}
function formatLift(num: number): string {
  if (num >= 0) return '+' + num.toFixed(1) + 'x';
  return num.toFixed(1) + 'x';
}
function calculateEMV(likes: number, comments: number): number {
  return (likes * 0.5) + (comments * 1.5);
}

// ═══════════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ═══════════════════════════════════════════════════════════════
type TabId = 'overview' | 'withvswithout' | 'partnerships' | 'bestcollaborators' | 'benchmark' | 'content' | 'teampages';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'withvswithout', label: 'IP Comparison' },
  { id: 'partnerships', label: 'Sponsored Posts' },
  { id: 'benchmark', label: 'Rankings' },
  { id: 'content', label: 'Content' },
  { id: 'teampages', label: 'Team Socials' },
];
// ═══════════════════════════════════════════════════════════════
// SECTION HEADER - Two-tone Oswald header
// ═══════════════════════════════════════════════════════════════
function SectionHeader({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <h2
      style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
      className="text-2xl md:text-3xl font-bold uppercase tracking-tight"
    >
      <span style={{ color: colors.scarlet }}>{primary}</span>
      <span style={{ color: colors.headerGray }}>{secondary}</span>
    </h2>
  );
}

// ═══════════════════════════════════════════════════════════════
// GLASS CARD - Reusable card with scarlet accent top border
// ═══════════════════════════════════════════════════════════════
function GlassCard({
  children,
  className = '',
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl ${noPadding ? '' : 'p-5'} ${className}`}
      style={{
        borderTop: `2px solid ${colors.scarlet}`,
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        transition,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -1px rgb(0 0 0 / 0.06)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)';
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOOLTIP - Group hover tooltip
// ═══════════════════════════════════════════════════════════════
function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-[9999]">
        <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl max-w-sm text-center">
          {content}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SEGMENTED TOGGLE - Premium toggle with scarlet gradient active
// ═══════════════════════════════════════════════════════════════
function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div
      className="inline-flex rounded-xl p-1 gap-0.5"
      style={{ backgroundColor: colors.lightBg, border: `1px solid ${colors.glassBorder}` }}
    >
      {options.map((option) => {
        const isActive = value === option.id;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className="px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${colors.scarlet} 0%, ${colors.scarletDark} 100%)`
                : 'transparent',
              color: isActive ? colors.white : colors.textMuted,
              transition,
              boxShadow: isActive ? '0 2px 8px rgba(186, 12, 47, 0.3)' : 'none',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI CHIP - Small KPI badge for the hero row
// ═══════════════════════════════════════════════════════════════
function KPIChip({
  label,
  value,
  icon,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div
      className="rounded-xl p-4 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[120px]"
      style={{ backgroundColor: colors.scarlet, transition }}
    >
      <div className="absolute top-3 right-3 opacity-20">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">{label}</p>
      <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-white/80">{subtitle}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// IP MODE CARD - Performance by IP mode
// ═══════════════════════════════════════════════════════════════
function IPModeCard({
  title,
  icon,
  posts,
  delta,
  avgEngagement,
  emv,
  tooltip,
  opportunity,
}: {
  title: string;
  icon: React.ReactNode;
  posts: number;
  delta: number;
  avgEngagement: string;
  emv: string;
  tooltip: string;
  opportunity?: string;
}) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${colors.scarlet}15` }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold uppercase tracking-wide text-gray-900">{title}</h3>
              <Tooltip content={tooltip}>
                <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-xs text-gray-500">{posts} posts with this signal</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-xs uppercase tracking-wider text-gray-500">Engagement Delta vs Baseline</p>
          <Tooltip content="Percent difference vs baseline engagement rate.">
            <Info className="w-3 h-3 text-gray-400 cursor-help" />
          </Tooltip>
        </div>
        <p
          className="text-3xl font-black"
          style={{ color: delta >= 0 ? colors.positive : colors.negative }}
        >
          {formatDelta(delta)}
        </p>
        <p className="text-xs text-gray-500">vs posts without {title.toLowerCase()}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1 text-gray-500">Avg Eng</p>
          <p className="font-bold text-gray-900">{avgEngagement}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider mb-1 text-gray-500">EMV</p>
          <p className="font-bold text-gray-900">{emv}</p>
        </div>
      </div>

      {opportunity && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.scarlet }} />
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: colors.scarlet }}>
                Opportunity
              </p>
              <p className="text-xs text-gray-600">{opportunity}</p>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════════════════
function OverviewTab({ overviewData }: { overviewData?: OverviewData | null }) {
  const overview = overviewData ?? {
    totalPosts: ipData.totalPosts,
    totalLikes: ipData.totalLikes,
    totalComments: ipData.totalComments,
    postsWithIP: ipData.postsWithIP,
    ipAdoptionRate: ipData.ipAdoptionRate,
    avgLift: ipData.avgLift,
    totalEmv: (ipData.totalLikes * 0.5) + (ipData.totalComments * 1.5),
    collaboration: ipData.collaboration,
    logo: ipData.logo,
    mention: ipData.mention,
  };
  const totalInteractions = overview.totalLikes + overview.totalComments;
  const collabEMV = overview.collaboration.posts * calculateEMV(overview.collaboration.likes, overview.collaboration.comments);
  const logoEMV = overview.logo.posts * calculateEMV(overview.logo.likes, overview.logo.comments);
  const mentionEMV = overview.mention.posts * calculateEMV(overview.mention.likes, overview.mention.comments);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div
        className="bg-white rounded-2xl shadow-sm px-6 py-8 md:px-10 md:py-10"
        style={{ borderTop: `2px solid ${colors.scarlet}` }}
      >
        <h1
          style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
          className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2"
        >
          <span style={{ color: colors.scarlet }}>Ohio State </span>
          <span style={{ color: colors.headerGray }}>Athlete Overview</span>
        </h1>

        {/* KPI Chips Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIChip
            label="Total Followers"
            value={formatNumber(ipData.totalFollowers)}
            icon={<Users className="w-8 h-8 text-white" />}
            subtitle="Combined athlete audience"
          />
          <KPIChip
            label="Total Interactions"
            value={formatNumber(totalInteractions)}
            icon={<Heart className="w-8 h-8 text-white" />}
            subtitle="Likes + Comments"
          />
          <KPIChip
            label="Posts with IP"
            value={formatNumber(overview.postsWithIP)}
            icon={<FileText className="w-8 h-8 text-white" />}
            subtitle={`Out of ${formatNumber(overview.totalPosts)} posts`}
          />
          <KPIChip
            label="Total EMV"
            value={formatCurrency(overview.totalEmv)}
            icon={<DollarSign className="w-8 h-8 text-white" />}
            subtitle="Estimated earned media value"
          />
        </div>
      </div>

      {/* Key Insights Module */}
      <div>
        <div className="mb-4">
          <SectionHeader primary="KEY " secondary="INSIGHTS" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.scarlet}15` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Collaboration posts drive{' '}
                <span className="font-bold" style={{ color: colors.scarlet }}>
                  {overview.collaboration.delta.toFixed(2)}% higher engagement
                </span>{' '}
                -- the strongest IP signal.
              </p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.scarlet}15` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Ohio State leads Big Ten in mention rate at{' '}
                <span className="font-bold" style={{ color: colors.scarlet }}>21.6%</span>, outperforming
                the conference avg by{' '}
                <span className="font-bold" style={{ color: colors.scarlet }}>15.0%</span>.
              </p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.scarlet}15` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: colors.scarlet }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold">{formatNumber(overview.postsWithIP)} posts</span> ({overview.ipAdoptionRate}%) feature Ohio State IP,
                generating{' '}
                <span className="font-bold" style={{ color: colors.scarlet }}>
                  {formatCurrency(overview.totalEmv)}
                </span>{' '}
                in earned media value.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Performance by IP Mode */}
      <div>
        <div className="mb-4">
          <SectionHeader primary="PERFORMANCE " secondary="BY IP MODE" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <IPModeCard
            title="Collaboration"
            icon={<Handshake className="w-5 h-5" style={{ color: colors.scarlet }} />}
            posts={overview.collaboration.posts}
            delta={overview.collaboration.delta}
            avgEngagement={formatPercent(overview.collaboration.engagementRate)}
            emv={formatCurrency(collabEMV)}
            tooltip="Athlete posts co-authored or tagged with official Ohio State account"
            opportunity={`Only ${formatNumber(overview.collaboration.posts)} collab posts exist. Scaling collaborations could significantly amplify total EMV.`}
          />
          <IPModeCard
            title="Visual IP"
            icon={<Camera className="w-5 h-5" style={{ color: colors.scarlet }} />}
            posts={overview.logo.posts}
            delta={overview.logo.delta}
            avgEngagement={formatPercent(overview.logo.engagementRate)}
            emv={formatCurrency(logoEMV)}
            tooltip="Athlete posts with Ohio State logo detected in media"
            opportunity="Logo usage at 8.2% trails Big Ten avg of 27.0%. Increasing visual IP adoption is the biggest growth lever."
          />
          <IPModeCard
            title="Mention"
            icon={<AtSign className="w-5 h-5" style={{ color: colors.scarlet }} />}
            posts={overview.mention.posts}
            delta={overview.mention.delta}
            avgEngagement={formatPercent(overview.mention.engagementRate)}
            emv={formatCurrency(mentionEMV)}
            tooltip="Athlete posts with @mention or text reference to Ohio State"
            opportunity="Mention rate leads Big Ten at 21.6%. Continue encouraging organic @OhioStateFB references."
          />
        </div>
      </div>

      {/* Data Source Context Banner */}
      <div
        className="rounded-2xl px-5 py-4 flex items-start gap-3"
        style={{
          backgroundColor: `${colors.accent}08`,
          border: `1px solid ${colors.accent}20`,
        }}
      >
        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-1">Data Source Context</p>
          <p className="text-sm text-gray-600">
            Data reflects <span className="font-semibold">Ohio State athlete personal social media accounts</span>, including collaboration posts with official team pages.
            Metrics track how athletes use Ohio State IP (logos, mentions, collaborations) in their content.
            EMV calculated as: (Total Likes x $0.50) + (Total Comments x $1.50). Analysis covers{' '}
            <span className="font-semibold">{formatNumber(overview.totalPosts)} posts</span> from{' '}
            <span className="font-semibold">{formatNumber(ipData.totalFollowers)} combined followers</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// WITH VS WITHOUT TAB
// ═══════════════════════════════════════════════════════════════
function WithVsWithoutTab({
  sportData,
  overviewData,
}: {
  sportData: SportSignalData;
  overviewData?: OverviewData | null;
}) {
  const [selectedSignal, setSelectedSignal] = useState<'collab' | 'logo' | 'mention'>('mention');
  const [selectedMetric, setSelectedMetric] = useState<'engagement' | 'likes' | 'comments'>('engagement');
  const [selectedSport, setSelectedSport] = useState<string>('ALL_SPORTS');

  const sports = useMemo(() => {
    const sportKeys = Object.keys(sportData)
      .filter((key) => key !== 'ALL_SPORTS')
      .sort((a, b) => formatSportLabel(a).localeCompare(formatSportLabel(b)));

    return [
      { id: 'ALL_SPORTS', label: 'All Sports' },
      ...sportKeys.map((key) => ({ id: key, label: formatSportLabel(key) })),
    ];
  }, [sportData]);

  useEffect(() => {
    if (!sports.some((sport) => sport.id === selectedSport)) {
      setSelectedSport('ALL_SPORTS');
    }
  }, [sports, selectedSport]);

  const overviewSignalData = overviewData ?? {
    collaboration: ipData.collaboration,
    logo: ipData.logo,
    mention: ipData.mention,
  };

  const signals: { id: 'collab' | 'logo' | 'mention'; label: string; data: IPSignalData }[] = [
    { id: 'collab', label: 'Collab', data: overviewSignalData.collaboration },
    { id: 'logo', label: 'Visual IP', data: overviewSignalData.logo },
    { id: 'mention', label: 'Mention', data: overviewSignalData.mention },
  ];

  const metrics: { id: 'engagement' | 'likes' | 'comments'; label: string }[] = [
    { id: 'engagement', label: 'Engagement Rate' },
    { id: 'likes', label: 'Avg Likes' },
    { id: 'comments', label: 'Avg Comments' },
  ];

  const currentSignal = signals.find((s) => s.id === selectedSignal);

  const hasUsableSignalData = (data?: SignalComparison): boolean => {
    if (!data) return false;
    const totalPosts = (data.with.posts || 0) + (data.without.posts || 0);
    const hasMetrics =
      data.with.avgLikes > 0 ||
      data.with.avgComments > 0 ||
      data.with.engagementRate > 0 ||
      data.without.avgLikes > 0 ||
      data.without.avgComments > 0 ||
      data.without.engagementRate > 0;
    return totalPosts > 0 && hasMetrics;
  };

  const dynamicSelectedSignalData = sportData[selectedSport]?.[selectedSignal];
  const fallbackSelectedSignalData = fallbackSportData[selectedSport]?.[selectedSignal];
  const dynamicAllSportsSignalData = sportData.ALL_SPORTS?.[selectedSignal];
  const fallbackAllSportsSignalData = fallbackSportData.ALL_SPORTS?.[selectedSignal];

  const currentSignalData =
    (hasUsableSignalData(dynamicSelectedSignalData) ? dynamicSelectedSignalData : undefined)
    ?? (hasUsableSignalData(fallbackSelectedSignalData) ? fallbackSelectedSignalData : undefined)
    ?? (hasUsableSignalData(dynamicAllSportsSignalData) ? dynamicAllSportsSignalData : undefined)
    ?? fallbackAllSportsSignalData;

  const withoutEngRate = currentSignalData?.without?.engagementRate ?? currentSignal?.data?.baselineEngRate ?? 0;
  const withEngRate = currentSignalData?.with?.engagementRate ?? currentSignal?.data?.engagementRate ?? 0;
  const withoutPosts = currentSignalData?.without?.posts ?? currentSignal?.data?.baselinePosts ?? 0;
  const withPosts = currentSignalData?.with?.posts ?? currentSignal?.data?.posts ?? 0;

  // Avg likes/comments per post from sport data.
  const baselineAvgLikes = currentSignalData?.without?.avgLikes ?? currentSignal?.data?.baselineLikes ?? 0;
  const baselineAvgComments = currentSignalData?.without?.avgComments ?? currentSignal?.data?.baselineComments ?? 0;
  const withAvgLikes = currentSignalData?.with?.avgLikes ?? currentSignal?.data?.likes ?? 0;
  const withAvgComments = currentSignalData?.with?.avgComments ?? currentSignal?.data?.comments ?? 0;

  // Calculate deltas
  const engDelta = withoutEngRate > 0 ? ((withEngRate - withoutEngRate) / withoutEngRate) * 100 : 0;
  const likesDelta = baselineAvgLikes > 0 ? ((withAvgLikes - baselineAvgLikes) / baselineAvgLikes) * 100 : 0;
  const commentsDelta = baselineAvgComments > 0 ? ((withAvgComments - baselineAvgComments) / baselineAvgComments) * 100 : 0;

  // Get current metric values based on selection
  const getMetricValues = () => {
    switch (selectedMetric) {
      case 'engagement':
        return {
          withoutValue: formatPercent(withoutEngRate),
          withValue: formatPercent(withEngRate),
          withoutRaw: withoutEngRate,
          withRaw: withEngRate,
          delta: engDelta,
          isPercent: true,
        };
      case 'likes':
        return {
          withoutValue: formatNumber(Math.round(baselineAvgLikes)),
          withValue: formatNumber(Math.round(withAvgLikes)),
          withoutRaw: baselineAvgLikes,
          withRaw: withAvgLikes,
          delta: likesDelta,
          isPercent: false,
        };
      case 'comments':
        return {
          withoutValue: formatNumber(Math.round(baselineAvgComments)),
          withValue: formatNumber(Math.round(withAvgComments)),
          withoutRaw: baselineAvgComments,
          withRaw: withAvgComments,
          delta: commentsDelta,
          isPercent: false,
        };
    }
  };

  const metricValues = getMetricValues();
  const getLiftBarWidth = (delta: number) => Math.min(Math.abs(delta), 300) / 3;

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl border p-5 md:p-6"
        style={{ borderColor: colors.glassBorder, background: 'linear-gradient(180deg, #fff 0%, #fafafa 100%)' }}
      >
        <p
          className="text-2xl md:text-3xl font-black leading-tight"
          style={{ color: colors.text }}
        >
          Posts with Ohio State {currentSignal?.label.toLowerCase()} drive{' '}
          <span style={{ color: colors.scarlet }}>{formatDelta(engDelta)}</span> higher engagement rate.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${colors.scarlet}12`, color: colors.scarlet }}
          >
            {formatSportLabel(selectedSport)}
          </span>
          <span className="text-xs text-gray-500">
            Signal: {currentSignal?.label}
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-5">
        {/* Sport Filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Team / Sport</p>
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2.5 pr-10 text-sm font-semibold rounded-xl border appearance-none cursor-pointer"
              style={{
                backgroundColor: colors.white,
                color: colors.text,
                borderColor: colors.glassBorder,
                transition,
              }}
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Signal Filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">IP Signal</p>
          <div
            className="inline-flex rounded-xl p-1"
            style={{ backgroundColor: colors.lightBg, border: `1px solid ${colors.glassBorder}` }}
          >
            {signals.map((signal) => {
              const isActive = selectedSignal === signal.id;
              return (
                <button
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal.id)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all motion-reduce:transition-none"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${colors.scarlet} 0%, ${colors.scarletDark} 100%)`
                      : 'transparent',
                    color: isActive ? colors.white : colors.textMuted,
                    boxShadow: isActive ? '0 2px 8px rgba(186, 12, 47, 0.28)' : 'none',
                  }}
                >
                  {signal.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric Filter */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Metric</p>
          <SegmentedToggle
            options={metrics}
            value={selectedMetric}
            onChange={setSelectedMetric}
          />
        </div>
      </div>

      <GlassCard>
        {/* Header */}
        <div className="mb-5">
          <p className="text-sm font-bold text-gray-800">
            {currentSignal?.label} Impact on {metrics.find(m => m.id === selectedMetric)?.label}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Posts using {currentSignal?.label?.toLowerCase()} vs posts without {currentSignal?.label?.toLowerCase()}
          </p>
        </div>

        {/* Bar Comparison */}
        {(() => {
          const withRaw = metricValues.withRaw;
          const withoutRaw = metricValues.withoutRaw;
          const maxVal = Math.max(withRaw, withoutRaw, 0.001);
          const withoutBarWidth = (withoutRaw / maxVal) * 100;
          const withBarWidth = (withRaw / maxVal) * 100;
          const multiplier = withoutRaw > 0 ? (withRaw / withoutRaw) : 0;
          return (
            <div className="space-y-4">
              {/* WITHOUT bar */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Without {currentSignal?.label}</p>
                  <p className="text-lg font-black text-gray-600">{metricValues.withoutValue}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-lg h-8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg"
                    style={{ backgroundColor: '#D1D5DB' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(withoutBarWidth, 2)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{formatNumber(withoutPosts)} posts</p>
              </div>

              {/* WITH bar */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.scarlet }}>With {currentSignal?.label}</p>
                  <p className="text-lg font-black" style={{ color: colors.scarlet }}>{metricValues.withValue}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-lg h-8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${colors.scarlet} 0%, ${colors.scarletDark || colors.scarlet} 100%)`,
                      boxShadow: `0 2px 8px ${colors.scarlet}33`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(withBarWidth, 2)}%` }}
                    transition={{ duration: 1.0, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{formatNumber(withPosts)} posts</p>
              </div>

              {/* Lift Indicator */}
              <div className="text-center pt-3 border-t border-gray-100">
                <p className="text-3xl font-black" style={{ color: colors.scarlet }}>
                  {formatDelta(metricValues.delta)} <span className="text-base font-bold text-gray-400">{metrics.find(m => m.id === selectedMetric)?.label} Lift</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Posts featuring {currentSignal?.label?.toLowerCase()} generate{' '}
                  <span className="font-semibold text-gray-600">{multiplier.toFixed(1)}x</span> higher {metrics.find(m => m.id === selectedMetric)?.label?.toLowerCase()}.
                </p>
              </div>
            </div>
          );
        })()}
      </GlassCard>

      {/* Detailed Comparison Table */}
      <GlassCard noPadding>
        <div className="p-5 border-b border-gray-100">
          <SectionHeader primary="DETAILED " secondary="COMPARISON" />
          <p className="text-sm text-gray-500 mt-2">
            Complete performance breakdown with and without {currentSignal?.label}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: colors.lightBg }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0" style={{ backgroundColor: colors.lightBg }}>
                  Metric
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0" style={{ backgroundColor: colors.lightBg }}>
                  Without {currentSignal?.label}
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0" style={{ backgroundColor: colors.lightBg }}>
                  <span className="inline-flex items-center justify-end gap-1">
                    With {currentSignal?.label}
                    <Tooltip content={`Sample size: ${formatNumber(withPosts)} with-signal posts vs ${formatNumber(withoutPosts)} without-signal posts.`}>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 sticky top-0" style={{ backgroundColor: colors.lightBg }}>
                  Lift
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Engagement Rate</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatPercent(withoutEngRate)}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatPercent(withEngRate)}</td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: engDelta >= 0 ? `${colors.positive}15` : `${colors.negative}15`,
                        color: engDelta >= 0 ? colors.positive : colors.negative,
                      }}
                    >
                      {formatDelta(engDelta)}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${getLiftBarWidth(engDelta)}%`,
                          backgroundColor: engDelta >= 0 ? colors.positive : colors.negative,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Avg Likes per Post</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(Math.round(baselineAvgLikes))}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(Math.round(withAvgLikes))}</td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: likesDelta >= 0 ? `${colors.positive}15` : `${colors.negative}15`,
                        color: likesDelta >= 0 ? colors.positive : colors.negative,
                      }}
                    >
                      {formatDelta(likesDelta)}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${getLiftBarWidth(likesDelta)}%`,
                          backgroundColor: likesDelta >= 0 ? colors.positive : colors.negative,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Avg Comments per Post</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(Math.round(baselineAvgComments))}</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(Math.round(withAvgComments))}</td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex flex-col items-end gap-1">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                      style={{
                        backgroundColor: commentsDelta >= 0 ? `${colors.positive}15` : `${colors.negative}15`,
                        color: commentsDelta >= 0 ? colors.positive : colors.negative,
                      }}
                    >
                      {formatDelta(commentsDelta)}
                    </span>
                    <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${getLiftBarWidth(commentsDelta)}%`,
                          backgroundColor: commentsDelta >= 0 ? colors.positive : colors.negative,
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">Post Volume</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(withoutPosts)} posts</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(withPosts)} posts</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs text-gray-500">
                    {((withPosts / (withPosts + withoutPosts)) * 100).toFixed(1)}% of total
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// PARTNERSHIPS TAB
// ═══════════════════════════════════════════════════════════════
function PartnershipsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Partnership>('emv');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [brandLogoMap, setBrandLogoMap] = useState<Record<string, string>>({});
  const pageSize = 20;

  const normalizeBrandKey = (brand: string) => brand.toLowerCase().replace(/^@/, '').replace(/[^a-z0-9]/g, '');
  const getBrandInitials = (brand: string) => brand.replace('@', '').trim().slice(0, 2).toUpperCase();
  const getBrandLogo = (brand: string) => brandLogoMap[normalizeBrandKey(brand)];
  const excludedPartnershipKeys = useMemo(
    () =>
      new Set([
        'on3recruits',
        'thehenrylegacy',
        'locationfootball',
        'ohiostathletics',
        'whereimfrom',
        'athleteps',
        'thecourageousathlete',
        'ohiostatefb',
        'theohiostateuniversity',
        'ohiostswimdive',
        'wrestlingbucks',
        'brodymarcet9',
        'qpeezy0',
        'alexdixon',
        'jesseleepakele',
        'bigtastyhawk',
        'nakashimabryce',
        'gabbydoesmytattts',
        'dellymedia',
        'nilstore',
        'thenilstore',
      ]),
    [],
  );

  useEffect(() => {
    let canceled = false;

    const loadBrandLogos = async () => {
      try {
        const response = await fetch('/data/socialMedia.brands.json');
        if (!response.ok) return;
        const rows = (await response.json()) as Array<{ name?: string; logo?: string }>;
        const nextMap: Record<string, string> = {};
        for (const row of rows) {
          if (!row?.name || !row?.logo) continue;
          const key = normalizeBrandKey(row.name);
          if (key && !nextMap[key]) {
            nextMap[key] = row.logo;
          }
        }
        // Override: show Fortnite logo for @epicpartner
        nextMap['epicpartner'] = 'https://storage.googleapis.com/jaba-brands-logos/fortnite.jpg';
        if (!canceled) {
          setBrandLogoMap(nextMap);
        }
      } catch {
        // Keep initials fallback when logos are unavailable.
      }
    };

    loadBrandLogos();
    return () => {
      canceled = true;
    };
  }, []);

  const sortOptions: { key: keyof Partnership; label: string; icon: React.ReactNode }[] = [
    { key: 'emv', label: 'EMV', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { key: 'avgLikes', label: 'Avg Likes', icon: <Heart className="w-3.5 h-3.5" /> },
    { key: 'avgComments', label: 'Avg Comments', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { key: 'liftMultiplier', label: 'Eng Lift', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'posts', label: 'Posts', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const getPartnershipEMV = (partnership: Partnership): number =>
    calculateEMV(partnership.avgLikes * partnership.posts, partnership.avgComments * partnership.posts);

  const eligiblePartnerships = useMemo(
    () => ipData.partnerships.filter((p) => !excludedPartnershipKeys.has(normalizeBrandKey(p.brand))),
    [excludedPartnershipKeys],
  );

  const allSorted = useMemo(() => {
    const result = [...eligiblePartnerships];
    result.sort((a, b) => {
      if (sortKey === 'emv') {
        const aEmv = getPartnershipEMV(a);
        const bEmv = getPartnershipEMV(b);
        return sortDir === 'desc' ? bEmv - aEmv : aEmv - bEmv;
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return sortDir === 'desc'
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });
    return result;
  }, [eligiblePartnerships, sortKey, sortDir]);

  const top10 = allSorted.slice(0, 10);

  const filteredAndSorted = useMemo(() => {
    let result = [...allSorted];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => p.brand.toLowerCase().includes(term));
    }
    return result;
  }, [allSorted, searchTerm]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: keyof Partnership) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Partnership }) => {
    if (sortKey !== columnKey) return null;
    return sortDir === 'desc' ? (
      <ChevronDown className="w-3.5 h-3.5 inline ml-0.5" />
    ) : (
      <ChevronUp className="w-3.5 h-3.5 inline ml-0.5" />
    );
  };

  const getDisplayValue = (p: Partnership) => {
    switch (sortKey) {
      case 'emv': return formatCurrency(getPartnershipEMV(p));
      case 'avgLikes': return formatNumber(p.avgLikes);
      case 'avgComments': return formatNumber(p.avgComments);
      case 'liftMultiplier': return formatLift(p.liftMultiplier);
      case 'posts': return p.posts.toString();
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sort By</p>
          <div className="inline-flex flex-wrap rounded-xl overflow-hidden border border-gray-200 bg-white w-fit">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleSort(option.key)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all"
                style={{
                  backgroundColor: sortKey === option.key ? colors.scarlet : 'transparent',
                  color: sortKey === option.key ? colors.white : colors.text,
                }}
              >
                {option.icon}
                <span className="hidden sm:inline">{option.label}</span>
                <span className="sm:hidden">{option.label.split(' ').pop()}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400 self-end whitespace-nowrap">
          {eligiblePartnerships.length} partnerships
        </p>
      </div>

      {/* Top 10 Highlight Cards */}
      <div>
        <div className="mb-4">
          <SectionHeader primary="TOP 10 " secondary={'BY ' + (sortOptions.find(o => o.key === sortKey)?.label.toUpperCase() || '')} />
        </div>

        {/* Desktop: 2x5 grid / Mobile: horizontal scroll */}
        <div className="hidden md:grid md:grid-cols-5 gap-3">
          {top10.map((partner, idx) => (
            <div
              key={partner.brand}
              className="rounded-2xl p-4 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
              style={{
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
                borderLeft: idx < 3 ? `4px solid ${colors.scarlet}` : '4px solid transparent',
              }}
            >
              {/* Subtle gradient bg for top 3 */}
              {idx < 3 && (
                <div
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${colors.scarlet}, transparent)` }}
                />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: idx < 3 ? colors.scarlet : '#e5e7eb',
                      color: idx < 3 ? colors.white : colors.text,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {getBrandLogo(partner.brand) ? (
                      <img
                        src={getBrandLogo(partner.brand)}
                        alt={partner.brand}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {getBrandInitials(partner.brand)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate flex-1" title={partner.brand}>
                    {partner.brand.replace('@', '')}
                  </p>
                </div>
                <p className="text-2xl font-black" style={{ color: colors.scarlet }}>
                  {getDisplayValue(partner)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {partner.posts} {partner.posts === 1 ? 'post' : 'posts'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: Horizontal scroll */}
        <div className="md:hidden -mx-4 px-4">
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            {top10.map((partner, idx) => (
              <div
                key={partner.brand}
                className="rounded-2xl p-4 bg-white flex-shrink-0 w-[160px] snap-start relative overflow-hidden"
                style={{
                  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
                  borderLeft: idx < 3 ? `4px solid ${colors.scarlet}` : '4px solid transparent',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      backgroundColor: idx < 3 ? colors.scarlet : '#e5e7eb',
                      color: idx < 3 ? colors.white : colors.text,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {getBrandLogo(partner.brand) ? (
                      <img
                        src={getBrandLogo(partner.brand)}
                        alt={partner.brand}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-500">
                        {getBrandInitials(partner.brand)}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 truncate flex-1" title={partner.brand}>
                    {partner.brand.replace('@', '')}
                  </p>
                </div>
                <p className="text-xl font-black" style={{ color: colors.scarlet }}>
                  {getDisplayValue(partner)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {partner.posts} {partner.posts === 1 ? 'post' : 'posts'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Table Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <SectionHeader primary="ALL " secondary="PARTNERSHIPS" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              style={{ '--tw-ring-color': `${colors.scarlet}40` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.scarlet }}>
                  <th className="text-center px-2 py-3.5 text-xs font-semibold uppercase tracking-wider text-white w-12">
                    #
                  </th>
                  <th
                    className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('brand')}
                  >
                    Partner <SortIcon columnKey="brand" />
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white md:hidden">
                    Partner
                  </th>
                  <th
                    className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('posts')}
                  >
                    Posts <SortIcon columnKey="posts" />
                  </th>
                  <th
                    className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('avgLikes')}
                  >
                    Avg Likes <SortIcon columnKey="avgLikes" />
                  </th>
                  <th
                    className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('avgComments')}
                  >
                    Avg Comments <SortIcon columnKey="avgComments" />
                  </th>
                  <th
                    className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell"
                    style={{ color: sortKey === 'emv' ? '#fcd34d' : '#ffffff' }}
                    onClick={() => handleSort('emv')}
                  >
                    EMV <SortIcon columnKey="emv" />
                  </th>
                  <th
                    className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell"
                    onClick={() => handleSort('liftMultiplier')}
                  >
                    Eng Lift <SortIcon columnKey="liftMultiplier" />
                  </th>
                  {/* Mobile: single value column */}
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white md:hidden">
                    {sortOptions.find(o => o.key === sortKey)?.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((partnership, index) => {
                  const globalRank = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={partnership.brand}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}
                    >
                      <td className="px-2 py-3 text-center">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                          style={{
                            backgroundColor: globalRank <= 3 ? colors.scarlet : '#e5e7eb',
                            color: globalRank <= 3 ? colors.white : colors.textMuted,
                          }}
                        >
                          {globalRank}
                        </span>
                      </td>
                      {/* Desktop: Partner name */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {getBrandLogo(partnership.brand) ? (
                              <img
                                src={getBrandLogo(partnership.brand)}
                                alt={partnership.brand}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold text-gray-400">
                                {getBrandInitials(partnership.brand)}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{partnership.brand}</span>
                        </div>
                      </td>
                      {/* Mobile: Partner + stacked details */}
                      <td className="px-4 py-3 md:hidden">
                        <div>
                          <span className="font-medium text-gray-900 text-sm">{partnership.brand}</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            <span className="text-xs text-gray-400">{partnership.posts} posts</span>
                            <span className="text-xs text-gray-400">{formatNumber(partnership.avgLikes)} likes</span>
                            <span className="text-xs" style={{ color: partnership.liftMultiplier >= 0 ? colors.positive : colors.negative }}>
                              {formatLift(partnership.liftMultiplier)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                        {partnership.posts}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 hidden md:table-cell">
                        {formatNumber(partnership.avgLikes)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 hidden md:table-cell">
                        {formatNumber(partnership.avgComments)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 hidden md:table-cell">
                        {formatCurrency(getPartnershipEMV(partnership))}
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{
                            backgroundColor: partnership.liftMultiplier >= 0 ? `${colors.positive}15` : `${colors.negative}15`,
                            color: partnership.liftMultiplier >= 0 ? colors.positive : colors.negative,
                          }}
                        >
                          {formatLift(partnership.liftMultiplier)}
                        </span>
                      </td>
                      {/* Mobile: primary metric value */}
                      <td className="px-4 py-3 text-right font-bold md:hidden" style={{ color: colors.scarlet }}>
                        {getDisplayValue(partnership)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 bg-white hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: currentPage === page ? colors.scarlet : 'transparent',
                      color: currentPage === page ? colors.white : colors.textMuted,
                    }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-40 bg-white hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BEST COLLABORATORS TAB
// ═══════════════════════════════════════════════════════════════
function BestCollaboratorsTab() {
  const [selectedSignal, setSelectedSignal] = useState<'collab' | 'logo' | 'mention'>('collab');

  const signalConfig = {
    collab: {
      label: 'Collaboration',
      shortLabel: 'Collab',
      icon: <Handshake className="w-5 h-5" />,
      athletes: topCollabAthletes,
      stats: signalStats.collab,
      description: 'Co-authored or tagged with official Ohio State account',
    },
    logo: {
      label: 'Visual IP',
      shortLabel: 'Visual IP',
      icon: <Tag className="w-5 h-5" />,
      athletes: topLogoAthletes,
      stats: signalStats.logo,
      description: 'Ohio State logo detected in post media',
    },
    mention: {
      label: 'Mention',
      shortLabel: 'Mention',
      icon: <AtSign className="w-5 h-5" />,
      athletes: topMentionAthletes,
      stats: signalStats.mention,
      description: '@mention or text reference to Ohio State',
    },
  };

  const currentConfig = signalConfig[selectedSignal];
  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Collab Summary */}
        <button
          onClick={() => setSelectedSignal('collab')}
          className="rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: selectedSignal === 'collab' ? colors.scarlet : colors.white,
            boxShadow: selectedSignal === 'collab' ? `0 8px 25px ${colors.scarlet}30` : '0 1px 3px 0 rgb(0 0 0 / 0.08)',
            border: selectedSignal === 'collab' ? 'none' : '1px solid #e5e7eb',
          }}
        >
          {selectedSignal === 'collab' && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />
          )}
          <div className="relative z-10">
            <Handshake className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: selectedSignal === 'collab' ? colors.white : colors.scarlet }} />
            <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: selectedSignal === 'collab' ? 'rgba(255,255,255,0.8)' : colors.textMuted }}>
              Collab Posts
            </p>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: selectedSignal === 'collab' ? colors.white : colors.text }}>
              {signalStats.collab.posts}
            </p>
            <p className="text-xs sm:text-sm mt-1 font-semibold" style={{ color: selectedSignal === 'collab' ? 'rgba(255,255,255,0.9)' : colors.positive }}>
              +{signalStats.collab.lift}% lift
            </p>
          </div>
        </button>

        {/* Logo Summary */}
        <button
          onClick={() => setSelectedSignal('logo')}
          className="rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: selectedSignal === 'logo' ? colors.scarlet : colors.white,
            boxShadow: selectedSignal === 'logo' ? `0 8px 25px ${colors.scarlet}30` : '0 1px 3px 0 rgb(0 0 0 / 0.08)',
            border: selectedSignal === 'logo' ? 'none' : '1px solid #e5e7eb',
          }}
        >
          {selectedSignal === 'logo' && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />
          )}
          <div className="relative z-10">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: selectedSignal === 'logo' ? colors.white : colors.scarlet }} />
            <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: selectedSignal === 'logo' ? 'rgba(255,255,255,0.8)' : colors.textMuted }}>
              Visual IP Posts
            </p>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: selectedSignal === 'logo' ? colors.white : colors.text }}>
              {formatNumber(signalStats.logo.posts)}
            </p>
            <p className="text-xs sm:text-sm mt-1 font-semibold" style={{ color: selectedSignal === 'logo' ? 'rgba(255,255,255,0.9)' : colors.positive }}>
              +{signalStats.logo.lift}% lift
            </p>
          </div>
        </button>

        {/* Mention Summary */}
        <button
          onClick={() => setSelectedSignal('mention')}
          className="rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: selectedSignal === 'mention' ? colors.scarlet : colors.white,
            boxShadow: selectedSignal === 'mention' ? `0 8px 25px ${colors.scarlet}30` : '0 1px 3px 0 rgb(0 0 0 / 0.08)',
            border: selectedSignal === 'mention' ? 'none' : '1px solid #e5e7eb',
          }}
        >
          {selectedSignal === 'mention' && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '12px 12px',
              }}
            />
          )}
          <div className="relative z-10">
            <AtSign className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: selectedSignal === 'mention' ? colors.white : colors.scarlet }} />
            <p className="text-[10px] sm:text-xs uppercase tracking-wider mb-1" style={{ color: selectedSignal === 'mention' ? 'rgba(255,255,255,0.8)' : colors.textMuted }}>
              Mention Posts
            </p>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: selectedSignal === 'mention' ? colors.white : colors.text }}>
              {formatNumber(signalStats.mention.posts)}
            </p>
            <p className="text-xs sm:text-sm mt-1 font-semibold" style={{ color: selectedSignal === 'mention' ? 'rgba(255,255,255,0.9)' : colors.positive }}>
              +{signalStats.mention.lift}% lift
            </p>
          </div>
        </button>
      </div>

      {/* Signal Strength Indicator */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${colors.scarlet}15` }}>
              {currentConfig.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{currentConfig.label} Signal</p>
              <p className="text-xs text-gray-500">{currentConfig.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black" style={{ color: colors.scarlet }}>{formatNumber(currentConfig.stats.posts)}</p>
            <p className="text-xs text-gray-400">of {formatNumber(ipData.totalPosts)} total</p>
          </div>
        </div>
        {/* Signal strength bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Sample Size</span>
            <span>{((currentConfig.stats.posts / ipData.totalPosts) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((currentConfig.stats.posts / ipData.totalPosts) * 100 * 3, 100)}%`,
                background: `linear-gradient(90deg, ${colors.scarlet}, ${colors.scarletLight || '#d4334f'})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Signal Table */}
      <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Table Header Banner */}
        <div
          className="px-5 py-4 relative overflow-hidden"
          style={{ backgroundColor: colors.scarlet }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span style={{ color: colors.white }}>{currentConfig.icon}</span>
            </div>
            <div className="flex-1">
              <h3
                className="text-white font-bold text-lg uppercase"
                style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
              >
                Top {currentConfig.label} Athletes
              </h3>
              <p className="text-xs text-white/80">
                {formatCurrency(currentConfig.stats.avgEmv)} avg EMV per post
                {' '}&bull;{' '}
                <span className="text-white font-semibold">+{currentConfig.stats.lift}%</span> engagement lift
              </p>
            </div>
          </div>
        </div>

        {/* Column Headers */}
        <div className="hidden md:grid md:grid-cols-[40px_1fr_100px_70px_100px_80px] gap-2 px-5 py-3 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 bg-gray-50/50">
          <span className="text-center">#</span>
          <span>Athlete</span>
          <span>Sport</span>
          <span className="text-center">Posts</span>
          <span className="text-right">EMV</span>
          <span className="text-right">Lift</span>
        </div>

        {/* Athletes List */}
        <div>
          {currentConfig.athletes.map((athlete, idx) => (
            <div
              key={athlete.name}
              className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
            >
              {/* Desktop row */}
              <div className="hidden md:grid md:grid-cols-[40px_1fr_100px_70px_100px_80px] gap-2 px-5 py-3.5 items-center">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto"
                  style={{
                    backgroundColor: idx < 3 ? colors.scarlet : 'transparent',
                    color: idx < 3 ? 'white' : colors.scarlet,
                    border: idx >= 3 ? `2px solid ${colors.scarlet}` : 'none',
                  }}
                >
                  {athlete.rank}
                </span>
                <p className="text-gray-900 font-semibold">{athlete.name}</p>
                <p className="text-xs text-gray-500">{athlete.sport}</p>
                <span className="text-center text-gray-600">{athlete.posts}</span>
                <span className="text-right font-bold" style={{ color: colors.scarlet }}>{formatCurrency(athlete.emv)}</span>
                <span className="text-right font-medium" style={{ color: colors.positive }}>+{currentConfig.stats.lift}%</span>
              </div>

              {/* Mobile card */}
              <div className="md:hidden px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      backgroundColor: idx < 3 ? colors.scarlet : 'transparent',
                      color: idx < 3 ? 'white' : colors.scarlet,
                      border: idx >= 3 ? `2px solid ${colors.scarlet}` : 'none',
                    }}
                  >
                    {athlete.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{athlete.name}</p>
                    <p className="text-xs text-gray-500">{athlete.sport}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: colors.scarlet }}>{formatCurrency(athlete.emv)}</p>
                    <p className="text-xs text-gray-400">{athlete.posts} posts</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-semibold">Methodology:</span> Top 5 athletes for each IP signal type, ranked by total EMV.
          </p>
          <p>
            Lift represents engagement increase vs posts without any IP signals.
            EMV formula: (Total Likes x $0.50) + (Total Comments x $1.50).
          </p>
          <p className="text-xs text-gray-400">
            Signal types: <span className="font-medium">Collaboration</span> = co-authored posts,
            <span className="font-medium"> Visual IP</span> = logo in media,
            <span className="font-medium"> Mention</span> = @reference in caption.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BENCHMARK TAB
// ═══════════════════════════════════════════════════════════════
function BenchmarkTab() {
  const [benchmarkType, setBenchmarkType] = useState<'conference' | 'ncaa'>('conference');
  const [rankingMetric, setRankingMetric] = useState<'followers' | 'posts' | 'adoption' | 'mention' | 'logo' | 'collab'>('followers');
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? big10Schools : ncaaD1Schools;
  const benchmarkLabel = isConference ? 'Big 10' : 'NCAA D1';
  const metricLabels = {
    followers: 'Followers',
    posts: 'Total Posts',
    adoption: 'IP Adoption',
    mention: 'Mention Rate',
    logo: 'Visual IP Rate',
    collab: 'Collaboration Rate',
  } as const;
  const metricAverage = {
    followers: 0,
    posts: 0,
    adoption: isConference ? conferenceAvg.adoption : ncaaD1Avg.adoption,
    mention: isConference ? conferenceAvg.mention : ncaaD1Avg.mention,
    logo: isConference ? conferenceAvg.logo : ncaaD1Avg.logo,
    collab: isConference ? conferenceAvg.collab : ncaaD1Avg.collab,
  };

  const rankedSchools = useMemo(() => {
    return [...schools].sort((a, b) => b[rankingMetric] - a[rankingMetric]);
  }, [schools, rankingMetric]);

  const ohioIndex = rankedSchools.findIndex((s) => s.name === 'Ohio State');
  const ohioRank = ohioIndex >= 0 ? ohioIndex + 1 : null;
  const ohioSchool = rankedSchools.find((s) => s.name === 'Ohio State') ?? null;
  const ohioValue = ohioSchool ? ohioSchool[rankingMetric] : 0;
  const avgValue = metricAverage[rankingMetric];
  const deltaVsAvg = ohioValue - avgValue;
  const topSchool = rankedSchools[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SectionHeader primary="IP " secondary="RANKINGS" />
          <p className="text-sm text-gray-500 mt-2">
            Ohio State vs {benchmarkLabel} schools ranked by {metricLabels[rankingMetric].toLowerCase()}. Data reflects all athlete posts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setBenchmarkType('conference')}
              className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
              style={{
                backgroundColor: isConference ? '#fff' : 'transparent',
                color: isConference ? colors.scarlet : colors.textMuted,
                boxShadow: isConference ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Big Ten
            </button>
            <button
              onClick={() => setBenchmarkType('ncaa')}
              className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
              style={{
                backgroundColor: !isConference ? '#fff' : 'transparent',
                color: !isConference ? colors.scarlet : colors.textMuted,
                boxShadow: !isConference ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              NCAA
            </button>
          </div>
        </div>
      </div>


      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Ohio State Rank</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black" style={{ color: colors.scarlet }}>
              {ohioRank ? `#${ohioRank}` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mb-1">of {rankedSchools.length}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">{metricLabels[rankingMetric]} vs {benchmarkLabel}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Ohio State Value</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">
              {rankingMetric === 'followers' || rankingMetric === 'posts' ? formatNumber(ohioValue) : `${ohioValue}%`}
            </p>
            {avgValue > 0 && (
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: deltaVsAvg >= 0 ? colors.positive : colors.negative }}
              >
                {deltaVsAvg >= 0 ? '\u2191' : '\u2193'} {Math.abs(deltaVsAvg).toFixed(rankingMetric === 'collab' ? 2 : 1)}%
              </p>
            )}
          </div>
          {avgValue > 0 && <p className="text-xs text-gray-400 mt-2">vs {avgValue}% {benchmarkLabel.toLowerCase()} average</p>}
        </GlassCard>

        <div className="rounded-xl border-2 p-5" style={{ borderColor: colors.positive, backgroundColor: `${colors.positive}08` }}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" style={{ color: colors.positive }} />
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: colors.positive }}>Key Insight</p>
          </div>
          <p className="text-sm text-gray-700">
            {topSchool
              ? <>Current leader is <span className="font-semibold">{topSchool.name}</span> at {rankingMetric === 'followers' || rankingMetric === 'posts' ? formatNumber(topSchool[rankingMetric]) : `${topSchool[rankingMetric]}%`}. Ohio State is {ohioRank ? `#${ohioRank}` : 'unranked'} with {rankingMetric === 'followers' || rankingMetric === 'posts' ? formatNumber(ohioValue) : `${ohioValue}%`}.</>
              : <>No ranking data available for this view.</>
            }
          </p>
        </div>
      </div>

      <div>
        <div className="mb-4">
          <SectionHeader primary={benchmarkLabel + ' '} secondary="RANKINGS" />
        </div>
        <div className="rounded-2xl bg-white overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr style={{ backgroundColor: colors.scarlet }}>
                <th className="text-center px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-white w-10">#</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">School</th>
                {!isConference && <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Conf</th>}
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('followers')}>Followers {rankingMetric === 'followers' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('posts')}>Total Posts {rankingMetric === 'posts' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('adoption')}>IP Posts {rankingMetric === 'adoption' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('adoption')}>IP Adoption {rankingMetric === 'adoption' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('logo')}>Visual IP {rankingMetric === 'logo' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('mention')}>Mention {rankingMetric === 'mention' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('collab')}>Collab {rankingMetric === 'collab' ? '\u25BC' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {rankedSchools.map((school, idx) => {
                const isOSU = school.name === 'Ohio State';
                return (
                  <tr
                    key={school.name}
                    className={`border-b border-gray-100 transition-colors ${isOSU ? 'bg-red-50 hover:bg-red-100/50' : idx % 2 === 1 ? 'bg-gray-50/50 hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-3 py-3 text-center">
                      {idx < 3 ? (
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                          style={{
                            backgroundColor: isOSU ? colors.scarlet : '#d1d5db',
                            color: isOSU ? colors.white : colors.text,
                          }}
                        >
                          {idx + 1}
                        </span>
                      ) : isOSU ? (
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                          style={{ backgroundColor: colors.scarlet, color: colors.white }}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">{idx + 1}</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${isOSU ? 'font-bold' : 'font-semibold'}`} style={{ color: isOSU ? colors.scarlet : colors.text }}>
                      <div className="flex items-center gap-2">
                        {isOSU && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.scarlet }} />
                        )}
                        {school.name}
                        {idx < 3 && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{
                              backgroundColor: idx === 0 ? '#fbbf24' : idx === 1 ? '#d1d5db' : '#d97706',
                              color: idx === 0 ? '#78350f' : idx === 1 ? '#374151' : '#78350f',
                            }}
                          >
                            {idx === 0 ? '1st' : idx === 1 ? '2nd' : '3rd'}
                          </span>
                        )}
                      </div>
                    </td>
                    {!isConference && <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{school.conf}</td>}
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: isOSU ? colors.scarlet : colors.text }}>
                      {formatNumber(school.followers)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{formatNumber(school.posts)}</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{formatNumber(Math.round(school.posts * school.adoption / 100))}</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.adoption}%</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.logo}%</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.mention}%</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.collab}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          * Rankings based on {metricLabels[rankingMetric].toLowerCase()} across {rankedSchools.length} {isConference ? 'Big 10' : 'NCAA D1'} schools.
        </p>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════════════════
// CONTENT TAB
// ═══════════════════════════════════════════════════════════════
type ContentView = 'athlete' | 'team';
const MANUAL_WITHOUT_IP_EXCLUDE_IDS = new Set([
  '6983bc0e989e3d7832b018ef',
  '698a2cdcb6f9ff8ff0f33cff',
  '69407b07024ac7059367b63e',
  '690394b31e4a5fe96ac3a9f5',
  '6983b436333f8617565e5a29',
]);

interface AthletePostItem {
  id: string;
  thumbnail: string;
  postLink: string;
  caption: string;
  athleteName: string;
  dateLabel: string;
  interactions: number;
  engagementRate: number;
  emv: number;
  lift: number;
  ipSignal: string;
  withIP: boolean;
}

interface TeamPostItem {
  id: string;
  thumbnail: string;
  postLink: string;
  caption: string;
  teamName: string;
  schoolName: string;
  conferenceName: string;
  dateLabel: string;
  interactions: number;
  engagementRate: number;
}

function ContentTab() {
  const [contentView, setContentView] = useState<ContentView>('athlete');
  const [isLoading, setIsLoading] = useState(true);
  const [athletePosts, setAthletePosts] = useState<AthletePostItem[]>([]);
  const [ohioTeamPosts, setOhioTeamPosts] = useState<TeamPostItem[]>([]);
  const [_bigTenTeamPosts, setBigTenTeamPosts] = useState<TeamPostItem[]>([]);

  const parseDateLabel = (value: unknown): string => {
    if (!value) return 'Unknown';
    const raw = typeof value === 'object' && value !== null && '$date' in (value as Record<string, unknown>)
      ? (value as { $date?: string }).$date
      : String(value);
    const date = new Date(raw || '');
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getSignalTag = (post: { hasOrganizationLogo?: boolean; hasOrganizationInCaption?: boolean; isOrganizationCollaboration?: boolean }): string => {
    if (post.isOrganizationCollaboration) return 'Org Collaboration';
    if (post.hasOrganizationLogo && post.hasOrganizationInCaption) return 'Logo + Mention';
    if (post.hasOrganizationLogo) return 'Visual IP';
    if (post.hasOrganizationInCaption) return 'Mention';
    return 'No IP';
  };

  const calcMedian = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  const getCaptionText = (value: unknown): string => {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.text === 'string') return record.text.trim();
      if (typeof record.caption === 'string') return record.caption.trim();
    }
    return '';
  };

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      if (!cancelled) setIsLoading(true);
      try {
        const fetchFirstJson = async (paths: string[]): Promise<any[] | null> => {
          for (const path of paths) {
            try {
              const response = await fetch(path);
              if (response.ok) {
                return (await response.json()) as any[];
              }
            } catch {
              // Try next path.
            }
          }
          return null;
        };

        let athleteRows: any[] = [];
        // Try pre-extracted Ohio State file first, then fall back to larger sources
        for (const source of [
          '/data/ohio-state-content-posts.json',
          '/data/socialMedia.roster_contents (8).json',
          '/data/NCAA_contents (2).json',
        ]) {
          if (athleteRows.length > 0) break;
          try {
            const res = await fetch(source);
            if (!res.ok) continue;
            const data = (await res.json()) as any[];
            const filtered = source.includes('ohio-state-content-posts')
              ? data
              : data.filter((row) => ['Ohio State', 'Ohio'].includes(row?.athlete?.school?.name));
            if (filtered.length > 0) athleteRows = filtered;
          } catch {
            // try next source
          }
        }

        const withIPInteractions = athleteRows
          .filter((post) => post?.hasOrganizationLogo || post?.hasOrganizationInCaption || post?.isOrganizationCollaboration)
          .map((post) => Number(post?.metrics?.likes || 0) + Number(post?.metrics?.comments || 0));
        const withoutIPInteractions = athleteRows
          .filter((post) => !(post?.hasOrganizationLogo || post?.hasOrganizationInCaption || post?.isOrganizationCollaboration))
          .map((post) => Number(post?.metrics?.likes || 0) + Number(post?.metrics?.comments || 0));

        const withIPMedian = calcMedian(withIPInteractions);
        const withoutIPMedian = calcMedian(withoutIPInteractions);

        const normalizedAthletePosts: AthletePostItem[] = athleteRows.map((post, index) => {
          const likes = Number(post?.metrics?.likes || 0);
          const comments = Number(post?.metrics?.comments || 0);
          const interactions = likes + comments;
          const withIP = Boolean(post?.hasOrganizationLogo || post?.hasOrganizationInCaption || post?.isOrganizationCollaboration);
          const groupMedian = withIP ? withIPMedian : withoutIPMedian;
          const lift = groupMedian > 0 ? ((interactions - groupMedian) / groupMedian) * 100 : 0;

          return {
            id: String(post?._id || `athlete-${index}`),
            thumbnail: String(post?.url || ''),
            postLink: String(post?.permalink || post?.url || ''),
            caption: getCaptionText(post?.caption || post?.text),
            athleteName: String(post?.athlete?.name || 'Unknown Athlete'),
            dateLabel: parseDateLabel(post?.publishedAt || post?.createdAt),
            interactions,
            engagementRate: Number(post?.metrics?.engagementRate || 0),
            emv: calculateEMV(likes, comments),
            lift,
            ipSignal: getSignalTag(post),
            withIP,
          };
        });

        const ohioTeamRows = (await fetchFirstJson([
          '/data/Ohio.team_contents.json',
          '/data/ohio.team_contents.json',
        ])) || [];
        const normalizedOhioTeamPosts: TeamPostItem[] = ohioTeamRows.map((post, index) => {
          const likes = Number(post?.metrics?.likes || 0);
          const comments = Number(post?.metrics?.comments || 0);
          return {
            id: String(post?._id || `ohio-team-${index}`),
            thumbnail: String(post?.url || ''),
            postLink: String(post?.permalink || post?.url || ''),
            caption: getCaptionText(post?.caption || post?.text),
            teamName: String(post?.team?.name || 'Ohio State Team'),
            schoolName: String(post?.team?.school?.name || 'Ohio State'),
            conferenceName: String(post?.team?.conference?.name || 'Big 10'),
            dateLabel: parseDateLabel(post?.publishedAt || post?.createdAt),
            interactions: likes + comments,
            engagementRate: Number(post?.metrics?.engagementRate || 0),
          };
        });

        const allTeamRows = (await fetchFirstJson([
          '/data/Team_contents.json',
          '/data/team_contents.json',
        ])) || [];
        const normalizedBigTenPosts: TeamPostItem[] = allTeamRows
          .filter((post) => post?.team?.conference?.name === 'Big 10')
          .map((post, index) => {
            const likes = Number(post?.metrics?.likes || 0);
            const comments = Number(post?.metrics?.comments || 0);
            return {
              id: String(post?._id || `big10-team-${index}`),
              thumbnail: String(post?.url || ''),
              postLink: String(post?.permalink || post?.url || ''),
              caption: getCaptionText(post?.caption || post?.text),
              teamName: String(post?.team?.name || 'Team Page'),
              schoolName: String(post?.team?.school?.name || 'Unknown School'),
              conferenceName: String(post?.team?.conference?.name || 'Big 10'),
              dateLabel: parseDateLabel(post?.publishedAt || post?.createdAt),
              interactions: likes + comments,
              engagementRate: Number(post?.metrics?.engagementRate || 0),
            };
          });

        if (!cancelled) {
          setAthletePosts(normalizedAthletePosts);
          setOhioTeamPosts(normalizedOhioTeamPosts);
          setBigTenTeamPosts(normalizedBigTenPosts);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAthletePosts([]);
          setOhioTeamPosts([]);
          setBigTenTeamPosts([]);
          setIsLoading(false);
        }
      }
    };

    loadContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortAthleteRows = (rows: AthletePostItem[]) => {
    const sorter = (a: AthletePostItem, b: AthletePostItem) => {
      return b.interactions - a.interactions;
    };
    return [...rows].sort(sorter);
  };

  const withIPPosts = useMemo(
    () => sortAthleteRows(athletePosts.filter((post) => post.withIP)),
    [athletePosts],
  );
  const withoutIPPosts = useMemo(
    () =>
      sortAthleteRows(
        athletePosts.filter((post) => !post.withIP && !MANUAL_WITHOUT_IP_EXCLUDE_IDS.has(post.id)),
      ),
    [athletePosts],
  );
  const championWithIP = withIPPosts[0];
  const championWithoutIP = withoutIPPosts[0];
  const topWithIP = withIPPosts.slice(0, 10);
  const topWithoutIP = withoutIPPosts.slice(0, 10);

  const sortedOhioTeamPosts = useMemo(() => [...ohioTeamPosts].sort((a, b) => b.interactions - a.interactions), [ohioTeamPosts]);
  const topOhioTeamPost = sortedOhioTeamPosts[0];
  const top10OhioTeamPosts = sortedOhioTeamPosts.slice(0, 10);


  const renderThumbnail = (src: string, alt: string) => (
    <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No media</div>
      )}
    </div>
  );

  const postCardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: '1px solid rgba(148, 163, 184, 0.22)',
    boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
    borderRadius: '1rem',
    transition: 'transform 160ms ease, box-shadow 160ms ease',
  };
  const postCardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-3px)',
    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)',
  };

  const renderAthleteRow = (post: AthletePostItem, rank: number) => (
    <a
      key={post.id}
      className="block p-4"
      style={postCardStyle}
      href={post.postLink || undefined}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, postCardHoverStyle)}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = postCardStyle.boxShadow as string; }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
              style={{ backgroundColor: rank <= 3 ? colors.scarlet : '#e5e7eb', color: rank <= 3 ? '#fff' : colors.textMuted }}
            >
              {rank}
            </span>
            {post.thumbnail ? (
              <img src={post.thumbnail} alt={post.athleteName} className="h-16 w-16 rounded-xl object-cover border border-gray-200 shadow-sm flex-shrink-0" loading="lazy" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-base font-semibold text-gray-900 truncate">{post.athleteName}</p>
              <p className="text-sm text-gray-600 truncate">{post.dateLabel}</p>
              {post.caption && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.caption}</p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.scarlet}14`, border: `1px solid ${colors.scarlet}40`, color: colors.scarlet }}>
                  {post.ipSignal}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900">{formatNumber(post.interactions)}</p>
          <p className="text-xs text-gray-600 mt-1">Interactions</p>
          <p className="text-sm text-gray-600 mt-2">EMV: {formatCurrency(post.emv)}</p>
        </div>
      </div>
    </a>
  );

  return (
    <div className="space-y-6">
      <SectionHeader primary="CONTENT " secondary="PERFORMANCE" />

      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mr-1">Content Type</span>
        <SegmentedToggle
          options={[
            { id: 'athlete', label: 'Athlete Content' },
            { id: 'team', label: 'Team Page Content' },
          ]}
          value={contentView}
          onChange={(id) => setContentView(id)}
        />
      </div>

      {isLoading ? (
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-transparent animate-spin" style={{ borderTopColor: colors.scarlet }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>Loading content performance...</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Pulling athlete and team posts for Ohio State.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="h-36 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-36 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-24 rounded-xl bg-gray-100 animate-pulse md:col-span-2" />
            </div>
          </div>
        </GlassCard>
      ) : contentView === 'athlete' ? (
        <div className="space-y-6">
          {/* Champion Faceoff */}
          <div>
            <SectionHeader primary="CHAMPION " secondary="FACEOFF" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {[{ title: 'Best WITH Ohio State IP', post: championWithIP }, { title: 'Best WITHOUT IP', post: championWithoutIP }].map((item) => (
                <GlassCard key={item.title}>
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">{item.title}</p>
                  {item.post ? (
                    <a
                      href={item.post.postLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="space-y-3 block"
                    >
                      {renderThumbnail(item.post.thumbnail, item.post.athleteName)}
                      <div>
                        <p className="font-semibold text-base" style={{ color: colors.text }}>{item.post.athleteName}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.post.dateLabel}</p>
                        {item.post.caption && (
                          <p className="text-sm mt-2 line-clamp-3" style={{ color: colors.textMuted }}>
                            {item.post.caption}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Interactions</p>
                          <p className="font-semibold" style={{ color: colors.text }}>{formatNumber(item.post.interactions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Engagement Rate</p>
                          <p className="font-semibold" style={{ color: colors.text }}>{formatPercent(item.post.engagementRate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Lift vs Median</p>
                          <p className="font-semibold" style={{ color: item.post.lift >= 0 ? colors.positive : colors.negative }}>
                            {formatDelta(item.post.lift)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">IP Signal</p>
                          <p className="font-semibold" style={{ color: colors.scarlet }}>{item.post.ipSignal}</p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <p className="text-sm text-gray-500">No content available.</p>
                  )}
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top 10 With IP */}
            <div>
              <SectionHeader primary="TOP 10 " secondary="ATHLETE POSTS WITH IP" />
              <div className="space-y-3 mt-4">
                {topWithIP.map((post, idx) => renderAthleteRow(post, idx + 1))}
                {topWithIP.length === 0 && <p className="text-sm text-gray-500">No with-IP athlete posts available.</p>}
              </div>
            </div>

            {/* Top 10 Without IP */}
            <div>
              <SectionHeader primary="TOP 10 " secondary="ATHLETE POSTS WITHOUT IP" />
              <div className="space-y-3 mt-4">
                {topWithoutIP.map((post, idx) => renderAthleteRow(post, idx + 1))}
                {topWithoutIP.length === 0 && <p className="text-sm text-gray-500">No without-IP athlete posts available.</p>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Ohio State Team Page Post */}
          <div>
            <SectionHeader primary="TOP OHIO STATE " secondary="TEAM PAGE POST" />
            <div className="mt-4">
              <GlassCard>
                {topOhioTeamPost ? (
                  <a
                    href={topOhioTeamPost.postLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {renderThumbnail(topOhioTeamPost.thumbnail, topOhioTeamPost.teamName)}
                    <div className="space-y-3">
                      <p className="font-semibold text-base" style={{ color: colors.text }}>{topOhioTeamPost.teamName}</p>
                      <p className="text-xs text-gray-500">{topOhioTeamPost.dateLabel}</p>
                      {topOhioTeamPost.caption && (
                        <p className="text-sm line-clamp-3" style={{ color: colors.textMuted }}>
                          {topOhioTeamPost.caption}
                        </p>
                      )}
                      <p className="text-sm" style={{ color: colors.textMuted }}>{topOhioTeamPost.schoolName}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Interactions</p>
                          <p className="font-semibold">{formatNumber(topOhioTeamPost.interactions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Engagement Rate</p>
                          <p className="font-semibold">{formatPercent(topOhioTeamPost.engagementRate)}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No Ohio State team page posts available.</p>
                )}
              </GlassCard>
            </div>
          </div>

          <div>
            {/* Top 10 Ohio State Team Page Posts */}
            <div>
              <SectionHeader primary="TOP 10 " secondary="OHIO STATE TEAM PAGE POSTS" />
              <div className="space-y-3 mt-4">
                {top10OhioTeamPosts.map((post, idx) => (
                  <a
                    key={post.id}
                    href={post.postLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4"
                    style={postCardStyle}
                    onMouseEnter={(e) => Object.assign(e.currentTarget.style, postCardHoverStyle)}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = postCardStyle.boxShadow as string; }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                            style={{ backgroundColor: idx < 3 ? colors.scarlet : '#e5e7eb', color: idx < 3 ? '#fff' : colors.textMuted }}
                          >
                            {idx + 1}
                          </span>
                          {post.thumbnail ? (
                            <img src={post.thumbnail} alt={post.teamName} className="h-16 w-16 rounded-xl object-cover border border-gray-200 shadow-sm flex-shrink-0" loading="lazy" />
                          ) : (
                            <div className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-base font-semibold text-gray-900 truncate">{post.teamName}</p>
                            <p className="text-sm text-gray-600 truncate">{post.dateLabel}</p>
                            {post.caption && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.caption}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{formatNumber(post.interactions)}</p>
                        <p className="text-xs text-gray-600 mt-1">Interactions</p>
                        <p className="text-sm text-gray-600 mt-2">Eng: {formatPercent(post.engagementRate)}</p>
                      </div>
                    </div>
                  </a>
                ))}
                {top10OhioTeamPosts.length === 0 && <p className="text-sm text-gray-500">No Ohio State team page posts available.</p>}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEAM PAGES TAB
// ═══════════════════════════════════════════════════════════════
type TeamSignal = 'mention' | 'logo' | 'collab';
type TeamMetricKey = 'followers' | 'totalLikes' | 'engagementRate' | 'posts';
type TeamSortKey =
  | 'rank'
  | 'sport'
  | 'followers'
  | 'totalLikes'
  | 'engagementRate'
  | 'totalPosts'
  | 'ipPosts'
  | 'avgLikes'
  | 'lift';
type TeamSortDir = 'asc' | 'desc';

interface SportRow {
  sport: string;
  sportKey: string;
  followers: number;
  totalLikes: number;
  engagementRate: number;
  totalInteractions: number;
  totalPosts: number;
  ipPosts: number;
  avgLikes: number;
  lift: number;
}

interface TeamRosterMetricSnapshot {
  followers: number;
  likes: number;
  comments: number;
  engagementRate: number;
  contentCount: number;
  logoContentCount: number;
  collaborationContentCount: number;
  organizationCollaborationContentCount: number;
}

function TeamPagesTab({ sportData }: { sportData: SportSignalData }) {
  const signal: TeamSignal = 'mention';
  const [activeMetric, setActiveMetric] = useState<TeamMetricKey>('followers');
  const [sortKey, setSortKey] = useState<TeamSortKey>('followers');
  const [sortDir, setSortDir] = useState<TeamSortDir>('desc');
  const [rosterMetricsBySport, setRosterMetricsBySport] = useState<Record<string, TeamRosterMetricSnapshot>>({});
  const [view, setView] = useState<'overview' | 'leaderboard'>('overview');

  useEffect(() => {
    let cancelled = false;
    const loadFollowers = async () => {
      try {
        let rows: OhioRosterTeam[] | null = null;
        for (const path of ['/data/Ohio.roster_teams.json', '/data/ohio.roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              rows = (await response.json()) as OhioRosterTeam[];
              break;
            }
          } catch {
            // Try next path.
          }
        }
        if (!rows) return;
        const map: Record<string, TeamRosterMetricSnapshot> = {};
        for (const row of rows) {
          const key = row.sport;
          if (!key) continue;
          const metrics = row.metrics?.ninetyDays ?? row.metrics?.thirtyDays ?? row.metrics?.sevenDays;
          const metricRecord = (metrics as Record<string, unknown> | undefined) ?? {};
          map[key] = {
            followers: toNumber(metricRecord.followers),
            likes: toNumber(metricRecord.likes),
            comments: toNumber(metricRecord.comments),
            engagementRate: toNumber(metricRecord.engagementRate),
            contentCount: toNumber(metricRecord.contentCount),
            logoContentCount: toNumber(metricRecord.logoContentCount),
            collaborationContentCount: toNumber(metricRecord.collaborationContentCount),
            organizationCollaborationContentCount: toNumber(metricRecord.organizationCollaborationContentCount),
          };
        }
        if (!cancelled) setRosterMetricsBySport(map);
      } catch {
        // Followers remain zero when team metrics are unavailable.
      }
    };

    loadFollowers();
    return () => {
      cancelled = true;
    };
  }, []);

  const sportRows = useMemo((): SportRow[] => {
    const rows: SportRow[] = [];
    const rosterKeys = Object.keys(rosterMetricsBySport);
    const sourceKeys = rosterKeys.length > 0
      ? rosterKeys
      : Object.keys(sportData).filter((key) => key !== 'ALL_SPORTS');

    for (const key of sourceKeys) {
      const data = sportData[key]?.[signal];
      const rosterMetrics = rosterMetricsBySport[key];
      const withPosts = data?.with.posts ?? 0;
      const withoutPosts = data?.without.posts ?? 0;
      const derivedTotalPosts = withPosts + withoutPosts;
      const totalPosts = rosterMetrics?.contentCount || derivedTotalPosts;
      const derivedTotalLikes = (data ? ((data.with.avgLikes * withPosts) + (data.without.avgLikes * withoutPosts)) : 0);
      const totalLikes = rosterMetrics?.likes || derivedTotalLikes;
      const totalComments = rosterMetrics?.comments || (data ? ((data.with.avgComments * withPosts) + (data.without.avgComments * withoutPosts)) : 0);
      const totalInteractions = totalLikes + totalComments;
      const engagementRate = rosterMetrics?.engagementRate
        || (data && totalPosts > 0
          ? ((data.with.engagementRate * withPosts) + (data.without.engagementRate * withoutPosts)) / totalPosts
          : 0);
      const lift = data && data.without.engagementRate > 0
        ? ((data.with.engagementRate - data.without.engagementRate) / data.without.engagementRate) * 100
        : 0;
      const signalCountFromRoster = rosterMetrics?.organizationCollaborationContentCount || 0;
      const ipPosts = signalCountFromRoster || withPosts;

      rows.push({
        sport: formatSportLabel(key),
        sportKey: key,
        followers: rosterMetrics?.followers || fallbackTeamFollowersBySport[key] || 0,
        totalLikes,
        engagementRate,
        totalInteractions,
        totalPosts,
        ipPosts,
        avgLikes: totalPosts > 0 ? totalLikes / totalPosts : 0,
        lift,
      });
    }

    return rows;
  }, [rosterMetricsBySport, signal, sportData]);

  const metricValue = (row: SportRow, metric: TeamMetricKey): number => {
    if (metric === 'followers') return row.followers;
    if (metric === 'totalLikes') return row.totalLikes;
    if (metric === 'engagementRate') return row.engagementRate;
    return row.totalPosts;
  };

  const sortedRows = useMemo(() => {
    const sorted = [...sportRows];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'rank':
          cmp = 0;
          break;
        case 'sport':
          cmp = a.sport.localeCompare(b.sport);
          break;
        case 'followers':
          cmp = a.followers - b.followers;
          break;
        case 'totalLikes':
          cmp = a.totalLikes - b.totalLikes;
          break;
        case 'engagementRate':
          cmp = a.engagementRate - b.engagementRate;
          break;
        case 'totalPosts':
          cmp = a.totalPosts - b.totalPosts;
          break;
        case 'ipPosts':
          cmp = a.ipPosts - b.ipPosts;
          break;
        case 'avgLikes':
          cmp = a.avgLikes - b.avgLikes;
          break;
        case 'lift':
          cmp = a.lift - b.lift;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return sorted;
  }, [sportRows, sortKey, sortDir]);

  const rowsByActiveMetric = useMemo(() => {
    return [...sportRows].sort((a, b) => metricValue(b, activeMetric) - metricValue(a, activeMetric));
  }, [activeMetric, sportRows]);
  const maxTrackedPosts = useMemo(
    () => sportRows.reduce((max, row) => (row.totalPosts > max ? row.totalPosts : max), 0),
    [sportRows],
  );

  const handleSort = (key: TeamSortKey) => {
    if (key === 'rank') return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const metricButtons: { id: TeamMetricKey; label: string }[] = [
    { id: 'followers', label: 'Followers' },
    { id: 'totalLikes', label: 'Total Likes' },
    { id: 'engagementRate', label: 'Engagement Rate' },
    { id: 'posts', label: 'Posts' },
  ];

  const osuScarlet = '#BB0000';

  const SortIcon = ({ col }: { col: TeamSortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'desc' ? (
      <ChevronDown className="w-3 h-3" style={{ color: osuScarlet }} />
    ) : (
      <ChevronUp className="w-3 h-3" style={{ color: osuScarlet }} />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionHeader primary="OHIO STATE " secondary="TEAM PAGES" />
          <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
            {view === 'overview' ? 'Official Ohio State athletics social account performance.' : 'Benchmark Ohio State team pages against conference and NCAA.'}
          </p>
          {view === 'overview' && (
            <p className="text-xs mt-1" style={{ color: colors.textDim }}>
              Current feed data is a recent-post sample (up to {formatNumber(maxTrackedPosts)} posts per team in this dataset).
            </p>
          )}
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={() => setView('overview')}
            className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
            style={{
              backgroundColor: view === 'overview' ? '#fff' : 'transparent',
              color: view === 'overview' ? colors.scarlet : colors.textMuted,
              boxShadow: view === 'overview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Ohio State
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
            style={{
              backgroundColor: view === 'leaderboard' ? '#fff' : 'transparent',
              color: view === 'leaderboard' ? colors.scarlet : colors.textMuted,
              boxShadow: view === 'leaderboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {view === 'leaderboard' ? (
        <TeamPageLeaderboard />
      ) : (
      <>
      <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
        <div className="inline-flex items-center gap-2 min-w-max">
          {metricButtons.map((mb) => (
            <button
              key={mb.id}
              onClick={() => {
                setActiveMetric(mb.id);
                const nextSortMap: Record<TeamMetricKey, TeamSortKey> = {
                  followers: 'followers',
                  totalLikes: 'totalLikes',
                  engagementRate: 'engagementRate',
                  posts: 'totalPosts',
                };
                setSortKey(nextSortMap[mb.id]);
                setSortDir('desc');
              }}
              className="px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors"
              style={{
                backgroundColor: activeMetric === mb.id ? osuScarlet : '#fff',
                borderColor: activeMetric === mb.id ? osuScarlet : 'rgba(0,0,0,0.12)',
                color: activeMetric === mb.id ? '#fff' : colors.textMuted,
              }}
            >
              {mb.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rowsByActiveMetric.map((row, idx) => {
          const rank = idx + 1;
          const value = metricValue(row, activeMetric);
          const totalForMetric = rowsByActiveMetric.reduce((sum, item) => sum + metricValue(item, activeMetric), 0);
          const sharePct = totalForMetric > 0 ? (value / totalForMetric) * 100 : 0;
          const supportingLabel =
            activeMetric === 'followers'
              ? `${formatNumber(row.totalPosts)} posts`
              : activeMetric === 'totalLikes'
                ? `${formatNumber(row.totalPosts > 0 ? row.totalLikes / row.totalPosts : 0)} avg likes/post`
                : activeMetric === 'engagementRate'
                  ? `${formatNumber(row.totalInteractions)} interactions`
                  : `${formatNumber(row.ipPosts)} with ${signal}`;
          const primaryValue = activeMetric === 'engagementRate' ? formatPercent(value, 2) : formatNumber(value);

          return (
            <div
              key={row.sportKey}
              className="rounded-2xl border bg-white p-4 transition-all"
              style={{
                borderColor: 'rgba(0,0,0,0.08)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: colors.text }}>
                    {row.sport}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                    {supportingLabel}
                  </p>
                </div>
                <span
                  className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{
                    backgroundColor: rank <= 3 ? `${osuScarlet}15` : '#f3f4f6',
                    color: rank <= 3 ? osuScarlet : colors.textMuted,
                  }}
                >
                  #{rank}
                </span>
              </div>
              <p className="text-3xl font-black leading-tight" style={{ color: colors.text }}>
                {primaryValue}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span style={{ color: colors.textMuted }}>Share of total</span>
                <span className="font-semibold" style={{ color: osuScarlet }}>
                  {sharePct.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border overflow-hidden bg-white" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Sample data: likes, engagement rate, and total posts are based on a recent post sample (about last 12 posts per team).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[980px]">
            <thead>
              <tr className="border-b border-gray-100">
                {([
                  ['rank', 'Rank'],
                  ['sport', 'Team'],
                  ['followers', 'Followers'],
                  ['totalLikes', 'Total Likes'],
                  ['engagementRate', 'Engagement Rate'],
                  ['totalPosts', 'Total Posts'],
                ] as [TeamSortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:bg-gray-50 transition-colors motion-reduce:transition-none"
                    style={{ color: colors.textMuted }}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {key !== 'rank' && <SortIcon col={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, idx) => (
                <tr
                  key={row.sportKey}
                  className="border-b border-gray-50 hover:bg-red-50/30 transition-colors motion-reduce:transition-none"
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: osuScarlet }}>
                    #{idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: colors.text }}>
                    {row.sport}
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    {formatNumber(row.followers)}
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    {formatNumber(row.totalLikes)}
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    {formatPercent(row.engagementRate)}
                  </td>
                  <td className="px-4 py-3" style={{ color: colors.textMuted }}>
                    {formatNumber(row.totalPosts)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEAM PAGE LEADERBOARD
// ═══════════════════════════════════════════════════════════════
interface TeamRosterRow {
  schoolName: string;
  conferenceName: string;
  sport: string;
  metrics?: { thirtyDays?: { followers?: number; contentCount?: number; likes?: number; comments?: number; engagementRate?: number } };
}

interface SportSchoolEntry {
  name: string;
  conf: string;
  followers: number;
  posts: number;
  likes: number;
  engagementRate: number;
}

function TeamPageLeaderboard() {
  const [rawRows, setRawRows] = useState<TeamRosterRow[]>([]);
  const [scope, setScope] = useState<'conference' | 'ncaa'>('conference');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [sortMetric, setSortMetric] = useState<'followers' | 'posts' | 'likes'>('followers');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/data/roster_teams.json');
        if (!res.ok) return;
        const rows = (await res.json()) as TeamRosterRow[];
        if (!cancelled) setRawRows(rows);
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Get available sports that Ohio State has
  const osuSports = useMemo(() => {
    const sports = rawRows.filter(r => r.schoolName === 'Ohio State').map(r => r.sport);
    return [...new Set(sports)].sort((a, b) => formatSportLabel(a).localeCompare(formatSportLabel(b)));
  }, [rawRows]);

  const isConference = scope === 'conference';

  const filtered = useMemo(() => {
    let rows = rawRows;
    if (isConference) rows = rows.filter(r => r.conferenceName === 'Big 10');
    if (selectedSport !== 'ALL') rows = rows.filter(r => r.sport === selectedSport);

    // Aggregate by school
    const map: Record<string, SportSchoolEntry> = {};
    for (const row of rows) {
      const s = row.schoolName;
      if (!s) continue;
      if (!map[s]) map[s] = { name: s, conf: row.conferenceName || '', followers: 0, posts: 0, likes: 0, engagementRate: 0 };
      const m = row.metrics?.thirtyDays;
      map[s].followers += m?.followers || 0;
      map[s].posts += m?.contentCount || 0;
      map[s].likes += m?.likes || 0;
    }
    for (const s of Object.values(map)) {
      s.engagementRate = s.posts > 0 ? s.likes / s.posts : 0;
    }
    return Object.values(map).sort((a, b) => b[sortMetric] - a[sortMetric]);
  }, [rawRows, scope, selectedSport, sortMetric, isConference]);

  const osuIndex = filtered.findIndex(s => s.name === 'Ohio State');
  const osuRank = osuIndex >= 0 ? osuIndex + 1 : null;
  const scopeLabel = isConference ? 'Big 10' : 'NCAA';
  const sportLabel = selectedSport === 'ALL' ? 'All Sports' : formatSportLabel(selectedSport);

  if (rawRows.length === 0) return <p className="text-sm text-gray-500">Loading leaderboard data...</p>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-4">
        {/* Sport Selector */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Sport</p>
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2.5 pr-10 text-sm font-semibold rounded-xl border appearance-none cursor-pointer bg-white"
              style={{ color: colors.text, borderColor: colors.glassBorder }}
            >
              <option value="ALL">All Sports</option>
              {osuSports.map(s => (
                <option key={s} value={s}>{formatSportLabel(s)}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Scope Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setScope('conference')}
            className="px-4 py-2 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
            style={{
              backgroundColor: isConference ? '#fff' : 'transparent',
              color: isConference ? colors.scarlet : colors.textMuted,
              boxShadow: isConference ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Big Ten
          </button>
          <button
            onClick={() => setScope('ncaa')}
            className="px-4 py-2 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
            style={{
              backgroundColor: !isConference ? '#fff' : 'transparent',
              color: !isConference ? colors.scarlet : colors.textMuted,
              boxShadow: !isConference ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            NCAA
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {osuRank != null && (
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Ohio State {sportLabel} Rank</p>
            <p className="text-4xl font-black" style={{ color: colors.scarlet }}>#{osuRank} <span className="text-sm font-normal text-gray-500">of {filtered.length}</span></p>
            <p className="text-xs text-gray-400 mt-1">{scopeLabel} · {sportLabel} · by followers</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Followers</p>
            <p className="text-4xl font-black text-gray-900">{formatNumber(filtered[osuIndex]?.followers || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">{formatNumber(filtered[osuIndex]?.posts || 0)} posts (30 days)</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">30-Day Likes</p>
            <p className="text-4xl font-black text-gray-900">{formatNumber(filtered[osuIndex]?.likes || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">{filtered[osuIndex]?.posts ? Math.round((filtered[osuIndex]?.likes || 0) / filtered[osuIndex].posts).toLocaleString() : 0} avg per post</p>
          </GlassCard>
        </div>
      )}

      {/* Rankings Table */}
      <div className="rounded-2xl bg-white overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr style={{ backgroundColor: colors.scarlet }}>
              <th className="text-center px-3 py-3.5 text-xs font-semibold uppercase tracking-wider text-white w-10">#</th>
              <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">School</th>
              {!isConference && <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Conf</th>}
              <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer select-none hover:text-white/80" onClick={() => setSortMetric('followers')}>Followers {sortMetric === 'followers' ? '\u25BC' : ''}</th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer select-none hover:text-white/80" onClick={() => setSortMetric('posts')}>Posts {sortMetric === 'posts' ? '\u25BC' : ''}</th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer select-none hover:text-white/80" onClick={() => setSortMetric('likes')}>Likes {sortMetric === 'likes' ? '\u25BC' : ''}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((school, idx) => {
              const isOSU = school.name === 'Ohio State';
              return (
                <tr
                  key={school.name}
                  className={`border-b border-gray-100 transition-colors ${isOSU ? 'bg-red-50 hover:bg-red-100/50' : idx % 2 === 1 ? 'bg-gray-50/50 hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-3 py-3 text-center">
                    {idx < 3 ? (
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto" style={{ backgroundColor: isOSU ? colors.scarlet : '#d1d5db', color: isOSU ? '#fff' : colors.text }}>
                        {idx + 1}
                      </span>
                    ) : isOSU ? (
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto" style={{ backgroundColor: colors.scarlet, color: '#fff' }}>
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">{idx + 1}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${isOSU ? 'font-bold' : 'font-semibold'}`} style={{ color: isOSU ? colors.scarlet : colors.text }}>
                    <div className="flex items-center gap-2">
                      {isOSU && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.scarlet }} />}
                      {school.name}
                    </div>
                  </td>
                  {!isConference && <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{school.conf}</td>}
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: isOSU ? colors.scarlet : colors.text }}>{formatNumber(school.followers)}</td>
                  <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{formatNumber(school.posts)}</td>
                  <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{formatNumber(school.likes)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT: OhioStateIPImpact
// ═══════════════════════════════════════════════════════════════
export function OhioStateIPImpact({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [scrolled, setScrolled] = useState(false);
  const [sportData, setSportData] = useState<SportSignalData>(fallbackSportData as SportSignalData);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadOhioSports = async () => {
      try {
        // Preferred source for IP Comparison by sport (athlete-focused by-sport dataset).
        try {
          const bySportResponse = await fetch('/data/ohio-state-by-sport.json');
          if (bySportResponse.ok) {
            const bySportData = (await bySportResponse.json()) as SportSignalData;
            if (!isCancelled && bySportData?.ALL_SPORTS) {
              setSportData(bySportData);
              return;
            }
          }
        } catch {
          // Fall back to roster-derived dataset below.
        }

        let rows: OhioRosterTeam[] | null = null;
        for (const path of ['/data/Ohio.roster_teams.json', '/data/ohio.roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              rows = (await response.json()) as OhioRosterTeam[];
              break;
            }
          } catch {
            // Try next path.
          }
        }
        if (!rows) return;
        const dynamicData = buildSportDataFromRoster(rows);
        if (!isCancelled && dynamicData.ALL_SPORTS) {
          setSportData(dynamicData);
        }
      } catch {
        // Keep fallback sport data when local dataset is unavailable.
      }
    };

    loadOhioSports();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadOverviewData = async () => {
      try {
        const response = await fetch('/data/ohio-state-athlete-overview.json');
        if (!response.ok) return;
        const data = (await response.json()) as OverviewData;
        if (!isCancelled) {
          setOverviewData(data);
        }
      } catch {
        // Keep fallback hardcoded overview data.
      }
    };

    loadOverviewData();
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: colors.lightBg }}>
      {/* Buckeye leaves background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/ohio-state-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Sticky Command Bar */}
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b transition-shadow duration-200 motion-reduce:transition-none"
        style={{
          backgroundColor: 'rgba(255,255,255,0.90)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderColor: 'rgba(0,0,0,0.06)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1: Logo + Title */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 min-w-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors motion-reduce:transition-none flex-shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <img
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/194.png"
                alt="Ohio State"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div>
                <h1
                  className="text-lg sm:text-2xl font-bold uppercase tracking-tight whitespace-nowrap"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
                >
                  <span style={{ color: colors.scarlet }}>Ohio State </span>
                  <span className="hidden sm:inline" style={{ color: colors.headerGray }}>IP Impact Report</span>
                  <span className="sm:hidden" style={{ color: colors.headerGray }}>IP Impact</span>
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-0.5">
                  Generated by <span className="font-semibold" style={{ borderBottom: '2px solid #CCFF00' }}>JABA AI</span>
                </p>
              </div>
            </div>
            <img src="/JABA-face.png" alt="JABA" className="h-16 sm:h-20 object-contain flex-shrink-0" />
          </div>

          {/* Row 2: Tabs */}
          <div className="pb-0 -mb-px">
            <nav className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1 snap-x snap-mandatory min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="px-3 sm:px-4 py-2 rounded-t-lg text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap snap-start motion-reduce:transition-none"
                    style={{
                      backgroundColor: activeTab === tab.id ? '#fff' : 'transparent',
                      color: activeTab === tab.id ? colors.scarlet : colors.textMuted,
                      borderColor: activeTab === tab.id ? colors.scarlet : 'transparent',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        {activeTab === 'overview' && <OverviewTab overviewData={overviewData} />}
        {activeTab === 'withvswithout' && <WithVsWithoutTab sportData={sportData} overviewData={overviewData} />}
        {activeTab === 'partnerships' && <PartnershipsTab />}
        {activeTab === 'bestcollaborators' && <BestCollaboratorsTab />}
        {activeTab === 'benchmark' && <BenchmarkTab />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'teampages' && <TeamPagesTab sportData={sportData} />}
      </main>
    </div>
  );
}
