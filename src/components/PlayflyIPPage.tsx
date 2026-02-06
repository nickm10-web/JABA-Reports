import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Award, Users, BarChart3, Info } from 'lucide-react';
import { PartnershipsTab } from './PartnershipsTab';
import { RankingsTab } from './RankingsTab';
import { AthletesTab } from './AthletesTab';
import { loadPartnershipDataWithRecalculatedEMV } from '../utils/partnershipDataLoader';

/**
 * PLAYFLY IP PAGE
 *
 * Displays school IP impact data with tabbed interface
 * Tabs: Overview, With vs Without, Partnerships, Benchmark
 */

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
  orgInCaption: {
    yes: {
      contents: number;
      likes: number;
      comments: number;
      engagementRate: number;
      emv: number;
    };
    no: {
      contents: number;
      likes: number;
      comments: number;
      engagementRate: number;
    };
    avgLift: number;
  };
  collaboration: {
    yes: {
      contents: number;
      likes: number;
      comments: number;
      engagementRate: number;
      emv: number;
    };
    no: {
      contents: number;
      likes: number;
      comments: number;
      engagementRate: number;
    };
    avgLift: number;
  };
  logo: {
    yes: {
      contents: number;
      likes: number;
      comments: number;
      engagementRate: number;
      emv: number;
    };
    no: {
      contents: number;
      likes: number;
      comments: number;
      engagementRate: number;
    };
    avgLift: number;
  };
}

interface BrandPartnershipData {
  totalPosts: number;
  activeBrands: number;
  activeSchools: number;
  totalSchools: number;
  avgPostsPerBrand: number;
  brandStats: Array<{
    brandName: string;
    postCount: number;
    schoolCount: number;
    avgEngagementRate: number;
  }>;
  schoolStats: Array<{
    schoolName: string;
    postCount: number;
    brandCount: number;
    avgEngagementRate: number;
  }>;
}

interface SchoolPartnershipData {
  school: {
    _id: string;
    name: string;
  };
  followers: number;
  overall: {
    totalContents: number;
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    emv: number;
  };
  sponsorPartners: Array<{
    totalContents: number;
    avgLikes: number;
    avgComments: number;
    sponsorPartner: string;
    engagementRate: number;
    emv: number;
    engagementRateLift: number;
  }>;
}

interface SchoolAthleteData {
  school: {
    _id: string;
    name: string;
  };
  collaboration: {
    avgEmv: number;
    avgLift: number;
    top5Athletes: Array<{
      athlete: { name: string; sport: string };
      posts: number;
      emv: number;
      engagementRate: number;
      lift: number;
    }>;
  };
  logo: {
    avgEmv: number;
    avgLift: number;
    top5Athletes: Array<{
      athlete: { name: string; sport: string };
      posts: number;
      emv: number;
      engagementRate: number;
      lift: number;
    }>;
  };
  'mention (in caption)': {
    avgEmv: number;
    avgLift: number;
    top5Athletes: Array<{
      athlete: { name: string; sport: string };
      posts: number;
      emv: number;
      engagementRate: number;
      lift: number;
    }>;
  };
  partnership: {
    avgEmv: number;
    avgLift: number;
    top5Athletes: Array<{
      athlete: { name: string; sport: string };
      posts: number;
      emv: number;
      engagementRate: number;
      lift: number;
    }>;
  };
}

interface PlayflyIPPageProps {
  onBack?: () => void;
}

type TabType = 'overview' | 'with-vs-without' | 'partnerships' | 'athletes' | 'rankings';

// Map school names (as they appear in data) to their JSON file names
const SCHOOL_FILE_MAP: Record<string, string> = {
  'Auburn University': 'auburn-university',
  'Baylor': 'baylor',
  'Louisiana State University': 'louisiana-state-university',
  'Michigan State': 'michigan-state',
  'Old Dominion University': 'old-dominion-university',
  'Penn State University': 'penn-state-university',
  'Texas A&M': 'texas-a-m',
  'University of Central Florida': 'university-of-central-florida',
  'University of Cincinnati': 'university-of-cincinnati',
  'University of Maryland': 'university-of-maryland',
  'University of Nebraska': 'university-of-nebraska',
  'University of Texas at San Antonio (UTSA)': 'university-of-texas-at-san-antonio-utsa',
  'University of Virginia': 'university-of-virginia',
  'Virginia Tech': 'virginia-tech',
  'Washington State': 'washington-state'
};

// Standardized display names - ensures consistent formatting across the UI
const SCHOOL_DISPLAY_NAMES: Record<string, string> = {
  'Auburn University': 'Auburn University',
  'Baylor': 'Baylor University',
  'Louisiana State University': 'Louisiana State University (LSU)',
  'Michigan State': 'Michigan State University',
  'Old Dominion University': 'Old Dominion University (ODU)',
  'Penn State University': 'Penn State University',
  'Texas A&M': 'Texas A&M University',
  'University of Central Florida': 'University of Central Florida (UCF)',
  'University of Cincinnati': 'University of Cincinnati',
  'University of Maryland': 'University of Maryland',
  'University of Nebraska': 'University of Nebraska',
  'University of Texas at San Antonio (UTSA)': 'University of Texas at San Antonio (UTSA)',
  'University of Virginia': 'University of Virginia (UVA)',
  'Virginia Tech': 'Virginia Tech',
  'Washington State': 'Washington State University'
};

// Helper function to get standardized display name
function getDisplayName(schoolName: string): string {
  return SCHOOL_DISPLAY_NAMES[schoolName] || schoolName;
}

