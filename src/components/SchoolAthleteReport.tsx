// ═══════════════════════════════════════════════════════════════
// School Athlete + Team Performance Report
// Generic version of UCLABrandDeals for any school using
// content-posts.json. Matches the UCLA report design.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Search, Lightbulb, Users, Heart, MessageCircle, Zap } from 'lucide-react';
import { DrawerPanel, TabTransition } from './playfly/PlayflyUI';
import type { SchoolConfig } from '../config/schoolConfigs';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'athletes', label: 'Athletes' },
  { id: 'teams', label: 'Teams' },
  { id: 'content', label: 'Content' },
  { id: 'sponsored', label: 'Sponsored' },
  { id: 'benchmarks', label: 'Benchmarks' },
  { id: 'ip', label: 'IP' },
] as const;

type TabId = typeof TABS[number]['id'];

// ─── Raw post shape from content-posts.json ─────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawPost = any;

// ─── Derived types ───────────────────────────────────────────
interface DerivedAthlete {
  id: string;
  name: string;
  sport: string;
  image?: string;
  position?: string;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  followers: number;
  marketabilityScore: number;
  avgEngagementRate: number; // decimal 0-1
}

interface DerivedSport {
  sport: string;
  athleteCount: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number; // decimal 0-1
}

interface IPBucket {
  contents: number;
  likes: number;
  comments: number;
  engagementRate: number; // decimal 0-1
  emv: number;
}

interface IPComparison {
  label: string;
  yes: IPBucket;
  no: IPBucket;
  avgLift: number; // percentage points
}

interface FallbackRosterRow {
  _id?: string;
  firstName?: string;
  lastName?: string;
  schoolName?: string;
  marketability?: number;
  marketabilityScore?: number;
  score?: number;
  metrics?: {
    ninetyDays?: { followers?: number; marketability?: number };
    thirtyDays?: { followers?: number; marketability?: number };
    sevenDays?: { followers?: number; marketability?: number };
  };
}

interface TeamRosterRow {
  schoolName?: string;
  sport?: string;
  handle?: string;
  instagramHandle?: string;
  username?: string;
  metrics?: {
    ninetyDays?: {
      followers?: number;
      likes?: number;
      comments?: number;
      contentCount?: number;
      engagementRate?: number;
    };
  };
}

interface TeamPageStat {
  sport: string;
  handle: string;
  accountCount: number;
  followers: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  avgEngagementRate: number; // decimal 0-1
}

interface ConferenceBenchmarkSchool {
  id: string;
  shortName: string;
  conference: string;
  totalDeals: number;
  totalEMV: number;
  avgEngagement: number;
  athleteCount: number;
  brandCount: number;
}

// ─── Formatters ──────────────────────────────────────────────
const fmtN = (v?: number | null) => {
  if (v == null || isNaN(v)) return 'N/A';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString('en-US');
};
const fmtPct = (v?: number | null, d = 1) => {
  if (v == null || isNaN(v)) return 'N/A';
  return `${v.toFixed(d)}%`;
};
const fmtCur = (v?: number | null) => {
  if (v == null || isNaN(v)) return 'N/A';
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
};
const fmtDate = (v?: string) => {
  if (!v) return 'N/A';
  const d = new Date(v);
  return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtSport = (s?: string) => {
  if (!s) return 'N/A';
  // Normalize casing from raw values like "MENS_BASKETBALL" or "Men'S Basketball".
  return s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\bmen'?s\b/g, "men's")
    .replace(/\bwomen'?s\b/g, "women's")
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/Men'S/g, "Men's")
    .replace(/Women'S/g, "Women's");
};
const emv = (likes: number, comments: number) => likes * 0.5 + comments * 1.5;

const headerStyle = { fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' as const };

const ROSTER_NAME_MATCHERS: Record<string, string[]> = {
  alabama: ['the university of alabama', 'university of alabama'],
  arkansas: ['university of arkansas'],
  oklahoma: ['university of oklahoma', 'oklahoma'],
  michigan: ['university of michigan', 'michigan'],
  'michigan-state': ['michigan state university', 'michigan state'],
  wisconsin: ['university of wisconsin', 'wisconsin'],
  clemson: ['clemson', 'clemson university'],
  lsu: ['louisiana state university', 'lsu'],
  virginia: ['university of virginia', 'virginia'],
  'boise-state': ['boise state', 'boise state university'],
  'old-dominion': ['old dominion university', 'old dominion'],
  usc: ['university of southern california (usc)', 'university of southern california', 'usc'],
  'nc-state': ['north carolina state university', 'north carolina state', 'nc state'],
  'penn-state': ['penn state university', 'penn state'],
  unc: ['university of north carolina (unc)', 'university of north carolina', 'unc'],
  texas: ['university of texas', 'university of texas at austin', 'university of texas austin'],
  arizona: ['the university of arizona', 'university of arizona'],
};

const SCHOOL_THUMBNAILS: Record<string, string> = {
  lsu: '/LSU_thumbnail.png',
  'michigan-state': '/Michigan_state_thumbnail.png',
  usc: '/USC_thumbnail.png',
  'nc-state': '/NC_State_thumbnail.png',
  'penn-state': '/Penn_State_thumbnail.png',
  unc: '/UNC_thumbnail.png',
  texas: '/Texas_thumbnail.png',
  arizona: '/Arizona_thumbnail.png',
  // Keep existing legacy backgrounds
  alabama: '/Alabama_football.png',
  arkansas: '/arkansas_football.png',
  michigan: '/michigan_football.png',
  wisconsin: '/wisconsin_football.png',
  oklahoma: '/oklahoma_football.png',
  // Expected names if present
  virginia: '/Virginia_thumnail.png',
  'boise-state': '/Boise_thumbnail.png',
  'old-dominion': '/OldDominion_thumnail.png',
};

const GLOBAL_BRAND_EXCLUSIONS = new Set(['bleacherreport', 'br_hoops', 'brhoops']);

const normalizeName = (v?: string) =>
  (v || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
const normalizeHandle = (v?: string) => (v || '').trim().toLowerCase().replace(/^@/, '');
const canonicalHandle = (v?: string) => normalizeHandle(v).replace(/[^a-z0-9]/g, '');

const getRosterFollowers = (row?: FallbackRosterRow | null) =>
  Number(
    row?.metrics?.ninetyDays?.followers ??
    row?.metrics?.thirtyDays?.followers ??
    row?.metrics?.sevenDays?.followers ??
    0
  );
const getRosterMarketability = (row?: FallbackRosterRow | null) =>
  Number(
    row?.metrics?.ninetyDays?.marketability ??
    row?.metrics?.thirtyDays?.marketability ??
    row?.metrics?.sevenDays?.marketability ??
    // Some datasets expose marketability at top-level.
    (row as any)?.marketability ??
    (row as any)?.marketabilityScore ??
    (row as any)?.score ??
    0
  );

const parsePostDate = (post: RawPost): Date | null => {
  const raw = typeof post?.publishedAt === 'string'
    ? post.publishedAt
    : post?.publishedAt?.$date || post?.createdAt?.$date || post?.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 2020) return null;
  return d;
};

const normalizeConference = (value?: string) => {
  const raw = (value || '').trim().toLowerCase();
  if (!raw) return '';
  if (raw.includes('big 10') || raw.includes('big ten')) return 'bigten';
  if (raw.includes('sec')) return 'sec';
  if (raw.includes('acc') || raw.includes('atlantic coast')) return 'acc';
  if (raw.includes('big 12') || raw.includes('big12')) return 'big12';
  if (raw.includes('mountain west')) return 'mountainwest';
  if (raw.includes('sun belt')) return 'sunbelt';
  if (raw.includes('aac') || raw.includes('american athletic')) return 'aac';
  if (raw.includes('independent')) return 'independent';
  return raw.replace(/[^a-z0-9]/g, '');
};

const normalizeSchool = (value?: string) =>
  (value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const slugify = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const compactToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

let allBenchmarkSchoolsPromise: Promise<ConferenceBenchmarkSchool[]> | null = null;

async function loadAllBenchmarkSchools(): Promise<ConferenceBenchmarkSchool[]> {
  if (allBenchmarkSchoolsPromise) return allBenchmarkSchoolsPromise;

  allBenchmarkSchoolsPromise = (async () => {
    // Use compact precomputed benchmarks in production; fall back to raw dataset if unavailable.
    let rows: any[] = [];
    try {
      const compactRes = await fetch('/data/benchmark-schools-compact.json');
      if (compactRes.ok) {
        const compact = await compactRes.json();
        if (Array.isArray(compact) && compact.length) {
          return compact as ConferenceBenchmarkSchool[];
        }
      }
    } catch {
      // Continue to raw fallback.
    }

    const res = await fetch('/data/ncaa_updated_ip_contents_feb_18.json');
    if (!res.ok) return [];
    rows = await res.json();
    if (!Array.isArray(rows)) return [];

    const schoolMap = new Map<string, {
      conference: string;
      likes: number;
      comments: number;
      sponsoredPosts: number;
      engSum: number;
      engCount: number;
      athleteIds: Set<string>;
      brands: Set<string>;
    }>();

    for (const post of rows) {
      const schoolName = String(post?.athlete?.school?.name || '').trim();
      const postConference = String(post?.athlete?.conference?.name || '').trim();
      if (!schoolName || !postConference) continue;

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          conference: postConference,
          likes: 0,
          comments: 0,
          sponsoredPosts: 0,
          engSum: 0,
          engCount: 0,
          athleteIds: new Set<string>(),
          brands: new Set<string>(),
        });
      }

      const school = schoolMap.get(schoolName)!;
      const likes = Number(post?.metrics?.likes || 0);
      const comments = Number(post?.metrics?.comments || 0);
      school.likes += likes;
      school.comments += comments;

      const athleteId = String(post?.athlete?._id || '').trim();
      if (athleteId) school.athleteIds.add(athleteId);

      const sponsorHandle = canonicalHandle(post?.sponsorPartner);
      if (sponsorHandle) {
        school.sponsoredPosts += 1;
        school.brands.add(sponsorHandle);
      }

      const rawER = Number(post?.metrics?.engagementRate || 0);
      const normalizedER = rawER > 1 ? rawER / 100 : rawER;
      if (normalizedER > 0) {
        school.engSum += normalizedER;
        school.engCount += 1;
      }
    }

    return [...schoolMap.entries()]
      .map(([name, stats]) => ({
        id: slugify(name),
        shortName: name,
        conference: stats.conference,
        totalDeals: stats.sponsoredPosts,
        totalEMV: emv(stats.likes, stats.comments),
        avgEngagement: stats.engCount > 0 ? (stats.engSum / stats.engCount) * 100 : 0,
        athleteCount: stats.athleteIds.size,
        brandCount: stats.brands.size,
      }))
      .sort((a, b) => b.totalDeals - a.totalDeals);
  })();

  return allBenchmarkSchoolsPromise;
}

// ─── Data Derivation ─────────────────────────────────────────
function derivePosts(
  raw: RawPost[],
  brandExclusions: Set<string>,
  schoolHandleMatchers: string[],
  sponsoredPostExclusions: Set<string>
) {
  const athleteMap = new Map<string, DerivedAthlete & { engSum: number; engCount: number }>();
  const sponsored: RawPost[] = [];

  for (const p of raw) {
    const aid = p.athlete?._id || 'unknown';
    if (!athleteMap.has(aid)) {
      athleteMap.set(aid, {
        id: aid,
        name: p.athlete?.name || 'Unknown',
        sport: p.athlete?.sport || 'Unknown',
        image: p.athlete?.image,
        position: p.athlete?.position,
        totalPosts: 0, totalLikes: 0, totalComments: 0, followers: 0,
        marketabilityScore: 0,
        avgEngagementRate: 0, engSum: 0, engCount: 0,
      });
    }
    const a = athleteMap.get(aid)!;
    a.totalPosts++;
    a.totalLikes += p.metrics?.likes || 0;
    a.totalComments += p.metrics?.comments || 0;
    // Check both athlete.followers and metrics.followers
    const followerCount = p.athlete?.followers || p.metrics?.followers || 0;
    if (followerCount > 0) a.followers = Math.max(a.followers, followerCount);
    const er = p.metrics?.engagementRate || 0;
    if (er > 0) { a.engSum += er; a.engCount++; }

    const sponsorHandle = canonicalHandle(p.sponsorPartner);
    const isMarkedSponsored = Boolean(p.isSponsored || p.sponsored);
    const isSchoolTeamCollab =
      !!p.isCollaboration &&
      sponsorHandle &&
      isLikelySchoolTeamHandle(sponsorHandle, schoolHandleMatchers);

    const postId = String(p?._id || '');
    const isExplicitlyExcluded = postId && sponsoredPostExclusions.has(postId);
    if (sponsorHandle && isMarkedSponsored && !brandExclusions.has(sponsorHandle) && !isSchoolTeamCollab && !isExplicitlyExcluded) {
      sponsored.push(p);
    }
  }

  const athletes: DerivedAthlete[] = [];
  athleteMap.forEach(a => {
    // engagementRate in JSON is 0-100 scale; convert to 0-1 for display compat with UCLABrandDeals
    a.avgEngagementRate = a.engCount > 0 ? (a.engSum / a.engCount) / 100 : 0;
    athletes.push(a);
  });
  athletes.sort((a, b) => b.totalLikes - a.totalLikes);

  return { athletes, sponsored };
}

function isLikelySchoolTeamHandle(handle: string, schoolHandleMatchers: string[]) {
  const canonical = canonicalHandle(handle);
  if (!canonical) return false;

  const compactHandle = canonical.replace(/[^a-z0-9]/g, '');
  const compactMatchers = schoolHandleMatchers
    .map((m) => normalizeSchool(m))
    .filter(Boolean);

  const matchesSchool = compactMatchers.some((m) => compactHandle.includes(m) || m.includes(compactHandle));
  if (!matchesSchool) return false;

  const teamTokens = [
    'football', 'basketball', 'baseball', 'soccer', 'softball', 'volleyball',
    'wbb', 'wbkb', 'mbb', 'athletics', 'sports', 'track', 'swim', 'golf',
    'tennis', 'wrestling', 'gym', 'gymnastics', 'beachvb', 'triathlon',
  ];

  return teamTokens.some((token) => compactHandle.includes(token));
}

function deriveSports(athletes: DerivedAthlete[]): DerivedSport[] {
  const map = new Map<string, { likes: number; posts: number; comments: number; engSum: number; count: number }>();
  for (const a of athletes) {
    if (!map.has(a.sport)) map.set(a.sport, { likes: 0, posts: 0, comments: 0, engSum: 0, count: 0 });
    const s = map.get(a.sport)!;
    s.likes += a.totalLikes; s.posts += a.totalPosts;
    s.comments += a.totalComments; s.engSum += a.avgEngagementRate; s.count++;
  }
  const out: DerivedSport[] = [];
  map.forEach((v, sport) => out.push({
    sport, athleteCount: v.count, totalPosts: v.posts,
    totalLikes: v.likes, totalComments: v.comments,
    avgEngagementRate: v.count > 0 ? v.engSum / v.count : 0,
  }));
  return out.sort((a, b) => b.totalLikes - a.totalLikes);
}

function computeIPBucket(posts: RawPost[]): IPBucket {
  const n = posts.length;
  if (!n) return { contents: 0, likes: 0, comments: 0, engagementRate: 0, emv: 0 };
  const totalLikes = posts.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.metrics?.comments || 0), 0);
  const erVals = posts.map(p => (p.metrics?.engagementRate || 0) / 100).filter(v => v > 0);
  const avgER = erVals.length ? erVals.reduce((s, v) => s + v, 0) / erVals.length : 0;
  return { contents: n, likes: totalLikes / n, comments: totalComments / n, engagementRate: avgER, emv: emv(totalLikes, totalComments) };
}

