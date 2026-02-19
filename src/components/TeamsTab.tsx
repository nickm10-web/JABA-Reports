import { useEffect, useMemo, useRef, useState } from 'react';
import { GlassCard, GlassPill, DrawerPanel } from './playfly/PlayflyUI';

type Timeframe = 'sevenDays' | 'thirtyDays' | 'ninetyDays';
type Platform = 'all' | 'instagram' | 'tiktok';
type SortKey = 'engagementRate' | 'interactions' | 'followers' | 'posts';

interface TeamMetricsSlice {
  followers: number;
  likes: number;
  comments: number;
  engagementRate: number;
  contentCount: number;
  sponsoredContentCount: number;
  logoContentCount: number;
  collaborationContentCount: number;
  engagementRateLogoLift: number;
  engagementRateCollaborationLift: number;
  engagementRateSponsoredLift: number;
}

interface TeamRecord {
  _id: { $oid: string };
  profileIds: Array<{ $oid: string }>;
  profilePicture?: string;
  conferenceName?: string;
  schoolName: string;
  sport: string;
  metrics: {
    sevenDays: TeamMetricsSlice;
    thirtyDays: TeamMetricsSlice;
    ninetyDays: TeamMetricsSlice;
    platforms?: {
      instagram?: {
        sevenDays: TeamMetricsSlice;
        thirtyDays: TeamMetricsSlice;
        ninetyDays: TeamMetricsSlice;
      };
      tiktok?: {
        sevenDays: TeamMetricsSlice;
        thirtyDays: TeamMetricsSlice;
        ninetyDays: TeamMetricsSlice;
      };
    };
  };
}

interface TeamContent {
  _id: string;
  caption?: string;
  hasOrganizationLogo?: boolean;
  isSponsored?: boolean;
  mediaType?: string;
  metrics?: { likes?: number; comments?: number; engagementRate?: number };
  permalink?: string;
  publishedAt?: { $date?: string } | string;
  sponsorPartner?: string;
  team?: {
    name?: string;
    school?: { name?: string };
    conference?: { name?: string };
    league?: { name?: string };
  };
  url?: string;
}

interface TeamsTabProps {
  playflySchools: string[];
}

const formatNumber = (num: number) => Math.round(num).toLocaleString();
const formatShort = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return Math.round(num).toLocaleString();
};
const formatPercent = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const formatTeamSport = (value?: string) => {
  if (!value) return 'Team';
  const parts = value
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => {
      if (part === 'mens' || part === 'men') return "Men's";
      if (part === 'womens' || part === 'women') return "Women's";
      if (part === 'tfxc') return 'TF/XC';
      if (part === 'xc') return 'XC';
      return part.charAt(0).toUpperCase() + part.slice(1);
    });
  return parts.join(' ');
};

