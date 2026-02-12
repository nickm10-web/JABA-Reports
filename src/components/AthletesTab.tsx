import { useEffect, useState } from 'react';
import { DrawerPanel, GlassCard, GlassPill } from './playfly/PlayflyUI';

interface AthleteData {
  athlete: {
    name: string;
    sport: string;
  };
  posts: number;
  emv?: number | null;
  engagementRate: number;
  lift: number;
}

interface SchoolAthleteData {
  school: {
    _id: string;
    name: string;
  };
  collaboration: {
    avgEmv: number;
    avgLift: number;
    top5Athletes: AthleteData[];
  };
  logo: {
    avgEmv: number;
    avgLift: number;
    top5Athletes: AthleteData[];
  };
  'mention (in caption)': {
    avgEmv: number;
    avgLift: number;
    top5Athletes: AthleteData[];
  };
  partnership: {
    avgEmv: number;
    avgLift: number;
    top5Athletes: AthleteData[];
  };
}

interface AthleteEngagementData {
  name: string;
  school: string;
  sport: string;
  followers: number;
  totalLikes: number;
  totalComments: number;
  postCount: number;
  engagementRate: number;
  emv: number;
  orgInCaptionLift: number | null;
  collaborationLift: number | null;
  logoLift: number | null;
}

interface AthletesTabProps {
  schoolsData: { school: { _id: string; name: string } }[];
  athleteData: SchoolAthleteData[];
  formatNumber: (num: number) => string;
  formatEMV: (emv: number) => string;
}

type SortMetric = 'engagement' | 'avgLikes' | 'emv' | 'lift' | 'posts';
type IPModeFilter = 'all' | 'collaboration' | 'logo' | 'mention';
type ViewMode = 'leaderboard' | 'by-ip-type';

// Helper to format sport names
function formatSport(sport: string): string {
  const sportMap: Record<string, string> = {
    'MENS_BASKETBALL': 'MEN\'S BASKETBALL',
    'WOMENS_BASKETBALL': 'WOMEN\'S BASKETBALL',
    'FOOTBALL': 'FOOTBALL',
    'BASEBALL': 'BASEBALL',
    'SOFTBALL': 'SOFTBALL',
    'MENS_GOLF': 'MEN\'S GOLF',
    'WOMENS_GOLF': 'WOMEN\'S GOLF',
    'WOMENS_VOLLEYBALL': 'WOMEN\'S VOLLEYBALL',
    'MENS_SOCCER': 'MEN\'S SOCCER',
    'WOMENS_SOCCER': 'WOMEN\'S SOCCER'
  };
  return sportMap[sport] || sport.replace(/_/g, ' ');
}

