import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from './playfly/PlayflyUI';

interface ContentItem {
  _id: string;
  athlete?: { name?: string; school?: { name?: string } };
  caption?: string;
  publishedAt?: { $date?: string } | string;
  permalink?: string;
  url?: string;
  sponsorPartner?: string;
  isSponsored?: boolean;
  isOrganizationCollaboration?: boolean;
  hasOrganizationInCaption?: boolean;
  hasOrganizationLogo?: boolean;
  metrics?: { likes?: number; comments?: number; engagementRate?: number };
}

interface ScopeStats {
  medianInteractions: number;
  p75Interactions: number;
  medianEngagement: number;
  p75Engagement: number;
  count: number;
}

interface SignalRow {
  label: string;
  sample: number;
  medianInteractions: number;
  medianEngagement: number;
  lift: number;
}

interface SponsorIntel {
  ranked: { name: string; medianInteractions: number }[];
  missedList: [string, number][];
}

interface ScopeData {
  topWithIp: ContentItem[];
  topWithoutIp: ContentItem[];
  topSponsoredWithIp: ContentItem[];
  topSponsoredWithoutIp: ContentItem[];
  statsWithIp: ScopeStats;
  statsWithoutIp: ScopeStats;
  statsSponsoredWithIp: ScopeStats;
  statsSponsoredWithoutIp: ScopeStats;
  signalsMatrix: SignalRow[];
  sponsorIntel: SponsorIntel;
}

interface ProcessedData {
  schools: string[];
  all: ScopeData;
  bySchool: Record<string, ScopeData>;
}

