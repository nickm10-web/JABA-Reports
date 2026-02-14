import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  primary: '#0033A0',
  primaryDark: '#002266',
  primaryLight: '#1a5cc8',
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

interface KentuckyRosterMetricWindow {
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

interface KentuckyRosterTeam {
  sport?: string;
  metrics?: {
    thirtyDays?: KentuckyRosterMetricWindow;
    sevenDays?: KentuckyRosterMetricWindow;
    ninetyDays?: KentuckyRosterMetricWindow;
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

function buildSportDataFromRoster(rows: KentuckyRosterTeam[]): SportSignalData {
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
// KENTUCKY IP DATA (Source of Truth)
// ═══════════════════════════════════════════════════════════════
const ipData = {
  totalFollowers: 1671393,
  totalPosts: 2900,
  totalLikes: 4214185,
  totalComments: 119182,
  engagementRate: 0.001,
  baseline: { posts: 1350, engagementRate: 0.001 },
  postsWithIP: 1550,
  ipAdoptionRate: 53.4,
  avgLift: 66.6,
  totalEmv: 2285866,
  collaboration: {
    posts: 194, likes: 4692.08, comments: 52.85,
    engagementRate: 0.3528, delta: 94.35, emv: 470609,
    baselineEngRate: 0.1815, baselinePosts: 2706,
    baselineLikes: 1220.96, baselineComments: 40.25,
  } as IPSignalData,
  logo: {
    posts: 1363, likes: 2093.74, comments: 47.11,
    engagementRate: 0.2431, delta: 61.63, emv: 1503426,
    baselineEngRate: 0.1504, baselinePosts: 1537,
    baselineLikes: 885.11, baselineComments: 35.76,
  } as IPSignalData,
  mention: {
    posts: 396, likes: 2508.94, comments: 37.52,
    engagementRate: 0.3115, delta: 70.24, emv: 278316,
    baselineEngRate: 0.1830, baselinePosts: 2504,
    baselineLikes: 1286.20, baselineComments: 41.66,
  } as IPSignalData,
  partnerships: [
    { brand: "@starcitytalentmgmt", posts: 1, avgLikes: 12268, avgComments: 78, emv: 6251, engagementRate: 0.0074, liftMultiplier: 6.39 },
    { brand: "@TMobile", posts: 1, avgLikes: 4668, avgComments: 17, emv: 2359.5, engagementRate: 0.0028, liftMultiplier: 1.80 },
    { brand: "@blackouttransportation", posts: 2, avgLikes: 1944, avgComments: 27.5, emv: 2026.5, engagementRate: 0.0012, liftMultiplier: 0.18 },
    { brand: "@allstate", posts: 2, avgLikes: 2151, avgComments: 7.5, emv: 2173.5, engagementRate: 0.0013, liftMultiplier: 0.30 },
    { brand: "@paulmillerford", posts: 5, avgLikes: 824.6, avgComments: 4.4, emv: 2094.5, engagementRate: 0.0005, liftMultiplier: -0.50 },
    { brand: "@drinkaccelerator", posts: 3, avgLikes: 702.67, avgComments: 11, emv: 1103.5, engagementRate: 0.0004, liftMultiplier: -0.57 },
    { brand: "@paulmillerky", posts: 2, avgLikes: 1012.5, avgComments: 11.5, emv: 1047, engagementRate: 0.0006, liftMultiplier: -0.39 },
    { brand: "@betterblendofficial", posts: 4, avgLikes: 448, avgComments: 10.25, emv: 957.5, engagementRate: 0.0003, liftMultiplier: -0.73 },
    { brand: "@masasakegrill", posts: 2, avgLikes: 878.5, avgComments: 27.5, emv: 961, engagementRate: 0.0005, liftMultiplier: -0.46 },
    { brand: "@underarmour", posts: 1, avgLikes: 1343, avgComments: 26, emv: 710.5, engagementRate: 0.0008, liftMultiplier: -0.18 },
    { brand: "@kentuckybranded", posts: 1, avgLikes: 1141, avgComments: 6, emv: 579.5, engagementRate: 0.0007, liftMultiplier: -0.31 },
    { brand: "@kentucky.thread", posts: 10, avgLikes: 100.7, avgComments: 1.1, emv: 520, engagementRate: 0.0001, liftMultiplier: -0.94 },
    { brand: "@coach", posts: 2, avgLikes: 490, avgComments: 8, emv: 514, engagementRate: 0.0003, liftMultiplier: -0.70 },
    { brand: "@saintthejeweler", posts: 2, avgLikes: 488, avgComments: 26, emv: 566, engagementRate: 0.0003, liftMultiplier: -0.69 },
    { brand: "@playabowlslexington", posts: 3, avgLikes: 241, avgComments: 4, emv: 379.5, engagementRate: 0.0001, liftMultiplier: -0.85 },
    { brand: "@specialteamsu", posts: 2, avgLikes: 353.5, avgComments: 6, emv: 371.5, engagementRate: 0.0002, liftMultiplier: -0.78 },
    { brand: "@kaizen_luxurylife", posts: 1, avgLikes: 694, avgComments: 47, emv: 417.5, engagementRate: 0.0004, liftMultiplier: -0.56 },
    { brand: "@the15club_nil", posts: 1, avgLikes: 628, avgComments: 4, emv: 320, engagementRate: 0.0004, liftMultiplier: -0.62 },
    { brand: "@iFOLIO", posts: 1, avgLikes: 556, avgComments: 1, emv: 279.5, engagementRate: 0.0003, liftMultiplier: -0.67 },
    { brand: "@brucewaltersford", posts: 1, avgLikes: 555, avgComments: 5, emv: 285, engagementRate: 0.0003, liftMultiplier: -0.66 },
    { brand: "@cjwrks", posts: 1, avgLikes: 499, avgComments: 15, emv: 272, engagementRate: 0.0003, liftMultiplier: -0.69 },
    { brand: "@athletesthread", posts: 4, avgLikes: 117.5, avgComments: 7.25, emv: 278.5, engagementRate: 0.0001, liftMultiplier: -0.93 },
    { brand: "@mossyoak", posts: 3, avgLikes: 140.33, avgComments: 2.67, emv: 222.5, engagementRate: 0.0001, liftMultiplier: -0.91 },
    { brand: "@clarkspumpnshop", posts: 1, avgLikes: 371, avgComments: 11, emv: 202, engagementRate: 0.0002, liftMultiplier: -0.77 },
    { brand: "@donathletics", posts: 1, avgLikes: 370, avgComments: 8, emv: 197, engagementRate: 0.0002, liftMultiplier: -0.77 },
    { brand: "@drinkolipop", posts: 1, avgLikes: 334, avgComments: 6, emv: 176, engagementRate: 0.0002, liftMultiplier: -0.80 },
    { brand: "@rallys", posts: 1, avgLikes: 310, avgComments: 18, emv: 182, engagementRate: 0.0002, liftMultiplier: -0.80 },
    { brand: "@jamesmonroehomes", posts: 1, avgLikes: 305, avgComments: 2, emv: 155.5, engagementRate: 0.0002, liftMultiplier: -0.82 },
    { brand: "@fallrockoutdoors", posts: 1, avgLikes: 255, avgComments: 6, emv: 136.5, engagementRate: 0.0002, liftMultiplier: -0.84 },
    { brand: "@apsportsagency", posts: 1, avgLikes: 235, avgComments: 2, emv: 120.5, engagementRate: 0.0001, liftMultiplier: -0.86 },
    { brand: "@drinkpoppi", posts: 1, avgLikes: 231, avgComments: 15, emv: 138, engagementRate: 0.0001, liftMultiplier: -0.85 },
    { brand: "@woodhousedayspa_lexington", posts: 1, avgLikes: 214, avgComments: 9, emv: 120.5, engagementRate: 0.0001, liftMultiplier: -0.87 },
    { brand: "@communitytrustbank", posts: 1, avgLikes: 182, avgComments: 1, emv: 92.5, engagementRate: 0.0001, liftMultiplier: -0.89 },
    { brand: "@sephora", posts: 1, avgLikes: 169, avgComments: 11, emv: 101, engagementRate: 0.0001, liftMultiplier: -0.89 },
    { brand: "@myplayerathlete", posts: 2, avgLikes: 80, avgComments: 0.5, emv: 81.5, engagementRate: 0.00005, liftMultiplier: -0.95 },
    { brand: "@fanoutfitters", posts: 1, avgLikes: 159, avgComments: 4, emv: 85.5, engagementRate: 0.0001, liftMultiplier: -0.90 },
    { brand: "@huntwiseapp", posts: 1, avgLikes: 145, avgComments: 3, emv: 77, engagementRate: 0.0001, liftMultiplier: -0.91 },
    { brand: "@myplayersports", posts: 2, avgLikes: 67.5, avgComments: 3, emv: 76.5, engagementRate: 0.00004, liftMultiplier: -0.96 },
    { brand: "@nfldraftdiamonds", posts: 1, avgLikes: 127, avgComments: 12, emv: 81.5, engagementRate: 0.0001, liftMultiplier: -0.92 },
    { brand: "@jackbennett.24", posts: 1, avgLikes: 126, avgComments: 1, emv: 64.5, engagementRate: 0.0001, liftMultiplier: -0.92 },
    { brand: "@betterblend", posts: 1, avgLikes: 116, avgComments: 4, emv: 64, engagementRate: 0.0001, liftMultiplier: -0.93 },
    { brand: "@woglosportswear", posts: 1, avgLikes: 101, avgComments: 3, emv: 55, engagementRate: 0.0001, liftMultiplier: -0.94 },
    { brand: "@youngla", posts: 1, avgLikes: 95, avgComments: 2, emv: 50.5, engagementRate: 0.0001, liftMultiplier: -0.94 },
    { brand: "@taliacotter", posts: 1, avgLikes: 84, avgComments: 2, emv: 45, engagementRate: 0.0001, liftMultiplier: -0.95 },
    { brand: "@athleticcosmetic", posts: 1, avgLikes: 83, avgComments: 1, emv: 43, engagementRate: 0.0001, liftMultiplier: -0.95 },
    { brand: "@wku.nil.store", posts: 1, avgLikes: 51, avgComments: 0, emv: 25.5, engagementRate: 0.00003, liftMultiplier: -0.97 },
    { brand: "@cheswecan", posts: 1, avgLikes: 38, avgComments: 2, emv: 22, engagementRate: 0.00002, liftMultiplier: -0.98 },
    { brand: "@kycauses", posts: 2, avgLikes: 3, avgComments: 2.5, emv: 10.5, engagementRate: 0.000003, liftMultiplier: -1.00 },
    { brand: "@lensmartonline", posts: 1, avgLikes: 3, avgComments: 7, emv: 12, engagementRate: 0.000006, liftMultiplier: -0.99 },
    { brand: "@iraaustiniv", posts: 1, avgLikes: 3, avgComments: 1, emv: 3, engagementRate: 0.000002, liftMultiplier: -1.00 },
    { brand: "@macandclay", posts: 1, avgLikes: 0, avgComments: 15, emv: 22.5, engagementRate: 0.000009, liftMultiplier: -0.99 },
    { brand: "@lovbatl", posts: 1, avgLikes: 0, avgComments: 20, emv: 30, engagementRate: 0.000012, liftMultiplier: -0.99 },
    { brand: "@thoroughbredautowash", posts: 1, avgLikes: 0, avgComments: 13, emv: 19.5, engagementRate: 0.000008, liftMultiplier: -0.99 },
    { brand: "@onlyfreshdesigns", posts: 2, avgLikes: 0, avgComments: 1, emv: 3, engagementRate: 0.0000006, liftMultiplier: -1.00 },
    { brand: "turbotax", posts: 2, avgLikes: 0, avgComments: 18.5, emv: 55.5, engagementRate: 0.000011, liftMultiplier: -0.99 },
  ] as Partnership[],
};

// ═══════════════════════════════════════════════════════════════
// ATHLETE & BENCHMARK DATA
// ═══════════════════════════════════════════════════════════════
const fallbackSportData: Record<string, Record<string, { with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number }; without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number } }>> = {
  'ALL_SPORTS': {
    mention: { with: { posts: 396, avgLikes: 2509, avgComments: 38, engagementRate: 0.0015 }, without: { posts: 2504, avgLikes: 1286, avgComments: 42, engagementRate: 0.0009 } },
    logo: { with: { posts: 1363, avgLikes: 2094, avgComments: 47, engagementRate: 0.0013 }, without: { posts: 1537, avgLikes: 885, avgComments: 36, engagementRate: 0.0008 } },
    collab: { with: { posts: 194, avgLikes: 4692, avgComments: 53, engagementRate: 0.0028 }, without: { posts: 2706, avgLikes: 1221, avgComments: 40, engagementRate: 0.0009 } }
  }
};

const fallbackTeamFollowersBySport: Record<string, number> = {};

const secSchools = [
  { name: 'Kentucky', conf: 'SEC', followers: 1671393, posts: 2900, ipPosts: 1550, adoption: 53.4, logo: 47.0, mention: 13.7, collab: 6.7 },
  { name: 'Texas A&M', conf: 'SEC', followers: 1878601, posts: 4316, ipPosts: 2220, adoption: 51.4, logo: 15.4, mention: 24.5, collab: 0 },
  { name: 'Auburn', conf: 'SEC', followers: 2323541, posts: 6405, ipPosts: 3079, adoption: 48.1, logo: 12.3, mention: 25.9, collab: 0.4 },
  { name: 'LSU', conf: 'SEC', followers: 5170563, posts: 5454, ipPosts: 2514, adoption: 46.1, logo: 10.1, mention: 18.6, collab: 0 },
  { name: 'Oklahoma', conf: 'SEC', followers: 0, posts: 2813, ipPosts: 1283, adoption: 45.6, logo: 45.6, mention: 0, collab: 0 },
  { name: 'Ole Miss', conf: 'SEC', followers: 0, posts: 2309, ipPosts: 1004, adoption: 43.5, logo: 43.1, mention: 0, collab: 1.3 },
  { name: 'Missouri', conf: 'SEC', followers: 0, posts: 5726, ipPosts: 2421, adoption: 42.3, logo: 35.5, mention: 20.1, collab: 1.9 },
  { name: 'Alabama', conf: 'SEC', followers: 0, posts: 5742, ipPosts: 2322, adoption: 40.4, logo: 33.0, mention: 16.7, collab: 2.5 },
  { name: 'Arkansas', conf: 'SEC', followers: 0, posts: 5711, ipPosts: 2090, adoption: 36.6, logo: 31.1, mention: 10.3, collab: 0.9 },
  { name: 'Mississippi State', conf: 'SEC', followers: 0, posts: 2239, ipPosts: 770, adoption: 34.4, logo: 34.3, mention: 0, collab: 0 },
  { name: 'Vanderbilt', conf: 'SEC', followers: 0, posts: 2246, ipPosts: 673, adoption: 30.0, logo: 29.2, mention: 0, collab: 1.1 },
  { name: 'Texas', conf: 'SEC', followers: 0, posts: 6196, ipPosts: 1635, adoption: 26.4, logo: 27.1, mention: 0, collab: 0 },
  { name: 'Georgia', conf: 'SEC', followers: 0, posts: 5376, ipPosts: 797, adoption: 14.8, logo: 12.7, mention: 0, collab: 0 },
  { name: 'Tennessee', conf: 'SEC', followers: 0, posts: 2459, ipPosts: 340, adoption: 13.8, logo: 12.4, mention: 0, collab: 1.7 },
  { name: 'Florida', conf: 'SEC', followers: 0, posts: 2735, ipPosts: 347, adoption: 12.7, logo: 12.6, mention: 0, collab: 0 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1564, adoption: 56.7, logo: 53.5, mention: 14.6, collab: 1.34 },
  { name: 'Nebraska', conf: 'Big 10', posts: 3049, adoption: 54.3, logo: 49.1, mention: 20.2, collab: 0 },
  { name: 'Miami', conf: 'ACC', posts: 1553, adoption: 53.8, logo: 53.8, mention: 0, collab: 0 },
  { name: 'Kentucky', conf: 'SEC', posts: 2900, adoption: 53.4, logo: 47.0, mention: 13.7, collab: 6.7 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 53.2, logo: 50.2, mention: 21.6, collab: 4.56 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 52.9, logo: 52.3, mention: 0, collab: 1.18 },
  { name: 'Indiana', conf: 'Big 10', posts: 1635, adoption: 50.8, logo: 50.8, mention: 0, collab: 0 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.0, logo: 50.0, mention: 0, collab: 0.09 },
  { name: 'Virginia Tech', conf: 'SEC', posts: 3735, adoption: 49.6, logo: 45.9, mention: 16.0, collab: 0.10 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.6, logo: 47.2, mention: 0, collab: 3.97 },
  { name: 'Ohio State', conf: 'Big 10', posts: 9629, adoption: 48.4, logo: 44.2, mention: 20.1, collab: 1.2 },
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

const conferenceAvg = { adoption: 36.0, logo: 26.8, mention: 8.7, collab: 1.1 };
const ncaaD1Avg = { adoption: 31.7, logo: 28.5, mention: 6.7, collab: 1.3 };
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

// --- UI COMPONENTS AND TABS (Parts 1-3 go here) ---

// Two-tone header component
function SectionHeader({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <h2 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
      <span style={{ color: colors.primary }}>{primary}</span>
      <span style={{ color: colors.headerGray }}>{secondary}</span>
    </h2>
  );
}

// Tooltip component
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
      style={{ backgroundColor: colors.primary, transition }}
    >
      <div className="absolute top-3 right-3 opacity-20">{icon}</div>
      <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-2">{label}</p>
      <p className="text-3xl md:text-4xl font-black text-white mb-1">{value}</p>
      <p className="text-xs text-white/80">{subtitle}</p>
    </div>
  );
}

// IP Mode Card component
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
            style={{ backgroundColor: `${colors.primary}15` }}
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
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Engagement Delta vs Baseline
          </p>
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
            <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold mb-0.5" style={{ color: colors.primary }}>
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

// Tab definitions
type TabId = 'overview' | 'withvswithout' | 'partnerships' | 'benchmark' | 'content' | 'teampages';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'withvswithout', label: 'IP Comparison' },
  { id: 'partnerships', label: 'Sponsored Posts' },
  { id: 'benchmark', label: 'Rankings' },
  { id: 'content', label: 'Content' },
  { id: 'teampages', label: 'Team Socials' },
];

