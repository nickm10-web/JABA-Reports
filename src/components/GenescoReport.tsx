import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Heart,
  Eye,
  DollarSign,
  Instagram,
  Handshake,
  Award,
  ArrowUpRight,
  LayoutDashboard,
  Sparkles,
  LineChart,
  Grid3x3,
  Info,
  Lightbulb,
  BookOpen,
  Target,
  Calendar,
  Zap,
  ChevronDown,
} from 'lucide-react';
import contentsData from '../data/Genesco_contents.json';
import rosterData from '../data/Genesco_Roster.json';

// ===== Types =====
type PostMetrics = {
  comments?: number;
  likes?: number;
  engagementRate?: number;
  shares?: number;
  saves?: number;
  impressions?: number;
  followers?: number;
  totalInteractions?: number;
  videoViews?: number;
  reach?: number;
  emv?: number;
};

type Post = {
  _id: string;
  athlete: {
    _id: string;
    name: string;
    image?: string;
    sport?: string;
    position?: string;
  };
  caption?: string;
  createdAt?: { $date: string };
  publishedAt?: { $date: string };
  hasOrganizationLogo?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  isSponsored?: boolean;
  mediaType?: 'VIDEO' | 'PHOTO' | string;
  metrics?: PostMetrics;
  permalink?: string;
  url?: string;
  source?: string;
  sponsorPartner?: string;
};

type RosterAthlete = {
  _id?: { $oid: string } | string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  sport?: string;
  position?: string;
  metrics?: {
    sevenDays?: {
      followers?: number;
      marketability?: number;
      influencePower?: number;
      audienceConnection?: number;
      engagementRate?: number;
    };
  };
};

// ===== JABA design system tokens =====
const t = {
  bg: '#0a0a0a',
  cardBg: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
  cardBgFlat: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardBorderHover: 'rgba(255,255,255,0.12)',
  cardShadow:
    '0 4px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
  topHighlight: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
  accent: '#c8ff00',
  accentDim: 'rgba(200,255,0,0.15)',
  accentSoft: 'rgba(200,255,0,0.2)',
  accentGlow: 'rgba(200,255,0,0.3)',
  accentGlowStrong: 'rgba(200,255,0,0.5)',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.5)',
  textTertiary: 'rgba(255,255,255,0.3)',
  // semantic
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  orange: '#f59e0b',
  purple: '#a855f7',
  yellow: '#eab308',
  cyan: '#06b6d4',
  // radii
  radius: '16px',
  radiusSm: '12px',
  radiusXs: '8px',
  // motion & blur
  transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  blur: 'blur(16px)',
};

// ===== Helpers =====
const posts = contentsData as unknown as Post[];
const roster = rosterData as unknown as RosterAthlete[];

const fmtInt = (n: number) => {
  if (!isFinite(n)) return '0';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
};

const fmtCurrency = (n: number) => {
  if (!isFinite(n)) return '$0';
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + Math.round(n).toLocaleString();
};

const fmtPct = (n: number) => (isFinite(n) ? (n * 100).toFixed(2) + '%' : '0%');

const INTER_STACK = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

// ===== Trends chart - metric config =====
type MetricKey = 'emv' | 'posts' | 'likes' | 'er' | 'videoViews' | 'saves' | 'comments';

type MetricDef = {
  key: MetricKey;
  label: string;
  color: string;
  format: (n: number) => string;
  /** 'line' = smooth line overlay · 'bar' = bar series (posts) */
  kind: 'line' | 'bar';
};

const METRIC_ORDER: MetricKey[] = ['emv', 'posts', 'likes', 'er', 'videoViews', 'saves', 'comments'];

const METRIC_DEFS: Record<MetricKey, MetricDef> = {
  emv: { key: 'emv', label: 'EMV', color: '#c8ff00', format: fmtCurrency, kind: 'line' },
  posts: {
    key: 'posts',
    label: 'Posts',
    color: '#3b82f6',
    // Integer months render as "15"; averages (e.g. 3.2222…) round to one decimal
    format: (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1)),
    kind: 'bar',
  },
  likes: { key: 'likes', label: 'Likes', color: '#a855f7', format: fmtInt, kind: 'line' },
  er: {
    key: 'er',
    label: 'Engagement Rate',
    color: '#06b6d4',
    format: (n) => (n * 100).toFixed(2) + '%',
    kind: 'line',
  },
  videoViews: { key: 'videoViews', label: 'Video Views', color: '#f59e0b', format: fmtInt, kind: 'line' },
  saves: { key: 'saves', label: 'Saves', color: '#22c55e', format: fmtInt, kind: 'line' },
  comments: { key: 'comments', label: 'Comments', color: '#eab308', format: fmtInt, kind: 'line' },
};

type SponsorRow = {
  sponsor: string;
  posts: number;
  emv: number;
  likes: number;
  comments: number;
  avgER: number;
  topAthlete: string;
  athletes: string[]; // ordered by EMV contribution to this sponsor
  topPosts: Post[]; // top 2 by EMV
};

/** Instagram handle → best-guess brand domain for Clearbit logo lookup */
const SPONSOR_DOMAIN_MAP: Record<string, string> = {
  '@mastercard': 'mastercard.com',
  '@loweshomeimprovement': 'lowes.com',
  '@americaneagle': 'ae.com',
  '@snickers': 'snickers.com',
  '@sleepnumber': 'sleepnumber.com',
  '@messifragrances': 'messifragrances.com',
  '@efootball': 'konami.com',
  '@bountypapertowels': 'bountytowels.com',
  '@icons_memorabilia': 'iconsmemorabilia.com',
};

