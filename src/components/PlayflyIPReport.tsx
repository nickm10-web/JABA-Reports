import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, Download, ChevronDown, ChevronUp, Search,
  Award, Target, Users, BarChart3, Trophy, Star
} from 'lucide-react';
import { ExportModal } from './ExportModal';
import { exportToPDF, exportToCSV, exportToExcel, ExportData } from '../utils/exportUtils';
import { loadPlayflySchoolData, loadTopBrandPartners, BrandPerformance } from '../utils/playflyDataLoader';
import { formatEMV } from '../utils/emvCalculator';
import { ComparisonBarChart } from './charts/ComparisonBarChart';
import { IPTypeBreakdownChart } from './charts/IPTypeBreakdownChart';

/**
 * PLAYFLY IP IMPACT REPORT
 *
 * Shows school brand deal performance and Playfly IP impact
 * Clear, actionable insights without buzzwords
 * Data is loaded from real Playfly school data sources
 */

// ═══════════════════════════════════════════════════════════════
// PLAYFLY BRAND COLORS (matching JABA campaign dashboard style)
// ═══════════════════════════════════════════════════════════════
const colors = {
  primary: '#1770C0',      // PlayFly blue
  secondary: '#3B9FD9',    // Light blue
  darkNavy: '#091831',     // Dark background
  positive: '#10b981',     // Green for positive metrics
  negative: '#ef4444',     // Red for negative metrics
  accent: '#0369a1',       // Accent blue
  lightBg: '#f5f5f5',      // Light gray page background
  warmGray: '#78716c',
  cardBg: '#ffffff',
  cardBorder: 'transparent', // No visible borders, use shadows instead
  text: '#111827',
  textMuted: '#6b7280',
  textDim: '#9ca3af',
  headerGray: '#6b7280',   // Gray color for two-tone headers
  white: '#ffffff',
  gray: '#6b7280',
};

// Two-tone header component matching JABA style
function SectionHeader({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <h2 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
      <span style={{ color: colors.primary }}>{primary}</span>
      <span style={{ color: colors.headerGray }}>{secondary}</span>
    </h2>
  );
}

interface SchoolPerformance {
  schoolId: string;
  schoolName: string;
  isPlayflyMax: boolean;

  // Brand Deals Section
  totalSponsoredPosts: number;
  uniqueBrandCount: number;
  sponsoredAthletesCount: number;
  totalEngagement: number;

  // IP Effectiveness Section
  postsWithoutIP: number;
  engagementWithoutIP: number;
  postsWithIP: number;
  engagementWithIP: number;
  engagementLiftPercent: number;

  // IP Type Breakdown
  logoPostCount: number;
  logoEngagement: number;
  logoLift: number;

  collaborationPostCount: number;
  collaborationEngagement: number;
  collaborationLift: number;

  mentionPostCount: number;
  mentionEngagement: number;
  mentionLift: number;

  // Brands using IP
  brandsUsingIP: number;

  // EMV (Earned Media Value) Metrics
  totalEMV: number;
  emvWithoutIP: number;
  emvWithIP: number;
  avgEMVPerPost: number;
  emvLiftPercent: number;
}

interface PlayflyIPReportProps {
  onBack?: () => void;
}

