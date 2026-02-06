import { useState } from 'react';
import { Info } from 'lucide-react';

// Standardized display names - ensures consistent formatting across the UI
const SCHOOL_DISPLAY_NAMES: Record<string, string> = {
  'Auburn University': 'Auburn University',
  'Baylor': 'Baylor University',
  'Brigham Young University(BYU)': 'Brigham Young University (BYU)',
  'Louisiana State University': 'Louisiana State University (LSU)',
  'Michigan State': 'Michigan State University',
  'Old Dominion University': 'Old Dominion University (ODU)',
  'Penn State University': 'Penn State University',
  'Texas A&M': 'Texas A&M University',
  'University of Central Florida': 'University of Central Florida (UCF)',
  'University of Cincinnati': 'University of Cincinnati',
  'University of Maryland': 'University of Maryland',
  'University of Nebraska': 'University of Nebraska',
  'University of New Mexico': 'University of New Mexico',
  'University of Texas at San Antonio (UTSA)': 'University of Texas at San Antonio (UTSA)',
  'University of Virginia': 'University of Virginia (UVA)',
  'Virginia Tech': 'Virginia Tech',
  'Washington State': 'Washington State University',
  'Wichita State University': 'Wichita State University'
};

// Helper function to get standardized display name
function getDisplayName(schoolName: string): string {
  return SCHOOL_DISPLAY_NAMES[schoolName] || schoolName;
}

interface SchoolIPData {
  followers: number;
  school: {
    _id: string;
    name: string;
  };
  overall: {
    totalContents: number;
    totalLikes: number;
    totalComments: number;
    engagementRate: number;
    emv: number;
  };
  counts: {
    hasOrganizationInCaption: number;
    isOrganizationCollaboration: number;
    hasOrganizationLogo: number;
    withIp: number;
  };
  logo: {
    avgLift: number;
    yes: { emv: number };
  };
  collaboration: {
    avgLift: number;
    yes: { emv: number };
  };
  orgInCaption: {
    avgLift: number;
    yes: { emv: number };
  };
}

interface RankingsTabProps {
  schoolsData: SchoolIPData[];
  setSelectedSchool: (school: string) => void;
  formatNumber: (num: number) => string;
  formatEMV: (emv: number) => string;
}

type SortMetric = 'ipLift' | 'emv' | 'posts' | 'interactions' | 'adoption';