const prettyBrandName = (handle: string): string => {
  const stripped = handle.startsWith('@') ? handle.slice(1) : handle;
  // Split snake_case / kebab-case into words, title-case each
  return stripped
    .split(/[_-]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

type MonthFull = {
  month: string;
  emv: number;
  posts: number;
  likes: number;
  er: number;
  videoViews: number;
  saves: number;
  comments: number;
  topPost: Post | null;
};

// ===== Tabs =====
type TabKey = 'overview' | 'sponsored' | 'athletes' | 'content' | 'trends' | 'reference';
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
  { key: 'sponsored', label: 'Sponsored', icon: <Sparkles size={14} /> },
  { key: 'athletes', label: 'Athletes', icon: <Users size={14} /> },
  { key: 'content', label: 'Content', icon: <Grid3x3 size={14} /> },
  { key: 'trends', label: 'Trends', icon: <LineChart size={14} /> },
  { key: 'reference', label: 'Reference', icon: <BookOpen size={14} /> },
];

// Inject Inter font once
let fontInjected = false;
function useInter() {
  useEffect(() => {
    if (fontInjected) return;
    fontInjected = true;
    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap';
    document.head.append(pre1, pre2, fontLink);
  }, []);
}

// ===== Component =====
export function GenescoReport() {
  useInter();
  const [tab, setTab] = useState<TabKey>('overview');
  const [bubbleFilter, setBubbleFilter] = useState<'all' | 'sponsored' | 'collab'>('sponsored');
  const [bubbleZoom, setBubbleZoom] = useState<'data' | 'full'>('data');
  const [contentAthleteFilter, setContentAthleteFilter] = useState<string>('__all__');
  // Sponsored tab - brand search + sort controls
  const [sponsorQuery, setSponsorQuery] = useState<string>('');
  const [sponsorSort, setSponsorSort] = useState<'emv' | 'posts' | 'avgER' | 'likes'>(
    'emv',
  );
  // Trends tab defaults to rest-of-roster (exclude #1 athlete) so the chart isn't dominated
  // by a single outlier month. Scoped to this tab only - other tabs always show full roster.
  const [trendsFullRoster, setTrendsFullRoster] = useState<boolean>(false);

  // Active metrics on the Trends chart (multiple allowed). Default = EMV + Posts.
  // Order matters - the first entry is the "primary" metric that drives the annotation row.
  const [trendsActiveMetrics, setTrendsActiveMetrics] = useState<MetricKey[]>([
    'emv',
    'posts',
  ]);

  // #1 athlete across the full dataset (needed to exclude for the Trends-only view)
  const rosterTopName = useMemo(() => {
    const totals = new Map<string, number>();
    for (const p of posts) {
      const n = p.athlete?.name ?? '';
      totals.set(n, (totals.get(n) ?? 0) + (p.metrics?.emv ?? 0));
    }
    let best = '';
    let bestEmv = -1;
    for (const [n, v] of totals) {
      if (v > bestEmv) {
        best = n;
        bestEmv = v;
      }
    }
    return best;
  }, []);

  // Full monthly data for the Trends tab - all seven metrics + top post per month
  const trendsMonthly = useMemo<MonthFull[]>(() => {
    const source = trendsFullRoster
      ? posts
      : posts.filter((p) => p.athlete?.name !== rosterTopName);
    type WorkingRow = MonthFull & {
      _erSum: number;
      _erCount: number;
    };
    const map = new Map<string, WorkingRow>();
    for (const p of source) {
      const dstr = p.publishedAt?.$date ?? p.createdAt?.$date;
      if (!dstr) continue;
      const d = new Date(dstr);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      let row = map.get(key);
      if (!row) {
        row = {
          month: key,
          emv: 0,
          posts: 0,
          likes: 0,
          er: 0,
          videoViews: 0,
          saves: 0,
          comments: 0,
          topPost: null,
          _erSum: 0,
          _erCount: 0,
        };
        map.set(key, row);
      }
      row.emv += p.metrics?.emv ?? 0;
      row.posts++;
      row.likes += p.metrics?.likes ?? 0;
      row.videoViews += p.metrics?.videoViews ?? 0;
      row.saves += p.metrics?.saves ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      const er = p.metrics?.engagementRate ?? 0;
      if (er > 0) {
        row._erSum += er;
        row._erCount++;
      }
      const curTopEmv = row.topPost?.metrics?.emv ?? -1;
      const thisEmv = p.metrics?.emv ?? 0;
      if (thisEmv > curTopEmv) row.topPost = p;
    }
    // Finalize: mean ER per month; strip working fields
    return Array.from(map.values())
      .map<MonthFull>((r) => ({
        month: r.month,
        emv: r.emv,
        posts: r.posts,
        likes: r.likes,
        er: r._erCount ? r._erSum / r._erCount : 0,
        videoViews: r.videoViews,
        saves: r.saves,
        comments: r.comments,
        topPost: r.topPost,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [trendsFullRoster, rosterTopName]);

  // Summary stats for the Trends annotation row - reflects the "primary" (first-active) metric
  const trendsStats = useMemo(() => {
    const primary: MetricKey = trendsActiveMetrics[0] ?? 'emv';
    const peak = trendsMonthly.reduce<MonthFull>(
      (best, m) =>
        (m[primary] as number) > (best[primary] as number) ? m : best,
      {
        month: '-',
        emv: 0,
        posts: 0,
        likes: 0,
        er: 0,
        videoViews: 0,
        saves: 0,
        comments: 0,
        topPost: null,
      },
    );
    const monthsActive = trendsMonthly.length;
    const monthsWithData = trendsMonthly.filter(
      (m) => (m[primary] as number) > 0,
    ).length;
    const totalPosts = trendsMonthly.reduce((a, m) => a + m.posts, 0);
    const primaryTotal = trendsMonthly.reduce(
      (a, m) => a + (m[primary] as number),
      0,
    );
    const avgPrimary = monthsActive ? primaryTotal / monthsActive : 0;
    const cadence = monthsActive ? totalPosts / monthsActive : 0;
    return {
      primary,
      peak,
      peakValue: peak[primary] as number,
      avgPrimary,
      monthsActive,
      monthsWithData,
      cadence,
    };
  }, [trendsActiveMetrics, trendsMonthly]);

  // --- KPIs ---
  const kpis = useMemo(() => {
    let emv = 0;
    let likes = 0;
    let comments = 0;
    let views = 0;
    let videoPostCount = 0;
    let sponsored = 0;
    let collab = 0;
    let erSum = 0;
    let erCount = 0;
    let sponsoredEmv = 0;
    let sponsoredLikes = 0;
    let sponsoredComments = 0;
    const athletes = new Set<string>();
    for (const p of posts) {
      emv += p.metrics?.emv ?? 0;
      likes += p.metrics?.likes ?? 0;
      comments += p.metrics?.comments ?? 0;
      if (p.mediaType === 'VIDEO') {
        videoPostCount++;
        views += p.metrics?.videoViews ?? 0;
      }
      if (p.isSponsored) {
        sponsored++;
        sponsoredEmv += p.metrics?.emv ?? 0;
        sponsoredLikes += p.metrics?.likes ?? 0;
        sponsoredComments += p.metrics?.comments ?? 0;
      }
      if (p.isCollaboration) collab++;
      athletes.add(p.athlete?.name ?? '');
      const er = p.metrics?.engagementRate ?? 0;
      if (er > 0) {
        erSum += er;
        erCount++;
      }
    }
    const followersTotal = roster.reduce(
      (acc, a) => acc + (a.metrics?.sevenDays?.followers ?? 0),
      0,
    );
    const avgER = erCount ? erSum / erCount : 0;
    return {
      posts: posts.length,
      athletes: athletes.size,
      rosterCount: roster.length,
      emv,
      likes,
      comments,
      views,
      videoPostCount,
      sponsored,
      collab,
      followersTotal,
      avgER,
      sponsoredEmv,
      sponsoredLikes,
      sponsoredComments,
    };
  }, [posts, roster]);

  // --- Athletes aggregated ---
  const athleteRows = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        sport: string;
        image?: string;
        posts: number;
        emv: number;
        likes: number;
        comments: number;
        views: number;
        sponsored: number;
        collab: number;
      }
    >();
    for (const p of posts) {
      const name = p.athlete?.name ?? 'Unknown';
      const row =
        map.get(name) ??
        {
          name,
          sport: p.athlete?.sport ?? 'Unknown',
          image: p.athlete?.image,
          posts: 0,
          emv: 0,
          likes: 0,
          comments: 0,
          views: 0,
          sponsored: 0,
          collab: 0,
        };
      row.posts++;
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      row.views += p.metrics?.videoViews ?? 0;
      if (p.isSponsored) row.sponsored++;
      if (p.isCollaboration) row.collab++;
      map.set(name, row);
    }
    return Array.from(map.values()).sort((a, b) => b.emv - a.emv);
  }, [posts]);

  // --- Full per-athlete profile (post-level metrics joined with roster followers) ---
  // Used by the Overview leaderboards, the athlete-level bubble scatter, and profile cards.
  type AthleteFull = {
    name: string;
    sport: string;
    image?: string;
    followers: number;
    posts: number;
    emv: number;
    likes: number;
    comments: number;
    avgER: number; // average engagement rate across this athlete's posts (weight=1/post)
    sponsored: number;
    collab: number;
  };
  const athleteFull = useMemo<AthleteFull[]>(() => {
    // Index roster by full name for follower lookup
    const rosterByName = new Map<string, RosterAthlete>();
    for (const r of roster) {
      const full = `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim();
      if (full) rosterByName.set(full, r);
    }
    // Start from each athlete that has posts; add posts=0 entries for roster members who didn't post
    const byName = new Map<string, AthleteFull>();
    for (const p of posts) {
      const name = p.athlete?.name ?? 'Unknown';
      let row = byName.get(name);
      if (!row) {
        const r = rosterByName.get(name);
        row = {
          name,
          sport: p.athlete?.sport ?? r?.sport ?? 'Unknown',
          image: p.athlete?.image,
          followers: r?.metrics?.sevenDays?.followers ?? 0,
          posts: 0,
          emv: 0,
          likes: 0,
          comments: 0,
          avgER: 0,
          sponsored: 0,
          collab: 0,
        };
        byName.set(name, row);
      }
      row.posts++;
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      if (p.isSponsored) row.sponsored++;
      if (p.isCollaboration) row.collab++;
      const er = p.metrics?.engagementRate ?? 0;
      // running mean
      row.avgER = row.avgER + (er - row.avgER) / row.posts;
    }
    // Also include roster members with zero posts (for Top by Followers)
    for (const [name, r] of rosterByName) {
      if (byName.has(name)) continue;
      byName.set(name, {
        name,
        sport: r.sport ?? 'Unknown',
        image: r.profilePicture,
        followers: r.metrics?.sevenDays?.followers ?? 0,
        posts: 0,
        emv: 0,
        likes: 0,
        comments: 0,
        avgER: 0,
        sponsored: 0,
        collab: 0,
      });
    }
    // Drop roster members with zero data across the board - they're roster placeholders
    // with no IG activity and no follower snapshot yet (e.g. Angel Reese, Devin Lloyd).
    return Array.from(byName.values()).filter(
      (a) => a.posts > 0 || a.followers > 0,
    );
  }, [posts, roster]);

  // --- Breakdowns ---
  const breakdowns = useMemo(() => {
    const sport: Record<string, { posts: number; emv: number; athletes: Set<string>; likes: number }> = {};
    const media: Record<string, { posts: number; emv: number }> = {};
    const kind: Record<string, number> = { Sponsored: 0, Collaboration: 0, Organic: 0 };
    for (const p of posts) {
      const s = p.athlete?.sport ?? 'Unknown';
      sport[s] = sport[s] ?? { posts: 0, emv: 0, athletes: new Set<string>(), likes: 0 };
      sport[s].posts++;
      sport[s].emv += p.metrics?.emv ?? 0;
      sport[s].likes += p.metrics?.likes ?? 0;
      sport[s].athletes.add(p.athlete?.name ?? '');
      const m = p.mediaType ?? 'Unknown';
      media[m] = media[m] ?? { posts: 0, emv: 0 };
      media[m].posts++;
      media[m].emv += p.metrics?.emv ?? 0;
      if (p.isSponsored) kind.Sponsored++;
      else if (p.isCollaboration) kind.Collaboration++;
      else kind.Organic++;
    }
    return { sport, media, kind };
  }, [posts]);

  // --- Monthly trend ---
  const monthly = useMemo(() => {
    const map = new Map<string, { month: string; emv: number; likes: number; posts: number }>();
    for (const p of posts) {
      const dstr = p.publishedAt?.$date ?? p.createdAt?.$date;
      if (!dstr) continue;
      const d = new Date(dstr);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      const row = map.get(key) ?? { month: key, emv: 0, likes: 0, posts: 0 };
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.posts++;
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
  }, [posts]);

  // --- Bubble points ---
  const bubblePoints = useMemo(() => {
    const source = posts.filter((p) => {
      if (bubbleFilter === 'sponsored') return p.isSponsored;
      if (bubbleFilter === 'collab') return p.isCollaboration;
      return true;
    });
    return source
      .map((p) => ({
        id: p._id,
        name: p.athlete?.name ?? 'Unknown',
        sport: p.athlete?.sport ?? '',
        sponsor: p.sponsorPartner || '',
        er: p.metrics?.engagementRate ?? 0,
        likes: p.metrics?.likes ?? 0,
        emv: p.metrics?.emv ?? 0,
        isSponsored: !!p.isSponsored,
        isCollab: !!p.isCollaboration,
      }))
      .filter((d) => d.likes > 0 || d.emv > 0);
  }, [bubbleFilter, posts]);

  // --- Top sponsors ---
  const topSponsors = useMemo<SponsorRow[]>(() => {
    type WorkingRow = {
      sponsor: string;
      posts: number;
      emv: number;
      likes: number;
      comments: number;
      topAthlete: string;
      topAthleteEmv: number;
      perAthlete: Map<string, number>;
      erValues: number[];
      postsList: Post[];
    };
    const map = new Map<string, WorkingRow>();
    for (const p of posts) {
      if (!p.isSponsored) continue;
      // Skip any post without a valid, identified sponsor partner.
      // null / undefined / "" / "unknown" (any case) are all silently dropped.
      const raw = p.sponsorPartner;
      if (!raw) continue;
      const key = raw.trim();
      if (!key) continue;
      if (key.toLowerCase() === 'unknown') continue;
      let row = map.get(key);
      if (!row) {
        row = {
          sponsor: key,
          posts: 0,
          emv: 0,
          likes: 0,
          comments: 0,
          topAthlete: '',
          topAthleteEmv: 0,
          perAthlete: new Map<string, number>(),
          erValues: [],
          postsList: [],
        };
        map.set(key, row);
      }
      row.posts++;
      row.emv += p.metrics?.emv ?? 0;
      row.likes += p.metrics?.likes ?? 0;
      row.comments += p.metrics?.comments ?? 0;
      const er = p.metrics?.engagementRate ?? 0;
      if (er > 0) row.erValues.push(er);
      row.postsList.push(p);
      const a = p.athlete?.name ?? 'Unknown';
      const sum = (row.perAthlete.get(a) ?? 0) + (p.metrics?.emv ?? 0);
      row.perAthlete.set(a, sum);
      if (sum > row.topAthleteEmv) {
        row.topAthleteEmv = sum;
        row.topAthlete = a;
      }
    }
    // Finalize: compute avgER, build athletes list ordered by their EMV contribution,
    // and pick the top 2 posts per sponsor (by post EMV) for the expanded card.
    return Array.from(map.values())
      .map<SponsorRow>((r) => {
        const avgER = r.erValues.length
          ? r.erValues.reduce((a, v) => a + v, 0) / r.erValues.length
          : 0;
        const athletesRanked = Array.from(r.perAthlete.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name);
        const topPosts = [...r.postsList]
          .sort((a, b) => (b.metrics?.emv ?? 0) - (a.metrics?.emv ?? 0))
          .slice(0, 2);
        return {
          sponsor: r.sponsor,
          posts: r.posts,
          emv: r.emv,
          likes: r.likes,
          comments: r.comments,
          avgER,
          topAthlete: r.topAthlete,
          athletes: athletesRanked,
          topPosts,
        };
      })
      .sort((a, b) => b.emv - a.emv);
  }, []);

  // --- Data-driven insights (computed at runtime from actual data) ---
  const insights = useMemo(() => {
    // Messi / top-1 concentration
    const topAthlete = athleteRows[0];
    const topAthleteShare = topAthlete ? topAthlete.emv / Math.max(1, kpis.emv) : 0;

    // Top-3 concentration
    const top3 = athleteRows.slice(0, 3).reduce((a, r) => a + r.emv, 0);
    const top3Share = top3 / Math.max(1, kpis.emv);

    // Sponsored vs non-sponsored avg ER
    let spER = 0;
    let spCount = 0;
    let nonSpER = 0;
    let nonSpCount = 0;
    for (const p of posts) {
      const er = p.metrics?.engagementRate ?? 0;
      if (p.isSponsored) {
        spER += er;
        spCount++;
      } else {
        nonSpER += er;
        nonSpCount++;
      }
    }
    const avgSponsoredER = spCount ? spER / spCount : 0;
    const avgOrganicER = nonSpCount ? nonSpER / nonSpCount : 0;

    // Video vs Photo average EMV
    const videoEmv = breakdowns.media['VIDEO']?.emv ?? 0;
    const videoPosts = breakdowns.media['VIDEO']?.posts ?? 0;
    const photoEmv = breakdowns.media['PHOTO']?.emv ?? 0;
    const photoPosts = breakdowns.media['PHOTO']?.posts ?? 0;
    const avgVideoEmv = videoPosts ? videoEmv / videoPosts : 0;
    const avgPhotoEmv = photoPosts ? photoEmv / photoPosts : 0;

    // Football vs Soccer
    const fbEmv = breakdowns.sport['Football']?.emv ?? 0;
    const soEmv = breakdowns.sport['Soccer']?.emv ?? 0;

    // Trend summary
    const peak = monthly.reduce(
      (best, m) => (m.emv > best.emv ? m : best),
      { month: '-', emv: 0, likes: 0, posts: 0 },
    );
    const avgMonthlyEmv = monthly.length ? kpis.emv / monthly.length : 0;

    // Sponsored window
    const sponsoredEmv = posts
      .filter((p) => p.isSponsored)
      .reduce((a, p) => a + (p.metrics?.emv ?? 0), 0);
    const sponsoredShare = sponsoredEmv / Math.max(1, kpis.emv);

    // Top single post
    const topPost = [...posts].sort(
      (a, b) => (b.metrics?.emv ?? 0) - (a.metrics?.emv ?? 0),
    )[0];

    // Biggest sponsor
    const biggestSponsor = topSponsors[0];

    return {
      topAthlete,
      topAthleteShare,
      top3Share,
      avgSponsoredER,
      avgOrganicER,
      avgVideoEmv,
      avgPhotoEmv,
      fbEmv,
      soEmv,
      peak,
      avgMonthlyEmv,
      monthsActive: monthly.length,
      sponsoredEmv,
      sponsoredShare,
      topPost,
      biggestSponsor,
    };
  }, [athleteRows, kpis, posts, breakdowns, monthly, topSponsors]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: t.bg,
        color: t.textPrimary,
        fontFamily: INTER_STACK,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Ambient background glows (JABA atmosphere) */}
      <AmbientGlows />

      {/* Hero */}
      <header
        style={{
          position: 'relative',
          zIndex: 1,
          borderBottom: `1px solid ${t.cardBorder}`,
          padding: '56px 0 48px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ minWidth: 0, flex: '1 1 520px' }}>
              <img
                src="/logos/genesco-gse.svg"
                alt="Genesco Sports Enterprises"
                style={{
                  display: 'block',
                  height: 64,
                  width: 'auto',
                  maxWidth: '100%',
                  filter: 'drop-shadow(0 4px 16px rgba(1,105,173,0.25))',
                }}
              />
              <div style={{ ...jabaLogoStyle, fontSize: 11, marginTop: 14, opacity: 0.85 }}>
                Powered by JABA · Intelligence
              </div>
              <h1
                style={{
                  margin: '14px 0 0',
                  fontSize: 'clamp(32px, 5vw, 44px)',
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: '-1px',
                  color: t.textPrimary,
                }}
              >
                Social Performance <span style={{ color: t.accent, textShadow: `0 0 24px ${t.accentGlow}` }}>Report</span>
              </h1>
              <p
                style={{
                  marginTop: 12,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: t.textSecondary,
                  maxWidth: 720,
                }}
              >
                <b style={{ color: t.accent, textShadow: `0 0 10px ${t.accentGlow}` }}>
                  JABA Intelligence
                </b>{' '}
                · Genesco Roster Analytics · <b style={{ color: t.textPrimary }}>2021–2026</b> ·{' '}
                <b style={{ color: t.textPrimary }}>{kpis.posts}</b> posts ·{' '}
                <b style={{ color: t.textPrimary }}>{kpis.rosterCount}</b> athletes. Quantifying
                earned media value, audience engagement, sponsored-content performance, and
                brand-partner activity across the Genesco Sports Enterprises portfolio.
              </p>
            </div>
          </div>
        </div>
      </header>


      {/* Sticky Inbox-style tab nav */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backgroundColor: 'rgba(10,10,10,0.82)',
          backdropFilter: t.blur,
          WebkitBackdropFilter: t.blur,
          borderBottom: `1px solid ${t.cardBorder}`,
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <nav style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {TABS.map((tb) => {
              const active = tab === tb.key;
              return (
                <button
                  key={tb.key}
                  onClick={() => setTab(tb.key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    letterSpacing: '0.02em',
                    color: active ? t.accent : t.textTertiary,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${active ? t.accent : 'transparent'}`,
                    cursor: 'pointer',
                    transition: t.transition,
                    whiteSpace: 'nowrap',
                    textShadow: active ? `0 0 14px ${t.accentGlow}` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = t.textSecondary;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = t.textTertiary;
                  }}
                >
                  {tb.icon}
                  {tb.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 24px 80px',
        }}
      >
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <HeadlineMetrics kpis={kpis} />
            <section>
              <SectionHeader
                eyebrow="Roster Rankings"
                title="Roster Performance Rankings"
                subtitle="Three ranked views of the top 5 athletes across the measurement window. Each panel surfaces a different dimension of performance so you can see where each athlete stands on value, reach, and resonance."
              />
              <InfoBox storageKey="overview-leaderboards">
                Each panel is an independent ranking across the current view's athlete pool -{' '}
                <b>Top by EMV</b> surfaces the biggest dollar contributors,{' '}
                <b>Top by Followers</b> shows raw reach (pulled from the{' '}
                <Term def="A rolling 7-day snapshot of follower count from the athlete's profile, not a window-end total.">
                  7-day roster snapshot
                </Term>
                ), and <b>Top by Engagement</b> surfaces the athletes whose content resonates hardest
                relative to their audience. The three lists often disagree - that gap is the point.
              </InfoBox>
              <InsightCallout>
                {insights.topAthlete && (
                  <>
                    <b>{insights.topAthlete.name}</b> drives{' '}
                    <b>{(insights.topAthleteShare * 100).toFixed(0)}%</b> of roster EMV; top-3
                    athletes produce <b>{(insights.top3Share * 100).toFixed(0)}%</b>. Use the
                    leaderboards to see who ranks where on each dimension.
                  </>
                )}
              </InsightCallout>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 14,
                }}
              >
                <Leaderboard
                  title="Top by EMV"
                  subtitle="Dollar value of media earned"
                  rows={[...athleteFull]
                    .sort((a, b) => b.emv - a.emv)
                    .slice(0, 5)
                    .map((a) => ({
                      name: a.name,
                      image: a.image,
                      sport: a.sport,
                      valueLabel: fmtCurrency(a.emv),
                      secondary: `${a.posts} post${a.posts === 1 ? '' : 's'}`,
                    }))}
                />
                <Leaderboard
                  title="Top by Followers"
                  subtitle="Instagram audience size"
                  rows={[...athleteFull]
                    .sort((a, b) => b.followers - a.followers)
                    .slice(0, 5)
                    .map((a) => ({
                      name: a.name,
                      image: a.image,
                      sport: a.sport,
                      valueLabel: fmtInt(a.followers),
                      secondary: a.sport,
                    }))}
                />
                <Leaderboard
                  title="Top by Engagement"
                  subtitle="Avg ER across their posts"
                  rows={[...athleteFull]
                    .filter((a) => a.posts > 0 && a.avgER > 0)
                    .sort((a, b) => b.avgER - a.avgER)
                    .slice(0, 5)
                    .map((a) => ({
                      name: a.name,
                      image: a.image,
                      sport: a.sport,
                      valueLabel: (a.avgER * 100).toFixed(2) + '%',
                      secondary: `${a.posts} post${a.posts === 1 ? '' : 's'}`,
                    }))}
                />
              </div>
            </section>

            <section>
              <SectionHeader
                eyebrow="Visualizations"
                title="Engagement vs Followers"
                subtitle="Athlete-level bubble plot for talent identification. Each bubble is one athlete (not one post). Use this to spot over- and under-performers relative to their audience size - high ER with modest followers often signals a better activation partner than raw reach alone."
              />
              <InfoBox storageKey="overview-scatter">
                <div style={{ marginBottom: 8 }}>
                  Every athlete is one equal-size avatar - position encodes everything:
                </div>
                <ul style={{ margin: '4px 0 6px 18px', padding: 0, lineHeight: 1.7 }}>
                  <li>
                    <b>X-axis - Followers (log scale):</b> audience size from the 7-day roster
                    snapshot. Log scale is used because follower counts span multiple orders of
                    magnitude across the roster.
                  </li>
                  <li>
                    <b>Y-axis - Avg engagement rate:</b> mean engagement rate across all of the
                    athlete's posts. High-and-to-the-left is the sweet spot - meaningful resonance
                    at a tractable audience size.
                  </li>
                  <li>
                    <b>Hover for Total EMV</b> and full stats - the tooltip surfaces athlete name,
                    follower count, avg ER, and cumulative EMV for the window.
                  </li>
                </ul>
                <div style={{ marginTop: 10, fontSize: 12.5, color: t.textTertiary }}>
                  <b style={{ color: t.textSecondary }}>Distinct from</b> the post-level bubble matrix
                  on the Sponsored tab. This view is per-athlete and uses average engagement rate,
                  not per-post.
                </div>
              </InfoBox>
              <GlassCard glow>
                <AthleteScatter athletes={athleteFull} />
              </GlassCard>
            </section>
          </div>
        )}

        {tab === 'sponsored' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            <section>
              <SectionHeader
                eyebrow="Brand Activations"
                title="Top sponsor partners"
                subtitle="Brands that appear as a disclosed sponsor on at least one post, ranked by total EMV generated. Each card shows volume, dollar value, and which athlete drove the most value for that sponsor."
              />
              <InfoBox storageKey="sponsored-brands">
                Every disclosed sponsor and their sponsored posts. Cards show the brand logo, post
                count, athletes involved, total EMV, and the top-performing post(s) for that brand.
                Sponsor attribution uses the <b>sponsorPartner</b> tag on each post; a single post
                can only credit one sponsor. Brand logos are resolved via Clearbit from a best-guess
                domain and fall back to initials.
              </InfoBox>

              {/* Summary bar - 3 stat tiles */}
              {(() => {
                const totalSponsoredPosts = topSponsors.reduce((a, s) => a + s.posts, 0);
                const uniqueBrands = topSponsors.length;
                const athletesWithDeals = new Set<string>();
                for (const s of topSponsors) for (const a of s.athletes) athletesWithDeals.add(a);
                return (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <SponsorStatTile
                      label="Sponsored Posts"
                      value={fmtInt(totalSponsoredPosts)}
                      descriptor="Disclosed brand partnerships"
                      accent
                    />
                    <SponsorStatTile
                      label="Unique Brands"
                      value={fmtInt(uniqueBrands)}
                    />
                    <SponsorStatTile
                      label="Athletes w/ Deals"
                      value={fmtInt(athletesWithDeals.size)}
                      descriptor="Roster members with ≥1 tagged sponsored post"
                    />
                  </div>
                );
              })()}

              {topSponsors.length > 0 &&
                (() => {
                  const rosterTop = [...athleteFull].sort((a, b) => b.emv - a.emv)[0]?.name;
                  const messiDriven = topSponsors.filter((s) => s.topAthlete === rosterTop);
                  const nonMessi = topSponsors.filter((s) => s.topAthlete !== rosterTop);
                  return (
                    <InsightCallout>
                      {rosterTop && messiDriven.length > 0 ? (
                        <>
                          <b>{rosterTop}</b> drives the top{' '}
                          <b>{messiDriven.length}</b> tagged sponsor
                          {messiDriven.length === 1 ? '' : 's'} by EMV.{' '}
                          {nonMessi.length > 0 ? (
                            <>
                              More interesting for activation planning:{' '}
                              {nonMessi.slice(0, 3).map((s, i) => (
                                <span key={s.sponsor}>
                                  {i > 0 && (i === nonMessi.slice(0, 3).length - 1 ? ', and ' : ', ')}
                                  <b>{s.sponsor}</b> → <b>{s.topAthlete}</b>
                                </span>
                              ))}{' '}
                              - non-{rosterTop.split(' ').slice(-1)[0]} athletes actively delivering
                              brand value.
                            </>
                          ) : (
                            <>Every tagged sponsor's top-performing athlete is {rosterTop}.</>
                          )}
                        </>
                      ) : (
                        <>
                          <b>{topSponsors[0].sponsor}</b> is the largest partner at{' '}
                          <b style={{ color: t.accent }}>{fmtCurrency(topSponsors[0].emv)}</b> across{' '}
                          <b>{topSponsors[0].posts}</b> post
                          {topSponsors[0].posts === 1 ? '' : 's'}.
                        </>
                      )}
                    </InsightCallout>
                  );
                })()}

              {/* Search + Sort bar */}
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    flex: '1 1 260px',
                    minWidth: 220,
                  }}
                >
                  <input
                    type="text"
                    value={sponsorQuery}
                    onChange={(e) => setSponsorQuery(e.target.value)}
                    placeholder="Search by brand name…"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 14px 9px 34px',
                      borderRadius: 100,
                      border: `1px solid ${t.cardBorder}`,
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                      color: t.textPrimary,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      outline: 'none',
                      transition: t.transition,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(200,255,0,0.4)';
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(200,255,0,0.08)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = t.cardBorder;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: t.textTertiary,
                      pointerEvents: 'none',
                    }}
                  >
                    🔍
                  </span>
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: t.textTertiary,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}
                  >
                    Sort by
                  </span>
                  <select
                    value={sponsorSort}
                    onChange={(e) =>
                      setSponsorSort(e.target.value as typeof sponsorSort)
                    }
                    style={{
                      padding: '8px 12px',
                      borderRadius: 100,
                      border: `1px solid ${t.cardBorder}`,
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                      color: t.textPrimary,
                      fontSize: 12,
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="emv">EMV</option>
                    <option value="posts">Posts</option>
                    <option value="avgER">Avg ER</option>
                    <option value="likes">Likes</option>
                  </select>
                </div>
              </div>

              {/* Filter + sort + render the expanded sponsor cards */}
              {(() => {
                const q = sponsorQuery.trim().toLowerCase();
                const filtered = topSponsors.filter((s) =>
                  q.length === 0
                    ? true
                    : s.sponsor.toLowerCase().includes(q) ||
                      prettyBrandName(s.sponsor).toLowerCase().includes(q) ||
                      s.athletes.some((a) => a.toLowerCase().includes(q)),
                );
                const sorted = [...filtered].sort((a, b) => {
                  switch (sponsorSort) {
                    case 'posts':
                      return b.posts - a.posts;
                    case 'avgER':
                      return b.avgER - a.avgER;
                    case 'likes':
                      return b.likes - a.likes;
                    case 'emv':
                    default:
                      return b.emv - a.emv;
                  }
                });
                if (sorted.length === 0) {
                  return (
                    <GlassCard>
                      <p style={{ color: t.textSecondary, fontSize: 14 }}>
                        {topSponsors.length === 0
                          ? 'No sponsored content in this window.'
                          : `No sponsors match "${sponsorQuery}".`}
                      </p>
                    </GlassCard>
                  );
                }
                return (
                  <>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: t.textTertiary,
                        marginBottom: 10,
                        letterSpacing: '0.3px',
                      }}
                    >
                      Showing <b style={{ color: t.textSecondary }}>{sorted.length}</b> of{' '}
                      <b style={{ color: t.textSecondary }}>{topSponsors.length}</b>{' '}
                      sponsor{sorted.length === 1 ? '' : 's'} · sorted by{' '}
                      {sponsorSort === 'emv'
                        ? 'EMV'
                        : sponsorSort === 'posts'
                        ? 'Posts'
                        : sponsorSort === 'avgER'
                        ? 'Avg ER'
                        : 'Likes'}{' '}
                      (desc)
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 14,
                      }}
                    >
                      {sorted.map((s) => (
                        <SponsorCard key={s.sponsor} sponsor={s} />
                      ))}
                    </div>
                  </>
                );
              })()}
            </section>

            <section>
              <SectionHeader
                eyebrow="Brand Signal"
                title="IP Lift & sponsored content signals"
                subtitle="How sponsored content is performing relative to organic posts. These three metrics are the short answer to 'is brand content working for this roster?'"
              />
              <InfoBox storageKey="brand-signal">
                <b>IP Lift</b> is the percentage change in average engagement rate when a post carries
                a brand partner tag. A positive number means sponsored content out-performs organic;
                negative means audience is less engaged when the post is sponsored.{' '}
                <b>Avg Sponsored Engagement</b> is the mean ER across only the sponsored posts.{' '}
                <b>Sponsored Comment Ratio</b> is the ratio of comments to likes on sponsored posts -
                a high ratio suggests audience is discussing the post, not just passively liking it.
              </InfoBox>
              {(() => {
                // Recompute sponsored aggregates from TAGGED posts only (ignore untagged/unknown).
                // The organic baseline stays as-is since it only depends on non-sponsored posts.
                let sCount = 0;
                let sLikes = 0;
                let sComments = 0;
                let sErSum = 0;
                let sErCount = 0;
                for (const p of posts) {
                  if (!p.isSponsored) continue;
                  const raw = p.sponsorPartner;
                  if (!raw) continue;
                  const key = raw.trim();
                  if (!key || key.toLowerCase() === 'unknown') continue;
                  sCount++;
                  sLikes += p.metrics?.likes ?? 0;
                  sComments += p.metrics?.comments ?? 0;
                  const er = p.metrics?.engagementRate ?? 0;
                  if (er > 0) {
                    sErSum += er;
                    sErCount++;
                  }
                }
                const avgSponsoredER = sErCount ? sErSum / sErCount : 0;
                const commentRatio = sLikes > 0 ? sComments / sLikes : 0;
                const ipLift =
                  insights.avgOrganicER > 0
                    ? avgSponsoredER / insights.avgOrganicER - 1
                    : 0;
                return (
                  <BrandSignalRow
                    ipLift={ipLift}
                    avgSponsoredER={avgSponsoredER}
                    avgOrganicER={insights.avgOrganicER}
                    commentRatio={commentRatio}
                    sponsoredCount={sCount}
                  />
                );
              })()}
            </section>

            <section>
              <SectionHeader
                eyebrow="Post-level Detail"
                title="Bubble Matrix - Engagement × Reach × EMV"
                subtitle="Supporting detail view: every sponsored post plotted on three dimensions at once. Use this after the brand cards above to dig into individual post performance."
              />
              <InfoBox title="How to read the bubble matrix" storageKey="sponsored-bubble">
                <div style={{ marginBottom: 8 }}>
                  Every bubble is one Instagram post from the roster. Three axes encode the signal:
                </div>
                <ul style={{ margin: '4px 0 8px 18px', padding: 0, lineHeight: 1.7 }}>
                  <li>
                    <b>X-axis - Engagement rate:</b> interactions ÷ followers. Measures <i>resonance</i>{' '}
                    with the athlete's audience. Higher = the post punched above its weight.
                  </li>
                  <li>
                    <b>Y-axis - Likes:</b> absolute like count. Measures <i>scale</i>. Higher = the post
                    reached a lot of eyeballs.
                  </li>
                  <li>
                    <b>Bubble area - EMV:</b> estimated dollar value of the organic exposure generated.
                    Bigger bubble = more media value.
                  </li>
                  <li>
                    <b>Color:</b> volt green = Sponsored (brand disclosed), blue = Collaboration
                    (IG co-author), faded white = Organic.
                  </li>
                </ul>
                <div style={{ marginTop: 10, fontSize: 12.5, color: t.textTertiary }}>
                  <b style={{ color: t.textSecondary }}>Quadrant guide:</b> top-right = high scale <i>and</i>{' '}
                  high resonance - ideal for broad activations. Top-left = huge scale, low engagement -
                  awareness plays but low conversion intent. Bottom-right = niche but hot - great for
                  targeted/performance campaigns. Bottom-left = dead zone.
                </div>
              </InfoBox>
              <InsightCallout>
                Sponsored posts average <b>{(insights.avgSponsoredER * 100).toFixed(2)}%</b>{' '}
                engagement rate vs <b>{(insights.avgOrganicER * 100).toFixed(2)}%</b> for organic/collab
                posts -{' '}
                <b>
                  {insights.avgOrganicER > 0
                    ? (
                        (insights.avgSponsoredER / insights.avgOrganicER - 1) *
                        100
                      ).toFixed(0) + '%'
                    : '-'}
                </b>{' '}
                {insights.avgSponsoredER >= insights.avgOrganicER ? 'lift' : 'drop'}. Sponsored output
                contributed <b>{fmtCurrency(insights.sponsoredEmv)}</b> EMV -{' '}
                <b>{(insights.sponsoredShare * 100).toFixed(1)}%</b> of roster total despite being
                only <b>{((kpis.sponsored / Math.max(1, kpis.posts)) * 100).toFixed(0)}%</b> of posts.
              </InsightCallout>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 4,
                }}
              >
                <PillGroup>
                  {(['sponsored', 'collab', 'all'] as const).map((k) => (
                    <Pill
                      key={k}
                      active={bubbleFilter === k}
                      onClick={() => setBubbleFilter(k)}
                    >
                      {k === 'all' ? 'All posts' : k === 'sponsored' ? 'Sponsored' : 'Collaborations'}
                    </Pill>
                  ))}
                </PillGroup>
                <PillGroup>
                  <Pill
                    active={bubbleZoom === 'data'}
                    onClick={() => setBubbleZoom('data')}
                  >
                    Zoom to data
                  </Pill>
                  <Pill
                    active={bubbleZoom === 'full'}
                    onClick={() => setBubbleZoom('full')}
                  >
                    Show full range
                  </Pill>
                </PillGroup>
              </div>
              <GlassCard glow>
                <BubbleMatrix points={bubblePoints} zoom={bubbleZoom} />
              </GlassCard>
            </section>
          </div>
        )}

        {tab === 'athletes' && (
          <section>
            <SectionHeader
              eyebrow="Roster"
              title="Athlete Profiles"
              subtitle="One card per athlete with a full snapshot: audience size, engagement rate, total earned media value, activity level, and sponsored-post count. Use this to see exactly what JABA knows about each person on the roster."
            />
            <InfoBox storageKey="athletes">
              Each card joins roster-level data (follower count from the 7-day snapshot, sport) with
              post-level activity (posts published, avg engagement rate, total EMV, sponsored-post
              count) for the athlete in the current view. Cards are sorted by{' '}
              <b>total EMV</b> by default. Low-contributor athletes (those producing &lt;0.5% of
              roster EMV) are collapsed behind a toggle to keep the default view focused.
            </InfoBox>
            {(() => {
              // Find the engagement outlier (highest avg ER among athletes who have posted)
              const eligible = athleteFull.filter((a) => a.posts > 0 && a.avgER > 0);
              const topER = eligible.sort((a, b) => b.avgER - a.avgER)[0];
              const rosterAvgER = kpis.avgER;
              if (!topER) return null;
              const multiplier =
                rosterAvgER > 0 ? topER.avgER / rosterAvgER : 0;
              return (
                <InsightCallout>
                  <b>{topER.name}</b> leads in engagement at{' '}
                  <b style={{ color: t.accent }}>
                    {(topER.avgER * 100).toFixed(2)}% avg ER
                  </b>{' '}
                  across {topER.posts} post{topER.posts === 1 ? '' : 's'}
                  {multiplier > 1.5 ? (
                    <>
                      {' '}- roughly <b>{multiplier.toFixed(1)}×</b> the roster average of{' '}
                      <b>{(rosterAvgER * 100).toFixed(2)}%</b>
                    </>
                  ) : (
                    <>
                      {' '}(roster average: <b>{(rosterAvgER * 100).toFixed(2)}%</b>)
                    </>
                  )}
                  . High resonance against a {fmtInt(topER.followers)}-follower audience makes them
                  an efficient activation target relative to raw-reach picks.
                </InsightCallout>
              );
            })()}
            {(() => {
              // Show every athlete on the roster, unconditionally, ranked by EMV
              const sortedAthletes = [...athleteFull].sort((a, b) => b.emv - a.emv);
              const totalEmv = sortedAthletes.reduce((a, r) => a + r.emv, 0);
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 16,
                  }}
                >
                  {sortedAthletes.map((a, idx) => (
                    <AthleteProfileCard
                      key={a.name}
                      rank={idx + 1}
                      athlete={a}
                      shareOfEmv={a.emv / Math.max(1, totalEmv)}
                    />
                  ))}
                </div>
              );
            })()}
          </section>
        )}

        {tab === 'content' && (
          <section>
            <SectionHeader
              eyebrow="Content"
              title="Top Performing Content"
              subtitle="The highest-value individual pieces of content across the measurement window, ranked by per-post EMV. Use this to see what content patterns actually moved the needle - and filter by athlete to dig into a specific creator."
            />
            <InfoBox storageKey="content">
              Each card represents a single Instagram post. The colored badge in the corner indicates
              the post's kind: <b style={{ color: t.accent }}>Sponsored</b> (brand partner disclosed),{' '}
              <b style={{ color: t.blue }}>Collab</b> (IG co-author feature), or{' '}
              <b>Organic</b> (neither). Bottom stats show:{' '}
              <b>EMV</b> = dollar value generated, <b>Likes</b> = absolute like count,{' '}
              <b>ER</b> = engagement rate (interactions ÷ followers). Click "View on Instagram" to
              open the original post. Use the chip row to filter the grid to a specific athlete.
            </InfoBox>
            {insights.topPost && (
              <InsightCallout>
                The single highest-EMV post came from <b>{insights.topPost.athlete.name}</b> on{' '}
                {new Date(
                  insights.topPost.publishedAt?.$date ?? insights.topPost.createdAt?.$date ?? '',
                ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                generating <b style={{ color: t.accent }}>{fmtCurrency(insights.topPost.metrics?.emv ?? 0)}</b>{' '}
                and {fmtInt(insights.topPost.metrics?.likes ?? 0)} likes at a{' '}
                {((insights.topPost.metrics?.engagementRate ?? 0) * 100).toFixed(2)}% engagement rate.
              </InsightCallout>
            )}
            {(() => {
              // Build ordered athlete list (by EMV) from working pool, for the chip row
              const athleteOrder = [...athleteRows].sort((a, b) => b.emv - a.emv);
              // Full pool, sorted by EMV descending
              const poolSorted = [...posts].sort(
                (a, b) => (b.metrics?.emv ?? 0) - (a.metrics?.emv ?? 0),
              );
              // Apply athlete filter (no top-N cap, no pagination - render everything)
              const filtered =
                contentAthleteFilter === '__all__'
                  ? poolSorted
                  : poolSorted.filter((p) => p.athlete?.name === contentAthleteFilter);

              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginBottom: 16,
                    }}
                  >
                    <ContentChip
                      active={contentAthleteFilter === '__all__'}
                      onClick={() => setContentAthleteFilter('__all__')}
                    >
                      All athletes
                      <span style={{ color: t.textTertiary, marginLeft: 6, fontWeight: 400 }}>
                        {poolSorted.length}
                      </span>
                    </ContentChip>
                    {athleteOrder.map((a) => (
                      <ContentChip
                        key={a.name}
                        active={contentAthleteFilter === a.name}
                        onClick={() => setContentAthleteFilter(a.name)}
                      >
                        {a.name}
                        <span style={{ color: t.textTertiary, marginLeft: 6, fontWeight: 400 }}>
                          {a.posts}
                        </span>
                      </ContentChip>
                    ))}
                  </div>

                  {filtered.length === 0 ? (
                    <GlassCard>
                      <p style={{ color: t.textSecondary, fontSize: 14 }}>
                        No posts for this athlete in the current view.
                      </p>
                    </GlassCard>
                  ) : (
                    <>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: t.textTertiary,
                          marginBottom: 12,
                          letterSpacing: '0.3px',
                        }}
                      >
                        Showing all <b style={{ color: t.textSecondary }}>{filtered.length}</b> post
                        {filtered.length === 1 ? '' : 's'} · sorted by EMV (desc)
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: 16,
                        }}
                      >
                        {filtered.map((p) => (
                          <PostCard key={p._id} post={p} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {tab === 'trends' && (
          <section>
            <SectionHeader
              eyebrow="Trend"
              title="EMV & Activity Over Time"
              subtitle="Monthly EMV and post volume for the Genesco roster over the measurement window. Use this to identify peak periods, seasonality, and volume-vs-value relationships across the roster."
            />
            {/* View toggle - rest-of-roster by default so a single outlier month doesn't flatten the timeline */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: t.radiusSm,
                background: trendsFullRoster ? 'rgba(245,158,11,0.06)' : 'rgba(200,255,0,0.06)',
                border: `1px solid ${
                  trendsFullRoster ? 'rgba(245,158,11,0.2)' : 'rgba(200,255,0,0.2)'
                }`,
                fontSize: 12.5,
                color: t.textSecondary,
              }}
            >
              <span>
                <span
                  style={{
                    color: trendsFullRoster ? t.orange : t.accent,
                    marginRight: 6,
                    textShadow: trendsFullRoster ? 'none' : `0 0 8px ${t.accentGlow}`,
                  }}
                >
                  ●
                </span>
                Showing{' '}
                <b style={{ color: t.textPrimary }}>
                  {trendsFullRoster ? 'full roster' : 'rest-of-roster'}
                </b>
                {!trendsFullRoster && rosterTopName && (
                  <span style={{ color: t.textTertiary }}> · excludes {rosterTopName}</span>
                )}
                {trendsFullRoster && (
                  <span style={{ color: t.textTertiary }}>
                    {' '}
                    · outlier month dominates the chart
                  </span>
                )}
              </span>
              <button
                onClick={() => setTrendsFullRoster((v) => !v)}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: trendsFullRoster ? t.accent : t.textSecondary,
                  background: 'transparent',
                  border: `1px solid ${
                    trendsFullRoster ? 'rgba(200,255,0,0.35)' : t.cardBorder
                  }`,
                  borderRadius: 100,
                  padding: '4px 14px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                  transition: t.transition,
                }}
              >
                {trendsFullRoster
                  ? `Exclude ${rosterTopName} ↗`
                  : 'Include full roster ↗'}
              </button>
            </div>
            <InfoBox storageKey="trends">
              Each active metric is plotted as a line (or bars for <b>Posts</b>) on a shared
              normalized scale - values are shown as a percentage of that metric's own peak month
              so metrics with very different magnitudes (EMV in millions vs ER in percentages) can
              be compared shape-to-shape. Toggle any metric chip above the chart to add or remove
              that series. Hover a month to see the raw value of every active metric plus the
              highest-EMV post of that month. The <b>first metric you turn on</b> becomes the
              primary - the annotation row below reflects its peak, average, and cadence.
              <br />
              <br />
              <b style={{ color: t.orange }}>Note:</b> <b>Saves</b>, <b>Shares</b>, and{' '}
              <b>Impressions</b> are zero on every post in this dataset - the <b>Saves</b> chip is
              disabled. EMV is computed from interactions (likes × 0.50 + comments × 1.50), not
              impressions × CPM.
            </InfoBox>

            {/* Metric toggle chips */}
            <MetricChipRow
              active={trendsActiveMetrics}
              monthly={trendsMonthly}
              onToggle={(k) =>
                setTrendsActiveMetrics((prev) => {
                  if (prev.includes(k)) {
                    // don't let the user turn off the last active metric
                    if (prev.length === 1) return prev;
                    return prev.filter((x) => x !== k);
                  }
                  return [...prev, k];
                })
              }
            />

            {/* Annotation row - reflects primary (first-active) metric */}
            {(() => {
              const def = METRIC_DEFS[trendsStats.primary];
              return (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px 18px',
                    alignItems: 'center',
                    marginBottom: 14,
                    padding: '10px 14px',
                    borderRadius: t.radiusSm,
                    border: `1px solid ${t.cardBorder}`,
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: 12.5,
                    color: t.textSecondary,
                  }}
                >
                  <span>
                    <b
                      style={{
                        color: t.textTertiary,
                        letterSpacing: '0.3px',
                        fontSize: 10.5,
                        textTransform: 'uppercase',
                        marginRight: 6,
                      }}
                    >
                      Peak {def.label}
                    </b>
                    <span
                      style={{
                        color: def.color,
                        textShadow: `0 0 8px ${def.color}80`,
                        fontWeight: 700,
                      }}
                    >
                      {def.format(trendsStats.peakValue)}
                    </span>
                    <span style={{ color: t.textTertiary }}>
                      {' '}
                      · {trendsStats.peak.month}
                    </span>
                  </span>
                  <span style={{ color: t.cardBorder }}>│</span>
                  <span>
                    <b
                      style={{
                        color: t.textTertiary,
                        letterSpacing: '0.3px',
                        fontSize: 10.5,
                        textTransform: 'uppercase',
                        marginRight: 6,
                      }}
                    >
                      Avg {def.label}
                    </b>
                    <span style={{ color: t.textPrimary, fontWeight: 700 }}>
                      {def.format(trendsStats.avgPrimary)}
                      {trendsStats.primary !== 'er' ? '/mo' : ''}
                    </span>
                  </span>
                  <span style={{ color: t.cardBorder }}>│</span>
                  <span>
                    <b
                      style={{
                        color: t.textTertiary,
                        letterSpacing: '0.3px',
                        fontSize: 10.5,
                        textTransform: 'uppercase',
                        marginRight: 6,
                      }}
                    >
                      Active
                    </b>
                    <span style={{ color: t.textPrimary, fontWeight: 700 }}>
                      {trendsStats.monthsActive} months
                    </span>
                  </span>
                  <span style={{ color: t.cardBorder }}>│</span>
                  <span>
                    <b
                      style={{
                        color: t.textTertiary,
                        letterSpacing: '0.3px',
                        fontSize: 10.5,
                        textTransform: 'uppercase',
                        marginRight: 6,
                      }}
                    >
                      Cadence
                    </b>
                    <span style={{ color: t.textPrimary, fontWeight: 700 }}>
                      {trendsStats.cadence.toFixed(1)} posts/mo
                    </span>
                  </span>
                </div>
              );
            })()}

            <GlassCard>
              <MultiMetricChart
                monthly={trendsMonthly}
                active={trendsActiveMetrics}
              />
            </GlassCard>
          </section>
        )}

        {tab === 'reference' && (
          <section>
            <SectionHeader
              eyebrow="Reference"
              title="Glossary & methodology"
              subtitle="Definitions of every metric and term used in this report, plus notes on how figures are computed. Click any tab to return to the data."
            />
            <GlossaryFooter />
          </section>
        )}

        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            textAlign: 'center',
            fontSize: 11,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: t.textTertiary,
            fontWeight: 600,
            borderTop: `1px solid ${t.cardBorder}`,
          }}
        >
          Generated by JABA
        </footer>
      </main>
    </div>
  );
}

