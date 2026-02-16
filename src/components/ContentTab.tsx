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

interface TeamContent {
  _id: string;
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
  team?: {
    name?: string;
    school?: { name?: string };
  };
}

const formatNumber = (num: number) => Math.round(num).toLocaleString();
const formatPercent = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const PLAYFLY_15_SCHOOLS = new Set([
  'Auburn University',
  'Baylor',
  'George Mason',
  'Louisiana State University',
  'Michigan State',
  'Old Dominion University',
  'Penn State University',
  'Texas A&M',
  'University of Central Florida',
  'University of Maryland',
  'University of Nebraska',
  'University of New Mexico',
  'University of Texas at San Antonio (UTSA)',
  'University of Virginia',
  'Wichita State University',
]);
const EXCLUDED_SPONSOR_KEYS = new Set([
  'baylormbb',
  'huskerfootball',
  'pennstatevb',
  'huskervb',
  'aggiefootball',
  'athletenarrative',
  'on3recruits',
  'nikeeyb',
  'victoryplustv',
  'thefamilie',
  'walkons',
  '12thmanfoundation',
  'cornermediaco',
  'terpswbb',
  'nileliteladies',
  'baylornilstore',
  'academy',
  'huskermbb',
  'prideofodunil',
  'msunilstore',
]);
const TEAM_SPORT_TOKENS = [
  'football','fb','basketball','mbb','wbb','baseball','softball','soccer','volleyball','vb','vball',
  'tfxc','track','xc','crosscountry','wrest','wrestling','golf','tennis','lacrosse','hockey','swim',
  'swimming','gym','gymnastics','fieldhockey','rowing','crew','athletics','womens','mens','women','men'
];
const TEAM_PAGE_TOKENS = ['athletics', 'sports', 'official', 'recruiting', 'recruits', 'studentathlete'];