export function AthletesTab({
  schoolsData,
  athleteData,
  formatNumber,
  formatEMV
}: AthletesTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMetric>('engagement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [ipModeFilter, setIPModeFilter] = useState<IPModeFilter>('all');
  const [isMobile, setIsMobile] = useState(false);
  const [leaderboardView, setLeaderboardView] = useState<'cards' | 'table'>('cards');
  const [realEngagementData, setRealEngagementData] = useState<AthleteEngagementData[]>([]);
  const [selectedAthlete, setSelectedAthlete] = useState<{
    name: string;
    school: string;
    sport: string;
    engagement: number;
    avgLift: number | null;
    emv: number;
    posts: number;
  } | null>(null);
  const [athleteDrawerOpen, setAthleteDrawerOpen] = useState(false);
  const [sectionScope, setSectionScope] = useState<string>('all');

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    fetch('/data/playfly-athletes-metrics.json')
      .then(r => r.ok ? r.json() : [])
      .then((data: AthleteEngagementData[]) => setRealEngagementData(data))
      .catch(() => setRealEngagementData([]));
  }, []);

  // Filter to selected school or all schools
  const filteredAthleteData = sectionScope === 'all'
    ? athleteData
    : athleteData.filter(d => d.school.name === sectionScope);

  // Build table athletes from realEngagementData, with IP lift averaged from the 3 categories
  const buildAthletes = () => {
    // Filter by school scope
    const scoped = sectionScope === 'all'
      ? realEngagementData
      : realEngagementData.filter(a => a.school === sectionScope);

    return scoped.map(a => {
      const lifts = [a.orgInCaptionLift, a.collaborationLift, a.logoLift].filter(
        (v): v is number => v != null
      );
      const avgLift = lifts.length > 0 ? lifts.reduce((s, v) => s + v, 0) / lifts.length : null;
      return {
        name: a.name,
        sport: a.sport,
        school: a.school,
        posts: a.postCount,
        emv: a.emv,
        totalLikes: a.totalLikes,
        totalComments: a.totalComments,
        engagement: a.engagementRate,
        avgLift,
      };
    });
  };

  const athletes = buildAthletes();

  // Filter by search
  const filteredAthletes = searchQuery
    ? athletes.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : athletes;

  // Sort athletes
  const sortedAthletes = [...filteredAthletes].sort((a, b) => {
    let aVal = 0, bVal = 0;

    switch (sortBy) {
      case 'engagement':
        aVal = a.engagement;
        bVal = b.engagement;
        break;
      case 'avgLikes':
        aVal = a.engagement; // Using engagement as proxy for likes
        bVal = b.engagement;
        break;
      case 'emv':
        aVal = a.emv || 0;
        bVal = b.emv || 0;
        break;
      case 'lift':
        aVal = a.avgLift ?? 0;
        bVal = b.avgLift ?? 0;
        break;
      case 'posts':
        aVal = a.posts;
        bVal = b.posts;
        break;
    }

    return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
  });

  const handleSort = (metric: SortMetric) => {
    if (sortBy === metric) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(metric);
      setSortDirection('desc');
    }
  };

  // Get IP type data for Best Collaborators section
  const getIPTypeData = () => {
    if (filteredAthleteData.length === 0) return null;

    const ipTypes = [
      { key: 'collaboration', label: 'COLLABORATION', icon: '🤝' },
      { key: 'logo', label: 'VISUAL', icon: '🏫' },
      { key: 'mention (in caption)', label: 'MENTION', icon: '💬' }
    ];

    if (ipModeFilter !== 'all') {
      const filtered = ipTypes.filter(t =>
        ipModeFilter === 'mention' ? t.key === 'mention (in caption)' : t.key === ipModeFilter
      );
      return filtered;
    }

    return ipTypes;
  };

  const ipTypeData = getIPTypeData();

  return (
    <div className="space-y-8">
      {/* Header with View Toggle */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl pf-section-header">
              <span className="pf-header-primary">Athletes </span>
              <span className="pf-header-secondary">Performance</span>
            </h3>
            <p className="text-gray-600 mt-2">
              {sectionScope === 'all'
                ? 'Top performing athletes across all schools'
                : `Top performing athletes at ${sectionScope}`
              }
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {sortedAthletes.length} athletes tracked
          </div>
        </div>

        {/* Section Scope */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <label className="text-sm font-semibold text-gray-700" htmlFor="athletes-scope">
              Section view:
            </label>
            <select
              id="athletes-scope"
              value={sectionScope}
              onChange={(e) => setSectionScope(e.target.value)}
              className="bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none w-full md:max-w-[320px]"
              aria-label="Change school for this section only"
            >
              <option value="all">All Schools ({schoolsData.length})</option>
              {schoolsData.map((school) => (
                <option key={school.school._id} value={school.school.name}>
                  {school.school.name}
                </option>
              ))}
            </select>
            {sectionScope !== 'all' && (
              <>
                <span className="metric-badge">Override active</span>
                <button
                  onClick={() => setSectionScope('all')}
                  className="text-xs font-semibold text-[#1770C0] hover:text-[#3B9FD9]"
                >
                  Reset to All Schools
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" data-snapshot-hide="true">
          <GlassPill active={viewMode === 'leaderboard'} onClick={() => setViewMode('leaderboard')}>Leaderboard</GlassPill>
          <GlassPill active={viewMode === 'by-ip-type'} onClick={() => setViewMode('by-ip-type')}>By IP Type</GlassPill>
        </div>
      </div>

      {/* LEADERBOARD VIEW */}
      {viewMode === 'leaderboard' && (
        <div className="space-y-6">

        {/* Search */}
        <GlassCard className="p-4" data-snapshot-hide="true">
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </GlassCard>

        {/* Multi Leaderboards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(() => {
            const topEngagementFromReal = realEngagementData.length > 0
              ? realEngagementData
                  .filter(a => sectionScope === 'all' || a.school === sectionScope)
                  .slice(0, 5)
                  .map(a => ({ name: a.name, school: a.school, engagement: a.engagementRate }))
              : [...sortedAthletes].sort((a, b) => b.engagement - a.engagement).slice(0, 5)
                  .map(a => ({ name: a.name, school: a.school, engagement: a.engagement }));
            const topLift = [...sortedAthletes].sort((a, b) => (b.avgLift ?? 0) - (a.avgLift ?? 0)).slice(0, 5);
            const filteredReal = realEngagementData.filter(a => sectionScope === 'all' || a.school === sectionScope);
            const topLikes = [...filteredReal].sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 5);
            const topComments = [...filteredReal].sort((a, b) => b.totalComments - a.totalComments).slice(0, 5);
            const renderList = (items: Array<{ name: string; school: string; [key: string]: any }>, metric: (a: any) => string) => (
              <div className="space-y-2">
                {items.map((athlete, index) => (
                  <div key={`${athlete.name}-${index}`} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{athlete.name}</div>
                      <div className="text-xs text-gray-500 truncate">{athlete.school}</div>
                    </div>
                    <div className="text-gray-900 font-semibold">{metric(athlete)}</div>
                  </div>
                ))}
              </div>
            );
            return (
              <>
                <GlassCard className="p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Top Engagement</div>
                  {renderList(topEngagementFromReal, (a) => `${(a.engagement * 100).toFixed(2)}%`)}
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Top IP Lift</div>
                  {renderList(topLift, (a) => `${a.avgLift > 0 ? '+' : ''}${(a.avgLift).toFixed(1)}%`)}
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Top Total Likes</div>
                  {renderList(topLikes, (a) => formatNumber(a.totalLikes))}
                </GlassCard>
                <GlassCard className="p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Top Total Comments</div>
                  {renderList(topComments, (a) => formatNumber(a.totalComments))}
                </GlassCard>
              </>
            );
          })()}
        </div>

        {/* Athletes Table */}
        <GlassCard className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden" data-snapshot-hide="true">
            <div className="text-sm text-gray-600">Showing top {Math.min(50, sortedAthletes.length)}</div>
            <div className="flex gap-2">
              <GlassPill active={leaderboardView === 'cards'} onClick={() => setLeaderboardView('cards')}>Cards</GlassPill>
              <GlassPill active={leaderboardView === 'table'} onClick={() => setLeaderboardView('table')}>Table</GlassPill>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className={`${leaderboardView === 'cards' ? 'block' : 'hidden'} md:hidden p-4 space-y-4`}>
            {sortedAthletes.slice(0, 50).map((athlete, index) => (
              <GlassCard
                key={`${athlete.name}-${athlete.sport}-card`}
                className="p-4"
                onClick={() => {
                  setSelectedAthlete({
                    name: athlete.name,
                    school: athlete.school,
                    sport: athlete.sport,
                    engagement: athlete.engagement,
                    emv: athlete.emv,
                    avgLift: athlete.avgLift,
                    posts: athlete.posts
                  });
                  setAthleteDrawerOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{athlete.name}</div>
                  <div className="text-xs text-gray-500">#{index + 1}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{athlete.school} • {formatSport(athlete.sport)}</div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                  <div>Engagement</div>
                  <div className="text-right text-[#00C4A7] font-semibold">{(athlete.engagement * 100).toFixed(2)}%</div>
                  <div>Estimated EMV</div>
                  <div className="text-right text-yellow-600 font-semibold">{athlete.emv ? formatEMV(athlete.emv) : 'N/A'}</div>
                  <div>IP Lift</div>
                  <div className={`text-right font-semibold ${athlete.avgLift != null ? (athlete.avgLift > 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                    {athlete.avgLift != null ? `${athlete.avgLift > 0 ? '+' : ''}${(athlete.avgLift).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div>Posts</div>
                  <div className="text-right text-gray-900 font-semibold">{formatNumber(athlete.posts)}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className={`${leaderboardView === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto`}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#f9fafb' }} className="border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">#</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700">ATHLETE</th>
                  <th
                    onClick={() => handleSort('engagement')}
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      ENGAGEMENT
                      {sortBy === 'engagement' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">TOTAL LIKES</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">TOTAL COMMENTS</th>
                  <th
                    onClick={() => handleSort('emv')}
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      EST. EMV
                      {sortBy === 'emv' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('lift')}
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      IP LIFT
                      {sortBy === 'lift' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('posts')}
                    className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      POSTS
                      {sortBy === 'posts' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAthletes.slice(0, 50).map((athlete, index) => (
                  <tr
                    key={`${athlete.name}-${athlete.sport}`}
                    className={`border-b border-gray-100 hover:bg-blue-50/60 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    onClick={() => {
                      setSelectedAthlete({
                        name: athlete.name,
                        school: athlete.school,
                        sport: athlete.sport,
                        engagement: athlete.engagement,
                        emv: athlete.emv,
                        avgLift: athlete.avgLift,
                        posts: athlete.posts
                      });
                      setAthleteDrawerOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-sm" style={{ color: '#1770C0' }}>
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-gray-900 font-semibold">{athlete.name}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{athlete.school}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{formatSport(athlete.sport)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-[#00C4A7] font-bold text-base">
                        {(athlete.engagement * 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-900 font-medium text-base">
                        {formatNumber(athlete.totalLikes || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-900 font-medium text-base">
                        {formatNumber(athlete.totalComments || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-yellow-600 font-bold text-base">
                        {athlete.emv ? formatEMV(athlete.emv) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {athlete.avgLift != null ? (
                        <div className={`font-semibold ${
                          athlete.avgLift > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {athlete.avgLift > 0 ? '+' : ''}{(athlete.avgLift).toFixed(1)}% {athlete.avgLift > 0 ? '↑' : '↓'}
                        </div>
                      ) : (
                        <div className="font-semibold text-gray-400">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-gray-900 font-medium text-base">
                        {formatNumber(athlete.posts)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600 hidden md:block">
            Showing top {Math.min(50, sortedAthletes.length)} of {sortedAthletes.length} athletes
          </div>
        </GlassCard>
        </div>
      )}

      {/* BY IP TYPE VIEW */}
      {viewMode === 'by-ip-type' && (
        <div className="space-y-6">

        {/* Filter Bar */}
        <GlassCard className="p-4" data-snapshot-hide="true">
          <div className="flex flex-wrap gap-2">
            <GlassPill active={ipModeFilter === 'all'} onClick={() => setIPModeFilter('all')}>All Modes</GlassPill>
            <GlassPill active={ipModeFilter === 'collaboration'} onClick={() => setIPModeFilter('collaboration')}>🤝 Collab</GlassPill>
            <GlassPill active={ipModeFilter === 'logo'} onClick={() => setIPModeFilter('logo')}>🏫 Visual</GlassPill>
            <GlassPill active={ipModeFilter === 'mention'} onClick={() => setIPModeFilter('mention')}>💬 Mention</GlassPill>
          </div>
        </GlassCard>

        {/* IP Type Sections */}
        <div className="space-y-8">
          {ipTypeData?.map(ipType => {
            // Aggregate data for this IP type across selected schools
            const ipData = filteredAthleteData.map(d => d[ipType.key as keyof Omit<SchoolAthleteData, 'school'>]);
            const avgLift = ipData.reduce((sum, d) => sum + d.avgLift, 0) / ipData.length;

            // Get all athletes for this IP type and sort by engagement rate
            const allAthletesWithSchool = filteredAthleteData.flatMap(schoolData =>
              schoolData[ipType.key as keyof Omit<SchoolAthleteData, 'school'>].top5Athletes.map(athlete => ({
                ...athlete,
                schoolName: schoolData.school.name
              }))
            );
            const topAthletes = allAthletesWithSchool
              .sort((a, b) => b.engagementRate - a.engagementRate)
              .slice(0, 5)
              .map(athlete => {
                const normalize = (value: string) =>
                  value.toLowerCase().replace(/[^a-z0-9]+/g, '');
                const key = `${normalize(athlete.athlete.name)}|${normalize(athlete.schoolName)}`;
                const realData = realEngagementData.find(a =>
                  `${normalize(a.name)}|${normalize(a.school)}` === key
                );
                return { ...athlete, emv: realData?.emv ?? null };
              });

            return (
              <GlassCard key={ipType.key} className="p-6">
                {/* IP Type Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ipType.icon}</span>
                    <h4 className="text-2xl font-bold text-gray-900">{ipType.label}</h4>
                  </div>
                  <p className="text-gray-600">
                    <span className="text-[#00C4A7] font-bold">{avgLift > 0 ? '+' : ''}{(avgLift * 100).toFixed(1)}%</span> lift
                  </p>
                </div>

                {/* Top 5 Athletes */}
                <div>
                  <h5 className="text-sm font-bold text-gray-700 mb-4">TOP 5 ATHLETES</h5>
                  <div className="space-y-3">
                    {topAthletes.map((athlete, index) => (
                      <GlassCard
                        key={`${athlete.athlete.name}-${index}`}
                        className="p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                          <div>
                            <div className="text-gray-900 font-semibold">{athlete.athlete.name}</div>
                            <div className="text-xs text-gray-600 mt-0.5">{athlete.schoolName}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{formatSport(athlete.athlete.sport)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <div className="text-gray-600 text-xs">POSTS</div>
                            <div className="text-gray-900 font-bold text-base">{athlete.posts}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">EST. EMV</div>
                            <div className="text-yellow-600 font-bold text-base">{athlete.emv ? formatEMV(athlete.emv) : 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs">LIFT</div>
                            <div className={`font-bold text-base ${
                              athlete.lift > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {athlete.lift > 0 ? '+' : ''}{(athlete.lift * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
        </div>
      )}

      <DrawerPanel
        open={athleteDrawerOpen}
        onClose={() => setAthleteDrawerOpen(false)}
        title={selectedAthlete ? selectedAthlete.name : 'Athlete'}
        side={isMobile ? 'bottom' : 'right'}
      >
        {selectedAthlete && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">School</span>
              <span className="font-semibold text-gray-900">{selectedAthlete.school}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Sport</span>
              <span className="font-semibold text-gray-900">{formatSport(selectedAthlete.sport)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Engagement</span>
              <span className="font-semibold text-[#00C4A7]">{(selectedAthlete.engagement * 100).toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Estimated EMV</span>
              <span className="font-semibold text-yellow-600">{selectedAthlete.emv ? formatEMV(selectedAthlete.emv) : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">IP Lift</span>
              {selectedAthlete.avgLift != null ? (
                <span className={`font-semibold ${selectedAthlete.avgLift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedAthlete.avgLift > 0 ? '+' : ''}{(selectedAthlete.avgLift).toFixed(1)}%
                </span>
              ) : (
                <span className="font-semibold text-gray-400">N/A</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Posts</span>
              <span className="font-semibold text-gray-900">{formatNumber(selectedAthlete.posts)}</span>
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
