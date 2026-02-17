import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Filter,
  Info,
  Medal,
  Search,
  Sparkles,
  Trophy,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  DrawerPanel,
  GlassCard,
  GlassPill,
  MetricCard,
  SkeletonLoader,
  Sparkline,
  TabTransition,
} from './playfly/PlayflyUI';
import { calculatePostEMV, formatEMV } from '../utils/emvCalculator';

type TabId = 'brief' | 'events' | 'athletes' | 'content' | 'benchmarks';
type SortMetric = 'interactions' | 'emv' | 'engagement' | 'consistency' | 'volume';
type ContentScope = 'all' | 'athlete' | 'team';
type BenchmarkMode = 'all-events' | 'event-type';

interface StJudeBrandImpactReportProps {
  onBack: () => void;
}

interface RawPost {
  _id?: { $oid?: string };
  source?: string;
  url?: string;
  permalink?: string;
  uploadedAt?: { $date?: string };
  caption?: string;
  hashtags?: string[];
  originalAuthor?: string;
  collaborationPartners?: string[];
  hasOrganizationLogo?: boolean;
  hasOrganizationInCaption?: boolean;
  isCollaboration?: boolean;
  mediaType?: string;
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    engagementRate?: number;
  };
}

interface NormalizedPost {
  id: string;
  source: string;
  url: string;
  permalink: string;
  uploadedAt: Date | null;
  uploadedLabel: string;
  caption: string;
  hashtags: string[];
  originalAuthor: string;
  partners: string[];
  hasOrganizationLogo: boolean;
  hasOrganizationInCaption: boolean;
  isCollaboration: boolean;
  mediaType: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  interactions: number;
  emv: number;
  eventName: string;
  eventType: string;
  ownerType: 'athlete' | 'team';
}

interface EventSummary {
  name: string;
  type: string;
  posts: NormalizedPost[];
  postCount: number;
  uniqueAthletes: number;
  interactions: number;
  avgEngagement: number;
  emv: number;
  sparkline: number[];
}

interface AthleteSummary {
  name: string;
  posts: NormalizedPost[];
  postCount: number;
  interactions: number;
  avgEngagement: number;
  emv: number;
  consistency: number;
  events: string[];
}

const ST_JUDE_AUTHOR = 'stjude';
const DATE_FMT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const tabs: { id: TabId; label: string }[] = [
  { id: 'brief', label: 'Executive Brief' },
  { id: 'events', label: 'Events & Campaigns' },
  { id: 'athletes', label: 'Athlete Partners' },
  { id: 'content', label: 'Content Intelligence' },
  { id: 'benchmarks', label: 'Benchmarks' },
];

const eventPatterns: Array<{ label: string; type: string; keywords: string[] }> = [
  {
    label: 'St. Jude Walk/Run',
    type: 'Walk / Run',
    keywords: ['walk', 'run', '5k', '10k', 'walkrun', 'stjude walk'],
  },
  {
    label: 'St. Jude Memphis Marathon Weekend',
    type: 'Marathon Weekend',
    keywords: ['marathon', 'memphis', 'half marathon', 'st jude marathon'],
  },
  {
    label: 'Hoops for St. Jude',
    type: 'Basketball Program',
    keywords: ['hoops', 'basketball', 'hoops for st. jude'],
  },
  {
    label: 'Play Live Fundraising',
    type: 'Digital Fundraising',
    keywords: ['play live', 'gaming', 'stream'],
  },
  {
    label: 'Thanks and Giving',
    type: 'Seasonal Fundraising',
    keywords: ['thanks and giving', 'holiday', 'season of giving'],
  },
];

const themePatterns: Array<{ label: string; keywords: string[] }> = [
  { label: 'Race Moments', keywords: ['run', 'walk', 'finish', 'mile', '5k', '10k', 'marathon'] },
  { label: 'Fundraising Push', keywords: ['donate', 'fundraiser', 'raise', 'support', 'gift', 'join'] },
  { label: 'Athlete Storytelling', keywords: ['athlete', 'team', 'training', 'game', 'season', 'practice'] },
  { label: 'Patient Mission', keywords: ['patient', 'family', 'child', 'mission', 'cure', 'hope'] },
  { label: 'Community Events', keywords: ['event', 'volunteer', 'community', 'together', 'weekend'] },
];

function safeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase();
}

function displayHandle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Unknown';
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function getMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function getPercentile(values: number[], percentile: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((percentile / 100) * sorted.length) - 1));
  return sorted[idx];
}

function detectEventName(post: RawPost): { eventName: string; eventType: string } {
  const text = `${post.caption || ''} ${(post.hashtags || []).join(' ')}`.toLowerCase();

  for (const pattern of eventPatterns) {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      return { eventName: pattern.label, eventType: pattern.type };
    }
  }

  return { eventName: 'Always-On Mission Content', eventType: 'Always-On' };
}

function detectTheme(post: NormalizedPost): string {
  const text = `${post.caption} ${post.hashtags.join(' ')}`.toLowerCase();
  for (const pattern of themePatterns) {
    if (pattern.keywords.some((keyword) => text.includes(keyword))) {
      return pattern.label;
    }
  }
  return 'General Awareness';
}

