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
// SCHOOL NAME RENDERER — rivalry treatment for That School Up North
// ═══════════════════════════════════════════════════════════════
const renderSchoolName = (name: string) =>
  name === 'Michigan' ? <>❌ichigan</> : <>{name}</>;

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
  avgLift: 283.7,
  totalEmv: 12886314,
  collaboration: { posts: 195, likes: 12935.5, comments: 112.73, engagementRate: 0.6456, delta: 84.9, emv: 1294184, baselineEngRate: 0.3491, baselinePosts: 12189, baselineLikes: 1767.82, baselineComments: 44.75 } as IPSignalData,
  logo: { posts: 5245, likes: 3144.56, comments: 57.43, engagementRate: 0.5685, delta: 190, emv: 8698443, baselineEngRate: 0.1961, baselinePosts: 7139, baselineLikes: 1061.38, baselineComments: 37.29 } as IPSignalData,
  mention: { posts: 2506, likes: 2546.85, comments: 43.43, engagementRate: 0.8783, delta: 297.8, emv: 3354479, baselineEngRate: 0.2208, baselinePosts: 9878, baselineLikes: 1790.65, baselineComments: 46.42 } as IPSignalData,
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
  sponsoredPosts: 1023,
  totalBrands: 430,
  totalEMV: 12886314,
  partnerships: [
    { brand: "@redbullusa", posts: 2, avgLikes: 233021.5, avgComments: 647, emv: 234962.5, engagementRate: 0.3079, liftMultiplier: 118.9 },
    { brand: "@beatsbydre", posts: 3, avgLikes: 43950, avgComments: 326, emv: 67392, engagementRate: 0.1331, liftMultiplier: 21.6 },
    { brand: "@hollister", posts: 89, avgLikes: 1277.65, avgComments: 20, emv: 59567.5, engagementRate: 0.0986, liftMultiplier: -0.3 },
    { brand: "@paniniamerica", posts: 2, avgLikes: 48993, avgComments: 148, emv: 49435.5, engagementRate: 0.1523, liftMultiplier: 24.2 },
    { brand: "@on3recruits", posts: 2, avgLikes: 41157.5, avgComments: 695, emv: 43241, engagementRate: 0.6283, liftMultiplier: 20.2 },
    { brand: "@nxtrnd", posts: 3, avgLikes: 17270.67, avgComments: 80, emv: 26266, engagementRate: 0.0522, liftMultiplier: 7.9 },
    { brand: "@7eleven", posts: 1, avgLikes: 47435, avgComments: 347, emv: 24238, engagementRate: 0.063, liftMultiplier: 23.4 },
    { brand: "@adidasusfootball", posts: 1, avgLikes: 43424, avgComments: 534, emv: 22513, engagementRate: 0.0579, liftMultiplier: 21.3 },
    { brand: "@clever_made", posts: 21, avgLikes: 2168.9, avgComments: 16, emv: 23286.5, engagementRate: 0.1187, liftMultiplier: 0.1 },
    { brand: "@epicpartner", posts: 1, avgLikes: 42691, avgComments: 133, emv: 21545, engagementRate: 0.2416, liftMultiplier: 21 },
    { brand: "@dickssportinggoods", posts: 2, avgLikes: 20959.5, avgComments: 176, emv: 21486, engagementRate: 0.0454, liftMultiplier: 9.8 },
    { brand: "@chipotle", posts: 5, avgLikes: 7848.8, avgComments: 80, emv: 20225, engagementRate: 0.0324, liftMultiplier: 3 },

    { brand: "@paycomsoftware", posts: 5, avgLikes: 5339.2, avgComments: 30, emv: 13573, engagementRate: 0.5884, liftMultiplier: 1.7 },
    { brand: "@discover", posts: 1, avgLikes: 24054, avgComments: 114, emv: 12198, engagementRate: 0.0319, liftMultiplier: 11.4 },
    { brand: "@heydude", posts: 11, avgLikes: 2078.09, avgComments: 38, emv: 12050.5, engagementRate: 0.113, liftMultiplier: 0.1 },
    { brand: "@gianteagle", posts: 4, avgLikes: 5648.75, avgComments: 74, emv: 11741.5, engagementRate: 0.0562, liftMultiplier: 1.9 },
    { brand: "@directv", posts: 5, avgLikes: 4530.4, avgComments: 41, emv: 11630.5, engagementRate: 0.2326, liftMultiplier: 1.3 },
    { brand: "@att", posts: 1, avgLikes: 21526, avgComments: 237, emv: 11118.5, engagementRate: 0.0287, liftMultiplier: 10.1 },
    { brand: "@jlabaudio", posts: 3, avgLikes: 6473.33, avgComments: 53, emv: 9947, engagementRate: 0.062, liftMultiplier: 2.3 },
    { brand: "@doordash", posts: 2, avgLikes: 9016, avgComments: 29, emv: 9101.5, engagementRate: 0.0272, liftMultiplier: 3.6 },
    { brand: "@joandjax", posts: 5, avgLikes: 3261.6, avgComments: 32, emv: 8397, engagementRate: 0.0657, liftMultiplier: 0.7 },
    { brand: "@americaneagle", posts: 22, avgLikes: 638.77, avgComments: 38, emv: 8270, engagementRate: 0.0305, liftMultiplier: -0.7 },
    { brand: "@valvolineinstantoilchange", posts: 4, avgLikes: 3743.75, avgComments: 25, emv: 7634.5, engagementRate: 0.0309, liftMultiplier: 0.9 },
    { brand: "@allstate", posts: 2, avgLikes: 7134.5, avgComments: 45, emv: 7268, engagementRate: 0.0875, liftMultiplier: 2.7 },
    { brand: "@wingstop", posts: 2, avgLikes: 5588.5, avgComments: 257, emv: 6358, engagementRate: 0.7279, liftMultiplier: 1.9 },
    { brand: "@KeyBank", posts: 2, avgLikes: 5849.5, avgComments: 50, emv: 5998, engagementRate: 0.0078, liftMultiplier: 2 },
    { brand: "@whereimfrom", posts: 5, avgLikes: 2288, avgComments: 21, emv: 5877.5, engagementRate: 0.0883, liftMultiplier: 0.2 },
    { brand: "@naturemadevitamins", posts: 1, avgLikes: 11205, avgComments: 21, emv: 5634, engagementRate: 0.2991, liftMultiplier: 4.8 },
    { brand: "@rebelcrystalofficial", posts: 2, avgLikes: 5462.5, avgComments: 1, emv: 5465.5, engagementRate: 0.0919, liftMultiplier: 1.8 },
    { brand: "@adidas", posts: 2, avgLikes: 4895, avgComments: 104, emv: 5207, engagementRate: 0.0782, liftMultiplier: 1.5 },
    { brand: "@paycom", posts: 1, avgLikes: 10182, avgComments: 36, emv: 5145, engagementRate: 0.2991, liftMultiplier: 4.2 },
    { brand: "@defensesoap", posts: 1, avgLikes: 10145, avgComments: 33, emv: 5122, engagementRate: 0.2979, liftMultiplier: 4.2 },
    { brand: "@tmobile", posts: 1, avgLikes: 9905, avgComments: 54, emv: 5033.5, engagementRate: 0.0299, liftMultiplier: 4.1 },
    { brand: "@HeyDude", posts: 1, avgLikes: 9119, avgComments: 101, emv: 4711, engagementRate: 0.0463, liftMultiplier: 3.7 },
    { brand: "@athleteps", posts: 1, avgLikes: 8398, avgComments: 45, emv: 4266.5, engagementRate: 0.2471, liftMultiplier: 3.3 },
    { brand: "@crocs", posts: 6, avgLikes: 1315.33, avgComments: 23, emv: 4153, engagementRate: 0.0042, liftMultiplier: -0.3 },
    { brand: "@brooksrunning", posts: 5, avgLikes: 1543, avgComments: 30, emv: 4084, engagementRate: 0.1099, liftMultiplier: -0.2 },
    { brand: "@peppermayo", posts: 4, avgLikes: 1833.75, avgComments: 42, emv: 3918, engagementRate: 0.0312, liftMultiplier: -0.1 },
    { brand: "@ohiostathletics", posts: 1, avgLikes: 7285, avgComments: 40, emv: 3702.5, engagementRate: 0.1478, liftMultiplier: 2.7 },
    { brand: "@amazonmusic", posts: 1, avgLikes: 6974, avgComments: 30, emv: 3532, engagementRate: 0.0944, liftMultiplier: 2.6 },
    { brand: "@cliffkeenathletic", posts: 1, avgLikes: 6980, avgComments: 16, emv: 3514, engagementRate: 3.4294, liftMultiplier: 2.6 },
    { brand: "@GiantEagle", posts: 1, avgLikes: 6784, avgComments: 32, emv: 3440, engagementRate: 0.0205, liftMultiplier: 2.5 },
    { brand: "@pursuityourself", posts: 18, avgLikes: 342.67, avgComments: 12, emv: 3409.5, engagementRate: 0.0884, liftMultiplier: -0.8 },
    { brand: "@wrestlingbucks", posts: 4, avgLikes: 1560, avgComments: 11, emv: 3186, engagementRate: 0.1056, liftMultiplier: -0.2 },
    { brand: "locationfootball", posts: 1, avgLikes: 5899, avgComments: 53, emv: 3029, engagementRate: 0.3925, liftMultiplier: 2 },
    { brand: "@fifththirdbank", posts: 2, avgLikes: 2969.5, avgComments: 15, emv: 3014.5, engagementRate: 0.0109, liftMultiplier: 0.5 },
    { brand: "@celsiusofficial", posts: 3, avgLikes: 1828.33, avgComments: 22, emv: 2841.5, engagementRate: 0.0055, liftMultiplier: -0.1 },
    { brand: "@colab_collective", posts: 6, avgLikes: 842, avgComments: 13, emv: 2640, engagementRate: 0.0486, liftMultiplier: -0.6 },
    { brand: "@serialashaeco", posts: 1, avgLikes: 5029, avgComments: 72, emv: 2622.5, engagementRate: 0.284, liftMultiplier: 1.6 },
    { brand: "@drinkaccelerator", posts: 45, avgLikes: 87.58, avgComments: 8, emv: 2488, engagementRate: 0.0231, liftMultiplier: -1 },
    { brand: "@ParamountPlus", posts: 1, avgLikes: 4823, avgComments: 32, emv: 2459.5, engagementRate: 0.0705, liftMultiplier: 1.5 },
    { brand: "@marathonfuel", posts: 1, avgLikes: 3988, avgComments: 49, emv: 2067.5, engagementRate: 0.1114, liftMultiplier: 1.1 },
    { brand: "@donatospizza", posts: 4, avgLikes: 975.25, avgComments: 18, emv: 2060, engagementRate: 0.3075, liftMultiplier: -0.5 },
    { brand: "the.courageousathlete", posts: 1, avgLikes: 4012, avgComments: 22, emv: 2039, engagementRate: 1.0228, liftMultiplier: 1.1 },
    { brand: "@neweracap", posts: 7, avgLikes: 513.43, avgComments: 20, emv: 2004, engagementRate: 0.0351, liftMultiplier: -0.7 },
    { brand: "@c4energy", posts: 12, avgLikes: 251.42, avgComments: 27, emv: 1988.5, engagementRate: 0.0262, liftMultiplier: -0.9 },
    { brand: "@goodfoodcro", posts: 2, avgLikes: 1403, avgComments: 194, emv: 1985, engagementRate: 0.0127, liftMultiplier: -0.3 },
    { brand: "@buckeye.threads", posts: 33, avgLikes: 108.48, avgComments: 2, emv: 1887.5, engagementRate: 0.0589, liftMultiplier: -0.9 },
    { brand: "@bumpboxx", posts: 3, avgLikes: 1128.33, avgComments: 41, emv: 1875.5, engagementRate: 0.0633, liftMultiplier: -0.4 },
    { brand: "@tytusgrills", posts: 5, avgLikes: 719, avgComments: 7, emv: 1847, engagementRate: 0.0177, liftMultiplier: -0.6 },
    { brand: "@seatgeek", posts: 2, avgLikes: 1755.5, avgComments: 23, emv: 1824.5, engagementRate: 0.0144, liftMultiplier: -0.1 },
    { brand: "@shootaway", posts: 3, avgLikes: 1079, avgComments: 28, emv: 1743, engagementRate: 0.0129, liftMultiplier: -0.4 },
    { brand: "@elementelectronics", posts: 7, avgLikes: 443, avgComments: 15, emv: 1712.5, engagementRate: 0.0555, liftMultiplier: -0.8 },
    { brand: "@aladdinseatery", posts: 3, avgLikes: 1060.33, avgComments: 21, emv: 1683.5, engagementRate: 0.1285, liftMultiplier: -0.5 },
    { brand: "@postgame.official", posts: 20, avgLikes: 146.7, avgComments: 7, emv: 1669.5, engagementRate: 0.0429, liftMultiplier: -0.9 },
    { brand: "@rivalsdotcom", posts: 1, avgLikes: 2802, avgComments: 95, emv: 1543.5, engagementRate: 0.9406, liftMultiplier: 0.4 },
    { brand: "@rootsnk", posts: 8, avgLikes: 351.25, avgComments: 11, emv: 1532.5, engagementRate: 0.0181, liftMultiplier: -0.8 },
    { brand: "@raisingcanes", posts: 4, avgLikes: 659.25, avgComments: 27, emv: 1482, engagementRate: 0.0258, liftMultiplier: -0.7 },
    { brand: "@PaniniAmerica", posts: 1, avgLikes: 2810, avgComments: 31, emv: 1451.5, engagementRate: 0.0572, liftMultiplier: 0.4 },
    { brand: "@crackerbarrel", posts: 2, avgLikes: 1298.5, avgComments: 50, emv: 1447, engagementRate: 0.0372, liftMultiplier: -0.3 },
    { brand: "@leesfamouschick", posts: 1, avgLikes: 2802, avgComments: 28, emv: 1443, engagementRate: 0.0571, liftMultiplier: 0.4 },
    { brand: "@nike_wrestling", posts: 1, avgLikes: 2659, avgComments: 20, emv: 1359.5, engagementRate: 0.0784, liftMultiplier: 0.4 },
    { brand: "slaneglover", posts: 1, avgLikes: 2503, avgComments: 63, emv: 1346, engagementRate: 0.1389, liftMultiplier: 0.3 },
    { brand: "@uber", posts: 4, avgLikes: 622.25, avgComments: 8, emv: 1292.5, engagementRate: 0.0129, liftMultiplier: -0.7 },
    { brand: "@OIKOS", posts: 1, avgLikes: 2458, avgComments: 33, emv: 1278.5, engagementRate: 0.0075, liftMultiplier: 0.3 },
    { brand: "@stxmlax", posts: 2, avgLikes: 1245, avgComments: 5, emv: 1260, engagementRate: 0.0787, liftMultiplier: -0.4 },

    { brand: "@nikelacrosse", posts: 2, avgLikes: 1088, avgComments: 35, emv: 1191.5, engagementRate: 0.2847, liftMultiplier: -0.4 },
    { brand: "@thefoundationohio", posts: 3, avgLikes: 743.67, avgComments: 13, emv: 1174, engagementRate: 0.3023, liftMultiplier: -0.6 },
    { brand: "@CELSIUSBrandPartner", posts: 1, avgLikes: 2296, avgComments: 11, emv: 1164.5, engagementRate: 0.0069, liftMultiplier: 0.2 },
    { brand: "@bauerhockey", posts: 2, avgLikes: 1044.5, avgComments: 39, emv: 1161.5, engagementRate: 0.1611, liftMultiplier: -0.5 },
    { brand: "@gametimeapp", posts: 1, avgLikes: 2191, avgComments: 41, emv: 1157, engagementRate: 0.1208, liftMultiplier: 0.1 },
    { brand: "@spartancombat", posts: 1, avgLikes: 1969, avgComments: 73, emv: 1094, engagementRate: 0.1932, liftMultiplier: 0 },
    { brand: "@nintendoamerica", posts: 1, avgLikes: 0, avgComments: 714, emv: 1071, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@tommyjohnwear", posts: 1, avgLikes: 2028, avgComments: 14, emv: 1035, engagementRate: 0.0544, liftMultiplier: 0 },
    { brand: "@Nash", posts: 1, avgLikes: 2007, avgComments: 18, emv: 1030.5, engagementRate: 0.1168, liftMultiplier: 0 },
    { brand: "@honeystinger", posts: 2, avgLikes: 965, avgComments: 18, emv: 1019, engagementRate: 0.162, liftMultiplier: -0.5 },
    { brand: "@C4Energy", posts: 7, avgLikes: 238.86, avgComments: 17, emv: 1010, engagementRate: 0.0608, liftMultiplier: -0.9 },
    { brand: "@wingsandrings.lc", posts: 1, avgLikes: 2018, avgComments: 0, emv: 1009, engagementRate: 0.0297, liftMultiplier: 0 },
  ] as Partnership[],
};