// ═══════════════════════════════════════════════════════════════
// PLACEHOLDER TABS (Parts 1-3 -- to be filled by other agents)
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
        style={{ borderTop: `2px solid ${colors.primary}` }}
      >
        <h1
          style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
          className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2"
        >
          <span style={{ color: colors.primary }}>Kentucky </span>
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
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Collaboration posts drive{' '}
                <span className="font-bold" style={{ color: colors.primary }}>
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
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Kentucky ranks{' '}
                <span className="font-bold" style={{ color: colors.primary }}>#2 in SEC</span> for IP adoption at{' '}
                <span className="font-bold" style={{ color: colors.primary }}>{overview.ipAdoptionRate}%</span>, trailing only Texas A&M (51.4%).
              </p>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold">{formatNumber(overview.postsWithIP)} posts</span> ({overview.ipAdoptionRate}%) feature Kentucky IP,
                generating{' '}
                <span className="font-bold" style={{ color: colors.primary }}>
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
            icon={<Handshake className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.collaboration.posts}
            delta={overview.collaboration.delta}
            avgEngagement={formatPercent(overview.collaboration.engagementRate)}
            emv={formatCurrency(collabEMV)}
            tooltip="Athlete posts co-authored or tagged with official Kentucky account"
            opportunity={`Only ${formatNumber(overview.collaboration.posts)} collab posts exist. Scaling collaborations could significantly amplify total EMV.`}
          />
          <IPModeCard
            title="Visual IP"
            icon={<Camera className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.logo.posts}
            delta={overview.logo.delta}
            avgEngagement={formatPercent(overview.logo.engagementRate)}
            emv={formatCurrency(logoEMV)}
            tooltip="Athlete posts with Kentucky logo detected in media"
            opportunity={`${formatNumber(overview.logo.posts)} posts feature Kentucky logos. Visual IP is the most common signal and a strong engagement driver.`}
          />
          <IPModeCard
            title="Mention"
            icon={<AtSign className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.mention.posts}
            delta={overview.mention.delta}
            avgEngagement={formatPercent(overview.mention.engagementRate)}
            emv={formatCurrency(mentionEMV)}
            tooltip="Athlete posts with @mention or text reference to Kentucky"
            opportunity={`${formatNumber(overview.mention.posts)} posts mention Kentucky in captions, driving +${overview.mention.delta.toFixed(1)}% engagement lift. Encouraging athletes to tag Kentucky team pages in captions could amplify this further.`}
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
            Data reflects <span className="font-semibold">Kentucky athlete personal social media accounts</span>, not official team pages.
            Metrics track how athletes use Kentucky IP (logos, mentions, collaborations) in their own content. Analysis covers{' '}
            <span className="font-semibold">{formatNumber(overview.totalPosts)} posts</span> from{' '}
            <span className="font-semibold">{formatNumber(ipData.totalFollowers)} combined followers</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function WithVsWithoutTab({
  sportData,
  overviewData,
}: {
  sportData: SportSignalData;
  overviewData?: OverviewData | null;
}) {
  const [selectedSignal, setSelectedSignal] = useState<'collab' | 'logo' | 'mention'>('logo');
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

  const currentSportData = selectedSport === 'ALL_SPORTS' ? undefined : sportData[selectedSport];
  const currentSignalData = currentSportData?.[selectedSignal];

  const withoutEngRate = currentSignalData?.without?.engagementRate || currentSignal?.data?.baselineEngRate || 0;
  const withEngRate = currentSignalData?.with?.engagementRate || currentSignal?.data?.engagementRate || 0;
  const withoutPosts = currentSignalData?.without?.posts || currentSignal?.data?.baselinePosts || 0;
  const withPosts = currentSignalData?.with?.posts || currentSignal?.data?.posts || 0;

  const baselineAvgLikes = currentSignalData?.without?.avgLikes || currentSignal?.data?.baselineLikes || 0;
  const baselineAvgComments = currentSignalData?.without?.avgComments || currentSignal?.data?.baselineComments || 0;
  const withAvgLikes = currentSignalData?.with?.avgLikes || currentSignal?.data?.likes || 0;
  const withAvgComments = currentSignalData?.with?.avgComments || currentSignal?.data?.comments || 0;

  const engDelta = withoutEngRate > 0 ? ((withEngRate - withoutEngRate) / withoutEngRate) * 100 : 0;
  const likesDelta = baselineAvgLikes > 0 ? ((withAvgLikes - baselineAvgLikes) / baselineAvgLikes) * 100 : 0;
  const commentsDelta = baselineAvgComments > 0 ? ((withAvgComments - baselineAvgComments) / baselineAvgComments) * 100 : 0;

  const getMetricValues = () => {
    switch (selectedMetric) {
      case 'engagement':
        return { withoutValue: formatPercent(withoutEngRate), withValue: formatPercent(withEngRate), delta: engDelta };
      case 'likes':
        return { withoutValue: formatNumber(Math.round(baselineAvgLikes)), withValue: formatNumber(Math.round(withAvgLikes)), delta: likesDelta };
      case 'comments':
        return { withoutValue: formatNumber(Math.round(baselineAvgComments)), withValue: formatNumber(Math.round(withAvgComments)), delta: commentsDelta };
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
        <p className="text-2xl md:text-3xl font-black leading-tight" style={{ color: colors.text }}>
          Posts with Kentucky {currentSignal?.label.toLowerCase()} drive{' '}
          <span style={{ color: colors.primary }}>{formatDelta(engDelta)}</span> higher engagement rate.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${colors.primary}12`, color: colors.primary }}
          >
            {formatSportLabel(selectedSport)}
          </span>
          <span className="text-xs text-gray-500">Signal: {currentSignal?.label}</span>
        </div>
      </div>

      <div
        className="rounded-xl px-4 py-3 text-xs"
        style={{ backgroundColor: `${colors.accent}0D`, border: `1px solid ${colors.accent}33`, color: colors.textMuted }}
      >
        Engagement rate is estimated as <span className="font-semibold">(likes + comments) / athlete followers</span> using mapped Kentucky athlete follower totals.
      </div>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Team / Sport</p>
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2.5 pr-10 text-sm font-semibold rounded-xl border appearance-none cursor-pointer"
              style={{ backgroundColor: colors.white, color: colors.text, borderColor: colors.glassBorder, transition }}
            >
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">IP Signal</p>
          <div className="inline-flex rounded-xl p-1" style={{ backgroundColor: colors.lightBg, border: `1px solid ${colors.glassBorder}` }}>
            {signals.map((signal) => {
              const isActive = selectedSignal === signal.id;
              return (
                <button
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal.id)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all motion-reduce:transition-none"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` : 'transparent',
                    color: isActive ? colors.white : colors.textMuted,
                    boxShadow: isActive ? '0 2px 8px rgba(0, 51, 160, 0.28)' : 'none',
                  }}
                >
                  {signal.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Metric</p>
          <SegmentedToggle options={metrics} value={selectedMetric} onChange={setSelectedMetric} />
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
              borderColor: `${colors.primary}55`,
              background: `linear-gradient(180deg, ${colors.primary}08 0%, ${colors.primary}12 100%)`,
              boxShadow: '0 10px 26px rgba(0, 51, 160, 0.16)',
            }}
          >
            <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: colors.primary }}>Lift Highlight</p>
            <p className="text-5xl font-black" style={{ color: colors.primary }}>{formatDelta(metricValues.delta)}</p>
            <p className="text-xs text-gray-500 mt-1">With vs Without</p>
          </div>

          <div className="md:col-span-4 rounded-xl border p-4 bg-white" style={{ borderColor: colors.glassBorder }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: colors.primary }}>With {currentSignal?.label}</p>
            <p className="text-3xl font-black" style={{ color: colors.primary }}>{metricValues.withValue}</p>
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
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Metric</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Without {currentSignal?.label}</th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <span className="inline-flex items-center justify-end gap-1">
                    With {currentSignal?.label}
                    <Tooltip content={`Sample size: ${formatNumber(withPosts)} with-signal posts vs ${formatNumber(withoutPosts)} without-signal posts.`}>
                      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600">Lift</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Engagement Rate', icon: <TrendingUp className="w-4 h-4 text-gray-400" />, without: formatPercent(withoutEngRate), withVal: formatPercent(withEngRate), delta: engDelta },
                { label: 'Avg Likes per Post', icon: <Heart className="w-4 h-4 text-gray-400" />, without: formatNumber(Math.round(baselineAvgLikes)), withVal: formatNumber(Math.round(withAvgLikes)), delta: likesDelta },
                { label: 'Avg Comments per Post', icon: <MessageCircle className="w-4 h-4 text-gray-400" />, without: formatNumber(Math.round(baselineAvgComments)), withVal: formatNumber(Math.round(withAvgComments)), delta: commentsDelta },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">{row.icon}<span className="font-semibold text-gray-900">{row.label}</span></div>
                  </td>
                  <td className="px-5 py-4 text-right text-gray-600">{row.without}</td>
                  <td className="px-5 py-4 text-right font-semibold text-gray-900">{row.withVal}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold"
                        style={{
                          backgroundColor: row.delta >= 0 ? `${colors.positive}15` : `${colors.negative}15`,
                          color: row.delta >= 0 ? colors.positive : colors.negative,
                        }}
                      >
                        {formatDelta(row.delta)}
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full" style={{ width: `${getLiftBarWidth(row.delta)}%`, backgroundColor: row.delta >= 0 ? colors.positive : colors.negative }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /><span className="font-semibold text-gray-900">Post Volume</span></div>
                </td>
                <td className="px-5 py-4 text-right text-gray-600">{formatNumber(withoutPosts)} posts</td>
                <td className="px-5 py-4 text-right font-semibold text-gray-900">{formatNumber(withPosts)} posts</td>
                <td className="px-5 py-4 text-right">
                  <span className="text-xs text-gray-500">{((withPosts / (withPosts + withoutPosts)) * 100).toFixed(1)}% of total</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

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
          if (key && !nextMap[key]) nextMap[key] = row.logo;
        }
        if (!canceled) setBrandLogoMap(nextMap);
      } catch { /* keep initials fallback */ }
    };
    loadBrandLogos();
    return () => { canceled = true; };
  }, []);

  const sortOptions: { key: keyof Partnership; label: string; icon: React.ReactNode }[] = [
    { key: 'emv', label: 'EMV', icon: <DollarSign className="w-3.5 h-3.5" /> },
    { key: 'avgLikes', label: 'Avg Likes', icon: <Heart className="w-3.5 h-3.5" /> },
    { key: 'avgComments', label: 'Avg Comments', icon: <MessageCircle className="w-3.5 h-3.5" /> },
    { key: 'liftMultiplier', label: 'Eng Lift', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: 'posts', label: 'Posts', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const getPartnershipEMV = (p: Partnership): number =>
    calculateEMV(p.avgLikes * p.posts, p.avgComments * p.posts);

  const allSorted = useMemo(() => {
    const result = [...ipData.partnerships];
    result.sort((a, b) => {
      if (sortKey === 'emv') {
        return sortDir === 'desc' ? getPartnershipEMV(b) - getPartnershipEMV(a) : getPartnershipEMV(a) - getPartnershipEMV(b);
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return sortDir === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
    });
    return result;
  }, [sortKey, sortDir]);

  const top10 = allSorted.slice(0, 10);

  const filteredAndSorted = useMemo(() => {
    if (!searchTerm) return [...allSorted];
    const term = searchTerm.toLowerCase();
    return allSorted.filter((p) => p.brand.toLowerCase().includes(term));
  }, [allSorted, searchTerm]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: keyof Partnership) => {
    if (sortKey === key) { setSortDir(sortDir === 'desc' ? 'asc' : 'desc'); }
    else { setSortKey(key); setSortDir('desc'); }
    setCurrentPage(1);
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Partnership }) => {
    if (sortKey !== columnKey) return null;
    return sortDir === 'desc' ? <ChevronDown className="w-3.5 h-3.5 inline ml-0.5" /> : <ChevronUp className="w-3.5 h-3.5 inline ml-0.5" />;
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
                  backgroundColor: sortKey === option.key ? colors.primary : 'transparent',
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

        {/* Desktop: 2x5 grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-3">
          {top10.map((partner, idx) => (
            <div
              key={partner.brand}
              className="rounded-2xl p-4 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden group"
              style={{
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)',
                borderLeft: idx < 3 ? `4px solid ${colors.primary}` : '4px solid transparent',
              }}
            >
              {idx < 3 && (
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" style={{ background: `linear-gradient(135deg, ${colors.primary}, transparent)` }} />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: idx < 3 ? colors.primary : '#e5e7eb', color: idx < 3 ? colors.white : colors.text }}>
                    {idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {getBrandLogo(partner.brand) ? (
                      <img src={getBrandLogo(partner.brand)} alt={partner.brand} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">{getBrandInitials(partner.brand)}</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate flex-1" title={partner.brand}>{partner.brand.replace('@', '')}</p>
                </div>
                <p className="text-2xl font-black" style={{ color: colors.primary }}>{getDisplayValue(partner)}</p>
                <p className="text-xs text-gray-400 mt-1">{partner.posts} {partner.posts === 1 ? 'post' : 'posts'}</p>
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
                style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08)', borderLeft: idx < 3 ? `4px solid ${colors.primary}` : '4px solid transparent' }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: idx < 3 ? colors.primary : '#e5e7eb', color: idx < 3 ? colors.white : colors.text }}>
                    {idx + 1}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {getBrandLogo(partner.brand) ? (
                      <img src={getBrandLogo(partner.brand)} alt={partner.brand} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-500">{getBrandInitials(partner.brand)}</div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-900 truncate flex-1" title={partner.brand}>{partner.brand.replace('@', '')}</p>
                </div>
                <p className="text-xl font-black" style={{ color: colors.primary }}>{getDisplayValue(partner)}</p>
                <p className="text-xs text-gray-400 mt-1">{partner.posts} {partner.posts === 1 ? 'post' : 'posts'}</p>
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
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm w-full sm:w-64 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              style={{ '--tw-ring-color': `${colors.primary}40` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: colors.primary }}>
                  <th className="text-center px-2 py-3.5 text-xs font-semibold uppercase tracking-wider text-white w-12">#</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell" onClick={() => handleSort('brand')}>
                    Partner <SortIcon columnKey="brand" />
                  </th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white md:hidden">Partner</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell" onClick={() => handleSort('posts')}>
                    Posts <SortIcon columnKey="posts" />
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell" onClick={() => handleSort('avgLikes')}>
                    Avg Likes <SortIcon columnKey="avgLikes" />
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell" onClick={() => handleSort('avgComments')}>
                    Avg Comments <SortIcon columnKey="avgComments" />
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell" style={{ color: sortKey === 'emv' ? '#fcd34d' : '#ffffff' }} onClick={() => handleSort('emv')}>
                    EMV <SortIcon columnKey="emv" />
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white cursor-pointer hover:bg-white/10 transition-colors hidden md:table-cell" onClick={() => handleSort('liftMultiplier')}>
                    Eng Lift <SortIcon columnKey="liftMultiplier" />
                  </th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white md:hidden">
                    {sortOptions.find(o => o.key === sortKey)?.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((partnership, index) => {
                  const globalRank = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={partnership.brand} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-2 py-3 text-center">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mx-auto" style={{ backgroundColor: globalRank <= 3 ? colors.primary : '#e5e7eb', color: globalRank <= 3 ? colors.white : colors.textMuted }}>
                          {globalRank}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {getBrandLogo(partnership.brand) ? (
                              <img src={getBrandLogo(partnership.brand)} alt={partnership.brand} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-gray-400">{getBrandInitials(partnership.brand)}</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{partnership.brand}</span>
                        </div>
                      </td>
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
                      <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">{partnership.posts}</td>
                      <td className="px-4 py-3 text-right text-gray-900 hidden md:table-cell">{formatNumber(partnership.avgLikes)}</td>
                      <td className="px-4 py-3 text-right text-gray-900 hidden md:table-cell">{formatNumber(partnership.avgComments)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 hidden md:table-cell">{formatCurrency(getPartnershipEMV(partnership))}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: partnership.liftMultiplier >= 0 ? `${colors.positive}15` : `${colors.negative}15`, color: partnership.liftMultiplier >= 0 ? colors.positive : colors.negative }}>
                          {formatLift(partnership.liftMultiplier)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold md:hidden" style={{ color: colors.primary }}>
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
                if (totalPages <= 5) { page = i + 1; }
                else if (currentPage <= 3) { page = i + 1; }
                else if (currentPage >= totalPages - 2) { page = totalPages - 4 + i; }
                else { page = currentPage - 2 + i; }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                    style={{ backgroundColor: currentPage === page ? colors.primary : 'transparent', color: currentPage === page ? colors.white : colors.textMuted }}
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


function BenchmarkTab() {
  const [benchmarkType, setBenchmarkType] = useState<'conference' | 'ncaa'>('conference');
  const [rankingMetric, setRankingMetric] = useState<'logo' | 'mention' | 'collab'>('logo');
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? secSchools : ncaaD1Schools;
  const benchmarkLabel = isConference ? 'SEC' : 'NCAA D1';
  const metricOptions: { id: 'logo' | 'mention' | 'collab'; label: string }[] = [
    { id: 'logo', label: 'Visual IP %' },
    { id: 'mention', label: 'Mention %' },
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
    return [...schools].sort((a, b) => b[rankingMetric] - a[rankingMetric]);
  }, [schools, rankingMetric]);

  const kyIndex = rankedSchools.findIndex((s) => s.name === 'Kentucky');
  const kyRank = kyIndex >= 0 ? kyIndex + 1 : null;
  const kySchool = rankedSchools.find((s) => s.name === 'Kentucky') ?? null;
  const kyValue = kySchool ? kySchool[rankingMetric] : 0;
  const avgValue = metricAverage[rankingMetric];
  const deltaVsAvg = kyValue - avgValue;
  const topSchool = rankedSchools[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SectionHeader primary="IP " secondary="RANKINGS" />
          <p className="text-sm text-gray-500 mt-2">
            Kentucky vs {benchmarkLabel} schools ranked by {metricLabels[rankingMetric].toLowerCase()}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setBenchmarkType('conference')}
              className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
              style={{
                backgroundColor: isConference ? '#fff' : 'transparent',
                color: isConference ? colors.primary : colors.textMuted,
                boxShadow: isConference ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              SEC
            </button>
            <button
              onClick={() => setBenchmarkType('ncaa')}
              className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
              style={{
                backgroundColor: !isConference ? '#fff' : 'transparent',
                color: !isConference ? colors.primary : colors.textMuted,
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
                borderColor: rankingMetric === option.id ? `${colors.primary}60` : '#d1d5db',
                backgroundColor: rankingMetric === option.id ? `${colors.primary}12` : '#fff',
                color: rankingMetric === option.id ? colors.primary : colors.textMuted,
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Kentucky Rank</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black" style={{ color: colors.primary }}>
              {kyRank ? `#${kyRank}` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mb-1">of {rankedSchools.length}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">{metricLabels[rankingMetric]} vs {benchmarkLabel}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Kentucky Value</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">{kyValue}%</p>
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
              ? <>Current leader is <span className="font-semibold">{topSchool.name}</span> at {topSchool[rankingMetric]}%. Kentucky is {kyRank ? `#${kyRank}` : 'unranked'} with {kyValue}%.</>
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
              <tr style={{ backgroundColor: colors.primary }}>
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
                const isKY = school.name === 'Kentucky';
                return (
                  <tr
                    key={school.name}
                    className={`border-b border-gray-100 transition-colors ${isKY ? 'bg-blue-50 hover:bg-blue-100/50' : idx % 2 === 1 ? 'bg-gray-50/50 hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-3 py-3 text-center">
                      {idx < 3 ? (
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                          style={{
                            backgroundColor: isKY ? colors.primary : '#d1d5db',
                            color: isKY ? colors.white : colors.text,
                          }}
                        >
                          {idx + 1}
                        </span>
                      ) : isKY ? (
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto"
                          style={{ backgroundColor: colors.primary, color: colors.white }}
                        >
                          {idx + 1}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 font-medium">{idx + 1}</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 ${isKY ? 'font-bold' : 'font-semibold'}`} style={{ color: isKY ? colors.primary : colors.text }}>
                      <div className="flex items-center gap-2">
                        {isKY && (
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
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
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: isKY ? colors.primary : colors.text }}>
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
          * Rankings based on {metricLabels[rankingMetric].toLowerCase()} across {rankedSchools.length} {benchmarkLabel} schools.
        </p>
      </div>
    </div>
  );
}

// --- CONTENT, TEAM PAGES TABS, AND MAIN COMPONENT (Part 4) ---

// ═══════════════════════════════════════════════════════════════
// GLASS CARD - White card with blue top accent
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
        borderTop: `2px solid ${colors.primary}`,
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
// SEGMENTED TOGGLE - Premium toggle with blue gradient active
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
                ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
                : 'transparent',
              color: isActive ? colors.white : colors.textMuted,
              transition,
              boxShadow: isActive ? '0 2px 8px rgba(0, 51, 160, 0.3)' : 'none',
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
// CONTENT TAB
// ═══════════════════════════════════════════════════════════════
type ContentView = 'athlete' | 'team';
const MANUAL_WITHOUT_IP_EXCLUDE_IDS = new Set<string>([]);

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
  const [kentuckyTeamPosts, setKentuckyTeamPosts] = useState<TeamPostItem[]>([]);
  const [secTeamPosts, setSecTeamPosts] = useState<TeamPostItem[]>([]);

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
        // Try pre-extracted Kentucky file first, then fall back to larger sources
        for (const source of [
          '/data/kentucky-content-posts.json',
          '/data/socialMedia.roster_contents (8).json',
          '/data/NCAA_contents (2).json',
        ]) {
          if (athleteRows.length > 0) break;
          try {
            const res = await fetch(source);
            if (!res.ok) continue;
            const data = (await res.json()) as any[];
            const filtered = source.includes('kentucky-content-posts')
              ? data
              : data.filter((row) => ['Kentucky', 'UK'].includes(row?.athlete?.school?.name));
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

        const kentuckyTeamRows = (await fetchFirstJson([
          '/data/kentucky_teams_contents.json',
          '/data/Kentucky.team_contents.json',
          '/data/kentucky.team_contents.json',
        ])) || [];
        const normalizedKentuckyTeamPosts: TeamPostItem[] = kentuckyTeamRows.map((post, index) => {
          const likes = Number(post?.metrics?.likes || 0);
          const comments = Number(post?.metrics?.comments || 0);
          return {
            id: String(post?._id || `kentucky-team-${index}`),
            thumbnail: String(post?.url || ''),
            postLink: String(post?.permalink || post?.url || ''),
            caption: getCaptionText(post?.caption || post?.text),
            teamName: String(post?.team?.name || 'Kentucky Team'),
            schoolName: String(post?.team?.school?.name || 'Kentucky'),
            conferenceName: String(post?.team?.conference?.name || 'SEC'),
            dateLabel: parseDateLabel(post?.publishedAt || post?.createdAt),
            interactions: likes + comments,
            engagementRate: Number(post?.metrics?.engagementRate || 0),
          };
        });

        const allTeamRows = (await fetchFirstJson([
          '/data/Team_contents.json',
          '/data/team_contents.json',
        ])) || [];
        const normalizedSECPosts: TeamPostItem[] = allTeamRows
          .filter((post) => post?.team?.conference?.name === 'SEC')
          .map((post, index) => {
            const likes = Number(post?.metrics?.likes || 0);
            const comments = Number(post?.metrics?.comments || 0);
            return {
              id: String(post?._id || `sec-team-${index}`),
              thumbnail: String(post?.url || ''),
              postLink: String(post?.permalink || post?.url || ''),
              caption: getCaptionText(post?.caption || post?.text),
              teamName: String(post?.team?.name || 'Team Page'),
              schoolName: String(post?.team?.school?.name || 'Unknown School'),
              conferenceName: String(post?.team?.conference?.name || 'SEC'),
              dateLabel: parseDateLabel(post?.publishedAt || post?.createdAt),
              interactions: likes + comments,
              engagementRate: Number(post?.metrics?.engagementRate || 0),
            };
          });

        if (!cancelled) {
          setAthletePosts(normalizedAthletePosts);
          setKentuckyTeamPosts(normalizedKentuckyTeamPosts);
          setSecTeamPosts(normalizedSECPosts);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAthletePosts([]);
          setKentuckyTeamPosts([]);
          setSecTeamPosts([]);
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
    return [...rows].sort((a, b) => b.interactions - a.interactions);
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

  const sortedKentuckyTeamPosts = useMemo(() => [...kentuckyTeamPosts].sort((a, b) => b.interactions - a.interactions), [kentuckyTeamPosts]);
  const topKentuckyTeamPost = sortedKentuckyTeamPosts[0];
  const top10KentuckyTeamPosts = sortedKentuckyTeamPosts.slice(0, 10);

  const top10SECTeamPosts = useMemo(
    () => [...secTeamPosts].sort((a, b) => b.interactions - a.interactions).slice(0, 10),
    [secTeamPosts],
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
    minHeight: '148px',
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
              style={{ backgroundColor: rank <= 3 ? colors.primary : '#e5e7eb', color: rank <= 3 ? '#fff' : colors.textMuted }}
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
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.primary}14`, border: `1px solid ${colors.primary}40`, color: colors.primary }}>
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
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-transparent animate-spin" style={{ borderTopColor: colors.primary }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>Loading content performance...</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Pulling athlete and team posts for Kentucky.</p>
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
              {[{ title: 'Best WITH Kentucky IP', post: championWithIP }, { title: 'Best WITHOUT IP', post: championWithoutIP }].map((item) => (
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
                          <p className="font-semibold" style={{ color: colors.primary }}>{item.post.ipSignal}</p>
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

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-3">
            {/* Column headers */}
            <SectionHeader primary="TOP 10 " secondary="ATHLETE POSTS WITH IP" />
            <SectionHeader primary="TOP 10 " secondary="ATHLETE POSTS WITHOUT IP" />

            {/* Interleaved rows so rank N lines up across columns */}
            {Array.from({ length: Math.max(topWithIP.length, topWithoutIP.length, 1) }, (_, idx) => (
              <React.Fragment key={idx}>
                <div>{topWithIP[idx] ? renderAthleteRow(topWithIP[idx], idx + 1) : <p className="text-sm text-gray-500">No with-IP athlete posts available.</p>}</div>
                <div>{topWithoutIP[idx] ? renderAthleteRow(topWithoutIP[idx], idx + 1) : <p className="text-sm text-gray-500">No without-IP athlete posts available.</p>}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Kentucky Team Page Post */}
          <div>
            <SectionHeader primary="TOP KENTUCKY " secondary="TEAM PAGE POST" />
            <div className="mt-4">
              <GlassCard>
                {topKentuckyTeamPost ? (
                  <a
                    href={topKentuckyTeamPost.postLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {renderThumbnail(topKentuckyTeamPost.thumbnail, topKentuckyTeamPost.teamName)}
                    <div className="space-y-3">
                      <p className="font-semibold text-base" style={{ color: colors.text }}>{topKentuckyTeamPost.teamName}</p>
                      <p className="text-xs text-gray-500">{topKentuckyTeamPost.dateLabel}</p>
                      {topKentuckyTeamPost.caption && (
                        <p className="text-sm line-clamp-3" style={{ color: colors.textMuted }}>
                          {topKentuckyTeamPost.caption}
                        </p>
                      )}
                      <p className="text-sm" style={{ color: colors.textMuted }}>{topKentuckyTeamPost.schoolName}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Interactions</p>
                          <p className="font-semibold">{formatNumber(topKentuckyTeamPost.interactions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Engagement Rate</p>
                          <p className="font-semibold">{formatPercent(topKentuckyTeamPost.engagementRate)}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No Kentucky team page posts available.</p>
                )}
              </GlassCard>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top 10 Kentucky Team Page Posts */}
            <div>
              <SectionHeader primary="TOP 10 " secondary="KENTUCKY TEAM PAGE POSTS" />
              <div className="space-y-3 mt-4">
                {top10KentuckyTeamPosts.map((post, idx) => (
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
                            style={{ backgroundColor: idx < 3 ? colors.primary : '#e5e7eb', color: idx < 3 ? '#fff' : colors.textMuted }}
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
                {top10KentuckyTeamPosts.length === 0 && <p className="text-sm text-gray-500">No Kentucky team page posts available.</p>}
              </div>
            </div>

            {/* SEC benchmark */}
            <div>
              <SectionHeader primary="SEC " secondary="TEAM PAGE BENCHMARK" />
              <div className="space-y-3 mt-4">
                {top10SECTeamPosts.map((post, idx) => {
                  const isKentucky = post.schoolName === 'Kentucky';
                  return (
                    <a
                      key={`${post.id}-${idx}`}
                      href={post.postLink || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4"
                      style={{ ...postCardStyle, backgroundColor: isKentucky ? `${colors.primary}08` : '#fff', borderColor: isKentucky ? `${colors.primary}55` : undefined }}
                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, postCardHoverStyle)}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = postCardStyle.boxShadow as string; }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-3">
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                              style={{ backgroundColor: idx < 3 ? colors.primary : '#e5e7eb', color: idx < 3 ? '#fff' : colors.textMuted }}
                            >
                              {idx + 1}
                            </span>
                            {post.thumbnail ? (
                              <img src={post.thumbnail} alt={post.teamName} className="h-16 w-16 rounded-xl object-cover border border-gray-200 shadow-sm flex-shrink-0" loading="lazy" />
                            ) : (
                              <div className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-base font-semibold text-gray-900 truncate">{post.schoolName}</p>
                                {isKentucky && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: colors.primary, color: '#fff' }}>Kentucky</span>}
                              </div>
                              <p className="text-sm text-gray-600 truncate">{post.teamName} • {post.dateLabel}</p>
                              {post.caption && (
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.caption}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">{formatNumber(post.interactions)}</p>
                          <p className="text-xs text-gray-600 mt-1">Interactions</p>
                        </div>
                      </div>
                    </a>
                  );
                })}
                {top10SECTeamPosts.length === 0 && <p className="text-sm text-gray-500">No SEC team page benchmark posts available.</p>}
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
        let rows: KentuckyRosterTeam[] | null = null;
        for (const path of ['/data/kentucky_teams_metrics.json', '/data/Kentucky.roster_teams.json', '/data/kentucky.roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              rows = (await response.json()) as KentuckyRosterTeam[];
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

  const ukBlue = '#0033A0';

  const SortIcon = ({ col }: { col: TeamSortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'desc' ? (
      <ChevronDown className="w-3 h-3" style={{ color: ukBlue }} />
    ) : (
      <ChevronUp className="w-3 h-3" style={{ color: ukBlue }} />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionHeader primary="KENTUCKY " secondary="TEAM PAGES" />
        <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
          Official Kentucky athletics social account performance.
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
                backgroundColor: activeMetric === mb.id ? ukBlue : '#fff',
                borderColor: activeMetric === mb.id ? ukBlue : 'rgba(0,0,0,0.12)',
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
                    backgroundColor: rank <= 3 ? `${ukBlue}15` : '#f3f4f6',
                    color: rank <= 3 ? ukBlue : colors.textMuted,
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
                <span className="font-semibold" style={{ color: ukBlue }}>
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
                  className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors motion-reduce:transition-none"
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: ukBlue }}>
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
// MAIN EXPORT: KentuckyIPImpact
// ═══════════════════════════════════════════════════════════════
export function KentuckyIPImpact({ onBack }: { onBack?: () => void }) {
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

    const loadKentuckySports = async () => {
      try {
        let rows: KentuckyRosterTeam[] | null = null;
        for (const path of ['/data/kentucky_teams_metrics.json', '/data/Kentucky.roster_teams.json', '/data/kentucky.roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              rows = (await response.json()) as KentuckyRosterTeam[];
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

    loadKentuckySports();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadOverviewData = async () => {
      try {
        const response = await fetch('/data/kentucky-athlete-overview.json');
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
      {/* Kentucky background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/kentucky-bg.jpg)',
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
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/96.png"
                alt="Kentucky"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div>
                <h1
                  className="text-lg sm:text-2xl font-bold uppercase tracking-tight whitespace-nowrap"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
                >
                  <span style={{ color: colors.primary }}>Kentucky </span>
                  <span className="hidden sm:inline" style={{ color: colors.headerGray }}>Wildcats IP Impact Report</span>
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
                      color: activeTab === tab.id ? colors.primary : colors.textMuted,
                      borderColor: activeTab === tab.id ? colors.primary : 'transparent',
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
        {activeTab === 'benchmark' && <BenchmarkTab />}
        {activeTab === 'content' && <ContentTab />}
        {activeTab === 'teampages' && <TeamPagesTab sportData={sportData} />}
      </main>
    </div>
  );
}
