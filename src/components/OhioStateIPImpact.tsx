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
  totalFollowers: 5543153,
  totalPosts: 8918,
  totalLikes: 15258768,
  totalComments: 401948,
  engagementRate: 0.0283,
  baseline: { posts: 6517, engagementRate: 0.0276 },
  postsWithIP: 2686,
  ipAdoptionRate: 30.1,
  avgLift: 115.5,
  collaboration: {
    posts: 23, likes: 15118.96, comments: 204.17,
    engagementRate: 0.0027643, delta: 790.4, emv: 322.8,
    baselineEngRate: 0.0003105, baselinePosts: 8895,
    baselineLikes: 1676.33, baselineComments: 44.66,
  } as IPSignalData,
  logo: {
    posts: 1206, likes: 3676.50, comments: 70.32,
    engagementRate: 0.0006759, delta: 159.3, emv: 80.56,
    baselineEngRate: 0.0002606, baselinePosts: 7712,
    baselineLikes: 1403.64, baselineComments: 41.12,
  } as IPSignalData,
  mention: {
    posts: 1929, likes: 2647.25, comments: 47.38,
    engagementRate: 0.0004861, delta: 80.0, emv: 57.68,
    baselineEngRate: 0.0002701, baselinePosts: 6989,
    baselineLikes: 1452.59, baselineComments: 44.44,
  } as IPSignalData,
  partnerships: [
    { brand: "@redbullusa", posts: 1, avgLikes: 171980, avgComments: 631, emv: 3502.7, engagementRate: 3.113, liftMultiplier: 97.2 },
    { brand: "@epicpartner", posts: 1, avgLikes: 37682, avgComments: 121, emv: 765.74, engagementRate: 0.681, liftMultiplier: 20.5 },
    { brand: "@discover", posts: 1, avgLikes: 23610, avgComments: 114, emv: 483.6, engagementRate: 0.427, liftMultiplier: 12.5 },
    { brand: "@dickssportinggoods", posts: 2, avgLikes: 20788, avgComments: 174, emv: 433.21, engagementRate: 0.378, liftMultiplier: 10.9 },
    { brand: "@thehenrylegacy", posts: 1, avgLikes: 15460, avgComments: 226, emv: 331.8, engagementRate: 0.282, liftMultiplier: 7.9 },
    { brand: "@easportscollege", posts: 4, avgLikes: 14822, avgComments: 139, emv: 310.37, engagementRate: 0.269, liftMultiplier: 7.5 },
    { brand: "@gianteagle", posts: 2, avgLikes: 13628, avgComments: 153, emv: 287.87, engagementRate: 0.248, liftMultiplier: 6.8 },
    { brand: "@naturemadevitamins", posts: 1, avgLikes: 11208, avgComments: 21, emv: 226.26, engagementRate: 0.202, liftMultiplier: 5.3 },
    { brand: "@defensesoap", posts: 1, avgLikes: 10148, avgComments: 33, emv: 206.26, engagementRate: 0.183, liftMultiplier: 4.7 },
    { brand: "@lv", posts: 1, avgLikes: 10029, avgComments: 139, emv: 214.48, engagementRate: 0.183, liftMultiplier: 4.7 },
    { brand: "@rebelcrystalofficial", posts: 1, avgLikes: 9275, avgComments: 2, emv: 185.7, engagementRate: 0.167, liftMultiplier: 4.2 },
    { brand: "@paycom", posts: 1, avgLikes: 9006, avgComments: 33, emv: 183.42, engagementRate: 0.163, liftMultiplier: 4.1 },
    { brand: "@athleteps", posts: 1, avgLikes: 8334, avgComments: 45, emv: 171.18, engagementRate: 0.151, liftMultiplier: 3.7 },
    { brand: "@doordash", posts: 2, avgLikes: 7652, avgComments: 23, emv: 155.38, engagementRate: 0.138, liftMultiplier: 3.3 },
    { brand: "@cliffkeenathletic", posts: 1, avgLikes: 6996, avgComments: 16, emv: 141.52, engagementRate: 0.126, liftMultiplier: 2.9 },
    { brand: "@allstate", posts: 2, avgLikes: 6636, avgComments: 44, emv: 137.13, engagementRate: 0.12, liftMultiplier: 2.8 },
    { brand: "@keybank", posts: 2, avgLikes: 5581, avgComments: 48, emv: 116.47, engagementRate: 0.101, liftMultiplier: 2.2 },
    { brand: "@wingstop", posts: 2, avgLikes: 5565, avgComments: 258, emv: 137.1, engagementRate: 0.105, liftMultiplier: 2.3 },
    { brand: "@serialashaeco", posts: 1, avgLikes: 4917, avgComments: 72, emv: 105.54, engagementRate: 0.09, liftMultiplier: 1.8 },
    { brand: "@paycomsoftware", posts: 5, avgLikes: 4866, avgComments: 28, emv: 100.18, engagementRate: 0.088, liftMultiplier: 1.7 },
    { brand: "@the.courageousathlete", posts: 1, avgLikes: 4013, avgComments: 22, emv: 82.46, engagementRate: 0.072, liftMultiplier: 1.2 },
    { brand: "@directv", posts: 4, avgLikes: 3776, avgComments: 29, emv: 78.45, engagementRate: 0.068, liftMultiplier: 1.1 },
    { brand: "@jlabaudio", posts: 1, avgLikes: 3769, avgComments: 113, emv: 86.68, engagementRate: 0.07, liftMultiplier: 1.2 },
    { brand: "@rivalsdotcom", posts: 1, avgLikes: 2802, avgComments: 95, emv: 65.54, engagementRate: 0.052, liftMultiplier: 0.6 },
    { brand: "@leesfamouschick", posts: 1, avgLikes: 2797, avgComments: 27, emv: 58.64, engagementRate: 0.05, liftMultiplier: 0.6 },
    { brand: "@heydude", posts: 12, avgLikes: 2651, avgComments: 42, emv: 57.3, engagementRate: 0.048, liftMultiplier: 0.5 },
    { brand: "@nike_wrestling", posts: 1, avgLikes: 2646, avgComments: 20, emv: 54.92, engagementRate: 0.048, liftMultiplier: 0.5 },
    { brand: "@chipotle", posts: 2, avgLikes: 2366, avgComments: 35, emv: 50.87, engagementRate: 0.043, liftMultiplier: 0.3 },
    { brand: "@oikos", posts: 1, avgLikes: 2353, avgComments: 31, emv: 50.16, engagementRate: 0.043, liftMultiplier: 0.3 },
    { brand: "@celsiusbrandpartner", posts: 1, avgLikes: 2237, avgComments: 12, emv: 45.94, engagementRate: 0.04, liftMultiplier: 0.2 },
    { brand: "@gametimeapp", posts: 1, avgLikes: 2141, avgComments: 41, emv: 46.92, engagementRate: 0.039, liftMultiplier: 0.2 },
    { brand: "@peppermayo", posts: 2, avgLikes: 2060, avgComments: 34, emv: 44.66, engagementRate: 0.037, liftMultiplier: 0.1 },
    { brand: "@nash", posts: 1, avgLikes: 2007, avgComments: 18, emv: 41.94, engagementRate: 0.036, liftMultiplier: 0.1 },
    { brand: "@ricartautomotive", posts: 1, avgLikes: 1839, avgComments: 55, emv: 42.28, engagementRate: 0.034, liftMultiplier: 0 },
    { brand: "@seatgeek", posts: 2, avgLikes: 1753, avgComments: 23, emv: 37.36, engagementRate: 0.032, liftMultiplier: 0 },
    { brand: "@crackerbarrel", posts: 1, avgLikes: 1659, avgComments: 32, emv: 36.38, engagementRate: 0.03, liftMultiplier: -0.1 },
    { brand: "@aladdinseatery", posts: 1, avgLikes: 1656, avgComments: 32, emv: 36.32, engagementRate: 0.03, liftMultiplier: -0.1 },
    { brand: "@his_huddle", posts: 1, avgLikes: 1642, avgComments: 13, emv: 34.14, engagementRate: 0.029, liftMultiplier: -0.1 },
    { brand: "@pressplay", posts: 1, avgLikes: 1627, avgComments: 26, emv: 35.14, engagementRate: 0.029, liftMultiplier: -0.1 },
    { brand: "@mcdonalds_greaterohio", posts: 1, avgLikes: 1626, avgComments: 8, emv: 33.32, engagementRate: 0.029, liftMultiplier: -0.1 },
    { brand: "@_yarn.lab_", posts: 1, avgLikes: 1622, avgComments: 101, emv: 42.54, engagementRate: 0.031, liftMultiplier: -0.1 },
    { brand: "@shootaway", posts: 2, avgLikes: 1471, avgComments: 38, emv: 33.22, engagementRate: 0.027, liftMultiplier: -0.2 },
    { brand: "@whereimfrom", posts: 3, avgLikes: 1461, avgComments: 30, emv: 32.25, engagementRate: 0.026, liftMultiplier: -0.2 },
    { brand: "@aabonnbc", posts: 1, avgLikes: 1427, avgComments: 28, emv: 31.34, engagementRate: 0.026, liftMultiplier: -0.2 },
    { brand: "@brooksrunning", posts: 6, avgLikes: 1310, avgComments: 30, emv: 29.22, engagementRate: 0.024, liftMultiplier: -0.3 },
    { brand: "@kinatraxinc", posts: 1, avgLikes: 1294, avgComments: 3, emv: 26.18, engagementRate: 0.023, liftMultiplier: -0.3 },
    { brand: "@wrestlingbucks", posts: 2, avgLikes: 1285, avgComments: 15, emv: 27.25, engagementRate: 0.023, liftMultiplier: -0.3 },
    { brand: "@stxmlax", posts: 2, avgLikes: 1231, avgComments: 5, emv: 25.13, engagementRate: 0.022, liftMultiplier: -0.3 },
    { brand: "@qpeezy_0", posts: 1, avgLikes: 1221, avgComments: 16, emv: 26.02, engagementRate: 0.022, liftMultiplier: -0.3 },
    { brand: "@gvartwork", posts: 1, avgLikes: 1213, avgComments: 47, emv: 28.96, engagementRate: 0.022, liftMultiplier: -0.3 },
    { brand: "@krogerco", posts: 1, avgLikes: 1203, avgComments: 18, emv: 25.86, engagementRate: 0.022, liftMultiplier: -0.4 },
    { brand: "@littlewesttavern", posts: 1, avgLikes: 1172, avgComments: 28, emv: 26.24, engagementRate: 0.021, liftMultiplier: -0.4 },
    { brand: "@brody_marcet9", posts: 1, avgLikes: 1137, avgComments: 47, emv: 27.44, engagementRate: 0.021, liftMultiplier: -0.4 },
    { brand: "@nikelacrosse", posts: 2, avgLikes: 1085, avgComments: 34, emv: 25.15, engagementRate: 0.02, liftMultiplier: -0.4 },
    { brand: "@starbucks", posts: 1, avgLikes: 1068, avgComments: 16, emv: 22.96, engagementRate: 0.019, liftMultiplier: -0.4 },
    { brand: "@adoreme", posts: 1, avgLikes: 1042, avgComments: 71, emv: 27.94, engagementRate: 0.02, liftMultiplier: -0.4 },
    { brand: "@bauerhockey", posts: 2, avgLikes: 1039, avgComments: 38, emv: 24.64, engagementRate: 0.019, liftMultiplier: -0.4 },
    { brand: "@slimchickens", posts: 1, avgLikes: 985, avgComments: 16, emv: 21.3, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@hollister", posts: 45, avgLikes: 979, avgComments: 19, emv: 21.59, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@donatospizza", posts: 4, avgLikes: 972, avgComments: 18, emv: 21.28, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@kamaruclothing", posts: 1, avgLikes: 969, avgComments: 77, emv: 27.08, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@honeystinger", posts: 2, avgLikes: 964, avgComments: 18, emv: 21.08, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@alltohim_apparel", posts: 1, avgLikes: 956, avgComments: 36, emv: 22.72, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@bobboydlincoln", posts: 1, avgLikes: 950, avgComments: 35, emv: 22.5, engagementRate: 0.017, liftMultiplier: -0.5 },
    { brand: "@phillies", posts: 1, avgLikes: 932, avgComments: 93, emv: 27.94, engagementRate: 0.018, liftMultiplier: -0.5 },
    { brand: "@goodyearblimp", posts: 1, avgLikes: 915, avgComments: 18, emv: 20.1, engagementRate: 0.016, liftMultiplier: -0.5 },
    { brand: "@tmobile", posts: 1, avgLikes: 911, avgComments: 5, emv: 18.72, engagementRate: 0.016, liftMultiplier: -0.5 },
    { brand: "@yungluth", posts: 1, avgLikes: 835, avgComments: 10, emv: 17.7, engagementRate: 0.015, liftMultiplier: -0.6 },
    { brand: "@statefarm", posts: 1, avgLikes: 826, avgComments: 11, emv: 17.62, engagementRate: 0.015, liftMultiplier: -0.6 },
    { brand: "@nhljets", posts: 1, avgLikes: 785, avgComments: 34, emv: 19.1, engagementRate: 0.014, liftMultiplier: -0.6 },
    { brand: "@dickshouseofsport", posts: 1, avgLikes: 754, avgComments: 17, emv: 16.78, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@raisingcanes", posts: 1, avgLikes: 746, avgComments: 14, emv: 16.32, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@thefoundationohio", posts: 3, avgLikes: 744, avgComments: 13, emv: 16.18, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@gainbridgelife", posts: 1, avgLikes: 734, avgComments: 3, emv: 14.98, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@alex.dixon_", posts: 1, avgLikes: 696, avgComments: 43, emv: 18.22, engagementRate: 0.013, liftMultiplier: -0.6 },
    { brand: "@neweracap", posts: 5, avgLikes: 688, avgComments: 16, emv: 15.38, engagementRate: 0.012, liftMultiplier: -0.6 },
    { brand: "@underarmour", posts: 1, avgLikes: 669, avgComments: 35, emv: 16.88, engagementRate: 0.012, liftMultiplier: -0.6 },
    { brand: "@princesspolly", posts: 2, avgLikes: 653, avgComments: 26, emv: 15.71, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@undrdawg", posts: 1, avgLikes: 641, avgComments: 36, emv: 16.42, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@thriveresidents", posts: 3, avgLikes: 637, avgComments: 50, emv: 17.75, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@olyforest", posts: 2, avgLikes: 627, avgComments: 16, emv: 14.14, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@nolteroofing", posts: 1, avgLikes: 626, avgComments: 0, emv: 12.52, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@hockeycanada", posts: 1, avgLikes: 622, avgComments: 53, emv: 17.73, engagementRate: 0.012, liftMultiplier: -0.7 },
    { brand: "@gatorade", posts: 2, avgLikes: 615, avgComments: 30, emv: 15.35, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@ohiobeef", posts: 1, avgLikes: 615, avgComments: 14, emv: 13.7, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@dannydlawn", posts: 2, avgLikes: 612, avgComments: 47, emv: 16.98, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@rhoback", posts: 1, avgLikes: 591, avgComments: 3, emv: 12.12, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@tytusgrills", posts: 3, avgLikes: 576, avgComments: 9, emv: 12.45, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@puregreenhighstreet", posts: 1, avgLikes: 567, avgComments: 1, emv: 11.44, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@carterscamera", posts: 1, avgLikes: 565, avgComments: 84, emv: 19.7, engagementRate: 0.011, liftMultiplier: -0.7 },
    { brand: "@7brewcoffee", posts: 2, avgLikes: 560, avgComments: 6, emv: 11.8, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@raisinbran_us", posts: 1, avgLikes: 559, avgComments: 28, emv: 13.98, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@allinklusivesports", posts: 1, avgLikes: 557, avgComments: 14, emv: 12.54, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@popeyes", posts: 3, avgLikes: 554, avgComments: 15, emv: 12.63, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@ikoniik.co", posts: 1, avgLikes: 531, avgComments: 9, emv: 11.52, engagementRate: 0.009, liftMultiplier: -0.7 },
    { brand: "@theviewonfifth", posts: 7, avgLikes: 530, avgComments: 4, emv: 11.07, engagementRate: 0.009, liftMultiplier: -0.7 },
    { brand: "@liquidiv", posts: 1, avgLikes: 523, avgComments: 41, emv: 14.56, engagementRate: 0.01, liftMultiplier: -0.7 },
    { brand: "@bankofamerica", posts: 1, avgLikes: 497, avgComments: 19, emv: 11.84, engagementRate: 0.009, liftMultiplier: -0.8 },
    { brand: "@clever_made", posts: 6, avgLikes: 483, avgComments: 23, emv: 12, engagementRate: 0.009, liftMultiplier: -0.8 },
    { brand: "@brittanyshope", posts: 1, avgLikes: 464, avgComments: 36, emv: 12.88, engagementRate: 0.009, liftMultiplier: -0.8 },
    { brand: "@clevermade", posts: 1, avgLikes: 463, avgComments: 18, emv: 11.06, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@glocknerautomotive", posts: 1, avgLikes: 462, avgComments: 11, emv: 10.34, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@americaneagle", posts: 17, avgLikes: 447, avgComments: 30, emv: 11.95, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@citybarbecue", posts: 1, avgLikes: 444, avgComments: 2, emv: 9.08, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@palshealth", posts: 1, avgLikes: 439, avgComments: 15, emv: 10.28, engagementRate: 0.008, liftMultiplier: -0.8 },
    { brand: "@colab_collective", posts: 4, avgLikes: 412, avgComments: 11, emv: 9.36, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@ohiostswimdive", posts: 1, avgLikes: 410, avgComments: 33, emv: 11.5, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@chickfila", posts: 3, avgLikes: 406, avgComments: 34, emv: 11.53, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@big_tasty_hawk", posts: 1, avgLikes: 406, avgComments: 2, emv: 8.32, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@gooseitcompany", posts: 1, avgLikes: 403, avgComments: 0, emv: 8.06, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@comfrt", posts: 1, avgLikes: 394, avgComments: 14, emv: 9.27, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@pursuityourself", posts: 14, avgLikes: 391, avgComments: 12, emv: 9.08, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@xx_xyathletics", posts: 1, avgLikes: 387, avgComments: 5, emv: 8.24, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@statsports", posts: 1, avgLikes: 383, avgComments: 6, emv: 8.26, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@laorganicsco", posts: 1, avgLikes: 362, avgComments: 23, emv: 9.53, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@jesselee_pakele", posts: 1, avgLikes: 362, avgComments: 21, emv: 9.34, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@ohiopoultry", posts: 1, avgLikes: 359, avgComments: 3, emv: 7.48, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@c4energy", posts: 11, avgLikes: 358, avgComments: 35, emv: 10.69, engagementRate: 0.007, liftMultiplier: -0.8 },
    { brand: "@prodigydanceconvention", posts: 1, avgLikes: 343, avgComments: 10, emv: 7.86, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@spartancombat", posts: 1, avgLikes: 341, avgComments: 6, emv: 7.42, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@newbalance", posts: 1, avgLikes: 336, avgComments: 3, emv: 7.02, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@dwccollection", posts: 1, avgLikes: 330, avgComments: 32, emv: 9.8, engagementRate: 0.006, liftMultiplier: -0.8 },
    { brand: "@ritfit.sports", posts: 1, avgLikes: 329, avgComments: 8, emv: 7.38, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@fanoutfitters", posts: 1, avgLikes: 324, avgComments: 7, emv: 7.18, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@ritzpartner", posts: 1, avgLikes: 313, avgComments: 7, emv: 6.96, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@bwwings", posts: 1, avgLikes: 308, avgComments: 11, emv: 7.26, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drinkolipop", posts: 5, avgLikes: 302, avgComments: 18, emv: 7.85, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@vertical_protein", posts: 1, avgLikes: 295, avgComments: 49, emv: 10.8, engagementRate: 0.006, liftMultiplier: -0.9 },
    { brand: "@carhartt", posts: 2, avgLikes: 290, avgComments: 11, emv: 6.96, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drinkunwell", posts: 1, avgLikes: 289, avgComments: 14, emv: 7.18, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@ramblercolumbus", posts: 5, avgLikes: 285, avgComments: 6, emv: 6.35, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@bckr.hq", posts: 2, avgLikes: 283, avgComments: 5, emv: 6.21, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drpepper", posts: 4, avgLikes: 280, avgComments: 42, emv: 9.84, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@drinkbubblr", posts: 3, avgLikes: 278, avgComments: 16, emv: 7.2, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@rmhcofcentraloh", posts: 1, avgLikes: 278, avgComments: 9, emv: 6.46, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@thebuckeyecorner", posts: 2, avgLikes: 273, avgComments: 12, emv: 6.71, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@homage", posts: 3, avgLikes: 264, avgComments: 21, emv: 7.45, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@foresightsports_upnext", posts: 3, avgLikes: 264, avgComments: 13, emv: 6.58, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@porkrindsdotcom", posts: 1, avgLikes: 261, avgComments: 17, emv: 6.92, engagementRate: 0.005, liftMultiplier: -0.9 },
    { brand: "@vegiworks", posts: 1, avgLikes: 258, avgComments: 11, emv: 6.26, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@amazon", posts: 5, avgLikes: 257, avgComments: 17, emv: 6.65, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@monsterenergy", posts: 1, avgLikes: 255, avgComments: 5, emv: 5.6, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@gymshark", posts: 1, avgLikes: 245, avgComments: 5, emv: 5.4, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@elf.skin", posts: 1, avgLikes: 241, avgComments: 14, emv: 6.14, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@boohoo", posts: 1, avgLikes: 237, avgComments: 5, emv: 5.24, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@tiktok", posts: 1, avgLikes: 236, avgComments: 3, emv: 5.02, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@skims", posts: 1, avgLikes: 234, avgComments: 6, emv: 5.28, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@revahealth", posts: 1, avgLikes: 232, avgComments: 6, emv: 5.24, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@thecollectiveclub", posts: 6, avgLikes: 230, avgComments: 9, emv: 5.69, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@hyperice", posts: 2, avgLikes: 229, avgComments: 9, emv: 5.66, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@creamofwheat", posts: 1, avgLikes: 227, avgComments: 26, emv: 6.92, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@rawnutrition", posts: 1, avgLikes: 226, avgComments: 9, emv: 5.54, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@trophynuts", posts: 2, avgLikes: 226, avgComments: 10, emv: 5.66, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@pnwcomponents", posts: 1, avgLikes: 224, avgComments: 0, emv: 4.48, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@chubbiesshorts", posts: 1, avgLikes: 222, avgComments: 13, emv: 5.78, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@brewed.fresh.daily", posts: 1, avgLikes: 221, avgComments: 7, emv: 5.2, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@lionsnotsheep", posts: 2, avgLikes: 217, avgComments: 15, emv: 5.84, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@drinkag1", posts: 1, avgLikes: 217, avgComments: 5, emv: 4.84, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@primesports", posts: 2, avgLikes: 216, avgComments: 2, emv: 4.52, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@fanatics", posts: 1, avgLikes: 215, avgComments: 0, emv: 4.3, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@flonaseallergy", posts: 1, avgLikes: 210, avgComments: 3, emv: 4.5, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bngsportnutrition", posts: 1, avgLikes: 205, avgComments: 6, emv: 4.82, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@adidasrunning", posts: 1, avgLikes: 204, avgComments: 4, emv: 4.52, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@adidasfootball", posts: 3, avgLikes: 202, avgComments: 5, emv: 4.6, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@eatsurgent", posts: 1, avgLikes: 197, avgComments: 26, emv: 6.34, engagementRate: 0.004, liftMultiplier: -0.9 },
    { brand: "@adidasbaseball", posts: 1, avgLikes: 196, avgComments: 8, emv: 4.8, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@buffalowildwings", posts: 1, avgLikes: 195, avgComments: 3, emv: 4.22, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@kindsnacks", posts: 1, avgLikes: 193, avgComments: 8, emv: 4.74, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@adidas", posts: 3, avgLikes: 192, avgComments: 11, emv: 5.11, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bodybuildingcom", posts: 1, avgLikes: 191, avgComments: 3, emv: 4.16, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@eatumami", posts: 1, avgLikes: 190, avgComments: 7, emv: 4.62, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@kelloggs", posts: 1, avgLikes: 188, avgComments: 5, emv: 4.36, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@buckedupsupp", posts: 4, avgLikes: 187, avgComments: 8, emv: 4.67, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@paniniamerica", posts: 2, avgLikes: 186, avgComments: 8, emv: 4.62, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@reebok", posts: 1, avgLikes: 186, avgComments: 6, emv: 4.44, engagementRate: 0.003, liftMultiplier: -0.9 },
    { brand: "@bambooboutique", posts: 1, avgLikes: 16, avgComments: 0, emv: 0.32, engagementRate: 0, liftMultiplier: -1 },
    { brand: "@powerade_us", posts: 1, avgLikes: 3, avgComments: 137, emv: 13.76, engagementRate: 0.002, liftMultiplier: -1 },
  ] as Partnership[],
};

// ═══════════════════════════════════════════════════════════════
// ATHLETE & BENCHMARK DATA
// ═══════════════════════════════════════════════════════════════
const topCollabAthletes = [
  { rank: 1, name: "Davison Igbinosun", sport: "Football", posts: 2, emv: 16154, lift: 694 },
  { rank: 2, name: "Jeremiah Smith", sport: "Football", posts: 1, emv: 13056, lift: 694 },
  { rank: 3, name: "Brandon Inniss", sport: "Football", posts: 1, emv: 10714, lift: 694 },
  { rank: 4, name: "Jermaine Mathews Jr.", sport: "Football", posts: 2, emv: 9047, lift: 694 },
  { rank: 5, name: "Kayden McDonald", sport: "Football", posts: 2, emv: 6720, lift: 694 },
];
const topLogoAthletes = [
  { rank: 1, name: "Jeremiah Smith", sport: "Football", posts: 12, emv: 145803, lift: 144 },
  { rank: 2, name: "Julian Sayin", sport: "Football", posts: 2, emv: 76500, lift: 144 },
  { rank: 3, name: "Caleb Downs", sport: "Football", posts: 11, emv: 71398, lift: 144 },
  { rank: 4, name: "Brandon Inniss", sport: "Football", posts: 9, emv: 64552, lift: 144 },
  { rank: 5, name: "James Peoples", sport: "Football", posts: 10, emv: 36586, lift: 144 },
];
const topMentionAthletes = [
  { rank: 1, name: "Caleb Downs", sport: "Football", posts: 7, emv: 76113, lift: 44 },
  { rank: 2, name: "Carson Hinzman", sport: "Football", posts: 10, emv: 55665, lift: 44 },
  { rank: 3, name: "Quincy Porter", sport: "Football", posts: 8, emv: 45994, lift: 44 },
  { rank: 4, name: "JJ Coleman", sport: "W. Gymnastics", posts: 3, emv: 31904, lift: 44 },
  { rank: 5, name: "John Mobley Jr.", sport: "M. Basketball", posts: 14, emv: 26776, lift: 44 },
];
const signalStats = {
  collab: { posts: 23, totalEmv: 79086, avgEmv: 3439, lift: 694 },
  logo: { posts: 735, totalEmv: 775595, avgEmv: 1055, lift: 144 },
  mention: { posts: 1929, totalEmv: 1204091, avgEmv: 624, lift: 44 },
};

const fallbackSportData: Record<string, Record<string, { with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number }; without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number } }>> = {
  'ALL_SPORTS': {
    mention: { with: { posts: 1929, avgLikes: 2647, avgComments: 47, engagementRate: 0.00049 }, without: { posts: 6989, avgLikes: 1453, avgComments: 44, engagementRate: 0.00027 } },
    logo: { with: { posts: 1206, avgLikes: 3676, avgComments: 70, engagementRate: 0.00068 }, without: { posts: 7712, avgLikes: 1404, avgComments: 41, engagementRate: 0.00026 } },
    collab: { with: { posts: 23, avgLikes: 15119, avgComments: 204, engagementRate: 0.00276 }, without: { posts: 8895, avgLikes: 1676, avgComments: 45, engagementRate: 0.00031 } }
  },
  'FOOTBALL': {
    mention: { with: { posts: 309, avgLikes: 8500, avgComments: 120, engagementRate: 0.0015 }, without: { posts: 1189, avgLikes: 6200, avgComments: 92, engagementRate: 0.0011 } },
    logo: { with: { posts: 344, avgLikes: 9100, avgComments: 125, engagementRate: 0.0016 }, without: { posts: 1154, avgLikes: 5800, avgComments: 88, engagementRate: 0.001 } },
    collab: { with: { posts: 22, avgLikes: 18000, avgComments: 250, engagementRate: 0.0032 }, without: { posts: 1476, avgLikes: 6650, avgComments: 98, engagementRate: 0.0012 } }
  },
  'MENS_BASKETBALL': {
    mention: { with: { posts: 82, avgLikes: 4200, avgComments: 52, engagementRate: 0.0014 }, without: { posts: 130, avgLikes: 2400, avgComments: 31, engagementRate: 0.00085 } },
    logo: { with: { posts: 55, avgLikes: 5100, avgComments: 61, engagementRate: 0.0017 }, without: { posts: 157, avgLikes: 2200, avgComments: 30, engagementRate: 0.00075 } },
    collab: { with: { posts: 1, avgLikes: 12000, avgComments: 180, engagementRate: 0.004 }, without: { posts: 211, avgLikes: 3000, avgComments: 38, engagementRate: 0.001 } }
  },
  'MENS_WRESTLING': {
    mention: { with: { posts: 148, avgLikes: 1800, avgComments: 42, engagementRate: 0.00062 }, without: { posts: 320, avgLikes: 980, avgComments: 28, engagementRate: 0.00034 } },
    logo: { with: { posts: 96, avgLikes: 2100, avgComments: 48, engagementRate: 0.00072 }, without: { posts: 372, avgLikes: 900, avgComments: 26, engagementRate: 0.00031 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 468, avgLikes: 1250, avgComments: 32, engagementRate: 0.00043 } }
  },
  'WOMENS_BASKETBALL': {
    mention: { with: { posts: 122, avgLikes: 2650, avgComments: 38, engagementRate: 0.00089 }, without: { posts: 263, avgLikes: 1420, avgComments: 24, engagementRate: 0.00048 } },
    logo: { with: { posts: 88, avgLikes: 3100, avgComments: 44, engagementRate: 0.00105 }, without: { posts: 297, avgLikes: 1300, avgComments: 22, engagementRate: 0.00044 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 385, avgLikes: 1850, avgComments: 28, engagementRate: 0.00063 } }
  },
  'MENS_GYMNASTICS': {
    mention: { with: { posts: 100, avgLikes: 920, avgComments: 22, engagementRate: 0.00031 }, without: { posts: 128, avgLikes: 530, avgComments: 14, engagementRate: 0.00018 } },
    logo: { with: { posts: 59, avgLikes: 1100, avgComments: 26, engagementRate: 0.00037 }, without: { posts: 169, avgLikes: 490, avgComments: 13, engagementRate: 0.00017 } },
    collab: { with: { posts: 0, avgLikes: 0, avgComments: 0, engagementRate: 0 }, without: { posts: 228, avgLikes: 692, avgComments: 17, engagementRate: 0.00024 } }
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
  { name: 'Nebraska', conf: 'Big 10', followers: 3012749, posts: 3049, ipPosts: 1658, adoption: 54.4, logo: 49.1, mention: 20.2, collab: 0 },
  { name: 'Indiana', conf: 'Big 10', followers: 900000, posts: 1635, ipPosts: 831, adoption: 50.8, logo: 50.8, mention: 0, collab: 0 },
  { name: 'Michigan', conf: 'Big 10', followers: 4500000, posts: 4042, ipPosts: 2024, adoption: 50.1, logo: 50.0, mention: 0, collab: 0.1 },
  { name: 'Michigan State', conf: 'Big 10', followers: 802304, posts: 2216, ipPosts: 1039, adoption: 46.9, logo: 38.3, mention: 20.1, collab: 2.93 },
  { name: 'Oregon', conf: 'Big 10', followers: 1800000, posts: 2073, ipPosts: 948, adoption: 45.7, logo: 44.9, mention: 0, collab: 2.36 },
  { name: 'Maryland', conf: 'Big 10', followers: 858916, posts: 2120, ipPosts: 925, adoption: 43.6, logo: 38.1, mention: 18.5, collab: 0 },
  { name: 'Rutgers', conf: 'Big 10', followers: 800000, posts: 2036, ipPosts: 732, adoption: 35.9, logo: 35.9, mention: 0, collab: 0 },
  { name: 'Purdue', conf: 'Big 10', followers: 1300000, posts: 5142, ipPosts: 1772, adoption: 34.5, logo: 31.4, mention: 12.7, collab: 3.29 },
  { name: 'Iowa', conf: 'Big 10', followers: 1500000, posts: 2254, ipPosts: 753, adoption: 33.4, logo: 33.4, mention: 0, collab: 0 },
  { name: 'Ohio State', conf: 'Big 10', followers: 5543153, posts: 8918, ipPosts: 2401, adoption: 26.9, logo: 8.2, mention: 21.6, collab: 0.26 },
  { name: 'Washington', conf: 'Big 10', followers: 1600000, posts: 2344, ipPosts: 615, adoption: 26.2, logo: 24.1, mention: 0, collab: 4.14 },
  { name: 'Penn State', conf: 'Big 10', followers: 4032162, posts: 7202, ipPosts: 1686, adoption: 23.4, logo: 7.6, mention: 18.8, collab: 0.01 },
  { name: 'Minnesota', conf: 'Big 10', followers: 1200000, posts: 2354, ipPosts: 357, adoption: 15.2, logo: 11.5, mention: 0, collab: 5.35 },
  { name: 'Illinois', conf: 'Big 10', followers: 1100000, posts: 2731, ipPosts: 374, adoption: 13.7, logo: 12.6, mention: 0, collab: 1.90 },
  { name: 'Wisconsin', conf: 'Big 10', followers: 2000000, posts: 5664, ipPosts: 510, adoption: 9.0, logo: 9.0, mention: 0, collab: 0 },
  { name: 'UCLA', conf: 'Big 10', followers: 2500000, posts: 6482, ipPosts: 514, adoption: 7.9, logo: 7.9, mention: 0, collab: 0 },
  { name: 'USC', conf: 'Big 10', followers: 3000000, posts: 5328, ipPosts: 353, adoption: 6.6, logo: 6.6, mention: 0, collab: 0.02 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1564, adoption: 56.7, logo: 53.5, mention: 14.6, collab: 1.34 },
  { name: 'Nebraska', conf: 'Big 10', posts: 3049, adoption: 54.3, logo: 49.1, mention: 20.2, collab: 0 },
  { name: 'Miami', conf: 'ACC', posts: 1553, adoption: 53.8, logo: 53.8, mention: 0, collab: 0 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 53.2, logo: 50.2, mention: 21.6, collab: 4.56 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 52.9, logo: 52.3, mention: 0, collab: 1.18 },
  { name: 'Indiana', conf: 'Big 10', posts: 1635, adoption: 50.8, logo: 50.8, mention: 0, collab: 0 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.0, logo: 50.0, mention: 0, collab: 0.09 },
  { name: 'Virginia Tech', conf: 'SEC', posts: 3735, adoption: 49.6, logo: 45.9, mention: 16.0, collab: 0.10 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.6, logo: 47.2, mention: 0, collab: 3.97 },
  { name: 'Kentucky', conf: 'SEC', posts: 2924, adoption: 48.5, logo: 46.5, mention: 0, collab: 6.63 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2216, adoption: 46.8, logo: 38.3, mention: 20.1, collab: 2.93 },
  { name: 'Notre Dame', conf: 'ACC', posts: 2747, adoption: 46.7, logo: 43.4, mention: 19.0, collab: 0.07 },
  { name: 'Oregon', conf: 'Big 10', posts: 2073, adoption: 45.7, logo: 44.9, mention: 0, collab: 2.36 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2813, adoption: 45.6, logo: 45.6, mention: 0, collab: 0 },
  { name: 'NC State', conf: 'ACC', posts: 2565, adoption: 45.5, logo: 44.7, mention: 0, collab: 3.07 },
  { name: 'BYU', conf: 'Big 12', posts: 5050, adoption: 45.5, logo: 39.7, mention: 15.0, collab: 3.36 },
  { name: 'Maryland', conf: 'Big 10', posts: 2120, adoption: 43.6, logo: 38.1, mention: 18.4, collab: 0 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.4, logo: 43.1, mention: 0, collab: 1.25 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 42.1, logo: 36.9, mention: 17.9, collab: 2.64 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.6, logo: 41.6, mention: 0, collab: 0 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logo: 41.5, mention: 0, collab: 0.54 },
  { name: 'UTSA', conf: 'AAC', posts: 3339, adoption: 41.4, logo: 32.7, mention: 19.1, collab: 9.52 },
  { name: 'Arizona', conf: 'Big 12', posts: 4312, adoption: 41.2, logo: 38.8, mention: 9.6, collab: 1.60 },
  { name: 'Missouri', conf: 'SEC', posts: 5643, adoption: 40.5, logo: 35.5, mention: 20.1, collab: 1.94 },
  { name: 'Georgia Tech', conf: 'ACC', posts: 2066, adoption: 40.4, logo: 38.9, mention: 0, collab: 5.61 },
  { name: 'Florida State', conf: 'ACC', posts: 2130, adoption: 40.1, logo: 40.1, mention: 0, collab: 0 },
  { name: 'Boston College', conf: 'ACC', posts: 1539, adoption: 39.9, logo: 38.5, mention: 0, collab: 6.10 },
  { name: 'Baylor', conf: 'Big 12', posts: 6486, adoption: 38.3, logo: 29.8, mention: 21.9, collab: 2.99 },
  { name: 'Alabama', conf: 'SEC', posts: 5653, adoption: 37.4, logo: 33.0, mention: 16.7, collab: 2.49 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 35.9, logo: 35.9, mention: 0, collab: 0 },
  { name: 'Purdue', conf: 'Big 10', posts: 5142, adoption: 34.4, logo: 31.4, mention: 12.7, collab: 3.28 },
  { name: 'Mississippi', conf: 'SEC', posts: 2239, adoption: 34.3, logo: 34.3, mention: 0, collab: 0 },
  { name: 'Arkansas', conf: 'SEC', posts: 5597, adoption: 34.0, logo: 31.1, mention: 10.3, collab: 0.91 },
  { name: 'Auburn', conf: 'SEC', posts: 5314, adoption: 33.7, logo: 12.3, mention: 25.9, collab: 0.39 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logo: 33.4, mention: 0, collab: 0 },
  { name: 'Texas A&M', conf: 'SEC', posts: 3419, adoption: 32.3, logo: 15.4, mention: 24.5, collab: 0 },
  { name: 'Arizona State', conf: 'Big 12', posts: 6782, adoption: 31.0, logo: 27.4, mention: 10.9, collab: 3.05 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 29.9, logo: 29.2, mention: 0, collab: 1.06 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 28.1, logo: 23.1, mention: 11.9, collab: 0.25 },
  { name: 'Texas', conf: 'SEC', posts: 5723, adoption: 27.1, logo: 27.1, mention: 0, collab: 0 },
  { name: 'Ohio State', conf: 'Big 10', posts: 8918, adoption: 26.9, logo: 8.2, mention: 21.6, collab: 0.26 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.7, logo: 26.7, mention: 0, collab: 0.02 },
  { name: 'Washington', conf: 'Big 10', posts: 2344, adoption: 26.2, logo: 24.1, mention: 0, collab: 4.13 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4309, adoption: 26.1, logo: 10.8, mention: 18.6, collab: 0.51 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.7, logo: 25.7, mention: 0, collab: 0 },
  { name: 'LSU', conf: 'SEC', posts: 4269, adoption: 25.7, logo: 10.1, mention: 18.6, collab: 0 },
  { name: 'Colorado', conf: 'Big 12', posts: 1418, adoption: 24.6, logo: 24.6, mention: 0, collab: 0 },
  { name: 'UCF', conf: 'Big 12', posts: 1756, adoption: 23.9, logo: 16.6, mention: 10.9, collab: 0 },
  { name: 'Penn State', conf: 'Big 10', posts: 7202, adoption: 23.4, logo: 7.6, mention: 18.8, collab: 0.01 },
  { name: 'San Diego', conf: 'WCC', posts: 1974, adoption: 23.1, logo: 20.3, mention: 9.2, collab: 0.05 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.0, logo: 22.4, mention: 0, collab: 0.82 },
  { name: 'Virginia', conf: 'ACC', posts: 5926, adoption: 22.7, logo: 7.8, mention: 18.0, collab: 0.60 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.5, logo: 22.4, mention: 0, collab: 0.13 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1680, adoption: 18.2, logo: 18.2, mention: 0, collab: 0 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logo: 18.2, mention: 0, collab: 0 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1934, adoption: 18.0, logo: 18.0, mention: 0, collab: 0 },
  { name: 'Duke', conf: 'ACC', posts: 1951, adoption: 16.3, logo: 15.2, mention: 0, collab: 1.94 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.1, logo: 11.5, mention: 0, collab: 5.35 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 13.7, logo: 12.4, mention: 0, collab: 1.70 },
  { name: 'Illinois', conf: 'Big 10', posts: 2731, adoption: 13.6, logo: 12.5, mention: 0, collab: 1.90 },
  { name: 'Georgia', conf: 'SEC', posts: 5016, adoption: 12.7, logo: 12.7, mention: 0, collab: 0 },
  { name: 'Florida', conf: 'SEC', posts: 2735, adoption: 12.6, logo: 12.6, mention: 0, collab: 0 },
  { name: 'Boise State', conf: 'MWC', posts: 4000, adoption: 12.2, logo: 11.7, mention: 0, collab: 1.02 },
  { name: 'Pittsburgh', conf: 'ACC', posts: 2475, adoption: 11.7, logo: 11.6, mention: 0, collab: 0.16 },
  { name: 'UNC', conf: 'ACC', posts: 2744, adoption: 11.1, logo: 11.1, mention: 0, collab: 0 },
  { name: 'Clemson', conf: 'ACC', posts: 3013, adoption: 10.2, logo: 10.2, mention: 0, collab: 0.03 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5664, adoption: 9.0, logo: 9.0, mention: 0, collab: 0 },
  { name: 'UCLA', conf: 'Big 10', posts: 6482, adoption: 7.9, logo: 7.9, mention: 0, collab: 0 },
  { name: 'Creighton', conf: 'Big East', posts: 2553, adoption: 7.4, logo: 6.4, mention: 0, collab: 1.25 },
  { name: 'Robert Morris', conf: 'Horizon', posts: 2687, adoption: 7.3, logo: 7.3, mention: 0, collab: 0 },
  { name: 'USC', conf: 'Big 10', posts: 5328, adoption: 6.6, logo: 6.6, mention: 0, collab: 0.01 },
];

const conferenceAvg = { adoption: 30.8, logo: 27.0, mention: 6.6, collab: 1.2 };
const ncaaD1Avg = { adoption: 31.4, logo: 28.1, mention: 6.5, collab: 1.3 };
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

  // Get data for selected sport and signal
  const currentSportData = selectedSport === 'ALL_SPORTS' ? undefined : sportData[selectedSport];
  const currentSignalData = currentSportData?.[selectedSignal];

  // Use sport-specific data if available, otherwise fall back to overall data
  const withoutEngRate = currentSignalData?.without?.engagementRate || currentSignal?.data?.baselineEngRate || 0;
  const withEngRate = currentSignalData?.with?.engagementRate || currentSignal?.data?.engagementRate || 0;
  const withoutPosts = currentSignalData?.without?.posts || currentSignal?.data?.baselinePosts || 0;
  const withPosts = currentSignalData?.with?.posts || currentSignal?.data?.posts || 0;

  // Avg likes/comments per post from sport data
  const baselineAvgLikes = currentSignalData?.without?.avgLikes || currentSignal?.data?.baselineLikes || 0;
  const baselineAvgComments = currentSignalData?.without?.avgComments || currentSignal?.data?.baselineComments || 0;
  const withAvgLikes = currentSignalData?.with?.avgLikes || currentSignal?.data?.likes || 0;
  const withAvgComments = currentSignalData?.with?.avgComments || currentSignal?.data?.comments || 0;

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

      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ backgroundColor: `${colors.accent}0D`, border: `1px solid ${colors.accent}33`, color: colors.textMuted }}
      >
        Engagement rate is estimated as <span className="font-semibold">(likes + comments) / athlete followers</span> using mapped Ohio athlete follower totals.
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

  const allSorted = useMemo(() => {
    const result = [...ipData.partnerships];
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
  }, [sortKey, sortDir]);

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
          {ipData.partnerships.length} partnerships
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
      shortLabel: 'Logo',
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
  const [rankingMetric, setRankingMetric] = useState<'mention' | 'logo' | 'collab'>('mention');
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? big10Schools : ncaaD1Schools;
  const benchmarkLabel = isConference ? 'Big 10' : 'NCAA D1';
  const metricOptions: { id: 'mention' | 'logo' | 'collab'; label: string }[] = [
    { id: 'mention', label: 'Mention %' },
    { id: 'logo', label: 'Visual IP %' },
    { id: 'collab', label: 'Collaboration %' },
  ];
  const metricLabels = {
    mention: 'Mention Rate',
    logo: 'Visual IP Rate',
    collab: 'Collaboration Rate',
  } as const;
  const metricAverage = {
    mention: isConference ? conferenceAvg.mention : ncaaD1Avg.mention,
    logo: isConference ? conferenceAvg.logo : ncaaD1Avg.logo,
    collab: isConference ? conferenceAvg.collab : ncaaD1Avg.collab,
  };

  const rankedSchools = useMemo(() => {
    const sorted = [...schools].sort((a, b) => {
      const aValue = a[rankingMetric];
      const bValue = b[rankingMetric];
      return bValue - aValue;
    });
    return sorted;
  }, [schools, rankingMetric]);

  const ohioIndex = rankedSchools.findIndex((school) => school.name === 'Ohio State');
  const ohioRank = ohioIndex >= 0 ? ohioIndex + 1 : null;
  const ohioSchool = rankedSchools.find((school) => school.name === 'Ohio State') ?? null;
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
            <p className="text-4xl font-black text-gray-900">{ohioValue}%</p>
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: deltaVsAvg >= 0 ? colors.positive : colors.negative }}
            >
              {deltaVsAvg >= 0 ? '\u2191' : '\u2193'} {Math.abs(deltaVsAvg).toFixed(rankingMetric === 'collab' ? 2 : 1)}%
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs {avgValue}% {benchmarkLabel.toLowerCase()} average</p>
        </GlassCard>

        <div className="rounded-xl border-2 p-5" style={{ borderColor: colors.positive, backgroundColor: `${colors.positive}08` }}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4" style={{ color: colors.positive }} />
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: colors.positive }}>Key Insight</p>
          </div>
          <p className="text-sm text-gray-700">
            {topSchool
              ? <>Current leader is <span className="font-semibold">{topSchool.name}</span> at {topSchool[rankingMetric]}%. Ohio State is {ohioRank ? `#${ohioRank}` : 'unranked'} with {ohioValue}%.</>
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
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell">Posts</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white">{metricLabels[rankingMetric]}</th>
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
                    <td className="px-4 py-3 text-right text-gray-600 hidden md:table-cell">{formatNumber(school.posts)}</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: isOSU ? colors.scarlet : colors.text }}>
                      {school[rankingMetric]}%
                    </td>
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
        try {
          const rosterRes = await fetch('/data/socialMedia.roster_contents (8).json');
          if (rosterRes.ok) {
            const rosterData = (await rosterRes.json()) as any[];
            athleteRows = rosterData.filter((row) => ['Ohio State', 'Ohio'].includes(row?.athlete?.school?.name));
          }
        } catch {
          // fall through to NCAA source
        }

        if (athleteRows.length === 0) {
          const ncaaRes = await fetch('/data/NCAA_contents (2).json');
          if (ncaaRes.ok) {
            const ncaaData = (await ncaaRes.json()) as any[];
            athleteRows = ncaaData.filter((row) => ['Ohio State', 'Ohio'].includes(row?.athlete?.school?.name));
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

  const renderAthleteRow = (post: AthletePostItem, rank: number) => (
    <a
      key={post.id}
      className="rounded-xl border p-3 sm:p-4 bg-white"
      style={{ borderColor: colors.glassBorder }}
      href={post.postLink || undefined}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-start gap-3">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: rank <= 3 ? colors.scarlet : '#e5e7eb', color: rank <= 3 ? '#fff' : colors.textMuted }}
        >
          {rank}
        </span>
        <div className="w-20 sm:w-24 flex-shrink-0">
          {renderThumbnail(post.thumbnail, post.athleteName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate" style={{ color: colors.text }}>{post.athleteName}</p>
          <p className="text-xs text-gray-500 mt-0.5">{post.dateLabel}</p>
          {post.caption && (
            <p className="text-xs mt-1.5 line-clamp-2" style={{ color: colors.textMuted }}>
              {post.caption}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{formatNumber(post.interactions)} interactions</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{formatCurrency(post.emv)} EMV</span>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: post.lift >= 0 ? `${colors.positive}15` : `${colors.negative}15`,
                color: post.lift >= 0 ? colors.positive : colors.negative,
              }}
            >
              {formatDelta(post.lift)} lift
            </span>
            <span className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.scarlet}12`, color: colors.scarlet }}>
              {post.ipSignal}
            </span>
          </div>
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
                    className="rounded-xl border p-3 sm:p-4 bg-white block"
                    style={{ borderColor: colors.glassBorder }}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: idx < 3 ? colors.scarlet : '#e5e7eb', color: idx < 3 ? '#fff' : colors.textMuted }}
                      >
                        {idx + 1}
                      </span>
                      <div className="w-20 sm:w-24 flex-shrink-0">{renderThumbnail(post.thumbnail, post.teamName)}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate" style={{ color: colors.text }}>{post.teamName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{post.dateLabel}</p>
                        {post.caption && (
                          <p className="text-xs mt-1.5 line-clamp-2" style={{ color: colors.textMuted }}>
                            {post.caption}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{formatNumber(post.interactions)} interactions</span>
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{formatPercent(post.engagementRate)} engagement</span>
                        </div>
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