// ═══════════════════════════════════════════════════════════════
// ATHLETE & BENCHMARK DATA
// ═══════════════════════════════════════════════════════════════
const topCollabAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 6, emv: 284753, lift: 82 },
  { rank: 2, name: "Sonny Styles", sport: "Football", posts: 7, emv: 117351, lift: 82 },
  { rank: 3, name: "Brandon Inniss", sport: "Football", posts: 3, emv: 81382, lift: 82 },
  { rank: 4, name: "Jermaine Mathews Jr.", sport: "Football", posts: 5, emv: 73800, lift: 82 },
  { rank: 5, name: "Caleb Downs", sport: "Football", posts: 4, emv: 60319, lift: 82 },
];
const topLogoAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 35, emv: 985746, lift: 61 },
  { rank: 2, name: "Caleb Downs", sport: "Football", posts: 32, emv: 694311, lift: 61 },
  { rank: 3, name: "Julian Sayin", sport: "Football", posts: 12, emv: 348274, lift: 61 },
  { rank: 4, name: "Sonny Styles", sport: "Football", posts: 27, emv: 249057, lift: 61 },
  { rank: 5, name: "Brandon Inniss", sport: "Football", posts: 20, emv: 237235, lift: 61 },
];
const topMentionAthletes = [
  { rank: 1, name: "Caleb Downs", sport: "Football", posts: 12, emv: 241149, lift: 148 },
  { rank: 2, name: "Carson Hinzman", sport: "Football", posts: 12, emv: 139272, lift: 148 },
  { rank: 3, name: "Jeremiah Smith", sport: "Football", posts: 6, emv: 129645, lift: 148 },
  { rank: 4, name: "Quincy Porter", sport: "Football", posts: 12, emv: 118790, lift: 148 },
  { rank: 5, name: "Jesse Mendez", sport: "M. Wrestling", posts: 31, emv: 89645, lift: 148 },
];
const signalStats = {
  collab: { posts: 195, totalEmv: 1294184, avgEmv: 6637, lift: 85 },
  logo: { posts: 5245, totalEmv: 8698443, avgEmv: 1658, lift: 190 },
  mention: { posts: 2506, totalEmv: 3354479, avgEmv: 1339, lift: 298 },
};