const formatNumber = (num: number) => Math.round(num).toLocaleString();
const formatPercent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export function ContentTab() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionScope, setSectionScope] = useState<string>('all');

  useEffect(() => {
    fetch('/data/playfly-content-processed.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => { setProcessedData(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const scope: ScopeData | null = useMemo(() => {
    if (!processedData) return null;
    if (sectionScope === 'all') return processedData.all;
    return processedData.bySchool[sectionScope] || null;
  }, [processedData, sectionScope]);

  const schools = processedData?.schools || [];

  const getInteractions = (item: ContentItem) => {
    const likes = item.metrics?.likes || 0;
    const comments = item.metrics?.comments || 0;
    return likes + comments;
  };
  const getEngagement = (item: ContentItem) => item.metrics?.engagementRate || 0;

  const formatDate = (value?: ContentItem['publishedAt']) => {
    if (!value) return '';
    const raw = typeof value === 'string' ? value : value.$date;
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const liftLabel = (statsA: ScopeStats, statsB: ScopeStats) => {
    if (statsB.medianInteractions === 0) return 'N/A';
    const lift = ((statsA.medianInteractions - statsB.medianInteractions) / statsB.medianInteractions) * 100;
    return `${lift > 0 ? '+' : ''}${lift.toFixed(1)}% median interactions`;
  };

  const renderPostRow = (item: ContentItem, size: 'sm' | 'md' = 'sm') => {
    const ipChips = [
      item.hasOrganizationLogo ? 'Visual' : null,
      item.hasOrganizationInCaption ? 'Mention' : null,
      item.isOrganizationCollaboration ? 'Org Collab' : null,
    ].filter(Boolean) as string[];
    const interactions = getInteractions(item);
    const dateLabel = formatDate(item.publishedAt);
    const thumbSize = size === 'md' ? 'h-24 w-24' : 'h-16 w-16';
    const thumb = item.url || '';
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {thumb ? (
              <a href={item.permalink || thumb} target="_blank" rel="noreferrer">
                <img src={thumb} alt={`${item.athlete?.name || 'Athlete'} content`} className={`${thumbSize} rounded-xl object-cover border border-gray-200 shadow-sm`} loading="lazy" />
              </a>
            ) : (
              <div className={`${thumbSize} rounded-xl bg-gray-100 border border-gray-200`} />
            )}
            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold text-gray-900 truncate">{item.athlete?.school?.name || 'Unknown School'}</div>
              <div className="text-[13px] md:text-sm text-gray-600 truncate">{item.athlete?.name || 'Athlete'}{dateLabel ? ` • ${dateLabel}` : ''}</div>
              {item.caption && <div className="text-sm text-gray-600 line-clamp-2 mt-1">{item.caption}</div>}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ipChips.map(chip => <span key={chip} className="content-chip">{chip}</span>)}
                {item.isSponsored && <span className="content-chip">Sponsored</span>}
                {item.sponsorPartner && <span className="content-chip">{item.sponsorPartner}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base md:text-lg font-bold text-gray-900">{formatNumber(interactions)}</div>
          <div className="text-xs text-gray-600 mt-1">Interactions</div>
          <div className="text-[13px] text-gray-600 mt-2">Engagement: {formatPercent(getEngagement(item), 2)}</div>
        </div>
      </div>
    );
  };

  if (isLoading) return <GlassCard className="p-6 text-sm text-gray-500">Loading content data…</GlassCard>;
  if (!scope) return <GlassCard className="p-6 text-sm text-gray-500">No content data available.</GlassCard>;

  const leaderboards = [
    { id: 'sponsored-with-ip', title: 'Top Sponsored posts WITH School IP', items: scope.topSponsoredWithIp, stats: scope.statsSponsoredWithIp, counterStats: scope.statsSponsoredWithoutIp },
    { id: 'sponsored-without-ip', title: 'Top Sponsored posts WITHOUT School IP', items: scope.topSponsoredWithoutIp, stats: scope.statsSponsoredWithoutIp, counterStats: scope.statsSponsoredWithIp },
  ];

  return (
    <div className="content-tab space-y-8">
      <div>
        <h3 className="text-2xl md:text-3xl pf-section-header">
          <span className="pf-header-primary">Content </span>
          <span className="pf-header-secondary">Performance</span>
        </h3>
        <p className="text-gray-700 mt-2 text-sm md:text-base">Top posts and IP signal benchmarks across Playfly schools</p>
      </div>

      {/* School Filter */}
      <GlassCard className="p-5 content-section">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="w-full md:w-56">
            <label className="text-xs text-gray-600 mb-1 block">Section view</label>
            <select value={sectionScope} onChange={(e) => setSectionScope(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none">
              <option value="all">All Schools ({schools.length})</option>
              {schools.map(school => <option key={school} value={school}>{school}</option>)}
            </select>
            {sectionScope !== 'all' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="metric-badge">Override active</span>
                <button onClick={() => setSectionScope('all')} className="text-[#1770C0] font-semibold">Reset to All Schools</button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Pool: {sectionScope === 'all' ? 'All Schools' : sectionScope} • Sorted by interactions
        </div>
      </GlassCard>

      {/* Champion Faceoff */}
      <GlassCard className="p-6 content-section">
        <div className="text-base font-semibold text-gray-900 mb-4">Champion Faceoff</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5 content-post-card">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-3">Best WITH School IP</div>
            {scope.topWithIp[0] ? renderPostRow(scope.topWithIp[0], 'md') : <div className="text-sm text-gray-500">No posts</div>}
          </GlassCard>
          <GlassCard className="p-5 content-post-card">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-3">Best WITHOUT School IP</div>
            {scope.topWithoutIp[0] ? renderPostRow(scope.topWithoutIp[0], 'md') : <div className="text-sm text-gray-500">No posts</div>}
          </GlassCard>
        </div>
      </GlassCard>

      {/* Top Posts Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leaderboards.map(board => {
          const statLine = `Median interactions: ${formatNumber(board.stats.medianInteractions)} • P75: ${formatNumber(board.stats.p75Interactions)}`;
          const lift = liftLabel(board.stats, board.counterStats);
          return (
            <GlassCard key={board.id} className="p-6 content-section">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">{board.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{statLine}</div>
                  <div className="text-xs text-gray-600">Lift vs counterpart: {lift}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 md:block md:overflow-visible md:space-y-3">
                {board.items.slice(0, 10).map(item => (
                  <GlassCard key={item._id} className="p-4 min-w-[260px] md:min-w-0 content-post-card">
                    {renderPostRow(item)}
                  </GlassCard>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>

    </div>
  );
}