// ===== Sub-components =====

const jabaLogoStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: t.accent,
  textShadow: `0 0 20px ${t.accentGlow}`,
};

function AmbientGlows() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: 'fixed',
          top: '-40%',
          left: '-20%',
          width: '60%',
          height: '80%',
          background: `radial-gradient(ellipse, rgba(200,255,0,0.04) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          bottom: '-30%',
          right: '-20%',
          width: '50%',
          height: '70%',
          background: `radial-gradient(ellipse, rgba(200,255,0,0.025) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  );
}

/** Methodology / "How to read this" box - always starts collapsed on page load.
 *  Click to expand. No persistence across loads. */
function InfoBox({
  title = 'How to read this',
  children,
}: {
  title?: string;
  /** Accepted for API back-compat but no longer used - each box now always starts closed */
  storageKey?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radiusSm,
        padding: open ? '14px 16px' : '10px 14px',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${t.cardBorder}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        marginBottom: 14,
        transition: t.transition,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
      />
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.05) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.blue,
            flexShrink: 0,
          }}
        >
          <Info size={13} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.3px',
              textTransform: 'uppercase',
              color: t.blue,
            }}
          >
            {title}
          </div>
        </div>
        <ChevronDown
          size={16}
          color={t.textTertiary}
          style={{
            transition: t.transition,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>
      {open && (
        <div
          style={{
            marginTop: 10,
            paddingLeft: 36,
            fontSize: 13,
            lineHeight: 1.55,
            color: t.textSecondary,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** Accent-tinted data-driven insight callout */
function InsightCallout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radiusSm,
        padding: '12px 16px',
        background:
          'linear-gradient(135deg, rgba(200,255,0,0.06) 0%, rgba(200,255,0,0.01) 100%)',
        border: '1px solid rgba(200,255,0,0.18)',
        boxShadow:
          '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(200,255,0,0.1), 0 0 24px rgba(200,255,0,0.05)',
        marginBottom: 14,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(200,255,0,0.25), transparent)',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background:
              'linear-gradient(135deg, rgba(200,255,0,0.25) 0%, rgba(200,255,0,0.05) 100%)',
            border: '1px solid rgba(200,255,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.accent,
            flexShrink: 0,
            boxShadow: `0 0 10px ${t.accentGlow}`,
          }}
        >
          <Lightbulb size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '1.3px',
              textTransform: 'uppercase',
              color: t.accent,
              marginBottom: 4,
              textShadow: `0 0 10px ${t.accentGlow}`,
            }}
          >
            Insight
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.82)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Inline definition: shows term with a subtle dotted underline; hovering reveals definition */
function Term({ def, children }: { def: string; children: React.ReactNode }) {
  return (
    <span
      title={def}
      style={{
        borderBottom: '1px dotted rgba(200,255,0,0.4)',
        cursor: 'help',
        color: 'rgba(255,255,255,0.85)',
      }}
    >
      {children}
    </span>
  );
}

