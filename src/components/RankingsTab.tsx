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
    yes: { contents: number; emv: number };
  };
  collaboration: {
    avgLift: number;
    yes: { contents: number; emv: number };
  };
  orgInCaption: {
    avgLift: number;
    yes: { contents: number; emv: number };
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
    // Calculate average IP lift across all IP types (only include types with posts)
    const ipLifts = [];
    if (school.logo.yes.contents > 0) ipLifts.push(school.logo.avgLift);
    if (school.collaboration.yes.contents > 0) ipLifts.push(school.collaboration.avgLift);
    if (school.orgInCaption.yes.contents > 0) ipLifts.push(school.orgInCaption.avgLift);

    const avgIPLift = ipLifts.length > 0
      ? ipLifts.reduce((sum, lift) => sum + lift, 0) / ipLifts.length
      : 0;

    return {
      school: school.school.name, // Keep original for matching
      displayName: getDisplayName(school.school.name), // Use for display
      schoolId: school.school._id,
      initials: getInitials(school.school.name),
      isPlayflyMax: maxSchools.includes(school.school.name),

      // Key metrics
      ipLift: avgIPLift,
      totalEMV: school.overall.emv,
      postsWithIP: school.counts.withIp,
      totalInteractions: school.overall.totalLikes + school.overall.totalComments,
      engagementRate: school.overall.engagementRate,
      ipAdoption: (school.counts.withIp / school.overall.totalContents) * 100,

      // For sorting
      sortableIPLift: avgIPLift,
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
          <h3 className="text-3xl font-bold text-gray-900">School IP Leaderboard</h3>
          <p className="text-gray-600 mt-2">All {schoolsData.length} Playfly schools ranked by IP performance</p>
        </div>
        <div className="text-sm text-gray-600">
          Showing {sortedRankings.length} schools
        </div>
      </div>

      {/* Sort and Filter Controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Sort By</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleSort('ipLift')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'ipLift'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                IP Lift % {sortBy === 'ipLift' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('emv')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'emv'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                EMV {sortBy === 'emv' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('posts')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'posts'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Posts {sortBy === 'posts' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('interactions')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'interactions'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Interactions {sortBy === 'interactions' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => handleSort('adoption')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  sortBy === 'adoption'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                IP Adoption {sortBy === 'adoption' && (sortDirection === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Filter</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === 'all'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Schools
              </button>
              <button
                onClick={() => setFilterType('max')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filterType === 'max'
                    ? 'bg-[#1770C0] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Max Schools ⭐
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f9fafb' }} className="border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  School
                </th>
                <th
                  onClick={() => handleSort('ipLift')}
                  className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                >
                  <div className="flex items-center justify-end gap-2">
                    IP Lift %
                    {sortBy === 'ipLift' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
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
                  onClick={() => handleSort('posts')}
                  className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                >
                  <div className="flex items-center justify-end gap-2">
                    Posts w/ IP
                    {sortBy === 'posts' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('interactions')}
                  className="px-6 py-4 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                >
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex items-center gap-1.5">
                      <span>Interactions</span>
                      <div className="relative group">
                        <Info className="w-3 h-3 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                          Likes + Comments
                        </div>
                      </div>
                    </div>
                    {sortBy === 'interactions' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRankings.map((rank, index) => (
                <tr
                  key={rank.schoolId}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
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
                        <div className="text-lg font-bold text-gray-600 w-8 text-center">
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
                          <span className="text-gray-900 font-semibold">{rank.displayName}</span>
                          {rank.isPlayflyMax && (
                            <span className="text-yellow-500 text-xs">⭐</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={`text-lg font-bold ${
                      rank.ipLift > 0 ? 'text-green-600' : rank.ipLift < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {rank.ipLift > 0 ? '+' : ''}{rank.ipLift.toFixed(1)}% {rank.ipLift > 0 ? '▲' : rank.ipLift < 0 ? '▼' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-green-600 font-semibold text-lg">
                      {formatEMV(rank.totalEMV)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-gray-900 font-medium text-base">
                      {formatNumber(rank.postsWithIP)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-gray-900 font-medium text-base">
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
            className={`bg-white rounded-xl p-6 border-2 shadow-lg ${
              index === 0
                ? 'border-yellow-400'
                : index === 1
                ? 'border-gray-400'
                : 'border-orange-400'
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
              <h5 className="text-xl font-bold text-gray-900">{rank.displayName}</h5>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">IP Lift</div>
                <div className={`text-2xl font-bold ${
                  rank.ipLift > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {rank.ipLift > 0 ? '+' : ''}{rank.ipLift.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total EMV</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatEMV(rank.totalEMV)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