const fallbackSportData: Record<string, Record<string, { with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number }; without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number } }>> = {
  'ALL_SPORTS': {
    mention: { with: { posts: 2506, avgLikes: 2547, avgComments: 43, engagementRate: 0.8783 }, without: { posts: 9878, avgLikes: 1791, avgComments: 46, engagementRate: 0.2208 } },
    logo: { with: { posts: 5245, avgLikes: 3145, avgComments: 57, engagementRate: 0.5685 }, without: { posts: 7139, avgLikes: 1061, avgComments: 37, engagementRate: 0.1961 } },
    collab: { with: { posts: 195, avgLikes: 12935, avgComments: 113, engagementRate: 0.6456 }, without: { posts: 12189, avgLikes: 1768, avgComments: 45, engagementRate: 0.3491 } }
  },
  'FOOTBALL': {
    mention: { with: { posts: 334, avgLikes: 10118, avgComments: 100, engagementRate: 0.7722 }, without: { posts: 1641, avgLikes: 7479, avgComments: 117, engagementRate: 0.2998 } },
    logo: { with: { posts: 1139, avgLikes: 10696, avgComments: 139, engagementRate: 0.5316 }, without: { posts: 836, avgLikes: 4152, avgComments: 81, engagementRate: 0.1728 } },
    collab: { with: { posts: 91, avgLikes: 24673, avgComments: 208, engagementRate: 0.8692 }, without: { posts: 1884, avgLikes: 7117, avgComments: 110, engagementRate: 0.356 } }
  },
  'MENS_BASKETBALL': {
    mention: { with: { posts: 84, avgLikes: 4561, avgComments: 34, engagementRate: 14.5359 }, without: { posts: 215, avgLikes: 2907, avgComments: 37, engagementRate: 1.8628 } },
    logo: { with: { posts: 152, avgLikes: 4662, avgComments: 45, engagementRate: 8.9774 }, without: { posts: 147, avgLikes: 2038, avgComments: 28, engagementRate: 1.7479 } },
    collab: { with: { posts: 13, avgLikes: 6693, avgComments: 51, engagementRate: 0.7221 }, without: { posts: 286, avgLikes: 3221, avgComments: 36, engagementRate: 5.6368 } }
  },
  'MENS_WRESTLING': {
    mention: { with: { posts: 228, avgLikes: 2291, avgComments: 21, engagementRate: 0.3847 }, without: { posts: 325, avgLikes: 1716, avgComments: 18, engagementRate: 0.2494 } },
    logo: { with: { posts: 230, avgLikes: 2390, avgComments: 23, engagementRate: 0.42 }, without: { posts: 323, avgLikes: 1642, avgComments: 16, engagementRate: 0.2234 } },
    collab: { with: { posts: 1, avgLikes: 801, avgComments: 1, engagementRate: 0.1935 }, without: { posts: 552, avgLikes: 1955, avgComments: 19, engagementRate: 0.3054 } }
  },
  'WOMENS_BASKETBALL': {
    mention: { with: { posts: 179, avgLikes: 1690, avgComments: 21, engagementRate: 0.1569 }, without: { posts: 269, avgLikes: 1554, avgComments: 40, engagementRate: 0.1062 } },
    logo: { with: { posts: 228, avgLikes: 1875, avgComments: 28, engagementRate: 0.1487 }, without: { posts: 220, avgLikes: 1332, avgComments: 37, engagementRate: 0.1035 } },
    collab: { with: { posts: 22, avgLikes: 2832, avgComments: 28, engagementRate: 0.1594 }, without: { posts: 426, avgLikes: 1545, avgComments: 33, engagementRate: 0.1248 } }
  },
  'MENS_GYMNASTICS': {
    mention: { with: { posts: 121, avgLikes: 714, avgComments: 19, engagementRate: 0.4428 }, without: { posts: 196, avgLikes: 657, avgComments: 14, engagementRate: 0.3992 } },
    logo: { with: { posts: 158, avgLikes: 513, avgComments: 20, engagementRate: 0.3425 }, without: { posts: 159, avgLikes: 843, avgComments: 13, engagementRate: 0.4887 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 317, avgLikes: 679, avgComments: 16, engagementRate: 0.4158 } }
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
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 58.6, logoEng: 29.96, mentionEng: 47.57, collabEng: 50.81, followers: 882398 },
  { name: 'Nebraska', conf: 'Big 10', posts: 4026, adoption: 50.8, logoEng: 34.47, mentionEng: 50.63, collabEng: 80.32, followers: 3126161 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 56.2, logoEng: 34.39, mentionEng: 50.18, collabEng: 36.87, followers: 2381406 },
  { name: 'Maryland', conf: 'Big 10', posts: 2790, adoption: 49, logoEng: 22.93, mentionEng: 27.67, collabEng: 40.22, followers: 863472 },
  { name: 'Ohio State', conf: 'Big 10', posts: 12384, adoption: 47.8, logoEng: 56.85, mentionEng: 87.83, collabEng: 64.56, followers: 5546349 },
  { name: 'Oregon', conf: 'Big 10', posts: 2683, adoption: 46.3, logoEng: 47.44, mentionEng: 43.36, collabEng: 104.75, followers: 1904523 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2887, adoption: 45.2, logoEng: 33.48, mentionEng: 38.02, collabEng: 50.48, followers: 827265 },
  { name: 'Indiana', conf: 'Big 10', posts: 2604, adoption: 44.2, logoEng: 26.75, mentionEng: 27.66, collabEng: 54.12, followers: 1198872 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logoEng: 37.82, mentionEng: 48.49, collabEng: 108.02, followers: 4114531 },
  { name: 'Iowa', conf: 'Big 10', posts: 3002, adoption: 40.7, logoEng: 37.57, mentionEng: 40.37, collabEng: 46.35, followers: 1004448 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2754, adoption: 39.5, logoEng: 27.39, mentionEng: 30.15, collabEng: 33.87, followers: 702547 },
  { name: 'Purdue', conf: 'Big 10', posts: 5294, adoption: 36.4, logoEng: 27.59, mentionEng: 38.19, collabEng: 41.02, followers: 1299880 },
  { name: 'Washington', conf: 'Big 10', posts: 2949, adoption: 31.2, logoEng: 29.95, mentionEng: 37.75, collabEng: 79.04, followers: 1005485 },
  { name: 'Illinois', conf: 'Big 10', posts: 3328, adoption: 20.3, logoEng: 32.81, mentionEng: 40.17, collabEng: 45.90, followers: 956415 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5983, adoption: 42.0, logoEng: 32.82, mentionEng: 19.67, collabEng: 65.11, followers: 1812655 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 33.5, logoEng: 32.89, mentionEng: 21.37, collabEng: 56.61, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 38.3, logoEng: 34.18, mentionEng: 54.59, collabEng: 86.52, followers: 4376029 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1577, adoption: 60.1, logoEng: 18.46, mentionEng: 18.06, collabEng: 37.56, followers: 406916 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 58.6, logoEng: 29.96, mentionEng: 47.57, collabEng: 50.81, followers: 882398 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 55.6, logoEng: 26.86, mentionEng: 44.00, collabEng: 50.58, followers: 304204 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 53, logoEng: 30.88, mentionEng: 0, collabEng: 88.62, followers: 957605 },
  { name: 'Texas A&M', conf: 'SEC', posts: 4317, adoption: 51.4, logoEng: 37.33, mentionEng: 70.72, collabEng: 69.92, followers: 1878601 },
  { name: 'Virginia Tech', conf: 'ACC', posts: 3978, adoption: 51.3, logoEng: 27.97, mentionEng: 33.05, collabEng: 18.48, followers: 1872167 },
  { name: 'Nebraska', conf: 'Big 10', posts: 4026, adoption: 50.8, logoEng: 34.47, mentionEng: 50.63, collabEng: 80.32, followers: 3126161 },
  { name: 'Washington State', conf: 'Pac-12', posts: 948, adoption: 50.4, logoEng: 31.20, mentionEng: 39.11, collabEng: 60.15, followers: 186487 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 56.2, logoEng: 34.39, mentionEng: 50.18, collabEng: 36.87, followers: 2381406 },
  { name: 'Miami', conf: 'ACC', posts: 2085, adoption: 49.4, logoEng: 34.87, mentionEng: 16.23, collabEng: 69.85, followers: 1703801 },
  { name: 'Maryland', conf: 'Big 10', posts: 2790, adoption: 49, logoEng: 22.93, mentionEng: 27.67, collabEng: 40.22, followers: 863472 },
  { name: 'Notre Dame', conf: 'ACC', posts: 2788, adoption: 48.8, logoEng: 40.76, mentionEng: 69.86, collabEng: 75.29, followers: 1578114 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.7, logoEng: 20.32, mentionEng: 0, collabEng: 49.54, followers: 1237637 },
  { name: 'Auburn', conf: 'SEC', posts: 6405, adoption: 48.1, logoEng: 32.51, mentionEng: 40.00, collabEng: 60.09, followers: 2323541 },
  { name: 'Ohio State', conf: 'Big 10', posts: 12384, adoption: 47.8, logoEng: 56.85, mentionEng: 87.83, collabEng: 64.56, followers: 5546349 },
  { name: 'Kentucky', conf: 'SEC', posts: 4299, adoption: 47, logoEng: 26.91, mentionEng: 22.80, collabEng: 42.92, followers: 1671393 },
  { name: 'Oregon', conf: 'Big 10', posts: 2683, adoption: 46.3, logoEng: 47.44, mentionEng: 43.36, collabEng: 104.75, followers: 1904523 },
  { name: 'LSU', conf: 'SEC', posts: 5450, adoption: 46.1, logoEng: 36.15, mentionEng: 48.38, collabEng: 77.49, followers: 5170563 },
  { name: 'UTSA', conf: 'AAC', posts: 3773, adoption: 46, logoEng: 22.45, mentionEng: 30.57, collabEng: 34.82, followers: 835260 },
  { name: 'NC State', conf: 'ACC', posts: 2565, adoption: 45.6, logoEng: 23.90, mentionEng: 0, collabEng: 48.35, followers: 1238519 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2802, adoption: 45.4, logoEng: 38.26, mentionEng: 0, collabEng: 0, followers: 1703577 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2887, adoption: 45.2, logoEng: 33.48, mentionEng: 38.02, collabEng: 50.48, followers: 827265 },
  { name: 'Baylor', conf: 'Big 12', posts: 7496, adoption: 44.8, logoEng: 42.63, mentionEng: 47.76, collabEng: 111.49, followers: 2110678 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 44.8, logoEng: 22.14, mentionEng: 31.99, collabEng: 30.09, followers: 347584 },
  { name: 'UCF', conf: 'Big 12', posts: 2409, adoption: 44.3, logoEng: 30.92, mentionEng: 42.17, collabEng: 44.31, followers: 1202431 },
  { name: 'Indiana', conf: 'Big 10', posts: 2604, adoption: 44.2, logoEng: 26.75, mentionEng: 27.66, collabEng: 54.12, followers: 1198872 },
  { name: 'New Mexico State', conf: 'CUSA', posts: 981, adoption: 44.1, logoEng: 20.18, mentionEng: 0, collabEng: 54.20, followers: 0 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4968, adoption: 43.7, logoEng: 26.05, mentionEng: 36.40, collabEng: 29.50, followers: 1043067 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logoEng: 37.82, mentionEng: 48.49, collabEng: 108.02, followers: 4114531 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.5, logoEng: 35.18, mentionEng: 0, collabEng: 61.42, followers: 2032007 },
  { name: 'Arizona', conf: 'Big 12', posts: 4371, adoption: 43.1, logoEng: 27.02, mentionEng: 33.78, collabEng: 67.42, followers: 3260269 },
  { name: 'Missouri', conf: 'SEC', posts: 5726, adoption: 42.3, logoEng: 34.86, mentionEng: 38.38, collabEng: 86.37, followers: 1271953 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.7, logoEng: 44.50, mentionEng: 0, collabEng: 0, followers: 956180 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logoEng: 20.14, mentionEng: 0, collabEng: 32.85, followers: 994666 },
  { name: 'Rice', conf: 'AAC', posts: 632, adoption: 41.1, logoEng: 19.80, mentionEng: 0, collabEng: 27.26, followers: 0 },
  { name: 'Iowa', conf: 'Big 10', posts: 3002, adoption: 40.7, logoEng: 37.57, mentionEng: 40.37, collabEng: 46.35, followers: 1004448 },
  { name: 'Alabama', conf: 'SEC', posts: 5750, adoption: 40.4, logoEng: 34.34, mentionEng: 47.36, collabEng: 44.94, followers: 3966222 },
  { name: 'Georgia Tech', conf: 'ACC', posts: 2066, adoption: 40.4, logoEng: 36.10, mentionEng: 0, collabEng: 49.88, followers: 990980 },
  { name: 'Florida State', conf: 'ACC', posts: 2130, adoption: 40.1, logoEng: 42.50, mentionEng: 0, collabEng: 0, followers: 1333391 },
  { name: 'Virginia', conf: 'ACC', posts: 6496, adoption: 40, logoEng: 45.62, mentionEng: 38.90, collabEng: 55.11, followers: 2044598 },
  { name: 'Boston College', conf: 'ACC', posts: 1539, adoption: 40, logoEng: 30.21, mentionEng: 0, collabEng: 47.85, followers: 590503 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2754, adoption: 39.5, logoEng: 27.39, mentionEng: 30.15, collabEng: 33.87, followers: 702547 },
  { name: 'Arkansas', conf: 'SEC', posts: 5715, adoption: 36.5, logoEng: 36.05, mentionEng: 50.99, collabEng: 67.65, followers: 2827038 },
  { name: 'DePaul', conf: 'Big East', posts: 746, adoption: 36.5, logoEng: 19.30, mentionEng: 0, collabEng: 36.17, followers: 121473 },
  { name: 'Purdue', conf: 'Big 10', posts: 5294, adoption: 36.4, logoEng: 27.59, mentionEng: 38.19, collabEng: 41.02, followers: 1299880 },
  { name: 'Arizona State', conf: 'Big 12', posts: 7779, adoption: 34.4, logoEng: 25.70, mentionEng: 34.18, collabEng: 54.73, followers: 2269788 },
  { name: 'Mississippi', conf: 'SEC', posts: 2239, adoption: 34.4, logoEng: 23.38, mentionEng: 0, collabEng: 0, followers: 986747 },
  { name: 'BYU', conf: 'Big 12', posts: 7519, adoption: 34.3, logoEng: 28.50, mentionEng: 35.20, collabEng: 48.10, followers: 2693744 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 33.8, logoEng: 24.19, mentionEng: 33.46, collabEng: 12.39, followers: 403604 },
  { name: 'Washington', conf: 'Big 10', posts: 2949, adoption: 31.2, logoEng: 29.95, mentionEng: 37.75, collabEng: 79.04, followers: 1005485 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 30, logoEng: 25.10, mentionEng: 0, collabEng: 115.29, followers: 962963 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.8, logoEng: 23.77, mentionEng: 0, collabEng: 68.28, followers: 907225 },
  { name: 'Texas', conf: 'SEC', posts: 6186, adoption: 26.4, logoEng: 37.31, mentionEng: 44.84, collabEng: 86.53, followers: 3552007 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.8, logoEng: 27.90, mentionEng: 0, collabEng: 0, followers: 732360 },
  { name: 'San Diego', conf: 'WCC', posts: 2031, adoption: 25.2, logoEng: 15.98, mentionEng: 21.93, collabEng: 107.09, followers: 439463 },
  { name: 'Creighton', conf: 'Big East', posts: 2592, adoption: 24.6, logoEng: 28.23, mentionEng: 35.07, collabEng: 41.15, followers: 438009 },
  { name: 'Colorado', conf: 'Big 12', posts: 1406, adoption: 24.5, logoEng: 37.40, mentionEng: 0, collabEng: 0, followers: 1506666 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.1, logoEng: 28.68, mentionEng: 0, collabEng: 97.37, followers: 1266884 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.6, logoEng: 39.86, mentionEng: 26.33, collabEng: 277.84, followers: 1238932 },
  { name: 'Clemson', conf: 'ACC', posts: 3360, adoption: 20.4, logoEng: 35.76, mentionEng: 20.25, collabEng: 294.15, followers: 1726437 },
  { name: 'Illinois', conf: 'Big 10', posts: 3328, adoption: 20.3, logoEng: 32.81, mentionEng: 40.17, collabEng: 45.90, followers: 956415 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logoEng: 35.71, mentionEng: 0, collabEng: 0, followers: 1383229 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1921, adoption: 18.1, logoEng: 26.56, mentionEng: 0, collabEng: 0, followers: 1059619 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1653, adoption: 17.8, logoEng: 55.58, mentionEng: 0, collabEng: 0, followers: 634620 },
  { name: 'Duke', conf: 'ACC', posts: 1951, adoption: 16.6, logoEng: 22.40, mentionEng: 0, collabEng: 49.10, followers: 1435498 },
  { name: 'UNC', conf: 'ACC', posts: 3057, adoption: 16.3, logoEng: 36.18, mentionEng: 19.32, collabEng: 371.32, followers: 1434088 },
  { name: 'Georgia', conf: 'SEC', posts: 6868, adoption: 23.7, logoEng: 23.33, mentionEng: 40.36, collabEng: 76.56, followers: 2864099 },
  { name: 'Providence', conf: 'Big East', posts: 679, adoption: 15.8, logoEng: 20.43, mentionEng: 0, collabEng: 32.50, followers: 366758 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 13.8, logoEng: 32.32, mentionEng: 21.92, collabEng: 87.13, followers: 1848323 },
  { name: 'Florida', conf: 'SEC', posts: 2693, adoption: 12.7, logoEng: 33.36, mentionEng: 0, collabEng: 0, followers: 3163738 },
  { name: 'Boise State', conf: 'MWC', posts: 4000, adoption: 12.3, logoEng: 35.18, mentionEng: 0, collabEng: 43.16, followers: 724157 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5983, adoption: 42.0, logoEng: 32.82, mentionEng: 19.67, collabEng: 65.11, followers: 1812655 },
  { name: 'Pittsburgh', conf: 'ACC', posts: 2475, adoption: 11.8, logoEng: 40.72, mentionEng: 0, collabEng: 122.46, followers: 740916 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 33.5, logoEng: 32.89, mentionEng: 21.37, collabEng: 56.61, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 38.3, logoEng: 34.18, mentionEng: 54.59, collabEng: 86.52, followers: 4376029 },
  { name: 'Robert Morris', conf: 'Horizon', posts: 2687, adoption: 7.4, logoEng: 11.35, mentionEng: 0, collabEng: 0, followers: 465010 },
];