function GlossaryFooter() {
  const entries: { term: string; def: string; icon?: React.ReactNode }[] = [
    {
      term: 'EMV (Earned Media Value)',
      icon: <DollarSign size={14} />,
      def:
        'A dollar estimate of the organic media exposure a post generated. Derived from impressions × category CPM rates. EMV approximates what the equivalent reach would cost as paid media - it is NOT revenue, and not what the athlete or brand was paid.',
    },
    {
      term: 'Engagement rate (ER)',
      icon: <Heart size={14} />,
      def:
        'Total interactions (likes + comments + saves + shares) on a post divided by the athlete\'s follower count at publish time. Expressed as a percentage. ER measures how well a post resonated with the existing audience - a 3% ER is generally strong on Instagram.',
    },
    {
      term: 'Impressions',
      icon: <Eye size={14} />,
      def:
        'The raw number of times a post was displayed to a user. One user can generate multiple impressions. Not all posts in this dataset have impressions populated; when missing, EMV falls back to an interaction-based estimate.',
    },
    {
      term: 'Sponsored post',
      icon: <Award size={14} />,
      def:
        'A post where a brand partner is explicitly disclosed - either via Instagram\'s Paid Partnership label or the sponsorPartner tag in our dataset. These are the posts where the athlete had a formal business relationship with the brand for that specific content.',
    },
    {
      term: 'Collaboration',
      icon: <Handshake size={14} />,
      def:
        'A post using Instagram\'s native co-author feature, where two creators share authorship of the same post and it appears in both of their feeds. This is distinct from sponsored content - a collab is a creative co-post, not necessarily a paid arrangement.',
    },
    {
      term: 'Organic post',
      icon: <Instagram size={14} />,
      def:
        'A post that is neither sponsored nor a collaboration - the athlete\'s own content published on their own feed. Used as the baseline when comparing sponsored performance.',
    },
    {
      term: 'Top athlete (per sponsor)',
      icon: <Target size={14} />,
      def:
        'For a given sponsor, the single athlete who produced the most EMV across that sponsor\'s posts. Identifies which athlete is the best activation partner for each brand in the roster.',
    },
    {
      term: 'Bubble matrix',
      icon: <Sparkles size={14} />,
      def:
        'A three-dimensional scatterplot used on the Sponsored tab. X-axis = engagement rate, Y-axis = likes, bubble area = EMV, color = post kind. Designed to surface outlier posts that perform well on multiple dimensions simultaneously.',
    },
    {
      term: 'Measurement window',
      icon: <Calendar size={14} />,
      def:
        'The time range covered by this report, set by the earliest and latest publishedAt dates in the source data. All aggregate figures (total EMV, averages, trends) are computed across this window.',
    },
    {
      term: 'Peak month',
      icon: <Zap size={14} />,
      def:
        'The single calendar month in the measurement window with the highest total roster EMV. Helps identify when content landed hardest - often driven by a single breakout post.',
    },
  ];

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: t.cardBg,
        backdropFilter: t.blur,
        WebkitBackdropFilter: t.blur,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.radius,
        padding: 24,
        boxShadow: t.cardShadow,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: t.topHighlight,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background:
              'linear-gradient(135deg, rgba(200,255,0,0.25) 0%, rgba(200,255,0,0.05) 100%)',
            border: '1px solid rgba(200,255,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.accent,
            boxShadow: `0 0 12px ${t.accentGlow}`,
          }}
        >
          <BookOpen size={16} />
        </div>
        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: t.accent,
            fontWeight: 700,
            textShadow: `0 0 10px ${t.accentGlow}`,
          }}
        >
          Definitions
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {entries.map((e) => (
          <div key={e.term}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span style={{ color: t.accent }}>{e.icon}</span>
              <b style={{ fontSize: 13.5, color: t.textPrimary, fontWeight: 700 }}>{e.term}</b>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: t.textSecondary }}>
              {e.def}
            </p>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 22,
          paddingTop: 16,
          borderTop: `1px solid ${t.cardBorder}`,
          fontSize: 11.5,
          lineHeight: 1.6,
          color: t.textTertiary,
        }}
      >
        <b style={{ color: t.textSecondary }}>Notes on the data:</b> All metrics are computed
        client-side from Genesco_contents.json (post-level data) and Genesco_Roster.json (athlete
        profiles). A post with zero followers or zero impressions in the raw data is included in counts
        but excluded from engagement-rate averages. Follower totals are the sum of each roster member's
        7-day snapshot - not deduplicated across overlap.
      </div>
    </div>
  );
}