function deriveIPComparisons(raw: RawPost[]): IPComparison[] {
  const signalFields: { label: string; field: keyof RawPost }[] = [
    { label: 'Collaboration', field: 'isCollaboration' },
    { label: 'Logo', field: 'hasOrganizationLogo' },
    { label: 'Caption', field: 'hasOrganizationInCaption' },
  ];
  return signalFields.map(({ label, field }) => {
    const withIP = raw.filter(p => p[field]);
    const withoutIP = raw.filter(p => !p[field]);
    const yBucket = computeIPBucket(withIP);
    const nBucket = computeIPBucket(withoutIP);
    const lift = nBucket.engagementRate > 0
      ? ((yBucket.engagementRate - nBucket.engagementRate) / nBucket.engagementRate) * 100
      : 0;
    return { label, yes: yBucket, no: nBucket, avgLift: parseFloat(lift.toFixed(1)) };
  });
}

// ─── Glass Panel ─────────────────────────────────────────────
function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E1E7F0] bg-white shadow-[0_16px_32px_rgba(15,28,46,0.08)] ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
interface SchoolAthleteReportProps {
  config: SchoolConfig;
  onBack?: () => void;
}

export function SchoolAthleteReport({ config, onBack }: SchoolAthleteReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [rawPosts, setRawPosts] = useState<RawPost[]>([]);
  const [rosterData, setRosterData] = useState<any>(null);
  const [fallbackRosterRows, setFallbackRosterRows] = useState<FallbackRosterRow[]>([]);
  const [teamRosterRows, setTeamRosterRows] = useState<TeamRosterRow[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<DerivedAthlete | null>(null);

  const primaryColor = config.colors.primary;
  const secondaryColor = config.colors.secondary;

  useEffect(() => {
    // Fetch content posts
    const postsPromise = fetch(config.dataFile)
      .then(r => r.ok ? r.json() : [])
      .then((data: RawPost[]) => Array.isArray(data) ? data : [])
      .catch(() => []);

    // Try to fetch roster file (optional)
    const rosterFile = `/data/${config.id}-roster.json`;
    const rosterPromise = fetch(rosterFile)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);

    // Fallback roster includes follower + marketability by athlete name.
    // Try smaller school-bundle file first (more deployment-friendly), then full NCAA.
    const fallbackRosterPromise = (async () => {
      const fallbackPaths = [
        '/data/Ala_Ark_Okl_Mic_Wis_Roster.json',
        '/data/ncaa_roster_feb_12.json',
        '/data/ncaa_roster.json',
      ];
      for (const path of fallbackPaths) {
        try {
          const r = await fetch(path);
          if (!r.ok) continue;
          const rows = await r.json();
          if (Array.isArray(rows) && rows.length > 0) return rows as FallbackRosterRow[];
        } catch {
          // try next path
        }
      }
      return [] as FallbackRosterRow[];
    })();

    const teamRosterPromise = fetch('/data/roster_teams.json')
      .then(r => r.ok ? r.json() : [])
      .then((rows: TeamRosterRow[]) => Array.isArray(rows) ? rows : [])
      .catch(() => []);

    Promise.all([postsPromise, rosterPromise, fallbackRosterPromise, teamRosterPromise])
      .then(([posts, roster, fallbackRows, teamRows]) => {
        setRawPosts(posts);
        setRosterData(roster);
        setFallbackRosterRows(fallbackRows);
        setTeamRosterRows(teamRows);
      })
      .finally(() => setLoading(false));
  }, [config.dataFile, config.id]);

  const { athletes, sponsored } = useMemo(() => {
    const exclusions = new Set([
      ...GLOBAL_BRAND_EXCLUSIONS,
      ...(config.brandExclusions || []).map(canonicalHandle).filter(Boolean),
    ]);
    const sponsoredPostExclusions = new Set((config.sponsoredPostExclusions || []).map(String));
    const schoolHandleMatchers = [config.shortName, config.name, ...(ROSTER_NAME_MATCHERS[config.id] || [])];
    const derived = derivePosts(rawPosts, exclusions, schoolHandleMatchers, sponsoredPostExclusions);
    // Merge follower data from roster if available
    if (rosterData?.athletes) {
      const rosterMapById = new Map(
        rosterData.athletes
          .map((a: any) => [String(a?._id?.$oid || a?._id || ''), Number(a.followers || 0)] as const)
          .filter(([id]: readonly [string, number]) => !!id)
      );
      const rosterMapByName = new Map(
        rosterData.athletes.map((a: any) => [normalizeName(a.name), Number(a.followers || 0)])
      );
      const rosterMarketabilityById = new Map(
        rosterData.athletes
          .map((a: any) => [String(a?._id?.$oid || a?._id || ''), Number(a.marketabilityScore ?? a.marketability ?? a.score ?? 0)] as const)
          .filter(([id]: readonly [string, number]) => !!id)
      );
      const rosterMarketabilityByName = new Map(
        rosterData.athletes.map((a: any) => [normalizeName(a.name), Number(a.marketabilityScore ?? a.marketability ?? a.score ?? 0)])
      );
      derived.athletes.forEach(athlete => {
        const byId = rosterMapById.get(athlete.id);
        if (typeof byId === 'number' && byId > 0) {
          athlete.followers = byId;
        } else {
          const byName = rosterMapByName.get(normalizeName(athlete.name));
          if (typeof byName === 'number' && byName > 0) {
            athlete.followers = byName;
          }
        }
        const marketById = rosterMarketabilityById.get(athlete.id);
        if (typeof marketById === 'number' && marketById > 0) {
          athlete.marketabilityScore = marketById;
        } else {
          const marketByName = rosterMarketabilityByName.get(normalizeName(athlete.name));
          if (typeof marketByName === 'number' && marketByName > 0) {
            athlete.marketabilityScore = marketByName;
          }
        }
      });
    }

    // Fallback: map followers from global roster by school + athlete name.
    if (fallbackRosterRows.length) {
      const matchers = ROSTER_NAME_MATCHERS[config.id] || [config.name.toLowerCase()];
      const schoolRows = fallbackRosterRows.filter((row) => {
        const school = (row.schoolName || '').toLowerCase();
        return matchers.some((m) => school === m || school.includes(m));
      });
      const followersByName = new Map<string, number>();
      const marketabilityByName = new Map<string, number>();
      for (const row of schoolRows) {
        const fullName = normalizeName(`${row.firstName || ''} ${row.lastName || ''}`);
        if (!fullName) continue;
        const followers = getRosterFollowers(row);
        const marketability = getRosterMarketability(row);
        if (!followersByName.has(fullName) || followers > (followersByName.get(fullName) || 0)) {
          followersByName.set(fullName, followers);
        }
        if (!marketabilityByName.has(fullName) || marketability > (marketabilityByName.get(fullName) || 0)) {
          marketabilityByName.set(fullName, marketability);
        }
      }
      derived.athletes.forEach((athlete) => {
        if (athlete.followers > 0) return;
        const fromFallback = followersByName.get(normalizeName(athlete.name));
        if (typeof fromFallback === 'number' && fromFallback > 0) {
          athlete.followers = fromFallback;
        }
      });
      derived.athletes.forEach((athlete) => {
        if (athlete.marketabilityScore > 0) return;
        const fromFallback = marketabilityByName.get(normalizeName(athlete.name));
        if (typeof fromFallback === 'number' && fromFallback > 0) {
          athlete.marketabilityScore = fromFallback;
        }
      });
    }

    return derived;
  }, [rawPosts, rosterData, fallbackRosterRows, config.id, config.name, config.shortName]);
  const sports = useMemo(() => deriveSports(athletes), [athletes]);
  const teamPages = useMemo(() => {
    if (!teamRosterRows.length) return [];
    const schoolHandleBase = compactToken(config.id || config.shortName || config.name || 'team');
    const matchers = (ROSTER_NAME_MATCHERS[config.id] || [config.name.toLowerCase()]).map((m) => m.toLowerCase());
    const rows = teamRosterRows.filter((row) => {
      const school = (row.schoolName || '').toLowerCase();
      return matchers.some((m) => school === m || school.includes(m));
    });
    const map = new Map<string, {
      handle: string;
      accountCount: number;
      followers: number;
      totalPosts: number;
      totalLikes: number;
      totalComments: number;
      erNumerator: number;
      erDenominator: number;
    }>();
    for (const row of rows) {
      const sport = row.sport || 'UNKNOWN';
      const sportHandleToken = compactToken(fmtSport(sport));
      const rawHandle =
        row.handle ||
        row.instagramHandle ||
        row.username ||
        '';
      const normalizedHandle = normalizeHandle(rawHandle);
      const fallbackHandle = `${schoolHandleBase}${sportHandleToken}`;
      const m = row.metrics?.ninetyDays || {};
      const followers = Number(m.followers || 0);
      const likes = Number(m.likes || 0);
      const comments = Number(m.comments || 0);
      const posts = Number(m.contentCount || 0);
      if (!map.has(sport)) {
        map.set(sport, {
          handle: normalizedHandle || fallbackHandle,
          accountCount: 0,
          followers: 0,
          totalPosts: 0,
          totalLikes: 0,
          totalComments: 0,
          erNumerator: 0,
          erDenominator: 0,
        });
      }
      const acc = map.get(sport)!;
      if (!acc.handle) {
        acc.handle = normalizedHandle || fallbackHandle;
      }
      acc.accountCount += 1;
      acc.followers += followers;
      acc.totalPosts += posts;
      acc.totalLikes += likes;
      acc.totalComments += comments;
      // Compute ER from account-level post totals only:
      // (likes + comments) / (followers * postCount).
      if (followers > 0 && posts > 0) {
        acc.erNumerator += likes + comments;
        acc.erDenominator += followers * posts;
      }
    }
    return [...map.entries()].map(([sport, v]) => {
      const avgEngagementRate = v.erDenominator > 0 ? v.erNumerator / v.erDenominator : 0;
      if (avgEngagementRate > 0.15 && v.followers < 50_000) {
        // Testing guardrail: flag potentially inflated ER for low-follower team accounts.
        console.warn(
          `[TeamsTab ER anomaly] ${config.shortName} ${fmtSport(sport)}: ER=${(avgEngagementRate * 100).toFixed(2)}%, followers=${v.followers}, likes=${v.totalLikes}, comments=${v.totalComments}, posts=${v.totalPosts}`
        );
      }
      return {
        sport,
        handle: `@${normalizeHandle(v.handle)}`,
        accountCount: v.accountCount,
        followers: v.followers,
        totalPosts: v.totalPosts,
        totalLikes: v.totalLikes,
        totalComments: v.totalComments,
        avgEngagementRate,
      };
    });
  }, [teamRosterRows, config.id, config.shortName, config.name]);
  const ipComparisons = useMemo(() => deriveIPComparisons(rawPosts), [rawPosts]);

  const totalLikes = useMemo(() => rawPosts.reduce((s, p) => s + (p.metrics?.likes || 0), 0), [rawPosts]);
  const totalComments = useMemo(() => rawPosts.reduce((s, p) => s + (p.metrics?.comments || 0), 0), [rawPosts]);
  // Canonical EMV source for report-wide totals and benchmark comparisons.
  const totalEmv = emv(totalLikes, totalComments);
  const dateRange = useMemo(() => {
    const dates = rawPosts.map(parsePostDate).filter((d): d is Date => d !== null);
    if (!dates.length) return null;
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${fmt(min)} - ${fmt(max)}`;
  }, [rawPosts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
        <div className="text-gray-700 text-lg">Loading {config.shortName} Report…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#1E2A3B]" style={{ background: 'radial-gradient(circle at top left, rgba(39,116,174,0.08), transparent 45%), #F7F9FC' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-[#E1E7F0] bg-white/90">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#4B5B73] hover:text-[#1E2A3B]">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <div className="flex items-center gap-3">
                <img src={config.logoUrl} alt={config.shortName} className="w-9 h-9 object-contain" />
                <div>
                  <div className="text-lg font-semibold text-[#0F1D2E]">{config.shortName} Athlete + Team Performance Report</div>
                  <div className="text-xs text-[#5B6B82]">
                    Athlete + team content performance and audience scale · Generated by{' '}
                    <span className="font-semibold" style={{ borderBottom: '2px solid #CCFF00' }}>JABA AI</span>
                  </div>
                </div>
              </div>
            </div>
            <img src="/JABA-face.png" alt="JABA" className="h-12 sm:h-16 object-contain flex-shrink-0" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeTab === tab.id
                    ? 'text-white shadow-sm'
                    : 'bg-white border-[#E1E7F0] text-[#1E2A3B] hover:border-opacity-30'
                }`}
                style={activeTab === tab.id ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#FFFFFF' } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <TabTransition tabKey={activeTab}>
          {activeTab === 'overview' && (
            <OverviewTab
              shortName={config.shortName}
              schoolId={config.id}
              schoolName={config.name}
              conference={config.conference}
              primaryColor={primaryColor}
              primaryDeepColor={config.colors.primaryDeep}
              totalLikes={totalLikes}
              totalPosts={rawPosts.length}
              totalEmv={totalEmv}
              posts={rawPosts}
              athletes={athletes}
              sports={sports}
              teamPages={teamPages}
              peerSchools={config.peerSchools}
              dateRange={dateRange}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'athletes' && (
            <AthletesTab
              athletes={athletes}
              primaryColor={primaryColor}
              primaryDeepColor={config.colors.primaryDeep}
              shortName={config.shortName}
              dateRange={dateRange}
              onSelectAthlete={setSelectedAthlete}
            />
          )}
          {activeTab === 'teams' && (
            <TeamsTab teamPages={teamPages} primaryColor={primaryColor} />
          )}
          {activeTab === 'content' && (
            <ContentTab
              posts={rawPosts}
              primaryColor={primaryColor}
              shortName={config.shortName}
              brandExclusions={new Set([
                ...GLOBAL_BRAND_EXCLUSIONS,
                ...(config.brandExclusions || []).map(canonicalHandle),
              ])}
              sponsoredPostExclusions={new Set((config.sponsoredPostExclusions || []).map(String))}
              schoolHandleMatchers={[config.shortName, config.name, ...(ROSTER_NAME_MATCHERS[config.id] || [])]}
            />
          )}
          {activeTab === 'sponsored' && (
            <SponsoredTab
              posts={sponsored}
              allPosts={rawPosts}
              primaryColor={primaryColor}
            />
          )}
          {activeTab === 'benchmarks' && (
            <BenchmarksTab
              config={config}
              athletes={athletes}
              sponsored={sponsored}
              totalEmv={totalEmv}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          )}
          {activeTab === 'ip' && (
            <IPTab
              comparisons={ipComparisons}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              shortName={config.shortName}
            />
          )}
        </TabTransition>
      </main>

      <DrawerPanel
        open={!!selectedAthlete}
        onClose={() => setSelectedAthlete(null)}
        title={selectedAthlete?.name}
        side="right"
      >
        {selectedAthlete && <AthleteDrawer athlete={selectedAthlete} />}
      </DrawerPanel>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────
function OverviewTab({ shortName, schoolId, schoolName, conference, primaryColor, primaryDeepColor, totalLikes, totalPosts, totalEmv, posts, athletes, sports, teamPages, peerSchools, dateRange, onNavigate }: {
  shortName: string;
  schoolId: string;
  schoolName: string;
  conference: string;
  primaryColor: string;
  primaryDeepColor: string;
  totalLikes: number;
  totalPosts: number;
  totalEmv: number;
  posts: RawPost[];
  athletes: DerivedAthlete[];
  sports: DerivedSport[];
  teamPages: TeamPageStat[];
  peerSchools: SchoolConfig['peerSchools'];
  dateRange: string | null;
  onNavigate: (tab: TabId) => void;
}) {
  const topByLikes = athletes[0];
  const topPostByLikes = useMemo(
    () => [...posts].sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0))[0] || null,
    [posts]
  );
  const topPostImageUrl = (topPostByLikes?.url || topPostByLikes?.imageUrl || topPostByLikes?.thumbnailUrl || '') as string;
  const topPostFallbackImage = (topPostByLikes?.athlete?.image || topByLikes?.image || '') as string;
  const topSportByFollowers = sports[0];
  const topSportByEngagement = [...sports].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0];
  const athleteCount = athletes.length;
  const sportsActive = sports.length;
  const totalFollowerReach = athletes.reduce((s, a) => s + (a.followers || 0), 0);
  const teamFollowerReach = teamPages.reduce((s, t) => s + (t.followers || 0), 0);
  const teamAccountCount = teamPages.reduce((s, t) => s + (t.accountCount || 0), 0);
  const combinedFollowerReach = totalFollowerReach + teamFollowerReach;
  const highestFollowersAthlete = [...athletes]
    .filter((a) => a.followers > 0)
    .sort((a, b) => b.followers - a.followers)[0];
  const topReachFirstName = (highestFollowersAthlete?.name || '').trim().split(/\s+/)[0] || highestFollowersAthlete?.name || 'This athlete';
  const topTeamSportByLikes = [...teamPages].sort((a, b) => b.totalLikes - a.totalLikes)[0];
  const topTeamSportByEngagement = [...teamPages].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0];
  const emvRank = [...peerSchools, {
    id: 'current',
    name: shortName,
    shortName,
    logoUrl: '',
    conference: '',
    totalDeals: 0,
    totalEMV: totalEmv,
    avgEngagement: 0,
    topSport: '',
    athleteCount: 0,
    brandCount: 0,
    monthlyRanks: [],
  }].sort((a, b) => b.totalEMV - a.totalEMV).findIndex((s) => s.id === 'current') + 1;
  const emvRankTotal = peerSchools.length + 1;
  const [conferenceEmvRank, setConferenceEmvRank] = useState<{ rank: number; total: number } | null>(null);
  const [conferenceRankLoading, setConferenceRankLoading] = useState(true);
  const [dataWindowStart, dataWindowEnd] = dateRange?.split(' - ') ?? ['N/A', 'N/A'];
  const topSportHeroImage = SCHOOL_THUMBNAILS[schoolId] || null;

  useEffect(() => {
    let cancelled = false;
    setConferenceRankLoading(true);
    loadAllBenchmarkSchools()
      .then((schools) => {
        if (cancelled) return;
        const confKey = normalizeConference(conference);
        const conferenceSchools = schools.filter((s) => normalizeConference(s.conference) === confKey);
        if (!conferenceSchools.length) {
          setConferenceEmvRank({ rank: emvRank, total: emvRankTotal });
          return;
        }

        const targetSchoolKeys = new Set<string>([
          normalizeSchool(shortName),
          normalizeSchool(schoolName),
          ...((ROSTER_NAME_MATCHERS[schoolId] || []).map(normalizeSchool)),
        ]);
        const selfSchool =
          conferenceSchools.find((s) => targetSchoolKeys.has(normalizeSchool(s.shortName))) ||
          conferenceSchools.find((s) => s.id === schoolId) ||
          conferenceSchools.find((s) => normalizeSchool(s.shortName).includes(normalizeSchool(shortName))) ||
          null;

        if (selfSchool) {
          const ranked = [...conferenceSchools].sort((a, b) => b.totalEMV - a.totalEMV);
          const rank = ranked.findIndex((s) => s.id === selfSchool.id) + 1;
          setConferenceEmvRank({ rank, total: conferenceSchools.length });
          return;
        }

        const betterSchools = conferenceSchools.filter((s) => s.totalEMV > totalEmv).length;
        setConferenceEmvRank({ rank: betterSchools + 1, total: conferenceSchools.length });
      })
      .catch(() => {
        if (!cancelled) setConferenceEmvRank({ rank: emvRank, total: emvRankTotal });
      })
      .finally(() => {
        if (!cancelled) setConferenceRankLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conference, emvRank, emvRankTotal, schoolId, schoolName, shortName, totalEmv]);

  return (
    <div className="space-y-10">
      <GlassPanel className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.55fr] gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: primaryColor }}>{shortName.toUpperCase()} OVERVIEW</p>
            <div className="h-0.5 w-12 mt-2" style={{ backgroundColor: primaryColor }} />
            <p className="text-4xl md:text-5xl font-black mt-4 text-[#0F1D2E] leading-tight">
              JABA analyzed {fmtN(totalPosts)} posts across {fmtN(athleteCount)} {shortName} athletes — generating <span style={{ color: primaryColor }}>{fmtN(totalLikes)}</span> in likes, <span style={{ color: primaryColor }}>{fmtCur(totalEmv)}</span> in EMV across {fmtN(sportsActive)} sports.
            </p>
            <div
              className="mt-4 rounded-xl border-l-4 border px-4 py-3"
              style={{ borderColor: primaryColor, backgroundColor: primaryColor + '14' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
                <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: primaryColor }}>AI Insight</p>
              </div>
              <p className="text-sm text-[#2E3E55] mt-1 font-medium">
                {fmtSport(topSportByFollowers?.sport)} is the dominant content engine by volume, while {fmtSport(topSportByEngagement?.sport)} generates the strongest engagement efficiency — signaling a program with both scale and depth.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 self-stretch min-h-0">
            <GlassPanel className="p-4 flex-1 min-h-0 flex">
              <div className="h-full w-full rounded-xl p-4 flex-1 flex flex-col justify-between" style={{ backgroundColor: `${primaryColor}14` }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Estimated EMV</p>
                  <p className="text-3xl font-black mt-2" style={{ color: primaryColor }}>{fmtCur(totalEmv)}</p>
                </div>
                <p className="text-xs text-[#5B6B82] mt-2">
                  {conferenceRankLoading
                    ? `Loading ${conference} ranking by estimated earned media value.`
                    : `${shortName} ranks #${conferenceEmvRank?.rank || emvRank} in the ${conference} by estimated earned media value.`}
                </p>
              </div>
            </GlassPanel>
            <GlassPanel className="p-4 flex-1 min-h-0 flex">
              <div className="h-full w-full rounded-xl p-4 flex-1 flex flex-col justify-between" style={{ backgroundColor: `${primaryColor}14` }}>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Combined Followers</p>
                  <p className="text-3xl font-black mt-2 text-[#0F1D2E]">{fmtN(combinedFollowerReach)}</p>
                </div>
                <p className="text-xs text-[#5B6B82] mt-2">Across {fmtN(athleteCount)} tracked athlete accounts and {fmtN(teamAccountCount)} official team pages.</p>
              </div>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h2 className="text-lg font-bold uppercase tracking-[0.08em] text-[#0F1D2E] mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#D7E0ED] bg-white p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Team Accounts</p>
            </div>
            <p className="text-lg font-bold mt-2 text-[#0F1D2E]">
              {fmtSport(topTeamSportByEngagement?.sport)} leads team accounts in ER at {fmtPct((topTeamSportByEngagement?.avgEngagementRate || 0) * 100)}
            </p>
            <p className="text-sm text-[#5B6B82] mt-2">
              Among {shortName} official team pages, {fmtSport(topTeamSportByLikes?.sport)} drives the most likes while {fmtSport(topTeamSportByEngagement?.sport)} leads in engagement rate.
            </p>
          </div>

          <div className="rounded-xl border border-[#D7E0ED] bg-white p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Athlete Reach</p>
            </div>
            <p className="text-lg font-bold mt-2 text-[#0F1D2E]">
              {highestFollowersAthlete
                ? `${highestFollowersAthlete.name}: ${fmtN(highestFollowersAthlete.followers)} followers`
                : 'N/A'}
            </p>
            <p className="text-sm text-[#5B6B82] mt-2">
              {highestFollowersAthlete
                ? `${topReachFirstName} is ${shortName}'s most-followed athlete, representing the program's largest individual audience reach.`
                : 'Not enough follower data to identify the top individual audience reach.'}
            </p>
          </div>

          <div className="rounded-xl border border-[#D7E0ED] bg-white p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Total Reach</p>
            </div>
            <p className="text-lg font-bold mt-2 text-[#0F1D2E]">
              {fmtN(combinedFollowerReach)} combined followers
            </p>
            <p className="text-sm text-[#5B6B82] mt-2">
              Total audience reach across {fmtN(athleteCount)} athlete accounts and {fmtN(teamAccountCount)} official {shortName} team pages.
            </p>
          </div>

          <div className="rounded-xl border border-[#D7E0ED] bg-white p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
              <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{conference} EMV Rank</p>
            </div>
            <p className="text-lg font-bold mt-2 text-[#0F1D2E]">
              {conferenceRankLoading
                ? `… in EMV in the ${conference}`
                : `#${conferenceEmvRank?.rank || emvRank} in EMV in the ${conference}`}
            </p>
            <p className="text-sm text-[#5B6B82] mt-2">
              {conferenceRankLoading
                ? `Loading ${conference} school rankings by estimated earned media value.`
                : `Ranks #${conferenceEmvRank?.rank || emvRank} of ${conferenceEmvRank?.total || emvRankTotal} ${conference} schools by estimated earned media value.`}
            </p>
          </div>
        </div>
      </GlassPanel>

      {/* Spotlight row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassPanel className="p-5 relative h-full flex flex-col">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Athlete by Likes</p>
          <div className="mt-3 w-full rounded-xl overflow-hidden relative flex-1 min-h-[360px]">
            {topByLikes?.image ? (
              <img src={topByLikes.image} alt={topByLikes.name} className="absolute inset-0 w-full h-full object-cover object-center" />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-xs text-[#9AA7BC] bg-[#F0F4FA]">No image</div>
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.0) 50%)' }}
            />
            <div className="absolute inset-x-5 bottom-5 z-10 text-left text-white">
              <p className="text-2xl font-extrabold leading-tight">{topByLikes?.name || 'N/A'}</p>
              <p className="text-xs text-white/85 mt-1">{fmtSport(topByLikes?.sport)}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-white/90">
                <div>Likes: {fmtN(topByLikes?.totalLikes)}</div>
                <div>Posts: {fmtN(topByLikes?.totalPosts)}</div>
              </div>
              <button className="text-sm mt-3 text-white/95" onClick={() => onNavigate('athletes')}>View →</button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 relative h-full flex flex-col">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Sport by Likes</p>
          <div
            className="mt-3 w-full rounded-xl overflow-hidden relative flex-1 min-h-[360px]"
          >
            <div
              className="absolute inset-0"
              style={topSportHeroImage
                ? {
                    backgroundImage: `url('${topSportHeroImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }
                : { background: `linear-gradient(145deg, ${primaryColor} 0%, ${primaryDeepColor} 100%)` }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0) 100%)' }}
            />
            <div className="absolute inset-x-5 bottom-5 z-10 text-left">
              <p
                className="text-[30px] font-extrabold text-white leading-tight"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)' }}
              >
                {fmtSport(topSportByFollowers?.sport) || 'N/A'}
              </p>
              <p className="text-sm text-white/90 mt-2">{fmtN(topSportByFollowers?.totalLikes)} total likes</p>
              <button className="text-sm mt-3 text-white/95" onClick={() => onNavigate('teams')}>View →</button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 relative h-full flex flex-col">
          <span className="absolute top-4 right-4 text-[10px] font-semibold text-[#7A8AA3] bg-[#F3F6FB] border border-[#E1E7F0] px-2 py-0.5 rounded-full">#1 by Likes</span>
          <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Top Athlete Post</p>
          <div className="mt-3 w-full rounded-xl bg-[#F0F4FA] overflow-hidden relative flex-1 min-h-[360px]">
            {(topPostImageUrl || topPostFallbackImage) ? (
              <img
                src={topPostImageUrl || topPostFallbackImage}
                alt={topPostByLikes?.athlete?.name || topByLikes?.name || 'Top athlete post'}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">No image</div>
            )}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.0) 50%)' }}
            />
            <div className="absolute inset-x-5 bottom-5 z-10 text-left text-white">
              <p className="text-2xl font-extrabold leading-tight">{topPostByLikes?.athlete?.name || topByLikes?.name || 'N/A'}</p>
              <p className="text-sm text-white/90 mt-2">{fmtN(topPostByLikes?.metrics?.likes || 0)} likes</p>
              <button className="text-sm mt-3 text-white/95" onClick={() => onNavigate('content')}>View →</button>
            </div>
          </div>
        </GlassPanel>
      </div>

      <div className="rounded-xl border border-[#D3DAE6] bg-[#F3F6FB] px-4 py-3 text-sm text-[#4B5B73]">
        <p>
          <span className="mr-1">ℹ️</span>
          Data reflects {shortName} athlete personal social media accounts. Analysis covers {fmtN(totalPosts)} posts from {fmtN(athletes.length)} tracked athletes, {dataWindowStart} - {dataWindowEnd}.
        </p>
      </div>
    </div>
  );
}

// ─── Athletes Tab ────────────────────────────────────────────
function AthletesTab({ athletes, primaryColor, primaryDeepColor, shortName, dateRange, onSelectAthlete }: {
  athletes: DerivedAthlete[];
  primaryColor: string;
  primaryDeepColor: string;
  shortName: string;
  dateRange: string | null;
  onSelectAthlete: (a: DerivedAthlete) => void;
}) {
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [sortKey, setSortKey] = useState<'likes' | 'engagement' | 'posts' | 'comments' | 'followers' | 'marketability'>('likes');
  const [dataWindowStart, dataWindowEnd] = dateRange?.split(' - ') ?? ['N/A', 'N/A'];

  const sports = ['All', ...new Set(athletes.map(a => a.sport))];
  const sportCount = sports.length - 1;

  const filtered = useMemo(() => athletes.filter(a => {
    if (sport !== 'All' && a.sport !== sport) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [athletes, sport, search]);

  const marketabilityBadgeByAthleteId = useMemo(() => {
    const scoreMap = new Map<string, number>();
    athletes.forEach((athlete) => {
      const raw = Number(athlete.marketabilityScore || 0);
      const normalized = raw > 0 && raw <= 1 ? raw * 100 : raw;
      const score = Math.round(Math.max(0, Math.min(99, normalized)));
      scoreMap.set(athlete.id, score);
    });
    return scoreMap;
  }, [athletes]);
  const sortedList = useMemo(() => [...filtered].sort((a, b) => {
    if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
    if (sortKey === 'engagement') return b.avgEngagementRate - a.avgEngagementRate;
    if (sortKey === 'posts') return b.totalPosts - a.totalPosts;
    if (sortKey === 'followers') return b.followers - a.followers;
    if (sortKey === 'marketability') return (marketabilityBadgeByAthleteId.get(b.id) || 0) - (marketabilityBadgeByAthleteId.get(a.id) || 0);
    return b.totalComments - a.totalComments;
  }), [filtered, sortKey, marketabilityBadgeByAthleteId]);
  const sortedCards = useMemo(
    () => [...filtered].sort((a, b) => (marketabilityBadgeByAthleteId.get(b.id) || 0) - (marketabilityBadgeByAthleteId.get(a.id) || 0)),
    [filtered, marketabilityBadgeByAthleteId]
  );
  const topByFollowers = useMemo(
    () => [...athletes].sort((a, b) => b.followers - a.followers).slice(0, 5),
    [athletes]
  );
  const topByLikes = useMemo(
    () => [...athletes].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 5),
    [athletes]
  );
  const topByComments = useMemo(
    () => [...athletes].sort((a, b) => b.totalComments - a.totalComments).slice(0, 5),
    [athletes]
  );
  const topByEngagement = useMemo(
    () => [...athletes].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate).slice(0, 5),
    [athletes]
  );
  const standoutAthlete = useMemo(() => {
    const leaders = [topByFollowers[0], topByLikes[0], topByComments[0], topByEngagement[0]].filter(Boolean) as DerivedAthlete[];
    const countById = new Map<string, { athlete: DerivedAthlete; count: number }>();
    leaders.forEach((athlete) => {
      const current = countById.get(athlete.id);
      if (current) {
        current.count += 1;
      } else {
        countById.set(athlete.id, { athlete, count: 1 });
      }
    });
    const best = [...countById.values()].sort((a, b) => b.count - a.count)[0];
    return best && best.count >= 3 ? best : null;
  }, [topByFollowers, topByLikes, topByComments, topByEngagement]);
  const likesRankByAthleteId = useMemo(() => {
    const map = new Map<string, number>();
    [...athletes]
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .forEach((athlete, index) => map.set(athlete.id, index + 1));
    return map;
  }, [athletes]);
  const commentsRankByAthleteId = useMemo(() => {
    const map = new Map<string, number>();
    [...athletes]
      .sort((a, b) => b.totalComments - a.totalComments)
      .forEach((athlete, index) => map.set(athlete.id, index + 1));
    return map;
  }, [athletes]);
  const followersRankByAthleteId = useMemo(() => {
    const map = new Map<string, number>();
    [...athletes]
      .sort((a, b) => b.followers - a.followers)
      .forEach((athlete, index) => map.set(athlete.id, index + 1));
    return map;
  }, [athletes]);
  const engagementRankByAthleteId = useMemo(() => {
    const map = new Map<string, number>();
    [...athletes]
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)
      .forEach((athlete, index) => map.set(athlete.id, index + 1));
    return map;
  }, [athletes]);
  const marketabilityRankByAthleteId = useMemo(() => {
    const map = new Map<string, number>();
    [...athletes]
      .sort((a, b) => (marketabilityBadgeByAthleteId.get(b.id) || 0) - (marketabilityBadgeByAthleteId.get(a.id) || 0))
      .forEach((athlete, index) => map.set(athlete.id, index + 1));
    return map;
  }, [athletes, marketabilityBadgeByAthleteId]);
  const programAvgER = useMemo(
    () => athletes.reduce((sum, a) => sum + a.avgEngagementRate, 0) / Math.max(athletes.length, 1),
    [athletes]
  );

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="mb-5">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">
              {shortName} Athletes
            </h2>
            <p className="text-sm text-[#5B6B82] mt-2">
              {fmtN(athletes.length)} athletes tracked across {fmtN(sportCount)} sports · {dataWindowStart} - {dataWindowEnd}
            </p>
          </div>
        </div>
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[#4B5B73]">Leaderboards</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { title: 'Top 5 by Total Followers', icon: Users, rows: topByFollowers, value: (a: DerivedAthlete) => fmtN(a.followers) },
            { title: 'Top 5 by Total Likes', icon: Heart, rows: topByLikes, value: (a: DerivedAthlete) => fmtN(a.totalLikes) },
            { title: 'Top 5 by Total Comments', icon: MessageCircle, rows: topByComments, value: (a: DerivedAthlete) => fmtN(a.totalComments) },
            { title: 'Top 5 by Avg Engagement Rate', icon: Zap, rows: topByEngagement, value: (a: DerivedAthlete) => fmtPct(a.avgEngagementRate * 100) },
          ].map((panel) => (
            <div key={panel.title} className="rounded-xl border border-[#E1E7F0] bg-white p-4">
              <h3 className="text-sm font-bold text-[#0F1D2E] mb-3 flex items-center gap-2">
                <panel.icon className="w-4 h-4" style={{ color: primaryColor }} />
                <span>{panel.title}</span>
              </h3>
              <div className="space-y-2">
                {panel.rows.map((a, idx) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[#EEF2F7] px-3 py-2"
                    style={idx === 0 ? { backgroundColor: primaryColor + '0D' } : {}}
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold"
                        style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                      >
                        {idx + 1}
                      </span>
                      <div className={`${idx === 0 ? 'text-lg font-bold' : 'text-sm font-semibold'} text-[#0F1D2E]`}>
                        {a.name}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-[#5B6B82]">{fmtSport(a.sport)}</div>
                    </div>
                    <div className={`${idx === 0 ? 'text-lg font-extrabold' : 'text-sm font-bold'} text-[#0F1D2E] whitespace-nowrap`}>
                      {panel.value(a)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {standoutAthlete && (
        <div
          className="w-full rounded-xl px-5 py-4"
          style={{
            background: `linear-gradient(90deg, ${primaryColor} 0%, ${primaryDeepColor} 100%)`,
            boxShadow: `0 10px 24px ${primaryColor}44`,
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl leading-none">🏆</span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80 font-semibold">Standout Athlete</p>
              <p className="mt-1 text-base md:text-lg font-bold text-white leading-snug">
                {standoutAthlete.athlete.name} leads {standoutAthlete.count} of 4 categories — {shortName}&apos;s standout athlete by every volume metric.
              </p>
            </div>
          </div>
        </div>
      )}

      <GlassPanel className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA7BC]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search athlete"
              className="w-full bg-white border border-[#E1E7F0] rounded-full pl-9 pr-4 py-2 text-sm text-[#1E2A3B]" />
          </div>
          <div className="flex items-center gap-3">
            <select value={sport} onChange={e => setSport(e.target.value)}
              className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B]">
              {sports.map(s => <option key={s} value={s}>{fmtSport(s)}</option>)}
            </select>
            <div className="inline-flex items-center rounded-full border border-[#E1E7F0] bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${viewMode === 'cards' ? 'text-white' : 'text-[#5B6B82]'}`}
                style={viewMode === 'cards' ? { backgroundColor: primaryColor } : {}}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${viewMode === 'list' ? 'text-white' : 'text-[#5B6B82]'}`}
                style={viewMode === 'list' ? { backgroundColor: primaryColor } : {}}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </GlassPanel>

      {viewMode === 'list' ? (
        <GlassPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F3F6FB] sticky top-0">
                <tr className="text-xs uppercase tracking-[0.2em]">
                  <th className="text-left px-4 py-3 text-[#5B6B82]">Athlete</th>
                  <th className="text-left px-4 py-3 text-[#5B6B82]">Sport</th>
                  <th onClick={() => setSortKey('posts')}
                      className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                      style={{ color: sortKey === 'posts' ? primaryColor : '#5B6B82' }}>
                    <div className="flex items-center justify-end gap-1">
                      Posts
                      {sortKey === 'posts' && <span style={{ color: primaryColor }}>↓</span>}
                    </div>
                  </th>
                  <th onClick={() => setSortKey('followers')}
                      className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                      style={{ color: sortKey === 'followers' ? primaryColor : '#5B6B82' }}>
                    <div className="flex items-center justify-end gap-1">
                      Followers
                      {sortKey === 'followers' && <span style={{ color: primaryColor }}>↓</span>}
                    </div>
                  </th>
                  <th onClick={() => setSortKey('likes')}
                      className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                      style={{ color: sortKey === 'likes' ? primaryColor : '#5B6B82' }}>
                    <div className="flex items-center justify-end gap-1">
                      Likes
                      {sortKey === 'likes' && <span style={{ color: primaryColor }}>↓</span>}
                    </div>
                  </th>
                  <th onClick={() => setSortKey('comments')}
                      className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                      style={{ color: sortKey === 'comments' ? primaryColor : '#5B6B82' }}>
                    <div className="flex items-center justify-end gap-1">
                      Comments
                      {sortKey === 'comments' && <span style={{ color: primaryColor }}>↓</span>}
                    </div>
                  </th>
                  <th onClick={() => setSortKey('engagement')}
                      className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                      style={{ color: sortKey === 'engagement' ? primaryColor : '#5B6B82' }}>
                    <div className="flex items-center justify-end gap-1">
                      Avg ER
                      {sortKey === 'engagement' && <span style={{ color: primaryColor }}>↓</span>}
                    </div>
                  </th>
                  <th onClick={() => setSortKey('marketability')}
                      className="text-right px-4 py-3 cursor-pointer hover:text-[#1770C0] transition-colors"
                      style={{ color: sortKey === 'marketability' ? primaryColor : '#5B6B82' }}>
                    <div className="flex items-center justify-end gap-1">
                      MKT Score
                      {sortKey === 'marketability' && <span style={{ color: primaryColor }}>↓</span>}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const visibleRows = sortedList.slice(0, 200);
                  const topVisibleScore = visibleRows.length
                    ? Math.max(...visibleRows.map(row => marketabilityBadgeByAthleteId.get(row.id) || 0))
                    : 0;
                  return visibleRows.map(a => {
                  const marketabilityScore = marketabilityBadgeByAthleteId.get(a.id) || 0;
                  return (
                  <tr key={a.id} onClick={() => onSelectAthlete(a)}
                    className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB] cursor-pointer">
                    <td className="px-4 py-3 text-sm font-semibold text-[#0F1D2E]">{a.name}</td>
                    <td className="px-4 py-3 text-sm text-[#5B6B82]">{fmtSport(a.sport)}</td>
                    <td className="px-4 py-3 text-sm text-right">{fmtN(a.totalPosts)}</td>
                    <td className="px-4 py-3 text-sm text-right">{fmtN(a.followers)}</td>
                    <td className="px-4 py-3 text-sm text-right">{fmtN(a.totalLikes)}</td>
                    <td className="px-4 py-3 text-sm text-right">{fmtN(a.totalComments)}</td>
                    <td className="px-4 py-3 text-sm text-right">{fmtPct(a.avgEngagementRate * 100)}</td>
                    <td
                      className="px-4 py-3 text-sm text-right font-semibold"
                      style={marketabilityScore === topVisibleScore && topVisibleScore > 0 ? { color: primaryColor } : { color: '#0F1D2E' }}
                    >
                      {marketabilityScore}
                    </td>
                  </tr>
                  );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      ) : (
        <GlassPanel className="p-5 bg-[#090909] border-[#1A1A1A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {sortedCards.slice(0, 200).map((a) => {
              const likesRank = likesRankByAthleteId.get(a.id) || 0;
              const commentsRank = commentsRankByAthleteId.get(a.id) || 0;
              const followersRank = followersRankByAthleteId.get(a.id) || 0;
              const engagementRank = engagementRankByAthleteId.get(a.id) || 0;
              const marketabilityRank = marketabilityRankByAthleteId.get(a.id) || 0;
              const score = marketabilityBadgeByAthleteId.get(a.id) || 0;
              const avgComments = Math.round(a.totalComments / Math.max(a.totalPosts, 1));
              const firstName = (a.name || '').trim().split(/\s+/)[0] || a.name;
              const categoryLeads: string[] = [];
              if (followersRank === 1) categoryLeads.push('followers');
              if (likesRank === 1) categoryLeads.push('total likes');
              if (commentsRank === 1) categoryLeads.push('comments');
              if (engagementRank === 1) categoryLeads.push('engagement rate');
              const topDecileThreshold = Math.max(1, Math.ceil(athletes.length * 0.1));
              const engagementMultiple = programAvgER > 0 ? a.avgEngagementRate / programAvgER : 0;
              let insight = '';
              if (categoryLeads.length > 0) {
                const leadText = categoryLeads.length === 1
                  ? categoryLeads[0]
                  : `${categoryLeads.slice(0, -1).join(', ')}, and ${categoryLeads[categoryLeads.length - 1]}`;
                insight = `${firstName} leads all ${shortName} athletes in ${leadText}.`;
              } else if (a.avgEngagementRate > programAvgER && programAvgER > 0) {
                insight = `${firstName}'s ${fmtPct(a.avgEngagementRate * 100)} engagement rate is ${engagementMultiple.toFixed(1)}x the program average.`;
              } else if (marketabilityRank <= topDecileThreshold && athletes.length > 0) {
                const percentile = Math.max(1, Math.round((marketabilityRank / athletes.length) * 100));
                insight = `Top ${percentile}% marketability score among all ${shortName} athletes.`;
              } else {
                const fallbackRankLabel = likesRank > 10 ? '#10+' : `#${Math.max(1, likesRank)}`;
                insight = `${firstName} ranks ${fallbackRankLabel} by total likes among ${fmtN(athletes.length)} tracked athletes.`;
              }
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onSelectAthlete(a)}
                  className="text-left rounded-[12px] overflow-hidden border-2 transition-transform hover:-translate-y-0.5 flex flex-col"
                  style={{
                    borderColor: primaryColor,
                    minHeight: 640,
                    background: `radial-gradient(ellipse at top, ${primaryColor}18 0%, #0a0a0a 70%), linear-gradient(180deg, #111111 0%, ${primaryDeepColor}55 100%)`,
                    boxShadow: `0 0 20px 4px ${primaryColor}44, 0 0 40px 8px ${primaryColor}22`,
                  }}
                >
                  <div className="relative h-[55%] min-h-[340px] w-full flex-shrink-0">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt={a.name}
                        className="w-full h-full block object-cover"
                        style={{ objectPosition: 'top center' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">No image</div>
                    )}
                    <span
                      className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] text-white"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 2px 8px ${primaryColor}88` }}
                    >
                      {fmtSport(a.sport)}
                    </span>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-10">
                      <div className="w-[68px] h-[68px] flex flex-col items-center justify-center">
                        <div
                          className="w-[68px] h-[68px] rounded-full flex flex-col items-center justify-center border-[3px] text-white shadow-lg"
                          style={{
                            borderColor: primaryColor,
                            background: `radial-gradient(circle, #1a1a1a 60%, ${primaryColor}44 100%)`,
                            boxShadow: `0 0 0 4px ${primaryColor}55, 0 0 20px 6px ${primaryColor}66`,
                          }}
                        >
                          <span className="text-[8px] uppercase tracking-[0.16em] text-white leading-none">SCORE</span>
                          <span className="text-[22px] font-black leading-tight">{score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 pb-3 px-3 flex-1">
                    <div
                      className="px-3 py-2 text-center text-sm font-black uppercase tracking-[0.08em] text-white truncate"
                      style={{ background: `linear-gradient(90deg, ${primaryDeepColor} 0%, ${primaryColor}cc 50%, ${primaryDeepColor} 100%)` }}
                    >
                      {a.name}
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between rounded-[4px] border border-[#333333] bg-[#111111] px-[10px] py-[6px]">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">Followers</span>
                        <span className="text-xl font-black text-white">{fmtN(a.followers)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-[4px] border border-[#333333] bg-[#111111] px-[10px] py-[6px]">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">Avg Engagement Rate</span>
                        <span className="text-xl font-black text-white">{fmtPct(a.avgEngagementRate * 100)}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-[4px] border border-[#333333] bg-[#111111] px-[10px] py-[6px]">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF]">Avg Comments</span>
                        <span className="text-xl font-black text-white">{fmtN(avgComments)}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs italic text-[#C2CBD7]">
                      {insight}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}

// ─── Teams Tab (sport-level breakdown) ───────────────────────
function TeamsTab({ teamPages, primaryColor }: { teamPages: TeamPageStat[]; primaryColor: string }) {
  type TeamSortKey = 'sport' | 'likes' | 'engagement' | 'posts' | 'followers';
  type SortDirection = 'asc' | 'desc';

  const [sortKey, setSortKey] = useState<TeamSortKey>('likes');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sorted = useMemo(() => {
    const rows = [...teamPages].sort((a, b) => {
      if (sortKey === 'sport') return fmtSport(a.sport).localeCompare(fmtSport(b.sport));
      if (sortKey === 'likes') return a.totalLikes - b.totalLikes;
      if (sortKey === 'engagement') return a.avgEngagementRate - b.avgEngagementRate;
      if (sortKey === 'posts') return a.totalPosts - b.totalPosts;
      if (sortKey === 'followers') return a.followers - b.followers;
      return 0;
    });
    return sortDirection === 'desc' ? rows.reverse() : rows;
  }, [teamPages, sortKey, sortDirection]);
  const topByFollowers = useMemo(
    () => [...teamPages].sort((a, b) => b.followers - a.followers),
    [teamPages]
  );
  const topTeamByFollowers = topByFollowers[0];
  const secondTeamByFollowers = topByFollowers[1];
  const topTeamByEngagement = useMemo(
    () => [...teamPages].sort((a, b) => b.avgEngagementRate - a.avgEngagementRate)[0],
    [teamPages]
  );

  const handleSortChange = (key: TeamSortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'sport' ? 'asc' : 'desc');
  };

  const sortMarker = (key: TeamSortKey) => {
    if (sortKey !== key) return '';
    return sortDirection === 'desc' ? ' ↓' : ' ↑';
  };

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Sport Breakdown</h2>
            <p className="text-sm text-[#5B6B82]">
              {teamPages.length} team pages active •{' '}
              <span className="font-semibold" style={{ color: primaryColor }}>
                Based on official team account metrics
              </span>
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.slice(0, 6).map((s, idx) => (
          <GlassPanel key={s.sport} className="p-5 relative">
            <span
              className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: primaryColor + '14', color: primaryColor }}
            >
              #{idx + 1}
            </span>
            <div className="text-sm font-semibold text-[#0F1D2E]">{fmtSport(s.sport)}</div>
            <div className="text-xs text-[#7A8AA3] mt-1">{s.handle}</div>
            <div className="mt-4 text-xs uppercase tracking-[0.16em] text-[#7A8AA3]">Followers</div>
            <div className="text-3xl font-bold text-[#0F1D2E] leading-tight">{fmtN(s.followers)}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="uppercase tracking-[0.14em] text-[#7A8AA3]">Likes</div>
                <div className="text-sm font-semibold text-[#0F1D2E]">{fmtN(s.totalLikes)}</div>
              </div>
              <div>
                <div className="uppercase tracking-[0.14em] text-[#7A8AA3]">Avg ER</div>
                <div className="text-sm font-semibold text-[#0F1D2E]">{fmtPct(s.avgEngagementRate * 100)}</div>
              </div>
              <div>
                <div className="uppercase tracking-[0.14em] text-[#7A8AA3]">Posts</div>
                <div className="text-sm font-semibold text-[#0F1D2E]">{fmtN(s.totalPosts)}</div>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div
          className="rounded-xl border-l-4 border px-4 py-3"
          style={{ borderColor: primaryColor, backgroundColor: primaryColor + '14' }}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
            <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: primaryColor }}>Key Insight</p>
          </div>
          <p className="text-sm text-[#2E3E55] mt-1 font-medium">
            {topTeamByFollowers
              ? `${fmtSport(topTeamByFollowers.sport)} leads with ${fmtN(topTeamByFollowers.followers)} followers — ${
                secondTeamByFollowers && secondTeamByFollowers.followers > 0
                  ? `${(topTeamByFollowers.followers / secondTeamByFollowers.followers).toFixed(1)}x more than the next largest team account (${fmtSport(secondTeamByFollowers.sport)} at ${fmtN(secondTeamByFollowers.followers)}).`
                  : 'no clear #2 team account follower baseline yet.'
              }`
              : 'No team-account follower insight is available yet.'}
          </p>
        </div>

        <div
          className="rounded-xl border-l-4 border px-4 py-3"
          style={{ borderColor: primaryColor, backgroundColor: primaryColor + '14' }}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" style={{ color: primaryColor }} />
            <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: primaryColor }}>Key Insight</p>
          </div>
          <p className="text-sm text-[#2E3E55] mt-1 font-medium">
            {topTeamByEngagement
              ? `${fmtSport(topTeamByEngagement.sport)} has the highest engagement rate at ${fmtPct(topTeamByEngagement.avgEngagementRate * 100)} — the most active audience relative to its size.`
              : 'No team-account engagement insight is available yet.'}
          </p>
        </div>
      </div>

      <GlassPanel className="p-6">
        <div style={headerStyle} className="text-sm font-bold uppercase tracking-tight mb-3 text-[#0F1D2E]">Sport Leaderboard</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th
                  className="text-left py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: sortKey === 'sport' ? primaryColor : '#5B6B82' }}
                  onClick={() => handleSortChange('sport')}
                >
                  Sport{sortMarker('sport')}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: sortKey === 'followers' ? primaryColor : '#5B6B82' }}
                  onClick={() => handleSortChange('followers')}
                >
                  Followers{sortMarker('followers')}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: sortKey === 'posts' ? primaryColor : '#5B6B82' }}
                  onClick={() => handleSortChange('posts')}
                >
                  Posts{sortMarker('posts')}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: sortKey === 'likes' ? primaryColor : '#5B6B82' }}
                  onClick={() => handleSortChange('likes')}
                >
                  <span className="inline-flex flex-col items-end leading-tight">
                    <span>Total Likes{sortMarker('likes')}</span>
                    <span className="text-[10px] normal-case tracking-normal text-[#7A8AA3]">(across all posts)</span>
                  </span>
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: sortKey === 'engagement' ? primaryColor : '#5B6B82' }}
                  onClick={() => handleSortChange('engagement')}
                >
                  Avg ER{sortMarker('engagement')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => (
                <tr key={s.sport} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                  <td className="py-3 px-3 text-sm font-semibold text-[#0F1D2E]">{fmtSport(s.sport)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.followers)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.totalPosts)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.totalLikes)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtPct(s.avgEngagementRate * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Content Tab ─────────────────────────────────────────────
function ContentTab({
  posts,
  primaryColor,
  shortName,
  brandExclusions,
  sponsoredPostExclusions,
  schoolHandleMatchers,
}: {
  posts: RawPost[];
  primaryColor: string;
  shortName: string;
  brandExclusions: Set<string>;
  sponsoredPostExclusions: Set<string>;
  schoolHandleMatchers: string[];
}) {
  const [sortKey, setSortKey] = useState<'likes' | 'engagement' | 'comments'>('likes');
  const [sponsoredOnly, setSponsoredOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const normalizedPosts = useMemo(() => posts.map(p => ({
    id: p._id,
    title: p.athlete?.name || 'Unknown',
    sport: p.athlete?.sport || 'Unknown',
    caption: p.caption,
    likes: p.metrics?.likes || 0,
    comments: p.metrics?.comments || 0,
    engagementRate: (p.metrics?.engagementRate || 0) / 100,
    url: p.url,
    permalink: p.permalink,
    publishedAt: typeof p.publishedAt === 'string' ? p.publishedAt : p.publishedAt?.$date,
    sponsorHandle: canonicalHandle(p.sponsorPartner),
    isSchoolTeamCollab: !!p.isCollaboration && isLikelySchoolTeamHandle(canonicalHandle(p.sponsorPartner), schoolHandleMatchers),
    isSponsored: !!canonicalHandle(p.sponsorPartner) && Boolean(p.isSponsored || p.sponsored),
  })), [posts, schoolHandleMatchers]);

  const filtered = useMemo(() => {
    let list = normalizedPosts;
    if (sponsoredOnly) {
      list = list.filter(
        (p) => p.isSponsored &&
          !brandExclusions.has(p.sponsorHandle) &&
          !p.isSchoolTeamCollab &&
          !sponsoredPostExclusions.has(String(p.id))
      );
    }
    return list;
  }, [normalizedPosts, sponsoredOnly, brandExclusions, sponsoredPostExclusions]);
  const isGiveawayCaption = (caption?: string) => {
    const text = (caption || '').toLowerCase();
    if (!text) return false;
    return [
      'giveaway',
      'contest',
      'enter to win',
      'tag to win',
      'follow to win',
    ].some((keyword) => text.includes(keyword));
  };

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortKey === 'likes') return b.likes - a.likes;
    if (sortKey === 'comments') return b.comments - a.comments;
    return b.engagementRate - a.engagementRate;
  }), [filtered, sortKey]);

  useEffect(() => {
    setVisibleCount(9);
  }, [sortKey, sponsoredOnly, filtered.length]);

  const bestByVolume = useMemo(
    () => [...filtered].sort((a, b) => b.likes - a.likes)[0] || null,
    [filtered]
  );
  const bestByEngagement = useMemo(
    () => [...filtered].sort((a, b) => b.engagementRate - a.engagementRate)[0] || null,
    [filtered]
  );
  const bestByComments = useMemo(
    () => {
      const hasCaptionData = filtered.some((p) => (p.caption || '').trim().length > 0);
      const erQualified = filtered.filter((p) => p.engagementRate > 0.005);

      if (!hasCaptionData) {
        const fallbackByER = [...erQualified].sort((a, b) => b.comments - a.comments)[0];
        return fallbackByER || [...filtered].sort((a, b) => b.comments - a.comments)[0] || null;
      }

      const nonGiveaway = filtered.filter((p) => !isGiveawayCaption(p.caption));
      if (nonGiveaway.length) {
        return [...nonGiveaway].sort((a, b) => b.comments - a.comments)[0] || null;
      }

      const fallbackByER = [...erQualified].sort((a, b) => b.comments - a.comments)[0];
      return fallbackByER || [...filtered].sort((a, b) => b.comments - a.comments)[0] || null;
    },
    [filtered]
  );
  const spotlightIds = useMemo(() => new Set(
    [bestByVolume?.id, bestByEngagement?.id, bestByComments?.id].filter(Boolean) as string[]
  ), [bestByVolume?.id, bestByEngagement?.id, bestByComments?.id]);
  const feedPool = useMemo(
    () => sorted.filter((p) => !spotlightIds.has(p.id)),
    [sorted, spotlightIds]
  );
  const visibleFeedPosts = useMemo(
    () => feedPool.slice(0, visibleCount),
    [feedPool, visibleCount]
  );

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6 bg-[#F3F6FB]">
        <div>
          <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">{shortName}'s Highest Performing Content</h2>
          <p className="text-sm text-[#5B6B82]">Top posts across {shortName} athlete accounts</p>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight text-[#0F1D2E]">
          Top Post Spotlight
        </h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { label: 'Most Liked', post: bestByVolume },
            { label: 'Highest Engagement Rate', post: bestByEngagement },
            { label: 'Most Comments', post: bestByComments },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-[#E1E7F0] bg-white p-5">
              <div className="flex items-center justify-between text-xs text-[#7A8AA3] mb-3">
                <span className="px-2 py-0.5 rounded-full border border-[#E1E7F0] bg-[#F3F6FB]">{item.label}</span>
                <span>{fmtDate(item.post?.publishedAt)}</span>
              </div>
              <div className="w-full aspect-[4/5] rounded-xl bg-[#F0F4FA] overflow-hidden">
                {item.post?.url ? (
                  <img src={item.post.url} alt={item.post.title} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">No image</div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-[#0F1D2E]">{item.post?.title || 'N/A'}</p>
                <p className="text-xs text-[#5B6B82] mt-1">{item.post?.caption?.slice(0, 80) || 'No caption'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-[#5B6B82] mt-3">
                <div>Likes: {fmtN(item.post?.likes)}</div>
                <div>Comments: {fmtN(item.post?.comments)}</div>
                <div>ER: {fmtPct((item.post?.engagementRate || 0) * 100)}</div>
              </div>
              {(item.post?.permalink || item.post?.url) && (
                <a
                  href={item.post.permalink || item.post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs mt-3 inline-block"
                  style={{ color: primaryColor }}
                >
                  Open post
                </a>
              )}
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight text-[#0F1D2E]">
            Top Posts
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-[#5B6B82]">Sponsored only</span>
              <button
                role="switch"
                aria-checked={sponsoredOnly}
                onClick={() => setSponsoredOnly(!sponsoredOnly)}
                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                style={{ backgroundColor: sponsoredOnly ? primaryColor : '#D1D5DB' }}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${sponsoredOnly ? 'translate-x-[18px]' : 'translate-x-[3px]'}`} />
              </button>
            </label>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value as typeof sortKey)}
              className="bg-white border border-[#E1E7F0] rounded-full px-3 py-2 text-sm text-[#1E2A3B] h-9"
            >
              <option value="likes">Likes</option>
              <option value="engagement">Engagement Rate</option>
              <option value="comments">Comments</option>
            </select>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFeedPosts.map((post, idx) => (
            <GlassPanel key={`${post.id}-${idx}`} className="p-3 bg-white">
              <div className="relative">
                <div className="w-full aspect-[4/5] rounded-xl bg-[#F0F4FA] overflow-hidden">
                  {post.url ? (
                    <img src={post.url} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">No image</div>
                  )}
                </div>
                <span
                  className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full"
                  style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                >
                  #{idx + 1}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm font-semibold text-[#0F1D2E] truncate">{post.title}</p>
                <p className="text-xs text-[#5B6B82]">{fmtSport(post.sport)}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[#5B6B82]">
                  <div>Likes: {fmtN(post.likes)}</div>
                  <div>Comments: {fmtN(post.comments)}</div>
                  <div>ER: {fmtPct(post.engagementRate * 100)}</div>
                </div>
                <p className="mt-2 text-xs text-[#8A96A8]">{fmtDate(post.publishedAt)}</p>
                {(post.permalink || post.url) && (
                  <a
                    href={post.permalink || post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs mt-2 inline-block"
                    style={{ color: primaryColor }}
                  >
                    Open post
                  </a>
                )}
              </div>
            </GlassPanel>
          ))}
        </div>
        {visibleCount < feedPool.length && (
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + 9, feedPool.length))}
              className="px-4 py-2 rounded-full border text-sm font-semibold transition-colors"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Show more
            </button>
          </div>
        )}
      </GlassPanel>
    </div>
  );
}

// ─── Sponsored Tab ───────────────────────────────────────────
function SponsoredTab({
  posts,
  allPosts,
  primaryColor,
}: {
  posts: RawPost[];
  allPosts: RawPost[];
  primaryColor: string;
}) {
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [sortKey, setSortKey] = useState<'posts' | 'likes' | 'engagement'>('posts');
  const [brandLogos, setBrandLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;

    const loadBrandLogos = async () => {
      try {
        const res = await fetch('/data/socialMedia.brands.json');
        if (!res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows) || cancelled) return;

        const next: Record<string, string> = {};
        for (const row of rows) {
          const name = String(row?.name || '').trim().toLowerCase();
          const logo = String(row?.logo || '').trim();
          if (!name || !logo) continue;
          const normalized = name.replace(/^@/, '');
          if (!next[normalized]) next[normalized] = logo;
          if (!next[name]) next[name] = logo;
        }
        if (!cancelled) setBrandLogos(next);
      } catch {
        // Non-blocking: cards still render with fallback logos.
      }
    };

    loadBrandLogos();
    return () => {
      cancelled = true;
    };
  }, []);

  const sports = ['All', ...new Set(posts.map(p => p.athlete?.sport).filter(Boolean) as string[])];

  const filtered = posts.filter(p => {
    if (sportFilter !== 'All' && p.athlete?.sport !== sportFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (p.sponsorPartner || '').toLowerCase().includes(q) || (p.athlete?.name || '').toLowerCase().includes(q);
  });

  const totalLikes = filtered.reduce((s, p) => s + (p.metrics?.likes || 0), 0);
  const totalComments = filtered.reduce((s, p) => s + (p.metrics?.comments || 0), 0);
  const uniqueBrands = new Set(filtered.map(p => (p.sponsorPartner || '').toLowerCase().trim()).filter(Boolean));
  const uniqueAthletes = new Set(filtered.map(p => p.athlete?._id).filter(Boolean));
  const avgLikes = filtered.length ? totalLikes / filtered.length : null;
  const avgComments = filtered.length ? Math.round(totalComments / filtered.length) : null;
  const normalizeER = (value: number) => (value > 1 ? value / 100 : value);
  const organicPosts = allPosts.filter((p) => !canonicalHandle(p.sponsorPartner));
  const avgOrganicER = organicPosts.length
    ? organicPosts.reduce((sum, p) => sum + normalizeER(Number(p.metrics?.engagementRate || 0)), 0) / organicPosts.length
    : 0;
  const sponsoredEmv = emv(totalLikes, totalComments);
  const totalSponsoredPostsAll = posts.length;
  const emvPerLikeConstant = totalLikes > 0 ? sponsoredEmv / totalLikes : 0;
  const avgSponsoredERAll = totalSponsoredPostsAll
    ? posts.reduce((sum, p) => sum + normalizeER(Number(p.metrics?.engagementRate || 0)), 0) / totalSponsoredPostsAll
    : 0;

  const sponsoredSportCounts = new Map<string, number>();
  const sponsoredAthleteCounts = new Map<string, { name: string; count: number }>();
  const athleteIdsBySport = new Map<string, Set<string>>();
  const allAthleteIds = new Set<string>();

  for (const p of posts) {
    const sport = p.athlete?.sport || 'UNKNOWN';
    sponsoredSportCounts.set(sport, (sponsoredSportCounts.get(sport) || 0) + 1);

    const athleteKey = p.athlete?._id || p.athlete?.name || 'unknown-athlete';
    const athleteName = p.athlete?.name || 'Unknown Athlete';
    if (!sponsoredAthleteCounts.has(athleteKey)) sponsoredAthleteCounts.set(athleteKey, { name: athleteName, count: 0 });
    sponsoredAthleteCounts.get(athleteKey)!.count += 1;
  }

  for (const p of allPosts) {
    const athleteId = p.athlete?._id;
    const sport = p.athlete?.sport || 'UNKNOWN';
    if (!athleteId) continue;
    allAthleteIds.add(athleteId);
    if (!athleteIdsBySport.has(sport)) athleteIdsBySport.set(sport, new Set<string>());
    athleteIdsBySport.get(sport)!.add(athleteId);
  }

  const sponsoredSportRanked = [...sponsoredSportCounts.entries()]
    .map(([sport, count]) => ({ sport, count }))
    .sort((a, b) => b.count - a.count);
  const topSponsoredSport = sponsoredSportRanked[0];
  const secondSponsoredSport = sponsoredSportRanked[1];
  const thirdSponsoredSport = sponsoredSportRanked[2];

  const topAthleteEntry = [...sponsoredAthleteCounts.values()].sort((a, b) => b.count - a.count)[0];

  const sportDealPct = topSponsoredSport && totalSponsoredPostsAll > 0
    ? (topSponsoredSport.count / totalSponsoredPostsAll) * 100
    : 0;
  const sportAthletePct = topSponsoredSport && allAthleteIds.size > 0
    ? ((athleteIdsBySport.get(topSponsoredSport.sport)?.size || 0) / allAthleteIds.size) * 100
    : 0;
  const athleteDealPct = topAthleteEntry && totalSponsoredPostsAll > 0
    ? (topAthleteEntry.count / totalSponsoredPostsAll) * 100
    : 0;

  const erDiffPctPoints = Math.abs(avgSponsoredERAll - avgOrganicER) * 100;
  const comparison = avgSponsoredERAll >= avgOrganicER * 1.08 ? 'above' : 'on par with';
  const receptivityStatement = avgSponsoredERAll >= avgOrganicER * 1.08
    ? 'are highly receptive to partnerships'
    : 'respond naturally to brand content';

  const sportConcentrationScore = Math.max(0, sportDealPct - sportAthletePct);
  const athleteConcentrationScore = athleteDealPct;
  const erSignalScore = erDiffPctPoints;

  const insightType =
    sportConcentrationScore >= athleteConcentrationScore && sportConcentrationScore >= erSignalScore
      ? 'sport'
      : athleteConcentrationScore >= erSignalScore
        ? 'athlete'
        : 'er';

  const sponsorshipInsight = insightType === 'sport' && topSponsoredSport
    ? `${fmtSport(topSponsoredSport.sport)} athletes account for ${fmtPct(sportDealPct)} of sponsored posts but only ${fmtPct(sportAthletePct)} of total athletes, with next-highest sponsored volume from ${fmtSport(secondSponsoredSport?.sport || 'other sports')} and ${fmtSport(thirdSponsoredSport?.sport || 'emerging groups')}.`
    : insightType === 'athlete' && topAthleteEntry
      ? `${topAthleteEntry.name} alone accounts for ${fmtPct(athleteDealPct)} of all sponsored posts — brand activity is heavily concentrated in one athlete, creating roster diversification opportunity.`
      : `Sponsored posts generate an average ${fmtPct(avgSponsoredERAll * 100)} engagement rate across ${fmtN(totalSponsoredPostsAll)} posts — ${comparison} the ${fmtPct(avgOrganicER * 100)} program-wide average, indicating audiences ${receptivityStatement}.`;

  const brandMap = new Map<string, {
    posts: RawPost[];
    athletes: Set<string>;
    athleteNames: Set<string>;
    sports: Set<string>;
    totalLikes: number;
    totalComments: number;
    engSum: number;
    totalEmv: number;
  }>();
  filtered.forEach(p => {
    const key = (p.sponsorPartner || '').trim();
    if (!key) return;
    if (!brandMap.has(key)) {
      brandMap.set(key, {
        posts: [],
        athletes: new Set(),
        athleteNames: new Set(),
        sports: new Set(),
        totalLikes: 0,
        totalComments: 0,
        engSum: 0,
        totalEmv: 0,
      });
    }
    const entry = brandMap.get(key)!;
    entry.posts.push(p);
    if (p.athlete?._id) entry.athletes.add(p.athlete._id);
    if (p.athlete?.name) entry.athleteNames.add(p.athlete.name);
    if (p.athlete?.sport) entry.sports.add(p.athlete.sport);
    entry.totalLikes += p.metrics?.likes || 0;
    entry.totalComments += p.metrics?.comments || 0;
    entry.engSum += (p.metrics?.engagementRate || 0) / 100;
    entry.totalEmv += emv(p.metrics?.likes || 0, p.metrics?.comments || 0);
  });

  const brandCards = [...brandMap.entries()].map(([brand, entry]) => {
    const normalizedBrand = brand.toLowerCase().replace(/^@/, '');
    const logoUrl = brandLogos[normalizedBrand] || brandLogos[brand.toLowerCase()] || '';
    const avgLikesPerPost = entry.posts.length ? entry.totalLikes / entry.posts.length : 0;
    const estimatedEmvFallback = entry.posts.length * avgLikesPerPost * emvPerLikeConstant;
    const estimatedValue = entry.totalEmv > 0 ? entry.totalEmv : estimatedEmvFallback;
    return {
      brand,
      logoUrl,
      postCount: entry.posts.length,
      athleteCount: entry.athletes.size,
      athleteNames: Array.from(entry.athleteNames).sort(),
      sportCount: entry.sports.size,
      totalLikes: entry.totalLikes,
      totalComments: entry.totalComments,
      totalEmv: entry.totalEmv,
      estimatedValue,
      avgEngagement: entry.posts.length ? entry.engSum / entry.posts.length : 0,
      topPosts: [...entry.posts]
        .sort((a, b) => (b.metrics?.likes || 0) - (a.metrics?.likes || 0))
        .slice(0, 2),
    };
  }).sort((a, b) => {
    if (sortKey === 'likes') return b.totalLikes - a.totalLikes;
    if (sortKey === 'engagement') return b.avgEngagement - a.avgEngagement;
    return b.postCount - a.postCount;
  });
  return (
    <div className="space-y-8">
      <GlassPanel className="p-6" >
        <div
          className="rounded-2xl p-6 border"
          style={{ backgroundColor: primaryColor, borderColor: primaryColor + '40' }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-white/75">Estimated Brand Value Generated</p>
          <p className="text-4xl md:text-5xl font-black text-white mt-2">{fmtCur(sponsoredEmv)}</p>
          <p className="text-sm text-white/80 mt-2">
            From {fmtN(totalSponsoredPostsAll)} identified brand partnership posts.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Sponsored Posts</p>
              <p className="text-xl font-bold text-white mt-1">{fmtN(filtered.length)}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Unique Brands</p>
              <p className="text-xl font-bold text-white mt-1">{fmtN(uniqueBrands.size)}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Athletes with Deals</p>
              <p className="text-xl font-bold text-white mt-1">{fmtN(uniqueAthletes.size)}</p>
            </div>
          </div>
        </div>
      </GlassPanel>

      <div
        className="rounded-xl border-l-4 border px-4 py-3"
        style={{ borderColor: primaryColor, backgroundColor: primaryColor + '14' }}
      >
        <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: primaryColor }}>
          Sponsorship Insight
        </p>
        <p className="text-sm mt-1 font-medium text-[#2E3E55]">
          {sponsorshipInsight}
        </p>
      </div>

      <GlassPanel className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Brand or athlete..."
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sport</label>
            <select value={sportFilter} onChange={e => setSportFilter(e.target.value)}
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]">
              {sports.map(s => <option key={s} value={s}>{fmtSport(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">Sort by</label>
            <select value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}
              className="mt-2 w-full bg-white border border-[#E1E7F0] rounded-full px-4 py-2 text-sm text-[#1E2A3B]">
              <option value="posts">Posts</option>
              <option value="likes">Total Likes</option>
              <option value="engagement">Engagement Rate</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center rounded-full border border-[#E1E7F0] bg-[#F3F6FB] px-3 py-1 text-xs font-semibold text-[#4B5B73]">
            Avg Likes/Post: {avgLikes != null ? fmtN(avgLikes) : 'N/A'}
          </span>
          <span className="inline-flex items-center rounded-full border border-[#E1E7F0] bg-[#F3F6FB] px-3 py-1 text-xs font-semibold text-[#4B5B73]">
            Avg Comments/Post: {avgComments != null ? fmtN(avgComments) : 'N/A'}
          </span>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {brandCards.slice(0, 30).map(brand => (
          <GlassPanel key={brand.brand} className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F3F6FB] border border-[#E1E7F0] flex items-center justify-center overflow-hidden">
                <img
                  src={brand.logoUrl || `https://logo.dev/${brand.brand.replace(/^@/, '')}.com`}
                  alt={brand.brand}
                  className="w-full h-full object-contain"
                  onError={e => {
                    const img = e.currentTarget as HTMLImageElement;
                    img.style.display = 'none';
                    const fallback = img.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span
                  className="hidden w-full h-full items-center justify-center text-sm font-semibold text-[#1E2A3B]"
                >
                  {brand.brand.replace(/^@/, '').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#0F1D2E]">{brand.brand}</div>
                <div className="text-xs text-[#5B6B82]">{brand.postCount} posts • {brand.athleteCount} athletes • {brand.sportCount} sports</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#5B6B82] mt-3">
              <div>Posts: {fmtN(brand.postCount)}</div>
              <div>Athletes: {fmtN(brand.athleteCount)}</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-[#5B6B82] mt-3">
              <div>Likes: {fmtN(brand.totalLikes)}</div>
              <div>Comments: {fmtN(brand.totalComments)}</div>
              <div>Avg ER: {fmtPct(brand.avgEngagement * 100)}</div>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-md border border-[#E1E7F0] bg-[#F7FAFF] px-2.5 py-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#7A8AA3]">Est. Value</span>
              <span className="text-xs font-bold text-[#0F1D2E]">{fmtCur(brand.estimatedValue)}</span>
            </div>
            <div className="mt-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A8AA3] mb-1">Athletes</p>
              {brand.athleteNames.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {brand.athleteNames.slice(0, 3).map((name) => (
                    <span
                      key={`${brand.brand}-${name}`}
                      className="inline-flex items-center rounded-full border border-[#E1E7F0] bg-[#F3F6FB] px-2 py-0.5 text-[11px] text-[#4B5B73]"
                    >
                      {name}
                    </span>
                  ))}
                  {brand.athleteNames.length > 3 && (
                    <span className="inline-flex items-center rounded-full border border-[#E1E7F0] bg-[#F3F6FB] px-2 py-0.5 text-[11px] text-[#4B5B73]">
                      +{brand.athleteNames.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#5B6B82]">N/A</p>
              )}
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A8AA3]">Top Posts</p>
              {brand.topPosts.map((post, idx) => {
                const postDate = typeof post.publishedAt === 'string' ? post.publishedAt : post.publishedAt?.$date;
                const postUrl = post.permalink || post.url;
                const thumbnailUrl = post.url || post.permalink;
                return (
                  <div key={`${brand.brand}-${idx}`} className="text-xs text-[#5B6B82] flex items-center gap-2">
                    {postUrl ? (
                      <a
                        href={postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-md overflow-hidden border border-[#E1E7F0] bg-[#F3F6FB] shrink-0"
                      >
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={`${brand.brand} post`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-[#9AA7BC]">N/A</div>
                        )}
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-md overflow-hidden border border-[#E1E7F0] bg-[#F3F6FB] shrink-0 flex items-center justify-center text-[9px] text-[#9AA7BC]">
                        N/A
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate">
                        {(post.athlete?.name || 'Unknown')} • {fmtN(post.metrics?.likes || 0)} likes
                      </div>
                      <div className="text-[#7A8AA3]">{fmtDate(postDate)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

// ─── Benchmarks Tab ──────────────────────────────────────────
function BenchmarksTab({ config, athletes, totalEmv, primaryColor }: {
  config: SchoolConfig;
  athletes: DerivedAthlete[];
  sponsored: RawPost[];
  totalEmv: number;
  primaryColor: string;
  secondaryColor: string;
}) {
  const { benchmark, peerSchools, shortName, conference } = config;
  const [scope, setScope] = useState<'conference' | 'all'>('conference');
  const [datasetSchools, setDatasetSchools] = useState<ConferenceBenchmarkSchool[] | null>(null);
  const [comparisonSortKey, setComparisonSortKey] = useState<'metric' | 'thisVal' | 'medVal' | 'diff' | 'rank'>('rank');
  const [comparisonSortDir, setComparisonSortDir] = useState<'asc' | 'desc'>('asc');
  const [leaderSortKey, setLeaderSortKey] = useState<'school' | 'deals' | 'emv' | 'engagement' | 'athletes' | 'brands'>('deals');
  const [leaderSortDir, setLeaderSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    let cancelled = false;
    loadAllBenchmarkSchools()
      .then((schools) => {
        if (cancelled) return;
        setDatasetSchools(schools);
      })
      .catch(() => {
        if (!cancelled) setDatasetSchools([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLikes = athletes.reduce((s, a) => s + a.totalLikes, 0);
  const totalPosts = athletes.reduce((s, a) => s + a.totalPosts, 0);
  const avgEngagement = athletes.length ? athletes.reduce((s, a) => s + a.avgEngagementRate, 0) / athletes.length * 100 : 0;

  const fallbackSchools: ConferenceBenchmarkSchool[] = [...peerSchools, benchmark].map((s) => ({
    id: s.id,
    shortName: s.shortName,
    conference: s.conference,
    totalDeals: s.totalDeals,
    totalEMV: s.totalEMV,
    avgEngagement: s.avgEngagement,
    athleteCount: s.athleteCount,
    brandCount: s.brandCount,
  }));

  const conferenceKey = normalizeConference(conference);
  const isBenchmarkLoading = datasetSchools === null;
  const datasetConferenceSchools = (datasetSchools || []).filter((s) => normalizeConference(s.conference) === conferenceKey);
  const scopedDatasetSchools = scope === 'conference' ? datasetConferenceSchools : (datasetSchools || []);
  const allSchools = scopedDatasetSchools.length
    ? scopedDatasetSchools
    : isBenchmarkLoading
      ? []
      : fallbackSchools;

  const targetSchoolKeys = new Set<string>([
    normalizeSchool(config.shortName),
    normalizeSchool(config.name),
    ...(ROSTER_NAME_MATCHERS[config.id] || []).map(normalizeSchool),
  ]);

  const selfSchool =
    allSchools.find((s) => targetSchoolKeys.has(normalizeSchool(s.shortName))) ||
    allSchools.find((s) => s.id === config.id) ||
    allSchools.find((s) => normalizeSchool(s.shortName).includes(normalizeSchool(config.shortName))) ||
    allSchools[0];

  const peers = allSchools.filter((s) => s.id !== selfSchool?.id);

  const confMedian = (key: keyof typeof benchmark) => {
    const vals = peers.map(p => p[key as keyof ConferenceBenchmarkSchool] as number).sort((a, b) => a - b);
    return vals.length ? vals[Math.floor(vals.length / 2)] : 0;
  };
  const medianDeals = confMedian('totalDeals');
  const medianEMV = confMedian('totalEMV');
  const medianEng = confMedian('avgEngagement');
  const medianAthletes = confMedian('athleteCount');
  const medianBrands = confMedian('brandCount');

  // Compute rank for each metric based on benchmark stats
  const rankOf = (field: keyof typeof benchmark, higher = true) => {
    if (!allSchools.length || !selfSchool) return { rank: 0, of: 0 };
    const sorted = [...allSchools].sort((a, b) => higher
      ? (b[field as keyof ConferenceBenchmarkSchool] as number) - (a[field as keyof ConferenceBenchmarkSchool] as number)
      : (a[field as keyof ConferenceBenchmarkSchool] as number) - (b[field as keyof ConferenceBenchmarkSchool] as number));
    return { rank: sorted.findIndex(s => s.id === selfSchool?.id) + 1, of: allSchools.length };
  };
  const rankForCanonicalEmv = () => {
    if (!allSchools.length) return { rank: 0, of: 0 };
    const better = allSchools.filter((s) => s.totalEMV > totalEmv).length;
    return { rank: better + 1, of: allSchools.length };
  };

  const metricRows = [
    { label: 'Sponsored Deals', thisVal: selfSchool?.totalDeals || 0, medVal: medianDeals, format: fmtN, rankKey: 'totalDeals' as const },
    { label: 'Est. Total EMV', thisVal: totalEmv, medVal: medianEMV, format: fmtCur, rankKey: 'totalEMV' as const },
    { label: 'Avg Engagement', thisVal: selfSchool?.avgEngagement || 0, medVal: medianEng, format: (v: number) => fmtPct(v), rankKey: 'avgEngagement' as const },
    { label: 'Athletes Active', thisVal: selfSchool?.athleteCount || 0, medVal: medianAthletes, format: fmtN, rankKey: 'athleteCount' as const },
    { label: 'Unique Brands', thisVal: selfSchool?.brandCount || 0, medVal: medianBrands, format: fmtN, rankKey: 'brandCount' as const },
  ];

  const standingMetrics = [
    { label: `${conference} Rank by Total EMV`, key: 'totalEMV' as const },
    { label: `${conference} Rank by Sponsored Deals`, key: 'totalDeals' as const },
    { label: `${conference} Rank by Unique Brands`, key: 'brandCount' as const },
    { label: `${conference} Rank by Athletes Active`, key: 'athleteCount' as const },
  ];
  const standingRanks = standingMetrics.map((item) => ({ ...item, rank: rankOf(item.key) }));
  const bestRankValue = Math.min(...standingRanks.map((item) => item.rank.rank || Number.MAX_SAFE_INTEGER));

  const sortedMetricRows = useMemo(() => {
    const rows = metricRows.map((row) => {
      const diff = row.medVal !== 0 ? ((row.thisVal - row.medVal) / Math.abs(row.medVal)) * 100 : 0;
      const rankData = row.rankKey === 'totalEMV' ? rankForCanonicalEmv() : rankOf(row.rankKey);
      return { ...row, diff, rank: rankData.rank, rankOf: rankData.of };
    });

    const sorted = [...rows].sort((a, b) => {
      if (comparisonSortKey === 'metric') return a.label.localeCompare(b.label);
      if (comparisonSortKey === 'thisVal') return a.thisVal - b.thisVal;
      if (comparisonSortKey === 'medVal') return a.medVal - b.medVal;
      if (comparisonSortKey === 'diff') return a.diff - b.diff;
      return a.rank - b.rank;
    });
    return comparisonSortDir === 'desc' ? sorted.reverse() : sorted;
  }, [metricRows, comparisonSortKey, comparisonSortDir]);

  const sortedLeaderboard = useMemo(() => {
    const rows = [...allSchools].sort((a, b) => {
      if (leaderSortKey === 'school') return a.shortName.localeCompare(b.shortName);
      if (leaderSortKey === 'deals') return a.totalDeals - b.totalDeals;
      if (leaderSortKey === 'emv') return a.totalEMV - b.totalEMV;
      if (leaderSortKey === 'engagement') return a.avgEngagement - b.avgEngagement;
      if (leaderSortKey === 'athletes') return a.athleteCount - b.athleteCount;
      return a.brandCount - b.brandCount;
    });
    return leaderSortDir === 'desc' ? rows.reverse() : rows;
  }, [allSchools, leaderSortKey, leaderSortDir]);

  const toggleComparisonSort = (key: 'metric' | 'thisVal' | 'medVal' | 'diff' | 'rank') => {
    if (comparisonSortKey === key) {
      setComparisonSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setComparisonSortKey(key);
    setComparisonSortDir(key === 'metric' ? 'asc' : 'desc');
  };

  const toggleLeaderSort = (key: 'school' | 'deals' | 'emv' | 'engagement' | 'athletes' | 'brands') => {
    if (leaderSortKey === key) {
      setLeaderSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setLeaderSortKey(key);
    setLeaderSortDir(key === 'school' ? 'asc' : 'desc');
  };

  const sortMarker = (active: boolean, dir: 'asc' | 'desc') => active ? (dir === 'desc' ? ' ↓' : ' ↑') : '';

  return (
    <div className="space-y-8">
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 style={headerStyle} className="text-lg font-bold uppercase tracking-tight text-[#0F1D2E]">Benchmarks</h2>
            <p className="text-sm text-[#5B6B82]">
              {shortName} vs {scope === 'conference' ? `${conference} conference peers` : 'NCAA schools in dataset'} ({allSchools.length} schools)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {([
              { key: 'conference', label: conference },
              { key: 'all', label: 'NCAA' },
            ] as const).map(chip => (
              <button
                key={chip.key}
                onClick={() => setScope(chip.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                  scope === chip.key
                    ? 'border-opacity-40 text-white'
                    : 'bg-white border-[#E1E7F0] text-[#1E2A3B] hover:border-opacity-30'
                }`}
                style={scope === chip.key ? { backgroundColor: primaryColor + '20', borderColor: primaryColor + '66', color: primaryColor } : {}}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-[#5B6B82]">
            Live stats: {fmtN(totalPosts)} posts • {fmtN(totalLikes)} likes • {fmtPct(avgEngagement)} avg ER
          </div>
        </div>
      </GlassPanel>

      {/* Where school stands */}
      <GlassPanel className="p-6">
        <h3 className="text-lg font-bold uppercase tracking-[0.08em] text-[#0F1D2E] mb-4">
          Where {shortName} Stands
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {standingRanks.map((item) => {
            const isBest = item.rank.rank === bestRankValue;
            return (
              <div
                key={item.key}
                className={`rounded-xl border p-4 ${isBest ? 'shadow-sm' : ''}`}
                style={isBest
                  ? { borderColor: primaryColor + '66', backgroundColor: primaryColor + '12' }
                  : { borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' }}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#4B5B73]">{item.label}</p>
                <p className="text-3xl font-black mt-2" style={{ color: isBest ? primaryColor : '#0F1D2E' }}>
                  {isBenchmarkLoading ? '…' : `#${item.rank.rank}`}
                </p>
                <p className="text-xs text-[#7A8AA3]">
                  {isBenchmarkLoading ? 'Loading conference benchmarks…' : `of ${item.rank.of} schools`}
                </p>
                {isBest && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mt-2" style={{ color: primaryColor }}>
                    Highest Position
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Comparison table */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          {shortName} vs {scope === 'conference' ? conference : 'NCAA Dataset'} Median
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th
                  className="text-left py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: comparisonSortKey === 'metric' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleComparisonSort('metric')}
                >
                  Metric{sortMarker(comparisonSortKey === 'metric', comparisonSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: comparisonSortKey === 'thisVal' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleComparisonSort('thisVal')}
                >
                  {shortName}{sortMarker(comparisonSortKey === 'thisVal', comparisonSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: comparisonSortKey === 'medVal' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleComparisonSort('medVal')}
                >
                  {scope === 'conference' ? `${conference} Median` : 'NCAA Median'}{sortMarker(comparisonSortKey === 'medVal', comparisonSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: comparisonSortKey === 'diff' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleComparisonSort('diff')}
                >
                  Diff{sortMarker(comparisonSortKey === 'diff', comparisonSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: comparisonSortKey === 'rank' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleComparisonSort('rank')}
                >
                  Rank{sortMarker(comparisonSortKey === 'rank', comparisonSortDir)}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedMetricRows.map(row => (
                <tr key={row.label} className="border-t border-[#E1E7F0] hover:bg-[#F3F6FB]">
                  <td className="py-3 px-3 text-sm font-medium text-[#0F1D2E]">{row.label}</td>
                  <td className="py-3 px-3 text-sm text-right font-semibold text-[#0F1D2E]">{row.format(row.thisVal)}</td>
                  <td className="py-3 px-3 text-sm text-right text-[#5B6B82]">{row.format(row.medVal)}</td>
                  <td className={`py-3 px-3 text-sm text-right font-semibold ${row.diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.diff >= 0 ? '+' : ''}{row.diff.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-sm text-right text-[#5B6B82]">#{row.rank}/{row.rankOf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>

      {/* Visual bars */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          Key Metrics vs {scope === 'conference' ? conference : 'NCAA Dataset'}
        </h3>
        <div className="space-y-5">
          {[
            { label: 'Sponsored Deals', thisVal: benchmark.totalDeals, medVal: medianDeals },
            { label: 'Total EMV', thisVal: totalEmv, medVal: medianEMV },
            { label: 'Avg Engagement', thisVal: benchmark.avgEngagement, medVal: medianEng },
          ].map(item => {
            const isEngagementMetric = item.label === 'Avg Engagement';
            const normalizeEngagementPct = (value: number) => (value <= 1 ? value * 100 : value);
            const thisVal = isEngagementMetric ? normalizeEngagementPct(item.thisVal) : item.thisVal;
            const medVal = isEngagementMetric ? normalizeEngagementPct(item.medVal) : item.medVal;
            const max = Math.max(thisVal, medVal) || 1;
            const valueLabel = isEngagementMetric
              ? `${shortName} ${fmtPct(thisVal, 1)} vs Median ${fmtPct(medVal, 1)}`
              : `${shortName} ${fmtN(thisVal)} vs Median ${fmtN(medVal)}`;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-[#0F1D2E]">{item.label}</span>
                  <span className="text-xs text-[#7A8AA3]">{valueLabel}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-14 truncate" style={{ color: primaryColor }}>{shortName}</span>
                    <div className="flex-1 h-5 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(thisVal / max) * 100}%`, backgroundColor: primaryColor }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs w-14 text-[#9AA7BC]">Median</span>
                    <div className="flex-1 h-5 bg-[#F0F4FA] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C8D5E3] rounded-full" style={{ width: `${(medVal / max) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>

      {/* Peer leaderboard */}
      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          {scope === 'conference' ? `${conference} Leaderboard` : 'NCAA Dataset Leaderboard'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-[#5B6B82]">
                <th
                  className="text-left py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: leaderSortKey === 'school' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleLeaderSort('school')}
                >
                  School{sortMarker(leaderSortKey === 'school', leaderSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: leaderSortKey === 'deals' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleLeaderSort('deals')}
                >
                  Deals{sortMarker(leaderSortKey === 'deals', leaderSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: leaderSortKey === 'emv' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleLeaderSort('emv')}
                >
                  EMV{sortMarker(leaderSortKey === 'emv', leaderSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: leaderSortKey === 'engagement' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleLeaderSort('engagement')}
                >
                  Avg Eng.{sortMarker(leaderSortKey === 'engagement', leaderSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: leaderSortKey === 'athletes' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleLeaderSort('athletes')}
                >
                  Athletes{sortMarker(leaderSortKey === 'athletes', leaderSortDir)}
                </th>
                <th
                  className="text-right py-2 px-3 cursor-pointer select-none hover:text-[#1770C0] transition-colors"
                  style={{ color: leaderSortKey === 'brands' ? primaryColor : '#5B6B82' }}
                  onClick={() => toggleLeaderSort('brands')}
                >
                  Brands{sortMarker(leaderSortKey === 'brands', leaderSortDir)}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map(s => (
                <tr key={s.id}
                  className={`border-t border-[#E1E7F0] ${s.id === selfSchool?.id ? 'font-semibold' : 'hover:bg-[#F3F6FB]'}`}
                  style={s.id === selfSchool?.id ? { backgroundColor: primaryColor + '0D' } : {}}>
                  <td className="py-3 px-3 text-sm text-[#0F1D2E]">
                    {s.id === selfSchool?.id ? '→ ' : ''}{s.shortName}
                  </td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.totalDeals)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtCur(s.totalEMV)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtPct(s.avgEngagement)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.athleteCount)}</td>
                  <td className="py-3 px-3 text-sm text-right">{fmtN(s.brandCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── IP Tab ──────────────────────────────────────────────────
function IPTab({
  comparisons,
  primaryColor,
  secondaryColor,
  shortName,
}: {
  comparisons: IPComparison[];
  primaryColor: string;
  secondaryColor: string;
  shortName: string;
}) {
  const [signal, setSignal] = useState<'collab' | 'logo' | 'caption'>('collab');
  const [metric, setMetric] = useState<'er' | 'likes' | 'comments'>('er');

  const signals = [
    { id: 'collab' as const, label: 'Collaboration', data: comparisons.find(c => c.label === 'Collaboration') },
    { id: 'logo' as const, label: 'Logo', data: comparisons.find(c => c.label === 'Logo') },
    { id: 'caption' as const, label: 'Caption', data: comparisons.find(c => c.label === 'Caption') },
  ].filter((s): s is { id: 'collab' | 'logo' | 'caption'; label: string; data: IPComparison } => Boolean(s.data));

  const metrics = [
    { id: 'er' as const, label: 'Eng. Rate' },
    { id: 'likes' as const, label: 'Likes/Post' },
    { id: 'comments' as const, label: 'Comments/Post' },
  ];

  const active = signals.find(s => s.id === signal) ?? signals[0];
  if (!active) {
    return (
      <div className="space-y-8">
        <GlassPanel className="p-6">
          <p className="text-sm text-[#5B6B82]">No IP comparison data is available for this school yet.</p>
        </GlassPanel>
      </div>
    );
  }

  const withData = active.data.yes;
  const noData = active.data.no;
  const lift = active.data.avgLift;
  const liftPositive = lift >= 0;

  const metricValue = () => {
    if (metric === 'er') {
      return {
        withVal: withData.engagementRate * 100,
        noVal: noData.engagementRate * 100,
        fmt: (v: number) => fmtPct(v, 1),
      };
    }
    if (metric === 'likes') {
      return {
        withVal: withData.likes,
        noVal: noData.likes,
        fmt: (v: number) => fmtN(Math.round(v)),
      };
    }
    return {
      withVal: withData.comments,
      noVal: noData.comments,
      fmt: (v: number) => fmtN(Math.round(v)),
    };
  };

  const { withVal, noVal, fmt } = metricValue();
  const maxVal = Math.max(withVal, noVal, 0.001);
  const withPct = (withVal / maxVal) * 100;
  const noPct = (noVal / maxVal) * 100;

  const secondaryIsLight = ['#fff', '#ffffff', '#fdf9d8'].includes(secondaryColor.toLowerCase());

  return (
    <div className="space-y-6">
      <GlassPanel className="p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] mb-2" style={{ color: primaryColor }}>
              IP Intelligence · Instagram Only
            </p>
            <p className="text-3xl md:text-4xl font-black text-[#0F1D2E] leading-tight">
              Posts with {shortName} {active.label.toLowerCase()} drive{' '}
              <span style={{ color: liftPositive ? primaryColor : '#C2413B' }}>
                {liftPositive ? '+' : ''}{lift.toFixed(1)}%
              </span>{' '}
              higher engagement.
            </p>
          </div>
        </div>
      </GlassPanel>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A8AA3] leading-none">By Signal</p>
          <div className="flex items-center gap-1 rounded-xl border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
            {signals.map(s => (
              <button
                key={s.id}
                onClick={() => setSignal(s.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  signal === s.id ? 'text-white shadow-sm' : 'text-[#5B6B82] hover:text-[#1E2A3B]'
                }`}
                style={signal === s.id ? { backgroundColor: primaryColor } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-12 w-px self-stretch bg-[#D3DAE6] mx-1" />

        <div className="flex flex-col gap-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7A8AA3] leading-none">By Metric</p>
          <div className="flex items-center gap-1 rounded-xl border border-[#E1E7F0] p-1 bg-[#F7F9FC]">
            {metrics.map(m => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  metric === m.id ? 'text-[#0F1D2E] shadow-sm' : 'text-[#5B6B82] hover:text-[#1E2A3B]'
                }`}
                style={metric === m.id
                  ? { backgroundColor: secondaryColor, border: secondaryIsLight ? '1px solid #D6DEE8' : undefined }
                  : undefined}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GlassPanel className="p-6">
        <p className="text-sm font-bold text-[#0F1D2E] mb-1">
          {active.label} Impact on {metrics.find(m => m.id === metric)?.label}
        </p>
        <p className="text-xs text-[#7A8AA3] mb-6">
          Posts using {active.label.toLowerCase()} vs posts without {active.label.toLowerCase()}
        </p>
        <div className="space-y-5">
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: primaryColor }}>
                With {active.label} · {fmtN(withData.contents)} posts
              </p>
              <p className="text-xl font-black text-[#0F1D2E]">{fmt(withVal)}</p>
            </div>
            <div className="w-full bg-[#F0F4FA] rounded-lg h-9 overflow-hidden">
              <div className="h-full rounded-lg transition-all duration-700" style={{ width: `${Math.max(withPct, 2)}%`, backgroundColor: primaryColor }} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9AA7BC]">
                Without {active.label} · {fmtN(noData.contents)} posts
              </p>
              <p className="text-xl font-black text-[#5B6B82]">{fmt(noVal)}</p>
            </div>
            <div className="w-full bg-[#F0F4FA] rounded-lg h-9 overflow-hidden">
              <div className="h-full rounded-lg bg-[#C8D5E3] transition-all duration-700" style={{ width: `${Math.max(noPct, 2)}%` }} />
            </div>
          </div>
          <div className="pt-2 border-t border-[#E1E7F0] flex items-center gap-2">
            {liftPositive ? <ArrowUpRight className="w-5 h-5" style={{ color: primaryColor }} /> : <ArrowDownRight className="w-5 h-5 text-[#C2413B]" />}
            <span className="text-sm font-bold" style={{ color: liftPositive ? primaryColor : '#C2413B' }}>
              {liftPositive ? '+' : ''}{lift.toFixed(1)}% ER lift
            </span>
            <span className="text-xs text-[#7A8AA3]">on posts with {active.label.toLowerCase()}</span>
          </div>
        </div>
      </GlassPanel>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Posts With', value: fmtN(withData.contents) },
          { label: 'Posts Without', value: fmtN(noData.contents) },
          { label: 'Avg ER (With IP)', value: fmtPct(withData.engagementRate * 100, 1) },
          { label: 'EMV (With IP)', value: fmtCur(withData.emv) },
        ].map(item => (
          <GlassPanel key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#4B5B73]">{item.label}</p>
            <p className="text-xl font-bold mt-2 text-[#0F1D2E]">{item.value}</p>
          </GlassPanel>
        ))}
      </div>

      <GlassPanel className="p-6">
        <h3 style={headerStyle} className="text-base font-bold uppercase tracking-tight mb-4 text-[#0F1D2E]">
          All IP Signals — Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signals.map(s => {
            const pos = s.data.avgLift >= 0;
            const color = pos ? primaryColor : '#C2413B';
            return (
              <button
                key={s.id}
                onClick={() => setSignal(s.id)}
                className="text-left rounded-xl border p-4 transition-all border-[#E1E7F0] bg-white hover:border-[#CBD7E6]"
                style={signal === s.id ? { borderColor: primaryColor + '66', backgroundColor: primaryColor + '0D' } : undefined}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#0F1D2E]">{s.label}</span>
                  <span className="text-sm font-bold" style={{ color }}>
                    {pos ? '+' : ''}{s.data.avgLift.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#5B6B82]">
                  <div className="flex justify-between"><span>Posts with</span><span className="font-medium text-[#0F1D2E]">{fmtN(s.data.yes.contents)}</span></div>
                  <div className="flex justify-between"><span>Avg ER with</span><span className="font-medium text-[#0F1D2E]">{fmtPct(s.data.yes.engagementRate * 100, 1)}</span></div>
                  <div className="flex justify-between"><span>Likes/post with</span><span className="font-medium text-[#0F1D2E]">{fmtN(Math.round(s.data.yes.likes))}</span></div>
                </div>
              </button>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}

// ─── Athlete Drawer ──────────────────────────────────────────
function AthleteDrawer({ athlete }: { athlete: DerivedAthlete }) {
  const likesPerPost = athlete.totalPosts ? athlete.totalLikes / athlete.totalPosts : 0;
  const commentsPerPost = athlete.totalPosts ? athlete.totalComments / athlete.totalPosts : 0;

  return (
    <div className="space-y-4 text-sm text-[#1E2A3B]">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-xl bg-[#F0F4FA] overflow-hidden">
          {athlete.image
            ? <img src={athlete.image} alt={athlete.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xs text-[#9AA7BC]">N/A</div>}
        </div>
        <div>
          <div className="text-base font-semibold text-[#0F1D2E]">{athlete.name}</div>
          <div className="text-xs text-[#5B6B82]">{fmtSport(athlete.sport)}{athlete.position ? ` • ${athlete.position}` : ''}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>Likes: {fmtN(athlete.totalLikes)}</div>
        <div>Comments: {fmtN(athlete.totalComments)}</div>
        <div>Avg ER: {fmtPct(athlete.avgEngagementRate * 100)}</div>
        <div>Posts: {fmtN(athlete.totalPosts)}</div>
        <div>Likes/post: {fmtN(likesPerPost)}</div>
        <div>Comments/post: {fmtN(commentsPerPost)}</div>
      </div>
    </div>
  );
}
