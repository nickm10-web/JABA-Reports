import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  primary: '#BA0C2F',
  primaryDark: '#8a0922',
  primaryLight: '#d4334f',
  gray: '#a7b1b7',
  white: '#ffffff',
  positive: '#10b981',
  negative: '#ef4444',
  accent: '#000000',
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

interface GeorgiaRosterMetricWindow {
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

interface GeorgiaRosterTeam {
  sport?: string;
  metrics?: {
    thirtyDays?: GeorgiaRosterMetricWindow;
    sevenDays?: GeorgiaRosterMetricWindow;
    ninetyDays?: GeorgiaRosterMetricWindow;
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

function buildSportDataFromRoster(rows: GeorgiaRosterTeam[]): SportSignalData {
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
// GEORGIA IP DATA (Source of Truth)
// ═══════════════════════════════════════════════════════════════
const ipData = {
  totalPosts: 6868,
  totalAthletes: 370,
  totalFollowers: 2864099,
  totalLikes: 11408897,
  totalComments: 344570,
  engagementRate: 0.2251,
  baseline: { posts: 3783, engagementRate: 0.1827 },
  postsWithIP: 3085,
  ipAdoptionRate: 44.9,
  avgLift: 51.7,
  totalEmv: 6218877,
  collaboration: { posts: 200, likes: 4930.52, comments: 69.77, engagementRate: 0.6181, delta: 189.79, emv: 513981, baselineEngRate: 0.2133, baselinePosts: 6668, baselineLikes: 1587.74, baselineComments: 49.35 } as IPSignalData,
  logo: { posts: 2805, likes: 2471.15, comments: 65.31, engagementRate: 0.2714, delta: 40.56, emv: 3740572, baselineEngRate: 0.1931, baselinePosts: 4063, baselineLikes: 1466.32, baselineComments: 47.27 } as IPSignalData,
  mention: { posts: 906, likes: 2226.69, comments: 34.75, engagementRate: 0.3978, delta: 100.07, emv: 1056807, baselineEngRate: 0.1988, baselinePosts: 5962, baselineLikes: 1574.93, baselineComments: 52.51 } as IPSignalData,
  signals: [
    {
      id: 'logo' as const,
      label: 'Visual IP (Logo)',
      totalPosts: 2805,
      percentage: 40.8,
      with: { posts: 2805, avgLikes: 2471, avgComments: 65, engagementRate: 0.2714 },
      without: { posts: 6139, avgLikes: 1466, avgComments: 47, engagementRate: 0.1668 },
    },
    {
      id: 'mention' as const,
      label: 'Caption Mention',
      totalPosts: 906,
      percentage: 13.2,
      with: { posts: 906, avgLikes: 2227, avgComments: 35, engagementRate: 0.3978 },
      without: { posts: 5962, avgLikes: 1575, avgComments: 53, engagementRate: 0.1607 },
    },
    {
      id: 'collab' as const,
      label: 'Collaboration',
      totalPosts: 200,
      percentage: 2.9,
      with: { posts: 200, avgLikes: 4931, avgComments: 70, engagementRate: 0.6181 },
      without: { posts: 6788, avgLikes: 1588, avgComments: 49, engagementRate: 0.1618 },
    },
  ],
  sponsoredPosts: 496,
  totalBrands: 100,
  totalEMV: 6218877,
  partnerships: [
    { brand: "@rimmellondon", posts: 5, avgLikes: 107554, avgComments: 428, emv: 272096.5, engagementRate: 3.6177, liftMultiplier: 63.8 },
    { brand: "@powerade_us", posts: 3, avgLikes: 19758.33, avgComments: 75, emv: 29975, engagementRate: 0.4332, liftMultiplier: 10.9 },
    { brand: "@beatsbydre", posts: 2, avgLikes: 17277.5, avgComments: 181, emv: 17819, engagementRate: 0.3455, liftMultiplier: 9.4 },
    { brand: "@delta", posts: 19, avgLikes: 1648, avgComments: 39, emv: 16770, engagementRate: 0.1395, liftMultiplier: 0.0 },
    { brand: "@onwardreserve", posts: 13, avgLikes: 1815.31, avgComments: 34, emv: 12470, engagementRate: 0.0831, liftMultiplier: 0.1 },
    { brand: "@heydude", posts: 4, avgLikes: 5615, avgComments: 51, emv: 11534.5, engagementRate: 0.0755, liftMultiplier: 2.4 },
    { brand: "@HellmannsMayonnaise", posts: 1, avgLikes: 22045, avgComments: 262, emv: 11415.5, engagementRate: 0.8975, liftMultiplier: 12.3 },
    { brand: "@futurescapequiz", posts: 1, avgLikes: 21071, avgComments: 39, emv: 10594, engagementRate: 1.9894, liftMultiplier: 11.7 },
    { brand: "@whataburger", posts: 4, avgLikes: 4710.75, avgComments: 92, emv: 9972, engagementRate: 0.0451, liftMultiplier: 1.8 },
    { brand: "@adidas", posts: 16, avgLikes: 1334, avgComments: 24, emv: 11236.5, engagementRate: 0.0835, liftMultiplier: -0.2 },
    { brand: "@doordash", posts: 2, avgLikes: 6928, avgComments: 25, emv: 7001.5, engagementRate: 0.1376, liftMultiplier: 3.2 },
    { brand: "@regionsbank", posts: 2, avgLikes: 6456.5, avgComments: 44, emv: 6588.5, engagementRate: 0.1016, liftMultiplier: 2.9 },
    { brand: "@ozoneleos", posts: 2, avgLikes: 5085, avgComments: 97, emv: 5376, engagementRate: 0.1736, liftMultiplier: 2.1 },
    { brand: "@spalding", posts: 1, avgLikes: 9492, avgComments: 161, emv: 4987.5, engagementRate: 0.1781, liftMultiplier: 4.7 },
    { brand: "@truist", posts: 1, avgLikes: 9543, avgComments: 67, emv: 4872, engagementRate: 0.358, liftMultiplier: 4.7 },
    { brand: "@factormeals", posts: 1, avgLikes: 8923, avgComments: 90, emv: 4596.5, engagementRate: 0.1031, liftMultiplier: 4.4 },
    { brand: "@perfectgameusa", posts: 1, avgLikes: 8863, avgComments: 20, emv: 4461.5, engagementRate: 0.4945, liftMultiplier: 4.3 },
    { brand: "Nike", posts: 10, avgLikes: 1522, avgComments: 45, emv: 8286.5, engagementRate: 0.4360, liftMultiplier: -0.1 },
    { brand: "@fortnite", posts: 1, avgLikes: 7035, avgComments: 77, emv: 3633, engagementRate: 0.1407, liftMultiplier: 3.2 },
    { brand: "@MarriottBonvoy", posts: 1, avgLikes: 6594, avgComments: 55, emv: 3379.5, engagementRate: 0.2725, liftMultiplier: 3.0 },
    { brand: "@SeatGeek", posts: 3, avgLikes: 2498, avgComments: 29, emv: 3878, engagementRate: 0.0338, liftMultiplier: 0.5 },
    { brand: "@TheDairyAlliance", posts: 2, avgLikes: 2931, avgComments: 208, emv: 3555, engagementRate: 0.0899, liftMultiplier: 0.8 },
    { brand: "@officialfaithwalker", posts: 3, avgLikes: 1789.67, avgComments: 24, emv: 2791, engagementRate: 0.164, liftMultiplier: 0.1 },
    { brand: "@drinkdripdrop", posts: 2, avgLikes: 2460.5, avgComments: 73, emv: 2678, engagementRate: 0.0703, liftMultiplier: 0.5 },
    { brand: "@ballislife", posts: 3, avgLikes: 1609.33, avgComments: 16, emv: 2487.5, engagementRate: 0.528, liftMultiplier: 0.0 },
    { brand: "@tecovas", posts: 1, avgLikes: 4082, avgComments: 68, emv: 2143, engagementRate: 0.1185, liftMultiplier: 1.5 },
    { brand: "@pxg", posts: 1, avgLikes: 3852, avgComments: 53, emv: 2005.5, engagementRate: 0.0351, liftMultiplier: 1.3 },
    { brand: "@kinatraxinc", posts: 2, avgLikes: 1867.5, avgComments: 6, emv: 1885.5, engagementRate: 0.0927, liftMultiplier: 0.1 },
    { brand: "@activem_japan", posts: 4, avgLikes: 1201, avgComments: 5, emv: 2432.5, engagementRate: 0.0446, liftMultiplier: -0.3 },
    { brand: "@realsweetonions", posts: 2, avgLikes: 1665, avgComments: 11, emv: 1698, engagementRate: 0.023, liftMultiplier: 0.0 },
    { brand: "@invisalign", posts: 1, avgLikes: 3275, avgComments: 28, emv: 1679.5, engagementRate: 0.4964, liftMultiplier: 1.0 },
    { brand: "@dgdoutdoors", posts: 2, avgLikes: 1603.5, avgComments: 21, emv: 1665, engagementRate: 0.117, liftMultiplier: 0.0 },
    { brand: "@giftedloveofgod", posts: 1, avgLikes: 3123, avgComments: 40, emv: 1621.5, engagementRate: 0.0188, liftMultiplier: 0.9 },
    { brand: "@homefieldapparel", posts: 2, avgLikes: 1526, avgComments: 14, emv: 1568, engagementRate: 0.0839, liftMultiplier: -0.1 },
    { brand: "@couruguayo", posts: 1, avgLikes: 2714, avgComments: 86, emv: 1486, engagementRate: 0.2242, liftMultiplier: 0.6 },
    { brand: "@amazon", posts: 7, avgLikes: 373.14, avgComments: 16, emv: 1474, engagementRate: 0.0248, liftMultiplier: -0.8 },
    { brand: "@moreau_sport", posts: 1, avgLikes: 2737, avgComments: 55, emv: 1451, engagementRate: 0.208, liftMultiplier: 0.6 },
    { brand: "@zipscarwash", posts: 1, avgLikes: 2833, avgComments: 10, emv: 1431.5, engagementRate: 0.0952, liftMultiplier: 0.7 },
    { brand: "@puravida", posts: 6, avgLikes: 375.83, avgComments: 29, emv: 1388.5, engagementRate: 0.0891, liftMultiplier: -0.8 },
    { brand: "@underarmourlatam", posts: 3, avgLikes: 738.67, avgComments: 57, emv: 1363, engagementRate: 0.0633, liftMultiplier: -0.6 },
    { brand: "@vuoriclothing", posts: 3, avgLikes: 800.33, avgComments: 19, emv: 1286, engagementRate: 0.0221, liftMultiplier: -0.5 },
    { brand: "@allturflawncare", posts: 2, avgLikes: 1234, avgComments: 11, emv: 1265.5, engagementRate: 0.0807, liftMultiplier: -0.3 },
    { brand: "@competition.farm", posts: 7, avgLikes: 209, avgComments: 50, emv: 1261, engagementRate: 0.1848, liftMultiplier: -0.9 },
    { brand: "@associatedcu", posts: 2, avgLikes: 1238.5, avgComments: 0, emv: 1238.5, engagementRate: 0.0408, liftMultiplier: -0.4 },
    { brand: "@statefarm", posts: 2, avgLikes: 1159, avgComments: 24, emv: 1229.5, engagementRate: 0.0459, liftMultiplier: -0.3 },
    { brand: "@fairfieldhotels", posts: 1, avgLikes: 2211, avgComments: 44, emv: 1171.5, engagementRate: 0.0302, liftMultiplier: 0.3 },
    { brand: "@powerademx", posts: 1, avgLikes: 2196, avgComments: 22, emv: 1131, engagementRate: 0.1203, liftMultiplier: 0.3 },
    { brand: "@baseballamerica", posts: 1, avgLikes: 2140, avgComments: 18, emv: 1097, engagementRate: 0.0799, liftMultiplier: 0.3 },
    { brand: "@mizunoswimusa", posts: 1, avgLikes: 2147, avgComments: 12, emv: 1091.5, engagementRate: 0.1557, liftMultiplier: 0.3 },
    { brand: "@PapaJohns", posts: 3, avgLikes: 664.67, avgComments: 17, emv: 1075, engagementRate: 0.1199, liftMultiplier: -0.6 },
    { brand: "@on", posts: 2, avgLikes: 944, avgComments: 43, emv: 1071.5, engagementRate: 0.2825, liftMultiplier: -0.4 },
    { brand: "@tmobile", posts: 2, avgLikes: 1023.5, avgComments: 8, emv: 1047.5, engagementRate: 0.1924, liftMultiplier: -0.4 },
    { brand: "@vktryinsoles", posts: 1, avgLikes: 1947, avgComments: 23, emv: 1008, engagementRate: 0.0211, liftMultiplier: 0.2 },
    { brand: "@hollister", posts: 7, avgLikes: 252.57, avgComments: 11, emv: 998, engagementRate: 0.0691, liftMultiplier: -0.8 },
    { brand: "@sportssocialatl", posts: 2, avgLikes: 934, avgComments: 6, emv: 952, engagementRate: 0.0648, liftMultiplier: -0.4 },
    { brand: "@wingstop", posts: 1, avgLikes: 1759, avgComments: 31, emv: 926, engagementRate: 0.0354, liftMultiplier: 0.1 },
    { brand: "@avocadosfrommexico", posts: 3, avgLikes: 558.67, avgComments: 15, emv: 905.5, engagementRate: 0.069, liftMultiplier: -0.7 },
    { brand: "@beckwithsportsacademy", posts: 1, avgLikes: 1554, avgComments: 58, emv: 864, engagementRate: 0.0319, liftMultiplier: -0.1 },
    { brand: "@lhftbagco", posts: 2, avgLikes: 803, avgComments: 19, emv: 858.5, engagementRate: 0.1755, liftMultiplier: -0.5 },
    { brand: "@workoutanytime", posts: 4, avgLikes: 402.5, avgComments: 8, emv: 854.5, engagementRate: 0.0138, liftMultiplier: -0.8 },
    { brand: "@level8_official", posts: 1, avgLikes: 1601, avgComments: 31, emv: 847, engagementRate: 0.0442, liftMultiplier: 0.0 },
    { brand: "@nightcapshow_", posts: 1, avgLikes: 1566, avgComments: 26, emv: 822, engagementRate: 0.0315, liftMultiplier: -0.1 },
    { brand: "@longhornsteakhouse", posts: 2, avgLikes: 770.5, avgComments: 12, emv: 806.5, engagementRate: 0.0663, liftMultiplier: -0.5 },
    { brand: "@raisingcanes", posts: 2, avgLikes: 680, avgComments: 39, emv: 797, engagementRate: 0.0076, liftMultiplier: -0.6 },
    { brand: "@361uruguay", posts: 1, avgLikes: 1466, avgComments: 30, emv: 778, engagementRate: 0.1198, liftMultiplier: -0.1 },
    { brand: "@lukehenry.bennett", posts: 1, avgLikes: 1315, avgComments: 66, emv: 756.5, engagementRate: 0.143, liftMultiplier: -0.2 },
    { brand: "@thehouseofathlete", posts: 1, avgLikes: 1153, avgComments: 104, emv: 732.5, engagementRate: 0.0506, liftMultiplier: -0.3 },
    { brand: "@drinkbiolyte", posts: 4, avgLikes: 567, avgComments: 30, emv: 1308.5, engagementRate: 0.0343, liftMultiplier: -0.6 },
    { brand: "@vrnfoundationofficial", posts: 1, avgLikes: 1276, avgComments: 42, emv: 701, engagementRate: 0.0261, liftMultiplier: -0.2 },
    { brand: "@GeorgiasOwnCU", posts: 4, avgLikes: 653, avgComments: 9, emv: 1359, engagementRate: 0.1439, liftMultiplier: -0.6 },
    { brand: "@chipotle", posts: 1, avgLikes: 1125, avgComments: 50, emv: 637.5, engagementRate: 0.0438, liftMultiplier: -0.3 },
    { brand: "@streetexecs", posts: 1, avgLikes: 1082, avgComments: 62, emv: 634, engagementRate: 0.2007, liftMultiplier: -0.3 },
    { brand: "@rawlings", posts: 1, avgLikes: 1237, avgComments: 10, emv: 633.5, engagementRate: 0.0694, liftMultiplier: -0.3 },
    { brand: "@callaway_next", posts: 2, avgLikes: 458, avgComments: 57, emv: 627.5, engagementRate: 0.2732, liftMultiplier: -0.7 },
    { brand: "@experian", posts: 1, avgLikes: 1156, avgComments: 20, emv: 608, engagementRate: 0.0309, liftMultiplier: -0.3 },
    { brand: "@c4energy", posts: 1, avgLikes: 1131, avgComments: 23, emv: 600, engagementRate: 0.0473, liftMultiplier: -0.3 },
    { brand: "@reevesjewelry_athens", posts: 1, avgLikes: 1155, avgComments: 13, emv: 597, engagementRate: 0.1854, liftMultiplier: -0.3 },
    { brand: "@solomonbrothers", posts: 1, avgLikes: 1143, avgComments: 13, emv: 591, engagementRate: 0.0387, liftMultiplier: -0.3 },
  ] as Partnership[],
};


// ═══════════════════════════════════════════════════════════════
// ATHLETE & BENCHMARK DATA
// ═══════════════════════════════════════════════════════════════
const fallbackSportData: SportSignalData = {
  ALL_SPORTS: {
    logo: { with: { posts: 2805, avgLikes: 2471, avgComments: 65, engagementRate: 0.2714 }, without: { posts: 4063, avgLikes: 1466, avgComments: 47, engagementRate: 0.1931 } },
    mention: { with: { posts: 906, avgLikes: 2227, avgComments: 35, engagementRate: 0.3978 }, without: { posts: 5962, avgLikes: 1575, avgComments: 53, engagementRate: 0.1988 } },
    collab: { with: { posts: 200, avgLikes: 4931, avgComments: 70, engagementRate: 0.6181 }, without: { posts: 6668, avgLikes: 1588, avgComments: 49, engagementRate: 0.2133 } },
  },
  FOOTBALL: {
    logo: { with: { posts: 178, avgLikes: 8721, avgComments: 145, engagementRate: 0.12 }, without: { posts: 971, avgLikes: 4220, avgComments: 103, engagementRate: 0.10 } },
    mention: { with: { posts: 8, avgLikes: 3100, avgComments: 44, engagementRate: 0.15 }, without: { posts: 1141, avgLikes: 4952, avgComments: 111, engagementRate: 0.10 } },
    collab: { with: { posts: 21, avgLikes: 18500, avgComments: 310, engagementRate: 0.35 }, without: { posts: 1128, avgLikes: 4580, avgComments: 103, engagementRate: 0.10 } },
  },
  WOMENS_GYMNASTICS: {
    logo: { with: { posts: 32, avgLikes: 3200, avgComments: 38, engagementRate: 0.15 }, without: { posts: 361, avgLikes: 1850, avgComments: 22, engagementRate: 0.12 } },
    mention: { with: { posts: 2, avgLikes: 900, avgComments: 12, engagementRate: 0.10 }, without: { posts: 391, avgLikes: 1990, avgComments: 24, engagementRate: 0.12 } },
    collab: { with: { posts: 5, avgLikes: 4500, avgComments: 55, engagementRate: 0.25 }, without: { posts: 388, avgLikes: 1940, avgComments: 23, engagementRate: 0.12 } },
  },
  BASEBALL: {
    logo: { with: { posts: 28, avgLikes: 2800, avgComments: 45, engagementRate: 0.18 }, without: { posts: 335, avgLikes: 1620, avgComments: 32, engagementRate: 0.14 } },
    mention: { with: { posts: 7, avgLikes: 1800, avgComments: 28, engagementRate: 0.20 }, without: { posts: 356, avgLikes: 1730, avgComments: 34, engagementRate: 0.14 } },
    collab: { with: { posts: 5, avgLikes: 5200, avgComments: 72, engagementRate: 0.30 }, without: { posts: 358, avgLikes: 1700, avgComments: 33, engagementRate: 0.14 } },
  },
  MENS_BASKETBALL: {
    logo: { with: { posts: 35, avgLikes: 5100, avgComments: 85, engagementRate: 0.16 }, without: { posts: 169, avgLikes: 2750, avgComments: 48, engagementRate: 0.12 } },
    mention: { with: { posts: 3, avgLikes: 2200, avgComments: 30, engagementRate: 0.14 }, without: { posts: 201, avgLikes: 3240, avgComments: 54, engagementRate: 0.12 } },
    collab: { with: { posts: 8, avgLikes: 7800, avgComments: 120, engagementRate: 0.28 }, without: { posts: 196, avgLikes: 3050, avgComments: 50, engagementRate: 0.12 } },
  },
};

const fallbackTeamFollowersBySport: Record<string, number> = {};

const secSchools = [
  { name: 'Kentucky', conf: 'SEC', posts: 4299, adoption: 54.3, logo: 47.7, mention: 14.1, collab: 7.1, followers: 1671393 },
  { name: 'Texas A&M', conf: 'SEC', posts: 4317, adoption: 51.4, logo: 46.8, mention: 19.8, collab: 3.2, followers: 1878601 },
  { name: 'Auburn', conf: 'SEC', posts: 6405, adoption: 48.1, logo: 40.0, mention: 21.7, collab: 8.9, followers: 2323541 },
  { name: 'LSU', conf: 'SEC', posts: 5450, adoption: 46.1, logo: 40.7, mention: 14.7, collab: 3.2, followers: 5170563 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2802, adoption: 45.6, logo: 45.6, mention: 2.8, collab: 0.0, followers: 1703577 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.6, logo: 43.1, mention: 11.2, collab: 1.3, followers: 0 },
  { name: 'Missouri', conf: 'SEC', posts: 5726, adoption: 42.6, logo: 38.1, mention: 20.5, collab: 2.0, followers: 1271953 },
  { name: 'Alabama', conf: 'SEC', posts: 5750, adoption: 40.3, logo: 37.5, mention: 16.9, collab: 2.6, followers: 3966222 },
  { name: 'Arkansas', conf: 'SEC', posts: 5715, adoption: 36.8, logo: 34.2, mention: 10.6, collab: 0.9, followers: 2827038 },
  { name: 'Mississippi State', conf: 'SEC', posts: 2239, adoption: 34.4, logo: 34.4, mention: 2.9, collab: 0.1, followers: 0 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 30.0, logo: 29.3, mention: 13.7, collab: 1.1, followers: 0 },
  { name: 'Texas', conf: 'SEC', posts: 6186, adoption: 26.4, logo: 25.2, mention: 0.4, collab: 1.8, followers: 3552007 },
  { name: 'Georgia', conf: 'SEC', posts: 6868, adoption: 44.9, logo: 40.8, mention: 13.2, collab: 2.9, followers: 2864099 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 14.5, logo: 12.4, mention: 0.0, collab: 1.7, followers: 1848323 },
  { name: 'Florida', conf: 'SEC', posts: 2693, adoption: 12.9, logo: 12.7, mention: 0.0, collab: 0.0, followers: 3163738 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1577, adoption: 60.1, logo: 57.8, mention: 14.5, collab: 1.3, followers: 406916 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 55.6, logo: 53.3, mention: 21.7, collab: 4.6, followers: 0 },
  { name: 'Kentucky', conf: 'SEC', posts: 4299, adoption: 54.3, logo: 47.7, mention: 14.1, collab: 7.1, followers: 1671393 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 53.0, logo: 52.4, mention: 0.0, collab: 1.2, followers: 0 },
  { name: 'Texas A&M', conf: 'SEC', posts: 4317, adoption: 51.4, logo: 46.8, mention: 19.8, collab: 3.2, followers: 1878601 },
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
  { name: 'LSU', conf: 'SEC', posts: 5450, adoption: 46.1, logo: 40.7, mention: 14.7, collab: 3.2, followers: 5170563 },
  { name: 'UTSA', conf: 'AAC', posts: 3773, adoption: 46.0, logo: 39.7, mention: 16.9, collab: 10.8, followers: 835260 },
  { name: 'Oklahoma', conf: 'SEC', posts: 2802, adoption: 45.6, logo: 45.6, mention: 2.8, collab: 0.0, followers: 1703577 },
  { name: 'NC State', conf: 'ACC', posts: 2565, adoption: 45.6, logo: 44.7, mention: 10.7, collab: 3.1, followers: 1238519 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2867, adoption: 45.3, logo: 40.1, mention: 15.6, collab: 3.9, followers: 0 },
  { name: 'Baylor', conf: 'Big 12', posts: 7298, adoption: 45.1, logo: 41.0, mention: 21.4, collab: 4.5, followers: 2110678 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 44.8, logo: 40.9, mention: 17.9, collab: 2.6, followers: 0 },
  { name: 'UCF', conf: 'Big 12', posts: 2409, adoption: 44.3, logo: 40.5, mention: 8.0, collab: 7.1, followers: 1202431 },
  { name: 'New Mexico State', conf: 'C-USA', posts: 981, adoption: 44.1, logo: 44.0, mention: 0.0, collab: 0.7, followers: 0 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4968, adoption: 43.7, logo: 39.6, mention: 16.2, collab: 1.1, followers: 1043067 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logo: 39.7, mention: 16.8, collab: 2.1, followers: 4114531 },
  { name: 'Ole Miss', conf: 'SEC', posts: 2309, adoption: 43.6, logo: 43.1, mention: 11.2, collab: 1.3, followers: 0 },
  { name: 'Indiana', conf: 'Big 10', posts: 2218, adoption: 43.4, logo: 41.6, mention: 1.4, collab: 1.4, followers: 0 },
  { name: 'Arizona', conf: 'Big 12', posts: 4371, adoption: 43.1, logo: 41.1, mention: 9.6, collab: 1.7, followers: 3260269 },
  { name: 'Missouri', conf: 'SEC', posts: 5726, adoption: 42.6, logo: 38.1, mention: 20.5, collab: 2.0, followers: 1271953 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.7, logo: 41.7, mention: 2.4, collab: 0.0, followers: 0 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logo: 41.5, mention: 14.5, collab: 0.5, followers: 0 },
  { name: 'Rice', conf: 'AAC', posts: 632, adoption: 41.1, logo: 40.0, mention: 14.4, collab: 5.9, followers: 0 },
  { name: 'Alabama', conf: 'SEC', posts: 5750, adoption: 40.3, logo: 37.5, mention: 16.9, collab: 2.6, followers: 3966222 },
  { name: 'Georgia Tech', conf: 'ACC', posts: 2066, adoption: 40.4, logo: 38.9, mention: 0.0, collab: 5.6, followers: 0 },
  { name: 'Florida State', conf: 'ACC', posts: 2130, adoption: 40.1, logo: 40.1, mention: 1.6, collab: 0.0, followers: 0 },
  { name: 'Virginia', conf: 'ACC', posts: 6496, adoption: 40.0, logo: 37.1, mention: 16.5, collab: 1.4, followers: 2044598 },
  { name: 'Boston College', conf: 'ACC', posts: 1539, adoption: 40.0, logo: 38.6, mention: 11.3, collab: 6.1, followers: 0 },
  { name: 'Arkansas', conf: 'SEC', posts: 5715, adoption: 36.8, logo: 34.2, mention: 10.6, collab: 0.9, followers: 2827038 },
  { name: 'DePaul', conf: 'Big East', posts: 746, adoption: 36.5, logo: 35.7, mention: 8.3, collab: 3.1, followers: 121473 },
  { name: 'Purdue', conf: 'Big 10', posts: 5286, adoption: 36.5, logo: 34.1, mention: 12.8, collab: 3.4, followers: 1299880 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 36.0, logo: 36.0, mention: 5.1, collab: 5.0, followers: 0 },
  { name: 'Arizona State', conf: 'Big 12', posts: 7777, adoption: 34.4, logo: 32.0, mention: 9.9, collab: 3.4, followers: 2269788 },
  { name: 'Mississippi State', conf: 'SEC', posts: 2239, adoption: 34.4, logo: 34.4, mention: 2.9, collab: 0.1, followers: 0 },
  { name: 'BYU', conf: 'Big 12', posts: 7519, adoption: 34.3, logo: 31.6, mention: 10.1, collab: 2.3, followers: 0 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 33.8, logo: 32.4, mention: 12.0, collab: 0.3, followers: 0 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logo: 33.4, mention: 6.9, collab: 5.7, followers: 0 },
  { name: 'Vanderbilt', conf: 'SEC', posts: 2246, adoption: 30.0, logo: 29.3, mention: 13.7, collab: 1.1, followers: 0 },
  { name: 'Washington', conf: 'Pac-12', posts: 2378, adoption: 27.7, logo: 25.7, mention: 4.1, collab: 4.2, followers: 0 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.8, logo: 26.7, mention: 7.0, collab: 0.0, followers: 907225 },
  { name: 'Texas', conf: 'SEC', posts: 6186, adoption: 26.4, logo: 25.2, mention: 0.4, collab: 1.8, followers: 3552007 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.8, logo: 25.8, mention: 2.0, collab: 0.0, followers: 0 },
  { name: 'San Diego', conf: 'WCC', posts: 2024, adoption: 25.2, logo: 23.2, mention: 9.2, collab: 0.0, followers: 439463 },
  { name: 'Creighton', conf: 'Big East', posts: 2592, adoption: 24.6, logo: 20.7, mention: 8.6, collab: 2.0, followers: 438009 },
  { name: 'Colorado', conf: 'Big 12', posts: 1418, adoption: 24.6, logo: 24.6, mention: 2.5, collab: 0.0, followers: 0 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.1, logo: 22.5, mention: 13.8, collab: 0.8, followers: 1266884 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.6, logo: 22.5, mention: 0.0, collab: 0.1, followers: 0 },
  { name: 'Clemson', conf: 'ACC', posts: 3351, adoption: 20.4, logo: 17.5, mention: 1.2, collab: 2.6, followers: 1726437 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1680, adoption: 18.3, logo: 18.3, mention: 2.5, collab: 0.0, followers: 0 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logo: 18.2, mention: 2.7, collab: 0.1, followers: 0 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1934, adoption: 18.0, logo: 18.0, mention: 2.6, collab: 0.0, followers: 0 },
  { name: 'Duke', conf: 'ACC', posts: 1951, adoption: 16.6, logo: 15.5, mention: 0.0, collab: 1.9, followers: 0 },
  { name: 'UNC', conf: 'ACC', posts: 3056, adoption: 16.3, logo: 15.7, mention: 0.5, collab: 0.2, followers: 1434088 },
  { name: 'Georgia', conf: 'SEC', posts: 6868, adoption: 44.9, logo: 40.8, mention: 13.2, collab: 2.9, followers: 2864099 },
  { name: 'Providence', conf: 'Big East', posts: 679, adoption: 15.8, logo: 12.7, mention: 8.4, collab: 4.7, followers: 0 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.2, logo: 11.5, mention: 16.9, collab: 5.4, followers: 882398 },
  { name: 'Tennessee', conf: 'SEC', posts: 2459, adoption: 14.5, logo: 12.4, mention: 0.0, collab: 1.7, followers: 1848323 },
  { name: 'Illinois', conf: 'Big 10', posts: 2731, adoption: 13.7, logo: 12.6, mention: 4.8, collab: 1.9, followers: 0 },
  { name: 'Florida', conf: 'SEC', posts: 2693, adoption: 12.9, logo: 12.7, mention: 0.0, collab: 0.0, followers: 3163738 },
  { name: 'Boise State', conf: 'MWC', posts: 4000, adoption: 12.3, logo: 11.8, mention: 7.8, collab: 1.0, followers: 724157 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5982, adoption: 12.0, logo: 11.0, mention: 2.7, collab: 1.3, followers: 1812655 },
  { name: 'Pittsburgh', conf: 'ACC', posts: 2475, adoption: 11.8, logo: 11.6, mention: 11.7, collab: 0.2, followers: 740916 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 11.6, logo: 8.7, mention: 0.3, collab: 3.4, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 11.0, logo: 8.6, mention: 0.2, collab: 2.8, followers: 4376029 },
  { name: 'Robert Morris', conf: 'Horizon', posts: 2687, adoption: 7.4, logo: 7.4, mention: 0.0, collab: 0.0, followers: 465010 },
];

const conferenceAvg = { adoption: 36.2, logo: 33.2, mention: 8.2, collab: 2.3 };
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
          <span style={{ color: colors.primary }}>Georgia </span>
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
                Georgia ranks{' '}
                <span className="font-bold" style={{ color: colors.primary }}>#13 in SEC</span> for IP adoption at{' '}
                <span className="font-bold" style={{ color: colors.primary }}>{overview.ipAdoptionRate}%</span>, with significant room for growth.
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
                <span className="font-bold">{formatNumber(overview.postsWithIP)} posts</span> ({overview.ipAdoptionRate}%) feature Georgia IP,
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
            tooltip="Athlete posts co-authored or tagged with official Georgia account"
            opportunity={`Only ${formatNumber(overview.collaboration.posts)} collab posts exist. Scaling collaborations could significantly amplify total EMV.`}
          />
          <IPModeCard
            title="Visual IP"
            icon={<Camera className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.logo.posts}
            delta={overview.logo.delta}
            avgEngagement={formatPercent(overview.logo.engagementRate)}
            emv={formatCurrency(logoEMV)}
            tooltip="Athlete posts with Georgia logo detected in media"
            opportunity={`${formatNumber(overview.logo.posts)} posts feature Georgia logos. Visual IP is the most common signal and a strong engagement driver.`}
          />
          <IPModeCard
            title="Mention"
            icon={<AtSign className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.mention.posts}
            delta={overview.mention.delta}
            avgEngagement={formatPercent(overview.mention.engagementRate)}
            emv={formatCurrency(mentionEMV)}
            tooltip="Athlete posts with @mention or text reference to Georgia"
            opportunity={`${formatNumber(overview.mention.posts)} posts mention Georgia in captions, driving +${overview.mention.delta.toFixed(1)}% engagement lift. Encouraging athletes to tag Georgia team pages in captions could amplify this further.`}
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
            Data reflects <span className="font-semibold">Georgia athlete personal social media accounts</span>, including collaboration posts with official team pages.
            Metrics track how athletes use Georgia IP (logos, mentions, collaborations) in their content. Analysis covers{' '}
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
        return { withoutValue: formatPercent(withoutEngRate), withValue: formatPercent(withEngRate), withoutRaw: withoutEngRate, withRaw: withEngRate, delta: engDelta };
      case 'likes':
        return { withoutValue: formatNumber(Math.round(baselineAvgLikes)), withValue: formatNumber(Math.round(withAvgLikes)), withoutRaw: baselineAvgLikes, withRaw: withAvgLikes, delta: likesDelta };
      case 'comments':
        return { withoutValue: formatNumber(Math.round(baselineAvgComments)), withValue: formatNumber(Math.round(withAvgComments)), withoutRaw: baselineAvgComments, withRaw: withAvgComments, delta: commentsDelta };
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
          Posts with Georgia {currentSignal?.label.toLowerCase()} drive{' '}
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
        Engagement rate is estimated as <span className="font-semibold">(likes + comments) / athlete followers</span> using mapped Georgia athlete follower totals.
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
                    boxShadow: isActive ? '0 2px 8px rgba(186, 12, 47, 0.28)' : 'none',
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
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>With {currentSignal?.label}</p>
                  <p className="text-lg font-black" style={{ color: colors.primary }}>{metricValues.withValue}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-lg h-8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-lg"
                    style={{
                      background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                      boxShadow: `0 2px 8px ${colors.primary}33`,
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
                <p className="text-3xl font-black" style={{ color: colors.primary }}>
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
  const [rankingMetric, setRankingMetric] = useState<'followers' | 'posts' | 'adoption' | 'mention' | 'logo' | 'collab'>('followers');
  const isConference = benchmarkType === 'conference';
  const schools = isConference ? secSchools : ncaaD1Schools;
  const benchmarkLabel = isConference ? 'SEC' : 'NCAA D1';
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

  const kyIndex = rankedSchools.findIndex((s) => s.name === 'Georgia');
  const kyRank = kyIndex >= 0 ? kyIndex + 1 : null;
  const kySchool = rankedSchools.find((s) => s.name === 'Georgia') ?? null;
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
            Georgia vs {benchmarkLabel} schools ranked by {metricLabels[rankingMetric].toLowerCase()}. Data reflects all athlete posts.
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


      <div className="grid md:grid-cols-3 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Georgia Rank</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black" style={{ color: colors.primary }}>
              {kyRank ? `#${kyRank}` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mb-1">of {rankedSchools.length}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">{metricLabels[rankingMetric]} vs {benchmarkLabel}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Georgia Value</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">
              {rankingMetric === 'followers' || rankingMetric === 'posts' ? formatNumber(kyValue) : `${kyValue}%`}
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
              ? <>Current leader is <span className="font-semibold">{topSchool.name}</span> at {rankingMetric === 'followers' || rankingMetric === 'posts' ? formatNumber(topSchool[rankingMetric]) : `${topSchool[rankingMetric]}%`}. Georgia is {kyRank ? `#${kyRank}` : 'unranked'} with {rankingMetric === 'followers' || rankingMetric === 'posts' ? formatNumber(kyValue) : `${kyValue}%`}.</>
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
                const isKY = school.name === 'Georgia';
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
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: isKY ? colors.primary : colors.text }}>
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
  const [georgiaTeamPosts, setGeorgiaTeamPosts] = useState<TeamPostItem[]>([]);
  const [_secTeamPosts, setSecTeamPosts] = useState<TeamPostItem[]>([]);

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
        // Try pre-extracted Georgia file first, then fall back to larger sources
        for (const source of [
          '/data/georgia-content-posts.json',
          '/data/socialMedia.roster_contents (8).json',
          '/data/NCAA_contents (2).json',
        ]) {
          if (athleteRows.length > 0) break;
          try {
            const res = await fetch(source);
            if (!res.ok) continue;
            const data = (await res.json()) as any[];
            const filtered = source.includes('georgia-content-posts')
              ? data
              : data.filter((row) => ['Georgia', 'UGA'].includes(row?.athlete?.school?.name));
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

        const georgiaTeamRows = (await fetchFirstJson([
          '/data/georgia_teams_contents.json',
          '/data/georgia.team_contents.json',
          '/data/georgia.team_contents.json',
        ])) || [];
        const normalizedGeorgiaTeamPosts: TeamPostItem[] = georgiaTeamRows.map((post, index) => {
          const likes = Number(post?.metrics?.likes || 0);
          const comments = Number(post?.metrics?.comments || 0);
          return {
            id: String(post?._id || `georgia-team-${index}`),
            thumbnail: String(post?.url || ''),
            postLink: String(post?.permalink || post?.url || ''),
            caption: getCaptionText(post?.caption || post?.text),
            teamName: String(post?.team?.name || 'Georgia Team'),
            schoolName: String(post?.team?.school?.name || 'Georgia'),
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
          setGeorgiaTeamPosts(normalizedGeorgiaTeamPosts);
          setSecTeamPosts(normalizedSECPosts);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAthletePosts([]);
          setGeorgiaTeamPosts([]);
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

  const sortedGeorgiaTeamPosts = useMemo(() => [...georgiaTeamPosts].sort((a, b) => b.interactions - a.interactions), [georgiaTeamPosts]);
  const topGeorgiaTeamPost = sortedGeorgiaTeamPosts[0];
  const top10GeorgiaTeamPosts = sortedGeorgiaTeamPosts.slice(0, 10);


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
                <p className="text-xs" style={{ color: colors.textMuted }}>Pulling athlete and team posts for Georgia.</p>
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
              {[{ title: 'Best WITH Georgia IP', post: championWithIP }, { title: 'Best WITHOUT IP', post: championWithoutIP }].map((item) => (
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
          {/* Top Georgia Team Page Post */}
          <div>
            <SectionHeader primary="TOP GEORGIA " secondary="TEAM PAGE POST" />
            <div className="mt-4">
              <GlassCard>
                {topGeorgiaTeamPost ? (
                  <a
                    href={topGeorgiaTeamPost.postLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {renderThumbnail(topGeorgiaTeamPost.thumbnail, topGeorgiaTeamPost.teamName)}
                    <div className="space-y-3">
                      <p className="font-semibold text-base" style={{ color: colors.text }}>{topGeorgiaTeamPost.teamName}</p>
                      <p className="text-xs text-gray-500">{topGeorgiaTeamPost.dateLabel}</p>
                      {topGeorgiaTeamPost.caption && (
                        <p className="text-sm line-clamp-3" style={{ color: colors.textMuted }}>
                          {topGeorgiaTeamPost.caption}
                        </p>
                      )}
                      <p className="text-sm" style={{ color: colors.textMuted }}>{topGeorgiaTeamPost.schoolName}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Interactions</p>
                          <p className="font-semibold">{formatNumber(topGeorgiaTeamPost.interactions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Engagement Rate</p>
                          <p className="font-semibold">{formatPercent(topGeorgiaTeamPost.engagementRate)}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No Georgia team page posts available.</p>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Top 10 Georgia Team Page Posts */}
          <div>
            <SectionHeader primary="TOP 10 " secondary="GEORGIA TEAM PAGE POSTS" />
            <div className="space-y-3 mt-4">
              {top10GeorgiaTeamPosts.map((post, idx) => (
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
              {top10GeorgiaTeamPosts.length === 0 && <p className="text-sm text-gray-500">No Georgia team page posts available.</p>}
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
        let rows: GeorgiaRosterTeam[] | null = null;
        for (const path of ['/data/georgia_teams_metrics.json', '/data/georgia.roster_teams.json', '/data/georgia.roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              rows = (await response.json()) as GeorgiaRosterTeam[];
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

  const ukBlue = '#BA0C2F';

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionHeader primary="GEORGIA " secondary="TEAM PAGES" />
          <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
            {view === 'overview' ? 'Official Georgia athletics social account performance.' : 'Benchmark Georgia team pages against conference and NCAA.'}
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
              color: view === 'overview' ? colors.primary : colors.textMuted,
              boxShadow: view === 'overview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Georgia
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className="px-4 py-1.5 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
            style={{
              backgroundColor: view === 'leaderboard' ? '#fff' : 'transparent',
              color: view === 'leaderboard' ? colors.primary : colors.textMuted,
              boxShadow: view === 'leaderboard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Leaderboard
          </button>
        </div>
      </div>

      {view === 'leaderboard' ? (
        <GeorgiaTeamPageLeaderboard />
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

      </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TEAM PAGE LEADERBOARD (Georgia)
// ═══════════════════════════════════════════════════════════════
interface KYTeamRosterRow {
  schoolName: string;
  conferenceName: string;
  sport: string;
  metrics?: { thirtyDays?: { followers?: number; contentCount?: number; likes?: number; comments?: number; engagementRate?: number } };
}

interface KYSportSchoolEntry {
  name: string;
  conf: string;
  followers: number;
  posts: number;
  likes: number;
  engagementRate: number;
}

function GeorgiaTeamPageLeaderboard() {
  const [rawRows, setRawRows] = useState<KYTeamRosterRow[]>([]);
  const [scope, setScope] = useState<'conference' | 'ncaa'>('conference');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [sortMetric, setSortMetric] = useState<'followers' | 'posts' | 'likes'>('followers');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/data/roster_teams.json');
        if (!res.ok) return;
        const rows = (await res.json()) as KYTeamRosterRow[];
        if (!cancelled) setRawRows(rows);
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Get available sports that Georgia has
  const ukSports = useMemo(() => {
    const sports = rawRows.filter(r => r.schoolName === 'Georgia').map(r => r.sport);
    return [...new Set(sports)].sort((a, b) => formatSportLabel(a).localeCompare(formatSportLabel(b)));
  }, [rawRows]);

  const isConference = scope === 'conference';

  const filtered = useMemo(() => {
    let rows = rawRows;
    if (isConference) rows = rows.filter(r => r.conferenceName === 'SEC');
    if (selectedSport !== 'ALL') rows = rows.filter(r => r.sport === selectedSport);

    // Aggregate by school
    const map: Record<string, KYSportSchoolEntry> = {};
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

  const ukIndex = filtered.findIndex(s => s.name === 'Georgia');
  const ukRank = ukIndex >= 0 ? ukIndex + 1 : null;
  const scopeLabel = isConference ? 'SEC' : 'NCAA';
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
              {ukSports.map(s => (
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
              color: isConference ? colors.primary : colors.textMuted,
              boxShadow: isConference ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            SEC
          </button>
          <button
            onClick={() => setScope('ncaa')}
            className="px-4 py-2 rounded-md text-xs font-semibold transition-all motion-reduce:transition-none"
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

      {/* Summary Cards */}
      {ukRank != null && (
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Georgia {sportLabel} Rank</p>
            <p className="text-4xl font-black" style={{ color: colors.primary }}>#{ukRank} <span className="text-sm font-normal text-gray-500">of {filtered.length}</span></p>
            <p className="text-xs text-gray-400 mt-1">{scopeLabel} · {sportLabel} · by followers</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Followers</p>
            <p className="text-4xl font-black text-gray-900">{formatNumber(filtered[ukIndex]?.followers || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">{formatNumber(filtered[ukIndex]?.posts || 0)} posts (30 days)</p>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">30-Day Likes</p>
            <p className="text-4xl font-black text-gray-900">{formatNumber(filtered[ukIndex]?.likes || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">{filtered[ukIndex]?.posts ? Math.round((filtered[ukIndex]?.likes || 0) / filtered[ukIndex].posts).toLocaleString() : 0} avg per post</p>
          </GlassCard>
        </div>
      )}

      {/* Rankings Table */}
      <div className="rounded-2xl bg-white overflow-hidden max-h-[500px] overflow-y-auto shadow-sm">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr style={{ backgroundColor: colors.primary }}>
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
              const isUK = school.name === 'Georgia';
              return (
                <tr
                  key={school.name}
                  className={`border-b border-gray-100 transition-colors ${isUK ? 'bg-blue-50 hover:bg-blue-100/50' : idx % 2 === 1 ? 'bg-gray-50/50 hover:bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-3 py-3 text-center">
                    {idx < 3 ? (
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto" style={{ backgroundColor: isUK ? colors.primary : '#d1d5db', color: isUK ? '#fff' : colors.text }}>
                        {idx + 1}
                      </span>
                    ) : isUK ? (
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto" style={{ backgroundColor: colors.primary, color: '#fff' }}>
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">{idx + 1}</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 ${isUK ? 'font-bold' : 'font-semibold'}`} style={{ color: isUK ? colors.primary : colors.text }}>
                    <div className="flex items-center gap-2">
                      {isUK && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />}
                      {school.name}
                    </div>
                  </td>
                  {!isConference && <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{school.conf}</td>}
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: isUK ? colors.primary : colors.text }}>{formatNumber(school.followers)}</td>
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
// MAIN EXPORT: GeorgiaIPImpact
// ═══════════════════════════════════════════════════════════════
export function GeorgiaIPImpact({ onBack }: { onBack?: () => void }) {
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

    const loadGeorgiaSports = async () => {
      try {
        let rows: GeorgiaRosterTeam[] | null = null;
        for (const path of ['/data/georgia_teams_metrics.json', '/data/georgia.roster_teams.json', '/data/georgia.roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              rows = (await response.json()) as GeorgiaRosterTeam[];
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

    loadGeorgiaSports();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadOverviewData = async () => {
      try {
        const response = await fetch('/data/georgia-athlete-overview.json');
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
      {/* Georgia background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/georgia-bg.jpg)',
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
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/61.png"
                alt="Georgia"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div>
                <h1
                  className="text-lg sm:text-2xl font-bold uppercase tracking-tight whitespace-nowrap"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
                >
                  <span style={{ color: colors.primary }}>Georgia </span>
                  <span className="hidden sm:inline"><span style={{ color: colors.primary }}>Bulldogs </span><span style={{ color: colors.headerGray }}>IP Impact Report</span></span>
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