function GlassCard({
  children,
  glow,
  style,
}: {
  children: React.ReactNode;
  glow?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: t.cardBg,
        backdropFilter: t.blur,
        WebkitBackdropFilter: t.blur,
        border: `1px solid ${glow ? 'rgba(200,255,0,0.2)' : t.cardBorder}`,
        borderRadius: t.radius,
        padding: 20,
        boxShadow: glow
          ? `${t.cardShadow}, 0 0 30px rgba(200,255,0,0.08)`
          : t.cardShadow,
        transition: t.transition,
        ...style,
      }}
    >
      {/* top highlight band */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: t.topHighlight,
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}



const summaryLabelStyle: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  color: t.textTertiary,
  fontWeight: 600,
};

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          ...summaryLabelStyle,
          color: t.accent,
          marginBottom: 8,
          textShadow: `0 0 14px ${t.accentGlow}`,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.5px',
          color: t.textPrimary,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 13,
            lineHeight: 1.5,
            color: t.textSecondary,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function KpiStrip({
  icon,
  label,
  value,
  accent,
  descriptor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  descriptor?: string;
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radiusSm,
        padding: '14px 14px 12px',
        border: `1px solid ${accent ? 'rgba(200,255,0,0.22)' : t.cardBorder}`,
        background: accent
          ? 'linear-gradient(135deg, rgba(200,255,0,0.06) 0%, rgba(200,255,0,0.01) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: accent
          ? '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(200,255,0,0.08)'
          : '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
        display: 'grid',
        // 3 fixed-height rows: label · value · descriptor - guarantees the value baselines line up
        gridTemplateRows: '16px 26px auto',
        rowGap: 8,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: accent
            ? 'linear-gradient(90deg, transparent, rgba(200,255,0,0.22), transparent)'
            : t.topHighlight,
        }}
      />
      {/* Label row - fixed height, single line, truncates if too long */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: '1.1px',
          color: accent ? t.accent : t.textTertiary,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </div>
      {/* Value row - fixed height so all 7 tiles share the same baseline */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '-0.3px',
          color: accent ? t.accent : t.textPrimary,
          textShadow: accent ? `0 0 16px ${t.accentGlow}` : 'none',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
      {/* Descriptor row - min-height enforced by grid auto row; can wrap */}
      {descriptor ? (
        <div
          style={{
            fontSize: 10.5,
            color: t.textTertiary,
            lineHeight: 1.4,
            minHeight: 28, // ensures consistent card height across tiles
          }}
        >
          {descriptor}
        </div>
      ) : (
        <div style={{ minHeight: 28 }} />
      )}
    </div>
  );
}

// --- Pills ---
function PillGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>{children}</div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  const base: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: 100,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: t.transition,
    userSelect: 'none',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };
  if (active) {
    return (
      <button
        onClick={onClick}
        style={{
          ...base,
          background:
            'linear-gradient(135deg, rgba(200,255,0,0.2) 0%, rgba(200,255,0,0.08) 100%)',
          border: '1px solid rgba(200,255,0,0.4)',
          color: t.accent,
          boxShadow:
            '0 2px 8px rgba(200,255,0,0.2), 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(200,255,0,0.15)',
          textShadow: `0 0 12px ${t.accentGlow}`,
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${t.cardBorder}`,
        color: t.textSecondary,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {children}
    </button>
  );
}

// --- Bubble matrix ---
function BubbleMatrix({
  points,
  zoom = 'data',
}: {
  points: { id: string; name: string; sport: string; sponsor: string; er: number; likes: number; emv: number; isSponsored: boolean; isCollab: boolean }[];
  /** 'data' = X-axis auto-fits the 95th-percentile ER so the chart isn't 80% empty; 'full' = use the raw max */
  zoom?: 'data' | 'full';
}) {
  const [hover, setHover] = useState<string | null>(null);
  if (points.length === 0) {
    return <p style={{ color: t.textSecondary, fontSize: 14 }}>No posts match this filter.</p>;
  }
  const W = 860;
  const H = 420;
  const PAD = { left: 60, right: 20, top: 20, bottom: 48 };

  // Percentile helper for sane axis bounds
  const pct = (arr: number[], p: number) => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
    return sorted[idx];
  };
  const ers = points.map((p) => p.er);
  const absMaxER = Math.max(...ers) * 1.1 || 0.1;
  const zoomedMaxER = (pct(ers, 0.95) || 0.05) * 1.2;
  const maxER = zoom === 'full' ? absMaxER : Math.max(zoomedMaxER, 0.01);
  const maxLikes = Math.max(...points.map((p) => p.likes)) * 1.1 || 1;
  const maxEmv = Math.max(...points.map((p) => p.emv)) || 1;
  // Count points clipped when zoomed so we can surface it
  const clippedCount = zoom === 'data' ? points.filter((p) => p.er > maxER).length : 0;

  const xScale = (v: number) => PAD.left + (v / maxER) * (W - PAD.left - PAD.right);
  const yScale = (v: number) => H - PAD.bottom - (v / maxLikes) * (H - PAD.top - PAD.bottom);
  const rScale = (v: number) => 4 + Math.sqrt(v / maxEmv) * 34;

  const xTicks = 5;
  const yTicks = 4;

  const gridColor = 'rgba(255,255,255,0.06)';

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 720 }}>
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = PAD.top + (i * (H - PAD.top - PAD.bottom)) / yTicks;
          const val = maxLikes - (i * maxLikes) / yTicks;
          return (
            <g key={`gy-${i}`}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={gridColor} strokeWidth={1} />
              <text x={PAD.left - 8} y={y + 4} fontSize={10} fill={t.textTertiary} textAnchor="end">
                {fmtInt(val)}
              </text>
            </g>
          );
        })}
        {Array.from({ length: xTicks + 1 }).map((_, i) => {
          const x = PAD.left + (i * (W - PAD.left - PAD.right)) / xTicks;
          const val = (i * maxER) / xTicks;
          return (
            <g key={`gx-${i}`}>
              <line x1={x} x2={x} y1={PAD.top} y2={H - PAD.bottom} stroke={gridColor} strokeWidth={1} />
              <text x={x} y={H - PAD.bottom + 16} fontSize={10} fill={t.textTertiary} textAnchor="middle">
                {(val * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
        <text x={(W + PAD.left) / 2} y={H - 8} fontSize={11} fill={t.textTertiary} textAnchor="middle">
          Engagement rate →
        </text>
        <text
          x={-H / 2}
          y={16}
          fontSize={11}
          fill={t.textTertiary}
          textAnchor="middle"
          transform={`rotate(-90)`}
        >
          Likes →
        </text>
        {points.map((p) => {
          // When zoomed, don't render out-of-range points - they'd pile up at the right edge
          if (zoom === 'data' && p.er > maxER) return null;
          const cx = xScale(p.er);
          const cy = yScale(p.likes);
          const r = rScale(p.emv);
          const color = p.isSponsored ? t.accent : p.isCollab ? t.blue : 'rgba(255,255,255,0.45)';
          const isHover = hover === p.id;
          return (
            <g key={p.id} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={color}
                fillOpacity={isHover ? 0.9 : 0.5}
                stroke={color}
                strokeWidth={isHover ? 2 : 1}
                style={p.isSponsored ? { filter: 'drop-shadow(0 0 8px rgba(200,255,0,0.35))' } : undefined}
              />
              {isHover && (
                <g>
                  <rect
                    x={Math.min(cx + 10, W - 230)}
                    y={Math.max(cy - 62, 4)}
                    width={220}
                    height={62}
                    rx={10}
                    fill="rgba(20,20,20,0.95)"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <text x={Math.min(cx + 20, W - 220)} y={Math.max(cy - 42, 22)} fontSize={12} fill={t.textPrimary} fontWeight={700}>
                    {p.name}
                  </text>
                  <text x={Math.min(cx + 20, W - 220)} y={Math.max(cy - 26, 38)} fontSize={10} fill={t.textSecondary}>
                    {p.sport} {p.sponsor ? `· ${p.sponsor}` : ''}
                  </text>
                  <text x={Math.min(cx + 20, W - 220)} y={Math.max(cy - 10, 52)} fontSize={10} fill={t.accent}>
                    ER {(p.er * 100).toFixed(2)}% · {fmtInt(p.likes)} likes · {fmtCurrency(p.emv)} EMV
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: t.textSecondary, flexWrap: 'wrap' }}>
        <LegendDot color={t.accent} label="Sponsored" />
        <LegendDot color={t.blue} label="Collaboration" />
        <LegendDot color="rgba(255,255,255,0.45)" label="Organic" />
        <span style={{ color: t.textTertiary }}>·</span>
        <span style={{ color: t.textTertiary }}>Bubble size ∝ EMV</span>
        {clippedCount > 0 && (
          <span style={{ color: t.textTertiary }}>
            · <span style={{ color: t.accent }}>{clippedCount}</span> post
            {clippedCount === 1 ? '' : 's'} hidden above {(maxER * 100).toFixed(0)}% ER (use "Show
            full range")
          </span>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          display: 'inline-block',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          boxShadow: color === t.accent ? `0 0 8px ${t.accentGlow}` : 'none',
        }}
      />
      {label}
    </span>
  );
}


// --- Leaderboard panel (ranked list of athletes) ---
function Leaderboard({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle?: string;
  rows: { name: string; image?: string; sport: string; valueLabel: string; secondary: string }[];
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: t.cardBg,
        backdropFilter: t.blur,
        WebkitBackdropFilter: t.blur,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.radius,
        padding: 20,
        boxShadow: t.cardShadow,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: t.topHighlight,
        }}
      />
      <div style={{ ...summaryLabelStyle, color: t.accent, textShadow: `0 0 10px ${t.accentGlow}` }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 2, marginBottom: 14 }}>
          {subtitle}
        </div>
      )}
      {rows.length === 0 ? (
        <div style={{ fontSize: 13, color: t.textSecondary, padding: '12px 0' }}>
          No athletes match this ranking.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderTop: i === 0 ? 'none' : `1px solid ${t.cardBorder}`,
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: i === 0 ? t.accent : t.textTertiary,
                  width: 20,
                  textAlign: 'center',
                  flexShrink: 0,
                  textShadow: i === 0 ? `0 0 8px ${t.accentGlow}` : 'none',
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <AthleteAvatar name={r.name} image={r.image} size={30} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: t.textPrimary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {r.name}
                </div>
                <div style={{ fontSize: 10.5, color: t.textTertiary, marginTop: 1 }}>
                  {r.secondary}
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: i === 0 ? t.accent : t.textPrimary,
                  textShadow: i === 0 ? `0 0 10px ${t.accentGlow}` : 'none',
                  letterSpacing: '-0.2px',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {r.valueLabel}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Avatar with image fallback to initials in a glass circle */
function AthleteAvatar({
  name,
  image,
  size = 30,
}: {
  name: string;
  image?: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const showImg = image && !errored;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${t.cardBorder}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
        fontSize: Math.max(10, size * 0.36),
        fontWeight: 700,
        color: t.textSecondary,
        letterSpacing: '0.5px',
      }}
    >
      {showImg ? (
        <img
          src={image}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setErrored(true)}
        />
      ) : (
        initials || '?'
      )}
    </div>
  );
}


// --- Athlete profile card (used in Athletes tab) ---
function AthleteProfileCard({
  rank,
  athlete,
  shareOfEmv,
}: {
  rank: number;
  athlete: {
    name: string;
    sport: string;
    image?: string;
    followers: number;
    posts: number;
    emv: number;
    likes: number;
    comments: number;
    avgER: number;
    sponsored: number;
    collab: number;
  };
  shareOfEmv: number;
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radius,
        border: `1px solid ${rank === 1 ? 'rgba(200,255,0,0.25)' : t.cardBorder}`,
        background: t.cardBg,
        backdropFilter: t.blur,
        WebkitBackdropFilter: t.blur,
        boxShadow:
          rank === 1
            ? `${t.cardShadow}, 0 0 24px rgba(200,255,0,0.08)`
            : t.cardShadow,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: t.topHighlight,
        }}
      />
      {/* Header: avatar + name + rank */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <AthleteAvatar name={athlete.name} image={athlete.image} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: t.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {athlete.name}
          </div>
          <div
            style={{
              ...summaryLabelStyle,
              fontSize: 10.5,
              letterSpacing: '1.2px',
              color: t.textTertiary,
              marginTop: 2,
            }}
          >
            {athlete.sport}
          </div>
        </div>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.5px',
            color: rank === 1 ? t.accent : t.textTertiary,
            textShadow: rank === 1 ? `0 0 8px ${t.accentGlow}` : 'none',
            padding: '3px 8px',
            borderRadius: 100,
            border: `1px solid ${rank === 1 ? 'rgba(200,255,0,0.3)' : t.cardBorder}`,
            background: rank === 1 ? 'rgba(200,255,0,0.08)' : 'transparent',
          }}
        >
          #{String(rank).padStart(2, '0')}
        </div>
      </div>

      {/* EMV headline */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${t.cardBorder}`,
        }}
      >
        <div style={summaryLabelStyle}>Total EMV</div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: t.accent,
            textShadow: `0 0 16px ${t.accentGlow}`,
            lineHeight: 1.1,
            marginTop: 4,
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          {fmtCurrency(athlete.emv)}
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: t.textTertiary,
              textShadow: 'none',
              letterSpacing: '0.3px',
            }}
          >
            {(shareOfEmv * 100).toFixed(1)}% of roster
          </span>
        </div>
      </div>

      {/* Stat grid */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${t.cardBorder}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        <ProfileStat label="Followers" value={fmtInt(athlete.followers)} icon={<Users size={12} />} />
        <ProfileStat
          label="Avg ER"
          value={(athlete.avgER * 100).toFixed(2) + '%'}
          icon={<Zap size={12} />}
          accent
        />
        <ProfileStat label="Posts" value={String(athlete.posts)} icon={<Instagram size={12} />} />
        <ProfileStat
          label="Sponsored"
          value={
            athlete.sponsored > 0
              ? `${athlete.sponsored}${athlete.posts > 0 ? ` · ${((athlete.sponsored / athlete.posts) * 100).toFixed(0)}%` : ''}`
              : '0'
          }
          icon={<Award size={12} />}
        />
      </div>
      {/* Second row: likes + avg EMV/post */}
      <div
        style={{
          marginTop: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 14,
        }}
      >
        <ProfileStat label="Likes" value={fmtInt(athlete.likes)} icon={<Heart size={12} />} />
        <ProfileStat
          label="Avg EMV / post"
          value={fmtCurrency(athlete.emv / Math.max(1, athlete.posts))}
          icon={<DollarSign size={12} />}
        />
      </div>
      {athlete.posts === 0 && (
        <div
          style={{
            marginTop: 14,
            padding: '8px 12px',
            borderRadius: t.radiusXs,
            background: 'rgba(255,255,255,0.03)',
            border: `1px dashed ${t.cardBorder}`,
            fontSize: 11.5,
            color: t.textTertiary,
            lineHeight: 1.5,
          }}
        >
          No posts in the current view window - follower data shown is from the 7-day roster snapshot.
        </div>
      )}
    </div>
  );
}

function ProfileStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 10,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: t.textTertiary,
          fontWeight: 600,
        }}
      >
        <span style={{ color: accent ? t.accent : t.textTertiary }}>{icon}</span>
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 15,
          fontWeight: 700,
          color: accent ? t.accent : t.textPrimary,
          textShadow: accent ? `0 0 10px ${t.accentGlow}` : 'none',
          letterSpacing: '-0.2px',
        }}
      >
        {value}
      </div>
    </div>
  );
}


// --- Content tab chip (athlete filter) ---
function ContentChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '6px 14px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'inherit',
        cursor: 'pointer',
        transition: t.transition,
        background: active
          ? 'linear-gradient(135deg, rgba(200,255,0,0.2) 0%, rgba(200,255,0,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${active ? 'rgba(200,255,0,0.4)' : t.cardBorder}`,
        color: active ? t.accent : t.textSecondary,
        boxShadow: active
          ? `0 2px 6px rgba(200,255,0,0.15), inset 0 1px 0 rgba(200,255,0,0.1)`
          : '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        textShadow: active ? `0 0 10px ${t.accentGlow}` : 'none',
      }}
    >
      {children}
    </button>
  );
}

// --- Headline Metrics card (lives on Overview tab only, not globally pinned) ---
function HeadlineMetrics({
  kpis,
}: {
  kpis: {
    emv: number;
    sponsoredEmv: number;
    sponsored: number;
    views: number;
    videoPostCount: number;
    posts: number;
    likes: number;
    avgER: number;
    followersTotal: number;
    athletes: number;
  };
}) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ ...summaryLabelStyle, color: t.accent, textShadow: `0 0 8px ${t.accentGlow}` }}>
          Headline Metrics
        </div>
        <div style={{ flex: 1, height: 1, background: t.cardBorder }} />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        <KpiStrip
          icon={<DollarSign size={14} />}
          label="Total EMV"
          value={fmtCurrency(kpis.emv)}
          accent
          descriptor="Sum of per-post EMV"
        />
        <KpiStrip
          icon={<Award size={14} />}
          label="Sponsored EMV"
          value={fmtCurrency(kpis.sponsoredEmv)}
          descriptor={`From ${kpis.sponsored} sponsored post${kpis.sponsored === 1 ? '' : 's'}`}
        />
        <KpiStrip
          icon={<Eye size={14} />}
          label="Video views"
          value={fmtInt(kpis.views)}
          descriptor={`Video posts only · ${kpis.videoPostCount} of ${kpis.posts}`}
        />
        <KpiStrip
          icon={<Heart size={14} />}
          label="Likes"
          value={fmtInt(kpis.likes)}
          descriptor="Cumulative across posts"
        />
        <KpiStrip
          icon={<Zap size={14} />}
          label="Engagement"
          value={(kpis.avgER * 100).toFixed(2) + '%'}
          descriptor="Mean ER across posts"
        />
        <KpiStrip
          icon={<Users size={14} />}
          label="Followers"
          value={fmtInt(kpis.followersTotal)}
          descriptor="Combined roster reach (IG)"
        />
        <KpiStrip
          icon={<Instagram size={14} />}
          label="Posts"
          value={fmtInt(kpis.posts)}
          descriptor={`Across ${kpis.athletes} active creators`}
        />
      </div>
    </div>
  );
}

// --- Brand Signal Row (IP Lift + Avg Sponsored Engagement + Comment Ratio) ---
// --- Sponsor summary stat tile (used in the summary bar above brand cards) ---
function SponsorStatTile({
  label,
  value,
  descriptor,
  accent,
}: {
  label: string;
  value: string;
  descriptor?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radiusSm,
        padding: '14px 16px',
        border: `1px solid ${accent ? 'rgba(200,255,0,0.22)' : t.cardBorder}`,
        background: accent
          ? 'linear-gradient(135deg, rgba(200,255,0,0.06) 0%, rgba(200,255,0,0.01) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: accent
          ? '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(200,255,0,0.08)'
          : '0 2px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: accent
            ? 'linear-gradient(90deg, transparent, rgba(200,255,0,0.22), transparent)'
            : t.topHighlight,
        }}
      />
      <div style={summaryLabelStyle}>{label}</div>
      <div
        style={{
          marginTop: 6,
          fontSize: 26,
          fontWeight: 900,
          letterSpacing: '-0.5px',
          lineHeight: 1,
          color: accent ? t.accent : t.textPrimary,
          textShadow: accent ? `0 0 16px ${t.accentGlow}` : 'none',
        }}
      >
        {value}
      </div>
      {descriptor && (
        <div style={{ marginTop: 6, fontSize: 11, color: t.textTertiary, lineHeight: 1.4 }}>
          {descriptor}
        </div>
      )}
    </div>
  );
}

// --- Brand logo: resolves via Clearbit with initials fallback on error ---
function BrandLogo({ handle, size = 40 }: { handle: string; size?: number }) {
  const [errored, setErrored] = useState(false);
  // Look up a mapped domain first; otherwise best-guess `{strip@}.com`
  const domain: string = (() => {
    if (handle in SPONSOR_DOMAIN_MAP) return SPONSOR_DOMAIN_MAP[handle];
    const stripped = handle.startsWith('@') ? handle.slice(1) : handle;
    return `${stripped.replace(/_/g, '')}.com`;
  })();
  const display = prettyBrandName(handle);
  const initials = display
    .split(/\s+/)
    .filter((w) => !/^(the|and|&|inc|co|llc|corp|company)$/i.test(w))
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  const fallback = (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, rgba(200,255,0,0.18) 0%, rgba(200,255,0,0.04) 100%)',
        border: '1px solid rgba(200,255,0,0.25)',
        color: t.accent,
        fontSize: size * 0.35,
        fontWeight: 800,
        letterSpacing: '0.5px',
      }}
    >
      {initials}
    </div>
  );
  if (errored) return fallback;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        flexShrink: 0,
        overflow: 'hidden',
        background: '#ffffff',
        border: `1px solid ${t.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={`https://logo.clearbit.com/${domain}?size=${size * 2}`}
        alt={`${display} logo`}
        width={size}
        height={size}
        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