export function RankingsTab({
  schoolsData,
  setSelectedSchool,
  formatNumber,
  formatEMV
}: RankingsTabProps) {
  const [sortBy, setSortBy] = useState<SortMetric>('ipLift');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'max'>('all');

  // Max schools
  const maxSchools = ['Michigan State', 'University of Maryland', 'Auburn University', 'Texas A&M', 'Louisiana State University', 'Penn State University'];

  // Get school initials
  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length === 1) return name.slice(0, 3).toUpperCase();
    return words
      .filter(w => w.length > 2 && !['of', 'the', 'and'].includes(w.toLowerCase()))
      .slice(0, 3)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  };

  // Calculate rankings with all metrics
  const rankings = schoolsData.map(school => {
    // Calculate best IP lift (highest of logo, collaboration, caption)
    const ipLifts = [school.logo.avgLift, school.collaboration.avgLift, school.orgInCaption.avgLift];
    const bestIPLift = Math.max(...ipLifts);

    return {
      school: school.school.name, // Keep original for matching
      displayName: getDisplayName(school.school.name), // Use for display
      schoolId: school.school._id,
      initials: getInitials(school.school.name),
      isPlayflyMax: maxSchools.includes(school.school.name),

      // Key metrics
      ipLift: bestIPLift,
      totalEMV: school.overall.emv,
      postsWithIP: school.counts.withIp,
      totalInteractions: school.overall.totalLikes + school.overall.totalComments,
      engagementRate: school.overall.engagementRate,
      ipAdoption: (school.counts.withIp / school.overall.totalContents) * 100,

      // For sorting
      sortableIPLift: bestIPLift,
      sortableEMV: school.overall.emv,
      sortablePosts: school.counts.withIp,
      sortableInteractions: school.overall.totalLikes + school.overall.totalComments,
      sortableAdoption: (school.counts.withIp / school.overall.totalContents) * 100
    };
  });

  // Filter by school type
  const filteredRankings = filterType === 'max'
    ? rankings.filter(r => r.isPlayflyMax)
    : rankings;

  // Sort data
  const sortedRankings = [...filteredRankings].sort((a, b) => {
    let aVal = 0;
    let bVal = 0;

    switch (sortBy) {
      case 'ipLift':
        aVal = a.sortableIPLift;
        bVal = b.sortableIPLift;
        break;
      case 'emv':
        aVal = a.sortableEMV;
        bVal = b.sortableEMV;
        break;
      case 'posts':
        aVal = a.sortablePosts;
        bVal = b.sortablePosts;
        break;
      case 'interactions':
        aVal = a.sortableInteractions;
        bVal = b.sortableInteractions;
        break;
      case 'adoption':
        aVal = a.sortableAdoption;
        bVal = b.sortableAdoption;
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white">School IP Leaderboard</h3>
          <p className="text-white/60 mt-2">All {schoolsData.length} Playfly schools ranked by IP performance</p>
        </div>
        <div className="text-sm text-white/60">
          Showing {sortedRankings.length} schools
        </div>
      </div>

      {/* Sort and Filter Controls */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="text-sm text-white/60 mb-2 block">Sort By</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSort('ipLift')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'ipLift'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                IP Lift % {sortBy === 'ipLift' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('emv')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'emv'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                EMV {sortBy === 'emv' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('posts')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'posts'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                Posts {sortBy === 'posts' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('interactions')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'interactions'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                Interactions {sortBy === 'interactions' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('adoption')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'adoption'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                IP Adoption {sortBy === 'adoption' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-white/60 mb-2 block">Filter</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === 'all'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                All Schools
              </button>
              <button
                onClick={() => setFilterType('max')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === 'max'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-black/40 text-white/60 hover:bg-black/60'
                }`}
              >
                Max Schools ⭐
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0e27] border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white/80">
                  School
                </th>
                <th
                  onClick={() => handleSort('ipLift')}
                  className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-2">
                    IP Lift %
                    {sortBy === 'ipLift' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
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
                  onClick={() => handleSort('posts')}
                  className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-2">
                    Posts w/ IP
                    {sortBy === 'posts' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('interactions')}
                  className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <span>Interactions</span>
                      <div className="relative group">
                        <Info className="w-3 h-3 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                          Likes + Comments
                        </div>
                      </div>
                    </div>
                    {sortBy === 'interactions' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRankings.map((rank, index) => (
                <tr
                  key={rank.schoolId}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedSchool(rank.school)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {index < 3 ? (
                        <div className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-400'
                        }`}>
                          ⭐{index + 1}
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-white/60 w-8 text-center">
                          {index + 1}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#1770C0] to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{rank.initials}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{rank.displayName}</span>
                          {rank.isPlayflyMax && (
                            <span className="text-yellow-400 text-xs">⭐</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`text-lg font-bold ${
                      rank.ipLift > 0 ? 'text-green-400' : rank.ipLift < 0 ? 'text-red-400' : 'text-white/60'
                    }`}>
                      {rank.ipLift > 0 ? '+' : ''}{rank.ipLift.toFixed(1)}% {rank.ipLift > 0 ? '▲' : rank.ipLift < 0 ? '▼' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-green-400 font-semibold text-lg">
                      {formatEMV(rank.totalEMV)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-white font-medium text-base">
                      {formatNumber(rank.postsWithIP)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-white font-medium text-base">
                      {formatNumber(rank.totalInteractions)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedRankings.slice(0, 3).map((rank, index) => (
          <div
            key={rank.schoolId}
            className={`bg-gradient-to-br rounded-xl p-6 border-2 ${
              index === 0
                ? 'from-yellow-500/10 to-yellow-900/20 border-yellow-500/30'
                : index === 1
                ? 'from-gray-400/10 to-gray-700/20 border-gray-400/30'
                : 'from-orange-500/10 to-orange-900/20 border-orange-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`text-4xl font-bold ${
                index === 0 ? 'text-yellow-400' :
                index === 1 ? 'text-gray-400' :
                'text-orange-400'
              }`}>
                #{index + 1}
              </div>
              <h5 className="text-xl font-bold text-white">{rank.displayName}</h5>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-white/60">IP Lift</div>
                <div className={`text-2xl font-bold ${
                  rank.ipLift > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {rank.ipLift > 0 ? '+' : ''}{rank.ipLift.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-white/60">Total EMV</div>
                <div className="text-lg font-bold text-white">
                  {formatEMV(rank.totalEMV)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="text-sm text-white/60 text-center">
        ⭐ = Playfly Max school • Click any row to view school details
      </div>
    </div>
  );
}