const getDateLabel = (value?: TeamContent['publishedAt']) => {
  if (!value) return '';
  const raw = typeof value === 'string' ? value : value.$date;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
const getTeamKey = (schoolName?: string, sport?: string) => `${schoolName || ''}|||${sport || ''}`;
const getPublishedAtMs = (value?: TeamContent['publishedAt']) => {
  if (!value) return 0;
  const raw = typeof value === 'string' ? value : value.$date;
  if (!raw) return 0;
  const ms = new Date(raw).getTime();
  return Number.isFinite(ms) ? ms : 0;
};

const placeholderImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="14" fill="%23f1f5f9"/><path d="M28 64h40a6 6 0 0 0 6-6V38a6 6 0 0 0-6-6H28a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6zm8-12 8-10 10 12 6-8 8 10H36z" fill="%2394a3b8"/><circle cx="60" cy="44" r="4" fill="%2394a3b8"/></svg>';
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
const normalizeSponsorKey = (value?: string) => (value || '').toLowerCase().replace(/^@/, '').replace(/[\s._-]+/g, '');

export function TeamsTab({ playflySchools }: TeamsTabProps) {
  const [teamsData, setTeamsData] = useState<TeamRecord[]>([]);
  const [teamContents, setTeamContents] = useState<TeamContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scope] = useState<'playfly'>('playfly');
  const [timeframe] = useState<Timeframe>('ninetyDays');
  const [platform] = useState<Platform>('instagram');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [conferenceFilter, setConferenceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('followers');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState<'cards' | 'table'>('table');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const tableRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rowHeight = 46;
  const viewportHeight = 520;

  useEffect(() => {
    const load = async () => {
      try {
        const [teamsRes, contentsRes] = await Promise.all([
          fetch('/data/Teams.json').then(r => r.ok ? r.json() : []),
          fetch('/data/Team_contents.json').then(r => r.ok ? r.json() : [])
        ]);
        setTeamsData(Array.isArray(teamsRes) ? teamsRes : []);
        setTeamContents(Array.isArray(contentsRes) ? contentsRes : []);
      } catch {
        setTeamsData([]);
        setTeamContents([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const playflySet = useMemo(() => new Set(playflySchools), [playflySchools]);

  const getSlice = (team: TeamRecord, tf: Timeframe, pf: Platform): TeamMetricsSlice => {
    if (pf === 'all') return team.metrics[tf];
    const platformData = team.metrics.platforms?.[pf];
    return platformData ? platformData[tf] : team.metrics[tf];
  };

  const filteredTeams = useMemo(() => {
    return teamsData.filter(team => {
      // Exclude teams with zero content across all timeframes
      if (team.metrics.ninetyDays.contentCount === 0 && team.metrics.thirtyDays.contentCount === 0 && team.metrics.sevenDays.contentCount === 0) return false;
      if (scope === 'playfly' && !playflySet.has(team.schoolName)) return false;
      if (schoolFilter !== 'all' && team.schoolName !== schoolFilter) return false;
      if (sportFilter !== 'all' && team.sport !== sportFilter) return false;
      if (conferenceFilter !== 'all' && (team.conferenceName || 'Unknown') !== conferenceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${team.schoolName} ${team.sport}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teamsData, scope, playflySet, schoolFilter, sportFilter, conferenceFilter, searchQuery]);

  const recent12StatsByTeam = useMemo(() => {
    const grouped = new Map<string, TeamContent[]>();
    for (const post of teamContents) {
      const schoolName = post.team?.school?.name;
      const sportName = post.team?.name;
      if (!schoolName || !sportName) continue;
      if (scope === 'playfly' && !playflySet.has(schoolName)) continue;
      const key = getTeamKey(schoolName, sportName);
      const list = grouped.get(key) || [];
      list.push(post);
      grouped.set(key, list);
    }
    const stats = new Map<string, { postsCount: number; interactions: number; engagementRate: number }>();
    for (const [key, posts] of grouped.entries()) {
      const recent = [...posts]
        .sort((a, b) => getPublishedAtMs(b.publishedAt) - getPublishedAtMs(a.publishedAt))
        .slice(0, 12);
      const postsCount = recent.length;
      const interactions = recent.reduce((sum, post) => sum + ((post.metrics?.likes || 0) + (post.metrics?.comments || 0)), 0);
      const engagementRate = postsCount > 0
        ? recent.reduce((sum, post) => sum + (post.metrics?.engagementRate || 0), 0) / postsCount
        : 0;
      stats.set(key, { postsCount, interactions, engagementRate });
    }
    return stats;
  }, [teamContents, scope, playflySet]);

  const baseTeams = useMemo(() => {
    return teamsData.filter(team => {
      if (team.metrics.ninetyDays.contentCount === 0 && team.metrics.thirtyDays.contentCount === 0 && team.metrics.sevenDays.contentCount === 0) return false;
      if (schoolFilter !== 'all' && team.schoolName !== schoolFilter) return false;
      if (sportFilter !== 'all' && team.sport !== sportFilter) return false;
      if (conferenceFilter !== 'all' && (team.conferenceName || 'Unknown') !== conferenceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${team.schoolName} ${team.sport}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teamsData, schoolFilter, sportFilter, conferenceFilter, searchQuery]);

  const teamRows = useMemo(() => {
    return filteredTeams.map(team => {
      const slice = getSlice(team, timeframe, platform);
      const key = getTeamKey(team.schoolName, team.sport);
      const recent = recent12StatsByTeam.get(key);
      const interactions = recent?.interactions ?? ((slice.likes || 0) + (slice.comments || 0));
      const engagementRate = recent?.engagementRate ?? slice.engagementRate;
      const postsCount = recent?.postsCount ?? Math.min(slice.contentCount || 0, 12);
      const logoAdoption = slice.contentCount > 0 ? (slice.logoContentCount / slice.contentCount) * 100 : 0;
      return {
        id: team._id.$oid,
        team,
        slice,
        interactions,
        engagementRate,
        postsCount,
        logoAdoption
      };
    });
  }, [filteredTeams, timeframe, platform, recent12StatsByTeam]);

  const baseRows = useMemo(() => {
    return baseTeams.map(team => {
      const slice = getSlice(team, timeframe, platform);
      const key = getTeamKey(team.schoolName, team.sport);
      const recent = recent12StatsByTeam.get(key);
      const interactions = recent?.interactions ?? ((slice.likes || 0) + (slice.comments || 0));
      const engagementRate = recent?.engagementRate ?? slice.engagementRate;
      const postsCount = recent?.postsCount ?? Math.min(slice.contentCount || 0, 12);
      const logoAdoption = slice.contentCount > 0 ? (slice.logoContentCount / slice.contentCount) * 100 : 0;
      return {
        id: team._id.$oid,
        team,
        slice,
        interactions,
        engagementRate,
        postsCount,
        logoAdoption,
        isPlayfly: playflySet.has(team.schoolName)
      };
    });
  }, [baseTeams, timeframe, platform, playflySet, recent12StatsByTeam]);

  const sortedTeams = useMemo(() => {
    const sorted = [...teamRows].sort((a, b) => {
      const aVal = sortKey === 'engagementRate'
          ? a.engagementRate
          : sortKey === 'interactions'
            ? a.interactions
            : sortKey === 'posts'
              ? a.postsCount
              : a.slice.followers;
      const bVal = sortKey === 'engagementRate'
          ? b.engagementRate
          : sortKey === 'interactions'
            ? b.interactions
            : sortKey === 'posts'
              ? b.postsCount
              : b.slice.followers;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [teamRows, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const scrollHandler = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalRows = sortedTeams.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 6);
  const endIndex = Math.min(totalRows, startIndex + Math.ceil(viewportHeight / rowHeight) + 12);
  const visibleRows = sortedTeams.slice(startIndex, endIndex);

  const selectedTeam = selectedTeamId ? baseRows.find(t => t.id === selectedTeamId) : null;

  const getInteractions = (post: TeamContent) => {
    const likes = post.metrics?.likes || 0;
    const comments = post.metrics?.comments || 0;
    return likes + comments;
  };

  if (isLoading) {
    return <GlassCard className="p-6 text-sm text-gray-500">Loading team data…</GlassCard>;
  }

  const schools = Array.from(new Set(baseTeams.filter(t => playflySet.has(t.schoolName)).map(t => t.schoolName))).sort();
  const sports = Array.from(new Set(baseTeams.map(t => t.sport))).sort();
  const conferences = Array.from(new Set(baseTeams.map(t => t.conferenceName || 'Unknown'))).sort();

  return (
    <div className="space-y-8">
      <div className="sticky top-4 z-30">
        <GlassCard className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Teams</h3>
              <p className="text-sm text-gray-600">Team account performance across all Playfly schools.</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Scope</div>
                <div className="text-sm font-semibold text-gray-900">Playfly Schools ({playflySchools.length})</div>
              </div>
              <div className="flex gap-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Platform</div>
                <div className="text-sm font-semibold text-gray-900">Instagram</div>
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team or school"
                className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 hidden md:flex flex-wrap gap-3">
            <div className="w-full sm:w-56">
              <label className="text-xs text-gray-600 mb-1 block">School</label>
              <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none">
                <option value="all">All Schools</option>
                {schools.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs text-gray-600 mb-1 block">Sport</label>
              <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none">
                <option value="all">All Sports</option>
                {sports.map(s => <option key={s} value={s}>{formatTeamSport(s)}</option>)}
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-xs text-gray-600 mb-1 block">Conference</label>
              <select value={conferenceFilter} onChange={(e) => setConferenceFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none">
                <option value="all">All Conferences</option>
                {conferences.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 md:hidden">
            <GlassPill className="pf-chip-compact" onClick={() => setFiltersOpen(true)}>Filters</GlassPill>
          </div>
        </GlassCard>
      </div>


      <div className="grid grid-cols-1 gap-6">
        <GlassCard className="overflow-hidden">
          <div className="px-4 pt-3 pb-1 text-xs text-gray-600">
            Metrics in this table are based on each account&apos;s most recent 12 posts.
          </div>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden">
            <div className="text-sm text-gray-600">Showing {sortedTeams.length} teams</div>
            <div className="flex gap-2">
              <GlassPill active={leaderboardView === 'cards'} onClick={() => setLeaderboardView('cards')}>Cards</GlassPill>
              <GlassPill active={leaderboardView === 'table'} onClick={() => setLeaderboardView('table')}>Table</GlassPill>
            </div>
          </div>

          <div className={`${leaderboardView === 'cards' ? 'block' : 'hidden'} md:hidden p-4 space-y-4`}>
            {sortedTeams.map(row => (
              <GlassCard key={row.id} className="p-4" onClick={() => { setSelectedTeamId(row.id); setDrawerOpen(true); }}>
              <div className="font-semibold text-gray-900">
                {row.team.schoolName} • {formatTeamSport(row.team.sport)}
              </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                  <div>Followers</div>
                  <div className="text-right font-semibold">{formatShort(row.slice.followers)}</div>
                  <div>Posts</div>
                  <div className="text-right font-semibold">{formatShort(row.postsCount)}</div>
                  <div>Engagement</div>
                  <div className="text-right font-semibold">{formatPercent(row.engagementRate, 2)}</div>
                  <div>Interactions</div>
                  <div className="text-right font-semibold">{formatShort(row.interactions)}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className={`${leaderboardView === 'table' ? 'block' : 'hidden'} md:block`}>
            <div className="overflow-auto" style={{ maxHeight: `${viewportHeight}px` }} onScroll={scrollHandler} ref={tableRef}>
              <table className="w-full table-fixed">
                <thead className="border-b border-gray-200 bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-[220px]">Team</th>
                    <th onClick={() => handleSort('followers')} className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[90px] cursor-pointer" title="Followers">Followers {sortKey === 'followers' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</th>
                    <th onClick={() => handleSort('posts')} className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[80px] cursor-pointer" title="Content Count">Posts {sortKey === 'posts' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</th>
                    <th onClick={() => handleSort('engagementRate')} className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[90px] cursor-pointer" title="Engagement Rate">Eng. {sortKey === 'engagementRate' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</th>
                    <th onClick={() => handleSort('interactions')} className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[100px] cursor-pointer" title="Likes + Comments">Interactions {sortKey === 'interactions' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ height: `${startIndex * rowHeight}px` }} />
                  {visibleRows.map(row => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/60 cursor-pointer ${selectedTeamId === row.id ? 'bg-blue-50' : ''}`}
                      style={{ height: `${rowHeight}px` }}
                      onClick={() => { setSelectedTeamId(row.id); setDrawerOpen(true); }}
                    >
                      <td className="px-3 py-2 text-sm text-gray-900 font-semibold truncate">
                        {row.team.schoolName} • {formatTeamSport(row.team.sport)}
                      </td>
                      <td className="px-3 py-2 text-right text-sm">{formatShort(row.slice.followers)}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatShort(row.postsCount)}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatPercent(row.engagementRate, 2)}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatShort(row.interactions)}</td>
                    </tr>
                  ))}
                  <tr style={{ height: `${Math.max(0, (totalRows - endIndex) * rowHeight)}px` }} />
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

      </div>
      <DrawerPanel
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTeam ? `${selectedTeam.team.schoolName} • ${formatTeamSport(selectedTeam.team.sport)}` : 'Team Detail'}
        side="right"
      >
        {selectedTeam && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedTeam.team.profilePicture && (
                <img src={selectedTeam.team.profilePicture} alt={selectedTeam.team.schoolName} className="h-12 w-12 rounded-full object-cover" />
              )}
              <div>
                <div className="text-sm font-semibold text-gray-900">{selectedTeam.team.schoolName}</div>
                <div className="text-xs text-gray-500">{formatTeamSport(selectedTeam.team.sport)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>Followers</div><div className="text-right font-semibold text-gray-900">{formatShort(selectedTeam.slice.followers)}</div>
              <div>Posts (Last 12)</div><div className="text-right font-semibold text-gray-900">{formatShort(selectedTeam.postsCount)}</div>
              <div>Engagement Rate</div><div className="text-right font-semibold text-gray-900">{formatPercent(selectedTeam.engagementRate, 2)}</div>
              <div>Interactions</div><div className="text-right font-semibold text-gray-900">{formatShort(selectedTeam.interactions)}</div>
            </div>
            <GlassCard className="p-4">
              <div className="text-xs text-gray-500 mb-2">Content Mix</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Sponsored %</div><div className="text-right font-semibold text-gray-900">{selectedTeam.slice.contentCount ? ((selectedTeam.slice.sponsoredContentCount / selectedTeam.slice.contentCount) * 100).toFixed(1) : '0'}%</div>
                <div>Logo %</div><div className="text-right font-semibold text-gray-900">{selectedTeam.slice.contentCount ? ((selectedTeam.slice.logoContentCount / selectedTeam.slice.contentCount) * 100).toFixed(1) : '0'}%</div>
                <div>Collaboration %</div><div className="text-right font-semibold text-gray-900">{selectedTeam.slice.contentCount ? ((selectedTeam.slice.collaborationContentCount / selectedTeam.slice.contentCount) * 100).toFixed(1) : '0'}%</div>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="text-xs text-gray-500 mb-2">Lift Summary</div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Sponsored Lift</div><div className="text-right font-semibold text-gray-900">{formatPercent(selectedTeam.slice.engagementRateSponsoredLift || 0, 2)}</div>
                <div>Collaboration Lift</div><div className="text-right font-semibold text-gray-900">{formatPercent(selectedTeam.slice.engagementRateCollaborationLift || 0, 2)}</div>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="text-xs text-gray-500 mb-3">Top Sponsored Posts</div>
              <div className="space-y-3">
                {(() => {
                  const teamPosts = teamContents.filter(post =>
                    post.team?.school?.name === selectedTeam.team.schoolName &&
                    post.team?.name === selectedTeam.team.sport &&
                    post.isSponsored &&
                    !EXCLUDED_SPONSOR_KEYS.has(normalizeSponsorKey(post.sponsorPartner))
                  );
                  const sponsored = teamPosts.sort((a, b) => getInteractions(b) - getInteractions(a)).slice(0, 3);
                  return sponsored.map(post => (
                    <div key={post._id} className="flex items-start gap-3">
                      <a href={post.permalink || post.url} target="_blank" rel="noreferrer">
                        <img
                          src={post.url || placeholderImage}
                          alt=""
                          className="h-14 w-14 rounded-lg object-cover border border-slate-200 bg-white"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImage; }}
                        />
                      </a>
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">{getDateLabel(post.publishedAt)}</div>
                        <div className="text-sm font-semibold text-gray-900 truncate">{post.caption || 'Post'}</div>
                        <div className="text-xs text-gray-600">{formatNumber(post.metrics?.likes || 0)} likes • {formatNumber(post.metrics?.comments || 0)} comments • {formatPercent(post.metrics?.engagementRate || 0, 2)}</div>
                        <span className="content-chip mt-1 inline-block">Sponsored</span>
                        {post.sponsorPartner && <span className="content-chip mt-1 inline-block ml-1">{post.sponsorPartner}</span>}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </GlassCard>
          </div>
        )}
      </DrawerPanel>

      <DrawerPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        side="bottom"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">School</label>
            <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none">
              <option value="all">All Schools</option>
              {schools.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Sport</label>
            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none">
              <option value="all">All Sports</option>
              {sports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Conference</label>
            <select value={conferenceFilter} onChange={(e) => setConferenceFilter(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 focus:border-[#1770C0] focus:outline-none">
              <option value="all">All Conferences</option>
              {conferences.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => setFiltersOpen(false)} className="w-full mt-2 px-4 py-2 rounded-full bg-[#1770C0] text-white font-semibold">Apply Filters</button>
        </div>
      </DrawerPanel>
    </div>
  );
}