function getPostPartners(post: RawPost): string[] {
  const set = new Set<string>();
  const originalAuthor = normalizeHandle(post.originalAuthor || '');

  (post.collaborationPartners || []).forEach((partner) => {
    const normalized = normalizeHandle(partner);
    if (normalized) set.add(normalized);
  });

  if (originalAuthor && originalAuthor !== ST_JUDE_AUTHOR) {
    set.add(originalAuthor);
  }

  return Array.from(set);
}

function normalizePost(post: RawPost, index: number): NormalizedPost {
  const uploadedAtRaw = post.uploadedAt?.$date;
  const uploadedAt = uploadedAtRaw ? new Date(uploadedAtRaw) : null;
  const likes = safeNumber(post.metrics?.likes);
  const comments = safeNumber(post.metrics?.comments);
  const shares = safeNumber(post.metrics?.shares);
  const saves = safeNumber(post.metrics?.saves);
  const interactions = likes + comments + shares + saves;
  const partners = getPostPartners(post);
  const { eventName, eventType } = detectEventName(post);
  const author = normalizeHandle(post.originalAuthor || ST_JUDE_AUTHOR);

  return {
    id: post._id?.$oid || `${index}-${post.permalink || ''}`,
    source: post.source || 'INSTAGRAM',
    url: post.url || '',
    permalink: post.permalink || '',
    uploadedAt,
    uploadedLabel: uploadedAt ? DATE_FMT.format(uploadedAt) : 'Unknown date',
    caption: post.caption || '',
    hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
    originalAuthor: author,
    partners,
    hasOrganizationLogo: Boolean(post.hasOrganizationLogo),
    hasOrganizationInCaption: Boolean(post.hasOrganizationInCaption),
    isCollaboration: Boolean(post.isCollaboration),
    mediaType: post.mediaType || 'UNKNOWN',
    likes,
    comments,
    shares,
    saves,
    engagementRate: safeNumber(post.metrics?.engagementRate),
    interactions,
    emv: calculatePostEMV({ likes, comments }),
    eventName,
    eventType,
    ownerType: partners.length > 0 || author !== ST_JUDE_AUTHOR ? 'athlete' : 'team',
  };
}