// --- Sponsor card (Michigan-inspired expanded layout) ---
function SponsorCard({ sponsor }: { sponsor: SponsorRow }) {
  const s = sponsor;
  const display = prettyBrandName(s.sponsor);
  const visibleAthletes = s.athletes.slice(0, 3);
  const moreAthletes = Math.max(0, s.athletes.length - visibleAthletes.length);
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: t.radius,
        border: `1px solid ${t.cardBorder}`,
        background: t.cardBg,
        backdropFilter: t.blur,
        WebkitBackdropFilter: t.blur,
        boxShadow: t.cardShadow,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: t.topHighlight,
        }}
      />

      {/* Header: logo + brand name + @handle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <BrandLogo handle={s.sponsor} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: t.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            {display}
          </div>
          <div
            style={{
              fontSize: 11,
              color: t.textTertiary,
              marginTop: 2,
              letterSpacing: '0.3px',
            }}
          >
            {s.sponsor}
          </div>
        </div>
      </div>

      {/* EMV headline */}
      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: `1px solid ${t.cardBorder}`,
        }}
      >
        <div style={summaryLabelStyle}>Total EMV</div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            color: t.accent,
            textShadow: `0 0 16px ${t.accentGlow}`,
            lineHeight: 1.1,
            marginTop: 4,
          }}
        >
          {fmtCurrency(s.emv)}
        </div>
        <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 2 }}>
          {fmtCurrency(s.emv / Math.max(1, s.posts))} / post average
        </div>
      </div>

      {/* Stat row: posts · athletes · avg ER · likes */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${t.cardBorder}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
        }}
      >
        <SponsorMiniStat label="Posts" value={String(s.posts)} />
        <SponsorMiniStat label="Athletes" value={String(s.athletes.length)} />
        <SponsorMiniStat
          label="Avg ER"
          value={(s.avgER * 100).toFixed(2) + '%'}
          accent
        />
        <SponsorMiniStat label="Likes" value={fmtInt(s.likes)} />
      </div>

      {/* Athletes involved - chips with +X more */}
      {s.athletes.length > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${t.cardBorder}`,
          }}
        >
          <div style={{ ...summaryLabelStyle, marginBottom: 8 }}>Athletes involved</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {visibleAthletes.map((name) => (
              <span
                key={name}
                style={{
                  padding: '4px 10px',
                  borderRadius: 100,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: t.textPrimary,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%)',
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                {name}
              </span>
            ))}
            {moreAthletes > 0 && (
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 100,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: t.textTertiary,
                  background: 'transparent',
                  border: `1px dashed ${t.cardBorder}`,
                }}
              >
                +{moreAthletes} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top posts */}
      {s.topPosts.length > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${t.cardBorder}`,
          }}
        >
          <div style={{ ...summaryLabelStyle, marginBottom: 8 }}>
            {s.topPosts.length === 1 ? 'Top post' : 'Top posts'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.topPosts.map((p) => (
              <SponsorPostRow key={p._id} post={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function SponsorMiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9.5,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: t.textTertiary,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 13,
          fontWeight: 700,
          color: accent ? t.accent : t.textPrimary,
          textShadow: accent ? `0 0 8px ${t.accentGlow}` : 'none',
          letterSpacing: '-0.2px',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SponsorPostRow({ post }: { post: Post }) {
  const [imgErr, setImgErr] = useState(false);
  const m = post.metrics ?? {};
  const when = post.publishedAt?.$date ?? post.createdAt?.$date;
  const dateStr = when
    ? new Date(when).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const thumb = post.url && !imgErr ? post.url : null;
  return (
    <a
      href={post.permalink || '#'}
      target={post.permalink ? '_blank' : undefined}
      rel="noreferrer"
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        textDecoration: 'none',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${t.cardBorder}`,
        transition: t.transition,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <span style={{ fontSize: 16, color: t.textTertiary }}>📷</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: t.textPrimary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {post.athlete?.name ?? 'Unknown'}
        </div>
        <div style={{ fontSize: 10.5, color: t.textTertiary, marginTop: 2 }}>
          {fmtInt(m.likes ?? 0)} likes · {dateStr}
          {post.mediaType === 'VIDEO' ? ' · Video' : ''}
        </div>
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: t.accent,
          textShadow: `0 0 8px ${t.accentGlow}`,
          letterSpacing: '-0.2px',
          flexShrink: 0,
        }}
      >
        {fmtCurrency(m.emv ?? 0)}
      </div>
    </a>
  );
}

function BrandSignalRow({
  ipLift,
  avgSponsoredER,
  avgOrganicER,
  commentRatio,
  sponsoredCount,
}: {
  ipLift: number; // e.g. -0.342 for -34.2%
  avgSponsoredER: number;
  avgOrganicER: number;
  commentRatio: number;
  sponsoredCount: number;
}) {
  const liftColor = ipLift >= 0 ? t.green : t.orange;
  const liftArrow = ipLift >= 0 ? '▲' : '▼';
  const liftBgColor = ipLift >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)';
  const liftBorderColor = ipLift >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 14,
      }}
    >
      {/* IP Lift - featured */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: t.radius,
          padding: 20,
          border: `1px solid ${liftBorderColor}`,
          background: `linear-gradient(135deg, ${liftBgColor} 0%, ${liftBgColor.replace('0.12', '0.02')} 100%)`,
          boxShadow: `0 4px 14px rgba(0,0,0,0.25), inset 0 1px 0 ${liftBgColor}`,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${liftBorderColor}, transparent)`,
          }}
        />
        <div style={{ ...summaryLabelStyle, color: liftColor }}>IP Lift</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: liftColor,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 22 }}>{liftArrow}</span>
          {(ipLift * 100).toFixed(1)}%
        </div>
        <div style={{ fontSize: 11.5, color: t.textTertiary, marginTop: 10, lineHeight: 1.5 }}>
          Engagement-rate delta between sponsored content and organic/collab content.{' '}
          {ipLift >= 0
            ? 'Audience engages more when posts are branded - a strong signal for activation ROI.'
            : 'Audience engages less when posts are branded - revisit creative, tagging, or partner fit.'}
        </div>
      </div>
      {/* Avg Sponsored ER */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: t.radius,
          padding: 20,
          border: `1px solid ${t.cardBorder}`,
          background: t.cardBg,
          backdropFilter: t.blur,
          WebkitBackdropFilter: t.blur,
          boxShadow: t.cardShadow,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: t.topHighlight,
          }}
        />
        <div style={summaryLabelStyle}>Avg Sponsored ER</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: t.accent,
            textShadow: `0 0 20px ${t.accentGlow}`,
            lineHeight: 1,
          }}
        >
          {(avgSponsoredER * 100).toFixed(2)}%
        </div>
        <div style={{ fontSize: 11.5, color: t.textTertiary, marginTop: 10, lineHeight: 1.5 }}>
          Across {sponsoredCount} sponsored post{sponsoredCount === 1 ? '' : 's'}. Organic baseline:{' '}
          <b style={{ color: t.textSecondary }}>{(avgOrganicER * 100).toFixed(2)}%</b>.
        </div>
      </div>
      {/* Comment Ratio */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: t.radius,
          padding: 20,
          border: `1px solid ${t.cardBorder}`,
          background: t.cardBg,
          backdropFilter: t.blur,
          WebkitBackdropFilter: t.blur,
          boxShadow: t.cardShadow,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: t.topHighlight,
          }}
        />
        <div style={summaryLabelStyle}>Sponsored Comment Ratio</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 36,
            fontWeight: 900,
            letterSpacing: '-1px',
            color: t.textPrimary,
            lineHeight: 1,
          }}
        >
          {(commentRatio * 100).toFixed(2)}%
        </div>
        <div style={{ fontSize: 11.5, color: t.textTertiary, marginTop: 10, lineHeight: 1.5 }}>
          Comments ÷ likes on sponsored posts. Higher = audience is actively discussing, not just
          passively liking.
        </div>
      </div>
    </div>
  );
}


// --- Athlete-level bubble scatter (Engagement vs Followers × EMV) ---
function AthleteScatter({
  athletes,
}: {
  athletes: { name: string; followers: number; avgER: number; emv: number; sport: string; image?: string }[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const [errored, setErrored] = useState<Set<string>>(() => new Set());
  const W = 860;
  const H = 460;
  // Every avatar is a fixed 40px circle (20px radius). EMV is no longer encoded in size -
  // it moves to the hover tooltip. Padding is set to keep every avatar fully inside the
  // chart bounds on every edge (avatar radius 20 + 12-16 px margin).
  const AVATAR_RADIUS = 20;
  const PAD = { left: 72, right: 56, top: 36, bottom: 56 };

  // Only plot athletes that have at least posts + followers (avoid zero-rows)
  const pts = athletes.filter((a) => a.followers > 0 && a.avgER > 0);
  if (pts.length === 0) {
    return (
      <p style={{ color: t.textSecondary, fontSize: 14 }}>
        No athletes have the follower + engagement data needed for this view.
      </p>
    );
  }

  // Log X for followers (range: thousands → hundreds of millions).
  // Extend bounds slightly on both sides so the leftmost/rightmost avatars sit well
  // inside the plot rather than on the axis itself.
  const minFoll = Math.max(1, Math.min(...pts.map((p) => p.followers)));
  const maxFoll = Math.max(...pts.map((p) => p.followers));
  const logMin = Math.log10(minFoll) - 0.1;
  const logMax = Math.log10(maxFoll) + 0.15;
  const xScale = (v: number) => {
    const lv = Math.log10(Math.max(1, v));
    const pct = (lv - logMin) / Math.max(0.0001, logMax - logMin);
    return PAD.left + pct * (W - PAD.left - PAD.right);
  };

  const maxER = Math.max(...pts.map((p) => p.avgER)) * 1.15 || 0.05;
  const yScale = (v: number) =>
    H - PAD.bottom - (v / maxER) * (H - PAD.top - PAD.bottom);

  // Build log-decade ticks (1K, 10K, 100K, 1M, 10M, 100M, 1B)
  const xTicks: number[] = [];
  for (let exp = Math.floor(logMin); exp <= Math.ceil(logMax); exp++) {
    xTicks.push(Math.pow(10, exp));
  }
  const yTicks = 4;
  const gridColor = 'rgba(255,255,255,0.06)';

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 760 }}>
        {/* Y grid */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const y = PAD.top + (i * (H - PAD.top - PAD.bottom)) / yTicks;
          const val = maxER - (i * maxER) / yTicks;
          return (
            <g key={`gy-${i}`}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={gridColor} />
              <text x={PAD.left - 8} y={y + 4} fontSize={10} fill={t.textTertiary} textAnchor="end">
                {(val * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
        {/* X grid (log) */}
        {xTicks.map((tick) => {
          const x = xScale(tick);
          if (x < PAD.left - 1 || x > W - PAD.right + 1) return null;
          return (
            <g key={`gx-${tick}`}>
              <line x1={x} x2={x} y1={PAD.top} y2={H - PAD.bottom} stroke={gridColor} />
              <text x={x} y={H - PAD.bottom + 16} fontSize={10} fill={t.textTertiary} textAnchor="middle">
                {fmtInt(tick)}
              </text>
            </g>
          );
        })}
        {/* Axis titles */}
        <text x={(W + PAD.left) / 2} y={H - 10} fontSize={11} fill={t.textTertiary} textAnchor="middle">
          Followers (log scale) →
        </text>
        <text
          x={-H / 2}
          y={16}
          fontSize={11}
          fill={t.textTertiary}
          textAnchor="middle"
          transform="rotate(-90)"
        >
          Avg engagement rate →
        </text>

        {/* Clip-path defs - one 40px (20px radius) circular clip per athlete */}
        <defs>
          {pts.map((a) => {
            const cx = xScale(a.followers);
            const cy = yScale(a.avgER);
            const safeId = a.name.replace(/[^a-zA-Z0-9]/g, '-');
            return (
              <clipPath key={`clip-${safeId}`} id={`scatter-clip-${safeId}`}>
                <circle cx={cx} cy={cy} r={AVATAR_RADIUS} />
              </clipPath>
            );
          })}
        </defs>

        {/* Avatars - non-hovered first, hovered last so its glow paints on top */}
        {(() => {
          const renderBubble = (
            a: (typeof pts)[number],
            isHover: boolean,
          ): React.ReactNode => {
            const cx = xScale(a.followers);
            const cy = yScale(a.avgER);
            const r = AVATAR_RADIUS;
            const safeId = a.name.replace(/[^a-zA-Z0-9]/g, '-');
            const hasImage = Boolean(a.image) && !errored.has(a.name);
            const initials = a.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() ?? '')
              .join('');

            return (
              <g
                key={isHover ? `hover-${a.name}` : a.name}
                onMouseEnter={() => setHover(a.name)}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Subtle volt-green glow ring on hover */}
                {isHover && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 5}
                    fill="none"
                    stroke={t.accent}
                    strokeOpacity={0.7}
                    strokeWidth={2}
                    style={{
                      filter: `drop-shadow(0 0 14px ${t.accentGlowStrong}) drop-shadow(0 0 6px ${t.accent})`,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {hasImage ? (
                  <>
                    {/* Fixed-size 40px circular photo - identical size for every athlete */}
                    <image
                      href={a.image}
                      x={cx - r}
                      y={cy - r}
                      width={r * 2}
                      height={r * 2}
                      clipPath={`url(#scatter-clip-${safeId})`}
                      preserveAspectRatio="xMidYMid slice"
                      onError={() =>
                        setErrored((prev) => {
                          if (prev.has(a.name)) return prev;
                          const next = new Set(prev);
                          next.add(a.name);
                          return next;
                        })
                      }
                    />
                    {/* Border ring - brighter volt when hovered, dark outline otherwise */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill="none"
                      stroke={isHover ? t.accent : 'rgba(0,0,0,0.45)'}
                      strokeWidth={isHover ? 2.5 : 1.5}
                      strokeOpacity={isHover ? 1 : 0.85}
                    />
                  </>
                ) : (
                  /* Initials fallback - volt-green fill with black initials */
                  <>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={t.accent}
                      stroke={isHover ? t.accent : 'rgba(0,0,0,0.35)'}
                      strokeWidth={isHover ? 2.5 : 1}
                      style={!isHover ? { filter: `drop-shadow(0 0 6px ${t.accentGlow})` } : undefined}
                    />
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={14}
                      fontWeight={800}
                      fill="#0a0a0a"
                      style={{
                        pointerEvents: 'none',
                        userSelect: 'none',
                        letterSpacing: '0.4px',
                      }}
                    >
                      {initials}
                    </text>
                  </>
                )}
              </g>
            );
          };
          // Pass 1: everyone except the hovered athlete
          const base = pts
            .filter((a) => a.name !== hover)
            .map((a) => renderBubble(a, false));
          // Pass 2: the hovered athlete last so its glow paints on top
          const hovered = pts.find((a) => a.name === hover);
          return (
            <>
              {base}
              {hovered && renderBubble(hovered, true)}
            </>
          );
        })()}

        {/* Hover tooltip - rendered LAST inside the SVG so it's on top of every bubble.
            Uses <foreignObject> so we can drop in real HTML with CSS backdrop-filter. */}
        {(() => {
          const a = pts.find((p) => p.name === hover);
          if (!a) return null;
          const cx = xScale(a.followers);
          const cy = yScale(a.avgER);
          const r = AVATAR_RADIUS;
          const tipW = 260;
          const tipH = 150;
          // Prefer to the right of the bubble; flip to the left when we'd clip the SVG
          const wantRight = cx + r + 12;
          const tipX =
            wantRight + tipW > W - 4
              ? Math.max(4, cx - r - 12 - tipW)
              : wantRight;
          const tipY = Math.max(
            4,
            Math.min(cy - tipH / 2, H - tipH - 4),
          );
          return (
            <foreignObject
              x={tipX}
              y={tipY}
              width={tipW}
              height={tipH}
              style={{ pointerEvents: 'none', overflow: 'visible' }}
            >
              <div
                // @ts-expect-error - xmlns is required for foreignObject HTML children
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '100%',
                  height: '100%',
                  boxSizing: 'border-box',
                  padding: 14,
                  borderRadius: 12,
                  background: 'rgba(10,10,10,0.72)',
                  backdropFilter: 'blur(16px) saturate(140%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  boxShadow:
                    '0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontFamily: INTER_STACK,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Header row: 44px circular photo + name + sport */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
                  {a.image && !errored.has(a.name) ? (
                    <img
                      src={a.image}
                      alt=""
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1.5px solid rgba(200,255,0,0.5)',
                        boxShadow: `0 0 10px rgba(200,255,0,0.3)`,
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: '#c8ff00',
                        color: '#0a0a0a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {a.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0]?.toUpperCase() ?? '')
                        .join('')}
                    </div>
                  )}
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                      }}
                    >
                      {a.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: 'rgba(255,255,255,0.55)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginTop: 2,
                      }}
                    >
                      {a.sport}
                    </div>
                  </div>
                </div>
                {/* Stats grid */}
                <div
                  style={{
                    paddingTop: 10,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    rowGap: 6,
                    columnGap: 12,
                    fontSize: 11,
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>Followers</span>
                  <span style={{ textAlign: 'right', fontWeight: 700 }}>
                    {fmtInt(a.followers)}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>Avg ER</span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#c8ff00',
                      textShadow: '0 0 8px rgba(200,255,0,0.5)',
                    }}
                  >
                    {(a.avgER * 100).toFixed(2)}%
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.55)' }}>Total EMV</span>
                  <span
                    style={{
                      textAlign: 'right',
                      fontWeight: 700,
                      color: '#c8ff00',
                      textShadow: '0 0 8px rgba(200,255,0,0.5)',
                    }}
                  >
                    {fmtCurrency(a.emv)}
                  </span>
                </div>
              </div>
            </foreignObject>
          );
        })()}
      </svg>
      <div
        style={{
          marginTop: 10,
          fontSize: 11.5,
          color: t.textTertiary,
          letterSpacing: '0.3px',
        }}
      >
        X axis: logarithmic · Hover any avatar for full stats
      </div>
    </div>
  );
}

