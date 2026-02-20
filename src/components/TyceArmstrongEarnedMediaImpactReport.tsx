import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ReportProps {
  onBack?: () => void;
}

interface Metrics {
  retweet_count?: number;
  reply_count?: number;
  like_count?: number;
  quote_count?: number;
  bookmark_count?: number;
  impression_count?: number;
}

interface Author {
  id?: string;
  username?: string;
  name?: string;
  verified?: boolean;
}

interface XPost {
  id?: string;
  url?: string;
  created_at?: string;
  author?: Author;
  text?: string;
  matched_terms?: string[];
  public_metrics?: Metrics;
}

interface SocialListeningData {
  topic?: string;
  platform?: string;
  generated_at?: string;
  query_used?: string;
  search_meta?: {
    pages_fetched?: number;
    target_posts?: number;
    collected_posts?: number;
  };
  window_utc?: {
    from?: string;
    to?: string;
  };
  totals_all_query_results?: {
    tweet_count?: number;
    impressions?: number;
    engagements?: number;
    likes?: number;
    replies?: number;
    retweets?: number;
    quotes?: number;
    bookmarks?: number;
  };
  totals_topic_matched?: {
    tweet_count?: number;
    impressions?: number;
    engagements?: number;
    likes?: number;
    replies?: number;
    retweets?: number;
    quotes?: number;
    bookmarks?: number;
  };
  top_posts_by_impressions?: XPost[];
  sample_posts?: XPost[];
  notes?: string[];
}

type SortMetric = 'impressions' | 'engagements';
type LeaderSortKey = 'impressions' | 'engagements' | 'reach';
type ReportTab = 'overview' | 'social-listening';

const baylor = {
  green: '#154734',
  greenDeep: '#0F3528',
  greenTint: 'rgba(21,71,52,0.08)',
  gold: '#FFB81C',
  white: '#FFFFFF',
  slate: '#102530',
  text: '#1A2B2A',
  muted: '#5B6E6C',
  border: 'rgba(21,71,52,0.16)'
};

function formatNumber(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return 'N/A';
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString('en-US');
}