function buildSparkline(posts: NormalizedPost[]): number[] {
  if (!posts.length) return [0];
  const byDate = new Map<string, number>();

  posts.forEach((post) => {
    const key = post.uploadedAt ? post.uploadedAt.toISOString().slice(0, 10) : 'unknown';
    byDate.set(key, (byDate.get(key) || 0) + post.interactions);
  });

  return Array.from(byDate.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map((entry) => entry[1]);
}

function getTopPost(posts: NormalizedPost[]): NormalizedPost | null {
  if (!posts.length) return null;
  return [...posts].sort((a, b) => b.interactions - a.interactions)[0];
}

function postThumb(post: NormalizedPost): string {
  return post.url || '/st-jude-logo.svg';
}

function ChartCaption({ text }: { text: string }) {
  return <p className="mt-2 text-xs text-gray-500">What you&apos;re seeing: {text}</p>;
}

function MiniBarChart({
  data,
  valueFormatter,
  color = '#C8102E',
}: {
  data: Array<{ label: string; value: number }>;
  valueFormatter: (value: number) => string;
  color?: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const width = (item.value / maxValue) * 100;
        return (
          <div key={item.label} className="space-y-1" title={`${item.label}: ${valueFormatter(item.value)}`}>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium">{item.label}</span>
              <span>{valueFormatter(item.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, width)}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DistributionBars({ values }: { values: number[] }) {
  const p50 = getPercentile(values, 50);
  const p75 = getPercentile(values, 75);
  const p90 = getPercentile(values, 90);
  const chart = [
    { label: 'p50', value: p50 },
    { label: 'p75', value: p75 },
    { label: 'p90', value: p90 },
  ];
  return (
    <div>
      <MiniBarChart data={chart} valueFormatter={formatNumber} color="#991B1B" />
      <ChartCaption text="Interaction percentile thresholds across selected posts." />
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function StJudeBrandImpactReport({ onBack }: StJudeBrandImpactReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('brief');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<NormalizedPost[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<string>('All Events');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All Platforms');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [eventDrawerOpen, setEventDrawerOpen] = useState(false);
  const [selectedEventSummary, setSelectedEventSummary] = useState<EventSummary | null>(null);

  const [athleteQuery, setAthleteQuery] = useState('');
  const [athleteSort, setAthleteSort] = useState<SortMetric>('interactions');
  const [athleteDrawerOpen, setAthleteDrawerOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteSummary | null>(null);

  const [contentScope, setContentScope] = useState<ContentScope>('all');
  const [benchmarkMode, setBenchmarkMode] = useState<BenchmarkMode>('all-events');
  const [leaderboardMetric, setLeaderboardMetric] = useState<'interactions' | 'emv' | 'engagement'>('interactions');
  const [definitionsOpen, setDefinitionsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/data/saint-jude-hospital.contents.json');
        if (!response.ok) throw new Error(`Failed to load data (${response.status})`);
        const raw = (await response.json()) as RawPost[];
        if (!cancelled) {
          setPosts(raw.map((post, idx) => normalizePost(post, idx)));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error loading data');
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const platformOptions = useMemo(() => {
    const values = new Set<string>(['All Platforms']);
    posts.forEach((post) => values.add(post.source));
    return Array.from(values);
  }, [posts]);

  const eventOptions = useMemo(() => {
    const values = new Set<string>(['All Events']);
    posts.forEach((post) => values.add(post.eventName));
    return Array.from(values);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedEvent !== 'All Events' && post.eventName !== selectedEvent) return false;
      if (selectedPlatform !== 'All Platforms' && post.source !== selectedPlatform) return false;
      if (startDate && post.uploadedAt && post.uploadedAt < new Date(startDate)) return false;
      if (endDate && post.uploadedAt && post.uploadedAt > new Date(`${endDate}T23:59:59`)) return false;
      if (contentScope === 'athlete' && post.ownerType !== 'athlete') return false;
      if (contentScope === 'team' && post.ownerType !== 'team') return false;
      return true;
    });
  }, [posts, selectedEvent, selectedPlatform, startDate, endDate, contentScope]);

  const eventSummaries = useMemo(() => {
    const map = new Map<string, NormalizedPost[]>();
    filteredPosts.forEach((post) => {
      const list = map.get(post.eventName) || [];
      list.push(post);
      map.set(post.eventName, list);
    });

    return Array.from(map.entries())
      .map(([name, eventPosts]) => {
        const athleteSet = new Set<string>();
        eventPosts.forEach((post) => post.partners.forEach((partner) => athleteSet.add(partner)));

        const interactions = eventPosts.reduce((sum, post) => sum + post.interactions, 0);
        const emv = eventPosts.reduce((sum, post) => sum + post.emv, 0);
        const avgEngagement = eventPosts.length
          ? eventPosts.reduce((sum, post) => sum + post.engagementRate, 0) / eventPosts.length
          : 0;

        const sample = eventPosts[0];
        return {
          name,
          type: sample ? sample.eventType : 'Always-On',
          posts: eventPosts,
          postCount: eventPosts.length,
          uniqueAthletes: athleteSet.size,
          interactions,
          avgEngagement,
          emv,
          sparkline: buildSparkline(eventPosts),
        } as EventSummary;
      })
      .sort((a, b) => b.interactions - a.interactions);
  }, [filteredPosts]);

  const athleteSummaries = useMemo(() => {
    const map = new Map<string, NormalizedPost[]>();

    filteredPosts.forEach((post) => {
      post.partners.forEach((partner) => {
        const list = map.get(partner) || [];
        list.push(post);
        map.set(partner, list);
      });
    });

    const results = Array.from(map.entries()).map(([name, athletePosts]) => {
      const interactionsList = athletePosts.map((post) => post.interactions);
      const mean = interactionsList.reduce((sum, value) => sum + value, 0) / (interactionsList.length || 1);
      const median = getMedian(interactionsList);
      const consistency = mean > 0 ? Math.max(0, 1 - Math.abs(mean - median) / mean) : 0;
      const events = Array.from(new Set(athletePosts.map((post) => post.eventName)));

      return {
        name,
        posts: athletePosts,
        postCount: athletePosts.length,
        interactions: athletePosts.reduce((sum, post) => sum + post.interactions, 0),
        avgEngagement: athletePosts.reduce((sum, post) => sum + post.engagementRate, 0) / (athletePosts.length || 1),
        emv: athletePosts.reduce((sum, post) => sum + post.emv, 0),
        consistency,
        events,
      } as AthleteSummary;
    });

    const query = athleteQuery.trim().toLowerCase();
    const searched = query
      ? results.filter((row) => displayHandle(row.name).toLowerCase().includes(query))
      : results;

    return searched.sort((a, b) => {
      if (athleteSort === 'interactions') return b.interactions - a.interactions;
      if (athleteSort === 'emv') return b.emv - a.emv;
      if (athleteSort === 'engagement') return b.avgEngagement - a.avgEngagement;
      if (athleteSort === 'consistency') return b.consistency - a.consistency;
      return b.postCount - a.postCount;
    });
  }, [filteredPosts, athleteQuery, athleteSort]);

  const topEvent = eventSummaries[0] || null;
  const topAthlete = athleteSummaries.sort((a, b) => b.emv - a.emv)[0] || null;
  const topPost = getTopPost(filteredPosts);

  const kpi = useMemo(() => {
    const totalPosts = filteredPosts.length;
    const totalInteractions = filteredPosts.reduce((sum, post) => sum + post.interactions, 0);
    const avgEngagement = totalPosts
      ? filteredPosts.reduce((sum, post) => sum + post.engagementRate, 0) / totalPosts
      : 0;
    const totalEMV = filteredPosts.reduce((sum, post) => sum + post.emv, 0);

    const athleteSet = new Set<string>();
    filteredPosts.forEach((post) => post.partners.forEach((partner) => athleteSet.add(partner)));

    return {
      totalPosts,
      totalInteractions,
      avgEngagement,
      totalEMV,
      uniqueAthletes: athleteSet.size,
      campaignCount: new Set(filteredPosts.map((post) => post.eventName)).size,
    };
  }, [filteredPosts]);

  const aiInsights = useMemo(() => {
    if (!filteredPosts.length) return [] as string[];

    const collab = filteredPosts.filter((post) => post.isCollaboration);
    const nonCollab = filteredPosts.filter((post) => !post.isCollaboration);

    const mention = filteredPosts.filter((post) => post.hasOrganizationInCaption);
    const noMention = filteredPosts.filter((post) => !post.hasOrganizationInCaption);

    const video = filteredPosts.filter((post) => post.mediaType === 'VIDEO');
    const photo = filteredPosts.filter((post) => post.mediaType === 'PHOTO');

    const topEventShare = topEvent && kpi.totalInteractions > 0
      ? (topEvent.interactions / kpi.totalInteractions) * 100
      : 0;

    const items = [
      collab.length > 0 && nonCollab.length > 0
        ? `Collaboration posts average ${formatNumber(collab.reduce((s, p) => s + p.interactions, 0) / collab.length)} interactions vs ${formatNumber(nonCollab.reduce((s, p) => s + p.interactions, 0) / nonCollab.length)} for non-collab posts, indicating stronger audience response when partner handles are involved.`
        : '',
      mention.length > 0 && noMention.length > 0
        ? `Posts that explicitly mention St. Jude in caption average ${formatPercent(mention.reduce((s, p) => s + p.engagementRate, 0) / mention.length)} engagement rate compared with ${formatPercent(noMention.reduce((s, p) => s + p.engagementRate, 0) / noMention.length)} when caption mention is absent.`
        : '',
      video.length > 0 && photo.length > 0
        ? `Video posts deliver ${formatNumber(video.reduce((s, p) => s + p.interactions, 0) / video.length)} average interactions while photo posts deliver ${formatNumber(photo.reduce((s, p) => s + p.interactions, 0) / photo.length)}, showing a clear format split in audience behavior.`
        : '',
      topEvent
        ? `${topEvent.name} contributes ${topEventShare.toFixed(1)}% of all measured interactions in the selected view, which concentrates performance into a single flagship activation.`
        : '',
      topAthlete
        ? `${displayHandle(topAthlete.name)} leads athlete EMV at ${formatEMV(topAthlete.emv)} across ${topAthlete.postCount} posts, with involvement in ${topAthlete.events.length} events.`
        : '',
    ].filter(Boolean);

    return items.slice(0, 5);
  }, [filteredPosts, kpi.totalInteractions, topAthlete, topEvent]);

  const contentScopeAvailability = useMemo(() => {
    const hasAthlete = posts.some((post) => post.ownerType === 'athlete');
    const hasTeam = posts.some((post) => post.ownerType === 'team');
    return { hasAthlete, hasTeam };
  }, [posts]);

  const contentByPlatform = useMemo(() => {
    const map = new Map<string, { interactions: number; emv: number }>();
    filteredPosts.forEach((post) => {
      const current = map.get(post.source) || { interactions: 0, emv: 0 };
      current.interactions += post.interactions;
      current.emv += post.emv;
      map.set(post.source, current);
    });

    return Array.from(map.entries()).map(([label, values]) => ({
      label,
      value: values.interactions,
      emv: values.emv,
    }));
  }, [filteredPosts]);

  const contentByType = useMemo(() => {
    const map = new Map<string, number>();
    filteredPosts.forEach((post) => {
      map.set(post.mediaType, (map.get(post.mediaType) || 0) + post.interactions);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredPosts]);

  const clusterStats = useMemo(() => {
    const map = new Map<string, NormalizedPost[]>();
    filteredPosts.forEach((post) => {
      const label = detectTheme(post);
      const list = map.get(label) || [];
      list.push(post);
      map.set(label, list);
    });

    return Array.from(map.entries())
      .map(([label, clusterPosts]) => ({
        label,
        posts: clusterPosts,
        interactions: clusterPosts.reduce((sum, post) => sum + post.interactions, 0),
        emv: clusterPosts.reduce((sum, post) => sum + post.emv, 0),
        topPost: getTopPost(clusterPosts),
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 6);
  }, [filteredPosts]);

  const benchmarkGroups = useMemo(() => {
    if (benchmarkMode === 'all-events') {
      return eventSummaries.map((event) => ({
        label: event.name,
        interactions: event.interactions,
        emv: event.emv,
        engagement: event.avgEngagement,
        volume: event.postCount,
      }));
    }

    const map = new Map<string, { interactions: number; emv: number; engagementSum: number; count: number; volume: number }>();
    eventSummaries.forEach((event) => {
      const current = map.get(event.type) || { interactions: 0, emv: 0, engagementSum: 0, count: 0, volume: 0 };
      current.interactions += event.interactions;
      current.emv += event.emv;
      current.engagementSum += event.avgEngagement;
      current.count += 1;
      current.volume += event.postCount;
      map.set(event.type, current);
    });

    return Array.from(map.entries()).map(([label, values]) => ({
      label,
      interactions: values.interactions,
      emv: values.emv,
      engagement: values.count ? values.engagementSum / values.count : 0,
      volume: values.volume,
    }));
  }, [benchmarkMode, eventSummaries]);

  const benchmarkMetricValues = benchmarkGroups.map((group) => {
    if (leaderboardMetric === 'interactions') return group.interactions;
    if (leaderboardMetric === 'emv') return group.emv;
    return group.engagement;
  });

  const benchmarkPercentiles = {
    p50: getPercentile(benchmarkMetricValues, 50),
    p75: getPercentile(benchmarkMetricValues, 75),
    p90: getPercentile(benchmarkMetricValues, 90),
  };

  const leaderboard = [...benchmarkGroups].sort((a, b) => {
    if (leaderboardMetric === 'interactions') return b.interactions - a.interactions;
    if (leaderboardMetric === 'emv') return b.emv - a.emv;
    return b.engagement - a.engagement;
  });

  const drawerSide = typeof window !== 'undefined' && window.innerWidth < 1024 ? 'bottom' : 'right';

  const isEmpty = !loading && !error && filteredPosts.length === 0;

  return (
    <div
      className="playfly-theme min-h-screen"
      style={{
        background: 'radial-gradient(circle at 20% 0%, rgba(200,16,46,0.14), transparent 45%), linear-gradient(180deg, #f8fafc 0%, #f4f4f5 45%, #eef2f7 100%)',
        ['--pf-primary' as string]: '#C8102E',
        ['--pf-secondary' as string]: '#991B1B',
        ['--pf-glow' as string]: 'rgba(200,16,46,0.25)',
      }}
    >
      <header className="sticky top-0 z-40 border-b border-white/40 nav-glass nav-glass-scrolled">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-800 transition hover:bg-white"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <img src="/st-jude-logo.svg" alt="St. Jude" className="h-10 w-auto" />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">St. Jude Athlete & Event Impact Report</p>
              <p className="truncate text-xs text-gray-600">Internal executive brief</p>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto scrollbar-hide">
            <div className="flex min-w-max items-center gap-2">
              {tabs.map((tab) => (
                <GlassPill
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="pf-chip-compact"
                >
                  {tab.label}
                </GlassPill>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/60 bg-white/60 px-3 py-2 backdrop-blur-lg lg:hidden">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="inline-flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> Current View</span>
              <span className="font-semibold text-gray-800">{tabs.find((t) => t.id === activeTab)?.label}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span>{selectedEvent}</span>
              <span>•</span>
              <span>{selectedPlatform}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6">
        <GlassCard hover={false} className="mb-5 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs text-gray-600">
              Event / Campaign
              <select
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-900"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                {eventOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="text-xs text-gray-600">
              Platform
              <select
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-900"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                {platformOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="text-xs text-gray-600">
              Start Date
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-900"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="text-xs text-gray-600">
              End Date
              <input
                type="date"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-900"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
        </GlassCard>

        {loading && (
          <GlassCard hover={false} className="p-5">
            <SkeletonLoader lines={8} />
          </GlassCard>
        )}

        {error && (
          <GlassCard hover={false} className="p-5">
            <p className="text-sm font-semibold text-red-700">Unable to load report data</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
          </GlassCard>
        )}

        {isEmpty && (
          <GlassCard hover={false} className="p-10 text-center">
            <p className="text-base font-semibold text-gray-900">No posts match the current filters.</p>
            <p className="mt-1 text-sm text-gray-600">Adjust event/platform/date filters to view St. Jude activation data.</p>
          </GlassCard>
        )}

        {!loading && !error && !isEmpty && (
          <TabTransition tabKey={activeTab}>
            {activeTab === 'brief' && (
              <div className="space-y-5">
                <GlassCard hover={false} className="p-5 sm:p-7">
                  <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Executive Brief</p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">St. Jude Athlete & Event Impact Report</h1>
                  <p className="mt-3 max-w-3xl text-sm text-gray-600">
                    Performance summary of athlete and event-driven fundraising activations across St. Jude content.
                  </p>
                </GlassCard>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricCard title="Total Posts" value={kpi.totalPosts} subtitle="Filtered posts" icon={<Info className="h-4 w-4" />} />
                  <MetricCard title="Total Interactions" value={kpi.totalInteractions} subtitle="Likes + comments + shares + saves" icon={<Sparkles className="h-4 w-4" />} format={formatNumber} />
                  <MetricCard title="Avg Engagement Rate" value={kpi.avgEngagement} subtitle="Per post" icon={<ChevronDown className="h-4 w-4" />} format={formatPercent} />
                  <MetricCard title="Total EMV" value={kpi.totalEMV} subtitle="Earned media value" icon={<Trophy className="h-4 w-4" />} format={formatEMV} />
                  <MetricCard title="Unique Athletes" value={kpi.uniqueAthletes} subtitle="Distinct partner handles" icon={<Users className="h-4 w-4" />} />
                  <MetricCard title="# Campaigns / Events" value={kpi.campaignCount} subtitle="Detected event groupings" icon={<Medal className="h-4 w-4" />} />
                </div>

                <section>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-gray-600">Top Performers</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <GlassCard className="p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Top Event / Campaign</p>
                      {topEvent ? (
                        <>
                          <p className="mt-2 text-lg font-semibold text-gray-900">{topEvent.name}</p>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <MetricBlock label="Interactions" value={formatNumber(topEvent.interactions)} />
                            <MetricBlock label="EMV" value={formatEMV(topEvent.emv)} />
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No event data</p>
                      )}
                    </GlassCard>

                    <GlassCard className="p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Top Athlete Partner</p>
                      {topAthlete ? (
                        <>
                          <p className="mt-2 text-lg font-semibold text-gray-900">{displayHandle(topAthlete.name)}</p>
                          <div className="mt-3 grid grid-cols-2 gap-3">
                            <MetricBlock label="EMV" value={formatEMV(topAthlete.emv)} />
                            <MetricBlock label="Interactions" value={formatNumber(topAthlete.interactions)} />
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No athlete partner data</p>
                      )}
                    </GlassCard>

                    <GlassCard className="p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-gray-500">Top Post</p>
                      {topPost ? (
                        <>
                          <div className="mt-2 flex items-start gap-3">
                            <img src={postThumb(topPost)} alt="Top post" className="h-16 w-16 rounded-xl object-cover" />
                            <p className="line-clamp-2 text-sm text-gray-700">{topPost.caption || 'No caption available.'}</p>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                            <MetricBlock label="Likes" value={formatNumber(topPost.likes)} />
                            <MetricBlock label="Comments" value={formatNumber(topPost.comments)} />
                            <MetricBlock label="EMV" value={formatEMV(topPost.emv)} />
                          </div>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">No top post available</p>
                      )}
                    </GlassCard>
                  </div>
                </section>

                <GlassCard hover={false} className="p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#C8102E]" />
                    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-700">AI Insights</h2>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {aiInsights.map((insight) => (
                      <li key={insight} className="rounded-xl border border-gray-200 bg-white/70 px-3 py-2 text-sm text-gray-700">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                <GlassCard hover={false} className="p-4">
                  <button
                    onClick={() => setDefinitionsOpen((value) => !value)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <span className="text-sm font-semibold text-gray-800">Definitions</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${definitionsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {definitionsOpen && (
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p><span className="font-semibold text-gray-800">EMV:</span> Earned Media Value = (Likes x $0.50) + (Comments x $1.50).</p>
                      <p><span className="font-semibold text-gray-800">Interactions:</span> Likes + Comments + Shares + Saves.</p>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-5">
                <GlassCard hover={false} className="p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-700">Event Scorecards</h2>
                  <p className="mt-1 text-sm text-gray-600">Tap any event card for top content, top athletes, and platform mix.</p>
                </GlassCard>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {eventSummaries.map((event) => (
                    <GlassCard
                      key={event.name}
                      className="p-4"
                      onClick={() => {
                        setSelectedEventSummary(event);
                        setEventDrawerOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.1em] text-gray-500">{event.type}</p>
                          <p className="mt-1 text-base font-semibold text-gray-900">{event.name}</p>
                        </div>
                        <span className="rounded-full border border-[#C8102E]/30 bg-[#C8102E]/10 px-2 py-1 text-[11px] font-semibold text-[#991B1B]">
                          {event.postCount} posts
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <MetricBlock label="Athletes" value={formatNumber(event.uniqueAthletes)} />
                        <MetricBlock label="Interactions" value={formatNumber(event.interactions)} />
                        <MetricBlock label="Avg ER" value={formatPercent(event.avgEngagement)} />
                        <MetricBlock label="EMV" value={formatEMV(event.emv)} />
                      </div>

                      <div className="mt-3 h-10">
                        <Sparkline values={event.sparkline} color="#C8102E" />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'athletes' && (
              <div className="space-y-5">
                <GlassCard hover={false} className="p-4">
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <label className="text-xs text-gray-600 lg:col-span-2">
                      Search Athlete
                      <div className="mt-1 flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2">
                        <Search className="h-4 w-4 text-gray-500" />
                        <input
                          value={athleteQuery}
                          onChange={(e) => setAthleteQuery(e.target.value)}
                          placeholder="Search @handle"
                          className="w-full bg-transparent text-sm text-gray-900 outline-none"
                        />
                      </div>
                    </label>

                    <label className="text-xs text-gray-600">
                      Sort
                      <select
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white/90 px-3 py-2 text-sm text-gray-900"
                        value={athleteSort}
                        onChange={(e) => setAthleteSort(e.target.value as SortMetric)}
                      >
                        <option value="interactions">Interactions</option>
                        <option value="emv">EMV</option>
                        <option value="engagement">Engagement Rate</option>
                        <option value="consistency">Consistency</option>
                        <option value="volume">Post Volume</option>
                      </select>
                    </label>
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {athleteSummaries.map((athlete) => (
                    <GlassCard
                      key={athlete.name}
                      className="p-4"
                      onClick={() => {
                        setSelectedAthlete(athlete);
                        setAthleteDrawerOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-base font-semibold text-gray-900">{displayHandle(athlete.name)}</p>
                        <User className="h-4 w-4 text-[#C8102E]" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <MetricBlock label="Interactions" value={formatNumber(athlete.interactions)} />
                        <MetricBlock label="EMV" value={formatEMV(athlete.emv)} />
                        <MetricBlock label="Avg ER" value={formatPercent(athlete.avgEngagement)} />
                        <MetricBlock label="Consistency" value={`${(athlete.consistency * 100).toFixed(0)}%`} />
                      </div>
                      <p className="mt-2 text-xs text-gray-600">{athlete.events.length} events participated</p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-5">
                <GlassCard hover={false} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <GlassPill
                      active={contentScope === 'all'}
                      onClick={() => setContentScope('all')}
                      className="pf-chip-compact"
                    >
                      All Content
                    </GlassPill>
                    <GlassPill
                      active={contentScope === 'athlete'}
                      onClick={() => setContentScope('athlete')}
                      disabled={!contentScopeAvailability.hasAthlete}
                      className="pf-chip-compact"
                    >
                      Athlete Content
                    </GlassPill>
                    <GlassPill
                      active={contentScope === 'team'}
                      onClick={() => setContentScope('team')}
                      disabled={!contentScopeAvailability.hasTeam}
                      className="pf-chip-compact"
                    >
                      Team / Org Content
                    </GlassPill>
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  <GlassCard hover={false} className="p-4">
                    <h3 className="text-sm font-semibold text-gray-800">Performance by Platform</h3>
                    <div className="mt-3">
                      <MiniBarChart
                        data={contentByPlatform.map((item) => ({ label: item.label, value: item.value }))}
                        valueFormatter={formatNumber}
                      />
                      <ChartCaption text="Total interactions by platform for the selected scope." />
                    </div>
                  </GlassCard>

                  <GlassCard hover={false} className="p-4">
                    <h3 className="text-sm font-semibold text-gray-800">Performance by Content Type</h3>
                    <div className="mt-3">
                      <MiniBarChart data={contentByType} valueFormatter={formatNumber} color="#7F1D1D" />
                      <ChartCaption text="Total interactions by media format (photo/video/etc.)." />
                    </div>
                  </GlassCard>
                </div>

                <GlassCard hover={false} className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800">Interaction Distribution</h3>
                  <div className="mt-3">
                    <DistributionBars values={filteredPosts.map((post) => post.interactions)} />
                  </div>
                </GlassCard>

                <GlassCard hover={false} className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800">Top Post Clusters</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {clusterStats.map((cluster) => (
                      <div key={cluster.label} className="rounded-xl border border-gray-200 bg-white/80 p-3">
                        <p className="text-sm font-semibold text-gray-900">{cluster.label}</p>
                        <p className="mt-1 text-xs text-gray-600">{cluster.posts.length} posts • {formatNumber(cluster.interactions)} interactions • {formatEMV(cluster.emv)}</p>
                        {cluster.topPost && (
                          <div className="mt-2 flex items-start gap-2">
                            <img src={postThumb(cluster.topPost)} alt={cluster.label} className="h-12 w-12 rounded-lg object-cover" />
                            <p className="line-clamp-2 text-xs text-gray-700">{cluster.topPost.caption || 'No caption available.'}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === 'benchmarks' && (
              <div className="space-y-5">
                <GlassCard hover={false} className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <GlassPill
                      active={benchmarkMode === 'all-events'}
                      onClick={() => setBenchmarkMode('all-events')}
                      className="pf-chip-compact"
                    >
                      Across All St. Jude Events
                    </GlassPill>
                    <GlassPill
                      active={benchmarkMode === 'event-type'}
                      onClick={() => setBenchmarkMode('event-type')}
                      className="pf-chip-compact"
                    >
                      By Event Type
                    </GlassPill>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-gray-600">Leaderboard Metric:</span>
                    <GlassPill active={leaderboardMetric === 'interactions'} onClick={() => setLeaderboardMetric('interactions')} className="pf-chip-compact">Interactions</GlassPill>
                    <GlassPill active={leaderboardMetric === 'emv'} onClick={() => setLeaderboardMetric('emv')} className="pf-chip-compact">EMV</GlassPill>
                    <GlassPill active={leaderboardMetric === 'engagement'} onClick={() => setLeaderboardMetric('engagement')} className="pf-chip-compact">ER</GlassPill>
                  </div>
                </GlassCard>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MetricCard
                    title="Median (p50)"
                    value={benchmarkPercentiles.p50}
                    subtitle="St. Jude benchmark median"
                    format={leaderboardMetric === 'engagement' ? formatPercent : leaderboardMetric === 'emv' ? formatEMV : formatNumber}
                  />
                  <MetricCard
                    title="p75"
                    value={benchmarkPercentiles.p75}
                    subtitle="Upper quartile"
                    format={leaderboardMetric === 'engagement' ? formatPercent : leaderboardMetric === 'emv' ? formatEMV : formatNumber}
                  />
                  <MetricCard
                    title="p90"
                    value={benchmarkPercentiles.p90}
                    subtitle="Top decile"
                    format={leaderboardMetric === 'engagement' ? formatPercent : leaderboardMetric === 'emv' ? formatEMV : formatNumber}
                  />
                </div>

                <GlassCard hover={false} className="p-4">
                  <h3 className="text-sm font-semibold text-gray-800">Leaderboard</h3>
                  <div className="mt-3 space-y-2">
                    {leaderboard.map((row, index) => {
                      const liftValue = row.engagement;
                      const isHighLift = liftValue >= getPercentile(leaderboard.map((r) => r.engagement), 75);
                      const isHighVolume = row.volume >= getPercentile(leaderboard.map((r) => r.volume), 75);
                      const metricValue = leaderboardMetric === 'interactions'
                        ? formatNumber(row.interactions)
                        : leaderboardMetric === 'emv'
                          ? formatEMV(row.emv)
                          : formatPercent(row.engagement);

                      return (
                        <div key={row.label} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/80 px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{index + 1}. {row.label}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                              {isHighLift && <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">High Lift</span>}
                              {isHighVolume && <span className="rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">High Volume</span>}
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{metricValue}</p>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            )}
          </TabTransition>
        )}
      </main>

      <DrawerPanel
        open={eventDrawerOpen}
        onClose={() => setEventDrawerOpen(false)}
        title={selectedEventSummary ? selectedEventSummary.name : 'Event Detail'}
        side={drawerSide}
      >
        {selectedEventSummary ? (
          <div className="space-y-4">
            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Top Post</p>
              {selectedEventSummary.posts.length ? (
                (() => {
                  const top = getTopPost(selectedEventSummary.posts);
                  return top ? (
                    <div className="mt-2 space-y-2">
                      <img src={postThumb(top)} alt="Top event post" className="h-44 w-full rounded-xl object-cover" />
                      <p className="line-clamp-3 text-sm text-gray-700">{top.caption || 'No caption available.'}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <MetricBlock label="Interactions" value={formatNumber(top.interactions)} />
                        <MetricBlock label="ER" value={formatPercent(top.engagementRate)} />
                        <MetricBlock label="EMV" value={formatEMV(top.emv)} />
                      </div>
                    </div>
                  ) : null;
                })()
              ) : (
                <p className="mt-2 text-sm text-gray-500">No posts for this event.</p>
              )}
            </GlassCard>

            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Top 10 Posts</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {selectedEventSummary.posts
                  .slice()
                  .sort((a, b) => b.interactions - a.interactions)
                  .slice(0, 10)
                  .map((post) => (
                    <a key={post.id} href={post.permalink || undefined} target="_blank" rel="noreferrer" className="rounded-xl border border-gray-200 bg-white p-2 transition hover:border-[#C8102E]/40">
                      <img src={postThumb(post)} alt={post.caption || 'Post'} className="h-24 w-full rounded-lg object-cover" />
                      <p className="mt-1 line-clamp-2 text-xs text-gray-700">{post.caption || 'No caption'}</p>
                      <p className="mt-1 text-[11px] font-semibold text-gray-800">{formatNumber(post.interactions)} interactions</p>
                    </a>
                  ))}
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Top Athletes</p>
              <div className="mt-2 space-y-2">
                {Array.from(
                  selectedEventSummary.posts.reduce((map, post) => {
                    post.partners.forEach((partner) => {
                      map.set(partner, (map.get(partner) || 0) + post.interactions);
                    });
                    return map;
                  }, new Map<string, number>())
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 6)
                  .map(([name, interactions]) => (
                    <div key={name} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5 text-sm">
                      <span className="text-gray-800">{displayHandle(name)}</span>
                      <span className="font-semibold text-gray-900">{formatNumber(interactions)}</span>
                    </div>
                  ))}
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Platform Breakdown</p>
              <div className="mt-2">
                <MiniBarChart
                  data={Array.from(selectedEventSummary.posts.reduce((map, post) => {
                    map.set(post.source, (map.get(post.source) || 0) + post.interactions);
                    return map;
                  }, new Map<string, number>())).map(([label, value]) => ({ label, value }))}
                  valueFormatter={formatNumber}
                />
                <ChartCaption text="Interaction totals by platform for this event." />
              </div>
            </GlassCard>
          </div>
        ) : (
          <SkeletonLoader lines={6} />
        )}
      </DrawerPanel>

      <DrawerPanel
        open={athleteDrawerOpen}
        onClose={() => setAthleteDrawerOpen(false)}
        title={selectedAthlete ? displayHandle(selectedAthlete.name) : 'Athlete Detail'}
        side={drawerSide}
      >
        {selectedAthlete ? (
          <div className="space-y-4">
            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Performance Distribution</p>
              <div className="mt-2">
                <DistributionBars values={selectedAthlete.posts.map((post) => post.interactions)} />
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Top Posts</p>
              <div className="mt-2 space-y-2">
                {selectedAthlete.posts
                  .slice()
                  .sort((a, b) => b.interactions - a.interactions)
                  .slice(0, 8)
                  .map((post) => (
                    <a key={post.id} href={post.permalink || undefined} target="_blank" rel="noreferrer" className="flex gap-2 rounded-lg border border-gray-200 bg-white p-2 transition hover:border-[#C8102E]/40">
                      <img src={postThumb(post)} alt={post.caption || 'Post'} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs text-gray-700">{post.caption || 'No caption'}</p>
                        <p className="mt-1 text-[11px] font-semibold text-gray-800">{formatNumber(post.interactions)} interactions • {formatEMV(post.emv)}</p>
                      </div>
                    </a>
                  ))}
              </div>
            </GlassCard>

            <GlassCard hover={false} className="p-3">
              <p className="text-xs uppercase tracking-[0.1em] text-gray-500">Event Participation</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedAthlete.events.map((event) => (
                  <span key={event} className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{event}</span>
                ))}
              </div>
            </GlassCard>
          </div>
        ) : (
          <SkeletonLoader lines={6} />
        )}
      </DrawerPanel>

      <button
        onClick={() => {
          setSelectedEvent('All Events');
          setSelectedPlatform('All Platforms');
          setStartDate('');
          setEndDate('');
          setAthleteQuery('');
          setContentScope('all');
        }}
        className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full border border-[#C8102E]/30 bg-white/90 px-4 py-2 text-sm font-semibold text-[#991B1B] shadow-lg backdrop-blur-md transition hover:bg-white"
      >
        <X className="h-4 w-4" /> Reset Filters
      </button>
    </div>
  );
}