// --- Trends metric chip row (togglable) ---
function MetricChipRow({
  active,
  monthly,
  onToggle,
}: {
  active: MetricKey[];
  monthly: MonthFull[];
  onToggle: (k: MetricKey) => void;
}) {
  // Metrics that are all-zero across the dataset get disabled (e.g. Saves in this data)
  const hasData = (k: MetricKey) => monthly.some((m) => (m[k] as number) > 0);
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 14,
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          color: t.textTertiary,
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          fontWeight: 600,
          marginRight: 4,
        }}
      >
        Metrics:
      </span>
      {METRIC_ORDER.map((k) => {
        const def = METRIC_DEFS[k];
        const isActive = active.includes(k);
        const disabled = !hasData(k);
        return (
          <button
            key={k}
            onClick={() => !disabled && onToggle(k)}
            disabled={disabled}
            aria-pressed={isActive}
            style={{
              padding: '6px 14px',
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.35 : 1,
              transition: t.transition,
              background: isActive
                ? `linear-gradient(135deg, ${def.color}33 0%, ${def.color}0D 100%)`
                : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
              border: `1px solid ${isActive ? def.color + '80' : t.cardBorder}`,
              color: isActive ? def.color : t.textSecondary,
              boxShadow: isActive
                ? `0 2px 8px ${def.color}33, inset 0 1px 0 ${def.color}22`
                : '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
              textShadow: isActive ? `0 0 10px ${def.color}80` : 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isActive ? def.color : 'transparent',
                border: `1px solid ${isActive ? def.color : t.cardBorder}`,
                boxShadow: isActive ? `0 0 6px ${def.color}` : 'none',
              }}
            />
            {def.label}
            {disabled && (
              <span
                style={{
                  fontSize: 9.5,
                  color: t.textTertiary,
                  fontWeight: 500,
                  marginLeft: 2,
                }}
              >
                no data
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// --- Multi-metric time series chart ---
// All active metrics are plotted on a shared normalized Y-axis (0-100% of each metric's own peak)
// so series with very different magnitudes (EMV, ER) can be compared shape-to-shape.
// Hovering a month shows raw values for every active metric plus that month's top post.
function MultiMetricChart({
  monthly,
  active,
}: {
  monthly: MonthFull[];
  active: MetricKey[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  if (monthly.length === 0) {
    return <p style={{ color: t.textSecondary, fontSize: 14 }}>No dated posts.</p>;
  }
  const W = 860;
  const H = 320;
  const PAD = { left: 48, right: 24, top: 24, bottom: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const step = innerW / Math.max(1, monthly.length - 1);

  // Per-metric max for normalization
  const maxes: Record<MetricKey, number> = {
    emv: Math.max(...monthly.map((m) => m.emv), 0) || 1,
    posts: Math.max(...monthly.map((m) => m.posts), 0) || 1,
    likes: Math.max(...monthly.map((m) => m.likes), 0) || 1,
    er: Math.max(...monthly.map((m) => m.er), 0) || 1,
    videoViews: Math.max(...monthly.map((m) => m.videoViews), 0) || 1,
    saves: Math.max(...monthly.map((m) => m.saves), 0) || 1,
    comments: Math.max(...monthly.map((m) => m.comments), 0) || 1,
  };

  const xAt = (i: number) => PAD.left + i * step;
  const yNorm = (v: number, k: MetricKey) =>
    H - PAD.bottom - (v / maxes[k]) * innerH;

  const labelEvery = Math.max(1, Math.ceil(monthly.length / 9));
  const gridColor = 'rgba(255,255,255,0.06)';

  // Separate bar metrics from line metrics (bars = Posts)
  const barMetrics = active.filter((k) => METRIC_DEFS[k].kind === 'bar');
  const lineMetrics = active.filter((k) => METRIC_DEFS[k].kind === 'line');

  // Tooltip geometry
  const tipWidth = 230;
  const tipLineH = 15;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ minWidth: 600 }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Horizontal grid (normalized 0-100%) */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD.top + (1 - f) * innerH;
          return (
            <g key={`y-${f}`}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 4}
                fontSize={9.5}
                fill={t.textTertiary}
                textAnchor="end"
              >
                {(f * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}

        {/* Vertical hover guide */}
        {hoverIdx !== null && (
          <line
            x1={xAt(hoverIdx)}
            x2={xAt(hoverIdx)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="2 3"
          />
        )}

        {/* Bar metrics (Posts) rendered first, behind lines */}
        {barMetrics.map((k) => {
          const def = METRIC_DEFS[k];
          const max = maxes[k];
          return (
            <g key={`bar-${k}`}>
              {monthly.map((m, i) => {
                const x = xAt(i) - 4;
                const h = (((m[k] as number) || 0) / max) * innerH * 0.5;
                const y = H - PAD.bottom - h;
                return (
                  <rect
                    key={`${m.month}-${k}`}
                    x={x}
                    y={y}
                    width={8}
                    height={h}
                    fill={def.color}
                    opacity={hoverIdx === i ? 0.9 : 0.55}
                    rx={1}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Line metrics + area fill for primary (first active line) */}
        {lineMetrics.map((k, lineIdx) => {
          const def = METRIC_DEFS[k];
          const isPrimary = lineIdx === 0;
          const pts = monthly.map((m, i) => {
            const x = xAt(i);
            const y = yNorm((m[k] as number) || 0, k);
            return `${x},${y}`;
          });
          const linePath = `M${pts.join(' L')}`;
          const lastX = xAt(monthly.length - 1);
          const areaPath = `${linePath} L${lastX},${H - PAD.bottom} L${PAD.left},${H - PAD.bottom} Z`;
          const gradId = `grad-${k}`;
          return (
            <g key={`line-${k}`}>
              {isPrimary && (
                <>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={def.color} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={def.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill={`url(#${gradId})`} />
                </>
              )}
              <path
                d={linePath}
                fill="none"
                stroke={def.color}
                strokeWidth={isPrimary ? 2.5 : 2}
                strokeOpacity={isPrimary ? 1 : 0.9}
                style={
                  isPrimary
                    ? { filter: `drop-shadow(0 0 6px ${def.color}80)` }
                    : undefined
                }
              />
              {monthly.map((m, i) => {
                const x = xAt(i);
                const y = yNorm((m[k] as number) || 0, k);
                const isHover = hoverIdx === i;
                return (
                  <circle
                    key={`${m.month}-dot-${k}`}
                    cx={x}
                    cy={y}
                    r={isHover ? 4 : 2.5}
                    fill={def.color}
                    stroke={isHover ? '#0a0a0a' : 'none'}
                    strokeWidth={isHover ? 2 : 0}
                  />
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {monthly.map((m, i) => {
          if (i % labelEvery !== 0) return null;
          const x = xAt(i);
          return (
            <text
              key={`xl-${m.month}`}
              x={x}
              y={H - PAD.bottom + 16}
              fontSize={9.5}
              fill={t.textTertiary}
              textAnchor="middle"
            >
              {m.month}
            </text>
          );
        })}

        {/* Invisible hit-areas for hover */}
        {monthly.map((m, i) => {
          const x = xAt(i);
          return (
            <rect
              key={`hit-${m.month}`}
              x={x - step / 2}
              y={PAD.top}
              width={step}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: 'crosshair' }}
            />
          );
        })}

        {/* Tooltip */}
        {hoverIdx !== null &&
          (() => {
            const m = monthly[hoverIdx];
            const lineCount = active.length + (m.topPost ? 2 : 0) + 1; // month + metrics + post line(s)
            const tipH = 12 + lineCount * tipLineH + 12;
            // Position: right of hover line, flip left if near right edge
            const rawX = xAt(hoverIdx) + 14;
            const tipX =
              rawX + tipWidth > W - PAD.right
                ? xAt(hoverIdx) - tipWidth - 14
                : rawX;
            const tipY = Math.max(PAD.top, Math.min(PAD.top + 10, H - PAD.bottom - tipH));
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={tipX}
                  y={tipY}
                  width={tipWidth}
                  height={tipH}
                  rx={8}
                  fill="rgba(20,20,20,0.96)"
                  stroke="rgba(255,255,255,0.12)"
                  style={{ filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.6))' }}
                />
                <text
                  x={tipX + 12}
                  y={tipY + 16}
                  fontSize={11}
                  fill={t.textPrimary}
                  fontWeight={700}
                  letterSpacing="0.3px"
                >
                  {m.month}
                </text>
                {active.map((k, idx) => {
                  const def = METRIC_DEFS[k];
                  const v = m[k] as number;
                  const y = tipY + 16 + (idx + 1) * tipLineH;
                  return (
                    <g key={`tip-${k}`}>
                      <circle
                        cx={tipX + 16}
                        cy={y - 3}
                        r={4}
                        fill={def.color}
                      />
                      <text
                        x={tipX + 26}
                        y={y}
                        fontSize={10.5}
                        fill={t.textSecondary}
                      >
                        {def.label}
                      </text>
                      <text
                        x={tipX + tipWidth - 12}
                        y={y}
                        fontSize={10.5}
                        fill={def.color}
                        fontWeight={700}
                        textAnchor="end"
                      >
                        {def.format(v)}
                      </text>
                    </g>
                  );
                })}
                {m.topPost && (
                  <>
                    <line
                      x1={tipX + 10}
                      x2={tipX + tipWidth - 10}
                      y1={tipY + 16 + (active.length + 0.5) * tipLineH}
                      y2={tipY + 16 + (active.length + 0.5) * tipLineH}
                      stroke="rgba(255,255,255,0.08)"
                    />
                    <text
                      x={tipX + 12}
                      y={tipY + 16 + (active.length + 1) * tipLineH + 4}
                      fontSize={9.5}
                      fill={t.textTertiary}
                      letterSpacing="0.5px"
                    >
                      TOP POST
                    </text>
                    <text
                      x={tipX + 12}
                      y={tipY + 16 + (active.length + 2) * tipLineH + 4}
                      fontSize={10.5}
                      fill={t.textPrimary}
                      fontWeight={600}
                    >
                      {m.topPost.athlete?.name ?? '-'}
                    </text>
                    <text
                      x={tipX + tipWidth - 12}
                      y={tipY + 16 + (active.length + 2) * tipLineH + 4}
                      fontSize={10}
                      fill={t.accent}
                      textAnchor="end"
                    >
                      {fmtCurrency(m.topPost.metrics?.emv ?? 0)}
                    </text>
                  </>
                )}
              </g>
            );
          })()}

        {/* Legend line */}
        <text
          x={PAD.left}
          y={14}
          fontSize={9.5}
          fill={t.textTertiary}
          letterSpacing="0.8px"
        >
          NORMALIZED % OF EACH METRIC'S PEAK MONTH · HOVER FOR RAW VALUES
        </text>
      </svg>
    </div>
  );
}

// --- Post card ---
function PostCard({ post }: { post: Post }) {
  const m = post.metrics ?? {};
  const when = post.publishedAt?.$date ?? post.createdAt?.$date;
  const dateStr = when
    ? new Date(when).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const tag = post.isSponsored
    ? { label: 'Sponsored', color: t.accent, bg: 'rgba(200,255,0,0.15)', border: 'rgba(200,255,0,0.3)' }
    : post.isCollaboration
    ? { label: 'Collab', color: t.blue, bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' }
    : { label: 'Organic', color: t.textSecondary, bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)' };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: t.cardBg,
        backdropFilter: t.blur,
        WebkitBackdropFilter: t.blur,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.radius,
        boxShadow: t.cardShadow,
        display: 'flex',
        flexDirection: 'column',
        transition: t.transition,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: t.topHighlight,
          zIndex: 3,
        }}
      />
      <div
        style={{
          aspectRatio: '1 / 1',
          width: '100%',
          background: 'rgba(255,255,255,0.02)',
          position: 'relative',
        }}
      >
        {post.url ? (
          <img
            src={post.url}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <span
            style={{
              padding: '3px 10px',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              borderRadius: 100,
              background: tag.bg,
              color: tag.color,
              border: `1px solid ${tag.border}`,
              fontWeight: 600,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              textShadow: tag.color === t.accent ? `0 0 8px ${t.accentGlow}` : 'none',
            }}
          >
            {tag.label}
          </span>
          {post.mediaType === 'VIDEO' && (
            <span
              style={{
                padding: '3px 10px',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '1.2px',
                borderRadius: 100,
                background: 'rgba(10,10,10,0.7)',
                color: t.textSecondary,
                border: `1px solid ${t.cardBorder}`,
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              Video
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {post.athlete.image && (
            <img
              src={post.athlete.image}
              alt=""
              style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: t.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {post.athlete.name}
            </div>
            <div style={{ fontSize: 11, color: t.textTertiary }}>
              {post.athlete.sport} · {dateStr} · {post.mediaType === 'VIDEO' ? 'Video' : 'Photo'}
            </div>
          </div>
        </div>
        {post.sponsorPartner && (
          <div
            style={{
              marginTop: 10,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11.5,
              color: t.accent,
              padding: '3px 10px',
              borderRadius: 100,
              background: 'rgba(200,255,0,0.08)',
              border: '1px solid rgba(200,255,0,0.2)',
              alignSelf: 'flex-start',
              fontWeight: 600,
            }}
          >
            <Target size={11} /> Partner: {post.sponsorPartner}
          </div>
        )}
        {post.caption && (
          <p
            style={{
              marginTop: 12,
              fontSize: 13,
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.7)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.caption}
          </p>
        )}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          <Stat label="EMV" value={fmtCurrency(m.emv ?? 0)} accent />
          <Stat label="Likes" value={fmtInt(m.likes ?? 0)} />
          <Stat label="ER" value={fmtPct(m.engagementRate ?? 0)} />
        </div>
        {post.permalink && (
          <a
            href={post.permalink}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: t.accent,
              textDecoration: 'none',
              textShadow: `0 0 10px ${t.accentGlow}`,
            }}
          >
            View on Instagram <ArrowUpRight size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ ...summaryLabelStyle, marginBottom: 2 }}>{label}</div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: accent ? t.accent : t.textPrimary,
          textShadow: accent ? `0 0 10px ${t.accentGlow}` : 'none',
          letterSpacing: '-0.2px',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default GenescoReport;