function formatPercent(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}%`;
}

function getPostKey(post: XPost): string {
  return [
    post.id ?? '',
    post.url ?? '',
    post.author?.id ?? '',
    post.author?.username ?? '',
    post.created_at ?? '',
    (post.text ?? '').slice(0, 48),
  ].join('|');
}

function formatCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return 'N/A';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(value?: string): string {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function classNames(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

const sectionHeaderStyle = { fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' as const };

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={classNames(
        'rounded-2xl border backdrop-blur-md shadow-[0_12px_38px_rgba(15,43,33,0.08)]',
        className
      )}
      style={{ borderColor: baylor.border, background: 'linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72))' }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ accent, neutral }: { accent: string; neutral?: string }) {
  return (
    <h3
      className="text-2xl sm:text-[2rem] font-bold uppercase tracking-tight leading-none"
      style={sectionHeaderStyle}
    >
      <span style={{ color: baylor.green }}>{accent}</span>
      {neutral ? <span style={{ color: '#6B7280' }}>{` ${neutral}`}</span> : null}
    </h3>
  );
}

export function TyceArmstrongEarnedMediaImpactReport({ onBack }: ReportProps) {
  const [data, setData] = useState<SocialListeningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cpm, setCpm] = useState(25);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [sortMetric, setSortMetric] = useState<SortMetric>('impressions');
  const [leaderSortKey, setLeaderSortKey] = useState<LeaderSortKey>('impressions');
  const [leaderSortDir, setLeaderSortDir] = useState<'asc' | 'desc'>('desc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const started = Date.now();
        const res = await fetch('/data/x_social_listening_sample_large.json');
        if (!res.ok) throw new Error(`Failed to load dataset (${res.status})`);
        const json = await res.json();
        const elapsed = Date.now() - started;
        const wait = Math.max(450 - elapsed, 0);
        await new Promise((resolve) => setTimeout(resolve, wait));
        if (!mounted) return;
        setData(json);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load preview dataset.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = data?.totals_topic_matched ?? data?.totals_all_query_results;

  const allPosts = useMemo(() => {
    const byId = new Map<string, XPost>();
    const inputs = [...(data?.top_posts_by_impressions ?? []), ...(data?.sample_posts ?? [])];
    for (const p of inputs) {
      const id = getPostKey(p);
      if (!byId.has(id)) byId.set(id, p);
    }
    return [...byId.values()];
  }, [data]);

  const daily = useMemo(() => {
    const map = new Map<string, { date: string; impressions: number; engagements: number }>();
    for (const post of allPosts) {
      const date = post.created_at ? new Date(post.created_at) : null;
      if (!date || Number.isNaN(date.getTime())) continue;
      const key = date.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, { date: key, impressions: 0, engagements: 0 });
      const bucket = map.get(key)!;
      const metrics = post.public_metrics ?? {};
      const impressions = Number(metrics.impression_count ?? 0) || 0;
      const engagements =
        (Number(metrics.like_count ?? 0) || 0) +
        (Number(metrics.retweet_count ?? 0) || 0) +
        (Number(metrics.quote_count ?? 0) || 0) +
        (Number(metrics.reply_count ?? 0) || 0) +
        (Number(metrics.bookmark_count ?? 0) || 0);
      bucket.impressions += impressions;
      bucket.engagements += engagements;
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [allPosts]);

  const emv = useMemo(() => {
    const impressions = Number(totals?.impressions ?? 0) || 0;
    if (!impressions) return { low: null, current: null, high: null };
    const impressionsK = impressions / 1000;
    return {
      low: impressionsK * 20,
      current: impressionsK * cpm,
      high: impressionsK * 30,
    };
  }, [totals?.impressions, cpm]);

  const windowDays = useMemo(() => {
    const from = data?.window_utc?.from ? new Date(data.window_utc.from) : null;
    const to = data?.window_utc?.to ? new Date(data.window_utc.to) : null;
    if (from && to && !Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const diffMs = Math.abs(to.getTime() - from.getTime());
      return Math.max(1, Math.floor(diffMs / 86_400_000) + 1);
    }
    return daily.length > 0 ? daily.length : null;
  }, [data?.window_utc?.from, data?.window_utc?.to, daily.length]);

  const accountLeaders = useMemo(() => {
    const map = new Map<string, {
      key: string;
      name: string;
      username: string;
      verified: boolean;
      impressions: number;
      engagements: number;
    }>();

    for (const post of allPosts) {
      const username = post.author?.username ?? 'unknown';
      const key = `${post.author?.id ?? ''}:${username}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: post.author?.name ?? 'Unknown',
          username,
          verified: Boolean(post.author?.verified),
          impressions: 0,
          engagements: 0,
        });
      }
      const row = map.get(key)!;
      const m = post.public_metrics ?? {};
      row.impressions += m.impression_count ?? 0;
      row.engagements +=
        (m.like_count ?? 0) +
        (m.retweet_count ?? 0) +
        (m.quote_count ?? 0) +
        (m.reply_count ?? 0) +
        (m.bookmark_count ?? 0);
      row.verified = row.verified || Boolean(post.author?.verified);
    }

    return [...map.values()].sort((a, b) => b.impressions - a.impressions);
  }, [allPosts]);

  const totalReach = useMemo(() => {
    const fromTotals = Number(totals?.impressions ?? 0) || 0;
    if (fromTotals > 0) return fromTotals;
    return accountLeaders.reduce((sum, row) => sum + (Number(row.impressions) || 0), 0);
  }, [totals?.impressions, accountLeaders]);

  const maxLeaderImpressions = useMemo(
    () => Math.max(...accountLeaders.map((row) => row.impressions), 1),
    [accountLeaders]
  );

  const sortedAccountLeaders = useMemo(() => {
    const rows = [...accountLeaders];
    rows.sort((a, b) => {
      const aReach = totalReach > 0 ? (a.impressions / totalReach) * 100 : 0;
      const bReach = totalReach > 0 ? (b.impressions / totalReach) * 100 : 0;
      const diff =
        leaderSortKey === 'engagements'
          ? a.engagements - b.engagements
          : leaderSortKey === 'reach'
            ? aReach - bReach
            : a.impressions - b.impressions;
      return leaderSortDir === 'asc' ? diff : -diff;
    });
    return rows;
  }, [accountLeaders, leaderSortDir, leaderSortKey, totalReach]);

  const onLeaderSort = (key: LeaderSortKey) => {
    if (leaderSortKey === key) {
      setLeaderSortDir((prev) => (prev === 'desc' ? 'asc' : 'desc'));
      return;
    }
    setLeaderSortKey(key);
    setLeaderSortDir('desc');
  };

  const mediaCallout = useMemo(() => {
    const majorPattern = /(espn|fox|cbs|ncaa|sportscenter|athletic|bleacher|si\b|sports illustrated|yahoo sports)/i;
    return accountLeaders.filter((a) => majorPattern.test(a.name) || majorPattern.test(a.username)).slice(0, 4);
  }, [accountLeaders]);

  const nationalMediaHighlights = useMemo(() => {
    const findPreferred = (pattern: RegExp) =>
      accountLeaders.find((a) => pattern.test(a.name) || pattern.test(a.username));

    const preferred = [
      findPreferred(/\bespn\b/i),
      findPreferred(/\bsportscenter\b/i),
      findPreferred(/\bmlb\b/i),
    ].filter(Boolean) as Array<{
      key: string;
      name: string;
      username: string;
      impressions: number;
      engagements: number;
      verified: boolean;
    }>;

    if (preferred.length === 3) return preferred;

    const majorPattern = /(espn|fox|cbs|ncaa|sportscenter|athletic|bleacher|si\b|sports illustrated|yahoo sports|mlb)/i;
    const fallback = accountLeaders
      .filter((a) => majorPattern.test(a.name) || majorPattern.test(a.username))
      .slice(0, 3);
    return fallback;
  }, [accountLeaders]);

  const additionalAmplificationText = useMemo(() => {
    const has11Point7 = accountLeaders.some((a) => /11point7/i.test(a.name) || /11point7/i.test(a.username));
    const hasBarstool = accountLeaders.some((a) => /barstool/i.test(a.name) || /barstool/i.test(a.username));
    if (has11Point7 && hasBarstool) {
      return 'Additional amplification from 11Point7, Barstool Sports, college baseball media accounts.';
    }
    const extras: string[] = [];
    if (has11Point7) extras.push('11Point7');
    if (hasBarstool) extras.push('Barstool Sports');
    if (extras.length) return `Additional amplification from ${extras.join(', ')}, college baseball media accounts.`;
    return 'Additional amplification from college baseball media accounts.';
  }, [accountLeaders]);

  const conversation = useMemo(() => {
    let rows = [...allPosts];
    if (verifiedOnly) rows = rows.filter((p) => Boolean(p.author?.verified));
    rows.sort((a, b) => {
      const am = a.public_metrics ?? {};
      const bm = b.public_metrics ?? {};
      const aEng = (am.like_count ?? 0) + (am.retweet_count ?? 0) + (am.quote_count ?? 0) + (am.reply_count ?? 0) + (am.bookmark_count ?? 0);
      const bEng = (bm.like_count ?? 0) + (bm.retweet_count ?? 0) + (bm.quote_count ?? 0) + (bm.reply_count ?? 0) + (bm.bookmark_count ?? 0);
      if (sortMetric === 'engagements') return bEng - aEng;
      return (bm.impression_count ?? 0) - (am.impression_count ?? 0);
    });
    return rows;
  }, [allPosts, verifiedOnly, sortMetric]);

  const dailyPostVolume = useMemo(() => {
    const map = new Map<string, number>();
    for (const post of allPosts) {
      const d = post.created_at ? new Date(post.created_at) : null;
      if (!d || Number.isNaN(d.getTime())) continue;
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allPosts]);

  const peakPostDay = useMemo(() => {
    if (!dailyPostVolume.length) return null;
    return dailyPostVolume.reduce((max, day) => (day.count > max.count ? day : max), dailyPostVolume[0]);
  }, [dailyPostVolume]);

  const sentiment = useMemo(() => {
    const pos = ['historic', 'record', 'incredible', 'elite', 'great', 'amazing', 'clutch', 'dominant', 'fire', 'love'];
    const neg = ['bad', 'awful', 'terrible', 'hate', 'weak', 'fraud', 'trash', 'overrated', 'disappointing'];
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    for (const post of allPosts) {
      const text = (post.text ?? '').toLowerCase();
      const posHit = pos.some((w) => text.includes(w));
      const negHit = neg.some((w) => text.includes(w));
      if (posHit && !negHit) positive += 1;
      else if (negHit && !posHit) negative += 1;
      else neutral += 1;
    }
    const total = Math.max(allPosts.length, 1);
    return {
      positive,
      neutral,
      negative,
      positivePct: (positive / total) * 100,
      neutralPct: (neutral / total) * 100,
      negativePct: (negative / total) * 100,
    };
  }, [allPosts]);

  const themes = useMemo(() => {
    const buckets = [
      { name: 'Historic Record Moment', match: /(record|historic|history|ncaa)/i, count: 0 },
      { name: 'Tyce Armstrong Performance', match: /(tyce|armstrong|grand slam|debut)/i, count: 0 },
      { name: 'Baylor Baseball Coverage', match: /(baylor|bears|baseball)/i, count: 0 },
      { name: 'National Media Pickup', match: /(espn|sportscenter|mlb|barstool|11point7|fox|cbs)/i, count: 0 },
      { name: 'Fan & Community Reaction', match: /(fans|crowd|reaction|watch|insane|wow)/i, count: 0 },
      { name: 'Highlight Replay Value', match: /(highlights|replay|bookmark|clip|video)/i, count: 0 },
    ];
    let unclassified = 0;
    for (const post of allPosts) {
      const text = `${post.text ?? ''} ${(post.matched_terms ?? []).join(' ')}`.toLowerCase();
      const bucket = buckets.find((b) => b.match.test(text));
      if (bucket) bucket.count += 1;
      else unclassified += 1;
    }
    if (unclassified > 0) {
      buckets.push({ name: 'General Discussion', match: /./i, count: unclassified });
    }
    const total = Math.max(allPosts.length, 1);
    return buckets
      .filter((b) => b.count > 0)
      .map((b) => ({ ...b, pct: (b.count / total) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allPosts]);

  const toggleExpand = (id: string) => setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(170deg, #eef6f1 0%, #dcecdf 44%, #f7f3e8 100%)', color: baylor.text }}>
      <header className="sticky top-0 z-30 border-b backdrop-blur-xl" style={{ borderColor: baylor.border, background: 'rgba(255,255,255,0.82)' }}>
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold border flex items-center gap-2"
                  style={{ borderColor: baylor.border, backgroundColor: 'rgba(21,71,52,0.04)', color: baylor.green }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Reports
                </button>
              )}
              <div className="min-w-0 flex items-center gap-2.5">
                <img
                  src="https://a.espncdn.com/i/teamlogos/ncaa/500/239.png"
                  alt="Baylor"
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-md object-contain border"
                  style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: baylor.muted }}>Reports / Baylor / Earned Media Impact</p>
                  <h1 className="text-base sm:text-xl font-semibold truncate">Tyce Armstrong — Earned Media Impact</h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <img
                src="/JABA-face.png"
                alt="JABA"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border"
                style={{ borderColor: baylor.border }}
              />
              <span
                className="px-2.5 py-1 rounded-full text-[11px] tracking-[0.14em] uppercase border"
                style={{
                  borderColor: baylor.border,
                  backgroundColor: 'rgba(255,255,255,0.62)',
                  color: baylor.slate
                }}
              >
                Generated by JABA AI
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-3 sm:px-5 py-5 sm:py-7 space-y-5">
        <GlassCard className="p-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className="px-3 py-2 rounded-lg text-sm font-semibold border"
              style={activeTab === 'overview'
                ? { borderColor: baylor.green, backgroundColor: baylor.green, color: baylor.white }
                : { borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.82)', color: baylor.slate }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('social-listening')}
              className="px-3 py-2 rounded-lg text-sm font-semibold border"
              style={activeTab === 'social-listening'
                ? { borderColor: baylor.green, backgroundColor: baylor.green, color: baylor.white }
                : { borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.82)', color: baylor.slate }}
            >
              Social Listening
            </button>
          </div>
        </GlassCard>

        {activeTab === 'overview' && (
          <>
        <GlassCard className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-3xl font-semibold leading-tight" style={{ color: baylor.greenDeep }}>
            Tyce Armstrong's record-setting debut sparked national attention.
          </h2>
          <p className="mt-2 text-sm sm:text-base" style={{ color: baylor.muted }}>
            National amplification following a historic 3-grand-slam debut - quantified through X social exposure.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(21,71,52,0.08)' }} />
              ))
            ) : (
              <>
                <MetricChip label="Total Posts" value={formatNumber(totals?.tweet_count)} />
                <MetricChip label="Total Impressions" value={formatNumber(totals?.impressions)} />
                <MetricChip label="Total Engagements" value={formatNumber(totals?.engagements)} />
                <MetricChip label="Total Likes" value={formatNumber(totals?.likes)} />
                <MetricChip label="Total Retweets" value={formatNumber(totals?.retweets)} />
              </>
            )}
          </div>

          <div
            className="mt-5 p-4 rounded-2xl border"
            style={{
              borderColor: 'rgba(255,184,28,0.72)',
              background: 'linear-gradient(145deg, rgba(255,184,28,0.18), rgba(255,255,255,0.7))',
              boxShadow: 'inset 0 0 0 1px rgba(255,184,28,0.24), 0 8px 24px rgba(255,184,28,0.12)'
            }}
          >
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: baylor.greenDeep }}>Estimated Earned Media Value (X)</p>
                <div className="mt-2 space-y-1">
                  <p className="text-3xl sm:text-4xl font-semibold" style={{ color: baylor.green }}>
                    {emv.current == null ? 'N/A' : formatCurrency(emv.current)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.14em]" style={{ color: baylor.slate }}>Base Estimate</p>
                  <p className="text-xs" style={{ color: baylor.slate }}>
                    Equivalent paid media value at selected CPM
                  </p>
                  <p className="text-sm sm:text-base font-medium" style={{ color: baylor.slate }}>
                    Reference range: $20-$30 CPM
                  </p>
                  <p className="text-xs" style={{ color: baylor.slate }}>
                    {windowDays == null ? 'Within N/A days' : `Within ${windowDays} days`}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-[320px] rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.62)' }}>
                <div className="text-sm font-semibold" style={{ color: baylor.greenDeep }}>
                  {`CPM: $${cpm}`}
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={1}
                  value={cpm}
                  onChange={(e) => setCpm(Number(e.target.value))}
                  className="w-full mt-2 accent-[#154734] cursor-pointer"
                  aria-label="CPM slider"
                />
                <p className="mt-2 text-xs" style={{ color: baylor.slate }}>
                  EMV = (Impressions ÷ 1,000) × CPM
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="National Impact" neutral="& Brand Lift" />
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: baylor.border,
                borderTopWidth: 2,
                borderTopColor: 'rgba(21,71,52,0.52)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.84), rgba(255,255,255,0.72))',
                boxShadow: 'inset 0 0 0 1px rgba(255,184,28,0.10)'
              }}
            >
              <h4 className="text-sm sm:text-base font-semibold" style={{ color: baylor.greenDeep }}>Immediate National Exposure</h4>
              <p className="mt-2 text-sm leading-6" style={{ color: baylor.text }}>
                10.6M impressions generated in under 6 days.
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: baylor.muted }}>
                Coverage extended beyond fan channels into verified national sports media accounts.
              </p>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: baylor.border,
                borderTopWidth: 2,
                borderTopColor: 'rgba(21,71,52,0.52)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.84), rgba(255,255,255,0.72))',
                boxShadow: 'inset 0 0 0 1px rgba(255,184,28,0.10)'
              }}
            >
              <h4 className="text-sm sm:text-base font-semibold" style={{ color: baylor.greenDeep }}>Record-Driven Narrative Strength</h4>
              <p className="mt-2 text-sm leading-6" style={{ color: baylor.text }}>
                NCAA historical framing amplified shareability.
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: baylor.muted }}>
                Historic context elevated the moment from highlight to national storyline.
              </p>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{
                borderColor: baylor.border,
                borderTopWidth: 2,
                borderTopColor: 'rgba(21,71,52,0.52)',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.84), rgba(255,255,255,0.72))',
                boxShadow: 'inset 0 0 0 1px rgba(255,184,28,0.10)'
              }}
            >
              <h4 className="text-sm sm:text-base font-semibold" style={{ color: baylor.greenDeep }}>Sustained Engagement Signal</h4>
              <p className="mt-2 text-sm leading-6" style={{ color: baylor.text }}>
                3.5K bookmarks and strong retweet/quote activity.
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: baylor.muted }}>
                Indicates replay value and extended conversation beyond initial spike.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="National Media" neutral="Amplification" />
          <p className="text-sm mt-1" style={{ color: baylor.muted }}>Ranked by impressions from preview dataset posts.</p>

          {loading ? (
            <div className="space-y-2 mt-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(21,71,52,0.08)' }} />)}
            </div>
          ) : (
            <>
              <div className="mt-4 rounded-xl border p-3 sm:p-4" style={{ borderColor: baylor.border, background: 'linear-gradient(145deg, rgba(21,71,52,0.10), rgba(255,255,255,0.86))' }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: baylor.greenDeep }}>National Media Amplification</p>
                <p className="text-xs mt-1" style={{ color: baylor.muted }}>
                  This coverage extended beyond fan chatter into national sports media.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {nationalMediaHighlights.length > 0 ? (
                    nationalMediaHighlights.map((media) => (
                      <div
                        key={media.key}
                        className="rounded-lg border px-3 py-2"
                        style={{
                          borderColor: baylor.border,
                          borderTopWidth: 2,
                          borderTopColor: 'rgba(255,184,28,0.75)',
                          backgroundColor: 'rgba(255,255,255,0.82)',
                          boxShadow: 'inset 0 0 0 1px rgba(255,184,28,0.12)'
                        }}
                      >
                        <div className="text-[10px] uppercase tracking-[0.14em] font-semibold" style={{ color: baylor.slate }}>
                          Verified National Media
                        </div>
                        <div className="font-semibold" style={{ color: baylor.greenDeep }}>{media.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: baylor.muted }}>
                          {formatNumber(media.impressions)} impressions • {formatPercent(totalReach > 0 ? (media.impressions / totalReach) * 100 : 0)} of total
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm" style={{ color: baylor.muted }}>N/A</div>
                  )}
                </div>
                <p className="text-sm mt-3" style={{ color: baylor.muted }}>
                  {additionalAmplificationText}
                </p>
              </div>

              <div className="hidden md:block mt-4 overflow-hidden rounded-xl border" style={{ borderColor: baylor.border }}>
                <table className="w-full">
                  <thead style={{ backgroundColor: 'rgba(21,71,52,0.06)' }}>
                    <tr className="text-xs uppercase tracking-[0.16em]" style={{ color: baylor.muted }}>
                      <th className="text-left px-4 py-3">Account</th>
                      <th className="text-right px-4 py-3">
                        <button onClick={() => onLeaderSort('impressions')} className="font-semibold">
                          Impressions
                        </button>
                      </th>
                      <th className="text-right px-4 py-3">
                        <button onClick={() => onLeaderSort('reach')} className="font-semibold">
                          % of Total Reach
                        </button>
                      </th>
                      <th className="text-right px-4 py-3">
                        <button onClick={() => onLeaderSort('engagements')} className="font-semibold">
                          Engagements
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAccountLeaders.slice(0, 12).map((row) => {
                      const reachPct = totalReach > 0 ? (row.impressions / totalReach) * 100 : 0;
                      const barPct = Math.max(3, (row.impressions / maxLeaderImpressions) * 100);
                      return (
                      <tr
                        key={row.key}
                        className="border-t"
                        style={{
                          borderColor: baylor.border,
                          boxShadow: row.verified ? 'inset 3px 0 0 rgba(21,71,52,0.35)' : undefined
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold flex items-center gap-2">
                            {row.name}
                            {row.verified && <CheckCircle2 className="w-4 h-4" style={{ color: baylor.green }} />}
                          </div>
                          <div className="text-sm" style={{ color: baylor.muted }}>@{row.username}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <div>{formatNumber(row.impressions)}</div>
                          <div className="ml-auto mt-1 h-1.5 rounded-full overflow-hidden" style={{ width: 92, backgroundColor: 'rgba(21,71,52,0.12)' }}>
                            <div className="h-full rounded-full" style={{ width: `${barPct}%`, backgroundColor: 'rgba(21,71,52,0.65)' }} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatPercent(reachPct)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatNumber(row.engagements)}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden mt-4 space-y-3">
                {sortedAccountLeaders.slice(0, 12).map((row) => (
                  <div
                    key={row.key}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: baylor.border,
                      borderLeftWidth: row.verified ? 3 : 1,
                      borderLeftColor: row.verified ? 'rgba(21,71,52,0.45)' : baylor.border,
                      backgroundColor: 'rgba(255,255,255,0.8)'
                    }}
                  >
                    <div className="font-semibold flex items-center gap-2">
                      {row.name}
                      {row.verified && <CheckCircle2 className="w-4 h-4" style={{ color: baylor.green }} />}
                    </div>
                    <div className="text-sm" style={{ color: baylor.muted }}>@{row.username}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div>Impressions: <span className="font-semibold">{formatNumber(row.impressions)}</span></div>
                      <div>Reach: <span className="font-semibold">{formatPercent(totalReach > 0 ? (row.impressions / totalReach) * 100 : 0)}</span></div>
                      <div>Engagements: <span className="font-semibold">{formatNumber(row.engagements)}</span></div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(21,71,52,0.12)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.max(3, (row.impressions / maxLeaderImpressions) * 100)}%`, backgroundColor: 'rgba(21,71,52,0.65)' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border p-4" style={{ borderColor: baylor.border, background: 'linear-gradient(145deg, rgba(21,71,52,0.08), rgba(255,255,255,0.9))' }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: baylor.greenDeep }}>Media Profile Summary</p>
                <div className="mt-2 space-y-1 text-sm" style={{ color: baylor.muted }}>
                  <p>Tier 1 sports media drove majority of impressions</p>
                  <p>Coverage spanned pro + collegiate ecosystems</p>
                  <p>Narrative extended beyond fan chatter into national sports media</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: baylor.greenTint }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: baylor.greenDeep }}>Top Publications / Media</p>
                <p className="text-sm mt-1" style={{ color: baylor.muted }}>
                  {mediaCallout.length
                    ? mediaCallout.map((m) => `${m.name} (@${m.username})`).join(' • ')
                    : 'No clearly major media accounts identified in this preview sample.'}
                </p>
              </div>
            </>
          )}
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="Engagement Quality" neutral="Breakdown" />
          <p className="text-sm mt-1" style={{ color: baylor.muted }}>Bookmarks often indicate intent to revisit/share.</p>
          <div className="mt-4">
            {loading ? (
              <div className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(21,71,52,0.08)' }} />
            ) : (
              <EngagementStack
                likes={totals?.likes}
                retweets={totals?.retweets}
                quotes={totals?.quotes}
                bookmarks={totals?.bookmarks}
                totalEngagements={totals?.engagements}
                totalImpressions={totals?.impressions}
              />
            )}
          </div>
        </GlassCard>
          </>
        )}

        {activeTab === 'social-listening' && (
          <>
        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="Volume" neutral="& Velocity" />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.82)' }}>
              <p className="text-xs uppercase tracking-[0.14em]" style={{ color: baylor.muted }}>Total Posts</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: baylor.green }}>{formatNumber(totals?.tweet_count ?? allPosts.length)}</p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.82)' }}>
              <p className="text-xs uppercase tracking-[0.14em]" style={{ color: baylor.muted }}>Peak Date</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: baylor.green }}>{peakPostDay ? formatDate(peakPostDay.date) : 'N/A'}</p>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.82)' }}>
              <p className="text-xs uppercase tracking-[0.14em]" style={{ color: baylor.muted }}>Peak Daily Posts</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: baylor.green }}>{peakPostDay ? formatNumber(peakPostDay.count) : 'N/A'}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.75)' }}>
            <p className="text-xs uppercase tracking-[0.14em]" style={{ color: baylor.muted }}>Posts Over Time</p>
            <div className="mt-2 flex items-end gap-1 h-20">
              {dailyPostVolume.length ? dailyPostVolume.slice(-18).map((day) => {
                const max = Math.max(...dailyPostVolume.map((d) => d.count), 1);
                const heightPct = (day.count / max) * 100;
                return (
                  <div key={day.date} className="flex-1 rounded-t-sm" title={`${formatDate(day.date)}: ${day.count} posts`} style={{ height: `${Math.max(8, heightPct)}%`, backgroundColor: 'rgba(21,71,52,0.65)' }} />
                );
              }) : <p className="text-sm" style={{ color: baylor.muted }}>No daily breakdown available</p>}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="Sentiment" neutral="Overview" />
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[180px,1fr] gap-4 items-center">
            <div className="mx-auto w-36 h-36 rounded-full border relative" style={{
              borderColor: baylor.border,
              background: `conic-gradient(#2E7D59 0 ${sentiment.positivePct}%, #94A3B8 ${sentiment.positivePct}% ${sentiment.positivePct + sentiment.neutralPct}%, #B91C1C ${sentiment.positivePct + sentiment.neutralPct}% 100%)`
            }}>
              <div className="absolute inset-4 rounded-full bg-white/90 border" style={{ borderColor: baylor.border }} />
            </div>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: baylor.text }}>Positive: <span className="font-semibold">{formatPercent(sentiment.positivePct)}</span></p>
              <p className="text-sm" style={{ color: baylor.text }}>Neutral: <span className="font-semibold">{formatPercent(sentiment.neutralPct)}</span></p>
              <p className="text-sm" style={{ color: baylor.text }}>Negative: <span className="font-semibold">{formatPercent(sentiment.negativePct)}</span></p>
              <p className="text-sm mt-3" style={{ color: baylor.muted }}>
                {sentiment.positivePct >= sentiment.neutralPct
                  ? 'Executive read: Conversation skewed positive, with national attention concentrating on performance and record context.'
                  : 'Executive read: Conversation remained mostly neutral/informational, with limited negative sentiment in the preview sample.'}
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="Narrative" neutral="Themes" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {themes.map((theme) => (
              <div key={theme.name} className="rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.84)' }}>
                <p className="text-sm font-semibold" style={{ color: baylor.greenDeep }}>{theme.name}</p>
                <p className="text-xs mt-1" style={{ color: baylor.muted }}>{formatPercent(theme.pct)} of conversation</p>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(21,71,52,0.12)' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.max(6, theme.pct)}%`, backgroundColor: 'rgba(21,71,52,0.66)' }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <SectionHeader accent="Top Amplified" neutral="Posts" />
              <p className="text-sm" style={{ color: baylor.muted }}>Top 10 posts from preview social listening output.</p>
              <p className="text-xs mt-1" style={{ color: baylor.muted }}>
                Dataset context: Preview X social listening dataset; rankings reflect currently collected posts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortMetric}
                onChange={(e) => setSortMetric(e.target.value as SortMetric)}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.8)' }}
              >
                <option value="impressions">Sort by impressions</option>
                <option value="engagements">Sort by engagements</option>
              </select>
              <button
                onClick={() => setVerifiedOnly((v) => !v)}
                className="px-3 py-2 rounded-lg border text-sm font-semibold"
                style={verifiedOnly
                  ? { borderColor: baylor.green, backgroundColor: baylor.green, color: baylor.white }
                  : { borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.8)', color: baylor.text }}
              >
                Verified only
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: 'rgba(21,71,52,0.08)' }} />)}
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {conversation.slice(0, 10).map((post) => {
                const id = post.id ?? `${post.author?.username ?? 'unknown'}-${post.created_at ?? ''}`;
                const expanded = Boolean(expandedIds[id]);
                const text = post.text ?? 'N/A';
                const showExpand = text.length > 180;
                const metrics = post.public_metrics ?? {};
                const engagements =
                  (metrics.like_count ?? 0) +
                  (metrics.retweet_count ?? 0) +
                  (metrics.quote_count ?? 0) +
                  (metrics.reply_count ?? 0) +
                  (metrics.bookmark_count ?? 0);

                return (
                  <article key={id} className="rounded-xl border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.84)' }}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <div className="font-semibold flex items-center gap-2">
                        {post.author?.name ?? 'Unknown'}
                        {post.author?.verified && <CheckCircle2 className="w-4 h-4" style={{ color: baylor.green }} />}
                        <span style={{ color: baylor.muted }}>@{post.author?.username ?? 'N/A'}</span>
                      </div>
                      <span style={{ color: baylor.muted }}>{formatDate(post.created_at)}</span>
                    </div>

                    <p className="mt-2 text-sm leading-6" style={{ color: baylor.text }}>
                      {expanded || !showExpand ? text : `${text.slice(0, 180)}...`}
                    </p>
                    {showExpand && (
                      <button onClick={() => toggleExpand(id)} className="text-xs mt-1 font-semibold" style={{ color: baylor.green }}>
                        {expanded ? 'Show less' : 'Show more'}
                      </button>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs mt-3" style={{ color: baylor.muted }}>
                      <div>Impressions: <span className="font-semibold" style={{ color: baylor.text }}>{formatNumber(metrics.impression_count)}</span></div>
                      <div>Engagements: <span className="font-semibold" style={{ color: baylor.text }}>{formatNumber(engagements)}</span></div>
                      <div>Likes: <span className="font-semibold" style={{ color: baylor.text }}>{formatNumber(metrics.like_count)}</span></div>
                      <div>Retweets: <span className="font-semibold" style={{ color: baylor.text }}>{formatNumber(metrics.retweet_count)}</span></div>
                      <div>Quotes: <span className="font-semibold" style={{ color: baylor.text }}>{formatNumber(metrics.quote_count)}</span></div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </GlassCard>
          </>
        )}

        {activeTab === 'overview' && (
        <GlassCard className="p-4 sm:p-6">
          <SectionHeader accent="Methodology" neutral="& Data Status" />
          <div className="text-sm mt-3 space-y-1" style={{ color: baylor.muted }}>
            <p>Time window: {formatDate(data?.window_utc?.from)} to {formatDate(data?.window_utc?.to)}</p>
            <p>Included sources: X social listening only.</p>
            <p>EMV method: CPM valuation on X impressions at $20–$30 CPM (base case $25 CPM).</p>
            <p>Dataset generated: {formatDate(data?.generated_at)}</p>
            {error && <p style={{ color: '#9A3412' }}>Data warning: {error}</p>}
          </div>
        </GlassCard>
        )}
      </main>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl border px-3 py-3 transition-colors duration-200 hover:bg-[#F0F7F3]"
      style={{
        borderColor: baylor.border,
        borderTopWidth: 2,
        borderTopColor: 'rgba(21,71,52,0.45)',
        backgroundColor: 'rgba(255,255,255,0.84)'
      }}
    >
      <p className="text-[11px] uppercase tracking-[0.16em]" style={{ color: baylor.muted }}>{label}</p>
      <p className="text-xl font-semibold mt-1" style={{ color: baylor.green }}>{value}</p>
    </div>
  );
}

function EngagementStack({
  likes,
  retweets,
  quotes,
  bookmarks,
  totalEngagements,
  totalImpressions,
}: {
  likes?: number;
  retweets?: number;
  quotes?: number;
  bookmarks?: number;
  totalEngagements?: number;
  totalImpressions?: number;
}) {
  const values = [
    { label: 'Likes', value: likes ?? 0, color: '#154734' },
    { label: 'Retweets', value: retweets ?? 0, color: '#3F8A67' },
    { label: 'Quotes', value: quotes ?? 0, color: '#2E7D59' },
    { label: 'Bookmarks', value: bookmarks ?? 0, color: '#FFB81C' },
  ];

  const total = values.reduce((sum, v) => sum + v.value, 0);
  const engagements = Number(totalEngagements ?? total) || 0;
  const impressions = Number(totalImpressions ?? 0) || 0;
  const amplification = (Number(retweets ?? 0) || 0) + (Number(quotes ?? 0) || 0);
  const intent = Number(bookmarks ?? 0) || 0;
  const engagementRate = impressions > 0 ? (engagements / impressions) * 100 : null;
  const amplificationRate = engagements > 0 ? (amplification / engagements) * 100 : null;
  const intentRate = engagements > 0 ? (intent / engagements) * 100 : null;

  return (
    <div>
      <div className="w-full h-9 rounded-full overflow-hidden flex border" style={{ borderColor: baylor.border }}>
        {values.map((item) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          const width = `${pct}%`;
          return (
            <div key={item.label} className="h-full flex items-center justify-center" style={{ width, backgroundColor: item.color }}>
              {pct >= 10 && (
                <span className="text-[10px] font-semibold text-white">{`${pct.toFixed(0)}%`}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
        {values.map((item) => (
          <div key={item.label} className="rounded-lg border p-2" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.8)' }}>
            <p style={{ color: baylor.muted }}>{item.label}</p>
            <p className="font-semibold mt-1" style={{ color: baylor.greenDeep }}>{formatNumber(item.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
        <div className="rounded-lg border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: baylor.muted }}>Engagement Rate</p>
          <p className="text-lg font-semibold mt-1" style={{ color: baylor.greenDeep }}>
            {engagementRate == null ? 'N/A' : `${engagementRate.toFixed(2)}%`}
          </p>
          <p className="text-[11px]" style={{ color: baylor.muted }}>(Total Engagements / Total Impressions)</p>
        </div>
        <div className="rounded-lg border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: baylor.muted }}>Amplification Rate</p>
          <p className="text-lg font-semibold mt-1" style={{ color: baylor.greenDeep }}>
            {amplificationRate == null ? 'N/A' : `${amplificationRate.toFixed(2)}%`}
          </p>
          <p className="text-[11px]" style={{ color: baylor.muted }}>((Retweets + Quotes) / Total Engagements)</p>
        </div>
        <div className="rounded-lg border p-3" style={{ borderColor: baylor.border, backgroundColor: 'rgba(255,255,255,0.8)' }}>
          <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: baylor.muted }}>Intent Signal Rate</p>
          <p className="text-lg font-semibold mt-1" style={{ color: baylor.greenDeep }}>
            {intentRate == null ? 'N/A' : `${intentRate.toFixed(2)}%`}
          </p>
          <p className="text-[11px]" style={{ color: baylor.muted }}>(Bookmarks / Total Engagements)</p>
        </div>
      </div>

      <p className="text-xs mt-3" style={{ color: baylor.muted }}>
        Primary Signal: Likes • Amplification Signal: Retweets + Quotes • Intent Signal: Bookmarks
      </p>
    </div>
  );
}
