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
  primary: '#CC0033',
  primaryDark: '#A00028',
  primaryLight: '#E23A5F',
  gray: '#a7b1b7',
  white: '#ffffff',
  positive: '#10b981',
  negative: '#ef4444',
  accent: '#5A0C1B',
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

interface RutgersRosterMetricWindow {
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

interface RutgersRosterTeam {
  sport?: string;
  metrics?: {
    thirtyDays?: RutgersRosterMetricWindow;
    sevenDays?: RutgersRosterMetricWindow;
    ninetyDays?: RutgersRosterMetricWindow;
  };
}

interface SchoolFollowerRosterRow {
  schoolName?: string;
  conferenceName?: string;
  sport?: string;
  metrics?: {
    ninetyDays?: {
      followers?: number;
      contentCount?: number;
      logoContentCount?: number;
      collaborationContentCount?: number;
      organizationCollaborationContentCount?: number;
      avgEngagementRateWithLogo?: number;
      avgEngagementRateWithCollaboration?: number;
      avgEngagementRateWithOrganizationCollaboration?: number;
    };
    thirtyDays?: {
      followers?: number;
      contentCount?: number;
      logoContentCount?: number;
      collaborationContentCount?: number;
      organizationCollaborationContentCount?: number;
      avgEngagementRateWithLogo?: number;
      avgEngagementRateWithCollaboration?: number;
      avgEngagementRateWithOrganizationCollaboration?: number;
    };
    sevenDays?: {
      followers?: number;
      contentCount?: number;
      logoContentCount?: number;
      collaborationContentCount?: number;
      organizationCollaborationContentCount?: number;
      avgEngagementRateWithLogo?: number;
      avgEngagementRateWithCollaboration?: number;
      avgEngagementRateWithOrganizationCollaboration?: number;
    };
  };
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

const TEAM_ROSTER_DATA_PATHS = [
  '/data/roster_teams.json',
  '/data/Teams.json',
  '/data/ip-roster-teams.json',
] as const;

async function fetchBestTeamRosterRows(): Promise<SchoolFollowerRosterRow[]> {
  for (const path of TEAM_ROSTER_DATA_PATHS) {
    try {
      const res = await fetch(path);
      if (!res.ok) continue;
      const json = await res.json();
      if (!Array.isArray(json)) continue;
      return json as SchoolFollowerRosterRow[];
    } catch {
      // keep trying next dataset
    }
  }

  return [];
}

function normalizeSchoolKey(name: string): string {
  const cleaned = String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\([^)]*\)/g, '')
    .trim();
  const condensed = cleaned.replace(/[^a-z0-9]/g, '');
  if (!condensed) return '';

  const aliases: Record<string, string> = {
    universityofmaryland: 'maryland',
    universityofnewmexico: 'newmexico',
    newmexicostateuniversity: 'newmexicostate',
    wichitastateuniversity: 'wichitastate',
    southernmethodistuniversity: 'smu',
    southernmethodistuniversitysmu: 'smu',
    riceuniversity: 'rice',
    brighamyounguniversity: 'byu',
    brighamyounguniversitybyu: 'byu',
    byu: 'byu',
    olemiss: 'olemiss',
    universityofmississippi: 'mississippi',
    mississippi: 'mississippi',
    mississippistate: 'mississippistate',
    mississippistateuniversity: 'mississippistate',
    msstate: 'mississippistate',
    texasam: 'texasam',
    texasaandm: 'texasam',
    vanderbilt: 'vanderbilt',
    rutgers: 'rutgers',
    universityofrutgers: 'rutgers',
  };

  if (aliases[condensed]) return aliases[condensed];

  const simplified = cleaned
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .filter((token) => !['the', 'university', 'college', 'of', 'at'].includes(token))
    .join('');

  return aliases[simplified] ?? simplified;
}

const ACC_SCHOOL_KEYS = new Set([
  'rutgers',
  'ohiostate',
  'michigan',
  'michiganstate',
  'pennstate',
  'wisconsin',
  'iowa',
  'minnesota',
  'indiana',
  'illinois',
  'northwestern',
  'nebraska',
  'maryland',
  'purdue',
  'ucla',
  'usc',
  'washington',
  'oregon',
]);

