import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from './playfly/PlayflyUI';

interface ContentMetrics {
  likes?: number;
  comments?: number;
  engagementRate?: number;
  totalInteractions?: number;
  [key: string]: any;
}

interface ContentItem {
  _id: string;
  athlete?: {
    name?: string;
    school?: { name?: string };
  };
  caption?: string;
  createdAt?: { $date?: string } | string;
  publishedAt?: { $date?: string } | string;
  permalink?: string;
  url?: string;
  sponsorPartner?: string;
  isSponsored?: boolean;
  sponsored?: boolean;
  isOrganizationCollaboration?: boolean;
  hasOrganizationInCaption?: boolean;
  hasOrganizationLogo?: boolean;
  isCollaboration?: boolean;
  metrics?: ContentMetrics;
}

interface ContentTabProps {
  contentData: ContentItem[];
  isLoading?: boolean;
  allowedSchools?: string[];
}

const median = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const percentileValue = (values: number[], p: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[idx];
};

const formatNumber = (num: number) => Math.round(num).toLocaleString();
const formatPercent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

export function ContentTab({ contentData, isLoading, allowedSchools }: ContentTabProps) {
  const [sectionScope, setSectionScope] = useState<string>('all');
  const [sponsoredFilter, setSponsoredFilter] = useState<'all' | 'sponsored' | 'unsponsored'>('all');
  const [ipMode, setIpMode] = useState<'all' | 'with-ip' | 'without-ip'>('all');
  const [sortBy, setSortBy] = useState<'interactions' | 'engagement' | 'emv'>('interactions');
  const [searchQuery, setSearchQuery] = useState('');

  const hasEmv = useMemo(() => {
    return contentData.some(item => typeof item.metrics?.emv === 'number' && item.metrics.emv > 0);
  }, [contentData]);

  useEffect(() => {
    if (!hasEmv && sortBy === 'emv') {
      setSortBy('interactions');
    }
  }, [hasEmv, sortBy]);

  const schools = useMemo(() => {
    const allowedSet = allowedSchools && allowedSchools.length > 0 ? new Set(allowedSchools) : null;
    const names = new Set<string>();
    contentData.forEach(item => {
      const name = item.athlete?.school?.name;
      if (!name) return;
      if (allowedSet && !allowedSet.has(name)) return;
      names.add(name);
    });
    return Array.from(names).sort();
  }, [contentData, allowedSchools]);

  const filteredBase = useMemo(() => {
    const allowedSet = allowedSchools && allowedSchools.length > 0 ? new Set(allowedSchools) : null;
    return contentData.filter(item => {
      const schoolName = item.athlete?.school?.name || '';
      if (allowedSet && schoolName && !allowedSet.has(schoolName)) return false;
      const matchesSchool = sectionScope === 'all' ? true : schoolName === sectionScope;
      const isSponsored = item.isSponsored ?? item.sponsored ?? false;
      const matchesSponsored =
        sponsoredFilter === 'all' ? true : sponsoredFilter === 'sponsored' ? isSponsored : !isSponsored;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query
        ? true
        : (item.athlete?.name || '').toLowerCase().includes(query) ||
          (item.caption || '').toLowerCase().includes(query) ||
          (item.sponsorPartner || '').toLowerCase().includes(query);
      return matchesSchool && matchesSponsored && matchesSearch;
    });
  }, [contentData, allowedSchools, sectionScope, sponsoredFilter, searchQuery]);

  const filteredPool = useMemo(() => {
    if (ipMode === 'all') return filteredBase;
    return filteredBase.filter(item => {
      const ipPresent = !!(item.hasOrganizationLogo || item.hasOrganizationInCaption || item.isOrganizationCollaboration);
      return ipMode === 'with-ip' ? ipPresent : !ipPresent;
    });
  }, [filteredBase, ipMode]);

  const getInteractions = (item: ContentItem) => {
    const likes = item.metrics?.likes || 0;
    const comments = item.metrics?.comments || 0;
    const shares = item.metrics?.shares || 0;
    const saves = item.metrics?.saves || 0;
    const total = item.metrics?.totalInteractions || 0;
    return total > 0 ? total : likes + comments + shares + saves;
  };

  const getEngagement = (item: ContentItem) => item.metrics?.engagementRate || 0;
  const getEmv = (item: ContentItem) => item.metrics?.emv || 0;

  const formatDate = (value?: ContentItem['publishedAt']) => {
    if (!value) return '';
    const raw = typeof value === 'string' ? value : value.$date;
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const sorter = (a: ContentItem, b: ContentItem) => {
    if (sortBy === 'engagement') return getEngagement(b) - getEngagement(a);
    if (sortBy === 'emv') return getEmv(b) - getEmv(a);
    return getInteractions(b) - getInteractions(a);
  };

  const getStats = (items: ContentItem[]) => {
    const interactions = items.map(getInteractions);
    const engagement = items.map(getEngagement);
    const emv = items.map(getEmv);
    return {
      medianInteractions: median(interactions),
      p75Interactions: percentileValue(interactions, 0.75),
      medianEngagement: median(engagement),
      p75Engagement: percentileValue(engagement, 0.75),
      medianEmv: median(emv),
      p75Emv: percentileValue(emv, 0.75)
    };
  };

  const withIp = (items: ContentItem[]) => items.filter(i => i.hasOrganizationLogo || i.hasOrganizationInCaption || i.isOrganizationCollaboration);
  const withoutIp = (items: ContentItem[]) => items.filter(i => !(i.hasOrganizationLogo || i.hasOrganizationInCaption || i.isOrganizationCollaboration));
  const sponsored = (items: ContentItem[]) => items.filter(i => i.isSponsored ?? i.sponsored);

  const topWithIp = useMemo(() => withIp(filteredPool).sort(sorter), [filteredPool, sortBy]);
  const topWithoutIp = useMemo(() => withoutIp(filteredPool).sort(sorter), [filteredPool, sortBy]);
  const topSponsoredWithIp = useMemo(() => withIp(sponsored(filteredPool)).sort(sorter), [filteredPool, sortBy]);
  const topSponsoredWithoutIp = useMemo(() => withoutIp(sponsored(filteredPool)).sort(sorter), [filteredPool, sortBy]);

  const liftLabel = (a: ContentItem[], b: ContentItem[]) => {
    const aMed = median(a.map(getInteractions));
    const bMed = median(b.map(getInteractions));
    if (bMed === 0) return 'N/A';
    const lift = ((aMed - bMed) / bMed) * 100;
    return `${lift > 0 ? '+' : ''}${lift.toFixed(1)}% median interactions`;
  };

  const championWithIp = topWithIp[0];
  const championWithoutIp = topWithoutIp[0];

  const signalsMatrix = useMemo(() => {
    const groups = [
      { key: 'Visual only', match: (i: ContentItem) => i.hasOrganizationLogo && !i.hasOrganizationInCaption && !i.isOrganizationCollaboration },
      { key: 'Mention only', match: (i: ContentItem) => !i.hasOrganizationLogo && i.hasOrganizationInCaption && !i.isOrganizationCollaboration },
      { key: 'Org Collab only', match: (i: ContentItem) => !i.hasOrganizationLogo && !i.hasOrganizationInCaption && i.isOrganizationCollaboration },
      { key: 'Visual + Mention', match: (i: ContentItem) => i.hasOrganizationLogo && i.hasOrganizationInCaption },
      { key: 'Visual + OrgCollab', match: (i: ContentItem) => i.hasOrganizationLogo && i.isOrganizationCollaboration },
      { key: 'Sponsored + IP', match: (i: ContentItem) => (i.isSponsored ?? i.sponsored) && (i.hasOrganizationLogo || i.hasOrganizationInCaption || i.isOrganizationCollaboration) },
      { key: 'Sponsored + No IP', match: (i: ContentItem) => (i.isSponsored ?? i.sponsored) && !(i.hasOrganizationLogo || i.hasOrganizationInCaption || i.isOrganizationCollaboration) }
    ];
    const noIpBaseline = withoutIp(filteredPool);
    const baselineMedian = median(noIpBaseline.map(getInteractions));
    return groups.map(group => {
      const sample = filteredPool.filter(group.match);
      const interactions = sample.map(getInteractions);
      const engagement = sample.map(getEngagement);
      const lift = baselineMedian > 0 ? ((median(interactions) - baselineMedian) / baselineMedian) * 100 : 0;
      return {
        label: group.key,
        sample: sample.length,
        medianInteractions: median(interactions),
        medianEngagement: median(engagement),
        lift
      };
    });
  }, [filteredPool]);

  const sponsorIntel = useMemo(() => {
    const sponsoredIp = sponsored(filteredPool).filter(i => i.sponsorPartner);
    const grouped = new Map<string, ContentItem[]>();
    sponsoredIp.forEach(item => {
      const key = item.sponsorPartner || 'Unknown';
      const bucket = grouped.get(key) || [];
      bucket.push(item);
      grouped.set(key, bucket);
    });
    const ranked = Array.from(grouped.entries()).map(([name, items]) => ({
      name,
      medianInteractions: median(items.map(getInteractions))
    })).sort((a, b) => b.medianInteractions - a.medianInteractions);

    const missed = new Map<string, number>();
    sponsored(filteredPool).forEach(item => {
      if (!item.sponsorPartner) return;
      const ipPresent = item.hasOrganizationLogo || item.hasOrganizationInCaption || item.isOrganizationCollaboration;
      if (ipPresent) return;
      missed.set(item.sponsorPartner, (missed.get(item.sponsorPartner) || 0) + 1);
    });
    const missedList = Array.from(missed.entries()).sort((a, b) => b[1] - a[1]);

    return { ranked, missedList };
  }, [filteredBase]);

  const renderPostRow = (item: ContentItem, size: 'sm' | 'md' = 'sm') => {
    const ipChips = [
      item.hasOrganizationLogo ? 'Visual' : null,
      item.hasOrganizationInCaption ? 'Mention' : null,
      item.isOrganizationCollaboration ? 'Org Collab' : null
    ].filter(Boolean) as string[];
    const isSponsored = item.isSponsored ?? item.sponsored ?? false;
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
                <img
                  src={thumb}
                  alt={`${item.athlete?.name || 'Athlete'} content`}
                  className={`${thumbSize} rounded-xl object-cover border border-gray-200 shadow-sm`}
                  loading="lazy"
                />
              </a>
            ) : (
              <div className={`${thumbSize} rounded-xl bg-gray-100 border border-gray-200`} />
            )}
            <div className="min-w-0">
              <div className="text-base md:text-lg font-semibold text-gray-900 truncate">
                {item.athlete?.school?.name || 'Unknown School'}
              </div>
              <div className="text-[13px] md:text-sm text-gray-600 truncate">
                {item.athlete?.name || 'Athlete'}
                {dateLabel ? ` • ${dateLabel}` : ''}
              </div>
              {item.caption && (
                <div className="text-sm text-gray-600 line-clamp-2 mt-1">{item.caption}</div>
              )}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ipChips.map((chip) => (
                  <span key={chip} className="content-chip">{chip}</span>
                ))}
                {isSponsored && <span className="content-chip">Sponsored</span>}
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

  const leaderboards = [
    { id: 'with-ip', title: 'Top posts WITH Playfly IP', items: topWithIp, counterpart: topWithoutIp },
    { id: 'without-ip', title: 'Top posts WITHOUT Playfly IP', items: topWithoutIp, counterpart: topWithIp },
    { id: 'sponsored-with-ip', title: 'Top Sponsored posts WITH Playfly IP', items: topSponsoredWithIp, counterpart: topSponsoredWithoutIp },
    { id: 'sponsored-without-ip', title: 'Top Sponsored posts WITHOUT Playfly IP', items: topSponsoredWithoutIp, counterpart: topSponsoredWithIp }
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

      {isLoading && (
        <GlassCard className="p-6 text-sm text-gray-500">Loading content data…</GlassCard>
      )}

      {/* Control Strip */}
      <GlassCard className="p-5 content-section">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
          <div className="w-full md:w-56">
              <label className="text-xs text-gray-600 mb-1 block">Section view</label>
            <select
              value={sectionScope}
              onChange={(e) => setSectionScope(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none"
              aria-label="Change school for this section only"
            >
              <option value="all">All Schools ({schools.length})</option>
              {schools.map((school) => (
                <option key={school} value={school}>{school}</option>
              ))}
            </select>
            {sectionScope !== 'all' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="metric-badge">Override active</span>
                <button
                  onClick={() => setSectionScope('all')}
                  className="text-[#1770C0] font-semibold"
                >
                  Reset to All Schools
                </button>
              </div>
            )}
          </div>
          <div className="w-full md:w-40">
              <label className="text-xs text-gray-600 mb-1 block">Sponsored</label>
            <select
              value={sponsoredFilter}
              onChange={(e) => setSponsoredFilter(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="sponsored">Sponsored</option>
              <option value="unsponsored">Non‑sponsored</option>
            </select>
          </div>
          <div className="w-full md:w-40">
              <label className="text-xs text-gray-600 mb-1 block">IP Mode</label>
            <select
              value={ipMode}
              onChange={(e) => setIpMode(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none"
            >
              <option value="all">All</option>
              <option value="with-ip">With IP</option>
              <option value="without-ip">Without IP</option>
            </select>
          </div>
          <div className="w-full md:w-44">
              <label className="text-xs text-gray-600 mb-1 block">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none"
            >
              <option value="interactions">Interactions</option>
              <option value="engagement">Engagement/Post</option>
              {hasEmv ? (
                <option value="emv">EMV</option>
              ) : (
                <option value="emv" disabled>EMV (N/A)</option>
              )}
            </select>
          </div>
          <div className="w-full md:flex-1">
              <label className="text-xs text-gray-600 mb-1 block">Search</label>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search athlete, caption, sponsor..."
              className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Pool: {sectionScope === 'all' ? 'All Schools' : sectionScope} • {sponsoredFilter === 'all' ? 'All posts' : sponsoredFilter === 'sponsored' ? 'Sponsored only' : 'Non-sponsored only'} • {ipMode === 'all' ? 'All IP modes' : ipMode === 'with-ip' ? 'With Playfly IP' : 'Without Playfly IP'}
        </div>
      </GlassCard>

      {!isLoading && contentData.length === 0 && (
        <GlassCard className="p-6 text-sm text-gray-500">No content data available.</GlassCard>
      )}

      {/* Champion Faceoff */}
      <GlassCard className="p-6 content-section">
        <div className="text-base font-semibold text-gray-900 mb-4">Champion Faceoff</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5 content-post-card">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-3">Best WITH Playfly IP</div>
            {championWithIp ? renderPostRow(championWithIp, 'md') : <div className="text-sm text-gray-500">No posts</div>}
          </GlassCard>
          <GlassCard className="p-5 content-post-card">
            <div className="text-xs uppercase tracking-wide text-gray-600 mb-3">Best WITHOUT Playfly IP</div>
            {championWithoutIp ? renderPostRow(championWithoutIp, 'md') : <div className="text-sm text-gray-500">No posts</div>}
          </GlassCard>
        </div>
      </GlassCard>

      {/* Top Posts Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leaderboards.map((board) => {
          const stats = getStats(board.items);
          const lift = liftLabel(board.items, board.counterpart);
          const statLine = (() => {
            if (sortBy === 'engagement') {
              return `Median engagement/post: ${formatPercent(stats.medianEngagement, 2)} • P75: ${formatPercent(stats.p75Engagement, 2)}`;
            }
            if (sortBy === 'emv' && hasEmv) {
              return `Median EMV: ${formatNumber(stats.medianEmv)} • P75: ${formatNumber(stats.p75Emv)}`;
            }
            return `Median interactions: ${formatNumber(stats.medianInteractions)} • P75: ${formatNumber(stats.p75Interactions)}`;
          })();
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

      {/* Signals Benchmark Matrix */}
      <GlassCard className="p-6 content-section">
        <div className="text-base font-semibold text-gray-900 mb-3">Signals Benchmark Matrix</div>
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-500">
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Signal Combination</th>
                <th className="text-right py-2">Sample size</th>
                <th className="text-right py-2">Median interactions</th>
                <th className="text-right py-2">Median engagement/post</th>
                <th className="text-right py-2">Lift vs No IP</th>
              </tr>
            </thead>
            <tbody>
              {signalsMatrix.map((row) => (
                <tr key={row.label} className="border-b border-gray-100">
                  <td className="py-3 font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      {row.label}
                      {row.sample >= 20 && row.lift > 0 && <span className="metric-badge">Playbook</span>}
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-800">{row.sample}</td>
                  <td className="py-3 text-right text-gray-800">{formatNumber(row.medianInteractions)}</td>
                  <td className="py-3 text-right text-gray-800">{row.medianEngagement.toFixed(2)}</td>
                  <td className={`py-3 text-right font-semibold ${row.lift >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.lift > 0 ? '+' : ''}{row.lift.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:hidden gap-3">
          {signalsMatrix.map((row) => (
            <GlassCard key={row.label} className="p-4 content-post-card">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900">{row.label}</div>
                {row.sample >= 20 && row.lift > 0 && <span className="metric-badge">Playbook</span>}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                <div>Sample size</div>
                <div className="text-right font-semibold text-gray-900">{row.sample}</div>
                <div>Median interactions</div>
                <div className="text-right font-semibold text-gray-900">{formatNumber(row.medianInteractions)}</div>
                <div>Median engagement/post</div>
                <div className="text-right font-semibold text-gray-900">{row.medianEngagement.toFixed(2)}</div>
                <div>Lift vs No IP</div>
                <div className={`text-right font-semibold ${row.lift >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {row.lift > 0 ? '+' : ''}{row.lift.toFixed(1)}%
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </GlassCard>

      {/* Sponsor Partner Intelligence */}
      <GlassCard className="p-6 content-section">
        <div className="text-base font-semibold text-gray-900 mb-4">Sponsor Partner Intelligence</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5 content-post-card">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Top Sponsored + IP (Median Interactions)</div>
            {sponsorIntel.ranked.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm text-gray-800 py-1">
                <span className="truncate">{item.name}</span>
                <span className="font-semibold">{formatNumber(item.medianInteractions)}</span>
              </div>
            ))}
          </GlassCard>
          <GlassCard className="p-5 content-post-card">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Missed Opportunity (Sponsored without IP)</div>
            {sponsorIntel.missedList.slice(0, 5).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between text-sm text-gray-800 py-1">
                <span className="truncate">{name}</span>
                <span className="font-semibold">{count} posts</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
}
