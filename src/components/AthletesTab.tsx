import { useState } from 'react';

interface AthleteData {
  athlete: {
    name: string;
    sport: string;
  };
  posts: number;
  emv: number;
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

interface AthletesTabProps {
  selectedSchool: string;
  athleteData: SchoolAthleteData[];
  formatNumber: (num: number) => string;
  formatEMV: (emv: number) => string;
}

type SortMetric = 'engagement' | 'avgLikes' | 'emv' | 'lift' | 'posts';
type IPModeFilter = 'all' | 'collaboration' | 'logo' | 'mention' | 'partnership';
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
  selectedSchool,
  athleteData,
  formatNumber,
  formatEMV
}: AthletesTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('leaderboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortMetric>('engagement');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [ipModeFilter, setIPModeFilter] = useState<IPModeFilter>('all');

  // Filter to selected school or all schools
  const filteredAthleteData = selectedSchool === 'all'
    ? athleteData
    : athleteData.filter(d => d.school.name === selectedSchool);

  // Aggregate all athletes from all IP types into a leaderboard
  const aggregateAthletes = () => {
    const athleteMap = new Map<string, {
      name: string;
      sport: string;
      school: string;
      totalPosts: number;
      totalEMV: number;
      avgEngagement: number;
      avgLift: number;
      ipTypes: Set<string>;
      engagementSum: number;
      liftSum: number;
      dataPoints: number;
    }>();

    filteredAthleteData.forEach(schoolData => {
      // Process each IP type
      ['collaboration', 'logo', 'mention (in caption)', 'partnership'].forEach(ipType => {
        const ipData = schoolData[ipType as keyof Omit<SchoolAthleteData, 'school'>];
        ipData.top5Athletes.forEach(athlete => {
          const key = `${athlete.athlete.name}-${athlete.athlete.sport}-${schoolData.school.name}`;
          const existing = athleteMap.get(key);

          if (existing) {
            existing.totalPosts += athlete.posts;
            existing.totalEMV += athlete.emv;
            existing.engagementSum += athlete.engagementRate;
            existing.liftSum += athlete.lift;
            existing.dataPoints += 1;
            existing.ipTypes.add(ipType);
          } else {
            athleteMap.set(key, {
              name: athlete.athlete.name,
              sport: athlete.athlete.sport,
              school: schoolData.school.name,
              totalPosts: athlete.posts,
              totalEMV: athlete.emv,
              avgEngagement: athlete.engagementRate,
              avgLift: athlete.lift,
              ipTypes: new Set([ipType]),
              engagementSum: athlete.engagementRate,
              liftSum: athlete.lift,
              dataPoints: 1
            });
          }
        });
      });
    });

    // Calculate averages and return array
    return Array.from(athleteMap.values()).map(athlete => ({
      name: athlete.name,
      sport: athlete.sport,
      school: athlete.school,
      posts: athlete.totalPosts,
      emv: athlete.totalEMV,
      engagement: athlete.engagementSum / athlete.dataPoints,
      avgLift: athlete.liftSum / athlete.dataPoints,
      ipTypes: Array.from(athlete.ipTypes)
    }));
  };

  const athletes = aggregateAthletes();

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
        aVal = a.emv;
        bVal = b.emv;
        break;
      case 'lift':
        aVal = a.avgLift;
        bVal = b.avgLift;
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
      { key: 'logo', label: 'LOGO', icon: '🏫' },
      { key: 'mention (in caption)', label: 'MENTION', icon: '💬' },
      { key: 'partnership', label: 'PARTNER', icon: '🤝' }
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
            <h3 className="text-3xl font-bold text-white">Athletes Performance</h3>
            <p className="text-white/60 mt-2">
              {selectedSchool === 'all'
                ? 'Top performing athletes across all schools'
                : `Top performing athletes at ${selectedSchool}`
              }
            </p>
          </div>
          <div className="text-sm text-white/60">
            {sortedAthletes.length} athletes tracked
          </div>
        </div>

        {/* View Mode Toggle - Similar to With vs Without tabs */}
        <div className="flex gap-4 border-b border-white/10">
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-6 py-3 font-semibold transition-all ${
              viewMode === 'leaderboard'
                ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setViewMode('by-ip-type')}
            className={`px-6 py-3 font-semibold transition-all ${
              viewMode === 'by-ip-type'
                ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            By IP Type
          </button>
        </div>
      </div>

      {/* LEADERBOARD VIEW */}
      {viewMode === 'leaderboard' && (
        <div className="space-y-6">

        {/* Search */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white focus:border-[#3B9FD9] focus:outline-none"
          />
        </div>

        {/* Athletes Table */}
        <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0e27] border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">ATHLETE</th>
                  <th
                    onClick={() => handleSort('engagement')}
                    className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-2">
                      ENGAGEMENT
                      {sortBy === 'engagement' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('emv')}
                    className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-2">
                      EMV
                      {sortBy === 'emv' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('lift')}
                    className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-2">
                      IP LIFT
                      {sortBy === 'lift' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('posts')}
                    className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center justify-end gap-2">
                      POSTS
                      {sortBy === 'posts' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAthletes.slice(0, 50).map((athlete, index) => (
                  <tr
                    key={`${athlete.name}-${athlete.sport}`}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white/60 font-medium text-sm">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-semibold">{athlete.name}</div>
                        <div className="text-xs text-white/60 mt-0.5">{athlete.school}</div>
                        <div className="text-xs text-white/40 mt-0.5">{formatSport(athlete.sport)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-[#00FFD9] font-bold text-base">
                        {(athlete.engagement * 100).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-[#FFFF00] font-bold text-base">
                        {formatEMV(athlete.emv)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        athlete.avgLift > 0 ? 'text-[#00FFD9]' : 'text-red-400'
                      }`}>
                        {athlete.avgLift > 0 ? '+' : ''}{(athlete.avgLift * 100).toFixed(1)}% {athlete.avgLift > 0 ? '↑' : '↓'}
                        <span className="text-white/60 text-xs ml-2">
                          ({athlete.posts} IP)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-medium text-base">
                        {formatNumber(athlete.posts)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-white/10 text-center text-sm text-white/60">
            Showing top {Math.min(50, sortedAthletes.length)} of {sortedAthletes.length} athletes
          </div>
        </div>
        </div>
      )}

      {/* BY IP TYPE VIEW */}
      {viewMode === 'by-ip-type' && (
        <div className="space-y-6">

        {/* Filter Bar */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIPModeFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'all'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-black/40 text-white/60 hover:bg-black/60'
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => setIPModeFilter('collaboration')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'collaboration'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-black/40 text-white/60 hover:bg-black/60'
              }`}
            >
              🤝 Collab
            </button>
            <button
              onClick={() => setIPModeFilter('logo')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'logo'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-black/40 text-white/60 hover:bg-black/60'
              }`}
            >
              🏫 Logo
            </button>
            <button
              onClick={() => setIPModeFilter('mention')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'mention'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-black/40 text-white/60 hover:bg-black/60'
              }`}
            >
              💬 Mention
            </button>
            <button
              onClick={() => setIPModeFilter('partnership')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'partnership'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-black/40 text-white/60 hover:bg-black/60'
              }`}
            >
              🤝 Partner
            </button>
          </div>
        </div>

        {/* IP Type Sections */}
        <div className="space-y-8">
          {ipTypeData?.map(ipType => {
            // Aggregate data for this IP type across selected schools
            const ipData = filteredAthleteData.map(d => d[ipType.key as keyof Omit<SchoolAthleteData, 'school'>]);
            const avgEMV = ipData.reduce((sum, d) => sum + d.avgEmv, 0) / ipData.length;
            const avgLift = ipData.reduce((sum, d) => sum + d.avgLift, 0) / ipData.length;

            // Get all athletes for this IP type and sort by EMV
            const allAthletesWithSchool = filteredAthleteData.flatMap(schoolData =>
              schoolData[ipType.key as keyof Omit<SchoolAthleteData, 'school'>].top5Athletes.map(athlete => ({
                ...athlete,
                schoolName: schoolData.school.name
              }))
            );
            const topAthletes = allAthletesWithSchool
              .sort((a, b) => b.emv - a.emv)
              .slice(0, 5);

            return (
              <div key={ipType.key} className="bg-black/40 border border-white/10 rounded-xl p-6">
                {/* IP Type Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ipType.icon}</span>
                    <h4 className="text-2xl font-bold text-white">{ipType.label}</h4>
                  </div>
                  <p className="text-white/60">
                    <span className="text-[#FFFF00] font-bold">{formatEMV(avgEMV)}</span> avg EMV •{' '}
                    <span className="text-[#00FFD9] font-bold">{avgLift > 0 ? '+' : ''}{(avgLift * 100).toFixed(1)}%</span> lift
                  </p>
                </div>

                {/* Top 5 Athletes */}
                <div>
                  <h5 className="text-sm font-bold text-white/80 mb-4">TOP 5 ATHLETES</h5>
                  <div className="space-y-3">
                    {topAthletes.map((athlete, index) => (
                      <div
                        key={`${athlete.athlete.name}-${index}`}
                        className="bg-white/5 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-white/40">#{index + 1}</div>
                          <div>
                            <div className="text-white font-semibold">{athlete.athlete.name}</div>
                            <div className="text-xs text-white/60 mt-0.5">{athlete.schoolName}</div>
                            <div className="text-xs text-white/40 mt-0.5">{formatSport(athlete.athlete.sport)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <div className="text-white/60 text-xs">POSTS</div>
                            <div className="text-white font-bold text-base">{athlete.posts}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">EMV</div>
                            <div className="text-[#FFFF00] font-bold text-base">{formatEMV(athlete.emv)}</div>
                          </div>
                          <div>
                            <div className="text-white/60 text-xs">LIFT</div>
                            <div className={`font-bold text-base ${
                              athlete.lift > 0 ? 'text-[#00FFD9]' : 'text-red-400'
                            }`}>
                              {athlete.lift > 0 ? '+' : ''}{(athlete.lift * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}
