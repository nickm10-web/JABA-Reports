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
            <h3 className="text-3xl font-bold text-gray-900">Athletes Performance</h3>
            <p className="text-gray-600 mt-2">
              {selectedSchool === 'all'
                ? 'Top performing athletes across all schools'
                : `Top performing athletes at ${selectedSchool}`
              }
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {sortedAthletes.length} athletes tracked
          </div>
        </div>

        {/* View Mode Toggle - Similar to With vs Without tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-6 py-3 font-semibold transition-all ${
              viewMode === 'leaderboard'
                ? 'text-[#1770C0] border-b-2 border-[#1770C0]'
                : 'text-gray-600 hover:text-[#1770C0]'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setViewMode('by-ip-type')}
            className={`px-6 py-3 font-semibold transition-all ${
              viewMode === 'by-ip-type'
                ? 'text-[#1770C0] border-b-2 border-[#1770C0]'
                : 'text-gray-600 hover:text-[#1770C0]'
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
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Athletes Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#f9fafb' }} className="border-b border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ATHLETE</th>
                  <th
                    onClick={() => handleSort('engagement')}
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      ENGAGEMENT
                      {sortBy === 'engagement' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('emv')}
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      EMV
                      {sortBy === 'emv' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('lift')}
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      IP LIFT
                      {sortBy === 'lift' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('posts')}
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
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
                    className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
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
                      <div className="text-yellow-600 font-bold text-base">
                        {formatEMV(athlete.emv)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${
                        athlete.avgLift > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {athlete.avgLift > 0 ? '+' : ''}{(athlete.avgLift * 100).toFixed(1)}% {athlete.avgLift > 0 ? '↑' : '↓'}
                        <span className="text-gray-600 text-xs ml-2">
                          ({athlete.posts} IP)
                        </span>
                      </div>
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

          <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-600">
            Showing top {Math.min(50, sortedAthletes.length)} of {sortedAthletes.length} athletes
          </div>
        </div>
        </div>
      )}

      {/* BY IP TYPE VIEW */}
      {viewMode === 'by-ip-type' && (
        <div className="space-y-6">

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIPModeFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'all'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Modes
            </button>
            <button
              onClick={() => setIPModeFilter('collaboration')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'collaboration'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🤝 Collab
            </button>
            <button
              onClick={() => setIPModeFilter('logo')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'logo'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏫 Logo
            </button>
            <button
              onClick={() => setIPModeFilter('mention')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                ipModeFilter === 'mention'
                  ? 'bg-[#1770C0] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💬 Mention
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
              <div key={ipType.key} className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                {/* IP Type Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{ipType.icon}</span>
                    <h4 className="text-2xl font-bold text-gray-900">{ipType.label}</h4>
                  </div>
                  <p className="text-gray-600">
                    <span className="text-yellow-600 font-bold">{formatEMV(avgEMV)}</span> avg EMV •{' '}
                    <span className="text-[#00C4A7] font-bold">{avgLift > 0 ? '+' : ''}{(avgLift * 100).toFixed(1)}%</span> lift
                  </p>
                </div>

                {/* Top 5 Athletes */}
                <div>
                  <h5 className="text-sm font-bold text-gray-700 mb-4">TOP 5 ATHLETES</h5>
                  <div className="space-y-3">
                    {topAthletes.map((athlete, index) => (
                      <div
                        key={`${athlete.athlete.name}-${index}`}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
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
                            <div className="text-gray-600 text-xs">EMV</div>
                            <div className="text-yellow-600 font-bold text-base">{formatEMV(athlete.emv)}</div>
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
