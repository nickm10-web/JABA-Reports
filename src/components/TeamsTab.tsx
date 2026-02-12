import { useEffect, useMemo, useRef, useState } from 'react';
import { GlassCard, GlassPill, DrawerPanel } from './playfly/PlayflyUI';

type Timeframe = 'sevenDays' | 'thirtyDays' | 'ninetyDays';
type Platform = 'all' | 'instagram' | 'tiktok';
type SortKey = 'adoption' | 'engagementRate' | 'interactions' | 'followers';

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

const getDateLabel = (value?: TeamContent['publishedAt']) => {
  if (!value) return '';
  const raw = typeof value === 'string' ? value : value.$date;
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const placeholderImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="14" fill="%23f1f5f9"/><path d="M28 64h40a6 6 0 0 0 6-6V38a6 6 0 0 0-6-6H28a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6zm8-12 8-10 10 12 6-8 8 10H36z" fill="%2394a3b8"/><circle cx="60" cy="44" r="4" fill="%2394a3b8"/></svg>';

export function TeamsTab({ playflySchools }: TeamsTabProps) {
  const [teamsData, setTeamsData] = useState<TeamRecord[]>([]);
  const [teamContents, setTeamContents] = useState<TeamContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scope] = useState<'playfly'>('playfly');
  const [timeframe, setTimeframe] = useState<Timeframe>('thirtyDays');
  const [platform] = useState<Platform>('instagram');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [conferenceFilter, setConferenceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('engagementRate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState<'cards' | 'table'>('table');
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
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

  const baseTeams = useMemo(() => {
    return teamsData.filter(team => {
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
      const interactions = (slice.likes || 0) + (slice.comments || 0);
      const logoAdoption = slice.contentCount > 0 ? (slice.logoContentCount / slice.contentCount) * 100 : 0;
      return {
        id: team._id.$oid,
        team,
        slice,
        interactions,
        logoAdoption
      };
    });
  }, [filteredTeams, timeframe, platform]);

  const baseRows = useMemo(() => {
    return baseTeams.map(team => {
      const slice = getSlice(team, timeframe, platform);
      const interactions = (slice.likes || 0) + (slice.comments || 0);
      const logoAdoption = slice.contentCount > 0 ? (slice.logoContentCount / slice.contentCount) * 100 : 0;
      return {
        id: team._id.$oid,
        team,
        slice,
        interactions,
        logoAdoption,
        isPlayfly: playflySet.has(team.schoolName)
      };
    });
  }, [baseTeams, timeframe, platform, playflySet]);

  const median = (values: number[]) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  };

  const adoptionMedian = useMemo(() => median(baseRows.map(t => t.logoAdoption)), [baseRows]);
  const liftMedian = useMemo(() => median(baseRows.map(t => t.slice.engagementRateLogoLift || 0)), [baseRows]);

  const sortedTeams = useMemo(() => {
    const sorted = [...teamRows].sort((a, b) => {
      const aVal = sortKey === 'adoption'
        ? a.logoAdoption
        : sortKey === 'engagementRate'
          ? a.slice.engagementRate
          : sortKey === 'interactions'
            ? a.interactions
            : a.slice.followers;
      const bVal = sortKey === 'adoption'
        ? b.logoAdoption
        : sortKey === 'engagementRate'
          ? b.slice.engagementRate
          : sortKey === 'interactions'
            ? b.interactions
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

  const filteredContents = useMemo(() => {
    return teamContents.filter(post => {
      const schoolName = post.team?.school?.name;
      const sportName = post.team?.name;
      if (scope === 'playfly' && schoolName && !playflySet.has(schoolName)) return false;
      if (schoolFilter !== 'all' && schoolName !== schoolFilter) return false;
      if (sportFilter !== 'all' && sportName !== sportFilter) return false;
      if (conferenceFilter !== 'all' && (post.team?.conference?.name || 'Unknown') !== conferenceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = `${schoolName || ''} ${sportName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [teamContents, scope, playflySet, schoolFilter, sportFilter, conferenceFilter, searchQuery]);

  const getInteractions = (post: TeamContent) => {
    const likes = post.metrics?.likes || 0;
    const comments = post.metrics?.comments || 0;
    return likes + comments;
  };

  const topSponsoredWithLogo = useMemo(() => filteredContents.filter(p => p.isSponsored && p.hasOrganizationLogo).sort((a, b) => getInteractions(b) - getInteractions(a)), [filteredContents]);
  const topSponsoredWithoutLogo = useMemo(() => filteredContents.filter(p => p.isSponsored && !p.hasOrganizationLogo).sort((a, b) => getInteractions(b) - getInteractions(a)), [filteredContents]);


  const renderPostRow = (post: TeamContent) => {
    const interactions = getInteractions(post);
    const dateLabel = getDateLabel(post.publishedAt);
    const imageSrc = post.url || placeholderImage;
    return (
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <img
            src={imageSrc}
            alt=""
            className="h-16 w-16 rounded-xl object-cover border border-slate-200 bg-white"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholderImage; }}
          />
          <div className="text-sm font-semibold text-gray-900 truncate">
            {post.team?.school?.name || 'Unknown School'} • {post.team?.name || 'Team'}
          </div>
          <div className="text-[13px] text-gray-700 truncate">{dateLabel}</div>
          <div className="text-sm text-gray-700 line-clamp-2 mt-1">{post.caption || 'No caption available.'}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.isSponsored && <span className="content-chip">Sponsored</span>}
            {post.sponsorPartner && <span className="content-chip">{post.sponsorPartner}</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold text-gray-900">{formatNumber(interactions)}</div>
          <div className="text-xs text-gray-600 mt-1">Interactions</div>
        </div>
      </div>
    );
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
              <p className="text-sm text-gray-600">Team account performance across the 15 Playfly schools.</p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex gap-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Scope</div>
                <div className="text-sm font-semibold text-gray-900">Playfly Schools ({playflySchools.length})</div>
              </div>
              <div className="flex gap-2">
                <GlassPill className="pf-chip-compact" active={timeframe === 'sevenDays'} onClick={() => setTimeframe('sevenDays')}>7D</GlassPill>
                <GlassPill className="pf-chip-compact" active={timeframe === 'thirtyDays'} onClick={() => setTimeframe('thirtyDays')}>30D</GlassPill>
                <GlassPill className="pf-chip-compact" active={timeframe === 'ninetyDays'} onClick={() => setTimeframe('ninetyDays')}>90D</GlassPill>
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
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
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


      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden">
            <div className="text-sm text-gray-600">Showing {sortedTeams.length} teams</div>
            <div className="flex gap-2">
              <GlassPill active={leaderboardView === 'cards'} onClick={() => setLeaderboardView('cards')}>Cards</GlassPill>
              <GlassPill active={leaderboardView === 'table'} onClick={() => setLeaderboardView('table')}>Table</GlassPill>
            </div>
          </div>

          <div className="p-4 flex flex-wrap gap-2">
            <GlassPill className="pf-chip-compact" active={sortKey === 'adoption'} onClick={() => handleSort('adoption')}>Adoption</GlassPill>
            <GlassPill className="pf-chip-compact" active={sortKey === 'engagementRate'} onClick={() => handleSort('engagementRate')}>Engagement Rate</GlassPill>
            <GlassPill className="pf-chip-compact" active={sortKey === 'interactions'} onClick={() => handleSort('interactions')}>Interactions</GlassPill>
            <GlassPill className="pf-chip-compact" active={sortKey === 'followers'} onClick={() => handleSort('followers')}>Followers</GlassPill>
          </div>

          <div className={`${leaderboardView === 'cards' ? 'block' : 'hidden'} md:hidden p-4 space-y-4`}>
            {sortedTeams.map(row => (
              <GlassCard key={row.id} className="p-4" onClick={() => { setSelectedTeamId(row.id); setDrawerOpen(true); }}>
              <div className="font-semibold text-gray-900">
                {row.team.schoolName} • {row.team.sport}
              </div>
                <div className="text-xs text-gray-500 mt-1">{platform === 'all' ? 'All Platforms' : platform}</div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                  <div>Engagement</div>
                  <div className="text-right font-semibold">{formatPercent(row.slice.engagementRate, 2)}</div>
                  <div>Interactions</div>
                  <div className="text-right font-semibold">{formatShort(row.interactions)}</div>
                  <div>Followers</div>
                  <div className="text-right font-semibold">{formatShort(row.slice.followers)}</div>
                  <div>Posts</div>
                  <div className="text-right font-semibold">{formatShort(row.slice.contentCount)}</div>
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
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[80px]" title="Platform filter">Platform</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[90px]" title="Engagement Rate">Eng.</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[100px]" title="Likes + Comments">Interactions</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[90px]" title="Followers">Followers</th>
                    <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 w-[80px]" title="Content Count">Posts</th>
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
                        {row.team.schoolName} • {row.team.sport}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-gray-600">{platform === 'all' ? 'All' : platform}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatPercent(row.slice.engagementRate, 2)}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatShort(row.interactions)}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatShort(row.slice.followers)}</td>
                      <td className="px-3 py-2 text-right text-sm">{formatShort(row.slice.contentCount)}</td>
                    </tr>
                  ))}
                  <tr style={{ height: `${Math.max(0, (totalRows - endIndex) * rowHeight)}px` }} />
                </tbody>
              </table>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 min-w-[420px]">
          <div className="mb-2">
            <div className="text-sm font-semibold text-gray-900">Team Landscape</div>
            <div className="text-xs text-gray-500">Each dot is a team. Right/up is better: higher adoption and higher lift.</div>
          </div>
          <div className="w-full h-[360px] min-h-[340px]">
            <svg viewBox="0 0 560 380" className="w-full h-full">
              {(() => {
                const left = 44;
                const top = 18;
                const width = 486;
                const height = 320;
                const plotRows = baseRows.filter(r => r.isPlayfly);
                const adoptionVals = plotRows.map(r => r.logoAdoption);
                const liftVals = plotRows.map(r => r.slice.engagementRateLogoLift || 0);
                const minX = Math.min(...adoptionVals);
                const maxX = Math.max(...adoptionVals);
                const minY = Math.min(...liftVals);
                const maxY = Math.max(...liftVals);
                const padX = (maxX - minX) * 0.1 || 1;
                const padY = (maxY - minY) * 0.1 || 1;
                const xScale = (val: number) => left + ((val - (minX - padX)) / ((maxX + padX) - (minX - padX))) * width;
                const yScale = (val: number) => top + height - ((val - (minY - padY)) / ((maxY + padY) - (minY - padY))) * height;
                return (
                  <>
                    <rect x={left} y={top} width={width} height={height} fill="#f8fafc" stroke="#e5e7eb" />
                    <line x1={xScale(adoptionMedian)} y1={top} x2={xScale(adoptionMedian)} y2={top + height} stroke="#64748b" strokeDasharray="6 6" />
                    <line x1={left} y1={yScale(liftMedian)} x2={left + width} y2={yScale(liftMedian)} stroke="#64748b" strokeDasharray="6 6" />
                    <text x={xScale(adoptionMedian) + 6} y={top + 12} fontSize="10" fill="#64748b">Median Adoption</text>
                    <text x={left + 6} y={yScale(liftMedian) - 6} fontSize="10" fill="#64748b">Median Lift</text>
                    <text x={left + width / 2} y={top + height + 30} fontSize="11" fill="#1f2937" textAnchor="middle">Logo Adoption (%)</text>
                    <text x={left - 32} y={top + height / 2} fontSize="11" fill="#1f2937" textAnchor="middle" transform={`rotate(-90 ${left - 32} ${top + height / 2})`}>Logo Lift (%)</text>
                    {plotRows.map((row, idx) => {
                      const density = plotRows.length;
                      const jitterX = density > 250 ? ((idx % 7) - 3) * 1.5 : 0;
                      const jitterY = density > 250 ? ((idx % 5) - 2) * 1.5 : 0;
                      const x = xScale(row.logoAdoption) + jitterX;
                      const y = yScale(row.slice.engagementRateLogoLift || 0) + jitterY;
                      const r = 7;
                      const color = 'rgba(23,112,192,0.7)';
                      const stroke = '#1770C0';
                      const isSelected = selectedTeamId === row.id;
                      const tooltipX = Math.min(left + width - 210 - 6, Math.max(left + 6, x + 10));
                      const tooltipY = Math.min(top + height - 78, Math.max(top + 6, y - 22));
                      const platformLabel = platform === 'all' ? 'All Platforms' : platform === 'instagram' ? 'Instagram' : 'TikTok';
                      return (
                        <g
                          key={row.id}
                          onMouseEnter={() => setHoveredTeamId(row.id)}
                          onMouseLeave={() => setHoveredTeamId(null)}
                          onClick={() => { setSelectedTeamId(row.id); setDrawerOpen(true); }}
                        >
                          <circle cx={x} cy={y} r={r} fill={color} stroke={stroke} strokeWidth="1.3" />
                          {isSelected && <circle cx={x} cy={y} r={r + 4} fill="none" stroke="#1770C0" strokeWidth="2" />}
                          {hoveredTeamId === row.id && (
                            <g>
                              <rect x={tooltipX} y={tooltipY} rx={8} ry={8} width={210} height={72} fill="#0f172a" opacity={0.95} />
                              <text x={tooltipX + 10} y={tooltipY + 16} fontSize="11" fill="#ffffff" fontWeight="600">
                                {row.team.schoolName} • {row.team.sport}
                              </text>
                              <text x={tooltipX + 10} y={tooltipY + 30} fontSize="10" fill="#cbd5f5">{platformLabel}</text>
                              <text x={tooltipX + 10} y={tooltipY + 44} fontSize="10" fill="#cbd5f5">
                                Logo Adoption {row.logoAdoption.toFixed(1)}% • Logo Lift {formatPercent(row.slice.engagementRateLogoLift || 0, 1)}
                              </text>
                              <text x={tooltipX + 10} y={tooltipY + 58} fontSize="10" fill="#cbd5f5">
                                Engagement {formatPercent(row.slice.engagementRate, 2)} • Interactions {formatShort(row.interactions)}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 content-section">
        <div className="text-base font-semibold text-gray-900 mb-4">Team Content Benchmarks</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-gray-900 mb-3">Top Sponsored posts WITH logo</div>
            <div className="space-y-3">
              {topSponsoredWithLogo.slice(0, 10).map(post => (
                <GlassCard key={post._id} className="p-3 content-post-card">
                  {renderPostRow(post)}
                </GlassCard>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="text-sm font-semibold text-gray-900 mb-3">Top Sponsored posts WITHOUT logo</div>
            <div className="space-y-3">
              {topSponsoredWithoutLogo.slice(0, 10).map(post => (
                <GlassCard key={post._id} className="p-3 content-post-card">
                  {renderPostRow(post)}
                </GlassCard>
              ))}
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      <DrawerPanel
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTeam ? `${selectedTeam.team.schoolName} • ${selectedTeam.team.sport}` : 'Team Detail'}
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
                <div className="text-xs text-gray-500">{selectedTeam.team.sport}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div>Followers</div><div className="text-right font-semibold text-gray-900">{formatShort(selectedTeam.slice.followers)}</div>
              <div>Engagement Rate</div><div className="text-right font-semibold text-gray-900">{formatPercent(selectedTeam.slice.engagementRate, 2)}</div>
              <div>Interactions</div><div className="text-right font-semibold text-gray-900">{formatShort(selectedTeam.interactions)}</div>
              <div>Content Count</div><div className="text-right font-semibold text-gray-900">{formatShort(selectedTeam.slice.contentCount)}</div>
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
                    post.isSponsored
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