export function PlayflyIPReport({ onBack }: PlayflyIPReportProps) {
  const [sortColumn, setSortColumn] = useState<keyof SchoolPerformance>('totalSponsoredPosts');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [filterPlayflyMax, setFilterPlayflyMax] = useState<'all' | 'max' | 'standard'>('all');
  const [compareSchool1, setCompareSchool1] = useState<string>('');
  const [compareSchool2, setCompareSchool2] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [schoolsData, setSchoolsData] = useState<SchoolPerformance[]>([]);
  const [topBrandPartners, setTopBrandPartners] = useState<BrandPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real data from PlayFly JSON file
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [loadedSchools, loadedBrands] = await Promise.all([
          loadPlayflySchoolData(),
          loadTopBrandPartners()
        ]);

        // EMV data is now pre-computed and included directly from the data loader
        setSchoolsData(loadedSchools as SchoolPerformance[]);
        setTopBrandPartners(loadedBrands);
      } catch (error) {
        console.error('Error loading Playfly school data:', error);
        setSchoolsData([]);
        setTopBrandPartners([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Network-wide totals - MUST be called before any conditional returns
  const networkTotals = useMemo(() => {
    return {
      totalSchools: schoolsData.length, // Use actual loaded schools count
      totalSponsoredPosts: schoolsData.reduce((sum, school) => sum + school.totalSponsoredPosts, 0),
      totalBrandPartners: schoolsData.reduce((sum, school) => sum + school.uniqueBrandCount, 0),
      totalSponsoredAthletes: schoolsData.reduce((sum, school) => sum + school.sponsoredAthletesCount, 0),
      totalEngagement: schoolsData.reduce((sum, school) => sum + school.totalEngagement, 0),

      // Aggregate IP metrics
      totalPostsWithoutIP: schoolsData.reduce((sum, school) => sum + school.postsWithoutIP, 0),
      totalEngagementWithoutIP: schoolsData.reduce((sum, school) => sum + school.engagementWithoutIP, 0),
      totalPostsWithIP: schoolsData.reduce((sum, school) => sum + school.postsWithIP, 0),
      totalEngagementWithIP: schoolsData.reduce((sum, school) => sum + school.engagementWithIP, 0),

      // Aggregate by IP type
      totalLogoPostsCount: schoolsData.reduce((sum, school) => sum + school.logoPostCount, 0),
      totalLogoEngagement: schoolsData.reduce((sum, school) => sum + school.logoEngagement, 0),
      totalCollaborationPostsCount: schoolsData.reduce((sum, school) => sum + school.collaborationPostCount, 0),
      totalCollaborationEngagement: schoolsData.reduce((sum, school) => sum + school.collaborationEngagement, 0),
      totalMentionPostsCount: schoolsData.reduce((sum, school) => sum + school.mentionPostCount, 0),
      totalMentionEngagement: schoolsData.reduce((sum, school) => sum + school.mentionEngagement, 0),

      totalBrandsUsingIP: schoolsData.reduce((sum, school) => sum + school.brandsUsingIP, 0),

      // Aggregate EMV metrics
      totalEMV: schoolsData.reduce((sum, school) => sum + school.totalEMV, 0),
      totalEMVWithoutIP: schoolsData.reduce((sum, school) => sum + school.emvWithoutIP, 0),
      totalEMVWithIP: schoolsData.reduce((sum, school) => sum + school.emvWithIP, 0)
    };
  }, [schoolsData]);

  // Calculate engagement lifts
  const avgEngagementWithoutIP = networkTotals.totalPostsWithoutIP > 0
    ? networkTotals.totalEngagementWithoutIP / networkTotals.totalPostsWithoutIP
    : 0;
  const avgEngagementWithIP = networkTotals.totalPostsWithIP > 0
    ? networkTotals.totalEngagementWithIP / networkTotals.totalPostsWithIP
    : 0;
  const overallLift = avgEngagementWithoutIP > 0
    ? Math.round(((avgEngagementWithIP - avgEngagementWithoutIP) / avgEngagementWithoutIP) * 100)
    : 0;

  // Calculate average EMV for comparison chart
  const avgEMVWithoutIP = networkTotals.totalPostsWithoutIP > 0
    ? networkTotals.totalEMVWithoutIP / networkTotals.totalPostsWithoutIP
    : 0;
  const avgEMVWithIP = networkTotals.totalPostsWithIP > 0
    ? networkTotals.totalEMVWithIP / networkTotals.totalPostsWithIP
    : 0;

  // Calculate IP type lifts
  const avgLogoEngagement = networkTotals.totalLogoPostsCount > 0
    ? networkTotals.totalLogoEngagement / networkTotals.totalLogoPostsCount
    : 0;
  const logoLift = avgEngagementWithoutIP > 0
    ? Math.round(((avgLogoEngagement - avgEngagementWithoutIP) / avgEngagementWithoutIP) * 100)
    : 0;

  const avgCollaborationEngagement = networkTotals.totalCollaborationPostsCount > 0
    ? networkTotals.totalCollaborationEngagement / networkTotals.totalCollaborationPostsCount
    : 0;
  const collaborationLift = avgEngagementWithoutIP > 0
    ? Math.round(((avgCollaborationEngagement - avgEngagementWithoutIP) / avgEngagementWithoutIP) * 100)
    : 0;

  const avgMentionEngagement = networkTotals.totalMentionPostsCount > 0
    ? networkTotals.totalMentionEngagement / networkTotals.totalMentionPostsCount
    : 0;
  const mentionLift = avgEngagementWithoutIP > 0
    ? Math.round(((avgMentionEngagement - avgEngagementWithoutIP) / avgEngagementWithoutIP) * 100)
    : 0;


  // Filtered and sorted schools
  const filteredSchools = useMemo(() => {
    let filtered = schoolsData.filter(school => {
      // Search filter
      if (schoolSearchTerm && !school.schoolName.toLowerCase().includes(schoolSearchTerm.toLowerCase())) {
        return false;
      }

      // Playfly Max filter
      if (filterPlayflyMax === 'max' && !school.isPlayflyMax) {
        return false;
      }
      if (filterPlayflyMax === 'standard' && school.isPlayflyMax) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'desc'
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      }

      return 0;
    });

    return filtered;
  }, [schoolsData, schoolSearchTerm, filterPlayflyMax, sortColumn, sortDirection]);

  // Get school by name
  const getSchoolByName = (name: string) => schoolsData.find(s => s.schoolName === name);

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  // Handle sort
  const handleSort = (column: keyof SchoolPerformance) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Handle export
  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    const exportData: ExportData = {
      reportName: 'Playfly IP Report',
      dateGenerated: new Date().toLocaleDateString(),
      metrics: [
        { label: 'Total Schools', value: networkTotals.totalSchools },
        { label: 'Total Sponsored Posts', value: networkTotals.totalSponsoredPosts },
        { label: 'Total Brand Partnerships', value: networkTotals.totalBrandPartners },
        { label: 'Total Sponsored Athletes', value: networkTotals.totalSponsoredAthletes },
        { label: 'Overall Engagement Lift with IP', value: `+${overallLift}%` }
      ],
      tables: [
        {
          title: 'School Performance',
          headers: ['School', 'Playfly Max', 'Sponsored Posts', 'Brand Partnerships', 'Sponsored Athletes', 'Total Engagement', 'Engagement Lift'],
          rows: filteredSchools.map(school => [
            school.schoolName,
            school.isPlayflyMax ? 'Yes' : 'No',
            school.totalSponsoredPosts,
            school.uniqueBrandCount,
            school.sponsoredAthletesCount,
            school.totalEngagement,
            `+${school.engagementLiftPercent}%`
          ])
        }
      ]
    };

    if (format === 'pdf') {
      await exportToPDF(exportData);
    } else if (format === 'csv') {
      await exportToCSV(exportData);
    } else {
      await exportToExcel(exportData);
    }

    setShowExportModal(false);
  };

  // Show loading state (after all hooks are called)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
          <p className="text-gray-600">Loading Playfly school data...</p>
        </div>
      </div>
    );
  }

  // If no data, show empty state (after all hooks are called)
  if (schoolsData.length === 0) {
    return (
      <div className="min-h-screen bg-white p-8" style={{ backgroundColor: colors.lightBg }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Playfly IP Report</h1>
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <p className="text-gray-600 text-lg mb-4">No school data available. Please check your data source.</p>
            <p className="text-gray-400 text-sm">Check the browser console (F12) for error details.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: colors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
              >
                ← Back to Reports
              </button>
            )}
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-5xl font-bold uppercase tracking-tight mb-2">
              <span style={{ color: colors.primary }}>PLAYFLY </span>
              <span style={{ color: colors.headerGray }}>IP REPORT</span>
            </h1>
            <p className="text-gray-600 text-lg">School brand deal performance and Playfly IP impact</p>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors shadow-sm"
            style={{ backgroundColor: colors.primary }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* JABA Hero Section */}
        <div className="relative overflow-hidden rounded-2xl shadow-sm mb-8 bg-white">
          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Headline with highlighted stats */}
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
              <span>JABA analyzed </span>
              <span className="px-3 py-1 rounded-lg" style={{ color: colors.primary, backgroundColor: `${colors.primary}15` }}>{formatNumber(networkTotals.totalSponsoredPosts)} sponsored posts</span>
              <span> across </span>
              <span className="px-3 py-1 rounded-lg" style={{ color: colors.primary, backgroundColor: `${colors.primary}15` }}>{networkTotals.totalSchools} Playfly schools</span>
              <span> to show how IP drives engagement and EMV.</span>
            </h2>

            {/* Accent bar */}
            <div className="h-1 w-40 mb-6" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />

            {/* CTA section */}
            <div className="flex items-center gap-2 font-semibold text-lg" style={{ color: colors.primary }}>
              <span>See the full picture below</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SECTION 1: SCHOOL BRAND DEALS OVERVIEW */}
        {/* ============================================ */}
        <section className="mb-8">
          <div className="mb-4">
            <SectionHeader primary="SCHOOL BRAND DEALS " secondary="OVERVIEW" />
            <p className="text-gray-600 mt-2">Performance of sponsored content and brand partnerships across Playfly schools</p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Card 1: Total Schools */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Target className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
              <div className="text-4xl font-bold mb-1" style={{ color: colors.primary }}>
                {networkTotals.totalSchools}
              </div>
              <div className="text-sm text-gray-600">Playfly Partner Schools</div>
            </div>

            {/* Card 2: Total Sponsored Posts */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <BarChart3 className="w-6 h-6" style={{ color: colors.primary }} />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {formatNumber(networkTotals.totalSponsoredPosts)}
              </div>
              <div className="text-sm text-gray-600">Athlete-created sponsored content</div>
            </div>

            {/* Card 3: Total Brand Partnerships */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-6 h-6 text-[#1770C0]" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">
                {networkTotals.totalBrandPartners}
              </div>
              <div className="text-sm text-gray-600">Brand partnerships across Playfly schools</div>
            </div>

            {/* Card 4: Total Sponsored Athletes */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-6 h-6 text-[#1770C0]" />
              </div>
              <div className="text-4xl font-bold text-white mb-1">
                {formatNumber(networkTotals.totalSponsoredAthletes)}
              </div>
              <div className="text-sm text-gray-600">Athletes with brand partnerships</div>
            </div>
          </div>

          {/* School Performance Table */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h3 className="text-xl font-bold text-white">School Performance</h3>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={schoolSearchTerm}
                    onChange={(e) => setSchoolSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#1770C0]"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterPlayflyMax}
                  onChange={(e) => setFilterPlayflyMax(e.target.value as 'all' | 'max' | 'standard')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:border-[#1770C0]"
                >
                  <option value="all">All Schools</option>
                  <option value="max">Playfly Max Only</option>
                  <option value="standard">Standard Only</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('schoolName')}
                        className="flex items-center gap-2 hover:text-white"
                      >
                        School Name
                        {sortColumn === 'schoolName' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('totalSponsoredPosts')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Sponsored Posts
                        {sortColumn === 'totalSponsoredPosts' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('uniqueBrandCount')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Brand Partners
                        {sortColumn === 'uniqueBrandCount' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('sponsoredAthletesCount')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Sponsored Athletes
                        {sortColumn === 'sponsoredAthletesCount' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('totalEngagement')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Total Engagement
                        {sortColumn === 'totalEngagement' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school, index) => (
                    <tr
                      key={school.schoolId}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => setExpandedSchool(expandedSchool === school.schoolId ? null : school.schoolId)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                          <span className="text-white font-medium">{school.schoolName}</span>
                          {school.isPlayflyMax && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFF00]/20 border border-[#FFFF00]/40 rounded text-xs text-[#FFFF00] font-semibold">
                              <Star className="w-3 h-3" />
                              Max
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">{school.totalSponsoredPosts}</td>
                      <td className="py-4 px-4 text-right text-white">{school.uniqueBrandCount}</td>
                      <td className="py-4 px-4 text-right text-white">{school.sponsoredAthletesCount}</td>
                      <td className="py-4 px-4 text-right text-white">{formatNumber(school.totalEngagement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSchools.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No schools found matching your filters
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 2: PLAYFLY IP EFFECTIVENESS */}
        {/* ============================================ */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Playfly IP Effectiveness</h2>
            <p className="text-gray-600">How Playfly IP (Logo, Collaboration, Mention) drives real engagement</p>
          </div>

          {/* 2.1 Overall Impact: With vs Without IP */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Sponsored Posts: With vs Without Playfly IP</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* LEFT: Without IP */}
              <div className="bg-black/40 border-l-4 border-gray-500 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-300 mb-4">Sponsored Posts WITHOUT Playfly IP</h4>

                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Total Posts</div>
                    <div className="text-3xl font-bold text-white">{networkTotals.totalPostsWithoutIP}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Total Engagement</div>
                    <div className="text-3xl font-bold text-white">{formatNumber(networkTotals.totalEngagementWithoutIP)}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Avg Engagement Per Post</div>
                    <div className="text-3xl font-bold text-gray-300">{formatNumber(Math.round(avgEngagementWithoutIP))}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Total EMV</div>
                    <div className="text-3xl font-bold text-white">{formatEMV(networkTotals.totalEMVWithoutIP)}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Average EMV Per Post</div>
                    <div className="text-3xl font-bold text-gray-300">
                      {formatEMV(networkTotals.totalPostsWithoutIP > 0 ? networkTotals.totalEMVWithoutIP / networkTotals.totalPostsWithoutIP : 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: With IP */}
              <div className="bg-black/40 border-l-4 border-[#00C9A7] rounded-xl p-6">
                <h4 className="text-lg font-bold text-[#00C9A7] mb-4">Sponsored Posts WITH Playfly IP</h4>

                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-4 border border-[#00C9A7]/30">
                    <div className="text-sm text-gray-600 mb-1">Total Posts</div>
                    <div className="text-3xl font-bold text-white">{networkTotals.totalPostsWithIP}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-[#00C9A7]/30">
                    <div className="text-sm text-gray-600 mb-1">Total Engagement</div>
                    <div className="text-3xl font-bold text-white">{formatNumber(networkTotals.totalEngagementWithIP)}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-[#00C9A7]/30">
                    <div className="text-sm text-gray-600 mb-1">Avg Engagement Per Post</div>
                    <div className="text-3xl font-bold text-[#00C9A7]">{formatNumber(Math.round(avgEngagementWithIP))}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-[#00C9A7]/30">
                    <div className="text-sm text-gray-600 mb-1">Total EMV</div>
                    <div className="text-3xl font-bold text-white">{formatEMV(networkTotals.totalEMVWithIP)}</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-[#00C9A7]/30">
                    <div className="text-sm text-gray-600 mb-1">Average EMV Per Post</div>
                    <div className="text-3xl font-bold text-[#00C9A7]">
                      {formatEMV(networkTotals.totalPostsWithIP > 0 ? networkTotals.totalEMVWithIP / networkTotals.totalPostsWithIP : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* THE LIFT */}
            <div className="bg-gradient-to-br from-[#00C9A7]/20 to-green-900/20 border-2 border-[#00C9A7]/50 rounded-xl p-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-[#00C9A7]" />
                  <div className="text-6xl font-bold text-[#00C9A7]">+{overallLift}%</div>
                </div>
                <p className="text-lg text-white">
                  <span className="font-bold text-[#00C9A7]">Engagement Boost</span><br />
                  Posts with IP get {overallLift}% more engagement
                </p>
              </div>
            </div>

            {/* GRAPH 1: With vs Without IP Comparison Chart */}
            <div className="mt-8">
              <ComparisonBarChart
                withoutIP={{
                  engagement: Math.round(avgEngagementWithoutIP),
                  emv: avgEMVWithoutIP
                }}
                withIP={{
                  engagement: Math.round(avgEngagementWithIP),
                  emv: avgEMVWithIP
                }}
                formatNumber={formatNumber}
                formatEMV={formatEMV}
              />
            </div>
          </div>

          {/* 2.2 IP Type Breakdown */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">IP Type Performance</h3>
            <p className="text-gray-600 mb-6">Engagement boost by IP type (Logo, Collaboration, Mention)</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Logo */}
              <div className="bg-black/40 border-2 border-blue-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Visual IP</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Posts using Visual IP</div>
                    <div className="text-2xl font-bold text-white">{networkTotals.totalLogoPostsCount}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Total Engagement</div>
                    <div className="text-2xl font-bold text-white">{formatNumber(networkTotals.totalLogoEngagement)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Avg Engagement Per Post</div>
                    <div className="text-2xl font-bold text-white">{formatNumber(Math.round(avgLogoEngagement))}</div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Engagement Boost</div>
                    <div className="text-3xl font-bold text-blue-500">+{logoLift}%</div>
                  </div>
                </div>
              </div>

              {/* Collaboration */}
              <div className="bg-black/40 border-2 border-green-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Collaboration</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Posts using Collaboration</div>
                    <div className="text-2xl font-bold text-white">{networkTotals.totalCollaborationPostsCount}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Total Engagement</div>
                    <div className="text-2xl font-bold text-white">{formatNumber(networkTotals.totalCollaborationEngagement)}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Avg Engagement Per Post</div>
                    <div className="text-2xl font-bold text-white">{formatNumber(Math.round(avgCollaborationEngagement))}</div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Engagement Boost</div>
                    <div className="text-3xl font-bold text-green-500">+{collaborationLift}%</div>
                  </div>
                </div>
              </div>

              {/* Mention */}
              <div className="bg-black/40 border-2 border-yellow-500 rounded-xl p-6 relative overflow-hidden">
                {/* Header - visible */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-yellow-500" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Mention</h4>
                </div>

                {/* Data - blurred */}
                <div className="space-y-3 filter blur-md select-none pointer-events-none">
                  <div>
                    <div className="text-sm text-gray-600">Posts using Mention</div>
                    <div className="text-2xl font-bold text-white">1247</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Total Engagement</div>
                    <div className="text-2xl font-bold text-white">3.2M</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Avg Engagement Per Post</div>
                    <div className="text-2xl font-bold text-white">2.6K</div>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <div className="text-sm text-gray-600 mb-1">Engagement Boost</div>
                    <div className="text-3xl font-bold text-yellow-500">+2456%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* GRAPH 2: IP Type Breakdown Chart */}
            <div className="mt-8">
              <IPTypeBreakdownChart
                logo={{
                  posts: networkTotals.totalLogoPostsCount,
                  engagement: networkTotals.totalLogoEngagement,
                  lift: logoLift
                }}
                collaboration={{
                  posts: networkTotals.totalCollaborationPostsCount,
                  engagement: networkTotals.totalCollaborationEngagement,
                  lift: collaborationLift
                }}
                mention={{
                  posts: networkTotals.totalMentionPostsCount,
                  engagement: networkTotals.totalMentionEngagement,
                  lift: mentionLift
                }}
                formatNumber={formatNumber}
              />
            </div>
          </div>

          {/* 2.3 Brands Using Playfly IP */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Brand Partners Using Playfly IP</h3>

            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-[#1770C0] mb-2">{networkTotals.totalBrandsUsingIP}</div>
                <p className="text-gray-600 text-lg">Brand Partners are using Playfly IP</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Using Logo</div>
                  <div className="text-2xl font-bold text-blue-500">{networkTotals.totalBrandsUsingIP}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Using Collaboration</div>
                  <div className="text-2xl font-bold text-green-500">{Math.round(networkTotals.totalBrandsUsingIP * 0.6)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">Using Mention</div>
                  <div className="text-2xl font-bold text-yellow-500 filter blur-sm select-none pointer-events-none">247</div>
                </div>
              </div>
            </div>

            {/* Top Brands Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Top 10 Brands by Engagement with IP</h4>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-gray-600 font-semibold">Brand</th>
                      <th className="text-center py-3 px-4 text-gray-600 font-semibold">IP Types Used</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-semibold">Posts with IP</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-semibold">Total Engagement</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-semibold">Avg Per Post</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBrandPartners.map((brand, index) => (
                      <tr key={brand.brandName} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                            <span className="text-white font-medium">{brand.brandName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center gap-1">
                            {brand.ipTypesUsed.map(type => (
                              <span
                                key={type}
                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                  type === 'Logo' ? 'bg-blue-500/20 text-blue-400' :
                                  type === 'Collaboration' ? 'bg-green-500/20 text-green-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}
                              >
                                {type === 'Logo' ? 'Visual IP' : type}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right text-white">{brand.postsWithIP}</td>
                        <td className="py-4 px-4 text-right text-white">{formatNumber(brand.engagementWithIP)}</td>
                        <td className="py-4 px-4 text-right text-white">{formatNumber(brand.avgEngagementPerPost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* SECTION 3: SCHOOL BENCHMARKING / LEADERBOARD */}
        {/* ============================================ */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">School Benchmarking</h2>
            <p className="text-gray-600">Compare your school against other Playfly schools on IP performance</p>
          </div>

          {/* 3.1 Interactive Leaderboard */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-6 h-6 text-[#FFFF00]" />
              <h3 className="text-xl font-bold text-white">Playfly Schools IP Performance Leaderboard</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">Rank</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('schoolName')}
                        className="flex items-center gap-2 hover:text-white"
                      >
                        School Name
                        {sortColumn === 'schoolName' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('postsWithIP')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Posts with IP
                        {sortColumn === 'postsWithIP' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('engagementWithIP')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Engagement
                        {sortColumn === 'engagementWithIP' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('brandsUsingIP')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Brands
                        {sortColumn === 'brandsUsingIP' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('totalEMV')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Total EMV
                        {sortColumn === 'totalEMV' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="text-right py-3 px-4 text-gray-600 font-semibold">
                      <button
                        onClick={() => handleSort('engagementLiftPercent')}
                        className="flex items-center gap-2 ml-auto hover:text-white"
                      >
                        Boost %
                        {sortColumn === 'engagementLiftPercent' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map((school, index) => (
                    <tr
                      key={school.schoolId}
                      className={`border-b border-white/5 hover:bg-white/5 ${
                        index < 3 ? 'bg-[#FFFF00]/5' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {index === 0 && <Trophy className="w-5 h-5 text-[#FFD700]" />}
                          {index === 1 && <Trophy className="w-5 h-5 text-[#C0C0C0]" />}
                          {index === 2 && <Trophy className="w-5 h-5 text-[#CD7F32]" />}
                          <span className={`font-bold ${index < 3 ? 'text-[#FFFF00]' : 'text-gray-600'}`}>
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{school.schoolName}</span>
                          {school.isPlayflyMax && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFF00]/20 border border-[#FFFF00]/40 rounded text-xs text-[#FFFF00] font-semibold">
                              <Star className="w-3 h-3" />
                              Max
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-white">{school.postsWithIP}</td>
                      <td className="py-4 px-4 text-right text-white">{formatNumber(school.engagementWithIP)}</td>
                      <td className="py-4 px-4 text-right text-white">{school.brandsUsingIP}</td>
                      <td className="py-4 px-4 text-right text-white font-semibold">{formatEMV(school.totalEMV)}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[#00C9A7] font-bold">+{school.engagementLiftPercent}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.2 School Comparison Tool */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Compare Two Schools</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">School 1</label>
                <select
                  value={compareSchool1}
                  onChange={(e) => setCompareSchool1(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:border-[#1770C0]"
                >
                  <option value="">Select a school...</option>
                  {schoolsData.map(school => (
                    <option key={school.schoolId} value={school.schoolName}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">School 2</label>
                <select
                  value={compareSchool2}
                  onChange={(e) => setCompareSchool2(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-white focus:outline-none focus:border-[#1770C0]"
                >
                  <option value="">Select a school...</option>
                  {schoolsData.map(school => (
                    <option key={school.schoolId} value={school.schoolName}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {compareSchool1 && compareSchool2 && (() => {
              const school1 = getSchoolByName(compareSchool1);
              const school2 = getSchoolByName(compareSchool2);

              if (!school1 || !school2) return null;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* School 1 */}
                  <div className="bg-white border border-gray-300 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-lg font-bold text-white">{school1.schoolName}</h4>
                      {school1.isPlayflyMax && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFF00]/20 border border-[#FFFF00]/40 rounded text-xs text-[#FFFF00] font-semibold">
                          <Star className="w-3 h-3" />
                          Max
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sponsored Posts:</span>
                        <span className="text-white font-semibold">{school1.totalSponsoredPosts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posts with IP:</span>
                        <span className="text-white font-semibold">
                          {school1.postsWithIP} ({Math.round((school1.postsWithIP / school1.totalSponsoredPosts) * 100)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Engagement:</span>
                        <span className="text-white font-semibold">{formatNumber(school1.totalEngagement)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand Partners:</span>
                        <span className="text-white font-semibold">{school1.uniqueBrandCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Per Post:</span>
                        <span className="text-white font-semibold">
                          {formatNumber(Math.round(school1.totalEngagement / school1.totalSponsoredPosts))}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-gray-600">Engagement Boost:</span>
                        <span className="text-[#00C9A7] font-bold">+{school1.engagementLiftPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total EMV:</span>
                        <span className="text-white font-semibold">{formatEMV(school1.totalEMV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">EMV Boost:</span>
                        <span className="text-[#3B9FD9] font-bold">+{school1.emvLiftPercent}%</span>
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        <div className="text-gray-600 mb-2">Top IP Types:</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-400">1. Visual IP</span>
                            <span className="text-white">
                              {Math.round((school1.logoPostCount / school1.postsWithIP) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">2. Collaboration</span>
                            <span className="text-white">
                              {Math.round((school1.collaborationPostCount / school1.postsWithIP) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-yellow-400">3. Mention</span>
                            <span className="text-white filter blur-sm select-none">
                              18%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* School 2 */}
                  <div className="bg-white border border-gray-300 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-lg font-bold text-white">{school2.schoolName}</h4>
                      {school2.isPlayflyMax && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFFF00]/20 border border-[#FFFF00]/40 rounded text-xs text-[#FFFF00] font-semibold">
                          <Star className="w-3 h-3" />
                          Max
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sponsored Posts:</span>
                        <span className="text-white font-semibold">{school2.totalSponsoredPosts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Posts with IP:</span>
                        <span className="text-white font-semibold">
                          {school2.postsWithIP} ({Math.round((school2.postsWithIP / school2.totalSponsoredPosts) * 100)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Engagement:</span>
                        <span className="text-white font-semibold">{formatNumber(school2.totalEngagement)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand Partners:</span>
                        <span className="text-white font-semibold">{school2.uniqueBrandCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Per Post:</span>
                        <span className="text-white font-semibold">
                          {formatNumber(Math.round(school2.totalEngagement / school2.totalSponsoredPosts))}
                        </span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-gray-600">Engagement Boost:</span>
                        <span className="text-[#00C9A7] font-bold">+{school2.engagementLiftPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total EMV:</span>
                        <span className="text-white font-semibold">{formatEMV(school2.totalEMV)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">EMV Boost:</span>
                        <span className="text-[#3B9FD9] font-bold">+{school2.emvLiftPercent}%</span>
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        <div className="text-gray-600 mb-2">Top IP Types:</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-blue-400">1. Visual IP</span>
                            <span className="text-white">
                              {Math.round((school2.logoPostCount / school2.postsWithIP) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-400">2. Collaboration</span>
                            <span className="text-white">
                              {Math.round((school2.collaborationPostCount / school2.postsWithIP) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-yellow-400">3. Mention</span>
                            <span className="text-white filter blur-sm select-none">
                              22%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {(!compareSchool1 || !compareSchool2) && (
              <div className="text-center py-8 text-gray-400">
                Select two schools to compare their performance
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        reportName="Playfly IP Report"
      />
    </div>
  );
}