function isAccSchoolName(name: string): boolean {
  return ACC_SCHOOL_KEYS.has(normalizeSchoolKey(name));
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

function formatTeamPageLabel(teamName: string): string {
  const raw = String(teamName || '').trim();
  if (!raw) return 'Rutgers Team';

  const normalized = raw.replace(/\s+/g, '_');
  const looksLikeSportKey = normalized.includes('_') || /^[A-Z0-9_&]+$/.test(normalized);
  if (!looksLikeSportKey) return raw;

  return normalized
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((word) => {
      if (word === 'mens') return "Men's";
      if (word === 'womens') return "Women's";
      if (word === 'and') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function buildSportDataFromRoster(rows: RutgersRosterTeam[]): SportSignalData {
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
  totalFollowers?: number;
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
// CLEMSON IP DATA (Source of Truth)
// ═══════════════════════════════════════════════════════════════
const ipData = {
  totalFollowers: 1726437,
  totalPosts: 3351,
  totalLikes: 6996394,
  totalComments: 174543,
  engagementRate: 0.0012395120245154256,
  baseline: { posts: 2666, engagementRate: 0.0011079618868749125 },
  postsWithIP: 685,
  ipAdoptionRate: 20.4,
  avgLift: 402.9908686144777,
  totalEmv: 3760011.5,
  collaboration: {
    posts: 86, likes: 21074.662790697676, comments: 258.98837209302326,
    engagementRate: 0.012357040055785817, delta: 1205.3073303916563, emv: 930382,
    baselineEngRate: 0.0009466766766779819, baselinePosts: 3265,
    baselineLikes: 1587.740581929556, baselineComments: 46.63705972434916,
  } as IPSignalData,
  logo: {
    posts: 585, likes: 2962.7470085470086, comments: 73.06495726495727,
    engagementRate: 0.0017584261492379772, delta: 55.64552606773469, emv: 1770465,
    baselineEngRate: 0.0011297633755773587, baselinePosts: 2766,
    baselineLikes: 1902.8152566883587, baselineComments: 47.650036153289946,
  } as IPSignalData,
  mention: {
    posts: 41, likes: 1006.3170731707318, comments: 27.853658536585368,
    engagementRate: 0.0005990202548412233, delta: -51.9802506159579, emv: 22381,
    baselineEngRate: 0.0012474456083693961, baselinePosts: 3310,
    baselineLikes: 2101.2492447129907, baselineComments: 52.38700906344411,
  } as IPSignalData,
  partnerships: [] as Partnership[],
};

// ═══════════════════════════════════════════════════════════════
// ATHLETE & BENCHMARK DATA
// ═══════════════════════════════════════════════════════════════
const fallbackSportData: Record<string, Record<string, { with: { posts: number; avgLikes: number; avgComments: number; engagementRate: number }; without: { posts: number; avgLikes: number; avgComments: number; engagementRate: number } }>> = {
  'ALL_SPORTS': {
    logo: { with: { posts: 1753, avgLikes: 2241, avgComments: 47, engagementRate: 0.2691 }, without: { posts: 2546, avgLikes: 1728, avgComments: 37, engagementRate: 0.1765 } },
    mention: { with: { posts: 309, avgLikes: 2459, avgComments: 31, engagementRate: 0.2280 }, without: { posts: 3990, avgLikes: 1897, avgComments: 42, engagementRate: 0.2132 } },
    collab: { with: { posts: 402, avgLikes: 4391, avgComments: 43, engagementRate: 0.4284 }, without: { posts: 3897, avgLikes: 1684, avgComments: 41, engagementRate: 0.1922 } }
  }
};

const fallbackTeamFollowersBySport: Record<string, number> = {};

const secSchools = [
  { name: 'Rutgers University', conf: 'Big 10', posts: 4299, adoption: 47.7, logoEng: 26.91, mentionEng: 22.80, collabEng: 42.84, followers: 1671393 },
  { name: 'Texas A&M', conf: 'Big 10', posts: 4317, adoption: 51.4, logoEng: 37.33, mentionEng: 70.72, collabEng: 69.92, followers: 1878601 },
  { name: 'Auburn', conf: 'Big 10', posts: 6405, adoption: 48.1, logoEng: 32.51, mentionEng: 40.00, collabEng: 60.09, followers: 2323541 },
  { name: 'LSU', conf: 'Big 10', posts: 5450, adoption: 46.1, logoEng: 36.15, mentionEng: 48.38, collabEng: 77.49, followers: 5170563 },
  { name: 'Oklahoma', conf: 'Big 10', posts: 2802, adoption: 45.6, logoEng: 38.26, mentionEng: 18.39, collabEng: 0, followers: 1703577 },
  { name: 'Ole Miss', conf: 'Big 10', posts: 2309, adoption: 43.6, logoEng: 35.18, mentionEng: 46.81, collabEng: 61.42, followers: 0 },
  { name: 'Missouri', conf: 'Big 10', posts: 5726, adoption: 42.6, logoEng: 34.86, mentionEng: 38.38, collabEng: 86.37, followers: 1271953 },
  { name: 'Alabama', conf: 'Big 10', posts: 5750, adoption: 40.3, logoEng: 34.34, mentionEng: 47.36, collabEng: 44.94, followers: 3966222 },
  { name: 'Arkansas', conf: 'Big 10', posts: 5715, adoption: 36.8, logoEng: 36.05, mentionEng: 50.99, collabEng: 67.65, followers: 2827038 },
  { name: 'Mississippi State', conf: 'Big 10', posts: 2239, adoption: 34.4, logoEng: 23.38, mentionEng: 12.26, collabEng: 35.50, followers: 0 },
  { name: 'Vanderbilt', conf: 'Big 10', posts: 2246, adoption: 30.0, logoEng: 25.10, mentionEng: 56.55, collabEng: 115.29, followers: 0 },
  { name: 'Texas', conf: 'Big 10', posts: 6186, adoption: 26.4, logoEng: 37.31, mentionEng: 44.84, collabEng: 86.53, followers: 3552007 },
  { name: 'Georgia', conf: 'Big 10', posts: 6868, adoption: 44.9, logoEng: 27.14, mentionEng: 39.78, collabEng: 61.81, followers: 2864099 },
  { name: 'Tennessee', conf: 'Big 10', posts: 2459, adoption: 14.5, logoEng: 32.32, mentionEng: 21.92, collabEng: 87.13, followers: 1848323 },
  { name: 'Florida', conf: 'Big 10', posts: 2693, adoption: 12.9, logoEng: 33.36, mentionEng: 0, collabEng: 0, followers: 3163738 },
];

const ncaaD1Schools = [
  { name: 'Old Dominion', conf: 'Sun Belt', posts: 1577, adoption: 60.1, logoEng: 18.46, mentionEng: 18.06, collabEng: 37.56, followers: 406916 },
  { name: 'New Mexico', conf: 'MWC', posts: 1182, adoption: 55.6, logoEng: 26.86, mentionEng: 44.00, collabEng: 50.58, followers: 0 },
  { name: 'Rutgers University', conf: 'Big 10', posts: 4299, adoption: 47.7, logoEng: 26.91, mentionEng: 22.80, collabEng: 42.84, followers: 1671393 },
  { name: 'Texas Tech', conf: 'Big 12', posts: 2355, adoption: 53.0, logoEng: 30.88, mentionEng: 0, collabEng: 88.62, followers: 0 },
  { name: 'Texas A&M', conf: 'Big 10', posts: 4317, adoption: 51.4, logoEng: 37.33, mentionEng: 70.72, collabEng: 69.92, followers: 1878601 },
  { name: 'Virginia Tech', conf: 'Big 10', posts: 3978, adoption: 51.3, logoEng: 27.97, mentionEng: 33.05, collabEng: 18.48, followers: 1872167 },
  { name: 'Nebraska', conf: 'Big 10', posts: 4026, adoption: 50.8, logoEng: 34.47, mentionEng: 50.63, collabEng: 80.32, followers: 3126161 },
  { name: 'Washington State', conf: 'Pac-12', posts: 948, adoption: 50.4, logoEng: 31.20, mentionEng: 39.11, collabEng: 60.15, followers: 186487 },
  { name: 'Maryland', conf: 'Big 10', posts: 2392, adoption: 50.4, logoEng: 22.93, mentionEng: 27.67, collabEng: 40.22, followers: 0 },
  { name: 'Michigan', conf: 'Big 10', posts: 4042, adoption: 50.1, logoEng: 34.39, mentionEng: 50.18, collabEng: 36.87, followers: 2381406 },
  { name: 'Miami', conf: 'Big 10', posts: 2083, adoption: 49.4, logoEng: 34.87, mentionEng: 16.23, collabEng: 69.85, followers: 0 },
  { name: 'Notre Dame', conf: 'Big 10', posts: 2786, adoption: 48.9, logoEng: 40.76, mentionEng: 69.86, collabEng: 75.29, followers: 1578114 },
  { name: 'Houston', conf: 'Big 12', posts: 1987, adoption: 48.7, logoEng: 20.32, mentionEng: 0, collabEng: 49.54, followers: 0 },
  { name: 'Ohio State', conf: 'Big 10', posts: 9629, adoption: 48.4, logoEng: 56.85, mentionEng: 87.83, collabEng: 64.56, followers: 5546349 },
  { name: 'Auburn', conf: 'Big 10', posts: 6405, adoption: 48.1, logoEng: 32.51, mentionEng: 40.00, collabEng: 60.09, followers: 2323541 },
  { name: 'Oregon', conf: 'Pac-12', posts: 2073, adoption: 46.2, logoEng: 47.44, mentionEng: 43.36, collabEng: 104.75, followers: 0 },
  { name: 'LSU', conf: 'Big 10', posts: 5450, adoption: 46.1, logoEng: 36.15, mentionEng: 48.38, collabEng: 77.49, followers: 5170563 },
  { name: 'UTSA', conf: 'AAC', posts: 3773, adoption: 46.0, logoEng: 22.45, mentionEng: 30.57, collabEng: 34.82, followers: 835260 },
  { name: 'Oklahoma', conf: 'Big 10', posts: 2802, adoption: 45.6, logoEng: 38.26, mentionEng: 18.39, collabEng: 0, followers: 1703577 },
  { name: 'NC State', conf: 'Big 10', posts: 2565, adoption: 45.6, logoEng: 23.90, mentionEng: 40.87, collabEng: 48.35, followers: 1238519 },
  { name: 'Michigan State', conf: 'Big 10', posts: 2867, adoption: 45.3, logoEng: 33.48, mentionEng: 38.02, collabEng: 50.48, followers: 0 },
  { name: 'Baylor', conf: 'Big 12', posts: 7298, adoption: 45.1, logoEng: 42.63, mentionEng: 47.76, collabEng: 111.49, followers: 2110678 },
  { name: 'Wichita State', conf: 'AAC', posts: 1740, adoption: 44.8, logoEng: 22.14, mentionEng: 31.99, collabEng: 30.09, followers: 0 },
  { name: 'UCF', conf: 'Big 12', posts: 2409, adoption: 44.3, logoEng: 30.92, mentionEng: 42.17, collabEng: 44.31, followers: 1202431 },
  { name: 'New Mexico State', conf: 'C-USA', posts: 981, adoption: 44.1, logoEng: 20.18, mentionEng: 0, collabEng: 54.20, followers: 0 },
  { name: 'Cincinnati', conf: 'Big 12', posts: 4968, adoption: 43.7, logoEng: 26.05, mentionEng: 36.40, collabEng: 29.50, followers: 1043067 },
  { name: 'Penn State', conf: 'Big 10', posts: 8247, adoption: 43.5, logoEng: 37.82, mentionEng: 48.49, collabEng: 108.02, followers: 4114531 },
  { name: 'Ole Miss', conf: 'Big 10', posts: 2309, adoption: 43.6, logoEng: 35.18, mentionEng: 46.81, collabEng: 61.42, followers: 0 },
  { name: 'Indiana', conf: 'Big 10', posts: 2218, adoption: 43.4, logoEng: 26.75, mentionEng: 27.66, collabEng: 54.12, followers: 0 },
  { name: 'Arizona', conf: 'Big 12', posts: 4371, adoption: 43.1, logoEng: 27.02, mentionEng: 33.78, collabEng: 67.42, followers: 3260269 },
  { name: 'Missouri', conf: 'Big 10', posts: 5726, adoption: 42.6, logoEng: 34.86, mentionEng: 38.38, collabEng: 86.37, followers: 1271953 },
  { name: 'West Virginia', conf: 'Big 12', posts: 2288, adoption: 41.7, logoEng: 44.50, mentionEng: 8.87, collabEng: 0, followers: 0 },
  { name: 'SMU', conf: 'AAC', posts: 1848, adoption: 41.6, logoEng: 20.14, mentionEng: 31.95, collabEng: 32.85, followers: 0 },
  { name: 'Rice', conf: 'AAC', posts: 632, adoption: 41.1, logoEng: 19.80, mentionEng: 24.32, collabEng: 27.26, followers: 0 },
  { name: 'Alabama', conf: 'Big 10', posts: 5750, adoption: 40.3, logoEng: 34.34, mentionEng: 47.36, collabEng: 44.94, followers: 3966222 },
  { name: 'Georgia Tech', conf: 'Big 10', posts: 2066, adoption: 40.4, logoEng: 36.10, mentionEng: 0, collabEng: 49.88, followers: 0 },
  { name: 'Florida State', conf: 'Big 10', posts: 2130, adoption: 40.1, logoEng: 42.50, mentionEng: 13.33, collabEng: 0, followers: 0 },
  { name: 'Virginia', conf: 'Big 10', posts: 6496, adoption: 40.0, logoEng: 45.62, mentionEng: 38.90, collabEng: 55.11, followers: 2044598 },
  { name: 'Boston College', conf: 'Big 10', posts: 1539, adoption: 40.0, logoEng: 30.21, mentionEng: 43.32, collabEng: 47.85, followers: 0 },
  { name: 'Arkansas', conf: 'Big 10', posts: 5715, adoption: 36.8, logoEng: 36.05, mentionEng: 50.99, collabEng: 67.65, followers: 2827038 },
  { name: 'DePaul', conf: 'Big East', posts: 746, adoption: 36.5, logoEng: 19.30, mentionEng: 31.62, collabEng: 36.17, followers: 121473 },
  { name: 'Purdue', conf: 'Big 10', posts: 5286, adoption: 36.5, logoEng: 27.59, mentionEng: 38.19, collabEng: 41.02, followers: 1299880 },
  { name: 'Rutgers', conf: 'Big 10', posts: 2036, adoption: 36.0, logoEng: 27.39, mentionEng: 30.15, collabEng: 33.87, followers: 0 },
  { name: 'Arizona State', conf: 'Big 12', posts: 7777, adoption: 34.4, logoEng: 25.70, mentionEng: 34.18, collabEng: 54.73, followers: 2269788 },
  { name: 'Mississippi State', conf: 'Big 10', posts: 2239, adoption: 34.4, logoEng: 23.38, mentionEng: 12.26, collabEng: 35.50, followers: 0 },
  { name: 'BYU', conf: 'Big 12', posts: 7519, adoption: 34.3, logoEng: 28.50, mentionEng: 35.20, collabEng: 48.10, followers: 0 },
  { name: 'George Mason', conf: 'A-10', posts: 1959, adoption: 33.8, logoEng: 24.19, mentionEng: 33.46, collabEng: 12.39, followers: 0 },
  { name: 'Iowa', conf: 'Big 10', posts: 2254, adoption: 33.4, logoEng: 37.57, mentionEng: 40.37, collabEng: 46.35, followers: 0 },
  { name: 'Vanderbilt', conf: 'Big 10', posts: 2246, adoption: 30.0, logoEng: 25.10, mentionEng: 56.55, collabEng: 115.29, followers: 0 },
  { name: 'Washington', conf: 'Pac-12', posts: 2378, adoption: 27.7, logoEng: 29.95, mentionEng: 37.75, collabEng: 79.04, followers: 0 },
  { name: 'San Diego State', conf: 'MWC', posts: 3406, adoption: 26.8, logoEng: 23.77, mentionEng: 20.40, collabEng: 68.28, followers: 907225 },
  { name: 'Texas', conf: 'Big 10', posts: 6186, adoption: 26.4, logoEng: 37.31, mentionEng: 44.84, collabEng: 86.53, followers: 3552007 },
  { name: 'TCU', conf: 'Big 12', posts: 1707, adoption: 25.8, logoEng: 27.90, mentionEng: 12.80, collabEng: 0, followers: 0 },
  { name: 'San Diego', conf: 'WCC', posts: 2024, adoption: 25.2, logoEng: 15.98, mentionEng: 21.93, collabEng: 107.09, followers: 439463 },
  { name: 'Creighton', conf: 'Big East', posts: 2592, adoption: 24.6, logoEng: 28.23, mentionEng: 35.07, collabEng: 41.15, followers: 438009 },
  { name: 'Colorado', conf: 'Big 12', posts: 1418, adoption: 24.6, logoEng: 37.40, mentionEng: 6.34, collabEng: 0, followers: 0 },
  { name: 'Kansas', conf: 'Big 12', posts: 2423, adoption: 23.1, logoEng: 28.68, mentionEng: 43.56, collabEng: 97.37, followers: 1266884 },
  { name: 'Iowa State', conf: 'Big 12', posts: 2248, adoption: 22.6, logoEng: 39.86, mentionEng: 26.33, collabEng: 277.84, followers: 0 },
  { name: 'Rutgers University', conf: 'Big 10', posts: 3351, adoption: 20.4, logoEng: 35.76, mentionEng: 20.25, collabEng: 294.15, followers: 1726437 },
  { name: 'Kansas State', conf: 'Big 12', posts: 1680, adoption: 18.3, logoEng: 55.58, mentionEng: 11.86, collabEng: 0, followers: 0 },
  { name: 'Utah', conf: 'Big 12', posts: 2152, adoption: 18.2, logoEng: 35.71, mentionEng: 30.82, collabEng: 53.46, followers: 0 },
  { name: 'Oklahoma State', conf: 'Big 12', posts: 1934, adoption: 18.0, logoEng: 26.56, mentionEng: 10.43, collabEng: 0, followers: 0 },
  { name: 'Duke', conf: 'Big 10', posts: 1951, adoption: 16.6, logoEng: 22.40, mentionEng: 0, collabEng: 49.10, followers: 0 },
  { name: 'UNC', conf: 'Big 10', posts: 3056, adoption: 16.3, logoEng: 36.18, mentionEng: 19.32, collabEng: 371.32, followers: 1434088 },
  { name: 'Providence', conf: 'Big East', posts: 679, adoption: 15.8, logoEng: 20.43, mentionEng: 34.66, collabEng: 32.50, followers: 0 },
  { name: 'Minnesota', conf: 'Big 10', posts: 2354, adoption: 15.2, logoEng: 29.96, mentionEng: 47.57, collabEng: 50.81, followers: 882398 },
  { name: 'Georgia', conf: 'Big 10', posts: 6868, adoption: 44.9, logoEng: 27.14, mentionEng: 39.78, collabEng: 61.81, followers: 2864099 },
  { name: 'Tennessee', conf: 'Big 10', posts: 2459, adoption: 14.5, logoEng: 32.32, mentionEng: 21.92, collabEng: 87.13, followers: 1848323 },
  { name: 'Illinois', conf: 'Big 10', posts: 2731, adoption: 13.7, logoEng: 32.81, mentionEng: 40.17, collabEng: 45.90, followers: 0 },
  { name: 'Florida', conf: 'Big 10', posts: 2693, adoption: 12.9, logoEng: 33.36, mentionEng: 0, collabEng: 0, followers: 3163738 },
  { name: 'Boise State', conf: 'MWC', posts: 4000, adoption: 12.3, logoEng: 35.18, mentionEng: 24.08, collabEng: 43.16, followers: 724157 },
  { name: 'Wisconsin', conf: 'Big 10', posts: 5982, adoption: 12.0, logoEng: 32.82, mentionEng: 19.67, collabEng: 65.11, followers: 1812655 },
  { name: 'Pittsburgh', conf: 'Big 10', posts: 2475, adoption: 11.8, logoEng: 40.72, mentionEng: 54.80, collabEng: 122.46, followers: 740916 },
  { name: 'UCLA', conf: 'Big 10', posts: 7077, adoption: 11.6, logoEng: 32.89, mentionEng: 21.37, collabEng: 56.61, followers: 5487049 },
  { name: 'USC', conf: 'Big 10', posts: 5948, adoption: 11.0, logoEng: 34.18, mentionEng: 54.59, collabEng: 86.52, followers: 4376029 },
  { name: 'Robert Morris', conf: 'Horizon', posts: 2687, adoption: 7.4, logoEng: 11.35, mentionEng: 0, collabEng: 362.39, followers: 465010 },
];

const conferenceAvg = { adoption: 36.0, logoEng: 32.7, mentionEng: 37.3, collabEng: 59.8 };
const ncaaD1Avg = { adoption: 34.7, logoEng: 31.3, mentionEng: 28.8, collabEng: 57.4 };
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
    totalFollowers: ipData.totalFollowers,
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
          <span style={{ color: colors.primary }}>Rutgers </span>
          <span style={{ color: colors.headerGray }}>Athlete Overview</span>
        </h1>

        {/* KPI Chips Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIChip
            label="Total Followers"
            value={formatNumber(overview.totalFollowers ?? ipData.totalFollowers)}
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
                Rutgers posts show{' '}
                <span className="font-bold" style={{ color: colors.primary }}>{overview.ipAdoptionRate}% IP adoption</span>{' '}
                across the program, signaling strong and consistent use of school identity in athlete content.
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
                <span className="font-bold">{formatNumber(overview.postsWithIP)} posts</span> ({overview.ipAdoptionRate}%) feature Rutgers IP,
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
            tooltip="Athlete posts co-authored or tagged with official Rutgers account"
            opportunity={`Only ${formatNumber(overview.collaboration.posts)} collab posts exist. Scaling collaborations could significantly amplify total EMV.`}
          />
          <IPModeCard
            title="Visual IP"
            icon={<Camera className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.logo.posts}
            delta={overview.logo.delta}
            avgEngagement={formatPercent(overview.logo.engagementRate)}
            emv={formatCurrency(logoEMV)}
            tooltip="Athlete posts with Rutgers logo detected in media"
            opportunity={`${formatNumber(overview.logo.posts)} posts feature Rutgers logos. Visual IP is the most common signal and a strong engagement driver.`}
          />
          <IPModeCard
            title="Mention"
            icon={<AtSign className="w-5 h-5" style={{ color: colors.primary }} />}
            posts={overview.mention.posts}
            delta={overview.mention.delta}
            avgEngagement={formatPercent(overview.mention.engagementRate)}
            emv={formatCurrency(mentionEMV)}
            tooltip="Athlete posts with @mention or text reference to Rutgers"
            opportunity={`${formatNumber(overview.mention.posts)} posts mention Rutgers in captions, driving +${overview.mention.delta.toFixed(1)}% engagement lift. Encouraging athletes to tag Rutgers team pages in captions could amplify this further.`}
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
            Data reflects <span className="font-semibold">Rutgers athlete personal social media accounts</span>, including collaboration posts with official team pages.
            Metrics track how athletes use Rutgers IP (logos, mentions, collaborations) in their content. Analysis covers{' '}
            <span className="font-semibold">{formatNumber(overview.totalPosts)} posts</span> from{' '}
            <span className="font-semibold">{formatNumber(overview.totalFollowers ?? ipData.totalFollowers)} combined followers</span>.
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
          Posts with Rutgers {currentSignal?.label.toLowerCase()} drive{' '}
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
        Engagement rate is estimated as <span className="font-semibold">(likes + comments) / athlete followers</span> using mapped Rutgers athlete follower totals.
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
  const [partnershipRows, setPartnershipRows] = useState<Partnership[]>([]);
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

  useEffect(() => {
    let canceled = false;
    const loadRutgersPartnerships = async () => {
      try {
        const response = await fetch('/data/rutgers-partnerships.json');
        if (!response.ok) return;
        const payload = await response.json();
        const sponsorPartners = Array.isArray(payload?.sponsorPartners) ? payload.sponsorPartners : [];
        const mapped = sponsorPartners
          .map((row: any): Partnership => ({
            brand: String(row?.sponsorPartner || '').trim(),
            posts: Number(row?.totalContents || 0),
            avgLikes: Number(row?.avgLikes || 0),
            avgComments: Number(row?.avgComments || 0),
            emv: Number(row?.emv || 0),
            engagementRate: Number(row?.engagementRate || 0),
            liftMultiplier: Number(row?.engagementRateLift || 0),
          }))
          .filter((row: Partnership) => row.brand.length > 0 && row.posts > 0);

        if (!canceled) {
          setPartnershipRows(mapped);
        }
      } catch {
        // keep fallback below
      }
    };
    loadRutgersPartnerships();
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

  const getPartnershipEMV = (p: Partnership): number =>
    calculateEMV(p.avgLikes * p.posts, p.avgComments * p.posts);

  const allSorted = useMemo(() => {
    const source = partnershipRows.length > 0 ? partnershipRows : ipData.partnerships;
    const result = [...source];
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
  }, [sortKey, sortDir, partnershipRows]);

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
          {(partnershipRows.length > 0 ? partnershipRows.length : ipData.partnerships.length)} partnerships
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
          <div>
            <SectionHeader primary="ALL " secondary="PARTNERSHIPS" />
            <p className="text-sm text-gray-500 mt-1">All brands with disclosed sponsorships in athlete posts, sorted by {(sortOptions as Array<{key: keyof Partnership; label: string}>).find(o => o.key === sortKey)?.label.toLowerCase() ?? 'engagement lift'}.</p>
          </div>
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
  type BenchmarkSchool = {
    name: string;
    conf: string;
    posts: number;
    adoption: number;
    logoEng: number;
    mentionEng: number;
    collabEng: number;
    followers: number;
  };

  const [benchmarkType, setBenchmarkType] = useState<'conference' | 'ncaa'>('conference');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [rankingMetric, setRankingMetric] = useState<'followers' | 'posts' | 'ipPosts' | 'logoEng' | 'mentionEng' | 'collabEng'>('followers');
  const [rosterRows, setRosterRows] = useState<SchoolFollowerRosterRow[]>([]);
  const [followersBySchool, setFollowersBySchool] = useState<Record<string, number>>({});
  const isConference = benchmarkType === 'conference';

  const dedupeSchools = (rows: BenchmarkSchool[]): BenchmarkSchool[] => {
    const map = new Map<string, BenchmarkSchool>();
    for (const row of rows) {
      const key = normalizeSchoolKey(row.name);
      if (!key) continue;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, row);
        continue;
      }

      // Prefer the row with richer coverage, then higher scale metrics.
      const currentScore =
        existing.posts +
        existing.followers +
        existing.logoEng +
        existing.mentionEng +
        existing.collabEng;
      const nextScore =
        row.posts +
        row.followers +
        row.logoEng +
        row.mentionEng +
        row.collabEng;

      if (nextScore > currentScore) {
        map.set(key, row);
      }
    }
    return [...map.values()];
  };

  const baseSchools: BenchmarkSchool[] = useMemo(() => {
    const base = (isConference
      ? ncaaD1Schools.filter((school) => isAccSchoolName(school.name))
      : ncaaD1Schools) as BenchmarkSchool[];
    const followerFallbackBySchool: Record<string, number> = {
      Iowa: 1004448,
      TCU: 732360,
      'Iowa State': 1238932,
    };
    const hydrated = base.map((school) => {
      const normalized = normalizeSchoolKey(school.name);
      const rosterFollowers =
        normalized === 'mississippistate'
          ? (followersBySchool[normalized] ?? followersBySchool.mississippi)
          : followersBySchool[normalized];
      return {
        ...school,
        followers:
          rosterFollowers && rosterFollowers > 0
            ? rosterFollowers
            : school.followers > 0
              ? school.followers
              : followerFallbackBySchool[school.name] ?? 0,
      };
    });
    return dedupeSchools(hydrated);
  }, [isConference, followersBySchool]);

  const availableSports = useMemo(() => {
    const sports = rosterRows
      .filter((row) => normalizeSchoolKey(String(row.schoolName || '')) === 'rutgers')
      .map((row) => row.sport)
      .filter((sport): sport is string => Boolean(sport));
    return [...new Set(sports)].sort((a, b) => formatSportLabel(a).localeCompare(formatSportLabel(b)));
  }, [rosterRows]);

  const schools: BenchmarkSchool[] = useMemo(() => {
    if (selectedSport === 'ALL') return baseSchools;

    const nameByKey: Record<string, string> = {};
    for (const school of [...baseSchools, ...secSchools]) {
      const key = normalizeSchoolKey(school.name);
      if (!nameByKey[key]) nameByKey[key] = school.name;
    }

    const map: Record<string, {
      name: string;
      conf: string;
      followers: number;
      posts: number;
      logoPosts: number;
      mentionPosts: number;
      collabPosts: number;
      logoEngTotal: number;
      mentionEngTotal: number;
      collabEngTotal: number;
    }> = {};

    for (const row of rosterRows) {
      if (row.sport !== selectedSport) continue;
      if (isConference && !['BIG 10', 'BIG TEN'].includes(String(row.conferenceName || '').trim().toUpperCase())) continue;

      const schoolName = String(row.schoolName || '').trim();
      const key = normalizeSchoolKey(schoolName);
      if (!key) continue;

      const m = row.metrics?.ninetyDays ?? row.metrics?.thirtyDays ?? row.metrics?.sevenDays;
      if (!m) continue;

      if (!map[key]) {
        map[key] = {
          name: nameByKey[key] || schoolName || key,
          conf: String(row.conferenceName || ''),
          followers: 0,
          posts: 0,
          logoPosts: 0,
          mentionPosts: 0,
          collabPosts: 0,
          logoEngTotal: 0,
          mentionEngTotal: 0,
          collabEngTotal: 0,
        };
      }

      const posts = toNumber(m.contentCount);
      const logoPosts = toNumber(m.logoContentCount);
      const mentionPosts = toNumber(m.organizationCollaborationContentCount);
      const collabPosts = toNumber(m.collaborationContentCount);

      map[key].followers += toNumber(m.followers);
      map[key].posts += posts;
      map[key].logoPosts += logoPosts;
      map[key].mentionPosts += mentionPosts;
      map[key].collabPosts += collabPosts;
      map[key].logoEngTotal += toNumber(m.avgEngagementRateWithLogo) * logoPosts;
      map[key].mentionEngTotal += toNumber(m.avgEngagementRateWithOrganizationCollaboration) * mentionPosts;
      map[key].collabEngTotal += toNumber(m.avgEngagementRateWithCollaboration) * collabPosts;
    }

    const dynamicSchools = Object.values(map).map((entry) => {
      const ipPosts = Math.max(entry.logoPosts, entry.mentionPosts, entry.collabPosts);
      const adoption = entry.posts > 0 ? (ipPosts / entry.posts) * 100 : 0;
      return {
        name: entry.name,
        conf: entry.conf,
        posts: entry.posts,
        adoption,
        logoEng: entry.logoPosts > 0 ? entry.logoEngTotal / entry.logoPosts : 0,
        mentionEng: entry.mentionPosts > 0 ? entry.mentionEngTotal / entry.mentionPosts : 0,
        collabEng: entry.collabPosts > 0 ? entry.collabEngTotal / entry.collabPosts : 0,
        followers: entry.followers,
      };
    });
    return dedupeSchools(dynamicSchools);
  }, [selectedSport, baseSchools, rosterRows, isConference]);

  const benchmarkLabel = isConference ? 'Big 10' : 'NCAA D1';
  const metricLabels = {
    followers: 'Followers',
    posts: 'Total Posts',
    ipPosts: 'IP Posts',
    logoEng: 'Visual IP Eng Rate',
    mentionEng: 'Mention Eng Rate',
    collabEng: 'Collab Eng Rate',
  } as const;
  const metricAverage = {
    followers: 0,
    posts: 0,
    ipPosts: 0,
    logoEng:
      selectedSport === 'ALL'
        ? (isConference ? conferenceAvg.logoEng : ncaaD1Avg.logoEng)
        : (schools.reduce((sum, school) => sum + school.logoEng, 0) / Math.max(1, schools.length)),
    mentionEng:
      selectedSport === 'ALL'
        ? (isConference ? conferenceAvg.mentionEng : ncaaD1Avg.mentionEng)
        : (schools.reduce((sum, school) => sum + school.mentionEng, 0) / Math.max(1, schools.length)),
    collabEng:
      selectedSport === 'ALL'
        ? (isConference ? conferenceAvg.collabEng : ncaaD1Avg.collabEng)
        : (schools.reduce((sum, school) => sum + school.collabEng, 0) / Math.max(1, schools.length)),
  };

  useEffect(() => {
    let cancelled = false;
    const loadRosterData = async () => {
      try {
        const rows = await fetchBestTeamRosterRows();
        if (cancelled || !Array.isArray(rows)) return;
        if (!cancelled) setRosterRows(rows);

        const next: Record<string, number> = {};
        for (const row of rows) {
          const key = normalizeSchoolKey(String(row.schoolName || ''));
          if (!key) continue;
          const metrics = row.metrics?.ninetyDays ?? row.metrics?.thirtyDays ?? row.metrics?.sevenDays;
          const followers = toNumber(metrics?.followers);
          if (followers > 0) next[key] = (next[key] || 0) + followers;
        }

        if (!cancelled) setFollowersBySchool(next);
      } catch {
        // keep static fallback values when dataset is unavailable
      }
    };
    loadRosterData();
    return () => { cancelled = true; };
  }, []);

  const rankedSchools = useMemo(() => {
    if (rankingMetric === 'ipPosts') {
      return [...schools].sort((a, b) => (b.posts * b.adoption / 100) - (a.posts * a.adoption / 100));
    }
    return [...schools].sort((a, b) => b[rankingMetric] - a[rankingMetric]);
  }, [schools, rankingMetric]);

  const kyIndex = rankedSchools.findIndex((s) => s.name === 'Rutgers University');
  const kyRank = kyIndex >= 0 ? kyIndex + 1 : null;
  const kySchool = rankedSchools.find((s) => s.name === 'Rutgers University') ?? null;
  const kyValue = kySchool ? (rankingMetric === 'ipPosts' ? Math.round(kySchool.posts * kySchool.adoption / 100) : kySchool[rankingMetric]) : 0;
  const avgValue = metricAverage[rankingMetric];
  const deltaVsAvg = kyValue - avgValue;
  const topSchool = rankedSchools[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <SectionHeader primary="IP " secondary="RANKINGS" />
          <p className="text-sm text-gray-500 mt-2">
            Rutgers vs {benchmarkLabel} schools ranked by {metricLabels[rankingMetric].toLowerCase()}. Data reflects {selectedSport === 'ALL' ? 'all athlete posts' : `${formatSportLabel(selectedSport)} athlete posts`}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-3 py-1.5 pr-8 text-xs font-semibold rounded-md border appearance-none cursor-pointer bg-white"
              style={{ color: colors.text, borderColor: colors.glassBorder }}
            >
              <option value="ALL">All Sports</option>
              {availableSports.map((sport) => (
                <option key={sport} value={sport}>{formatSportLabel(sport)}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
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
              Big 10
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
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Rutgers Rank</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black" style={{ color: colors.primary }}>
              {kyRank ? `#${kyRank}` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500 mb-1">of {rankedSchools.length}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">{metricLabels[rankingMetric]} vs {benchmarkLabel}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Rutgers Value</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-black text-gray-900">
              {rankingMetric === 'followers' || rankingMetric === 'posts' || rankingMetric === 'ipPosts' ? formatNumber(kyValue) : `${kyValue.toFixed(1)}%`}
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
            {topSchool
              ? <>Current leader is <span className="font-semibold">{topSchool.name}</span> at {rankingMetric === 'followers' || rankingMetric === 'posts' || rankingMetric === 'ipPosts' ? formatNumber(rankingMetric === 'ipPosts' ? Math.round(topSchool.posts * topSchool.adoption / 100) : topSchool[rankingMetric]) : `${topSchool[rankingMetric].toFixed(1)}%`}. Rutgers is {kyRank ? `#${kyRank}` : 'unranked'} with {rankingMetric === 'followers' || rankingMetric === 'posts' || rankingMetric === 'ipPosts' ? formatNumber(kyValue) : `${kyValue.toFixed(1)}%`}.</>
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
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('ipPosts')}>IP Posts {rankingMetric === 'ipPosts' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('logoEng')}>Visual IP Eng {rankingMetric === 'logoEng' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('mentionEng')}>Mention Eng {rankingMetric === 'mentionEng' ? '\u25BC' : ''}</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-white hidden md:table-cell cursor-pointer hover:text-white/80 select-none" onClick={() => setRankingMetric('collabEng')}>Collab Eng {rankingMetric === 'collabEng' ? '\u25BC' : ''}</th>
              </tr>
            </thead>
            <tbody>
              {rankedSchools.map((school, idx) => {
                const isKY = school.name === 'Rutgers University';
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
const MANUAL_WITH_IP_INCLUDE_IDS = new Set<string>([
  '68fbbd7a1e4a5fe96ac3699c', // Ian Schieffelin - May 2, 2025
  '68fbbabd1e4a5fe96ac3683a', // Cade Klubnik - Jul 23, 2025
  '68fbc1581e4a5fe96ac36ba9', // Tristan Smith - Jul 16, 2025
  '698a199f9660249963f18786', // Cade Klubnik - Jan 14, 2026
  '68fbc47a1e4a5fe96ac36dc0', // Jamison Brockenbrough - May 23, 2025
  '69407475024ac7059367b50a', // Cade Klubnik - Dec 9, 2025
  '68fbc0e61e4a5fe96ac36b66', // Shelton Lewis - Jan 23, 2025
  '68fbbfe01e4a5fe96ac36acc', // Peter Woods - Jun 11, 2024
  '68fbc24a1e4a5fe96ac36c43', // Emma Malewski - Oct 6, 2025
  '68fbb6831e4a5fe96ac3662d', // Cam Cannarella - Jun 2, 2025
  '68fbc10d1e4a5fe96ac36b75', // T.J. Moore - Oct 4, 2025
  '68fbbabd1e4a5fe96ac36834', // Cade Klubnik - Oct 9, 2025
  '68fbc1ed1e4a5fe96ac36c06', // Will Heldt - Dec 19, 2024
  '68fbba131e4a5fe96ac367e9', // Avieon Terrell - Oct 5, 2025
  '68fbbc571e4a5fe96ac36910', // Drew Woodaz - Dec 20, 2023
  '68fbb9ca1e4a5fe96ac367bb', // Antonio Williams - Jan 3, 2025
  '68fbb6601e4a5fe96ac36619', // Briggs Sullivan - Apr 27, 2025
  '68fbc0bc1e4a5fe96ac36b53', // Sammy Brown - Oct 2, 2024
  '68fbc24a1e4a5fe96ac36c44', // Emma Malewski - Oct 1, 2025
  '68fbbabd1e4a5fe96ac36835', // Cade Klubnik - Jul 24, 2025
  '698a14059660249963f0fc90', // T.J. Moore - Dec 4, 2025
  '68fbbb4e1e4a5fe96ac36888', // Chris Denson - Oct 20, 2025
  '698a14df9660249963f1115c', // Emma Malewski - Jan 29, 2026
  '68fbc24a1e4a5fe96ac36c42', // Emma Malewski - Oct 20, 2025
  '6940750a024ac7059367b521', // Wade Woodaz - Nov 23, 2025
  '68fbc24a1e4a5fe96ac36c41', // Emma Malewski - Oct 10, 2025
  '68fbc23b1e4a5fe96ac36c33', // Ella Cesario - Oct 13, 2025
  '68fbc1781e4a5fe96ac36bc8', // Tyler Brown - Mar 25, 2025
  '68fbbabd1e4a5fe96ac36832', // Cade Klubnik - Oct 14, 2025
  '68fbbc0e1e4a5fe96ac368e1', // Dee Crayton - Jul 29, 2024
  '68fbc10d1e4a5fe96ac36b7b', // T.J. Moore - Jul 17, 2025
  '68fbc1581e4a5fe96ac36bb3', // Tristan Smith - Sep 7, 2025
  '68fbc0501e4a5fe96ac36b13', // Robert Gunn III - Aug 4, 2023
  '68fbc0e61e4a5fe96ac36b61', // Shelton Lewis - Sep 8, 2024
  '68fbc1581e4a5fe96ac36bac', // Tristan Smith - Sep 24, 2025
  '68fbbb7f1e4a5fe96ac368a0', // Christopher Vizzina - Jul 25, 2025
  '68fbc24a1e4a5fe96ac36c48', // Emma Malewski - Oct 17, 2025
  '692bdac27a2525e5e3445839', // Dorian Jones - Aug 20, 2025 (Rutgers commitment post with visual IP)
  '692d24e27a2525e5e34471da', // Emily Leese - Senior year (Rutgers visual IP)
  '692b55a77a2525e5e3444222', // Ian Strong - @sportscenter mention should count as with IP
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
  const [rutgersTeamPosts, setRutgersTeamPosts] = useState<TeamPostItem[]>([]);
  const [_secTeamPosts, setSecTeamPosts] = useState<TeamPostItem[]>([]);

  const parseDateLabel = (value: unknown): string => {
    if (!value) return 'Unknown';
    const raw = typeof value === 'object' && value !== null && '$date' in (value as Record<string, unknown>)
      ? (value as { $date?: string }).$date
      : String(value);
    const date = new Date(raw || '');
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const hasIPSignal = (post: {
    hasOrganizationLogo?: boolean;
    hasOrganizationInCaption?: boolean;
    isOrganizationCollaboration?: boolean;
    isCollaboration?: boolean;
    sponsorPartner?: string;
    _id?: string;
  }): boolean =>
    Boolean(
      MANUAL_WITH_IP_INCLUDE_IDS.has(String(post._id || '')) ||
      post.hasOrganizationLogo ||
      post.hasOrganizationInCaption ||
      post.isOrganizationCollaboration ||
      post.isCollaboration ||
      String(post.sponsorPartner || '').trim(),
    );

  const getSignalTag = (post: {
    hasOrganizationLogo?: boolean;
    hasOrganizationInCaption?: boolean;
    isOrganizationCollaboration?: boolean;
    isCollaboration?: boolean;
    sponsorPartner?: string;
    _id?: string;
  }): string => {
    if (MANUAL_WITH_IP_INCLUDE_IDS.has(String(post._id || ''))) return 'With IP';
    if (post.isOrganizationCollaboration) return 'Org Collaboration';
    if (post.isCollaboration) return 'Collaboration';
    if (post.hasOrganizationLogo && post.hasOrganizationInCaption) return 'Logo + Mention';
    if (post.hasOrganizationLogo) return 'Visual IP';
    if (post.hasOrganizationInCaption) return 'Mention';
    if (String(post.sponsorPartner || '').trim()) return 'Sponsored';
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
        // Try pre-extracted Rutgers file first, then fall back to larger sources
        for (const source of [
          '/data/Rutgers_contents.json',
          '/data/rutgers_contents.json',
          '/data/rutgers-content-posts.json',
          '/data/socialMedia.roster_contents (8).json',
          '/data/NCAA_contents (2).json',
        ]) {
          if (athleteRows.length > 0) break;
          try {
            const res = await fetch(source);
            if (!res.ok) continue;
            const data = (await res.json()) as any[];
            const filtered = source.includes('rutgers-content-posts')
              ? data
              : data.filter((row) => ['Rutgers', 'Rutgers University', 'RU'].includes(row?.athlete?.school?.name));
            if (filtered.length > 0) athleteRows = filtered;
          } catch {
            // try next source
          }
        }

        const withIPInteractions = athleteRows
          .filter((post) => hasIPSignal(post))
          .map((post) => Number(post?.metrics?.likes || 0) + Number(post?.metrics?.comments || 0));
        const withoutIPInteractions = athleteRows
          .filter((post) => !hasIPSignal(post))
          .map((post) => Number(post?.metrics?.likes || 0) + Number(post?.metrics?.comments || 0));

        const withIPMedian = calcMedian(withIPInteractions);
        const withoutIPMedian = calcMedian(withoutIPInteractions);

        const normalizedAthletePosts: AthletePostItem[] = athleteRows.map((post, index) => {
          const likes = Number(post?.metrics?.likes || 0);
          const comments = Number(post?.metrics?.comments || 0);
          const interactions = likes + comments;
          const withIP = hasIPSignal(post);
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

        const rutgersTeamRows = (await fetchFirstJson([
          '/data/rutgers_teams_contents.json',
          '/data/Rutgers.team_contents.json',
          '/data/rutgers.team_contents.json',
        ])) || [];

        const allTeamRows = (await fetchFirstJson([
          '/data/Team_contents.json',
          '/data/team_contents.json',
        ])) || [];
        const normalizedBig10Posts: TeamPostItem[] = allTeamRows
          .filter((post) => ['BIG 10', 'BIG TEN'].includes(String(post?.team?.conference?.name || '').trim().toUpperCase()))
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

        const fallbackRutgersTeamRows = allTeamRows.filter(
          (post) => normalizeSchoolKey(String(post?.team?.school?.name || post?.schoolName || '')) === 'rutgers',
        );

        const rutgersSourceRows = rutgersTeamRows.length > 0 ? rutgersTeamRows : fallbackRutgersTeamRows;
        const normalizedRutgersTeamPosts: TeamPostItem[] = rutgersSourceRows.map((post, index) => {
          const likes = Number(post?.metrics?.likes || 0);
          const comments = Number(post?.metrics?.comments || 0);
          const rawTeamName = String(post?.team?.name || post?.sport || 'Rutgers Team');
          return {
            id: String(post?._id || `rutgers-team-${index}`),
            thumbnail: String(post?.url || ''),
            postLink: String(post?.permalink || post?.url || ''),
            caption: getCaptionText(post?.caption || post?.text),
            teamName: formatTeamPageLabel(rawTeamName),
            schoolName: String(post?.team?.school?.name || post?.schoolName || 'Rutgers University'),
            conferenceName: String(post?.team?.conference?.name || post?.conferenceName || 'Big 10'),
            dateLabel: parseDateLabel(post?.publishedAt || post?.createdAt),
            interactions: likes + comments,
            engagementRate: Number(post?.metrics?.engagementRate || 0),
          };
        });

        if (!cancelled) {
          setAthletePosts(normalizedAthletePosts);
          setRutgersTeamPosts(normalizedRutgersTeamPosts);
          setSecTeamPosts(normalizedBig10Posts);
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAthletePosts([]);
          setRutgersTeamPosts([]);
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

  const sortedRutgersTeamPosts = useMemo(() => [...rutgersTeamPosts].sort((a, b) => b.interactions - a.interactions), [rutgersTeamPosts]);
  const topRutgersTeamPost = sortedRutgersTeamPosts[0];
  const top10RutgersTeamPosts = sortedRutgersTeamPosts.slice(0, 10);


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
      <p className="text-sm text-gray-500 mt-2">Top athlete and team page posts from all posts analyzed. Engagement lift is measured against the school-wide median post.</p>

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

      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ backgroundColor: `${colors.accent}0D`, border: `1px solid ${colors.accent}33`, color: colors.textMuted }}
      >
        {contentView === 'athlete' ? (
          <>
            This view reflects <span className="font-semibold">Rutgers athlete personal posts only</span> (not official team pages).
          </>
        ) : (
          <>
            This view reflects <span className="font-semibold">official Rutgers team page posts only</span> (not athlete personal posts).
          </>
        )}
      </div>

      {isLoading ? (
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-transparent animate-spin" style={{ borderTopColor: colors.primary }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>Loading content performance...</p>
                <p className="text-xs" style={{ color: colors.textMuted }}>Pulling athlete and team posts for Rutgers.</p>
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
              {[{ title: 'Best WITH Rutgers IP', post: championWithIP }, { title: 'Best WITHOUT IP', post: championWithoutIP }].map((item) => (
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
          {/* Top Rutgers Team Page Post */}
          <div>
            <SectionHeader primary="TOP RUTGERS " secondary="TEAM PAGE POST" />
            <div className="mt-4">
              <GlassCard>
                {topRutgersTeamPost ? (
                  <a
                    href={topRutgersTeamPost.postLink || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {renderThumbnail(topRutgersTeamPost.thumbnail, topRutgersTeamPost.teamName)}
                    <div className="space-y-3">
                      <p className="font-semibold text-base" style={{ color: colors.text }}>{topRutgersTeamPost.teamName}</p>
                      <p className="text-xs text-gray-500">{topRutgersTeamPost.dateLabel}</p>
                      {topRutgersTeamPost.caption && (
                        <p className="text-sm line-clamp-3" style={{ color: colors.textMuted }}>
                          {topRutgersTeamPost.caption}
                        </p>
                      )}
                      <p className="text-sm" style={{ color: colors.textMuted }}>{topRutgersTeamPost.schoolName}</p>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Interactions</p>
                          <p className="font-semibold">{formatNumber(topRutgersTeamPost.interactions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 uppercase tracking-wider">Engagement Rate</p>
                          <p className="font-semibold">{formatPercent(topRutgersTeamPost.engagementRate)}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No Rutgers team page posts available.</p>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Top 10 Rutgers Team Page Posts */}
          <div>
            <SectionHeader primary="TOP 10 " secondary="RUTGERS TEAM PAGE POSTS" />
            <div className="space-y-3 mt-4">
              {top10RutgersTeamPosts.map((post, idx) => (
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
              {top10RutgersTeamPosts.length === 0 && <p className="text-sm text-gray-500">No Rutgers team page posts available.</p>}
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
        let rows: RutgersRosterTeam[] | null = null;
        for (const path of ['/data/rutgers_teams_metrics.json', '/data/Rutgers.roster_teams.json', '/data/rutgers.roster_teams.json', '/data/roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              const parsed = (await response.json()) as (RutgersRosterTeam & { schoolName?: string })[];
              rows = path === '/data/roster_teams.json'
                ? parsed.filter((row) => normalizeSchoolKey(String(row.schoolName || '')) === 'rutgers')
                : parsed;
              if (rows.length > 0) break;
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

    return rows.filter((row) => row.followers > 0);
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

  const teamAccent = colors.primary;

  const SortIcon = ({ col }: { col: TeamSortKey }) => {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-30" />;
    return sortDir === 'desc' ? (
      <ChevronDown className="w-3 h-3" style={{ color: teamAccent }} />
    ) : (
      <ChevronUp className="w-3 h-3" style={{ color: teamAccent }} />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionHeader primary="CLEMSON " secondary="TEAM PAGES" />
          <p className="text-sm mt-2" style={{ color: colors.textMuted }}>
            {view === 'overview' ? 'Official Rutgers athletics social account performance.' : 'Benchmark Rutgers team pages against conference and NCAA.'}
          </p>
          <p className="text-xs mt-1" style={{ color: colors.textDim }}>
            This tab uses <span className="font-semibold">official Rutgers team page accounts</span>, not athlete personal posts.
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
            Rutgers
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
        <RutgersTeamPageLeaderboard />
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
                backgroundColor: activeMetric === mb.id ? teamAccent : '#fff',
                borderColor: activeMetric === mb.id ? teamAccent : 'rgba(0,0,0,0.12)',
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
                  : `${formatNumber(row.followers)} followers`;
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
                    backgroundColor: rank <= 3 ? `${teamAccent}15` : '#f3f4f6',
                    color: rank <= 3 ? teamAccent : colors.textMuted,
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
                <span className="font-semibold" style={{ color: teamAccent }}>
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
                  <td className="px-4 py-3 font-semibold" style={{ color: teamAccent }}>
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
// TEAM PAGE LEADERBOARD (Rutgers)
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

function formatSchoolDisplayName(name: string): string {
  const raw = String(name || '').trim();
  if (!raw) return raw;

  const upper = raw.toUpperCase();
  if (upper === 'DUKE') return 'Duke';
  if (upper === 'UNC' || raw === 'University of North Carolina (UNC)') return 'UNC';

  return raw;
}

function RutgersTeamPageLeaderboard() {
  const [rawRows, setRawRows] = useState<KYTeamRosterRow[]>([]);
  const [supplementalRows, setSupplementalRows] = useState<KYTeamRosterRow[]>([]);
  const [scope, setScope] = useState<'conference' | 'ncaa'>('conference');
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [sortMetric, setSortMetric] = useState<'followers' | 'posts' | 'likes'>('followers');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const rows = (await fetchBestTeamRosterRows()) as KYTeamRosterRow[];
        if (!cancelled) setRawRows(rows);
      } catch { /* ignore */ }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadSupplemental = async () => {
      try {
        const res = await fetch('/data/ip-roster-teams.json');
        if (!res.ok) return;
        const rows = (await res.json()) as KYTeamRosterRow[];
        if (!cancelled && Array.isArray(rows)) setSupplementalRows(rows);
      } catch {
        // supplemental dataset is optional
      }
    };
    loadSupplemental();
    return () => { cancelled = true; };
  }, []);

  // Get available sports that Rutgers has
  const ukSports = useMemo(() => {
    const sports = rawRows.filter(r => r.schoolName === 'Rutgers University').map(r => r.sport);
    return [...new Set(sports)].sort((a, b) => formatSportLabel(a).localeCompare(formatSportLabel(b)));
  }, [rawRows]);

  const isConference = scope === 'conference';

  const filtered = useMemo(() => {
    let rows = rawRows;
    let supplemental = supplementalRows;
    if (isConference) {
      rows = rows.filter((r) => ['BIG 10', 'BIG TEN'].includes(String(r.conferenceName || '').trim().toUpperCase()));
      supplemental = supplemental.filter((r) => ['BIG 10', 'BIG TEN'].includes(String(r.conferenceName || '').trim().toUpperCase()));
    }
    if (selectedSport !== 'ALL') {
      rows = rows.filter(r => r.sport === selectedSport);
      supplemental = supplemental.filter(r => r.sport === selectedSport);
    }

    // Aggregate by school
    const map: Record<string, KYSportSchoolEntry> = {};
    for (const row of rows) {
      const s = formatSchoolDisplayName(row.schoolName);
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

    const supplementalMap: Record<string, KYSportSchoolEntry> = {};
    for (const row of supplemental) {
      const s = formatSchoolDisplayName(row.schoolName);
      if (!s) continue;
      if (!supplementalMap[s]) {
        supplementalMap[s] = { name: s, conf: row.conferenceName || '', followers: 0, posts: 0, likes: 0, engagementRate: 0 };
      }
      const m = row.metrics?.thirtyDays;
      supplementalMap[s].followers += m?.followers || 0;
      supplementalMap[s].posts += m?.contentCount || 0;
      supplementalMap[s].likes += m?.likes || 0;
    }
    for (const s of Object.values(supplementalMap)) {
      s.engagementRate = s.posts > 0 ? s.likes / s.posts : 0;
    }

    for (const [school, supplementalEntry] of Object.entries(supplementalMap)) {
      const primary = map[school];
      if (!primary) {
        if (supplementalEntry.followers >= 10000) map[school] = supplementalEntry;
        continue;
      }
      if (primary.followers < 10000 && supplementalEntry.followers >= 10000) {
        map[school] = supplementalEntry;
      }
    }

    const MIN_FOLLOWERS_FOR_TEAM_LEADERBOARD = isConference ? 0 : 10000;
    return Object.values(map)
      .filter((school) => school.followers >= MIN_FOLLOWERS_FOR_TEAM_LEADERBOARD)
      .sort((a, b) => b[sortMetric] - a[sortMetric]);
  }, [rawRows, supplementalRows, scope, selectedSport, sortMetric, isConference]);

  const ukIndex = filtered.findIndex((s) => normalizeSchoolKey(String(s.name || '')) === 'rutgers');
  const ukRank = ukIndex >= 0 ? ukIndex + 1 : null;
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
            Big 10
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
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Rutgers {sportLabel} Rank</p>
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
              const isUK = normalizeSchoolKey(String(school.name || '')) === 'rutgers';
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
// MAIN EXPORT: RutgersIPImpact
// ═══════════════════════════════════════════════════════════════
export function RutgersIPImpact({ onBack }: { onBack?: () => void }) {
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

    const loadRutgersSports = async () => {
      try {
        let rows: RutgersRosterTeam[] | null = null;
        for (const path of ['/data/rutgers_teams_metrics.json', '/data/Rutgers.roster_teams.json', '/data/rutgers.roster_teams.json', '/data/roster_teams.json']) {
          try {
            const response = await fetch(path);
            if (response.ok) {
              const parsed = (await response.json()) as (RutgersRosterTeam & { schoolName?: string })[];
              rows = path === '/data/roster_teams.json'
                ? parsed.filter((row) => normalizeSchoolKey(String(row.schoolName || '')) === 'rutgers')
                : parsed;
              if (rows.length > 0) break;
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

    loadRutgersSports();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadOverviewData = async () => {
      try {
        const fetchFirstJson = async (paths: string[]): Promise<{ source: string; rows: any[] } | null> => {
          for (const path of paths) {
            try {
              const response = await fetch(path);
              if (!response.ok) continue;
              const rows = (await response.json()) as any[];
              if (Array.isArray(rows) && rows.length > 0) {
                return { source: path, rows };
              }
            } catch {
              // Try next path.
            }
          }
          return null;
        };

        const contentResult = await fetchFirstJson([
          '/data/Rutgers_contents.json',
          '/data/rutgers_contents.json',
          '/data/rutgers-content-posts.json',
          '/data/socialMedia.roster_contents (8).json',
          '/data/NCAA_contents (2).json',
        ]);

        if (!contentResult) {
          const response = await fetch('/data/rutgers-athlete-overview.json');
          if (!response.ok) return;
          const data = (await response.json()) as OverviewData;
          if (!isCancelled) setOverviewData(data);
          return;
        }

        const getSchoolName = (row: any): string =>
          String(row?.athlete?.school?.name || row?.schoolName || row?.team?.school?.name || '');

        const rutgersFilteredRows = contentResult.rows.filter(
          (row) => normalizeSchoolKey(getSchoolName(row)) === 'rutgers',
        );

        const sourceRows = (contentResult.source.includes('rutgers_') || contentResult.source.includes('rutgers-'))
          ? contentResult.rows
          : (rutgersFilteredRows.length > 0 ? rutgersFilteredRows : contentResult.rows);

        const followersResult = await fetchFirstJson([
          '/data/rutgers_teams_metrics.json',
          '/data/Rutgers.roster_teams.json',
          '/data/rutgers.roster_teams.json',
          '/data/roster_teams.json',
        ]);

        const followersRows = (followersResult?.rows || []).filter((row) =>
          followersResult?.source === '/data/roster_teams.json'
            ? normalizeSchoolKey(String(row?.schoolName || '')) === 'rutgers'
            : true,
        );

        const totalFollowersFromRoster = followersRows.reduce((sum, row) =>
          sum + Number(row?.metrics?.thirtyDays?.followers || row?.metrics?.ninetyDays?.followers || 0), 0);
        const totalFollowers = totalFollowersFromRoster > 0 ? totalFollowersFromRoster : ipData.totalFollowers;

        const likesOf = (row: any) => Number(row?.metrics?.likes || 0);
        const commentsOf = (row: any) => Number(row?.metrics?.comments || 0);
        const interactionsOf = (row: any) => likesOf(row) + commentsOf(row);
        const hasCollab = (row: any) => Boolean(row?.isOrganizationCollaboration || row?.isCollaboration);
        const hasLogo = (row: any) => Boolean(row?.hasOrganizationLogo);
        const hasMention = (row: any) => Boolean(row?.hasOrganizationInCaption);
        const hasAnyIP = (row: any) => hasCollab(row) || hasLogo(row) || hasMention(row);
        const avg = (nums: number[]) => (nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

        const buildSignal = (predicate: (row: any) => boolean): IPSignalData => {
          const withRows = sourceRows.filter(predicate);
          const withoutRows = sourceRows.filter((row) => !predicate(row));
          const withPosts = withRows.length;
          const withoutPosts = withoutRows.length;

          const withLikesAvg = avg(withRows.map(likesOf));
          const withCommentsAvg = avg(withRows.map(commentsOf));
          const baselineLikesAvg = avg(withoutRows.map(likesOf));
          const baselineCommentsAvg = avg(withoutRows.map(commentsOf));

          const withEngRate = totalFollowers > 0 && withPosts > 0
            ? withRows.reduce((sum, row) => sum + interactionsOf(row), 0) / (withPosts * totalFollowers)
            : 0;
          const baselineEngRate = totalFollowers > 0 && withoutPosts > 0
            ? withoutRows.reduce((sum, row) => sum + interactionsOf(row), 0) / (withoutPosts * totalFollowers)
            : 0;
          const delta = baselineEngRate > 0 ? ((withEngRate - baselineEngRate) / baselineEngRate) * 100 : 0;

          return {
            posts: withPosts,
            likes: withLikesAvg,
            comments: withCommentsAvg,
            engagementRate: withEngRate,
            delta,
            baselineEngRate,
            baselinePosts: withoutPosts,
            baselineLikes: baselineLikesAvg,
            baselineComments: baselineCommentsAvg,
          };
        };

        const totalPosts = sourceRows.length;
        if (totalPosts === 0) return;
        const totalLikes = sourceRows.reduce((sum, row) => sum + likesOf(row), 0);
        const totalComments = sourceRows.reduce((sum, row) => sum + commentsOf(row), 0);
        const postsWithIP = sourceRows.filter(hasAnyIP).length;
        const ipAdoptionRate = totalPosts > 0 ? (postsWithIP / totalPosts) * 100 : 0;
        const collaboration = buildSignal(hasCollab);
        const logo = buildSignal(hasLogo);
        const mention = buildSignal(hasMention);
        const totalEmv = (totalLikes * 0.5) + (totalComments * 1.5);
        const avgLift = (collaboration.delta + logo.delta + mention.delta) / 3;

        const computed: OverviewData = {
          sourceFile: contentResult.source,
          generatedAt: new Date().toISOString(),
          totalFollowers,
          totalPosts,
          totalLikes,
          totalComments,
          postsWithIP,
          ipAdoptionRate: Number(ipAdoptionRate.toFixed(1)),
          avgLift,
          totalEmv,
          collaboration,
          logo,
          mention,
        };

        if (!isCancelled) {
          setOverviewData(computed);
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
      {/* Rutgers background */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'url(/rutgers-bg.jpg)',
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
                src="https://a.espncdn.com/i/teamlogos/ncaa/500/164.png"
                alt="Rutgers"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
              <div>
                <h1
                  className="text-lg sm:text-2xl font-bold uppercase tracking-tight whitespace-nowrap"
                  style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }}
                >
                  <span style={{ color: colors.primary }}>Rutgers </span>
                  <span className="hidden sm:inline"><span style={{ color: colors.primary }}>Scarlet Knights </span><span style={{ color: colors.headerGray }}>IP Impact Report</span></span>
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
