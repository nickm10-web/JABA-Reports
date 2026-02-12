import { useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { DrawerPanel, GlassCard, GlassPill } from './playfly/PlayflyUI';

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
  const [leaderboardView, setLeaderboardView] = useState<'cards' | 'table'>('cards');
  const [showChart, setShowChart] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [quadrantFilter, setQuadrantFilter] = useState<'all' | 'champions' | 'underutilized' | 'high-adoption-low-lift' | 'needs-strategy'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredSchoolId, setHoveredSchoolId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

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

  const median = (values: number[]) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  const adoptionMedian = median(filteredRankings.map(r => r.ipAdoption));
  const liftMedian = median(filteredRankings.map(r => r.ipLift));

  const adoptionRange = useMemo(() => {
    const values = filteredRankings.map(r => r.ipAdoption);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.1 || 1;
    return { min: min - pad, max: max + pad };
  }, [filteredRankings]);

  const liftRange = useMemo(() => {
    const values = filteredRankings.map(r => r.ipLift);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.1 || 1;
    return { min: min - pad, max: max + pad };
  }, [filteredRankings]);

  const getQuadrant = (rank: typeof rankings[number]) => {
    const highAdoption = rank.ipAdoption >= adoptionMedian;
    const highLift = rank.ipLift >= liftMedian;
    if (highLift && highAdoption) return 'champions';
    if (highLift && !highAdoption) return 'underutilized';
    if (!highLift && highAdoption) return 'high-adoption-low-lift';
    return 'needs-strategy';
  };

  const quadrantLabel: Record<string, string> = {
    'champions': 'Champions',
    'underutilized': 'Underutilized',
    'high-adoption-low-lift': 'High Adoption, Low Lift',
    'needs-strategy': 'Needs Strategy'
  };

  const quadrantCounts = useMemo(() => {
    const counts = {
      champions: 0,
      underutilized: 0,
      'high-adoption-low-lift': 0,
      'needs-strategy': 0
    };
    filteredRankings.forEach(r => {
      const key = getQuadrant(r) as keyof typeof counts;
      counts[key] += 1;
    });
    return counts;
  }, [filteredRankings, adoptionMedian, liftMedian]);

  const topOpportunities = useMemo(() => {
    return [...filteredRankings]
      .filter(r => r.ipAdoption < adoptionMedian)
      .sort((a, b) => b.ipLift - a.ipLift)
      .slice(0, 3);
  }, [filteredRankings, adoptionMedian]);

  const quadrantFiltered = quadrantFilter === 'all'
    ? filteredRankings
    : filteredRankings.filter(r => getQuadrant(r) === quadrantFilter);

  // Sort data
  const sortedRankings = [...quadrantFiltered].sort((a, b) => {
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

  const scatterData = useMemo(() => sortedRankings.map(rank => ({
    x: rank.sortableAdoption,
    y: rank.ipLift,
    label: rank.displayName,
    max: rank.isPlayflyMax,
    id: rank.schoolId
  })), [sortedRankings]);

  const jitter = (id: string, axis: 'x' | 'y') => {
    let hash = 0;
    for (let i = 0; i < id.length; i += 1) hash = (hash << 5) - hash + id.charCodeAt(i);
    const seed = Math.abs(hash % 1000) / 1000;
    const offset = (seed - 0.5) * 6;
    return axis === 'x' ? offset : -offset;
  };

  const selectedRank = sortedRankings.find(r => r.schoolId === selectedSchoolId) || null;

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
          <h3 className="text-3xl pf-section-header">
            <span className="pf-header-primary">School IP Performance </span>
            <span className="pf-header-secondary">Leaderboard</span>
          </h3>
          <p className="text-gray-600 mt-2">Impact vs Adoption across the Playfly network</p>
        </div>
        <div className="text-sm text-gray-600">
          Showing {sortedRankings.length} schools
        </div>
      </div>

      {/* Sort and Filter Controls */}
      <GlassCard className="p-6" data-snapshot-hide="true">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">Sort By</label>
            <div className="flex gap-2 flex-wrap">
              <GlassPill className="pf-chip-compact" active={sortBy === 'ipLift'} onClick={() => handleSort('ipLift')}>IP Lift % {sortBy === 'ipLift' && (sortDirection === 'desc' ? '↓' : '↑')}</GlassPill>
              <GlassPill className="pf-chip-compact" active={sortBy === 'emv'} onClick={() => handleSort('emv')}>EMV {sortBy === 'emv' && (sortDirection === 'desc' ? '↓' : '↑')}</GlassPill>
              <GlassPill className="pf-chip-compact" active={sortBy === 'posts'} onClick={() => handleSort('posts')}>Posts {sortBy === 'posts' && (sortDirection === 'desc' ? '↓' : '↑')}</GlassPill>
              <GlassPill className="pf-chip-compact" active={sortBy === 'interactions'} onClick={() => handleSort('interactions')}>Interactions {sortBy === 'interactions' && (sortDirection === 'desc' ? '↓' : '↑')}</GlassPill>
              <GlassPill className="pf-chip-compact" active={sortBy === 'adoption'} onClick={() => handleSort('adoption')}>IP Adoption {sortBy === 'adoption' && (sortDirection === 'desc' ? '↓' : '↑')}</GlassPill>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-2 block">Filter</label>
            <div className="flex gap-2">
              <GlassPill className="pf-chip-compact" active={filterType === 'all'} onClick={() => setFilterType('all')}>All Schools</GlassPill>
              <GlassPill className="pf-chip-compact" active={filterType === 'max'} onClick={() => setFilterType('max')}>Max Schools ⭐</GlassPill>
            </div>
          </div>

          <div className="md:hidden">
            <GlassPill active={showChart} onClick={() => setShowChart(!showChart)}>
              {showChart ? 'Hide chart' : 'Show chart'}
            </GlassPill>
          </div>
        </div>
      </GlassCard>

      {/* Leaderboard Table + Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between md:hidden" data-snapshot-hide="true">
            <div className="text-sm text-gray-600">Showing {sortedRankings.length} schools</div>
            <div className="flex gap-2">
              <GlassPill active={leaderboardView === 'cards'} onClick={() => setLeaderboardView('cards')}>Cards</GlassPill>
              <GlassPill active={leaderboardView === 'table'} onClick={() => setLeaderboardView('table')}>Table</GlassPill>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className={`${leaderboardView === 'cards' ? 'block' : 'hidden'} md:hidden p-4 space-y-4`}>
            {sortedRankings.map((rank, index) => (
              <GlassCard
                key={`${rank.schoolId}-card`}
                className="p-4"
                onClick={() => {
                  setSelectedSchool(rank.school);
                  setSelectedSchoolId(rank.schoolId);
                  setDrawerOpen(true);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{rank.displayName}</div>
                  <div className="text-xs text-gray-500">#{index + 1}</div>
                </div>
                <div className="mt-2">
                  <span className="metric-badge">{quadrantLabel[getQuadrant(rank)]}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                  <div>IP Lift</div>
                  <div className={`text-right font-semibold ${rank.ipLift > 0 ? 'text-green-600' : rank.ipLift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                    {rank.ipLift > 0 ? '+' : ''}{rank.ipLift.toFixed(1)}%
                  </div>
                  <div>EMV</div>
                  <div className="text-right text-green-600 font-semibold">{formatEMV(rank.totalEMV)}</div>
                  <div>Posts w/ IP</div>
                  <div className="text-right text-gray-900 font-semibold">{formatNumber(rank.postsWithIP)}</div>
                  <div>Interactions</div>
                  <div className="text-right text-gray-900 font-semibold">{formatNumber(rank.totalInteractions)}</div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className={`${leaderboardView === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto md:overflow-visible`}>
            <table className="w-full">
              <thead style={{ backgroundColor: '#f9fafb' }} className="border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 w-12">
                    Rank
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700">
                    School
                  </th>
                  <th
                    onClick={() => handleSort('ipLift')}
                    className="px-3 py-3 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      IP Lift %
                      {sortBy === 'ipLift' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('emv')}
                    className="px-3 py-3 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      EMV
                      {sortBy === 'emv' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('posts')}
                    className="px-3 py-3 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Posts w/ IP
                      {sortBy === 'posts' && <span style={{ color: '#1770C0' }}>{sortDirection === 'desc' ? ' ↓' : ' ↑'}</span>}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('interactions')}
                    className="px-3 py-3 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
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
                    ref={(el) => { rowRefs.current[rank.schoolId] = el; }}
                    className={`border-b border-gray-100 hover:bg-blue-50/60 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${selectedSchoolId === rank.schoolId ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setSelectedSchool(rank.school);
                      setSelectedSchoolId(rank.schoolId);
                      setDrawerOpen(true);
                    }}
                  >
                    <td className="px-3 py-3">
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
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#1770C0] to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-[10px]">{rank.initials}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-gray-900 font-semibold truncate">{rank.displayName}</span>
                            {rank.isPlayflyMax && (
                              <span className="text-yellow-500 text-xs">⭐</span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate">
                            {quadrantLabel[getQuadrant(rank)]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className={`text-lg font-bold ${
                        rank.ipLift > 0 ? 'text-green-600' : rank.ipLift < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {rank.ipLift > 0 ? '+' : ''}{rank.ipLift.toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="text-green-600 font-semibold text-lg">
                        {formatEMV(rank.totalEMV)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="text-gray-900 font-medium text-base">
                        {formatNumber(rank.postsWithIP)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="text-gray-900 font-medium text-base">
                        {formatNumber(rank.totalInteractions)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className={`${showChart ? 'block' : 'hidden'} lg:block p-5`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-gray-700">Competitive Landscape</div>
              <div className="text-xs text-gray-500">IP Lift (Y) vs IP Adoption (X)</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="metric-badge">MAX</span>
              <span>highlighted</span>
            </div>
          </div>
          <div className="mb-3 flex gap-2 flex-wrap">
            <GlassPill className="pf-chip-compact" active={quadrantFilter === 'all'} onClick={() => setQuadrantFilter('all')}>All</GlassPill>
            <GlassPill className="pf-chip-compact" active={quadrantFilter === 'champions'} onClick={() => setQuadrantFilter('champions')}>Champions</GlassPill>
            <GlassPill className="pf-chip-compact" active={quadrantFilter === 'underutilized'} onClick={() => setQuadrantFilter('underutilized')}>Underutilized</GlassPill>
            <GlassPill className="pf-chip-compact" active={quadrantFilter === 'high-adoption-low-lift'} onClick={() => setQuadrantFilter('high-adoption-low-lift')}>High Adoption, Low Lift</GlassPill>
            <GlassPill className="pf-chip-compact" active={quadrantFilter === 'needs-strategy'} onClick={() => setQuadrantFilter('needs-strategy')}>Needs Strategy</GlassPill>
          </div>
          <div className="w-full h-[440px]">
            <svg viewBox="0 0 520 360" className="w-full h-full">
              {(() => {
                const left = 36;
                const top = 16;
                const width = 460;
                const height = 300;
                const xScale = (val: number) => left + ((val - adoptionRange.min) / (adoptionRange.max - adoptionRange.min)) * width;
                const yScale = (val: number) => top + height - ((val - liftRange.min) / (liftRange.max - liftRange.min)) * height;
                const medianX = xScale(adoptionMedian);
                const medianY = yScale(liftMedian);
                return (
                  <>
                    <rect x={left} y={top} width={width} height={height} fill="#f8fafc" stroke="#e5e7eb" />
                    <line x1={medianX} y1={top} x2={medianX} y2={top + height} stroke="#cbd5f5" strokeDasharray="4 4" />
                    <line x1={left} y1={medianY} x2={left + width} y2={medianY} stroke="#cbd5f5" strokeDasharray="4 4" />
                    <text x={medianX + 6} y={top + 12} fontSize="10" fill="#94a3b8">Network median adoption</text>
                    <text x={left + 6} y={medianY - 6} fontSize="10" fill="#94a3b8">Network median lift</text>

                    <text x={left + 8} y={top + 16} fontSize="10" fill="#94a3b8">Underutilized</text>
                    <text x={left + width - 90} y={top + 16} fontSize="10" fill="#94a3b8">Champions</text>
                    <text x={left + 8} y={top + height - 6} fontSize="10" fill="#94a3b8">Needs Strategy</text>
                    <text x={left + width - 140} y={top + height - 6} fontSize="10" fill="#94a3b8">High Adoption, Low Lift</text>

                    {scatterData.map((point, idx) => {
                      const x = xScale(point.x) + jitter(point.id, 'x');
                      const y = yScale(point.y) + jitter(point.id, 'y');
                      const isSelected = selectedSchoolId === point.id;
                      const isHovered = hoveredSchoolId === point.id;
                      const r = point.max ? 7 : 6;
                      return (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredSchoolId(point.id)}
                          onMouseLeave={() => setHoveredSchoolId(null)}
                          onClick={() => {
                            setSelectedSchoolId(point.id);
                            setDrawerOpen(true);
                            const row = rowRefs.current[point.id];
                            if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? r + 2 : r}
                            fill={point.max ? 'rgba(245, 158, 11, 0.6)' : 'rgba(23, 112, 192, 0.6)'}
                            stroke={point.max ? '#F59E0B' : '#1770C0'}
                            strokeWidth="1.5"
                          />
                          {point.max && <circle cx={x} cy={y} r={r + 4} fill="none" stroke="#F59E0B" strokeWidth="1" />}
                          {isSelected && <circle cx={x} cy={y} r={r + 6} fill="none" stroke="#1770C0" strokeWidth="2" />}
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
          {selectedRank && (
            <div className="text-xs text-gray-600 mt-2">
              {selectedRank.displayName}: {selectedRank.ipLift.toFixed(1)}% lift • {selectedRank.ipAdoption.toFixed(1)}% adoption • {formatEMV(selectedRank.totalEMV)} EMV
            </div>
          )}
          <div className="text-xs text-gray-500 mt-3">Dashed lines show network medians for lift and adoption.</div>

          {/* Quadrant Summary */}
          <div className="mt-5 border-t border-gray-200 pt-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">Quadrant Summary</div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>Champions: <span className="font-semibold">{quadrantCounts.champions}</span></div>
              <div>Underutilized: <span className="font-semibold">{quadrantCounts.underutilized}</span></div>
              <div>High Adoption, Low Lift: <span className="font-semibold">{quadrantCounts['high-adoption-low-lift']}</span></div>
              <div>Needs Strategy: <span className="font-semibold">{quadrantCounts['needs-strategy']}</span></div>
            </div>
            <div className="mt-4 text-sm font-semibold text-gray-700">Top Opportunities</div>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              {topOpportunities.map((school) => (
                <div key={school.schoolId} className="flex items-center justify-between">
                  <span className="truncate">{school.displayName}</span>
                  <span className="font-semibold text-green-600">{school.ipLift.toFixed(1)}% lift</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Top Performers Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedRankings.slice(0, 3).map((rank, index) => (
          <GlassCard
            key={rank.schoolId}
            className={`p-6 border-2 ${
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
              <div className="text-xs text-gray-500">
                {quadrantLabel[getQuadrant(rank)]} • {rank.ipAdoption.toFixed(1)}% adoption
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <DrawerPanel
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedRank ? selectedRank.displayName : 'School Detail'}
        side="right"
      >
        {selectedRank && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">IP Lift</span>
              <span className="font-semibold text-green-600">{selectedRank.ipLift.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">IP Adoption</span>
              <span className="font-semibold text-gray-900">{selectedRank.ipAdoption.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">EMV</span>
              <span className="font-semibold text-gray-900">{formatEMV(selectedRank.totalEMV)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Posts w/ IP</span>
              <span className="font-semibold text-gray-900">{formatNumber(selectedRank.postsWithIP)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Interactions</span>
              <span className="font-semibold text-gray-900">{formatNumber(selectedRank.totalInteractions)}</span>
            </div>
            <div className="text-gray-600">
              {selectedRank.ipLift >= liftMedian && selectedRank.ipAdoption < adoptionMedian
                ? 'High lift but below‑median adoption — scaling IP usage could increase EMV.'
                : selectedRank.ipLift >= liftMedian && selectedRank.ipAdoption >= adoptionMedian
                ? 'High lift with strong adoption — maintain momentum.'
                : selectedRank.ipLift < liftMedian && selectedRank.ipAdoption >= adoptionMedian
                ? 'High adoption but lower lift — refine IP strategy.'
                : 'Low lift and low adoption — needs strategy reset.'}
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
