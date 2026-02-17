import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  CircleAlert,
  FileText,
  Flame,
  ListFilter,
  Medal,
  Search,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

interface StJudeSummary {
  total_events?: number;
  total_athletes_tracked?: number;
  total_posts_collected?: number;
  platforms_tracked?: string[];
  date_range?: string;
  key_hashtags?: string[];
  engagement_metrics_note?: string;
  data_limitations?: string[];
}

interface StJudePost {
  post_url: string;
  platform?: string;
  timestamp?: string;
  caption?: string;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  views?: number | null;
  event_related_tags?: string[];
}

interface StJudeAthlete {
  name: string;
  role?: string;
  platforms?: Record<string, string>;
  career_fundraising?: number;
  posts?: StJudePost[];
}

interface StJudeEvent {
  name: string;
  date?: string;
  location?: string;
  description?: string;
  event_url?: string;
  participants?: number | string;
  funds_raised?: number | null;
  broadcast?: string;
  presenting_sponsor?: string;
  athletes?: StJudeAthlete[];
}

interface StJudeDataset {
  data_collection_date?: string;
  data_scope?: string;
  summary?: StJudeSummary;
  events?: StJudeEvent[];
}

interface FlatPost {
  id: string;
  eventKey: string;
  eventName: string;
  eventDateLabel: string;
  eventDateStart: Date | null;
  eventDateEnd: Date | null;
  athleteName: string;
  athleteRole: string;
  isOfficialAccount: boolean;
  platform: string;
  timestamp: string;
  timestampDate: Date | null;
  caption: string;
  url: string;
  hashtags: string[];
  likes: number | null;
  comments: number | null;
  shares: number | null;
  views: number | null;
  contentType: 'video' | 'photo' | 'unknown';
  interactionsObserved: number | null;
  emvObserved: number | null;
  engagementRateObserved: number | null;
}

interface EventAggregate {
  key: string;
  name: string;
  dateLabel: string;
  startDate: Date | null;
  endDate: Date | null;
  location: string;
  description: string;
  eventUrl: string;
  posts: FlatPost[];
  platforms: string[];
  interactionsObserved: number | null;
  emvObserved: number | null;
}

interface AthleteAggregate {
  name: string;
  role: string;
  posts: FlatPost[];
  events: string[];
  interactionsObserved: number | null;
  emvObserved: number | null;
  avgEngagementObserved: number | null;
}

type TabId = 'brief' | 'events' | 'athletes' | 'content' | 'benchmarks';
type AthleteSort = 'interactions' | 'emv' | 'posts' | 'er';
type ContentOwnerScope = 'official' | 'partner';

const DATA_SOURCES = ['/mnt/data/stjude_social_impact_data.json', '/data/stjude_social_impact_data.json'];

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'brief', label: 'Executive Brief' },
  { id: 'events', label: 'Events & Campaigns' },
  { id: 'athletes', label: 'Athlete Partners' },
  { id: 'content', label: 'Content Intelligence' },
  { id: 'benchmarks', label: 'Benchmarks' },
];

function toTitleCase(text: string): string {
  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseEventDateRange(dateLabel?: string): { start: Date | null; end: Date | null } {
  if (!dateLabel) return { start: null, end: null };
  const normalized = dateLabel.trim();
  if (normalized.includes('to')) {
    const [startRaw, endRaw] = normalized.split('to').map((item) => item.trim());
    return { start: parseDate(startRaw), end: parseDate(endRaw) };
  }
  const single = parseDate(normalized);
  return { start: single, end: single };
}

function detectContentType(postUrl: string, platform: string): 'video' | 'photo' | 'unknown' {
  const normalized = postUrl.toLowerCase();
  if (platform === 'tiktok') return 'video';
  if (normalized.includes('/reel/') || normalized.includes('/video/')) return 'video';
  if (normalized.includes('/p/')) return 'photo';
  return 'unknown';
}

function sumNullable(values: Array<number | null>): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (!known.length) return null;
  return known.reduce((sum, value) => sum + value, 0);
}

