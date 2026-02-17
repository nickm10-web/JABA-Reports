import { useState, useMemo, useEffect, useRef } from 'react';
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
  totalFollowers: 5546349,
  totalPosts: 9629,
  totalLikes: 17070762,
  totalComments: 425466,
  engagementRate: 0.0315,
  baseline: { posts: 4966, engagementRate: 0.0315 },
  postsWithIP: 4663,
  ipAdoptionRate: 48.4,
  avgLift: 83.7,
  totalEmv: 9173580,
  collaboration: {
    posts: 116, likes: 13138.07, comments: 110.6,
    engagementRate: 0.2402, delta: 63.34, emv: 781253,
    baselineEngRate: 0.147, baselinePosts: 9513,
    baselineLikes: 1634.26, baselineComments: 43.38,
  } as IPSignalData,
  logo: {
    posts: 4252, likes: 2971.74, comments: 56.54,
    engagementRate: 0.1869, delta: 86.34, emv: 6678513.5,
    baselineEngRate: 0.1003, baselinePosts: 5377,
    baselineLikes: 824.8, baselineComments: 34.42,
  } as IPSignalData,
  mention: {
    posts: 1933, likes: 2659.22, comments: 47.36,
    engagementRate: 0.2365, delta: 78.94, emv: 2707471.5,
    baselineEngRate: 0.1321, baselinePosts: 7696,
    baselineLikes: 1550.22, baselineComments: 43.39,
  } as IPSignalData,
  partnerships: [
    { brand: "@accessthewalk", posts: 3, avgLikes: 94104.33, avgComments: 354.33, emv: 142751, engagementRate: 3.0404, liftMultiplier: 15.6 },
    { brand: "@redbullusa", posts: 1, avgLikes: 172889, avgComments: 634, emv: 87395.5, engagementRate: 0.2286, liftMultiplier: 0.2 },
    { brand: "@on3recruits", posts: 2, avgLikes: 41159, avgComments: 694.5, emv: 43242.5, engagementRate: 0.6127, liftMultiplier: 2.3 },
    { brand: "@easportscollege", posts: 5, avgLikes: 16323.6, avgComments: 134.2, emv: 41815.5, engagementRate: 0.0705, liftMultiplier: -0.6 },
    { brand: "@hollister", posts: 58, avgLikes: 819.36, avgComments: 18.55, emv: 25375.5, engagementRate: 0.0704, liftMultiplier: -0.6 },
    { brand: "@dickssportinggoods", posts: 2, avgLikes: 20912, avgComments: 175.5, emv: 21438.5, engagementRate: 0.044, liftMultiplier: -0.8 },
    { brand: "@epicpartner", posts: 1, avgLikes: 41342, avgComments: 127, emv: 20861.5, engagementRate: 0.2339, liftMultiplier: 0.3 },
    { brand: "@pressplay", posts: 4, avgLikes: 6318.75, avgComments: 81.5, emv: 13126.5, engagementRate: 0.1079, liftMultiplier: -0.4 },
    { brand: "@paycomsoftware", posts: 5, avgLikes: 4866, avgComments: 28.6, emv: 12379.5, engagementRate: 0.3847, liftMultiplier: 1.1 },
    { brand: "@discover", posts: 1, avgLikes: 24024, avgComments: 114, emv: 12183, engagementRate: 0.0318, liftMultiplier: -0.8 },
    { brand: "@heydude", posts: 11, avgLikes: 2074.73, avgComments: 37.64, emv: 12032, engagementRate: 0.0562, liftMultiplier: -0.7 },
    { brand: "@gianteagle", posts: 2, avgLikes: 10823, avgComments: 138.5, emv: 11238.5, engagementRate: 0.0931, liftMultiplier: -0.5 },
    { brand: "@att", posts: 1, avgLikes: 21507, avgComments: 237, emv: 11109, engagementRate: 0.0286, liftMultiplier: -0.8 },
    { brand: "@directv", posts: 4, avgLikes: 4988.25, avgComments: 38.5, emv: 10207.5, engagementRate: 0.268, liftMultiplier: 0.5 },
    { brand: "@thehenrylegacy", posts: 1, avgLikes: 15460, avgComments: 226, emv: 8069, engagementRate: 0.8798, liftMultiplier: 3.8 },
    { brand: "@doordash", posts: 2, avgLikes: 7919.5, avgComments: 25, emv: 7994.5, engagementRate: 0.024, liftMultiplier: -0.9 },
    { brand: "@valvolineinstantoilchange", posts: 3, avgLikes: 4767.33, avgComments: 28.67, emv: 7280, engagementRate: 0.0368, liftMultiplier: -0.8 },
    { brand: "@allstate", posts: 2, avgLikes: 7133.5, avgComments: 44.5, emv: 7267, engagementRate: 0.0188, liftMultiplier: -0.9 },
    { brand: "@americaneagle", posts: 20, avgLikes: 604.4, avgComments: 26.2, emv: 6830, engagementRate: 0.0068, liftMultiplier: -1.0 },
    { brand: "@wingstop", posts: 2, avgLikes: 5583.5, avgComments: 256.5, emv: 6353, engagementRate: 0.7257, liftMultiplier: 3.0 },
    { brand: "@KeyBank", posts: 2, avgLikes: 5595, avgComments: 48.5, emv: 5740.5, engagementRate: 0.0074, liftMultiplier: -1.0 },
    { brand: "@naturemadevitamins", posts: 1, avgLikes: 11205, avgComments: 21, emv: 5634, engagementRate: 0.2991, liftMultiplier: 0.6 },
    { brand: "@rebelcrystalofficial", posts: 2, avgLikes: 5456.5, avgComments: 1, emv: 5459.5, engagementRate: 0.092, liftMultiplier: -0.5 },
    { brand: "@lv", posts: 1, avgLikes: 10029, avgComments: 139, emv: 5223, engagementRate: 0.1495, liftMultiplier: -0.2 },
    { brand: "@defensesoap", posts: 1, avgLikes: 10148, avgComments: 33, emv: 5123.5, engagementRate: 0.322, liftMultiplier: 0.8 },
    { brand: "@jlabaudio", posts: 2, avgLikes: 4748, avgComments: 75, emv: 4973, engagementRate: 0.0256, liftMultiplier: -0.9 },
    { brand: "@HeyDude", posts: 1, avgLikes: 9107, avgComments: 101, emv: 4705, engagementRate: 0.0462, liftMultiplier: -0.7 },
    { brand: "@paycom", posts: 1, avgLikes: 9006, avgComments: 33, emv: 4552.5, engagementRate: 0.2859, liftMultiplier: 0.6 },
    { brand: "@athleteps", posts: 1, avgLikes: 8334, avgComments: 45, emv: 4234.5, engagementRate: 0.265, liftMultiplier: 0.4 },
    { brand: "@brooksrunning", posts: 5, avgLikes: 1543.4, avgComments: 30.2, emv: 4085, engagementRate: 0.1027, liftMultiplier: -0.4 },
    { brand: "@ohiostathletics", posts: 1, avgLikes: 7285, avgComments: 40, emv: 3702.5, engagementRate: 0.1476, liftMultiplier: -0.2 },
    { brand: "@cliffkeenathletic", posts: 1, avgLikes: 6996, avgComments: 16, emv: 3522, engagementRate: 3.6712, liftMultiplier: 19.1 },
    { brand: "@GiantEagle", posts: 1, avgLikes: 6747, avgComments: 33, emv: 3423, engagementRate: 0.0204, liftMultiplier: -0.9 },
    { brand: "@pursuityourself", posts: 16, avgLikes: 385.44, avgComments: 12.19, emv: 3376, engagementRate: 0.0602, liftMultiplier: -0.7 },
    { brand: "@locationfootball", posts: 1, avgLikes: 5899, avgComments: 53, emv: 3029, engagementRate: 0.3925, liftMultiplier: 1.1 },
    { brand: "@peppermayo", posts: 3, avgLikes: 1873, avgComments: 32.33, emv: 2955, engagementRate: 0.0317, liftMultiplier: -0.8 },
    { brand: "@colab_collective", posts: 6, avgLikes: 841.67, avgComments: 12.67, emv: 2639, engagementRate: 0.0278, liftMultiplier: -0.8 },
    { brand: "@serialashaeco", posts: 1, avgLikes: 4917, avgComments: 72, emv: 2566.5, engagementRate: 0.2798, liftMultiplier: 0.5 },
    { brand: "@chipotle", posts: 2, avgLikes: 2370, avgComments: 35.5, emv: 2476.5, engagementRate: 0.0287, liftMultiplier: -0.8 },
    { brand: "@ParamountPlus", posts: 1, avgLikes: 4823, avgComments: 32, emv: 2459.5, engagementRate: 0.0704, liftMultiplier: -0.6 },
    { brand: "@paniniamerica", posts: 1, avgLikes: 4368, avgComments: 143, emv: 2398.5, engagementRate: 0.0227, liftMultiplier: -0.9 },
    { brand: "@whereimfrom", posts: 3, avgLikes: 1465.33, avgComments: 30.33, emv: 2334.5, engagementRate: 0.0214, liftMultiplier: -0.9 },
    { brand: "@celsiusofficial", posts: 2, avgLikes: 2143, avgComments: 28, emv: 2227, engagementRate: 0.0129, liftMultiplier: -0.9 },
    { brand: "@marathonfuel", posts: 1, avgLikes: 3988, avgComments: 49, emv: 2067.5, engagementRate: 0.1114, liftMultiplier: -0.4 },
    { brand: "@donatospizza", posts: 4, avgLikes: 974.25, avgComments: 18.25, emv: 2058, engagementRate: 0.1575, liftMultiplier: -0.1 },
    { brand: "@the.courageousathlete", posts: 1, avgLikes: 4013, avgComments: 22, emv: 2039.5, engagementRate: 1.0228, liftMultiplier: 4.6 },
    { brand: "@joandjax", posts: 2, avgLikes: 1875, avgComments: 41, emv: 1998, engagementRate: 0.0599, liftMultiplier: -0.7 },
    { brand: "@c4energy", posts: 7, avgLikes: 422.14, avgComments: 42.86, emv: 1927.5, engagementRate: 0.0212, liftMultiplier: -0.9 },
    { brand: "@neweracap", posts: 6, avgLikes: 596, avgComments: 14.17, emv: 1915.5, engagementRate: 0.0233, liftMultiplier: -0.9 },
    { brand: "@theviewonfifth", posts: 8, avgLikes: 464.38, avgComments: 4, emv: 1905.5, engagementRate: 0.0349, liftMultiplier: -0.8 },
    { brand: "@tytusgrills", posts: 5, avgLikes: 719.2, avgComments: 6.6, emv: 1847.5, engagementRate: 0.0138, liftMultiplier: -0.9 },
    { brand: "@seatgeek", posts: 2, avgLikes: 1755, avgComments: 23, emv: 1824, engagementRate: 0.0144, liftMultiplier: -0.9 },
    { brand: "@shootaway", posts: 3, avgLikes: 1079.33, avgComments: 28, emv: 1745, engagementRate: 0.0129, liftMultiplier: -0.9 },
    { brand: "@buckeye.threads", posts: 30, avgLikes: 109.83, avgComments: 2.07, emv: 1740.5, engagementRate: 0.0274, liftMultiplier: -0.9 },
    { brand: "@aladdinseatery", posts: 3, avgLikes: 1060.33, avgComments: 20.67, emv: 1683.5, engagementRate: 0.1282, liftMultiplier: -0.3 },
    { brand: "@clever_made", posts: 6, avgLikes: 483.5, avgComments: 23.33, emv: 1660.5, engagementRate: 0.1131, liftMultiplier: -0.4 },
    { brand: "@rivalsdotcom", posts: 1, avgLikes: 2802, avgComments: 95, emv: 1543.5, engagementRate: 0.9409, liftMultiplier: 4.1 },
    { brand: "@PaniniAmerica", posts: 1, avgLikes: 2810, avgComments: 31, emv: 1451.5, engagementRate: 0.0572, liftMultiplier: -0.7 },
    { brand: "@crackerbarrel", posts: 2, avgLikes: 1298.5, avgComments: 49.5, emv: 1447, engagementRate: 0.0372, liftMultiplier: -0.8 },
    { brand: "@leesfamouschick", posts: 1, avgLikes: 2801, avgComments: 28, emv: 1442.5, engagementRate: 0.057, liftMultiplier: -0.7 },
    { brand: "@raisingcanes", posts: 3, avgLikes: 872.67, avgComments: 28.33, emv: 1436.5, engagementRate: 0.0305, liftMultiplier: -0.8 },
    { brand: "@nike_wrestling", posts: 1, avgLikes: 2646, avgComments: 20, emv: 1353, engagementRate: 0.0843, liftMultiplier: -0.5 },
    { brand: "@wrestlingbucks", posts: 2, avgLikes: 1285, avgComments: 15.5, emv: 1331.5, engagementRate: 0.163, liftMultiplier: -0.1 },
    { brand: "@uber", posts: 4, avgLikes: 622.25, avgComments: 8, emv: 1292.5, engagementRate: 0.004, liftMultiplier: -1.0 },
    { brand: "@stxmlax", posts: 2, avgLikes: 1242.5, avgComments: 5, emv: 1257.5, engagementRate: 0.0786, liftMultiplier: -0.6 },
    { brand: "@thriveresidents", posts: 3, avgLikes: 665.33, avgComments: 50.67, emv: 1226, engagementRate: 0.0017, liftMultiplier: -1.0 },
    { brand: "@OIKOS", posts: 1, avgLikes: 2353, avgComments: 31, emv: 1223, engagementRate: 0.0072, liftMultiplier: -1.0 },
    { brand: "@nikelacrosse", posts: 2, avgLikes: 1088, avgComments: 34.5, emv: 1191.5, engagementRate: 0.2698, liftMultiplier: 0.5 },
    { brand: "@slaneglover", posts: 1, avgLikes: 2263, avgComments: 38, emv: 1188.5, engagementRate: 0.1246, liftMultiplier: -0.3 },
    { brand: "@thefoundationohio", posts: 3, avgLikes: 743.67, avgComments: 13, emv: 1174, engagementRate: 0.2629, liftMultiplier: 0.4 },
    { brand: "@bumpboxx", posts: 2, avgLikes: 1058.5, avgComments: 36, emv: 1166.5, engagementRate: 0.0593, liftMultiplier: -0.7 },
    { brand: "@bauerhockey", posts: 2, avgLikes: 1039.5, avgComments: 38.5, emv: 1155, engagementRate: 0.2533, liftMultiplier: 0.4 },
    { brand: "@CELSIUSBrandPartner", posts: 1, avgLikes: 2237, avgComments: 12, emv: 1136.5, engagementRate: 0.0068, liftMultiplier: -1.0 },
    { brand: "@gametimeapp", posts: 1, avgLikes: 2141, avgComments: 41, emv: 1132, engagementRate: 0.1182, liftMultiplier: -0.4 },
    { brand: "@tommyjohnwear", posts: 1, avgLikes: 2028, avgComments: 14, emv: 1035, engagementRate: 0.0544, liftMultiplier: -0.7 },
    { brand: "@Nash", posts: 1, avgLikes: 2007, avgComments: 18, emv: 1030.5, engagementRate: 0.1174, liftMultiplier: -0.4 },
    { brand: "@honeystinger", posts: 2, avgLikes: 964, avgComments: 18, emv: 1018, engagementRate: 0.1739, liftMultiplier: -0.0 },
    { brand: "@wingsandrings.lc", posts: 1, avgLikes: 2018, avgComments: 0, emv: 1009, engagementRate: 0.0297, liftMultiplier: -0.8 },
    { brand: "@ricartautomotive", posts: 1, avgLikes: 1840, avgComments: 55, emv: 1002.5, engagementRate: 0.1754, liftMultiplier: -0.0 },
    { brand: "@paramountplus", posts: 1, avgLikes: 1875, avgComments: 21, emv: 969, engagementRate: 0.0275, liftMultiplier: -0.8 },
    { brand: "@_yarn.lab_", posts: 1, avgLikes: 1625, avgComments: 101, emv: 964, engagementRate: 0.0935, liftMultiplier: -0.5 },
    { brand: "@C4Energy", posts: 5, avgLikes: 310.6, avgComments: 22.4, emv: 944.5, engagementRate: 0.0694, liftMultiplier: -0.6 },
    { brand: "@postgame.official", posts: 14, avgLikes: 113.79, avgComments: 6.57, emv: 934.5, engagementRate: 0.0259, liftMultiplier: -0.9 },
    { brand: "@popeyes", posts: 3, avgLikes: 559, avgComments: 15.33, emv: 907.5, engagementRate: 0.0138, liftMultiplier: -0.9 },
    { brand: "@drinkaccelerator", posts: 24, avgLikes: 55.92, avgComments: 6.21, emv: 894.5, engagementRate: 0.0158, liftMultiplier: -0.9 },
    { brand: "@drinkolipop", posts: 5, avgLikes: 302.4, avgComments: 18, emv: 891, engagementRate: 0.1342, liftMultiplier: -0.3 },
    { brand: "@the.nil.store", posts: 9, avgLikes: 177.22, avgComments: 4.33, emv: 856, engagementRate: 0.0066, liftMultiplier: -1.0 },
    { brand: "@his_huddle", posts: 1, avgLikes: 1642, avgComments: 13, emv: 840.5, engagementRate: 48.6765, liftMultiplier: 265.0 },
    { brand: "@mcdonalds_greaterohio", posts: 1, avgLikes: 1629, avgComments: 8, emv: 826.5, engagementRate: 0.3866, liftMultiplier: 1.1 },
    { brand: "@playabowlsosu", posts: 1, avgLikes: 1589, avgComments: 18, emv: 821.5, engagementRate: 0.0271, liftMultiplier: -0.9 },
    { brand: "@campusparc", posts: 9, avgLikes: 143.89, avgComments: 12.33, emv: 814, engagementRate: 0.0354, liftMultiplier: -0.8 },
    { brand: "@mickeysstores", posts: 1, avgLikes: 1546, avgComments: 18, emv: 800, engagementRate: 0.0127, liftMultiplier: -0.9 },
    { brand: "@ramblercolumbus", posts: 7, avgLikes: 204, avgComments: 5.57, emv: 772.5, engagementRate: 0.0612, liftMultiplier: -0.7 },
    { brand: "@chickfila", posts: 3, avgLikes: 406.33, avgComments: 34, emv: 762.5, engagementRate: 0.0493, liftMultiplier: -0.7 },
    { brand: "@aabonnbc", posts: 1, avgLikes: 1427, avgComments: 28, emv: 755.5, engagementRate: 0.1488, liftMultiplier: -0.2 },
    { brand: "@dannydlawn", posts: 2, avgLikes: 612, avgComments: 47.5, emv: 754.5, engagementRate: 0.1948, liftMultiplier: 0.1 },
    { brand: "@princesspolly", posts: 2, avgLikes: 653, avgComments: 26.5, emv: 732.5, engagementRate: 0.053, liftMultiplier: -0.7 },
    { brand: "@gatorade", posts: 2, avgLikes: 615, avgComments: 30.5, emv: 706.5, engagementRate: 0.2889, liftMultiplier: 0.6 },
    { brand: "@gvartwork", posts: 1, avgLikes: 1215, avgComments: 47, emv: 678, engagementRate: 0.2888, liftMultiplier: 0.6 },
    { brand: "@olyforest", posts: 2, avgLikes: 625.5, avgComments: 16, emv: 673.5, engagementRate: 0.0778, liftMultiplier: -0.6 },
    { brand: "@adidas", posts: 1, avgLikes: 1314, avgComments: 9, emv: 670.5, engagementRate: 0.1449, liftMultiplier: -0.2 },
    { brand: "@elementelectronics", posts: 4, avgLikes: 286.25, avgComments: 15.5, emv: 665.5, engagementRate: 0.0461, liftMultiplier: -0.7 },
    { brand: "@drpepper", posts: 2, avgLikes: 560.5, avgComments: 33, emv: 659.5, engagementRate: 0.057, liftMultiplier: -0.7 },
    { brand: "@ohiostatefb", posts: 2, avgLikes: 601.5, avgComments: 18.5, emv: 657, engagementRate: 0.0557, liftMultiplier: -0.7 },
    { brand: "@kinatraxinc", posts: 1, avgLikes: 1294, avgComments: 3, emv: 651.5, engagementRate: 0.7861, liftMultiplier: 3.3 },
    { brand: "@brody_marcet9", posts: 1, avgLikes: 1135, avgComments: 47, emv: 638, engagementRate: 0.5831, liftMultiplier: 2.2 },
    { brand: "@qpeezy_0", posts: 1, avgLikes: 1221, avgComments: 16, emv: 634.5, engagementRate: 0.0468, liftMultiplier: -0.7 },
    { brand: "@krogerco", posts: 1, avgLikes: 1209, avgComments: 18, emv: 631.5, engagementRate: 0.0147, liftMultiplier: -0.9 },
    { brand: "@littlewesttavern", posts: 1, avgLikes: 1172, avgComments: 28, emv: 628, engagementRate: 0.0097, liftMultiplier: -0.9 },
    { brand: "@adoreme", posts: 1, avgLikes: 1042, avgComments: 71, emv: 627.5, engagementRate: 0.2312, liftMultiplier: 0.3 },
    { brand: "@phillies", posts: 1, avgLikes: 932, avgComments: 93, emv: 605.5, engagementRate: 0.2089, liftMultiplier: 0.1 },
    { brand: "@kamaruclothing", posts: 1, avgLikes: 969, avgComments: 77, emv: 600, engagementRate: 0.0566, liftMultiplier: -0.7 },
    { brand: "@7BrewCoffee", posts: 2, avgLikes: 563, avgComments: 6, emv: 581, engagementRate: 0.0021, liftMultiplier: -1.0 },
    { brand: "@starbucks", posts: 1, avgLikes: 1104, avgComments: 16, emv: 576, engagementRate: 0.027, liftMultiplier: -0.9 },
    { brand: "@selectproformance", posts: 4, avgLikes: 248.5, avgComments: 10.75, emv: 561.5, engagementRate: 0.014, liftMultiplier: -0.9 },
    { brand: "@boosted_biz", posts: 1, avgLikes: 949, avgComments: 58, emv: 561.5, engagementRate: 0.0718, liftMultiplier: -0.6 },
    { brand: "@alltohim_apparel", posts: 1, avgLikes: 956, avgComments: 36, emv: 532, engagementRate: 0.1439, liftMultiplier: -0.2 },
    { brand: "@bobboydlincoln", posts: 1, avgLikes: 950, avgComments: 35, emv: 527.5, engagementRate: 0.1411, liftMultiplier: -0.2 },
    { brand: "@goodr", posts: 5, avgLikes: 188.8, avgComments: 7.2, emv: 526, engagementRate: 0.0591, liftMultiplier: -0.7 },
    { brand: "@slimchickens", posts: 1, avgLikes: 985, avgComments: 16, emv: 516.5, engagementRate: 0.1078, liftMultiplier: -0.4 },
    { brand: "@loudoununitedfc", posts: 1, avgLikes: 815, avgComments: 65, emv: 505, engagementRate: 0.3844, liftMultiplier: 1.1 },
    { brand: "@homage", posts: 3, avgLikes: 264.33, avgComments: 21.67, emv: 494, engagementRate: 0.1125, liftMultiplier: -0.4 },
    { brand: "@drinkbubblr", posts: 3, avgLikes: 278.33, avgComments: 16.33, emv: 491, engagementRate: 0.1559, liftMultiplier: -0.1 },
    { brand: "@myplayersports", posts: 6, avgLikes: 155.33, avgComments: 2.5, emv: 488.5, engagementRate: 0.0573, liftMultiplier: -0.7 },
    { brand: "@radixdance", posts: 1, avgLikes: 935, avgComments: 14, emv: 488.5, engagementRate: 0.1466, liftMultiplier: -0.2 },
    { brand: "@goodyearblimp", posts: 1, avgLikes: 915, avgComments: 18, emv: 484.5, engagementRate: 0.0505, liftMultiplier: -0.7 },
    { brand: "@turbotax", posts: 1, avgLikes: 922, avgComments: 14, emv: 482, engagementRate: 0.0182, liftMultiplier: -0.9 },
    { brand: "@tommyjohn", posts: 1, avgLikes: 635, avgComments: 105, emv: 475, engagementRate: 0.0197, liftMultiplier: -0.9 },
    { brand: "@Tmobile", posts: 1, avgLikes: 911, avgComments: 5, emv: 463, engagementRate: 0.0028, liftMultiplier: -1.0 },
    { brand: "@elementtv", posts: 1, avgLikes: 853, avgComments: 21, emv: 458, engagementRate: 0.1235, liftMultiplier: -0.3 },
    { brand: "@foresightsports_upnext", posts: 3, avgLikes: 264, avgComments: 13, emv: 454.5, engagementRate: 0.1647, liftMultiplier: -0.1 },
    { brand: "@myplayerathlete", posts: 9, avgLikes: 84.33, avgComments: 4.89, emv: 445.5, engagementRate: 0.0277, liftMultiplier: -0.8 },
    { brand: "@nhljets", posts: 1, avgLikes: 785, avgComments: 34, emv: 443.5, engagementRate: 0.2582, liftMultiplier: 0.4 },
    { brand: "@monsterenergy", posts: 3, avgLikes: 219.33, avgComments: 24.33, emv: 438.5, engagementRate: 0.0132, liftMultiplier: -0.9 },
    { brand: "@Crocs", posts: 1, avgLikes: 810, avgComments: 21, emv: 436.5, engagementRate: 0.0025, liftMultiplier: -1.0 },
    { brand: "@yungluth", posts: 1, avgLikes: 834, avgComments: 10, emv: 432, engagementRate: 0.2257, liftMultiplier: 0.2 },
    { brand: "@statefarm", posts: 1, avgLikes: 828, avgComments: 11, emv: 430.5, engagementRate: 0.0339, liftMultiplier: -0.8 },
    { brand: "@alex.dixon_", posts: 1, avgLikes: 696, avgComments: 43, emv: 412.5, engagementRate: 0.2314, liftMultiplier: 0.3 },
    { brand: "@tylenol", posts: 2, avgLikes: 359.5, avgComments: 16.5, emv: 409, engagementRate: 0.0074, liftMultiplier: -1.0 },
    { brand: "@carterscamera", posts: 1, avgLikes: 565, avgComments: 84, emv: 408.5, engagementRate: 0.3738, liftMultiplier: 1.0 },
    { brand: "@dickshouseofsport", posts: 1, avgLikes: 754, avgComments: 19, emv: 405.5, engagementRate: 0.042, liftMultiplier: -0.8 },
    { brand: "@nike", posts: 3, avgLikes: 215.33, avgComments: 16.67, emv: 398, engagementRate: 0.0214, liftMultiplier: -0.9 },
    { brand: "@foco", posts: 1, avgLikes: 739, avgComments: 17, emv: 395, engagementRate: 0.292, liftMultiplier: 0.6 },
    { brand: "@hockeycanada", posts: 1, avgLikes: 623, avgComments: 53, emv: 391, engagementRate: 0.2586, liftMultiplier: 0.4 },
    { brand: "@7brewcoffee", posts: 1, avgLikes: 732, avgComments: 16, emv: 390, engagementRate: 0.0027, liftMultiplier: -1.0 },
    { brand: "@underarmour", posts: 1, avgLikes: 669, avgComments: 35, emv: 387, engagementRate: 0.1631, liftMultiplier: -0.1 },
    { brand: "@amazon", posts: 4, avgLikes: 153.25, avgComments: 12.5, emv: 381.5, engagementRate: 0.0036, liftMultiplier: -1.0 },
    { brand: "@gillettevenus", posts: 3, avgLikes: 181.67, avgComments: 23.33, emv: 377.5, engagementRate: 0.0762, liftMultiplier: -0.6 },
    { brand: "@specialteamsu", posts: 3, avgLikes: 244.33, avgComments: 2, emv: 375.5, engagementRate: 0.0899, liftMultiplier: -0.5 },
    { brand: "@undrdawg", posts: 1, avgLikes: 641, avgComments: 36, emv: 374.5, engagementRate: 0.0397, liftMultiplier: -0.8 },
    { brand: "@gainbridgelife", posts: 1, avgLikes: 734, avgComments: 3, emv: 371.5, engagementRate: 0.2871, liftMultiplier: 0.6 },
    { brand: "@CVSPharmacy", posts: 5, avgLikes: 139.4, avgComments: 2.6, emv: 368, engagementRate: 0.0298, liftMultiplier: -0.8 },
    { brand: "@goodfoodcro", posts: 1, avgLikes: 3, avgComments: 240, emv: 361.5, engagementRate: 0.002, liftMultiplier: -1.0 },
    { brand: "@riterugflooring", posts: 3, avgLikes: 233.67, avgComments: 0.33, emv: 352, engagementRate: 0.1975, liftMultiplier: 0.1 },
    { brand: "@fivedancewear", posts: 1, avgLikes: 643, avgComments: 20, emv: 351.5, engagementRate: 0.1015, liftMultiplier: -0.4 },
    { brand: "@newera", posts: 3, avgLikes: 155.67, avgComments: 23.33, emv: 338.5, engagementRate: 0.1325, liftMultiplier: -0.3 },
    { brand: "@sahilpatel.29", posts: 1, avgLikes: 624, avgComments: 15, emv: 334.5, engagementRate: 0.1466, liftMultiplier: -0.2 },
    { brand: "@ohiobeef", posts: 1, avgLikes: 615, avgComments: 14, emv: 328.5, engagementRate: 0.1478, liftMultiplier: -0.2 },
    { brand: "@carhartt", posts: 2, avgLikes: 290.5, avgComments: 11.5, emv: 325, engagementRate: 0.0222, liftMultiplier: -0.9 },
    { brand: "@liquidiv", posts: 1, avgLikes: 523, avgComments: 41, emv: 323, engagementRate: 0.3824, liftMultiplier: 1.1 },
    { brand: "@raisinbran_us", posts: 1, avgLikes: 559, avgComments: 28, emv: 321.5, engagementRate: 0.007, liftMultiplier: -1.0 },
    { brand: "@prolificsportslab", posts: 1, avgLikes: 622, avgComments: 6, emv: 320, engagementRate: 0.0605, liftMultiplier: -0.7 },
    { brand: "@1.domm", posts: 1, avgLikes: 597, avgComments: 10, emv: 313.5, engagementRate: 0.1431, liftMultiplier: -0.2 },
    { brand: "@nolteroofing", posts: 1, avgLikes: 626, avgComments: 0, emv: 313, engagementRate: 0.828, liftMultiplier: 3.5 },
    { brand: "@thebuckeyecorner", posts: 2, avgLikes: 274.5, avgComments: 12.5, emv: 312, engagementRate: 0.0086, liftMultiplier: -1.0 },
    { brand: "@england.golf", posts: 2, avgLikes: 235, avgComments: 24, emv: 307, engagementRate: 0.1464, liftMultiplier: -0.2 },
    { brand: "@dillonmagee", posts: 1, avgLikes: 507, avgComments: 32, emv: 301.5, engagementRate: 0.2082, liftMultiplier: 0.1 },
    { brand: "@rhoback", posts: 1, avgLikes: 591, avgComments: 3, emv: 300, engagementRate: 0.0018, liftMultiplier: -1.0 },
    { brand: "@honeymamas", posts: 2, avgLikes: 291, avgComments: 3, emv: 300, engagementRate: 0.0886, liftMultiplier: -0.5 },
    { brand: "@bckr.hq", posts: 2, avgLikes: 283, avgComments: 5.5, emv: 299.5, engagementRate: 0.0419, liftMultiplier: -0.8 },
    { brand: "@allinklusivesports", posts: 1, avgLikes: 557, avgComments: 14, emv: 299.5, engagementRate: 0.1323, liftMultiplier: -0.3 },
    { brand: "@rootsnk", posts: 6, avgLikes: 66.83, avgComments: 10.67, emv: 296.5, engagementRate: 0.028, liftMultiplier: -0.8 },
    { brand: "@brittanyshope", posts: 1, avgLikes: 464, avgComments: 36, emv: 286, engagementRate: 0.2431, liftMultiplier: 0.3 },
    { brand: "@puregreenhighstreet", posts: 1, avgLikes: 567, avgComments: 1, emv: 285, engagementRate: 0.3156, liftMultiplier: 0.7 },
    { brand: "@iherb", posts: 2, avgLikes: 253.5, avgComments: 10.5, emv: 285, engagementRate: 0.0304, liftMultiplier: -0.8 },
    { brand: "@ikoniik.co", posts: 1, avgLikes: 531, avgComments: 9, emv: 279, engagementRate: 0.5915, liftMultiplier: 2.2 },
    { brand: "@bankofamerica", posts: 1, avgLikes: 497, avgComments: 19, emv: 277, engagementRate: 0.2244, liftMultiplier: 0.2 },
    { brand: "@buckeyecountrysuperfest", posts: 2, avgLikes: 145, avgComments: 44, emv: 277, engagementRate: 0.0856, liftMultiplier: -0.5 },
    { brand: "@see.no.limits", posts: 2, avgLikes: 234, avgComments: 14, emv: 276, engagementRate: 0.0569, liftMultiplier: -0.7 },
    { brand: "@vervecolumbus", posts: 1, avgLikes: 540, avgComments: 2, emv: 273, engagementRate: 0.098, liftMultiplier: -0.5 },
    { brand: "@cvspharmacy", posts: 3, avgLikes: 149.33, avgComments: 9.33, emv: 266, engagementRate: 0.0562, liftMultiplier: -0.7 },
    { brand: "@statsports", posts: 2, avgLikes: 237.5, avgComments: 8.5, emv: 263, engagementRate: 0.0641, liftMultiplier: -0.6 },
    { brand: "@fireflyrecovery", posts: 2, avgLikes: 250.5, avgComments: 3, emv: 259.5, engagementRate: 0.2438, liftMultiplier: 0.3 },
    { brand: "@clevermade", posts: 1, avgLikes: 463, avgComments: 18, emv: 258.5, engagementRate: 0.1331, liftMultiplier: -0.3 },
    { brand: "@ohiostswimdive", posts: 1, avgLikes: 409, avgComments: 33, emv: 254, engagementRate: 0.3159, liftMultiplier: 0.7 },
    { brand: "@glocknerautomotive", posts: 1, avgLikes: 462, avgComments: 11, emv: 247.5, engagementRate: 0.2064, liftMultiplier: 0.1 },
    { brand: "@blue84licensed", posts: 2, avgLikes: 234.5, avgComments: 4, emv: 246.5, engagementRate: 0.0169, liftMultiplier: -0.9 },
    { brand: "@palshealth", posts: 1, avgLikes: 439, avgComments: 15, emv: 242, engagementRate: 0.0246, liftMultiplier: -0.9 },
    { brand: "@sunglasshut", posts: 1, avgLikes: 442, avgComments: 14, emv: 242, engagementRate: 0.0207, liftMultiplier: -0.9 },
    { brand: "@dsw", posts: 2, avgLikes: 179, avgComments: 20, emv: 239, engagementRate: 0.0466, liftMultiplier: -0.7 },
    { brand: "@lieuvic", posts: 1, avgLikes: 383, avgComments: 29, emv: 235, engagementRate: 0.101, liftMultiplier: -0.4 },
    { brand: "@east_coast_pro", posts: 1, avgLikes: 450, avgComments: 6, emv: 234, engagementRate: 0.0662, liftMultiplier: -0.6 },
    { brand: "@shopmascella", posts: 3, avgLikes: 109.33, avgComments: 14, emv: 227, engagementRate: 0.1379, liftMultiplier: -0.2 },
    { brand: "@kanefootwear", posts: 1, avgLikes: 391, avgComments: 20, emv: 225.5, engagementRate: 0.0943, liftMultiplier: -0.5 },
    { brand: "@citybarbecue", posts: 1, avgLikes: 444, avgComments: 2, emv: 225, engagementRate: 0.0446, liftMultiplier: -0.8 },
    { brand: "@drinkpurekick", posts: 2, avgLikes: 176, avgComments: 16, emv: 224, engagementRate: 0.0736, liftMultiplier: -0.6 },
    { brand: "@vertical_protein", posts: 1, avgLikes: 295, avgComments: 49, emv: 221, engagementRate: 0.1004, liftMultiplier: -0.5 },
    { brand: "@comfrt", posts: 1, avgLikes: 395, avgComments: 14, emv: 218.5, engagementRate: 0.0626, liftMultiplier: -0.7 },
    { brand: "@laorganicsco", posts: 1, avgLikes: 362, avgComments: 23, emv: 215.5, engagementRate: 0.0529, liftMultiplier: -0.7 },
    { brand: "@dwccollection", posts: 1, avgLikes: 330, avgComments: 32, emv: 213, engagementRate: 0.0498, liftMultiplier: -0.7 },
    { brand: "@jesselee_pakele", posts: 1, avgLikes: 361, avgComments: 21, emv: 212, engagementRate: 0.1086, liftMultiplier: -0.4 },
    { brand: "@powerade_us", posts: 1, avgLikes: 3, avgComments: 137, emv: 207, engagementRate: 0.0765, liftMultiplier: -0.6 },
    { brand: "@big_tasty_hawk", posts: 1, avgLikes: 407, avgComments: 2, emv: 206.5, engagementRate: 0.0258, liftMultiplier: -0.9 },
    { brand: "@onnit", posts: 2, avgLikes: 176, avgComments: 9.5, emv: 204.5, engagementRate: 0.1001, liftMultiplier: -0.5 },
    { brand: "@gooseitcompany", posts: 1, avgLikes: 403, avgComments: 0, emv: 201.5, engagementRate: 0.1344, liftMultiplier: -0.3 },
    { brand: "@xx_xyathletics", posts: 1, avgLikes: 387, avgComments: 5, emv: 201, engagementRate: 0.1829, liftMultiplier: -0.0 },
    { brand: "@trendmicro", posts: 2, avgLikes: 157.5, avgComments: 11.5, emv: 192, engagementRate: 0.2456, liftMultiplier: 0.3 },
    { brand: "@prodigydanceconvention", posts: 1, avgLikes: 344, avgComments: 10, emv: 187, engagementRate: 0.0276, liftMultiplier: -0.8 },
    { brand: "@dietcoke", posts: 1, avgLikes: 0, avgComments: 123, emv: 184.5, engagementRate: 0.0457, liftMultiplier: -0.8 },
    { brand: "@aquahawgs", posts: 1, avgLikes: 252, avgComments: 39, emv: 184.5, engagementRate: 0.3579, liftMultiplier: 1.0 },
    { brand: "@ohiopoultry", posts: 1, avgLikes: 359, avgComments: 3, emv: 184, engagementRate: 0.039, liftMultiplier: -0.8 },
    { brand: "@nil.store___", posts: 2, avgLikes: 170.5, avgComments: 4, emv: 182.5, engagementRate: 0.0125, liftMultiplier: -0.9 },
    { brand: "@SpartanCombat", posts: 1, avgLikes: 341, avgComments: 6, emv: 179.5, engagementRate: 0.0337, liftMultiplier: -0.8 },
    { brand: "@ritfit.sports", posts: 1, avgLikes: 328, avgComments: 8, emv: 176, engagementRate: 0.1172, liftMultiplier: -0.4 },
    { brand: "@fanoutfitters", posts: 1, avgLikes: 328, avgComments: 7, emv: 174.5, engagementRate: 0.0181, liftMultiplier: -0.9 },
    { brand: "@newbalance", posts: 1, avgLikes: 336, avgComments: 3, emv: 172.5, engagementRate: 0.2596, liftMultiplier: 0.4 },
    { brand: "@tyr", posts: 1, avgLikes: 323, avgComments: 7, emv: 172, engagementRate: 0.1151, liftMultiplier: -0.4 },
    { brand: "@thefishbacks", posts: 3, avgLikes: 108.33, avgComments: 2, emv: 171.5, engagementRate: 0.0082, liftMultiplier: -1.0 },
    { brand: "@bwwings", posts: 1, avgLikes: 308, avgComments: 11, emv: 170.5, engagementRate: 0.1412, liftMultiplier: -0.2 },
    { brand: "@RITZPartner", posts: 1, avgLikes: 313, avgComments: 7, emv: 167, engagementRate: 0.001, liftMultiplier: -1.0 },
    { brand: "@rmhcofcentraloh", posts: 1, avgLikes: 305, avgComments: 9, emv: 166, engagementRate: 0.0143, liftMultiplier: -0.9 },
    { brand: "@drinkunwell", posts: 1, avgLikes: 289, avgComments: 14, emv: 165.5, engagementRate: 0.0408, liftMultiplier: -0.8 },
    { brand: "@turtleboxaudio", posts: 1, avgLikes: 330, avgComments: 0, emv: 165, engagementRate: 0.2897, liftMultiplier: 0.6 },
    { brand: "@vuoriclothing", posts: 2, avgLikes: 80.5, avgComments: 28, emv: 164.5, engagementRate: 0.0807, liftMultiplier: -0.6 },
    { brand: "@tyrsport", posts: 1, avgLikes: 301, avgComments: 9, emv: 164, engagementRate: 0.1081, liftMultiplier: -0.4 },
    { brand: "@joandjaxteamwear", posts: 1, avgLikes: 270, avgComments: 18, emv: 162, engagementRate: 0.0618, liftMultiplier: -0.7 },
    { brand: "@thespiritgolf", posts: 1, avgLikes: 257, avgComments: 22, emv: 161.5, engagementRate: 0.1577, liftMultiplier: -0.1 },
    { brand: "@crocs", posts: 4, avgLikes: 1.5, avgComments: 26, emv: 159, engagementRate: 0.0002, liftMultiplier: -1.0 },
    { brand: "@DrPepper", posts: 2, avgLikes: 0, avgComments: 53, emv: 159, engagementRate: 0.0003, liftMultiplier: -1.0 },
    { brand: "@porkrindsdotcom", posts: 1, avgLikes: 265, avgComments: 17, emv: 158, engagementRate: 0.0165, liftMultiplier: -0.9 },
    { brand: "@nakashima_bryce", posts: 1, avgLikes: 258, avgComments: 17, emv: 154.5, engagementRate: 0.1651, liftMultiplier: -0.1 },
    { brand: "@vktry", posts: 1, avgLikes: 271, avgComments: 12, emv: 153.5, engagementRate: 0.0649, liftMultiplier: -0.6 },
    { brand: "@suncruisers", posts: 1, avgLikes: 254, avgComments: 16, emv: 151, engagementRate: 0.1788, liftMultiplier: -0.0 },
    { brand: "@therandagolf", posts: 1, avgLikes: 241, avgComments: 19, emv: 149, engagementRate: 0.147, liftMultiplier: -0.2 },
    { brand: "@drkwtr", posts: 1, avgLikes: 250, avgComments: 12, emv: 143, engagementRate: 0.3316, liftMultiplier: 0.8 },
    { brand: "@rubiolongsnapping", posts: 3, avgLikes: 89, avgComments: 2, emv: 142.5, engagementRate: 0.102, liftMultiplier: -0.4 },
    { brand: "@truff", posts: 1, avgLikes: 262, avgComments: 6, emv: 140, engagementRate: 0.0065, liftMultiplier: -1.0 },
    { brand: "@heatedcolumbus", posts: 1, avgLikes: 255, avgComments: 7, emv: 138, engagementRate: 0.0628, liftMultiplier: -0.7 },
    { brand: "@titleist_anz", posts: 1, avgLikes: 226, avgComments: 15, emv: 135.5, engagementRate: 0.1992, liftMultiplier: 0.1 },
    { brand: "@snapsclothingco", posts: 1, avgLikes: 257, avgComments: 3, emv: 133, engagementRate: 0.0614, liftMultiplier: -0.7 },
    { brand: "@murryave", posts: 5, avgLikes: 34.2, avgComments: 6.2, emv: 132, engagementRate: 0.0123, liftMultiplier: -0.9 },
    { brand: "@BrooksRunning", posts: 1, avgLikes: 152, avgComments: 30, emv: 121, engagementRate: 0.0099, liftMultiplier: -0.9 },
    { brand: "@tlfapparel", posts: 3, avgLikes: 43.33, avgComments: 12, emv: 119, engagementRate: 0.0098, liftMultiplier: -0.9 },
    { brand: "@drink_phx", posts: 2, avgLikes: 90, avgComments: 9.5, emv: 118.5, engagementRate: 0.0191, liftMultiplier: -0.9 },
    { brand: "@thetrackatnewbalance", posts: 1, avgLikes: 228, avgComments: 3, emv: 118.5, engagementRate: 0.1769, liftMultiplier: -0.0 },
    { brand: "@greenhornfishing", posts: 1, avgLikes: 183, avgComments: 18, emv: 118.5, engagementRate: 0.1218, liftMultiplier: -0.3 },
    { brand: "@nilstore", posts: 1, avgLikes: 212, avgComments: 6, emv: 115, engagementRate: 0.066, liftMultiplier: -0.6 },
    { brand: "@bonvillegolfresort", posts: 1, avgLikes: 197, avgComments: 10, emv: 113.5, engagementRate: 0.1711, liftMultiplier: -0.1 },
    { brand: "@yourstruly_rochele", posts: 1, avgLikes: 3, avgComments: 73, emv: 111, engagementRate: 0.0426, liftMultiplier: -0.8 },
    { brand: "@theyeethree", posts: 1, avgLikes: 219, avgComments: 0, emv: 109.5, engagementRate: 0.1524, liftMultiplier: -0.2 },
    { brand: "@thefeed", posts: 1, avgLikes: 206, avgComments: 4, emv: 109, engagementRate: 0.1628, liftMultiplier: -0.1 },
    { brand: "@nfmlendingohio", posts: 2, avgLikes: 70, avgComments: 13, emv: 109, engagementRate: 0.0445, liftMultiplier: -0.8 },
    { brand: "@redbull", posts: 1, avgLikes: 121, avgComments: 32, emv: 108.5, engagementRate: 0.0733, liftMultiplier: -0.6 },
    { brand: "@cat.speed.style", posts: 1, avgLikes: 208, avgComments: 3, emv: 108.5, engagementRate: 0.0574, liftMultiplier: -0.7 },
    { brand: "@theohiostateuniversity", posts: 1, avgLikes: 212, avgComments: 1, emv: 107.5, engagementRate: 0.1507, liftMultiplier: -0.2 },
    { brand: "@prestigestorageus", posts: 1, avgLikes: 197, avgComments: 6, emv: 107.5, engagementRate: 0.0024, liftMultiplier: -1.0 },
    { brand: "@fclbestinclass", posts: 3, avgLikes: 69.33, avgComments: 0.67, emv: 107, engagementRate: 0.3608, liftMultiplier: 1.0 },
    { brand: "@costco", posts: 1, avgLikes: 201, avgComments: 4, emv: 106.5, engagementRate: 0.0534, liftMultiplier: -0.7 },
    { brand: "@sealy", posts: 1, avgLikes: 187, avgComments: 8, emv: 105.5, engagementRate: 0.0066, liftMultiplier: -1.0 },
    { brand: "@reathlete", posts: 1, avgLikes: 186, avgComments: 5, emv: 100.5, engagementRate: 0.0205, liftMultiplier: -0.9 },
    { brand: "@maaxgum", posts: 1, avgLikes: 136, avgComments: 21, emv: 99.5, engagementRate: 0.0563, liftMultiplier: -0.7 },
    { brand: "@justhoopscbus", posts: 1, avgLikes: 192, avgComments: 2, emv: 99, engagementRate: 0.0023, liftMultiplier: -1.0 },
    { brand: "@jcpenney", posts: 1, avgLikes: 184, avgComments: 4, emv: 98, engagementRate: 0.2994, liftMultiplier: 0.6 },
    { brand: "@golfnow", posts: 1, avgLikes: 179, avgComments: 5, emv: 97, engagementRate: 0.0495, liftMultiplier: -0.7 },
    { brand: "@athletesthread", posts: 2, avgLikes: 93, avgComments: 0.5, emv: 94.5, engagementRate: 0.073, liftMultiplier: -0.6 },
    { brand: "@TravisMathew", posts: 1, avgLikes: 126, avgComments: 21, emv: 94.5, engagementRate: 0.0891, liftMultiplier: -0.5 },
    { brand: "@fanatic_wrestling", posts: 1, avgLikes: 171, avgComments: 6, emv: 94.5, engagementRate: 0.0323, liftMultiplier: -0.8 },
    { brand: "@BUBBLR", posts: 1, avgLikes: 177, avgComments: 3, emv: 93, engagementRate: 0.0952, liftMultiplier: -0.5 },
    { brand: "@pitchcom.softball", posts: 1, avgLikes: 182, avgComments: 1, emv: 92.5, engagementRate: 0.0505, liftMultiplier: -0.7 },
    { brand: "@connyct_university", posts: 1, avgLikes: 171, avgComments: 4, emv: 91.5, engagementRate: 0.0419, liftMultiplier: -0.8 },
    { brand: "@laoororganics", posts: 1, avgLikes: 119, avgComments: 21, emv: 91, engagementRate: 0.0192, liftMultiplier: -0.9 },
    { brand: "@wearstand", posts: 1, avgLikes: 136, avgComments: 15, emv: 90.5, engagementRate: 0.0982, liftMultiplier: -0.5 },
    { brand: "@thenoblemethod", posts: 5, avgLikes: 15, avgComments: 7, emv: 90, engagementRate: 0.0058, liftMultiplier: -1.0 },
    { brand: "@nocco.usa", posts: 1, avgLikes: 153, avgComments: 9, emv: 90, engagementRate: 0.0589, liftMultiplier: -0.7 },
    { brand: "@bonitabrooklynn", posts: 1, avgLikes: 179, avgComments: 0, emv: 89.5, engagementRate: 0.0174, liftMultiplier: -0.9 },
    { brand: "@g2a_com", posts: 1, avgLikes: 178, avgComments: 0, emv: 89, engagementRate: 0.0182, liftMultiplier: -0.9 },
    { brand: "@gorjana", posts: 1, avgLikes: 167, avgComments: 3, emv: 88, engagementRate: 0.0357, liftMultiplier: -0.8 },
    { brand: "@playabowls", posts: 1, avgLikes: 154, avgComments: 7, emv: 87.5, engagementRate: 0.1322, liftMultiplier: -0.3 },
    { brand: "@usahockey", posts: 1, avgLikes: 0, avgComments: 57, emv: 85.5, engagementRate: 0.0141, liftMultiplier: -0.9 },
    { brand: "@goodyear", posts: 1, avgLikes: 155, avgComments: 5, emv: 85, engagementRate: 0.0087, liftMultiplier: -1.0 },
    { brand: "@goodmolecules", posts: 1, avgLikes: 3, avgComments: 54, emv: 82.5, engagementRate: 0.0478, liftMultiplier: -0.7 },
    { brand: "@mcdonalds", posts: 1, avgLikes: 3, avgComments: 54, emv: 82.5, engagementRate: 0.0116, liftMultiplier: -0.9 },
    { brand: "@voacountrymusicfest", posts: 1, avgLikes: 131, avgComments: 10, emv: 80.5, engagementRate: 0.2245, liftMultiplier: 0.2 },
    { brand: "@theoonlane", posts: 1, avgLikes: 149, avgComments: 4, emv: 80.5, engagementRate: 0.1256, liftMultiplier: -0.3 },
    { brand: "@cy_showcase_camp", posts: 1, avgLikes: 148, avgComments: 4, emv: 80, engagementRate: 0.0108, liftMultiplier: -0.9 },
    { brand: "@maybelline", posts: 1, avgLikes: 147, avgComments: 4, emv: 79.5, engagementRate: 0.0208, liftMultiplier: -0.9 },
    { brand: "@greeniesportscards", posts: 2, avgLikes: 76.5, avgComments: 0, emv: 76.5, engagementRate: 0.0712, liftMultiplier: -0.6 },
    { brand: "@abbottglobal", posts: 2, avgLikes: 0, avgComments: 25, emv: 75, engagementRate: 0.0116, liftMultiplier: -0.9 },
    { brand: "@bambooboutiqueedinburgh", posts: 2, avgLikes: 50.5, avgComments: 8, emv: 74.5, engagementRate: 0.7905, liftMultiplier: 3.3 },
    { brand: "@wdybeignets", posts: 1, avgLikes: 124, avgComments: 6, emv: 71, engagementRate: 0.0067, liftMultiplier: -1.0 },
    { brand: "@checkersrallys", posts: 1, avgLikes: 126, avgComments: 5, emv: 70.5, engagementRate: 0.0093, liftMultiplier: -0.9 },
    { brand: "@topdrawersoccer", posts: 2, avgLikes: 0, avgComments: 23.5, emv: 70.5, engagementRate: 0.0129, liftMultiplier: -0.9 },
    { brand: "@lootedapparel_", posts: 1, avgLikes: 109, avgComments: 10, emv: 69.5, engagementRate: 0.0318, liftMultiplier: -0.8 },
    { brand: "@lemonperfect", posts: 1, avgLikes: 114, avgComments: 7, emv: 67.5, engagementRate: 0.0055, liftMultiplier: -1.0 },
    { brand: "@venmo", posts: 1, avgLikes: 125, avgComments: 3, emv: 67, engagementRate: 0.0005, liftMultiplier: -1.0 },
    { brand: "@ecofit_h2o", posts: 1, avgLikes: 118, avgComments: 5, emv: 66.5, engagementRate: 0.0483, liftMultiplier: -0.7 },
    { brand: "@representthecode", posts: 1, avgLikes: 131, avgComments: 0, emv: 65.5, engagementRate: 0.159, liftMultiplier: -0.1 },
    { brand: "@themarcpro", posts: 1, avgLikes: 119, avgComments: 3, emv: 64, engagementRate: 0.0564, liftMultiplier: -0.7 },
    { brand: "@chansmall.le", posts: 1, avgLikes: 78, avgComments: 16, emv: 63, engagementRate: 0.0194, liftMultiplier: -0.9 },
    { brand: "@flexworkmgt", posts: 1, avgLikes: 0, avgComments: 41, emv: 61.5, engagementRate: 0.0002, liftMultiplier: -1.0 },
    { brand: "@pamurfreesboro", posts: 1, avgLikes: 94, avgComments: 9, emv: 60.5, engagementRate: 0.0594, liftMultiplier: -0.7 },
    { brand: "@toro_tour_golf_", posts: 1, avgLikes: 104, avgComments: 5, emv: 59.5, engagementRate: 0.1288, liftMultiplier: -0.3 },
    { brand: "@4thandgoal", posts: 1, avgLikes: 112, avgComments: 2, emv: 59, engagementRate: 0.0551, liftMultiplier: -0.7 },
    { brand: "@nush", posts: 1, avgLikes: 105, avgComments: 0, emv: 52.5, engagementRate: 0.1672, liftMultiplier: -0.1 },
    { brand: "@drinkbiolyte", posts: 1, avgLikes: 84, avgComments: 4, emv: 48, engagementRate: 0.032, liftMultiplier: -0.8 },
    { brand: "@thecampintensive", posts: 1, avgLikes: 0, avgComments: 30, emv: 45, engagementRate: 0.0058, liftMultiplier: -1.0 },
    { brand: "@blitz_athletics_ohio", posts: 1, avgLikes: 74, avgComments: 5, emv: 44.5, engagementRate: 0.2948, liftMultiplier: 0.6 },
    { brand: "@buckeyespectrum", posts: 1, avgLikes: 63, avgComments: 8, emv: 43.5, engagementRate: 0.0361, liftMultiplier: -0.8 },
    { brand: "@onlyfreshdesigns", posts: 2, avgLikes: 43.5, avgComments: 0, emv: 43.5, engagementRate: 0.0215, liftMultiplier: -0.9 },
    { brand: "@southwest.ua.allamerica", posts: 1, avgLikes: 67, avgComments: 6, emv: 42.5, engagementRate: 0.3763, liftMultiplier: 1.1 },
    { brand: "@flexprogrip", posts: 1, avgLikes: 83, avgComments: 0, emv: 41.5, engagementRate: 0.08, liftMultiplier: -0.6 },
    { brand: "@donatos", posts: 1, avgLikes: 0, avgComments: 27, emv: 40.5, engagementRate: 0.0145, liftMultiplier: -0.9 },
    { brand: "@homagepartner", posts: 1, avgLikes: 0, avgComments: 27, emv: 40.5, engagementRate: 0.0088, liftMultiplier: -1.0 },
    { brand: "@TFLapparel", posts: 1, avgLikes: 0, avgComments: 24, emv: 36, engagementRate: 0.0087, liftMultiplier: -1.0 },
    { brand: "@b1gvolleyball", posts: 1, avgLikes: 3, avgComments: 23, emv: 36, engagementRate: 0.0065, liftMultiplier: -1.0 },
    { brand: "@charlieswims32vsc", posts: 1, avgLikes: 66, avgComments: 2, emv: 36, engagementRate: 0.0237, liftMultiplier: -0.9 },
    { brand: "@delly_media", posts: 1, avgLikes: 0, avgComments: 24, emv: 36, engagementRate: 0.0218, liftMultiplier: -0.9 },
    { brand: "@yesly", posts: 1, avgLikes: 51, avgComments: 7, emv: 36, engagementRate: 0.0916, liftMultiplier: -0.5 },
    { brand: "@getjams", posts: 1, avgLikes: 68, avgComments: 1, emv: 35.5, engagementRate: 0.0188, liftMultiplier: -0.9 },
    { brand: "@the.bronzing.bar", posts: 1, avgLikes: 53, avgComments: 5, emv: 34, engagementRate: 0.0158, liftMultiplier: -0.9 },
    { brand: "@tecovas", posts: 1, avgLikes: 66, avgComments: 0, emv: 33, engagementRate: 0.0049, liftMultiplier: -1.0 },
    { brand: "@brandedbills", posts: 3, avgLikes: 0, avgComments: 7, emv: 31.5, engagementRate: 0.0004, liftMultiplier: -1.0 },
    { brand: "@gravitycolumbus", posts: 1, avgLikes: 0, avgComments: 21, emv: 31.5, engagementRate: 0.0006, liftMultiplier: -1.0 },
    { brand: "@underarmour150", posts: 1, avgLikes: 54, avgComments: 3, emv: 31.5, engagementRate: 0.2938, liftMultiplier: 0.6 },
    { brand: "@pockyusa", posts: 1, avgLikes: 48, avgComments: 4, emv: 30, engagementRate: 0.0189, liftMultiplier: -0.9 },
    { brand: "@lilbaby", posts: 1, avgLikes: 3, avgComments: 19, emv: 30, engagementRate: 0.0065, liftMultiplier: -1.0 },
    { brand: "@wingman_dolla", posts: 1, avgLikes: 47, avgComments: 4, emv: 29.5, engagementRate: 0.012, liftMultiplier: -0.9 },
    { brand: "@gopuff", posts: 1, avgLikes: 45, avgComments: 4, emv: 28.5, engagementRate: 0.0223, liftMultiplier: -0.9 },
    { brand: "@onlyatarchetype", posts: 1, avgLikes: 0, avgComments: 18, emv: 27, engagementRate: 0.0011, liftMultiplier: -1.0 },
    { brand: "@brenzpizzaco", posts: 2, avgLikes: 0, avgComments: 8, emv: 24, engagementRate: 0.0011, liftMultiplier: -1.0 },
    { brand: "@hairofparadise7", posts: 1, avgLikes: 0, avgComments: 16, emv: 24, engagementRate: 0.0033, liftMultiplier: -1.0 },
    { brand: "@ohiostatemgolf", posts: 1, avgLikes: 0, avgComments: 16, emv: 24, engagementRate: 0.0137, liftMultiplier: -0.9 },
    { brand: "@bigfigmattress", posts: 1, avgLikes: 0, avgComments: 16, emv: 24, engagementRate: 0.0004, liftMultiplier: -1.0 },
    { brand: "@studiolhoboken", posts: 1, avgLikes: 0, avgComments: 16, emv: 24, engagementRate: 0.0034, liftMultiplier: -1.0 },
    { brand: "@kwikgoal", posts: 1, avgLikes: 0, avgComments: 15, emv: 22.5, engagementRate: 0.003, liftMultiplier: -1.0 },
    { brand: "@breakaway", posts: 1, avgLikes: 3, avgComments: 13, emv: 21, engagementRate: 0.0022, liftMultiplier: -1.0 },
    { brand: "@stickermule", posts: 1, avgLikes: 3, avgComments: 12, emv: 19.5, engagementRate: 0.0005, liftMultiplier: -1.0 },
    { brand: "@AmericanEagle", posts: 3, avgLikes: 0, avgComments: 4, emv: 18, engagementRate: 0.0005, liftMultiplier: -1.0 },
    { brand: "@wearethewildco", posts: 1, avgLikes: 0, avgComments: 12, emv: 18, engagementRate: 0.0017, liftMultiplier: -1.0 },
    { brand: "@livingtestimony_athletix", posts: 1, avgLikes: 0, avgComments: 12, emv: 18, engagementRate: 0.0012, liftMultiplier: -1.0 },
    { brand: "@orcabluellc.rdu", posts: 1, avgLikes: 0, avgComments: 11, emv: 16.5, engagementRate: 0.0035, liftMultiplier: -1.0 },
    { brand: "@ovrjump", posts: 1, avgLikes: 0, avgComments: 10, emv: 15, engagementRate: 0.0046, liftMultiplier: -1.0 },
    { brand: "@LGUSA", posts: 1, avgLikes: 0, avgComments: 10, emv: 15, engagementRate: 0.0046, liftMultiplier: -1.0 },
    { brand: "@dollarshaveclub", posts: 1, avgLikes: 0, avgComments: 10, emv: 15, engagementRate: 0.0001, liftMultiplier: -1.0 },
    { brand: "@armanibeauty", posts: 1, avgLikes: 0, avgComments: 10, emv: 15, engagementRate: 0.0001, liftMultiplier: -1.0 },
    { brand: "@caahockey", posts: 1, avgLikes: 0, avgComments: 9, emv: 13.5, engagementRate: 0.0042, liftMultiplier: -1.0 },
    { brand: "@livvydunne", posts: 1, avgLikes: 0, avgComments: 9, emv: 13.5, engagementRate: 0.0027, liftMultiplier: -1.0 },
    { brand: "@drinkdripdrop", posts: 1, avgLikes: 3, avgComments: 7, emv: 12, engagementRate: 0.0014, liftMultiplier: -1.0 },
    { brand: "@vitacoco", posts: 1, avgLikes: 3, avgComments: 7, emv: 12, engagementRate: 0.0027, liftMultiplier: -1.0 },
    { brand: "@mondayhaircare", posts: 1, avgLikes: 3, avgComments: 6, emv: 10.5, engagementRate: 0.0048, liftMultiplier: -1.0 },
    { brand: "@forbes", posts: 1, avgLikes: 0, avgComments: 7, emv: 10.5, engagementRate: 0.0009, liftMultiplier: -1.0 },
    { brand: "@holstrength", posts: 1, avgLikes: 0, avgComments: 7, emv: 10.5, engagementRate: 0.006, liftMultiplier: -1.0 },
    { brand: "@gabbydoesmytattts", posts: 1, avgLikes: 3, avgComments: 5, emv: 9, engagementRate: 0.0028, liftMultiplier: -1.0 },
    { brand: "@bambooboutique", posts: 1, avgLikes: 16, avgComments: 0, emv: 8, engagementRate: 0.2162, liftMultiplier: 0.2 },
    { brand: "@CVS", posts: 1, avgLikes: 3, avgComments: 4, emv: 7.5, engagementRate: 0.0026, liftMultiplier: -1.0 },
    { brand: "@bibibopasiangrill", posts: 1, avgLikes: 0, avgComments: 5, emv: 7.5, engagementRate: 0.0012, liftMultiplier: -1.0 },
    { brand: "@nilacesma", posts: 1, avgLikes: 0, avgComments: 5, emv: 7.5, engagementRate: 0.0004, liftMultiplier: -1.0 },
    { brand: "@railbird", posts: 1, avgLikes: 0, avgComments: 4, emv: 6, engagementRate: 0.001, liftMultiplier: -1.0 },
    { brand: "@prozis", posts: 3, avgLikes: 0, avgComments: 1, emv: 4.5, engagementRate: 0.0004, liftMultiplier: -1.0 },
    { brand: "@trysuji", posts: 1, avgLikes: 0, avgComments: 3, emv: 4.5, engagementRate: 0.0014, liftMultiplier: -1.0 },
    { brand: "@proactiv", posts: 1, avgLikes: 0, avgComments: 3, emv: 4.5, engagementRate: 0.0014, liftMultiplier: -1.0 },
    { brand: "@evolvedbodyart", posts: 1, avgLikes: 0, avgComments: 2, emv: 3, engagementRate: 0.0007, liftMultiplier: -1.0 },
    { brand: "@carharttxlids", posts: 1, avgLikes: 0, avgComments: 2, emv: 3, engagementRate: 0.0001, liftMultiplier: -1.0 },
    { brand: "@sunriseshack", posts: 1, avgLikes: 0, avgComments: 2, emv: 3, engagementRate: 0.0014, liftMultiplier: -1.0 },
    { brand: "@drinkpoppi", posts: 1, avgLikes: 0, avgComments: 0, emv: 0, engagementRate: 0, liftMultiplier: -1.0 },
    { brand: "@mizzouthreads", posts: 1, avgLikes: 0, avgComments: 0, emv: 0, engagementRate: 0, liftMultiplier: -1.0 },
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
  { name: 'Maryland', conf: 'Big 10', posts: 2392, adoption: 50.4, logo: 47.3, mention: 16.4, collab: 2.8, followers: 0 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.1, logo: 50.0, mention: 0.0, collab: 0.1, followers: 2381406 },
  { name: 'Ohio State', conf: 'Big 10', posts: 9629, adoption: 48.4, logo: 44.2, mention: 20.1, collab: 1.2, followers: 5546349 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2867, adoption: 45.3, logo: 40.1, mention: 15.6, collab: 3.9, followers: 0 },
  { name: 'Indiana', conf: 'Big 10', posts: 2218, adoption: 43.4, logo: 41.6, mention: 1.4, collab: 1.4, followers: 0 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logo: 39.7, mention: 16.8, collab: 2.1, followers: 4114531 },
  { name: 'Purdue', conf: 'Big 10', posts: 5286, adoption: 36.5, logo: 34.1, mention: 12.8, collab: 3.4, followers: 1299880 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 36.0, logo: 36.0, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logo: 33.4, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Washington', conf: 'Big 10', posts: 2378, adoption: 27.7, logo: 25.7, mention: 0.0, collab: 4.2, followers: 0 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.2, logo: 11.5, mention: 0.0, collab: 5.4, followers: 882398 },
  { name: 'Illinois', conf: 'Big 10', posts: 2731, adoption: 13.7, logo: 12.6, mention: 0.0, collab: 1.9, followers: 0 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5982, adoption: 12.0, logo: 11.0, mention: 0.2, collab: 1.3, followers: 1812655 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 11.6, logo: 8.7, mention: 0.3, collab: 3.4, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 11.0, logo: 8.6, mention: 0.2, collab: 2.8, followers: 4376029 },
  { name: 'Oregon', conf: 'Big 10', posts: 2073, adoption: 46.2, logo: 45.1, mention: 0.1, collab: 2.9, followers: 0 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1577, adoption: 60.1, logo: 57.8, mention: 14.5, collab: 1.3, followers: 406916 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 55.6, logo: 53.3, mention: 21.7, collab: 4.6, followers: 0 },
  { name: 'Kentucky', conf: 'SEC', posts: 2900, adoption: 53.4, logo: 47.0, mention: 13.7, collab: 6.7, followers: 1671393 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 53.0, logo: 52.4, mention: 0.0, collab: 1.2, followers: 0 },
  { name: 'Texas A&M', conf: 'SEC', posts: 4316, adoption: 51.4, logo: 46.8, mention: 19.8, collab: 3.2, followers: 1878601 },
  { name: 'Virginia Tech', conf: 'ACC', posts: 3978, adoption: 51.3, logo: 48.4, mention: 15.2, collab: 0.1, followers: 1872167 },
  { name: 'Nebraska', conf: 'Big 10', posts: 4026, adoption: 50.8, logo: 47.5, mention: 15.4, collab: 2.9, followers: 3126161 },
  { name: 'Washington State', conf: 'Pac-12', posts: 948, adoption: 50.4, logo: 46.1, mention: 19.4, collab: 4.7, followers: 186487 },
  { name: 'Maryland', conf: 'Big 10', posts: 2392, adoption: 50.4, logo: 47.3, mention: 16.4, collab: 2.8, followers: 0 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.1, logo: 50.0, mention: 0.0, collab: 0.1, followers: 2381406 },
  { name: 'Miami', conf: 'ACC', posts: 2083, adoption: 49.4, logo: 44.7, mention: 1.5, collab: 7.0, followers: 0 },
  { name: 'Notre Dame', conf: 'ACC', posts: 2786, adoption: 48.9, logo: 46.8, mention: 18.9, collab: 0.1, followers: 1578114 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.7, logo: 47.3, mention: 0.0, collab: 4.0, followers: 0 },
  { name: 'Ohio State', conf: 'Big 10', posts: 9629, adoption: 48.4, logo: 44.2, mention: 20.1, collab: 1.2, followers: 5546349 },
  { name: 'Auburn', conf: 'SEC', posts: 6405, adoption: 48.1, logo: 40.0, mention: 21.7, collab: 8.9, followers: 2323541 },
  { name: 'Oregon', conf: 'Pac-12', posts: 2073, adoption: 46.2, logo: 45.1, mention: 0.1, collab: 2.9, followers: 0 },
  { name: 'LSU', conf: 'SEC', posts: 5454, adoption: 46.1, logo: 40.7, mention: 14.7, collab: 3.3, followers: 5170563 },
  { name: 'UTSA', conf: 'AAC', posts: 3773, adoption: 46.0, logo: 39.7, mention: 16.9, collab: 10.8, followers: 835260 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2813, adoption: 45.6, logo: 45.6, mention: 0.0, collab: 0.0, followers: 1703577 },
  { name: 'NC State', conf: 'ACC', posts: 2565, adoption: 45.6, logo: 44.7, mention: 0.0, collab: 3.1, followers: 1238519 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2867, adoption: 45.3, logo: 40.1, mention: 15.6, collab: 3.9, followers: 0 },
  { name: 'Baylor', conf: 'Big 12', posts: 7298, adoption: 45.1, logo: 41.0, mention: 21.4, collab: 4.5, followers: 2110678 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 44.8, logo: 40.9, mention: 17.9, collab: 2.6, followers: 0 },
  { name: 'UCF', conf: 'Big 12', posts: 2409, adoption: 44.3, logo: 40.5, mention: 8.0, collab: 7.1, followers: 1202431 },
  { name: 'New Mexico State', conf: 'C-USA', posts: 981, adoption: 44.1, logo: 44.0, mention: 0.0, collab: 0.7, followers: 0 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4968, adoption: 43.7, logo: 39.6, mention: 16.2, collab: 1.1, followers: 1043067 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logo: 39.7, mention: 16.8, collab: 2.1, followers: 4114531 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.5, logo: 43.1, mention: 0.0, collab: 1.3, followers: 0 },
  { name: 'Indiana', conf: 'Big 10', posts: 2218, adoption: 43.4, logo: 41.6, mention: 1.4, collab: 1.4, followers: 0 },
  { name: 'Arizona', conf: 'Big 12', posts: 4371, adoption: 43.1, logo: 41.1, mention: 9.6, collab: 1.7, followers: 3260269 },
  { name: 'Missouri', conf: 'SEC', posts: 5726, adoption: 42.3, logo: 38.1, mention: 20.5, collab: 2.0, followers: 1271953 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.7, logo: 41.7, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logo: 41.5, mention: 0.0, collab: 0.5, followers: 0 },
  { name: 'Rice', conf: 'AAC', posts: 632, adoption: 41.1, logo: 40.0, mention: 0.0, collab: 5.9, followers: 0 },
  { name: 'Alabama', conf: 'SEC', posts: 5742, adoption: 40.4, logo: 37.5, mention: 16.9, collab: 2.6, followers: 3966222 },
  { name: 'Georgia Tech', conf: 'ACC', posts: 2066, adoption: 40.4, logo: 38.9, mention: 0.0, collab: 5.6, followers: 0 },
  { name: 'Florida State', conf: 'ACC', posts: 2130, adoption: 40.1, logo: 40.1, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Virginia', conf: 'ACC', posts: 6496, adoption: 40.0, logo: 37.1, mention: 16.5, collab: 1.4, followers: 2044598 },
  { name: 'Boston College', conf: 'ACC', posts: 1539, adoption: 40.0, logo: 38.6, mention: 0.0, collab: 6.1, followers: 0 },
  { name: 'Arkansas', conf: 'SEC', posts: 5711, adoption: 36.6, logo: 34.2, mention: 10.6, collab: 0.9, followers: 2827038 },
  { name: 'DePaul', conf: 'Big East', posts: 746, adoption: 36.5, logo: 35.7, mention: 0.0, collab: 3.1, followers: 121473 },
  { name: 'Purdue', conf: 'Big 10', posts: 5286, adoption: 36.5, logo: 34.1, mention: 12.8, collab: 3.4, followers: 1299880 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 36.0, logo: 36.0, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Arizona State', conf: 'Big 12', posts: 7777, adoption: 34.4, logo: 32.0, mention: 9.9, collab: 3.4, followers: 2269788 },
  { name: 'Mississippi', conf: 'SEC', posts: 2239, adoption: 34.4, logo: 34.4, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'BYU', conf: 'Big 12', posts: 7519, adoption: 34.3, logo: 31.6, mention: 10.1, collab: 2.3, followers: 0 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 33.8, logo: 32.4, mention: 12.0, collab: 0.3, followers: 0 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logo: 33.4, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 30.0, logo: 29.3, mention: 0.0, collab: 1.1, followers: 0 },
  { name: 'Washington', conf: 'Pac-12', posts: 2378, adoption: 27.7, logo: 25.7, mention: 0.0, collab: 4.2, followers: 0 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.8, logo: 26.7, mention: 0.0, collab: 0.0, followers: 907225 },
  { name: 'Texas', conf: 'SEC', posts: 6196, adoption: 26.4, logo: 25.2, mention: 0.4, collab: 1.8, followers: 3552007 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.8, logo: 25.8, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'San Diego', conf: 'WCC', posts: 2024, adoption: 25.2, logo: 23.2, mention: 9.2, collab: 0.0, followers: 439463 },
  { name: 'Creighton', conf: 'Big East', posts: 2592, adoption: 24.6, logo: 20.7, mention: 8.6, collab: 2.0, followers: 438009 },
  { name: 'Colorado', conf: 'Big 12', posts: 1418, adoption: 24.6, logo: 24.6, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.1, logo: 22.5, mention: 0.0, collab: 0.8, followers: 1266884 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.6, logo: 22.5, mention: 0.0, collab: 0.1, followers: 0 },
  { name: 'Clemson', conf: 'ACC', posts: 3351, adoption: 20.4, logo: 17.5, mention: 1.2, collab: 2.6, followers: 1726437 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1680, adoption: 18.3, logo: 18.3, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logo: 18.2, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1934, adoption: 18.0, logo: 18.0, mention: 0.0, collab: 0.0, followers: 0 },
  { name: 'Duke', conf: 'ACC', posts: 1951, adoption: 16.6, logo: 15.5, mention: 0.0, collab: 1.9, followers: 0 },
  { name: 'UNC', conf: 'ACC', posts: 3056, adoption: 16.3, logo: 15.7, mention: 0.5, collab: 0.2, followers: 1434088 },
  { name: 'Providence', conf: 'Big East', posts: 679, adoption: 15.8, logo: 12.7, mention: 0.0, collab: 4.7, followers: 0 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.2, logo: 11.5, mention: 0.0, collab: 5.4, followers: 882398 },
  { name: 'Georgia', conf: 'SEC', posts: 5376, adoption: 14.8, logo: 13.5, mention: 0.8, collab: 0.9, followers: 2864099 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 13.8, logo: 12.4, mention: 0.0, collab: 1.7, followers: 1848323 },
  { name: 'Illinois', conf: 'Big 10', posts: 2731, adoption: 13.7, logo: 12.6, mention: 0.0, collab: 1.9, followers: 0 },
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
            Data reflects <span className="font-semibold">Ohio State athlete personal social media accounts</span>, not official team pages.
            Metrics track how athletes use Ohio State IP (logos, mentions, collaborations) in their own content.
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
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Directional Comparison</p>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
          <div className="md:col-span-4 rounded-xl border p-4 bg-white" style={{ borderColor: colors.glassBorder }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Without {currentSignal?.label}</p>
            <p className="text-3xl font-black text-gray-700">{metricValues.withoutValue}</p>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(withoutPosts)} posts</p>
          </div>

          <div
            className="md:col-span-4 rounded-xl border-2 p-5 md:p-6 flex flex-col justify-center items-center text-center md:scale-[1.03]"
            style={{
              borderColor: `${colors.scarlet}55`,
              background: `linear-gradient(180deg, ${colors.scarlet}08 0%, ${colors.scarlet}12 100%)`,
              boxShadow: '0 10px 26px rgba(186, 12, 47, 0.16)',
            }}
          >
            <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: colors.scarlet }}>
              Lift Highlight
            </p>
            <p className="text-5xl font-black" style={{ color: colors.scarlet }}>
              {formatDelta(metricValues.delta)}
            </p>
            <p className="text-xs text-gray-500 mt-1">With vs Without</p>
          </div>

          <div
            className="md:col-span-4 rounded-xl border p-4 bg-white"
            style={{ borderColor: colors.glassBorder }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.scarlet }}>
              With {currentSignal?.label}
            </p>
            <p className="text-3xl font-black" style={{ color: colors.scarlet }}>{metricValues.withValue}</p>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(withPosts)} posts</p>
          </div>
        </div>
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
  const [rankingMetric, setRankingMetric] = useState<'followers' | 'posts' | 'mention' | 'logo' | 'collab'>('followers');
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? big10Schools : ncaaD1Schools;
  const benchmarkLabel = isConference ? 'Big 10' : 'NCAA D1';
  const metricOptions: { id: 'followers' | 'posts' | 'mention' | 'logo' | 'collab'; label: string }[] = [
    { id: 'followers', label: 'Followers' },
    { id: 'posts', label: 'Posts' },
    { id: 'mention', label: 'Mention Rate' },
    { id: 'logo', label: 'Visual IP Rate' },
    { id: 'collab', label: 'Collab Rate' },
  ];
  const metricLabels = {
    followers: 'Followers',
    posts: 'Total Posts',
    mention: 'Mention Rate',
    logo: 'Visual IP Rate',
    collab: 'Collaboration Rate',
  } as const;
  const metricAverage = {
    followers: 0,
    posts: 0,
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
            Ohio State vs {benchmarkLabel} schools ranked by {metricLabels[rankingMetric].toLowerCase()}.
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

      <GlassCard className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Ranking Metric</p>
        <div className="flex flex-wrap gap-2">
          {metricOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setRankingMetric(option.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all motion-reduce:transition-none"
              style={{
                borderColor: rankingMetric === option.id ? `${colors.scarlet}60` : '#d1d5db',
                backgroundColor: rankingMetric === option.id ? `${colors.scarlet}12` : '#fff',
                color: rankingMetric === option.id ? colors.scarlet : colors.textMuted,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </GlassCard>

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
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">{metricLabels[rankingMetric]}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Posts</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Visual IP</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Mention</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Collab</th>
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
                      {rankingMetric === 'followers' ? formatNumber(school.followers) : rankingMetric === 'posts' ? formatNumber(school.posts) : `${school[rankingMetric]}%`}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{formatNumber(school.posts)}</td>
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
  const [bigTenTeamPosts, setBigTenTeamPosts] = useState<TeamPostItem[]>([]);

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

  const top10BigTenTeamPosts = useMemo(
    () => [...bigTenTeamPosts].sort((a, b) => b.interactions - a.interactions).slice(0, 10),
    [bigTenTeamPosts],
  );

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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
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

            {/* Big Ten benchmark */}
            <div>
              <SectionHeader primary="BIG TEN " secondary="TEAM PAGE BENCHMARK" />
              <div className="space-y-3 mt-4">
                {top10BigTenTeamPosts.map((post, idx) => {
                  const isOhio = post.schoolName === 'Ohio State';
                  return (
                    <div
                      key={`${post.id}-${idx}`}
                      className="rounded-xl border p-3 sm:p-4 bg-white"
                      style={{ borderColor: isOhio ? `${colors.scarlet}55` : colors.glassBorder, backgroundColor: isOhio ? `${colors.scarlet}08` : '#fff' }}
                    >
                      <a
                        href={post.postLink || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3"
                      >
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: idx < 3 ? colors.scarlet : '#e5e7eb', color: idx < 3 ? '#fff' : colors.textMuted }}
                        >
                          {idx + 1}
                        </span>
                        <div className="w-20 sm:w-24 flex-shrink-0">{renderThumbnail(post.thumbnail, post.teamName)}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate" style={{ color: colors.text }}>{post.schoolName}</p>
                            {isOhio && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: colors.scarlet, color: '#fff' }}>Ohio State</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{post.teamName} • {post.dateLabel}</p>
                          {post.caption && (
                            <p className="text-xs mt-1.5 line-clamp-2" style={{ color: colors.textMuted }}>
                              {post.caption}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{formatNumber(post.interactions)} interactions</span>
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{post.conferenceName}</span>
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })}
                {top10BigTenTeamPosts.length === 0 && <p className="text-sm text-gray-500">No Big Ten team page benchmark posts available.</p>}
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
      <div>
        <SectionHeader primary="OHIO STATE " secondary="TEAM PAGES" />
        <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
          Official Ohio State athletics social account performance.
        </p>
        <p className="text-xs mt-1" style={{ color: colors.textDim }}>
          Current feed data is a recent-post sample (up to {formatNumber(maxTrackedPosts)} posts per team in this dataset).
        </p>
      </div>

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
          <div className="flex items-center py-3">
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
              </div>
            </div>
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