export function PlayflyIPPage({ onBack }: PlayflyIPPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [ipTypeTab, setIpTypeTab] = useState<'logo' | 'collaboration' | 'caption'>('logo');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [schoolsData, setSchoolsData] = useState<SchoolIPData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Brand partnership data
  const [brandData, setBrandData] = useState<BrandPartnershipData | null>(null);
  const [_schoolPartnershipData, setSchoolPartnershipData] = useState<SchoolPartnershipData[]>([]);

  // Athletes data
  const [athleteData, setAthleteData] = useState<SchoolAthleteData[]>([]);

  // Baseline table state
  type BaselineSortMetric = 'rank' | 'school' | 'totalPosts' | 'sponsoredPosts' | 'totalLikes' | 'totalEngagement';
  const [baselineSortBy, setBaselineSortBy] = useState<BaselineSortMetric>('rank');
  const [baselineSortDirection, setBaselineSortDirection] = useState<'asc' | 'desc'>('asc');
  const [baselineSearchQuery, setBaselineSearchQuery] = useState('');

  // Load school-specific IP impact data and brand partnership data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // Load school IP data
        const schoolPromises = Object.values(SCHOOL_FILE_MAP).map(async (fileName) => {
          const response = await fetch(`/data/${fileName}-ip-impact.json`);
          if (!response.ok) return null;
          return response.json() as Promise<SchoolIPData>;
        });

        // Load brand partnership data
        const brandPromise = fetch('/data/brand-partnership-summary.json')
          .then(res => res.ok ? res.json() as Promise<BrandPartnershipData> : null)
          .catch(() => null);

        // Load school partnership data with recalculated EMV
        const partnershipDataPromise = loadPartnershipDataWithRecalculatedEMV(
          Object.values(SCHOOL_FILE_MAP)
        );

        // Load athlete data
        const athletePromises = Object.values(SCHOOL_FILE_MAP).map(async (fileName) => {
          const response = await fetch(`/data/${fileName}-top-athletes.json`);
          if (!response.ok) return null;
          return response.json() as Promise<SchoolAthleteData>;
        });

        const [schoolResults, brandResult, partnershipResults, athleteResults] = await Promise.all([
          Promise.all(schoolPromises),
          brandPromise,
          partnershipDataPromise,
          Promise.all(athletePromises)
        ]);

        const validSchools = schoolResults.filter((school): school is SchoolIPData => school !== null);
        setSchoolsData(validSchools);

        if (brandResult) {
          setBrandData(brandResult);
        }

        // partnershipResults is already filtered by the loader
        setSchoolPartnershipData(partnershipResults);

        const validAthletes = athleteResults.filter((a): a is SchoolAthleteData => a !== null);
        setAthleteData(validAthletes);
      } catch (error) {
        console.error('Error loading data:', error);
        setSchoolsData([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter data based on selected school
  const filteredSchools = useMemo(() => {
    if (selectedSchool === 'all') {
      return schoolsData;
    }
    const school = schoolsData.find(s => s.school.name === selectedSchool);
    return school ? [school] : [];
  }, [schoolsData, selectedSchool]);

  // Calculate network-wide or school-specific totals
  const networkTotals = useMemo(() => {
    return {
      totalSchools: filteredSchools.length,
      totalContents: filteredSchools.reduce((sum, s) => sum + s.overall.totalContents, 0),
      totalLikes: filteredSchools.reduce((sum, s) => sum + s.overall.totalLikes, 0),
      totalComments: filteredSchools.reduce((sum, s) => sum + s.overall.totalComments, 0),
      totalEMV: filteredSchools.reduce((sum, s) => sum + s.overall.emv, 0),
      totalFollowers: filteredSchools.reduce((sum, s) => sum + s.followers, 0),

      // IP usage totals
      totalWithIP: filteredSchools.reduce((sum, s) => sum + s.counts.withIp, 0),
      totalWithLogo: filteredSchools.reduce((sum, s) => sum + s.counts.hasOrganizationLogo, 0),
      totalWithCollaboration: filteredSchools.reduce((sum, s) => sum + s.counts.isOrganizationCollaboration, 0),
      totalWithCaption: filteredSchools.reduce((sum, s) => sum + s.counts.hasOrganizationInCaption, 0),

      // Average lifts
      avgLogoLift: filteredSchools.length > 0
        ? filteredSchools.reduce((sum, s) => sum + s.logo.avgLift, 0) / filteredSchools.length
        : 0,
      avgCollabLift: filteredSchools.length > 0
        ? filteredSchools.reduce((sum, s) => sum + s.collaboration.avgLift, 0) / filteredSchools.length
        : 0,
      avgCaptionLift: filteredSchools.length > 0
        ? filteredSchools.reduce((sum, s) => sum + s.orgInCaption.avgLift, 0) / filteredSchools.length
        : 0
    };
  }, [filteredSchools]);

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  // Format full numbers without abbreviations (for baseline metrics)
  const formatFullNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  const formatEMV = (emv: number): string => {
    if (emv >= 1000000) return `$${(emv / 1000000).toFixed(1)}M`;
    if (emv >= 1000) return `$${(emv / 1000).toFixed(0)}K`;
    return `$${Math.round(emv).toLocaleString()}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#091831] via-[#0B1F3D] to-[#091831] text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1770C0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading school IP impact data...</p>
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (schoolsData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#091831] via-[#0B1F3D] to-[#091831] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-4">Playfly IP Page</h1>
          <div className="bg-black/40 border border-white/10 rounded-xl p-12 text-center">
            <p className="text-white/60 text-lg mb-4">No school data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#091831] via-[#0B1F3D] to-[#091831] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white mb-8 flex items-center gap-2"
          >
            ← Back to Reports
          </button>
        )}

        {/* JABA Hero Section */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl mb-12">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />

          {/* Content */}
          <div className="relative z-10 p-6 md:p-12">
            {/* Headline with highlighted stats */}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 leading-tight">
              <span className="text-white">JABA analyzed </span>
              <span className="text-[#3B9FD9] bg-[#1770C0]/20 px-3 py-1 rounded-lg">{formatNumber(networkTotals.totalContents)} posts</span>
              <span className="text-white"> across </span>
              <span className="text-[#3B9FD9] bg-[#1770C0]/20 px-3 py-1 rounded-lg">{networkTotals.totalSchools} Playfly schools</span>
              <span className="text-white"> to show how IP drives engagement.</span>
            </h2>

            {/* Accent bar */}
            <div className="h-1 w-40 bg-gradient-to-r from-[#3B9FD9] to-blue-500 mb-8" />

            {/* Key findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-5xl">
            </div>

            {/* CTA section */}
            <div className="flex items-center gap-2 text-[#3B9FD9] font-semibold text-lg">
              <span>Explore the data below</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sticky Header: School Selector + Tabs */}
        <div className="sticky top-0 z-40 bg-[#091831] pb-4 -mx-6 px-6 mb-8 shadow-lg">
          {/* School Selector */}
          <div className="pt-4 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
              <label className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <span className="text-xl">🏫</span>
                Filter by School:
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="bg-black/40 border-2 border-white/30 rounded-lg px-5 py-3 text-white text-base font-medium focus:border-[#3B9FD9] hover:border-[#3B9FD9] focus:outline-none transition-colors w-full md:min-w-[350px] cursor-pointer"
              >
                <option value="all">All Schools ({schoolsData.length})</option>
                <optgroup label="Individual Schools">
                  {schoolsData.map((school) => (
                    <option key={school.school._id} value={school.school.name}>
                      {getDisplayName(school.school.name)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            {selectedSchool !== 'all' && (
              <button
                onClick={() => setSelectedSchool('all')}
                className="text-[#3B9FD9] hover:text-white text-sm font-semibold"
              >
                ← Back to All Schools
              </button>
            )}
          </div>

          {/* Tabbed Navigation */}
          <div className="flex gap-2 md:gap-4 border-b border-white/20 overflow-x-auto scrollbar-hide -mx-6 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'overview'
                  ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('with-vs-without')}
              className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'with-vs-without'
                  ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              With vs Without
            </button>
            <button
              onClick={() => setActiveTab('partnerships')}
              className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'partnerships'
                  ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Partnerships
            </button>
            <button
              onClick={() => setActiveTab('athletes')}
              className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'athletes'
                  ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Athletes
            </button>
            <button
              onClick={() => setActiveTab('rankings')}
              className={`px-4 md:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === 'rankings'
                  ? 'text-[#3B9FD9] border-b-2 border-[#3B9FD9]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Rankings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                {selectedSchool === 'all' ? 'All Schools Overview' : `${selectedSchool} Overview`}
              </h3>
              {selectedSchool !== 'all' && filteredSchools.length > 0 && (
                <div className="text-sm text-white/60">
                  Total Followers: <span className="text-[#3B9FD9] font-bold">{formatNumber(filteredSchools[0].followers)}</span>
                </div>
              )}
            </div>

            {/* Combined Stats Cards - All Playfly School Metrics */}
            {selectedSchool === 'all' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-white">Combined Performance</h4>
                  <p className="text-white/60 text-sm mt-1">Combined metrics across all {networkTotals.totalSchools} Playfly partner schools</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-6 h-6 text-[#1770C0]" />
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#FFFF00] mb-1">
                      {formatNumber(networkTotals.totalFollowers)}
                    </div>
                    <div className="text-sm text-white/60">Total Followers</div>
                  </div>

                  <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-6 h-6 text-[#1770C0]" />
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                      {formatNumber(networkTotals.totalContents)}
                    </div>
                    <div className="text-sm text-white/60">Total Posts</div>
                  </div>

                  <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-6 h-6 text-[#1770C0]" />
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                      {formatNumber(networkTotals.totalLikes + networkTotals.totalComments)}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-white/60">
                      <span>Total Interactions</span>
                      <div className="relative group">
                        <Info className="w-3.5 h-3.5 cursor-help" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                          Likes + Comments
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 border-2 border-[#1770C0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-6 h-6 text-[#1770C0]" />
                    </div>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                      {formatEMV(networkTotals.totalEMV)}
                    </div>
                    <div className="text-sm text-white/60">Total EMV</div>
                  </div>
                </div>
              </div>
            )}

            {/* Baseline Metrics Table - Only show in network view */}
            {selectedSchool === 'all' && (() => {
              // Max schools
              const maxSchools = ['Michigan State', 'University of Maryland', 'Auburn University', 'Texas A&M', 'Louisiana State University', 'Penn State University'];

              // Calculate baseline metrics for each school
              const baselineData = schoolsData.map((school, index) => {
                // Find matching partnership data for this school
                const partnershipData = _schoolPartnershipData.find(p => p.school._id === school.school._id);
                const sponsoredPosts = partnershipData
                  ? partnershipData.sponsorPartners.reduce((sum, partner) => sum + partner.totalContents, 0)
                  : 0;

                // Calculate engagement from posts WITH IP only
                // Posts without any IP
                const postsWithoutIP = school.overall.totalContents - school.counts.withIp;
                // Use collaboration.no as proxy for average engagement per "no IP" post (covers most posts)
                const avgEngagementPerNoIPPost = school.collaboration.no.likes + school.collaboration.no.comments;
                // Total engagement from posts without IP
                const engagementFromNoIP = avgEngagementPerNoIPPost * postsWithoutIP;
                // Total engagement from posts WITH IP (subtract no-IP from overall)
                const totalEngagementOverall = school.overall.totalLikes + school.overall.totalComments;
                const engagementFromWithIP = totalEngagementOverall - engagementFromNoIP;

                // Calculate total likes/comments from IP posts (proportional split)
                const ipEngagementRatio = engagementFromWithIP / totalEngagementOverall;
                const totalLikesFromIP = school.overall.totalLikes * ipEngagementRatio;
                const totalCommentsFromIP = school.overall.totalComments * ipEngagementRatio;

                return {
                  rank: index + 1,
                  schoolName: getDisplayName(school.school.name),
                  schoolId: school.school._id,
                  isPlayflyMax: maxSchools.includes(school.school.name),
                  totalPosts: school.overall.totalContents,
                  sponsoredPosts: sponsoredPosts,
                  totalLikes: totalLikesFromIP,
                  totalComments: totalCommentsFromIP,
                  totalEngagement: engagementFromWithIP,
                  avgEngagementPerPost: engagementFromWithIP / school.counts.withIp,
                  avgLikesPerPost: totalLikesFromIP / school.counts.withIp,
                  engagementRate: school.overall.engagementRate
                };
              });

              // Filter by search query
              const filteredData = baselineSearchQuery
                ? baselineData.filter(school =>
                    school.schoolName.toLowerCase().includes(baselineSearchQuery.toLowerCase())
                  )
                : baselineData;

              // Sort data
              const sortedData = [...filteredData].sort((a, b) => {
                let aVal: number | string = 0;
                let bVal: number | string = 0;

                switch (baselineSortBy) {
                  case 'rank':
                    aVal = a.rank;
                    bVal = b.rank;
                    break;
                  case 'school':
                    aVal = a.schoolName;
                    bVal = b.schoolName;
                    break;
                  case 'totalPosts':
                    aVal = a.totalPosts;
                    bVal = b.totalPosts;
                    break;
                  case 'sponsoredPosts':
                    aVal = a.sponsoredPosts;
                    bVal = b.sponsoredPosts;
                    break;
                  case 'totalLikes':
                    aVal = a.avgLikesPerPost;
                    bVal = b.avgLikesPerPost;
                    break;
                  case 'totalEngagement':
                    aVal = a.avgEngagementPerPost;
                    bVal = b.avgEngagementPerPost;
                    break;
                }

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                  return baselineSortDirection === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
                }

                return baselineSortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
              });

              const handleBaselineSort = (metric: BaselineSortMetric) => {
                if (baselineSortBy === metric) {
                  setBaselineSortDirection(baselineSortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setBaselineSortBy(metric);
                  setBaselineSortDirection(metric === 'school' ? 'asc' : 'desc');
                }
              };

              return (
                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden mb-8">
                  {/* Table Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-2xl font-bold text-white">School Baseline Metrics</h4>
                        <p className="text-sm text-white/60 mt-1">Raw engagement data for all {schoolsData.length} Playfly schools</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Search schools..."
                          value={baselineSearchQuery}
                          onChange={(e) => setBaselineSearchQuery(e.target.value)}
                          className="bg-black/60 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:border-[#3B9FD9] focus:outline-none w-64"
                        />
                        <span className="text-xs text-white/60">
                          Showing {sortedData.length} of {schoolsData.length} schools
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#0a0e27] border-b border-white/10">
                        <tr>
                          <th
                            onClick={() => handleBaselineSort('rank')}
                            className="px-6 py-4 text-left text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                          >
                            <div className="flex items-center gap-2">
                              Rank
                              {baselineSortBy === 'rank' && (
                                <span>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('school')}
                            className="px-6 py-4 text-left text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                          >
                            <div className="flex items-center gap-2">
                              School Name
                              {baselineSortBy === 'school' && (
                                <span>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('totalPosts')}
                            className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                          >
                            <div className="flex items-center justify-end gap-2">
                              Total Posts
                              {baselineSortBy === 'totalPosts' && (
                                <span>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('sponsoredPosts')}
                            className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                          >
                            <div className="flex items-center justify-end gap-2">
                              Sponsored Posts
                              {baselineSortBy === 'sponsoredPosts' && (
                                <span>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('totalLikes')}
                            className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                          >
                            <div className="flex items-center justify-end gap-2">
                              Avg Likes Per Post
                              {baselineSortBy === 'totalLikes' && (
                                <span>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('totalEngagement')}
                            className="px-6 py-4 text-right text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                          >
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex items-center gap-1.5">
                                <span>Avg Interactions Per Post</span>
                                <div className="relative group">
                                  <Info className="w-3 h-3 cursor-help" />
                                  <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    Likes + Comments
                                  </div>
                                </div>
                              </div>
                              {baselineSortBy === 'totalEngagement' && (
                                <span>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((school, index) => {
                          // Determine row color coding based on engagement
                          const isTopPerformer = index < 5;
                          const isLowPerformer = index >= sortedData.length - 5;

                          return (
                            <tr
                              key={school.schoolId}
                              className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                                school.isPlayflyMax ? 'bg-yellow-500/5' : index % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#0f0f1f]'
                              }`}
                              title={`Avg Engagement/Post: ${formatNumber(school.avgEngagementPerPost)} | Engagement Rate: ${(school.engagementRate * 100).toFixed(2)}%`}
                            >
                              <td className="px-6 py-4 text-yellow-400 font-bold font-mono text-sm">
                                {school.rank}
                              </td>
                              <td className="px-6 py-4 text-white font-semibold">
                                <div className="flex items-center gap-2">
                                  {school.schoolName}
                                  {school.isPlayflyMax && (
                                    <span className="text-yellow-400 text-xs">⭐</span>
                                  )}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-right font-mono ${isTopPerformer ? 'text-green-400' : isLowPerformer ? 'text-white/40' : 'text-white'}`}>
                                {formatFullNumber(school.totalPosts)}
                              </td>
                              <td className={`px-6 py-4 text-right font-mono ${isTopPerformer ? 'text-green-400' : isLowPerformer ? 'text-white/40' : 'text-white'}`}>
                                {formatFullNumber(school.sponsoredPosts)}
                              </td>
                              <td className={`px-6 py-4 text-right font-mono ${isTopPerformer ? 'text-green-400' : isLowPerformer ? 'text-white/40' : 'text-white'}`}>
                                {formatFullNumber(school.avgLikesPerPost)}
                              </td>
                              <td className={`px-6 py-4 text-right font-mono font-bold ${isTopPerformer ? 'text-green-400' : isLowPerformer ? 'text-white/40' : 'text-white'}`}>
                                {formatFullNumber(school.avgEngagementPerPost)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Performance by IP Type - Three Cards */}
            <div>
              <h4 className="text-2xl font-bold text-white mb-6">Performance by IP Type</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Logo Card */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-900/20 border-2 border-green-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                    <h5 className="text-xl font-bold text-white">Logo IP</h5>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-white/60 mb-1">Posts with Logo</div>
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {formatNumber(networkTotals.totalWithLogo)}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {networkTotals.totalContents > 0
                          ? ((networkTotals.totalWithLogo / networkTotals.totalContents) * 100).toFixed(1)
                          : 0}% of all posts
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-1">EMV Generated</div>
                      <div className="text-2xl font-bold text-green-400">
                        {formatEMV(filteredSchools.reduce((sum, s) => sum + (s.logo.yes.emv * s.logo.yes.contents), 0))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-1">Engagement Lift</div>
                      <div className="text-2xl font-bold text-green-400">
                        {networkTotals.avgLogoLift > 0 ? '+' : ''}{networkTotals.avgLogoLift.toFixed(2)}%
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        vs posts without logo
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-white/80">
                        {networkTotals.avgLogoLift > 0
                          ? 'Posts featuring school logos drive stronger engagement'
                          : 'Logo presence shows neutral impact on engagement'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Caption Mention Card */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h5 className="text-xl font-bold text-white">Caption Mentions</h5>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-white/60 mb-1">Posts with Mentions</div>
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {formatNumber(networkTotals.totalWithCaption)}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {networkTotals.totalContents > 0
                          ? ((networkTotals.totalWithCaption / networkTotals.totalContents) * 100).toFixed(1)
                          : 0}% of all posts
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-1">EMV Generated</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {formatEMV(filteredSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.emv * s.orgInCaption.yes.contents), 0))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-1">Engagement Lift</div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {networkTotals.avgCaptionLift > 0 ? '+' : ''}{networkTotals.avgCaptionLift.toFixed(2)}%
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        vs posts without mentions
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-white/80">
                        {networkTotals.avgCaptionLift > 0
                          ? 'School mentions in captions boost engagement'
                          : networkTotals.avgCaptionLift < -10
                          ? 'Caption mentions show lower engagement - may indicate promotional content'
                          : 'Caption mentions show neutral impact'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaboration Card */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/20 border-2 border-purple-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                    <h5 className="text-xl font-bold text-white">Collaborations</h5>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-white/60 mb-1">Collaboration Posts</div>
                      <div className="text-2xl md:text-3xl font-bold text-white">
                        {formatNumber(networkTotals.totalWithCollaboration)}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        {networkTotals.totalContents > 0
                          ? ((networkTotals.totalWithCollaboration / networkTotals.totalContents) * 100).toFixed(1)
                          : 0}% of all posts
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-1">EMV Generated</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {formatEMV(filteredSchools.reduce((sum, s) => sum + (s.collaboration.yes.emv * s.collaboration.yes.contents), 0))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-white/60 mb-1">Engagement Lift</div>
                      <div className="text-2xl font-bold text-purple-400">
                        {networkTotals.avgCollabLift > 0 ? '+' : ''}{networkTotals.avgCollabLift.toFixed(2)}%
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        vs non-collaboration posts
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-white/80">
                        {networkTotals.totalWithCollaboration === 0
                          ? 'No collaboration posts detected - opportunity for growth'
                          : networkTotals.avgCollabLift > 0
                          ? 'Collaboration posts show strong performance'
                          : 'Collaboration impact varies by school'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-8">
              <h4 className="text-2xl font-bold text-white mb-6">Key Insights</h4>
              <div className="space-y-4">
                {(() => {
                  const lifts = [
                    { type: 'Logo', lift: networkTotals.avgLogoLift, count: networkTotals.totalWithLogo },
                    { type: 'Caption', lift: networkTotals.avgCaptionLift, count: networkTotals.totalWithCaption },
                    { type: 'Collaboration', lift: networkTotals.avgCollabLift, count: networkTotals.totalWithCollaboration }
                  ].sort((a, b) => b.lift - a.lift);

                  const topPerformer = lifts[0];
                  const adoptionRate = (networkTotals.totalWithIP / networkTotals.totalContents) * 100;

                  return (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#3B9FD9] rounded-full mt-2"></div>
                        <p className="text-white/80">
                          <span className="text-[#3B9FD9] font-bold">{topPerformer.type}</span> delivers the highest engagement lift at{' '}
                          <span className="text-green-400 font-bold">{topPerformer.lift > 0 ? '+' : ''}{topPerformer.lift.toFixed(1)}%</span>
                          {topPerformer.count > 0 && ` across ${formatNumber(topPerformer.count)} posts`}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#3B9FD9] rounded-full mt-2"></div>
                        <p className="text-white/80">
                          Overall IP adoption rate is <span className="text-[#3B9FD9] font-bold">{adoptionRate.toFixed(1)}%</span>
                          {adoptionRate < 50
                            ? ' - significant opportunity to increase IP usage'
                            : adoptionRate < 75
                            ? ' - good adoption with room for growth'
                            : ' - strong IP adoption across all schools'
                          }
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#3B9FD9] rounded-full mt-2"></div>
                        <p className="text-white/80">
                          Posts with IP have generated{' '}
                          <span className="text-green-400 font-bold">{formatEMV(networkTotals.totalEMV)}</span> in total EMV
                          {selectedSchool === 'all'
                            ? ' across all schools'
                            : ' for your school'
                          }
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* School-by-School Performance - Only show in network view */}
            {selectedSchool === 'all' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold text-white">School-by-School Performance</h4>
                    <p className="text-sm text-white/60 mt-2">Scroll to explore how each school's IP drives engagement</p>
                  </div>
                  <div className="text-sm text-white/60">
                    {schoolsData.length} schools
                  </div>
                </div>

                {/* Scrollable School Cards */}
                <div className="space-y-8 max-h-[2000px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {(() => {
                    // Sort schools by IP adoption rate
                    const sortedSchools = [...schoolsData].sort((a, b) => {
                      const aAdoption = (a.counts.withIp / a.overall.totalContents) * 100;
                      const bAdoption = (b.counts.withIp / b.overall.totalContents) * 100;
                      return bAdoption - aAdoption;
                    });

                    // Max schools (schools with premium tier)
                    const maxSchools = ['Michigan State', 'University of Maryland', 'Auburn University', 'Texas A&M', 'Louisiana State University', 'Penn State University'];

                    return sortedSchools.map((school) => {
                      // Define IP types in FIXED order: Collaboration, Logo, Mention
                      const ipTypes = [
                        { type: 'Collaboration', lift: school.collaboration.avgLift, data: school.collaboration, icon: '🤝' },
                        { type: 'Logo', lift: school.logo.avgLift, data: school.logo, icon: '🏫' },
                        { type: 'Mention', lift: school.orgInCaption.avgLift, data: school.orgInCaption, icon: '💬' }
                      ];

                      // Determine which one has the highest lift (best performer)
                      const bestIPType = [...ipTypes].sort((a, b) => b.lift - a.lift)[0].type;

                      const isMaxSchool = maxSchools.includes(school.school.name);
                      const ipAdoption = (school.counts.withIp / school.overall.totalContents) * 100;

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

                      return (
                        <div key={school.school._id} className="bg-[#0a0e27] border border-white/10 rounded-xl overflow-hidden">
                          {/* School Header */}
                          <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* School Logo Box */}
                              <div className="w-16 h-16 bg-gradient-to-br from-[#1770C0] to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{getInitials(school.school.name)}</span>
                              </div>

                              <div>
                                <div className="flex items-center gap-3">
                                  <h5 className="text-lg font-bold text-white">{getDisplayName(school.school.name)}</h5>
                                  {isMaxSchool && (
                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded border border-yellow-500/30">
                                      ⭐ MAX
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-white/60 mt-1">
                                  Best: <span className="text-green-400 font-semibold">{bestIPType} IP</span> ({ipTypes.find(t => t.type === bestIPType)!.lift > 0 ? '+' : ''}{ipTypes.find(t => t.type === bestIPType)!.lift.toFixed(1)}% lift)
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#3B9FD9]">{ipAdoption.toFixed(1)}%</div>
                              <div className="text-xs text-white/60">IP Adoption</div>
                            </div>
                          </div>

                          {/* IP Type Cards Row - FIXED ORDER: Collaboration, Logo, Mention */}
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {ipTypes.map((ipType) => {
                                const isBest = ipType.type === bestIPType;
                                const totalEngagement = ipType.data.yes.likes + ipType.data.yes.comments;

                                return (
                                  <div
                                    key={ipType.type}
                                    className={`rounded-xl p-5 ${
                                      isBest
                                        ? 'bg-gradient-to-br from-purple-500/20 to-purple-900/20 border-2 border-purple-500/50'
                                        : 'bg-[#1a1a2e] border border-white/10'
                                    }`}
                                  >
                                    {/* Best Performing Badge */}
                                    {isBest && (
                                      <div className="mb-3">
                                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                          ◆ BEST PERFORMING ◆
                                        </span>
                                      </div>
                                    )}

                                    {/* IP Type Header */}
                                    <div className="mb-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{ipType.icon}</span>
                                        <h6 className="text-base font-bold text-white">{ipType.type.toUpperCase()}</h6>
                                      </div>
                                      <p className="text-xs text-white/60">
                                        {ipType.type === 'Logo' && 'School logo visible in content'}
                                        {ipType.type === 'Collaboration' && 'Collaboration posts with school'}
                                        {ipType.type === 'Mention' && 'School mentioned in caption'}
                                      </p>
                                    </div>

                                    {/* Lift Metric */}
                                    <div className="mb-4">
                                      <div className={`text-3xl font-bold ${ipType.lift > 0 ? 'text-green-400' : ipType.lift < 0 ? 'text-red-400' : 'text-white/60'}`}>
                                        {ipType.lift > 0 ? '+' : ''}{ipType.lift.toFixed(1)}% {ipType.lift > 0 ? '▲' : ipType.lift < 0 ? '▼' : ''}
                                      </div>
                                      <div className="text-xs text-white/60">vs No IP baseline</div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-white/60">Posts</span>
                                        <span className="text-sm font-bold text-white">{formatNumber(ipType.data.yes.contents)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-white/60">Total EMV</span>
                                        <span className="text-sm font-bold text-green-400">{formatEMV(ipType.data.yes.emv)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                                          <span>Total Interactions</span>
                                          <div className="relative group">
                                            <Info className="w-3 h-3 cursor-help" />
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                              Likes + Comments
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-sm font-bold text-white">{formatNumber(totalEngagement)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-white/60">Total Likes</span>
                                        <span className="text-sm font-bold text-white">{formatNumber(ipType.data.yes.likes)}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'with-vs-without' && (
          <div className="space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white">IP Impact Analysis</h3>
            <p className="text-white/60">Compare performance of posts with and without IP usage</p>

            {/* IP Type Sub-tabs */}
            <div className="flex gap-4 border-b border-white/10">
              <button
                onClick={() => setIpTypeTab('logo')}
                className={`px-6 py-3 font-semibold transition-all ${
                  ipTypeTab === 'logo'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Logo
              </button>
              <button
                onClick={() => setIpTypeTab('collaboration')}
                className={`px-6 py-3 font-semibold transition-all ${
                  ipTypeTab === 'collaboration'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Collaboration
              </button>
              <button
                onClick={() => setIpTypeTab('caption')}
                className={`px-6 py-3 font-semibold transition-all ${
                  ipTypeTab === 'caption'
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Caption
              </button>
            </div>

            {/* Logo Comparison */}
            {ipTypeTab === 'logo' && (() => {
              const totals = {
                withIP: {
                  contents: filteredSchools.reduce((sum, s) => sum + s.logo.yes.contents, 0),
                  likes: filteredSchools.reduce((sum, s) => sum + (s.logo.yes.likes * s.logo.yes.contents), 0),
                  comments: filteredSchools.reduce((sum, s) => sum + (s.logo.yes.comments * s.logo.yes.contents), 0),
                  emv: filteredSchools.reduce((sum, s) => sum + (s.logo.yes.emv * s.logo.yes.contents), 0),
                },
                withoutIP: {
                  contents: filteredSchools.reduce((sum, s) => sum + s.logo.no.contents, 0),
                  likes: filteredSchools.reduce((sum, s) => sum + (s.logo.no.likes * s.logo.no.contents), 0),
                  comments: filteredSchools.reduce((sum, s) => sum + (s.logo.no.comments * s.logo.no.contents), 0),
                },
                avgLift: filteredSchools.length > 0
                  ? filteredSchools.reduce((sum, s) => sum + s.logo.avgLift, 0) / filteredSchools.length
                  : 0
              };

              const withEngagementRate = totals.withIP.contents > 0
                ? ((totals.withIP.likes + totals.withIP.comments) / totals.withIP.contents)
                : 0;
              const withoutEngagementRate = totals.withoutIP.contents > 0
                ? ((totals.withoutIP.likes + totals.withoutIP.comments) / totals.withoutIP.contents)
                : 0;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* With Logo */}
                  <div className="bg-black/40 border-2 border-green-500/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-green-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">With Logo</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{formatNumber(totals.withIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-white/60 mb-1">
                          <span>Total Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {formatNumber(totals.withIP.likes + totals.withIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(withEngagementRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total EMV</div>
                        <div className="text-2xl font-bold text-green-400">
                          {formatEMV(totals.withIP.emv)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Without Logo */}
                  <div className="bg-black/40 border-2 border-white/20 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white/60" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">Without Logo</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{formatNumber(totals.withoutIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-white/60 mb-1">
                          <span>Total Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {formatNumber(totals.withoutIP.likes + totals.withoutIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(withoutEngagementRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total EMV</div>
                        <div className="text-2xl font-bold text-white/40">
                          N/A
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="md:col-span-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-8">
                    <h4 className="text-xl font-bold text-white mb-4">Impact Summary</h4>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Average Engagement Lift</div>
                        <div className="text-4xl font-bold text-green-400">
                          {totals.avgLift > 0 ? '+' : ''}{totals.avgLift.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80">
                          Posts with school logo IP show <span className="text-green-400 font-bold">{Math.abs(totals.avgLift).toFixed(1)}%</span> {totals.avgLift > 0 ? 'higher' : 'lower'} engagement on average compared to posts without logo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Collaboration Comparison */}
            {ipTypeTab === 'collaboration' && (() => {
              const totals = {
                withIP: {
                  contents: filteredSchools.reduce((sum, s) => sum + s.collaboration.yes.contents, 0),
                  likes: filteredSchools.reduce((sum, s) => sum + (s.collaboration.yes.likes * s.collaboration.yes.contents), 0),
                  comments: filteredSchools.reduce((sum, s) => sum + (s.collaboration.yes.comments * s.collaboration.yes.contents), 0),
                  emv: filteredSchools.reduce((sum, s) => sum + (s.collaboration.yes.emv * s.collaboration.yes.contents), 0),
                },
                withoutIP: {
                  contents: filteredSchools.reduce((sum, s) => sum + s.collaboration.no.contents, 0),
                  likes: filteredSchools.reduce((sum, s) => sum + (s.collaboration.no.likes * s.collaboration.no.contents), 0),
                  comments: filteredSchools.reduce((sum, s) => sum + (s.collaboration.no.comments * s.collaboration.no.contents), 0),
                },
                avgLift: filteredSchools.length > 0
                  ? filteredSchools.reduce((sum, s) => sum + s.collaboration.avgLift, 0) / filteredSchools.length
                  : 0
              };

              const withEngagementRate = totals.withIP.contents > 0
                ? ((totals.withIP.likes + totals.withIP.comments) / totals.withIP.contents)
                : 0;
              const withoutEngagementRate = totals.withoutIP.contents > 0
                ? ((totals.withoutIP.likes + totals.withoutIP.comments) / totals.withoutIP.contents)
                : 0;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* With Collaboration */}
                  <div className="bg-black/40 border-2 border-purple-500/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">With Collaboration</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{formatNumber(totals.withIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-white/60 mb-1">
                          <span>Total Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {formatNumber(totals.withIP.likes + totals.withIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(withEngagementRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total EMV</div>
                        <div className="text-2xl font-bold text-purple-400">
                          {formatEMV(totals.withIP.emv)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Without Collaboration */}
                  <div className="bg-black/40 border-2 border-white/20 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white/60" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">Without Collaboration</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{formatNumber(totals.withoutIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-white/60 mb-1">
                          <span>Total Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {formatNumber(totals.withoutIP.likes + totals.withoutIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(withoutEngagementRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total EMV</div>
                        <div className="text-2xl font-bold text-white/40">
                          N/A
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="md:col-span-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl p-8">
                    <h4 className="text-xl font-bold text-white mb-4">Impact Summary</h4>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Average Engagement Lift</div>
                        <div className="text-4xl font-bold text-purple-400">
                          {totals.avgLift > 0 ? '+' : ''}{totals.avgLift.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80">
                          Posts with school collaboration IP show <span className="text-purple-400 font-bold">{Math.abs(totals.avgLift).toFixed(1)}%</span> {totals.avgLift > 0 ? 'higher' : 'lower'} engagement on average compared to posts without collaboration.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Caption Comparison */}
            {ipTypeTab === 'caption' && (() => {
              const totals = {
                withIP: {
                  contents: filteredSchools.reduce((sum, s) => sum + s.orgInCaption.yes.contents, 0),
                  likes: filteredSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.likes * s.orgInCaption.yes.contents), 0),
                  comments: filteredSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.comments * s.orgInCaption.yes.contents), 0),
                  emv: filteredSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.emv * s.orgInCaption.yes.contents), 0),
                },
                withoutIP: {
                  contents: filteredSchools.reduce((sum, s) => sum + s.orgInCaption.no.contents, 0),
                  likes: filteredSchools.reduce((sum, s) => sum + (s.orgInCaption.no.likes * s.orgInCaption.no.contents), 0),
                  comments: filteredSchools.reduce((sum, s) => sum + (s.orgInCaption.no.comments * s.orgInCaption.no.contents), 0),
                },
                avgLift: filteredSchools.length > 0
                  ? filteredSchools.reduce((sum, s) => sum + s.orgInCaption.avgLift, 0) / filteredSchools.length
                  : 0
              };

              const withEngagementRate = totals.withIP.contents > 0
                ? ((totals.withIP.likes + totals.withIP.comments) / totals.withIP.contents)
                : 0;
              const withoutEngagementRate = totals.withoutIP.contents > 0
                ? ((totals.withoutIP.likes + totals.withoutIP.comments) / totals.withoutIP.contents)
                : 0;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* With Caption */}
                  <div className="bg-black/40 border-2 border-yellow-500/50 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">With Caption Mention</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{formatNumber(totals.withIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-white/60 mb-1">
                          <span>Total Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {formatNumber(totals.withIP.likes + totals.withIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(withEngagementRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total EMV</div>
                        <div className="text-2xl font-bold text-yellow-400">
                          {formatEMV(totals.withIP.emv)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Without Caption */}
                  <div className="bg-black/40 border-2 border-white/20 rounded-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white/60" />
                      </div>
                      <h4 className="text-2xl font-bold text-white">Without Caption Mention</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-white">{formatNumber(totals.withoutIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-white/60 mb-1">
                          <span>Total Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black border border-white/20 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-white">
                          {formatNumber(totals.withoutIP.likes + totals.withoutIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-white">
                          {formatNumber(withoutEngagementRate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60 mb-1">Total EMV</div>
                        <div className="text-2xl font-bold text-white/40">
                          N/A
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  <div className="md:col-span-2 bg-gradient-to-r from-yellow-500/10 to-blue-500/10 border border-yellow-500/30 rounded-xl p-8">
                    <h4 className="text-xl font-bold text-white mb-4">Impact Summary</h4>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-white/60 mb-1">Average Engagement Lift</div>
                        <div className="text-4xl font-bold text-yellow-400">
                          {totals.avgLift > 0 ? '+' : ''}{totals.avgLift.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80">
                          Posts with school mention in caption show <span className="text-yellow-400 font-bold">{Math.abs(totals.avgLift).toFixed(1)}%</span> {totals.avgLift > 0 ? 'higher' : 'lower'} engagement on average compared to posts without caption mention.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'partnerships' && (
          <PartnershipsTab
            selectedSchool={selectedSchool}
            schoolPartnershipData={_schoolPartnershipData}
            brandData={brandData}
            formatNumber={formatNumber}
            formatEMV={formatEMV}
          />
        )}

        {activeTab === 'athletes' && (
          <AthletesTab
            selectedSchool={selectedSchool}
            athleteData={athleteData}
            formatNumber={formatNumber}
            formatEMV={formatEMV}
          />
        )}

        {activeTab === 'rankings' && (
          <RankingsTab
            schoolsData={schoolsData}
            setSelectedSchool={setSelectedSchool}
            formatNumber={formatNumber}
            formatEMV={formatEMV}
          />
        )}
      </div>
    </div>
  );
}