function averageNullable(values: Array<number | null>): number | null {
  const known = values.filter((value): value is number => value !== null);
  if (!known.length) return null;
  return known.reduce((sum, value) => sum + value, 0) / known.length;
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatDateForDisplay(value: Date | null): string {
  if (!value) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(value);
}

function metricDisplay(value: number | null | undefined, formatter: (value: number) => string): { text: string; pending: boolean } {
  if (value === null || value === undefined) return { text: '—', pending: true };
  return { text: formatter(value), pending: false };
}

function PendingMetric({
  label,
  value,
  formatter,
}: {
  label: string;
  value: number | null | undefined;
  formatter: (value: number) => string;
}) {
  const metric = metricDisplay(value, formatter);
  return (
    <div className="sj-metric-row">
      <span className="sj-metric-label">{label}</span>
      <span className="sj-metric-value" title={metric.pending ? 'Pending data.' : undefined}>
        {metric.text}
      </span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  return <span className="sj-rank-badge">#{rank}</span>;
}

function TabPanel({ children, tabKey }: { children: React.ReactNode; tabKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function SegmentedPillBars({
  items,
  valueLabel,
}: {
  items: Array<{ label: string; value: number }>;
  valueLabel: (value: number) => string;
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="sj-pill-bars">
      {items.map((item) => {
        const width = total > 0 ? (item.value / total) * 100 : 0;
        return (
          <div key={item.label} className="sj-pill-row" title={`${item.label}: ${valueLabel(item.value)}`}>
            <div className="sj-pill-meta">
              <span>{item.label}</span>
              <span>{valueLabel(item.value)}</span>
            </div>
            <div className="sj-pill-track">
              <div className="sj-pill-fill" style={{ width: `${Math.max(4, width)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DataCompletenessRing({ availableCount, totalCount }: { availableCount: number; totalCount: number }) {
  const ratio = totalCount > 0 ? availableCount / totalCount : 0;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <div className="sj-ring-wrap">
      <svg className="sj-ring" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r="42" className="sj-ring-track" />
        <circle
          cx="60"
          cy="60"
          r="42"
          className="sj-ring-value"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div className="sj-ring-center">
        <div className="sj-ring-percent">{Math.round(ratio * 100)}%</div>
        <div className="sj-ring-label">Engagement visibility</div>
      </div>
    </div>
  );
}

function extractPlatformHandle(athlete: StJudeAthlete): string {
  const instagram = athlete.platforms?.instagram;
  if (instagram && instagram !== 'Not specified') return instagram;
  return athlete.name;
}

function PostCard({ post, showEventTag = true }: { post: FlatPost; showEventTag?: boolean }) {
  const interactions = metricDisplay(post.interactionsObserved, formatCompactNumber);
  const emv = metricDisplay(post.emvObserved, formatCurrency);
  const likes = metricDisplay(post.likes, formatCompactNumber);
  const comments = metricDisplay(post.comments, formatCompactNumber);
  const shares = metricDisplay(post.shares, formatCompactNumber);
  const er = metricDisplay(post.engagementRateObserved, formatPercent);

  return (
    <article className="sj-post-card">
      <div className="sj-post-thumb-wrap">
        <img src="/st-jude-logo.svg" alt="St. Jude" className="sj-post-thumb" />
        <span className="sj-post-badge">{toTitleCase(post.platform)}</span>
        {showEventTag && <span className="sj-post-chip">{post.eventName}</span>}
      </div>

      <div className="sj-post-content">
        <p className="sj-post-caption">{post.caption || 'Caption not available.'}</p>
        <div className="sj-post-meta">
          <span>{formatDateForDisplay(post.timestampDate)}</span>
          <span>{post.contentType}</span>
        </div>

        <div className="sj-post-metrics">
          <span title={interactions.pending ? 'Pending data.' : undefined}>Int: {interactions.text}</span>
          <span title={er.pending ? 'Pending data.' : undefined}>ER: {er.text}</span>
          <span title={emv.pending ? 'Pending data.' : undefined}>EMV: {emv.text}</span>
          <span title={likes.pending ? 'Pending data.' : undefined}>Likes: {likes.text}</span>
          <span title={comments.pending ? 'Pending data.' : undefined}>Comments: {comments.text}</span>
          <span title={shares.pending ? 'Pending data.' : undefined}>Shares: {shares.text}</span>
        </div>

        <a href={post.url} target="_blank" rel="noreferrer" className="sj-post-link">
          View source
        </a>
      </div>
    </article>
  );
}

export function StJudeAthleteEventImpactReport({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('brief');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataset, setDataset] = useState<StJudeDataset | null>(null);

  const [eventFilter, setEventFilter] = useState('All Events');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [eventSearch, setEventSearch] = useState('');
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null);

  const [athleteSort, setAthleteSort] = useState<AthleteSort>('interactions');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteAggregate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [contentScope, setContentScope] = useState<ContentOwnerScope>('official');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'video' | 'photo' | 'unknown'>('all');

  const [definitionsOpen, setDefinitionsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);

      for (const source of DATA_SOURCES) {
        try {
          const response = await fetch(source);
          if (!response.ok) continue;
          const json = (await response.json()) as StJudeDataset;
          if (!cancelled) {
            setDataset(json);
            setLoading(false);
          }
          return;
        } catch {
          continue;
        }
      }

      if (!cancelled) {
        setError('Unable to load St. Jude social impact data.');
        setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const flatPosts = useMemo<FlatPost[]>(() => {
    if (!dataset?.events) return [];

    const rows: FlatPost[] = [];
    dataset.events.forEach((event, eventIndex) => {
      const dateRange = parseEventDateRange(event.date);
      const eventKey = `${event.name}-${event.date || eventIndex}`;

      (event.athletes || []).forEach((athlete, athleteIndex) => {
        const author = extractPlatformHandle(athlete);
        const normalized = author.toLowerCase();
        const isOfficial = normalized.includes('stjude') || athlete.name.toLowerCase().includes('official');

        (athlete.posts || []).forEach((post, postIndex) => {
          const likes = typeof post.likes === 'number' ? post.likes : null;
          const comments = typeof post.comments === 'number' ? post.comments : null;
          const shares = typeof post.shares === 'number' ? post.shares : null;
          const views = typeof post.views === 'number' ? post.views : null;

          const interactionParts = [likes, comments, shares].filter((value): value is number => value !== null);
          const interactionsObserved = interactionParts.length ? interactionParts.reduce((sum, value) => sum + value, 0) : null;

          const emvObserved = likes !== null || comments !== null
            ? (likes ?? 0) * 0.5 + (comments ?? 0) * 1.5
            : null;

          const engagementRateObserved = views && interactionsObserved !== null && views > 0
            ? interactionsObserved / views
            : null;

          const timestampDate = parseDate(post.timestamp);
          rows.push({
            id: `${eventIndex}-${athleteIndex}-${postIndex}`,
            eventKey,
            eventName: event.name,
            eventDateLabel: event.date || 'Unknown date',
            eventDateStart: dateRange.start,
            eventDateEnd: dateRange.end,
            athleteName: author,
            athleteRole: athlete.role || 'Ambassador',
            isOfficialAccount: isOfficial,
            platform: (post.platform || 'unknown').toLowerCase(),
            timestamp: post.timestamp || '',
            timestampDate,
            caption: post.caption || '',
            url: post.post_url,
            hashtags: post.event_related_tags || [],
            likes,
            comments,
            shares,
            views,
            contentType: detectContentType(post.post_url, (post.platform || 'unknown').toLowerCase()),
            interactionsObserved,
            emvObserved,
            engagementRateObserved,
          });
        });
      });
    });

    return rows;
  }, [dataset]);

  const allEvents = useMemo<EventAggregate[]>(() => {
    if (!dataset?.events) return [];

    return dataset.events.map((event, index) => {
      const eventKey = `${event.name}-${event.date || index}`;
      const eventPosts = flatPosts.filter((post) => post.eventKey === eventKey);
      const dateRange = parseEventDateRange(event.date);

      return {
        key: eventKey,
        name: event.name,
        dateLabel: event.date || 'Unknown date',
        startDate: dateRange.start,
        endDate: dateRange.end,
        location: event.location || 'Unknown location',
        description: event.description || '',
        eventUrl: event.event_url || '',
        posts: eventPosts,
        platforms: Array.from(new Set(eventPosts.map((post) => post.platform))),
        interactionsObserved: sumNullable(eventPosts.map((post) => post.interactionsObserved)),
        emvObserved: sumNullable(eventPosts.map((post) => post.emvObserved)),
      };
    });
  }, [dataset, flatPosts]);

  const eventOptions = useMemo(() => {
    const names = Array.from(new Set(allEvents.map((event) => event.name)));
    return ['All Events', ...names];
  }, [allEvents]);

  const platformOptions = useMemo(() => {
    const platforms = Array.from(new Set(flatPosts.map((post) => post.platform))).sort();
    return ['All Platforms', ...platforms.map((platform) => toTitleCase(platform))];
  }, [flatPosts]);

  const filteredPosts = useMemo(() => {
    return flatPosts.filter((post) => {
      if (eventFilter !== 'All Events' && post.eventName !== eventFilter) return false;
      if (platformFilter !== 'All Platforms' && toTitleCase(post.platform) !== platformFilter) return false;

      if (startDate) {
        const start = new Date(startDate);
        if (post.timestampDate && post.timestampDate < start) return false;
      }

      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`);
        if (post.timestampDate && post.timestampDate > end) return false;
      }

      return true;
    });
  }, [flatPosts, eventFilter, platformFilter, startDate, endDate]);

  const filteredEvents = useMemo(() => {
    return allEvents
      .map((event) => ({
        ...event,
        posts: filteredPosts.filter((post) => post.eventKey === event.key),
      }))
      .filter((event) => (eventFilter === 'All Events' ? true : event.name === eventFilter));
  }, [allEvents, filteredPosts, eventFilter]);

  const eventListForTab = useMemo(() => {
    const query = eventSearch.trim().toLowerCase();
    return filteredEvents
      .filter((event) => (query ? event.name.toLowerCase().includes(query) : true))
      .map((event) => ({
        ...event,
        interactionsObserved: sumNullable(event.posts.map((post) => post.interactionsObserved)),
        emvObserved: sumNullable(event.posts.map((post) => post.emvObserved)),
      }));
  }, [filteredEvents, eventSearch]);

  const selectedEvent = useMemo(() => {
    if (!eventListForTab.length) return null;
    if (!selectedEventKey) return eventListForTab[0];
    return eventListForTab.find((event) => event.key === selectedEventKey) || eventListForTab[0];
  }, [eventListForTab, selectedEventKey]);

  const athleteAggregates = useMemo<AthleteAggregate[]>(() => {
    const bucket = new Map<string, FlatPost[]>();
    const roleMap = new Map<string, string>();

    filteredPosts.forEach((post) => {
      if (!bucket.has(post.athleteName)) bucket.set(post.athleteName, []);
      bucket.get(post.athleteName)?.push(post);
      if (!roleMap.has(post.athleteName)) roleMap.set(post.athleteName, post.athleteRole);
    });

    const rows = Array.from(bucket.entries()).map(([name, posts]) => ({
      name,
      role: roleMap.get(name) || 'Ambassador',
      posts,
      events: Array.from(new Set(posts.map((post) => post.eventName))),
      interactionsObserved: sumNullable(posts.map((post) => post.interactionsObserved)),
      emvObserved: sumNullable(posts.map((post) => post.emvObserved)),
      avgEngagementObserved: averageNullable(posts.map((post) => post.engagementRateObserved)),
    }));

    const sortValue = (row: AthleteAggregate): number => {
      if (athleteSort === 'interactions') return row.interactionsObserved ?? -1;
      if (athleteSort === 'emv') return row.emvObserved ?? -1;
      if (athleteSort === 'er') return row.avgEngagementObserved ?? -1;
      return row.posts.length;
    };

    return rows.sort((a, b) => sortValue(b) - sortValue(a));
  }, [filteredPosts, athleteSort]);

  const officialPosts = useMemo(() => filteredPosts.filter((post) => post.isOfficialAccount), [filteredPosts]);
  const partnerPosts = useMemo(() => filteredPosts.filter((post) => !post.isOfficialAccount), [filteredPosts]);

  const contentPosts = useMemo(() => {
    const source = contentScope === 'official' ? officialPosts : partnerPosts;
    return source.filter((post) => (contentTypeFilter === 'all' ? true : post.contentType === contentTypeFilter));
  }, [contentScope, contentTypeFilter, officialPosts, partnerPosts]);

  const impactStack = useMemo(() => {
    const totalPosts = filteredPosts.length;
    const totalInteractions = sumNullable(filteredPosts.map((post) => post.interactionsObserved));
    const avgEr = averageNullable(filteredPosts.map((post) => post.engagementRateObserved));
    const totalEmv = sumNullable(filteredPosts.map((post) => post.emvObserved));

    const uniqueAthletes = new Set(filteredPosts.map((post) => post.athleteName)).size;
    const campaigns = new Set(filteredPosts.map((post) => post.eventKey)).size;

    return {
      totalPosts,
      totalInteractions,
      avgEr,
      totalEmv,
      uniqueAthletes,
      campaigns,
    };
  }, [filteredPosts]);

  const topEvent = useMemo(() => {
    const candidates = filteredEvents
      .map((event) => ({
        ...event,
        interactionsObserved: sumNullable(event.posts.map((post) => post.interactionsObserved)),
        emvObserved: sumNullable(event.posts.map((post) => post.emvObserved)),
      }))
      .filter((event) => event.posts.length > 0);

    return candidates.sort((a, b) => (b.interactionsObserved ?? -1) - (a.interactionsObserved ?? -1))[0] || null;
  }, [filteredEvents]);

  const topAthlete = useMemo(() => {
    return [...athleteAggregates].sort((a, b) => (b.emvObserved ?? -1) - (a.emvObserved ?? -1))[0] || null;
  }, [athleteAggregates]);

  const topPostsByInteractions = useMemo(() => {
    return [...filteredPosts].sort((a, b) => (b.interactionsObserved ?? -1) - (a.interactionsObserved ?? -1));
  }, [filteredPosts]);

  const topPost = topPostsByInteractions[0] || null;

  const insightCards = useMemo(() => {
    const insights: Array<{ title: string; detail: string; pending?: boolean; icon: ReactNode }> = [];

    const byType = new Map<string, number[]>();
    filteredPosts.forEach((post) => {
      if (post.interactionsObserved === null) return;
      if (!byType.has(post.contentType)) byType.set(post.contentType, []);
      byType.get(post.contentType)?.push(post.interactionsObserved);
    });

    if (byType.size >= 2) {
      const rows = Array.from(byType.entries()).map(([type, values]) => ({
        type,
        avg: values.reduce((sum, value) => sum + value, 0) / values.length,
      }));
      rows.sort((a, b) => b.avg - a.avg);
      insights.push({
        icon: <FileText size={16} />,
        title: `${toTitleCase(rows[0].type)} posts lead observed interactions.`,
        detail: `${toTitleCase(rows[0].type)} averages ${formatCompactNumber(rows[0].avg)} observed interactions per post in this view, ahead of ${toTitleCase(rows[rows.length - 1].type)} at ${formatCompactNumber(rows[rows.length - 1].avg)}.`,
      });
    } else {
      insights.push({
        icon: <FileText size={16} />,
        title: 'Pending: format breakdown.',
        detail: 'Insufficient interaction visibility by content format to compare video/photo/carousel effects.',
        pending: true,
      });
    }

    if (partnerPosts.length > 0) {
      const partnerInteractions = sumNullable(partnerPosts.map((post) => post.interactionsObserved));
      const officialInteractions = sumNullable(officialPosts.map((post) => post.interactionsObserved));
      insights.push({
        icon: <Users size={16} />,
        title: 'Partner-authored content contributes measurable interaction volume.',
        detail: `Observed interactions: partner/athlete posts ${partnerInteractions !== null ? formatCompactNumber(partnerInteractions) : '—'} vs St. Jude account posts ${officialInteractions !== null ? formatCompactNumber(officialInteractions) : '—'}.`,
      });
    } else {
      insights.push({
        icon: <Users size={16} />,
        title: 'Pending: partner-handle contribution.',
        detail: 'Awaiting partner/athlete post ingest to measure collaboration impact against St. Jude-owned posts.',
        pending: true,
      });
    }

    if (topEvent && impactStack.totalInteractions) {
      const share = topEvent.interactionsObserved !== null
        ? (topEvent.interactionsObserved / impactStack.totalInteractions) * 100
        : null;
      insights.push({
        icon: <Trophy size={16} />,
        title: 'Performance concentration is event-driven.',
        detail: `${topEvent.name} accounts for ${share !== null ? `${share.toFixed(1)}%` : '—'} of observed interactions in the current filter window.`,
      });
    } else {
      insights.push({
        icon: <Trophy size={16} />,
        title: 'Pending: concentration analysis.',
        detail: 'Top-event share will populate as more interaction fields are available.',
        pending: true,
      });
    }

    const athleteByInteractions = athleteAggregates
      .filter((athlete) => athlete.interactionsObserved !== null)
      .sort((a, b) => (b.interactionsObserved ?? 0) - (a.interactionsObserved ?? 0));

    if (athleteByInteractions.length >= 3 && impactStack.totalInteractions) {
      const top10 = athleteByInteractions.slice(0, 10);
      const top10Interactions = top10.reduce((sum, athlete) => sum + (athlete.interactionsObserved ?? 0), 0);
      const share = (top10Interactions / impactStack.totalInteractions) * 100;
      insights.push({
        icon: <Medal size={16} />,
        title: 'Athlete contribution is concentrated in a small top tier.',
        detail: `Top 10 athlete partners represent ${share.toFixed(1)}% of observed interactions across filtered posts.`,
      });
    } else {
      insights.push({
        icon: <Medal size={16} />,
        title: 'Pending: athlete contribution distribution.',
        detail: 'Need broader visible interaction coverage to quantify top-10 partner share.',
        pending: true,
      });
    }

    return insights.slice(0, 6);
  }, [filteredPosts, partnerPosts, officialPosts, topEvent, impactStack.totalInteractions, athleteAggregates]);

  const availableEngagementCells = useMemo(() => {
    return filteredPosts.reduce((sum, post) => {
      const fields = [post.likes, post.comments, post.shares, post.views];
      const known = fields.filter((value) => value !== null).length;
      return sum + known;
    }, 0);
  }, [filteredPosts]);

  const totalEngagementCells = filteredPosts.length * 4;

  const eventFootprint = useMemo(() => {
    if (!selectedEvent) return [] as Array<{ label: string; value: number }>;
    const bucket = new Map<string, number>();
    selectedEvent.posts.forEach((post) => {
      const key = toTitleCase(post.platform);
      bucket.set(key, (bucket.get(key) || 0) + 1);
    });
    return Array.from(bucket.entries()).map(([label, value]) => ({ label, value }));
  }, [selectedEvent]);

  const contentTypeOptions = useMemo(() => {
    const options = Array.from(new Set(filteredPosts.map((post) => post.contentType)));
    return ['all', ...options] as Array<'all' | 'video' | 'photo' | 'unknown'>;
  }, [filteredPosts]);

  const benchmarkUiRows = [
    {
      title: 'Engagement rate distribution',
      description: 'Would compare p50 / p75 / p90 engagement rate against selected benchmark set.',
    },
    {
      title: 'EMV per post',
      description: 'Would compare observed EMV per post against peer median and top quartile.',
    },
    {
      title: 'Platform mix',
      description: 'Would compare contribution share by platform against external benchmark cohorts.',
    },
  ];

  const coverageWindowLabel = useMemo(() => {
    const datedPosts = filteredPosts
      .map((post) => post.timestampDate)
      .filter((date): date is Date => date !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (!datedPosts.length) return 'No dated posts in current view';
    return `${formatDateForDisplay(datedPosts[0])} to ${formatDateForDisplay(datedPosts[datedPosts.length - 1])}`;
  }, [filteredPosts]);

  const pending = loading;
  const hasNoData = !loading && !error && filteredPosts.length === 0;

  return (
    <div className="sj-page" style={{ ['--sj-red' as string]: '#c8102e' }}>
      <style>{`
        .sj-page {
          color: #1f2937;
          background:
            radial-gradient(1000px 420px at 0% -10%, rgba(200,16,46,0.11), transparent 65%),
            linear-gradient(180deg, #fffdfb 0%, #fffdfc 60%, #f9f7f6 100%);
          min-height: 100vh;
          font-family: "Inter", "Avenir Next", "Segoe UI", sans-serif;
        }

        .sj-shell {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 18px 28px;
        }

        .sj-top {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(255, 252, 251, 0.8);
          border-bottom: 1px solid rgba(194, 178, 175, 0.3);
        }

        .sj-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 10px 18px;
          max-width: 1380px;
          margin: 0 auto;
        }

        .sj-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .sj-brand img {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid rgba(160, 139, 136, 0.25);
          background: white;
        }

        .sj-brand-meta {
          min-width: 0;
        }

        .sj-brand-name {
          font-weight: 650;
          font-size: 13px;
          letter-spacing: 0.02em;
          color: #111827;
        }

        .sj-report-title {
          font-size: 12px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sj-tabbar {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0 18px 10px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .sj-tabbar::-webkit-scrollbar { display: none; }

        .sj-tabs {
          display: flex;
          gap: 8px;
          min-width: max-content;
        }

        .sj-tab {
          border: 1px solid rgba(180, 163, 160, 0.4);
          background: rgba(255,255,255,0.7);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          color: #4b5563;
          transition: all 180ms ease;
        }

        .sj-tab:hover {
          transform: translateY(-1px);
          border-color: rgba(200,16,46,0.35);
        }

        .sj-tab.active {
          background: rgba(200,16,46,0.1);
          color: var(--sj-red);
          border-color: rgba(200,16,46,0.4);
        }

        .sj-filter-row {
          position: sticky;
          top: 105px;
          z-index: 45;
          margin-top: 8px;
          border: 1px solid rgba(186, 171, 168, 0.4);
          background: rgba(255,255,255,0.72);
          border-radius: 16px;
          padding: 10px;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .sj-filter-grid {
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .sj-control {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 11px;
          color: #6b7280;
        }

        .sj-control input,
        .sj-control select {
          border: 1px solid rgba(174, 161, 158, 0.45);
          background: rgba(255,255,255,0.92);
          color: #111827;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 12px;
          outline: none;
        }

        .sj-main { margin-top: 16px; }

        .sj-block {
          border: 1px solid rgba(195, 178, 175, 0.32);
          background: rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          box-shadow: 0 12px 28px rgba(35, 24, 24, 0.06);
        }

        .sj-hero {
          display: grid;
          grid-template-columns: 1.25fr 0.85fr;
          gap: 16px;
          padding: 24px;
        }

        .sj-kicker {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #7c7a77;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .sj-headline {
          margin: 0;
          font-size: clamp(28px, 4vw, 48px);
          letter-spacing: -0.02em;
          line-height: 1.05;
          color: #141414;
          font-weight: 700;
          max-width: 680px;
        }

        .sj-dek {
          margin-top: 12px;
          max-width: 640px;
          color: #4b5563;
          font-size: 15px;
          line-height: 1.55;
        }

        .sj-impact-stack {
          border: 1px solid rgba(194, 177, 174, 0.45);
          background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,250,249,0.84));
          border-radius: 20px;
          padding: 14px;
          display: grid;
          gap: 8px;
        }

        .sj-metric-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          border-bottom: 1px dashed rgba(197, 182, 179, 0.55);
          padding-bottom: 6px;
        }

        .sj-metric-row:last-child { border-bottom: none; }

        .sj-metric-label {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #78716c;
          font-weight: 600;
        }

        .sj-metric-value {
          font-size: 18px;
          letter-spacing: -0.02em;
          color: #111827;
          font-weight: 650;
        }

        .sj-data-sculpture {
          margin-top: 12px;
          border-radius: 18px;
          border: 1px solid rgba(189,171,168,0.45);
          background: rgba(255,255,255,0.75);
          padding: 12px;
        }

        .sj-ring-wrap {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }

        .sj-ring {
          width: 120px;
          height: 120px;
          transform: rotate(-90deg);
        }

        .sj-ring-track {
          fill: none;
          stroke: rgba(203, 186, 184, 0.5);
          stroke-width: 10;
        }

        .sj-ring-value {
          fill: none;
          stroke: var(--sj-red);
          stroke-width: 10;
          stroke-linecap: round;
          transition: stroke-dashoffset 360ms ease;
        }

        .sj-ring-center {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          text-align: center;
        }

        .sj-ring-percent {
          font-size: 21px;
          font-weight: 680;
          color: #1f2937;
        }

        .sj-ring-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
        }

        .sj-triple {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .sj-tile {
          border-radius: 18px;
          border: 1px solid rgba(197,180,177,0.38);
          background: rgba(255,255,255,0.83);
          padding: 14px;
          min-height: 172px;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .sj-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(37, 29, 29, 0.08);
        }

        .sj-tile-title {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 600;
        }

        .sj-tile-value {
          font-size: 20px;
          letter-spacing: -0.02em;
          font-weight: 650;
          margin-top: 8px;
          color: #151515;
        }

        .sj-accent-rule {
          width: 36px;
          height: 2px;
          border-radius: 999px;
          background: rgba(200,16,46,0.55);
          margin: 8px 0;
        }

        .sj-post-preview {
          font-size: 13px;
          line-height: 1.45;
          color: #4b5563;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sj-insights {
          margin-top: 14px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 10px;
        }

        .sj-insight {
          border-radius: 16px;
          border: 1px solid rgba(197,181,178,0.38);
          background: rgba(255,255,255,0.78);
          padding: 12px;
        }

        .sj-insight-head {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--sj-red);
          font-weight: 630;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .sj-insight p {
          margin: 0;
          font-size: 13px;
          color: #4b5563;
          line-height: 1.5;
        }

        .sj-insight.pending {
          border-style: dashed;
        }

        .sj-section {
          margin-top: 14px;
          padding: 16px;
        }

        .sj-section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6b7280;
          font-weight: 650;
          margin-bottom: 10px;
        }

        .sj-accordion-btn {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: 1px solid rgba(193,177,174,0.4);
          border-radius: 14px;
          background: rgba(255,255,255,0.8);
          padding: 10px 12px;
          font-size: 13px;
          color: #374151;
          font-weight: 600;
        }

        .sj-accordion-body {
          margin-top: 8px;
          border: 1px solid rgba(193,177,174,0.35);
          border-radius: 14px;
          background: rgba(255,255,255,0.8);
          padding: 12px;
          font-size: 13px;
          color: #4b5563;
          line-height: 1.55;
        }

        .sj-event-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 12px;
        }

        .sj-list-panel,
        .sj-main-panel {
          border: 1px solid rgba(193,177,174,0.35);
          border-radius: 18px;
          background: rgba(255,255,255,0.82);
          padding: 12px;
        }

        .sj-list-search {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(188,172,168,0.45);
          border-radius: 12px;
          padding: 8px 10px;
          margin-bottom: 10px;
        }

        .sj-list-search input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 13px;
          background: transparent;
        }

        .sj-event-list {
          display: grid;
          gap: 8px;
          max-height: 560px;
          overflow: auto;
        }

        .sj-event-card {
          border: 1px solid rgba(191,176,173,0.45);
          border-radius: 12px;
          padding: 10px;
          background: rgba(255,255,255,0.82);
          text-align: left;
          transition: border-color 150ms ease, transform 150ms ease;
        }

        .sj-event-card.active {
          border-color: rgba(200,16,46,0.45);
          background: rgba(200,16,46,0.06);
        }

        .sj-event-card:hover { transform: translateY(-1px); }

        .sj-event-name {
          font-size: 13px;
          font-weight: 620;
          color: #111827;
        }

        .sj-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 6px;
        }

        .sj-chip {
          font-size: 10px;
          border: 1px solid rgba(188,171,168,0.45);
          border-radius: 999px;
          padding: 2px 7px;
          color: #6b7280;
          background: rgba(255,255,255,0.88);
        }

        .sj-event-headline {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
        }

        .sj-event-headline h3 {
          margin: 0;
          font-size: 24px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .sj-subtext {
          margin-top: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .sj-pill-bars {
          display: grid;
          gap: 8px;
          margin-top: 8px;
        }

        .sj-pill-row { display: grid; gap: 5px; }

        .sj-pill-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #4b5563;
        }

        .sj-pill-track {
          height: 8px;
          border-radius: 999px;
          background: rgba(206,191,188,0.45);
          overflow: hidden;
        }

        .sj-pill-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(200,16,46,0.88), rgba(146,15,37,0.88));
          border-radius: 999px;
          transition: width 280ms ease;
        }

        .sj-grid-posts {
          margin-top: 12px;
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(2, minmax(0,1fr));
        }

        .sj-post-card {
          border: 1px solid rgba(194,178,175,0.45);
          border-radius: 14px;
          background: rgba(255,255,255,0.86);
          overflow: hidden;
          transition: transform 160ms ease, box-shadow 160ms ease;
        }

        .sj-post-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(38, 28, 28, 0.08);
        }

        .sj-post-thumb-wrap {
          position: relative;
          background: #f4f4f5;
          height: 112px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .sj-post-thumb {
          width: 56px;
          height: 56px;
          opacity: 0.9;
        }

        .sj-post-badge,
        .sj-post-chip {
          position: absolute;
          font-size: 10px;
          border-radius: 999px;
          padding: 3px 8px;
          font-weight: 600;
          border: 1px solid rgba(194,176,173,0.45);
          background: rgba(255,255,255,0.88);
          color: #5b6068;
        }

        .sj-post-badge { top: 7px; left: 7px; }
        .sj-post-chip { top: 7px; right: 7px; max-width: 60%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .sj-post-content { padding: 10px; }

        .sj-post-caption {
          margin: 0;
          min-height: 36px;
          font-size: 12px;
          color: #374151;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .sj-post-meta {
          margin-top: 6px;
          display: flex;
          gap: 8px;
          color: #6b7280;
          font-size: 11px;
        }

        .sj-post-metrics {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          font-size: 10px;
          color: #4b5563;
        }

        .sj-post-metrics span {
          border: 1px solid rgba(194,178,175,0.4);
          border-radius: 999px;
          padding: 2px 6px;
          background: rgba(255,255,255,0.9);
        }

        .sj-post-link {
          margin-top: 8px;
          display: inline-block;
          font-size: 11px;
          color: var(--sj-red);
          text-decoration: none;
          font-weight: 600;
        }

        .sj-athlete-table-wrap {
          overflow: auto;
          border: 1px solid rgba(194,178,175,0.4);
          border-radius: 16px;
          background: rgba(255,255,255,0.84);
        }

        .sj-athlete-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }

        .sj-athlete-table th {
          text-align: left;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          padding: 10px;
          position: sticky;
          top: 0;
          background: rgba(255,255,255,0.95);
          border-bottom: 1px solid rgba(194,178,175,0.42);
        }

        .sj-athlete-table td {
          padding: 10px;
          border-bottom: 1px solid rgba(221,209,206,0.6);
          font-size: 13px;
          color: #374151;
        }

        .sj-athlete-table tbody tr { cursor: pointer; }

        .sj-athlete-table tbody tr:hover {
          background: rgba(200,16,46,0.05);
        }

        .sj-rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 24px;
          border-radius: 999px;
          border: 1px solid rgba(200,16,46,0.35);
          background: rgba(200,16,46,0.08);
          color: var(--sj-red);
          font-size: 11px;
          font-weight: 650;
        }

        .sj-drawer-bg {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 17, 0.42);
          z-index: 70;
        }

        .sj-drawer {
          position: fixed;
          right: 0;
          top: 0;
          bottom: 0;
          width: min(460px, 96vw);
          background: rgba(255,255,255,0.96);
          border-left: 1px solid rgba(191,174,171,0.45);
          z-index: 80;
          padding: 14px;
          overflow: auto;
        }

        .sj-drawer-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sj-drawer-close {
          border: 1px solid rgba(191,174,171,0.5);
          border-radius: 999px;
          background: white;
          width: 30px;
          height: 30px;
          font-size: 15px;
          color: #4b5563;
        }

        .sj-content-toggle {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .sj-toggle-btn {
          border: 1px solid rgba(190,173,170,0.45);
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          background: rgba(255,255,255,0.86);
          color: #4b5563;
          font-weight: 600;
        }

        .sj-toggle-btn.active {
          border-color: rgba(200,16,46,0.4);
          color: var(--sj-red);
          background: rgba(200,16,46,0.1);
        }

        .sj-faceoff {
          display: grid;
          grid-template-columns: repeat(2, minmax(0,1fr));
          gap: 10px;
          margin-top: 8px;
        }

        .sj-benchmark-shell {
          display: grid;
          gap: 10px;
        }

        .sj-placeholder {
          border: 1px dashed rgba(195,178,175,0.65);
          border-radius: 14px;
          padding: 12px;
          background: rgba(255,255,255,0.82);
        }

        .sj-empty {
          border: 1px dashed rgba(188,170,167,0.72);
          background: rgba(255,255,255,0.75);
          border-radius: 18px;
          padding: 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        .sj-loading,
        .sj-error {
          margin-top: 16px;
          border-radius: 16px;
          border: 1px solid rgba(194,178,175,0.5);
          background: rgba(255,255,255,0.85);
          padding: 16px;
          color: #4b5563;
        }

        @media (max-width: 1080px) {
          .sj-filter-row { top: 146px; }
          .sj-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .sj-hero { grid-template-columns: 1fr; }
          .sj-triple,
          .sj-insights,
          .sj-faceoff,
          .sj-grid-posts { grid-template-columns: 1fr; }
          .sj-event-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 720px) {
          .sj-topbar { padding: 10px 12px; }
          .sj-tabbar { padding: 0 12px 10px; }
          .sj-shell { padding: 0 12px 22px; }
          .sj-filter-row { top: 142px; }
          .sj-drawer {
            left: 0;
            right: 0;
            top: auto;
            width: 100%;
            height: min(82vh, 700px);
            border-left: none;
            border-top: 1px solid rgba(191,174,171,0.45);
            border-radius: 20px 20px 0 0;
          }
        }
      `}</style>

      <header className="sj-top">
        <div className="sj-topbar">
          <div className="sj-brand">
            <button className="sj-toggle-btn" onClick={onBack} aria-label="Back">
              <ArrowLeft size={14} />
            </button>
            <img src="/st-jude-logo.svg" alt="St. Jude" />
            <div className="sj-brand-meta">
              <div className="sj-brand-name">St. Jude</div>
              <div className="sj-report-title">St. Jude Athlete & Event Impact Report • Internal executive brief</div>
            </div>
          </div>
        </div>

        <div className="sj-tabbar">
          <nav className="sj-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sj-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="sj-shell">
        <section className="sj-filter-row">
          <div className="sj-filter-grid">
            <label className="sj-control">
              Event / Campaign
              <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
                {eventOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="sj-control">
              Platform
              <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
                {platformOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="sj-control">
              Start Date
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>

            <label className="sj-control">
              End Date
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
        </section>

        <main className="sj-main">
          {pending && <div className="sj-loading">Loading St. Jude impact dataset...</div>}
          {error && <div className="sj-error">{error}</div>}
          {hasNoData && <div className="sj-empty">No posts are available for the current filters.</div>}

          {!pending && !error && !hasNoData && (
            <TabPanel tabKey={activeTab}>
              {activeTab === 'brief' && (
                <div>
                  <section className="sj-block sj-hero">
                    <div>
                      <p className="sj-kicker">Executive Brief</p>
                      <h1 className="sj-headline">St. Jude Athlete & Event Impact Report</h1>
                      <p className="sj-dek">
                        Performance summary of athlete and event-driven fundraising activations across St. Jude content.
                      </p>
                    </div>

                    <div>
                      <div className="sj-impact-stack">
                        <PendingMetric label="Total Posts" value={impactStack.totalPosts} formatter={formatCompactNumber} />
                        <PendingMetric label="Total Interactions" value={impactStack.totalInteractions} formatter={formatCompactNumber} />
                        <PendingMetric label="Avg Engagement Rate" value={impactStack.avgEr} formatter={formatPercent} />
                        <PendingMetric label="Total EMV" value={impactStack.totalEmv} formatter={formatCurrency} />
                        <PendingMetric label="Unique Athletes" value={impactStack.uniqueAthletes} formatter={formatCompactNumber} />
                        <PendingMetric label="# Campaigns / Events" value={impactStack.campaigns} formatter={formatCompactNumber} />
                      </div>

                      <div className="sj-data-sculpture">
                        <DataCompletenessRing availableCount={availableEngagementCells} totalCount={totalEngagementCells} />
                        <p className="sj-subtext" style={{ textAlign: 'center', marginTop: 6 }}>
                          Engagement fields visible: {availableEngagementCells}/{totalEngagementCells}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="sj-section sj-block">
                    <div className="sj-section-title">Top Performers</div>
                    <div className="sj-triple">
                      <article className="sj-tile">
                        <div className="sj-tile-title">Top Event / Campaign</div>
                        <div className="sj-accent-rule" />
                        <div className="sj-tile-value">{topEvent?.name || '—'}</div>
                        <PendingMetric label="Interactions" value={topEvent?.interactionsObserved ?? null} formatter={formatCompactNumber} />
                        <PendingMetric label="EMV" value={topEvent?.emvObserved ?? null} formatter={formatCurrency} />
                      </article>

                      <article className="sj-tile">
                        <div className="sj-tile-title">Top Athlete Partner</div>
                        <div className="sj-accent-rule" />
                        <div className="sj-tile-value">{topAthlete?.name || '—'}</div>
                        <PendingMetric label="Interactions" value={topAthlete?.interactionsObserved ?? null} formatter={formatCompactNumber} />
                        <PendingMetric label="EMV" value={topAthlete?.emvObserved ?? null} formatter={formatCurrency} />
                      </article>

                      <article className="sj-tile">
                        <div className="sj-tile-title">Top Post</div>
                        <div className="sj-accent-rule" />
                        <div className="sj-post-preview">{topPost?.caption || '—'}</div>
                        <PendingMetric label="Interactions" value={topPost?.interactionsObserved ?? null} formatter={formatCompactNumber} />
                        <PendingMetric label="EMV" value={topPost?.emvObserved ?? null} formatter={formatCurrency} />
                      </article>
                    </div>
                  </section>

                  <section className="sj-section sj-block">
                    <div className="sj-section-title">AI Insights</div>
                    <div className="sj-insights">
                      {insightCards.map((insight, index) => (
                        <article key={`${insight.title}-${index}`} className={`sj-insight ${insight.pending ? 'pending' : ''}`}>
                          <div className="sj-insight-head">
                            {insight.icon}
                            <span>{index + 1}. {insight.title}</span>
                          </div>
                          <div className="sj-accent-rule" style={{ marginTop: 0 }} />
                          <p>{insight.detail}</p>
                        </article>
                      ))}
                    </div>
                  </section>

                  <section className="sj-section sj-block">
                    <button className="sj-accordion-btn" onClick={() => setDefinitionsOpen((value) => !value)}>
                      <span>Definitions / Methodology</span>
                      <ChevronDown size={15} style={{ transform: definitionsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms ease' }} />
                    </button>
                    {definitionsOpen && (
                      <div className="sj-accordion-body">
                        <p><strong>Interactions:</strong> likes + comments + shares where publicly visible.</p>
                        <p><strong>EMV:</strong> (Likes × $0.50) + (Comments × $1.50).</p>
                        <p><strong>Data coverage window:</strong> {coverageWindowLabel}.</p>
                        <p><strong>Note:</strong> Missing post-level values display as <strong>—</strong> with tooltip <em>Pending data.</em></p>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {activeTab === 'events' && (
                <section className="sj-event-layout">
                  <aside className="sj-list-panel">
                    <div className="sj-section-title" style={{ marginBottom: 8 }}>Event List</div>
                    <div className="sj-list-search">
                      <Search size={14} color="#6b7280" />
                      <input
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        placeholder="Search events"
                      />
                    </div>

                    <div className="sj-event-list">
                      {eventListForTab.map((event) => (
                        <button
                          key={event.key}
                          className={`sj-event-card ${selectedEvent?.key === event.key ? 'active' : ''}`}
                          onClick={() => setSelectedEventKey(event.key)}
                        >
                          <div className="sj-event-name">{event.name}</div>
                          <div className="sj-chip-row">
                            <span className="sj-chip">{event.dateLabel}</span>
                            <span className="sj-chip">{event.posts.length} posts</span>
                            <span className="sj-chip">{event.platforms.map((p) => toTitleCase(p)).join(', ') || 'No platforms'}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </aside>

                  <div className="sj-main-panel">
                    {selectedEvent ? (
                      <>
                        <div className="sj-event-headline">
                          <div>
                            <h3>{selectedEvent.name}</h3>
                            <p className="sj-subtext">{selectedEvent.dateLabel} • {selectedEvent.location}</p>
                            <p className="sj-subtext">{selectedEvent.description}</p>
                          </div>
                        </div>

                        <div className="sj-section-title" style={{ marginTop: 16 }}>Activation Footprint</div>
                        {eventFootprint.length > 0 ? (
                          <SegmentedPillBars items={eventFootprint} valueLabel={(value) => `${value} posts`} />
                        ) : (
                          <div className="sj-empty">No posts mapped to this event under current filters.</div>
                        )}

                        <div className="sj-section-title" style={{ marginTop: 16 }}>Top Posts</div>
                        <div className="sj-grid-posts">
                          {selectedEvent.posts
                            .slice()
                            .sort((a, b) => (b.interactionsObserved ?? -1) - (a.interactionsObserved ?? -1))
                            .slice(0, 10)
                            .map((post) => (
                              <PostCard key={post.id} post={post} showEventTag={false} />
                            ))}
                        </div>
                      </>
                    ) : (
                      <div className="sj-empty">Select an event to view activation details.</div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === 'athletes' && (
                <section className="sj-block sj-section">
                  <div className="sj-section-title">Athlete Leaderboard</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {([
                      { key: 'interactions', label: 'Interactions', icon: <Flame size={13} /> },
                      { key: 'emv', label: 'EMV', icon: <Sparkles size={13} /> },
                      { key: 'posts', label: 'Posts', icon: <ListFilter size={13} /> },
                      { key: 'er', label: 'Avg ER', icon: <CircleAlert size={13} /> },
                    ] as Array<{ key: AthleteSort; label: string; icon: ReactNode }>).map((sortOption) => (
                      <button
                        key={sortOption.key}
                        className={`sj-toggle-btn ${athleteSort === sortOption.key ? 'active' : ''}`}
                        onClick={() => setAthleteSort(sortOption.key)}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {sortOption.icon}
                          {sortOption.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="sj-athlete-table-wrap">
                    <table className="sj-athlete-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Athlete</th>
                          <th>Posts</th>
                          <th>Interactions</th>
                          <th>EMV</th>
                          <th>Avg ER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {athleteAggregates.map((athlete, index) => {
                          const interactions = metricDisplay(athlete.interactionsObserved, formatCompactNumber);
                          const emv = metricDisplay(athlete.emvObserved, formatCurrency);
                          const avgEr = metricDisplay(athlete.avgEngagementObserved, formatPercent);
                          return (
                            <tr
                              key={athlete.name}
                              onClick={() => {
                                setSelectedAthlete(athlete);
                                setDrawerOpen(true);
                              }}
                            >
                              <td><RankBadge rank={index + 1} /></td>
                              <td>
                                <div style={{ fontWeight: 600, color: '#111827' }}>{athlete.name}</div>
                                <div style={{ fontSize: 11, color: '#6b7280' }}>{athlete.role}</div>
                              </td>
                              <td>{athlete.posts.length}</td>
                              <td title={interactions.pending ? 'Pending data.' : undefined}>{interactions.text}</td>
                              <td title={emv.pending ? 'Pending data.' : undefined}>{emv.text}</td>
                              <td title={avgEr.pending ? 'Pending data.' : undefined}>{avgEr.text}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === 'content' && (
                <section className="sj-block sj-section">
                  <div className="sj-content-toggle">
                    <button
                      className={`sj-toggle-btn ${contentScope === 'official' ? 'active' : ''}`}
                      onClick={() => setContentScope('official')}
                    >
                      St. Jude Account Posts
                    </button>
                    <button
                      className={`sj-toggle-btn ${contentScope === 'partner' ? 'active' : ''}`}
                      onClick={() => setContentScope('partner')}
                      title={partnerPosts.length === 0 ? 'Awaiting partner ingest' : undefined}
                    >
                      Partner / Athlete Posts
                    </button>

                    <label className="sj-control" style={{ minWidth: 160 }}>
                      Content Type
                      <select value={contentTypeFilter} onChange={(e) => setContentTypeFilter(e.target.value as 'all' | 'video' | 'photo' | 'unknown')}>
                        {contentTypeOptions.map((option) => (
                          <option key={option} value={option}>{option === 'all' ? 'All Types' : toTitleCase(option)}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {contentScope === 'partner' && partnerPosts.length === 0 ? (
                    <div className="sj-empty">Awaiting partner ingest.</div>
                  ) : (
                    <>
                      <div className="sj-section-title">Champion Faceoff</div>
                      <div className="sj-faceoff">
                        {topPostsByInteractions.slice(0, 2).map((post, idx) => (
                          <div key={post.id}>
                            <div className="sj-tile-title">{idx === 0 ? 'Best Post' : 'Runner-up'}</div>
                            <PostCard post={post} />
                          </div>
                        ))}
                      </div>

                      <div className="sj-section-title" style={{ marginTop: 14 }}>Top 10 Posts</div>
                      <div className="sj-grid-posts">
                        {contentPosts
                          .slice()
                          .sort((a, b) => (b.interactionsObserved ?? -1) - (a.interactionsObserved ?? -1))
                          .slice(0, 10)
                          .map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                      </div>
                    </>
                  )}
                </section>
              )}

              {activeTab === 'benchmarks' && (
                <section className="sj-block sj-section">
                  <div className="sj-section-title">Benchmarks</div>
                  <label className="sj-control" style={{ maxWidth: 320 }}>
                    Benchmark set
                    <select disabled title="Pending benchmark dataset.">
                      <option>Peer charities</option>
                      <option>Healthcare nonprofits</option>
                      <option>All brands</option>
                    </select>
                  </label>

                  <div className="sj-empty" style={{ marginTop: 10 }}>
                    Benchmark dataset not yet loaded.
                  </div>

                  <div className="sj-benchmark-shell" style={{ marginTop: 10 }}>
                    {benchmarkUiRows.map((item) => (
                      <article key={item.title} className="sj-placeholder">
                        <div style={{ fontSize: 13, fontWeight: 620, color: '#111827' }}>{item.title}</div>
                        <p style={{ margin: '5px 0 0', color: '#6b7280', fontSize: 12 }}>{item.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </TabPanel>
          )}
        </main>
      </div>

      <AnimatePresence>
        {drawerOpen && selectedAthlete && (
          <>
            <motion.div
              className="sj-drawer-bg"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="sj-drawer"
              initial={{ x: 420, y: 0 }}
              animate={{ x: 0, y: 0 }}
              exit={{ x: 420, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="sj-drawer-head">
                <div>
                  <div className="sj-kicker" style={{ marginBottom: 2 }}>Athlete Profile</div>
                  <h3 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.01em' }}>{selectedAthlete.name}</h3>
                  <div className="sj-subtext">{selectedAthlete.role}</div>
                </div>
                <button className="sj-drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
              </div>

              <div className="sj-section-title">Events Participated</div>
              <div className="sj-chip-row" style={{ marginBottom: 10 }}>
                {selectedAthlete.events.map((event) => (
                  <span key={event} className="sj-chip">{event}</span>
                ))}
              </div>

              <div className="sj-section-title">Top 5 Posts</div>
              <div className="sj-grid-posts" style={{ gridTemplateColumns: '1fr' }}>
                {selectedAthlete.posts
                  .slice()
                  .sort((a, b) => (b.interactionsObserved ?? -1) - (a.interactionsObserved ?? -1))
                  .slice(0, 5)
                  .map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