const conferenceAvg = { adoption: 42.5, logoEng: 34.1, mentionEng: 41.4, collabEng: 61.5 };
const ncaaD1Avg = { adoption: 36.7, logoEng: 31.3, mentionEng: 28.8, collabEng: 57.4 };
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
          <p className="text-xs uppercase tracking-wider text-gray-500">Engagement Lift vs Baseline</p>
          <Tooltip content="Percent difference in engagement rate compared to posts without this signal.">
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
            subtitle="Combined athlete Instagram audience"
          />
          <KPIChip
            label="Total Interactions"
            value={formatNumber(totalInteractions)}
            icon={<Heart className="w-8 h-8 text-white" />}
            subtitle="Likes + comments across all athlete posts"
          />
          <KPIChip
            label="Posts with IP"
            value={formatNumber(overview.postsWithIP)}
            icon={<FileText className="w-8 h-8 text-white" />}
            subtitle={`Out of ${formatNumber(overview.totalPosts)} athlete posts`}
          />
          <KPIChip
            label="Total EMV"
            value={formatCurrency(overview.totalEmv)}
            icon={<DollarSign className="w-8 h-8 text-white" />}
            subtitle="Estimated earned media value from IP posts"
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
            Data reflects <span className="font-semibold">Ohio State athlete personal Instagram accounts</span>, including collaboration posts with official team pages.
            Metrics track how athletes use Ohio State IP (logos, mentions, collaborations) across their content history.
            Analysis covers{' '}
            <span className="font-semibold">{formatNumber(overview.totalPosts)} all-time athlete posts</span> from{' '}
            <span className="font-semibold">{formatNumber(ipData.totalFollowers)} combined followers</span>.{' '}
            Data snapshot: February 17, 2025.
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
            Avg engagement with vs. without {currentSignal?.label}, across all {formatNumber(overviewData?.totalPosts ?? 0)} athlete posts
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
        // Override: CleverMade logo
        nextMap['clever_made'] = '/cm.jpg';
        nextMap['clevermade'] = '/cm.jpg';
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
      {/* Tab header */}
      <div>
        <SectionHeader primary="SPONSORED " secondary="POSTS" />
        <p className="text-sm text-gray-500 mt-2">
          Brand sponsors identified from #ad or paid partnership disclosures in athlete post captions, across all athlete posts.
          <span className="ml-1 text-gray-400">Eng Lift = avg engagement of sponsored posts vs. the athlete's non-sponsored baseline.</span>
        </p>
      </div>

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
          <div>
            <SectionHeader primary="ALL " secondary="PARTNERSHIPS" />
            <p className="text-sm text-gray-500 mt-1">All brands with disclosed sponsorships in athlete posts, sorted by {(sortOptions as Array<{key: string; label: string}>).find(o => o.key === sortKey)?.label.toLowerCase() ?? 'engagement lift'}.</p>
          </div>
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
            <span className="font-semibold">Methodology:</span> Top 5 athletes per IP signal type, ranked by total EMV across all athlete posts.
          </p>
          <p>
            Lift = engagement rate of IP posts vs. the same athlete's non-IP posts.
            EMV formula: (Total Likes × $0.50) + (Total Comments × $1.50).
          </p>
          <p className="text-xs text-gray-400">
            Signal types: <span className="font-medium">Collaboration</span> = co-authored post with official account,
            <span className="font-medium"> Visual IP</span> = Ohio State logo detected in media,
            <span className="font-medium"> Mention</span> = @OhioState or school reference in caption.
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
  const [rankingMetric, setRankingMetric] = useState<'followers' | 'posts' | 'ipPosts' | 'mentionEng' | 'logoEng' | 'collabEng'>('followers');
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? big10Schools : ncaaD1Schools;
  const benchmarkLabel = isConference ? 'Big 10' : 'NCAA D1';
  const metricLabels = {
    followers: 'Followers',
    posts: 'Total Posts',
    ipPosts: 'IP Posts',
    mentionEng: 'Mention Eng Rate',
    logoEng: 'Visual IP Eng Rate',
    collabEng: 'Collab Eng Rate',
  } as const;
  const metricAverage = {
    followers: 0,
    posts: 0,
    ipPosts: 0,
    mentionEng: isConference ? conferenceAvg.mentionEng : ncaaD1Avg.mentionEng,
    logoEng: isConference ? conferenceAvg.logoEng : ncaaD1Avg.logoEng,
    collabEng: isConference ? conferenceAvg.collabEng : ncaaD1Avg.collabEng,
  };

  const rankedSchools = useMemo(() => {
    if (rankingMetric === 'ipPosts') {
      return [...schools].sort((a, b) => (b.posts * b.adoption / 100) - (a.posts * a.adoption / 100));
    }
    return [...schools].sort((a, b) => b[rankingMetric] - a[rankingMetric]);
  }, [schools, rankingMetric]);

  const ohioIndex = rankedSchools.findIndex((s) => s.name === 'Ohio State');
  const ohioRank = ohioIndex >= 0 ? ohioIndex + 1 : null;
  const ohioSchool = rankedSchools.find((s) => s.name === 'Ohio State') ?? null;
  const ohioValue = ohioSchool ? (rankingMetric === 'ipPosts' ? Math.round(ohioSchool.posts * ohioSchool.adoption / 100) : ohioSchool[rankingMetric]) : 0;
  const avgValue = metricAverage[rankingMetric];
  const deltaVsAvg = ohioValue - avgValue;

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
              {rankingMetric === 'followers' || rankingMetric === 'posts' || rankingMetric === 'ipPosts' ? formatNumber(ohioValue) : `${ohioValue}%`}
            </p>
            {avgValue > 0 && (
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: deltaVsAvg >= 0 ? colors.positive : colors.negative }}
              >
                {deltaVsAvg >= 0 ? '\u2191' : '\u2193'} {Math.abs(deltaVsAvg).toFixed(1)}%
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
            {(() => {
              const isCount = rankingMetric === 'followers' || rankingMetric === 'posts' || rankingMetric === 'ipPosts';
              const getVal = (s: typeof rankedSchools[0]) =>
                rankingMetric === 'ipPosts' ? Math.round(s.posts * s.adoption / 100) : s[rankingMetric] as number;
              const ttun = rankedSchools.find(s => s.name === 'Michigan');
              if (!ttun || !ohioSchool) return <>No ranking data available for this view.</>;
              const ttunValue = getVal(ttun);
              const gap = (ohioValue as number) - ttunValue;
              const ahead = gap >= 0;
              if (isCount) {
                return (
                  <>Ohio State has <span className="font-semibold">{formatNumber(Math.abs(gap))} {ahead ? 'more' : 'fewer'} {metricLabels[rankingMetric].toLowerCase()}</span> than That Team Up North.</>
                );
              }
              return (
                <>Ohio State's {metricLabels[rankingMetric].toLowerCase()} is <span className="font-semibold">{Math.abs(gap).toFixed(1)}pp {ahead ? 'above' : 'below'}</span> That Team Up North ({(ohioValue as number).toFixed(1)}% vs {ttunValue.toFixed(1)}%).</>
              );
            })()}
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
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('ipPosts')}>IP Posts {rankingMetric === 'ipPosts' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('logoEng')}>Visual IP Eng {rankingMetric === 'logoEng' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('mentionEng')}>Mention Eng {rankingMetric === 'mentionEng' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('collabEng')}>Collab Eng {rankingMetric === 'collabEng' ? '\u25BC' : ''}</th>
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
                        {renderSchoolName(school.name)}
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
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.logoEng > 0 ? `${school.logoEng.toFixed(1)}%` : '--'}</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.mentionEng > 0 ? `${school.mentionEng.toFixed(1)}%` : '--'}</td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{school.collabEng > 0 ? `${school.collabEng.toFixed(1)}%` : '--'}</td>
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
      <div>
        <SectionHeader primary="CONTENT " secondary="PERFORMANCE" />
        <p className="text-sm text-gray-500 mt-2">Top athlete and team page posts from all posts analyzed. Engagement lift is measured against the school-wide median post.</p>
      </div>

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
                          <p className="text-gray-400 uppercase tracking-wider">Lift vs School Median</p>
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
            {view === 'overview'
            ? 'Official Ohio State team page follower counts and engagement. Followers reflect current account size; likes and engagement rate are based on a recent post sample.'
            : 'Benchmark Ohio State team pages against conference and NCAA schools. Follower counts are live; engagement metrics are sampled from recent posts.'}
          </p>
          {view === 'overview' && (
            <p className="text-xs mt-1" style={{ color: colors.textDim }}>
              Engagement rate and total likes are calculated from the most recent ~{formatNumber(maxTrackedPosts)} posts captured per team.
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
            Follower counts reflect current account size. Likes, engagement rate, and post count are based on a recent post sample (~last 12 posts per team). Not all team pages are included for every school.
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
        for (const path of ['/data/roster_teams.json', '/data/ip-roster-teams.json']) {
          const res = await fetch(path);
          if (!res.ok) continue;
          const rows = (await res.json()) as TeamRosterRow[];
          if (!cancelled) setRawRows(rows);
          break;
        }
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
                      {renderSchoolName(school.name)}
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