export function ContentTab() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [teamContentRaw, setTeamContentRaw] = useState<TeamContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentSource, setContentSource] = useState<'athlete' | 'team'>('athlete');

  useEffect(() => {
    Promise.all([
      fetch('/data/playfly-content-processed.json').then(res => res.ok ? res.json() : null),
      fetch('/data/Team_contents.json').then(res => res.ok ? res.json() : []),
    ])
      .then(([athleteData, teamData]) => {
        setProcessedData(athleteData);
        setTeamContentRaw(Array.isArray(teamData) ? teamData : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);


  const getInteractions = (item: ContentItem) => {
    const likes = item.metrics?.likes || 0;
    const comments = item.metrics?.comments || 0;
    return likes + comments;
  };
  const getEngagement = (item: ContentItem) => item.metrics?.engagementRate || 0;
  const normalizeKey = (value?: string) => (value || '').toLowerCase().replace(/^@/, '').replace(/[\s._-]+/g, '');
  const getSchoolAliases = (schoolName: string) => {
    const stop = new Set(['university', 'college', 'state', 'of', 'the', 'at', 'and']);
    const tokens = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t && !stop.has(t));
    const initials = tokens.map(t => t[0]).join('');
    const aliases = new Set<string>([...tokens, initials]);
    const lower = schoolName.toLowerCase();
    if (lower.includes('texas a') || lower.includes('a&m')) { aliases.add('tamu'); aliases.add('aggie'); aliases.add('aggies'); }
    if (lower.includes('texas a') || lower.includes('a&m')) { aliases.add('gigem'); }
    if (lower.includes('nebraska')) { aliases.add('husker'); aliases.add('huskers'); }
    if (lower.includes('louisiana state')) { aliases.add('lsu'); }
    if (lower.includes('michigan state')) { aliases.add('msu'); aliases.add('spartan'); aliases.add('spartans'); }
    if (lower.includes('penn state')) { aliases.add('psu'); aliases.add('pennstate'); aliases.add('nittany'); }
    if (lower.includes('old dominion')) { aliases.add('odu'); aliases.add('monarch'); aliases.add('monarchs'); }
    if (lower.includes('central florida')) { aliases.add('ucf'); aliases.add('knights'); }
    if (lower.includes('texas at san antonio') || lower.includes('utsa')) { aliases.add('utsa'); aliases.add('roadrunners'); }
    if (lower.includes('virginia')) { aliases.add('uva'); aliases.add('cavs'); aliases.add('cavalier'); }
    return [...aliases].filter(a => a.length >= 2);
  };
  const isExcludedSponsoredItem = (item: ContentItem) => {
    const schoolName = item.athlete?.school?.name || '';
    const sponsorKey = normalizeKey(item.sponsorPartner);
    if (!sponsorKey) return false;
    if (EXCLUDED_SPONSOR_KEYS.has(sponsorKey)) return true;
    const aliases = getSchoolAliases(schoolName);
    const hasAlias = aliases.some(a => sponsorKey.includes(a));
    if (!hasAlias) return false;
    const hasTeamContext =
      TEAM_SPORT_TOKENS.some(t => sponsorKey.includes(t)) ||
      TEAM_PAGE_TOKENS.some(t => sponsorKey.includes(t)) ||
      aliases.includes(sponsorKey);
    return hasTeamContext;
  };
  const hasSchoolIP = (item: ContentItem) => {
    if (item.hasOrganizationLogo || item.hasOrganizationInCaption || item.isOrganizationCollaboration) return true;
    const schoolName = item.athlete?.school?.name || '';
    const caption = (item.caption || '').toLowerCase();
    if (!schoolName || !caption) return false;
    const aliases = getSchoolAliases(schoolName);
    return aliases.some((alias) => {
      if (alias.length < 3) return false;
      return caption.includes(`#${alias}`) || caption.includes(`@${alias}`) || caption.includes(alias);
    });
  };
  const sanitizeSponsoredFlags = (item: ContentItem): ContentItem => {
    if (!isExcludedSponsoredItem(item)) return item;
    return {
      ...item,
      isSponsored: false,
      sponsorPartner: '',
    };
  };

  const calcStats = (items: ContentItem[]): ScopeStats => {
    if (!items.length) {
      return { medianInteractions: 0, p75Interactions: 0, medianEngagement: 0, p75Engagement: 0, count: 0 };
    }
    const interactions = items.map(getInteractions).sort((a, b) => a - b);
    const engagements = items.map(getEngagement).sort((a, b) => a - b);
    const percentile = (arr: number[], p: number) => {
      const idx = Math.max(0, Math.min(arr.length - 1, Math.floor((arr.length - 1) * p)));
      return arr[idx] || 0;
    };
    return {
      medianInteractions: percentile(interactions, 0.5),
      p75Interactions: percentile(interactions, 0.75),
      medianEngagement: percentile(engagements, 0.5),
      p75Engagement: percentile(engagements, 0.75),
      count: items.length,
    };
  };

  const allScopeExcludingUsc: ScopeData | null = useMemo(() => {
    if (!processedData) return null;
    const includedSchools = Object.keys(processedData.bySchool || {}).filter((school) => PLAYFLY_15_SCHOOLS.has(school));
    const mergeAndSort = (selector: (scope: ScopeData) => ContentItem[]) =>
      includedSchools
        .flatMap((school) => selector(processedData.bySchool[school] || processedData.all))
        .sort((a, b) => getInteractions(b) - getInteractions(a));

    const topWithIp = mergeAndSort((s) => s.topWithIp || []).map(sanitizeSponsoredFlags);
    const topWithoutIp = mergeAndSort((s) => s.topWithoutIp || []).map(sanitizeSponsoredFlags);
    const sponsoredPool = Array.from(
      new Map(
        [
          ...mergeAndSort((s) => s.topSponsoredWithIp || []),
          ...mergeAndSort((s) => s.topSponsoredWithoutIp || []),
        ]
          .map(sanitizeSponsoredFlags)
          .filter((item) => item.isSponsored)
          .map((item) => [item._id, item] as const)
      ).values()
    ).sort((a, b) => getInteractions(b) - getInteractions(a));
    const topSponsoredWithIp = sponsoredPool.filter((item) => hasSchoolIP(item));
    const topSponsoredWithoutIp = sponsoredPool.filter((item) => !hasSchoolIP(item));

    return {
      topWithIp,
      topWithoutIp,
      topSponsoredWithIp,
      topSponsoredWithoutIp,
      statsWithIp: calcStats(topWithIp),
      statsWithoutIp: calcStats(topWithoutIp),
      statsSponsoredWithIp: calcStats(topSponsoredWithIp),
      statsSponsoredWithoutIp: calcStats(topSponsoredWithoutIp),
      signalsMatrix: [],
      sponsorIntel: { ranked: [], missedList: [] },
    };
  }, [processedData]);

  const cleanScope = (raw: ScopeData | null): ScopeData | null => {
    if (!raw) return raw;
    const topWithIp = (raw.topWithIp || []).map(sanitizeSponsoredFlags);
    const topWithoutIp = (raw.topWithoutIp || []).map(sanitizeSponsoredFlags);
    const sponsoredPool = Array.from(
      new Map(
        [...(raw.topSponsoredWithIp || []), ...(raw.topSponsoredWithoutIp || [])]
          .map(sanitizeSponsoredFlags)
          .filter((item) => item.isSponsored)
          .map((item) => [item._id, item] as const)
      ).values()
    ).sort((a, b) => getInteractions(b) - getInteractions(a));
    const topSponsoredWithIp = sponsoredPool.filter((item) => hasSchoolIP(item));
    const topSponsoredWithoutIp = sponsoredPool.filter((item) => !hasSchoolIP(item));
    return {
      ...raw,
      topWithIp,
      topWithoutIp,
      topSponsoredWithIp,
      topSponsoredWithoutIp,
      statsSponsoredWithIp: calcStats(topSponsoredWithIp),
      statsSponsoredWithoutIp: calcStats(topSponsoredWithoutIp),
    };
  };

  const athleteScope: ScopeData | null = useMemo(() => cleanScope(allScopeExcludingUsc), [allScopeExcludingUsc]);

  const teamScope: ScopeData | null = useMemo(() => {
    const teamItems: ContentItem[] = teamContentRaw
      .filter((post) => PLAYFLY_15_SCHOOLS.has(post.team?.school?.name || ''))
      .map((post) => ({
        _id: post._id,
        athlete: {
          name: post.team?.name || 'Team',
          school: { name: post.team?.school?.name || 'Unknown School' },
        },
        caption: post.caption,
        publishedAt: post.publishedAt,
        permalink: post.permalink,
        url: post.url,
        sponsorPartner: post.sponsorPartner,
        isSponsored: post.isSponsored,
        isOrganizationCollaboration: post.isOrganizationCollaboration,
        hasOrganizationInCaption: post.hasOrganizationInCaption,
        hasOrganizationLogo: post.hasOrganizationLogo,
        metrics: post.metrics,
      }));
    if (!teamItems.length) return null;
    const sorted = teamItems.sort((a, b) => getInteractions(b) - getInteractions(a));
    const sponsoredPool = sorted.filter((item) => item.isSponsored);
    const topWithIp = sorted;
    const topWithoutIp: ContentItem[] = [];
    const topSponsoredWithIp = sponsoredPool;
    const topSponsoredWithoutIp: ContentItem[] = [];
    return {
      topWithIp,
      topWithoutIp,
      topSponsoredWithIp,
      topSponsoredWithoutIp,
      statsWithIp: calcStats(topWithIp),
      statsWithoutIp: calcStats(topWithoutIp),
      statsSponsoredWithIp: calcStats(topSponsoredWithIp),
      statsSponsoredWithoutIp: calcStats(topSponsoredWithoutIp),
      signalsMatrix: [],
      sponsorIntel: { ranked: [], missedList: [] },
    };
  }, [teamContentRaw]);

  const scope: ScopeData | null = contentSource === 'athlete' ? athleteScope : teamScope;

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
    const thumbSize = size === 'md' ? 'h-24 w-24' : 'h-20 w-20';
    const thumb = item.url || '';
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            {thumb ? (
              <a href={item.permalink || thumb} target="_blank" rel="noreferrer" className={`${thumbSize} shrink-0 flex-none rounded-2xl overflow-hidden border border-gray-200 shadow-sm`}>
                <img src={thumb} alt={`${item.athlete?.name || 'Athlete'} content`} className="w-full h-full object-cover" loading="lazy" />
              </a>
            ) : (
              <div className={`${thumbSize} shrink-0 flex-none rounded-2xl bg-gray-100 border border-gray-200`} />
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

  if (contentSource === 'team') {
    return (
      <div className="content-tab space-y-8">
        <div>
          <h3 className="text-2xl md:text-3xl pf-section-header">
            <span className="pf-header-primary">Content </span>
            <span className="pf-header-secondary">Performance</span>
          </h3>
          <p className="text-gray-700 mt-2 text-sm md:text-base">Top posts and IP signal benchmarks across Playfly schools</p>
        </div>

        <GlassCard className="p-5 content-section">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-full text-sm font-semibold border transition bg-white border-gray-200 text-gray-700"
              onClick={() => setContentSource('athlete')}
            >
              Athlete content
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-full text-sm font-semibold border transition bg-[#E8F2FB] border-[#9EC3E8] text-[#1770C0]"
              onClick={() => setContentSource('team')}
            >
              Team page content
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            Source: Team pages • Sorted by interactions
          </div>
        </GlassCard>

        <GlassCard className="p-6 content-section">
          <div className="text-base font-semibold text-gray-900 mb-1">Top 10 Team Page Posts</div>
          <div className="text-xs text-gray-600 mb-4">Ranked by interactions</div>
          <div className="space-y-3">
            {scope.topWithIp.slice(0, 10).map((item, idx) => (
              <GlassCard key={item._id} className="p-4 content-post-card">
                <div className="text-xs font-semibold text-gray-500 mb-2">#{idx + 1}</div>
                {renderPostRow(item)}
              </GlassCard>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  const leaderboards = [
    {
      id: 'sponsored-with-ip',
      title: 'Top Sponsored posts WITH School IP',
      items: scope.topSponsoredWithIp,
      stats: scope.statsSponsoredWithIp,
      counterStats: scope.statsSponsoredWithoutIp
    },
    {
      id: 'sponsored-without-ip',
      title: 'Top Sponsored posts WITHOUT School IP',
      items: scope.topSponsoredWithoutIp,
      stats: scope.statsSponsoredWithoutIp,
      counterStats: scope.statsSponsoredWithIp
    },
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

      {/* Content Source Toggle */}
      <GlassCard className="p-5 content-section">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              contentSource === 'athlete'
                ? 'bg-[#E8F2FB] border-[#9EC3E8] text-[#1770C0]'
                : 'bg-white border-gray-200 text-gray-700'
            }`}
            onClick={() => setContentSource('athlete')}
          >
            Athlete content
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-full text-sm font-semibold border transition bg-white border-gray-200 text-gray-700"
            onClick={() => setContentSource('team')}
          >
            Team page content
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Source: {contentSource === 'athlete' ? 'Athlete accounts' : 'Team pages'} • Sorted by interactions
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
      <GlassCard className="p-6 content-section">
        <div className="hidden lg:grid grid-cols-2 gap-6">
          {leaderboards.map(board => {
            const statLine = `Median interactions: ${formatNumber(board.stats.medianInteractions)} • P75: ${formatNumber(board.stats.p75Interactions)}`;
            const lift = liftLabel(board.stats, board.counterStats);
            return (
              <div key={board.id}>
                <div className="text-base font-semibold text-gray-900">{board.title}</div>
                <div className="text-xs text-gray-600 mt-1">{statLine}</div>
                <div className="text-xs text-gray-600">Lift vs counterpart: {lift}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-3 hidden lg:block">
          {Array.from({ length: 9 }).map((_, idx) => {
            const rank = idx + 2;
            const withItem = leaderboards[0].items[rank - 1];
            const withoutItem = leaderboards[1].items[rank - 1];
            return (
              <div key={`rank-row-${idx}`} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GlassCard className="p-4 content-post-card">
                  <div className="text-xs font-semibold text-gray-500 mb-2">#{rank}</div>
                  {withItem ? renderPostRow(withItem) : <div className="text-sm text-gray-400">N/A</div>}
                </GlassCard>
                <GlassCard className="p-4 content-post-card">
                  <div className="text-xs font-semibold text-gray-500 mb-2">#{rank}</div>
                  {withoutItem ? renderPostRow(withoutItem) : <div className="text-sm text-gray-400">N/A</div>}
                </GlassCard>
              </div>
            );
          })}
        </div>

        <div className="lg:hidden space-y-6">
          {leaderboards.map((board) => {
            const statLine = `Median interactions: ${formatNumber(board.stats.medianInteractions)} • P75: ${formatNumber(board.stats.p75Interactions)}`;
            const lift = liftLabel(board.stats, board.counterStats);
            return (
              <div key={`mobile-${board.id}`}>
                <div className="text-base font-semibold text-gray-900">{board.title}</div>
                <div className="text-xs text-gray-600 mt-1">{statLine}</div>
                <div className="text-xs text-gray-600">Lift vs counterpart: {lift}</div>
                <div className="mt-3 space-y-3">
                  {board.items.slice(1, 10).map((item, idx) => (
                    <GlassCard key={`mobile-${board.id}-${item._id}`} className="p-4 content-post-card">
                      <div className="text-xs font-semibold text-gray-500 mb-2">#{idx + 2}</div>
                      {renderPostRow(item)}
                    </GlassCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

    </div>
  );
}
