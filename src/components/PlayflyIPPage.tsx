import { useState, useEffect, useMemo, useRef } from 'react';
import { TrendingUp, Award, Users, BarChart3, Info } from 'lucide-react';
import { PartnershipsTab } from './PartnershipsTab';
import { RankingsTab } from './RankingsTab';
import { AthletesTab } from './AthletesTab';
import { ContentTab } from './ContentTab';
import { TeamsTab } from './TeamsTab';
import { loadPartnershipDataWithRecalculatedEMV } from '../utils/partnershipDataLoader';
import { CommandBar, DrawerPanel, GlassCard, GlassPill, MetricCard, TabTransition } from './playfly/PlayflyUI';

/**
 * PLAYFLY IP PAGE
 *
 * Displays school IP impact data with tabbed interface
 * Tabs: Overview, With vs Without, Partnerships, Athletes, Rankings, Content
 */

// ═══════════════════════════════════════════════════════════════
// PLAYFLY BRAND COLORS (matching JABA campaign dashboard style)
// ═══════════════════════════════════════════════════════════════
const colors = {
  primary: '#1770C0',      // PlayFly blue
  secondary: '#3B9FD9',    // Light blue
  positive: '#10b981',     // Green for positive metrics
  negative: '#ef4444',     // Red for negative metrics
  accent: '#0369a1',       // Accent blue
  lightBg: '#f5f5f5',      // Light gray page background
  cardBg: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  headerGray: '#6b7280',   // Gray color for two-tone headers
  white: '#ffffff',
};

const EST_EMV_LIKE = 0.5;
const EST_EMV_COMMENT = 1.5;

const estimateEmvFromTotals = (likes: number, comments: number) => {
  return (likes * EST_EMV_LIKE) + (comments * EST_EMV_COMMENT);
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

type TabType = 'overview' | 'with-vs-without' | 'partnerships' | 'athletes' | 'rankings' | 'content' | 'teams';


// Map school names (as they appear in data) to their JSON file names
// Only official Playfly partner schools (20 total: 10 Playfly Max + 10 regular)
const SCHOOL_FILE_MAP: Record<string, string> = {
  // Playfly Max schools
  'Auburn University': 'auburn-university',
  'Baylor': 'baylor',
  'Louisiana State University': 'louisiana-state-university',
  'Michigan State': 'michigan-state',
  'Penn State University': 'penn-state-university',
  'Texas A&M': 'texas-a-m',
  'University of Central Florida': 'university-of-central-florida',
  'University of Maryland': 'university-of-maryland',
  'University of Nebraska': 'university-of-nebraska',
  'University of Southern California (USC)': 'university-of-southern-california-usc',
  // Regular Playfly schools
  'Brigham Young University (BYU)': 'brigham-young-university-byu',
  'George Mason': 'george-mason',
  'Old Dominion University': 'old-dominion-university',
  'University of Cincinnati': 'university-of-cincinnati',
  'University of New Mexico': 'university-of-new-mexico',
  'University of Texas at San Antonio (UTSA)': 'university-of-texas-at-san-antonio-utsa',
  'Wichita State University': 'wichita-state-university',
  // Not in data yet: Oral Roberts, University of Denver, San Jose State
};

// Standardized display names - ensures consistent formatting across the UI
const SCHOOL_DISPLAY_NAMES: Record<string, string> = {
  'Auburn University': 'Auburn University',
  'Baylor': 'Baylor University',
  'Brigham Young University (BYU)': 'Brigham Young University (BYU)',
  'George Mason': 'George Mason University',
  'Louisiana State University': 'Louisiana State University (LSU)',
  'Michigan State': 'Michigan State University',
  'Old Dominion University': 'Old Dominion University (ODU)',
  'Penn State University': 'Penn State University',
  'Texas A&M': 'Texas A&M University',
  'University of Central Florida': 'University of Central Florida (UCF)',
  'University of Cincinnati': 'University of Cincinnati',
  'University of Maryland': 'University of Maryland',
  'University of Nebraska': 'University of Nebraska',
  'University of New Mexico': 'University of New Mexico (UNM)',
  'University of Southern California (USC)': 'University of Southern California (USC)',
  'University of Texas at San Antonio (UTSA)': 'University of Texas at San Antonio (UTSA)',
  'Wichita State University': 'Wichita State University',
};

// Helper function to get standardized display name
function getDisplayName(schoolName: string): string {
  return SCHOOL_DISPLAY_NAMES[schoolName] || schoolName;
}

export function PlayflyIPPage({ onBack }: PlayflyIPPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [ipTypeTab, setIpTypeTab] = useState<'logo' | 'collaboration' | 'caption'>('logo');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [withVsWithoutScope, setWithVsWithoutScope] = useState<string>('all');
  const [schoolsData, setSchoolsData] = useState<SchoolIPData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firstSectionRef = useRef<HTMLDivElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

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
  const [baselineMobileView, setBaselineMobileView] = useState<'cards' | 'table'>('cards');
  const [baselineIpScope, setBaselineIpScope] = useState<'all' | 'logo' | 'caption' | 'collaboration'>('all');
  const [baselineDrawerOpen, setBaselineDrawerOpen] = useState(false);
  const [baselineSelected, setBaselineSelected] = useState<{
    schoolName: string;
    bestIPType: string;
    bestLift: number;
    adoptionPct: number;
  } | null>(null);

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
          Promise.all(athletePromises),
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

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // report scope is fixed to all schools

  // Filter data based on report scope
  const filteredSchools = useMemo(() => {
    if (selectedSchool === 'all') {
      return schoolsData;
    }
    const school = schoolsData.find(s => s.school.name === selectedSchool);
    return school ? [school] : [];
  }, [schoolsData, selectedSchool]);

  // Filter data based on section scope (With vs Without)
  const sectionSchools = useMemo(() => {
    if (withVsWithoutScope === 'all') {
      return schoolsData;
    }
    const school = schoolsData.find(s => s.school.name === withVsWithoutScope);
    return school ? [school] : [];
  }, [schoolsData, withVsWithoutScope]);

  // Calculate network-wide or school-specific totals
  const networkTotals = useMemo(() => {
    return {
      totalSchools: filteredSchools.length,
      totalContents: filteredSchools.reduce((sum, s) => sum + s.overall.totalContents, 0),
      totalLikes: filteredSchools.reduce((sum, s) => sum + s.overall.totalLikes, 0),
      totalComments: filteredSchools.reduce((sum, s) => sum + s.overall.totalComments, 0),
      totalEMV: filteredSchools.reduce((sum, s) => sum + estimateEmvFromTotals(s.overall.totalLikes, s.overall.totalComments), 0),
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


  const percentile = (values: number[], value: number) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = sorted.findIndex(v => v >= value);
    const rank = idx === -1 ? sorted.length : idx + 1;
    return Math.round((rank / sorted.length) * 100);
  };

  const median = (values: number[]) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  };

  const percentileValue = (values: number[], p: number) => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
    return sorted[idx];
  };

  const perSchool = useMemo(() => {
    return {
      followers: schoolsData.map(s => s.followers),
      posts: schoolsData.map(s => s.overall.totalContents),
      interactions: schoolsData.map(s => s.overall.totalLikes + s.overall.totalComments),
      emv: schoolsData.map(s => estimateEmvFromTotals(s.overall.totalLikes, s.overall.totalComments)),
      adoption: schoolsData.map(s => (s.counts.withIp / Math.max(s.overall.totalContents, 1)) * 100),
      bestLift: schoolsData.map(s => Math.max(s.logo.avgLift, s.collaboration.avgLift, s.orgInCaption.avgLift))
    };
  }, [schoolsData]);


  // Format numbers
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  // Format full numbers without abbreviations (for baseline metrics)
  const formatFullNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  const formatEMV = (emv: number): string => {
    return `$${Math.round(emv).toLocaleString()}`;
  };

  // Format large numbers with M abbreviation (for network overview cards)
  const formatMillions = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    return Math.round(num).toLocaleString();
  };

  const formatEMVMillions = (emv: number): string => {
    if (emv >= 1000000) return `$${(emv / 1000000).toFixed(1)}M`;
    return `$${Math.round(emv).toLocaleString()}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1770C0] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading school IP impact data...</p>
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (schoolsData.length === 0) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Playfly IP Page</h1>
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-lg">
            <p className="text-gray-600 text-lg mb-4">No school data available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="playfly-theme min-h-screen bg-[#F3F6FB] px-4 pb-16 md:px-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Sticky Command Bar */}
        <div className="sticky top-0 z-40">
          <GlassCard className={`p-4 md:p-5 nav-glass ${isScrolled ? 'nav-glass-scrolled' : ''}`}>
            <CommandBar
              left={(
                <div className="flex items-center gap-3">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="text-sm font-semibold text-gray-600 hover:text-[#1770C0] flex items-center gap-2"
                    >
                      ← Back to Reports
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <img src="/playfly-logo.jpg" alt="Playfly" className="h-6 w-6 rounded-full object-contain" />
                    <div className="text-sm font-semibold text-gray-900">Playfly IP Report</div>
                  </div>
                </div>
              )}
              center={null}
              right={null}
            />

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className="text-sm font-semibold text-gray-700">Viewing:</span>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="bg-white/90 border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none w-full md:w-auto"
                  >
                    <option value="all">All Playfly Schools</option>
                    {schoolsData.map((school) => (
                      <option key={school.school._id} value={school.school.name}>
                        {getDisplayName(school.school.name)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
                <GlassPill className="snap-start" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Overview</GlassPill>
                <GlassPill className="snap-start" active={activeTab === 'with-vs-without'} onClick={() => setActiveTab('with-vs-without')}>IP Comparison</GlassPill>
                <GlassPill className="snap-start" active={activeTab === 'partnerships'} onClick={() => setActiveTab('partnerships')}>Sponsored Posts</GlassPill>
                <GlassPill className="snap-start" active={activeTab === 'athletes'} onClick={() => setActiveTab('athletes')}>Athletes</GlassPill>
                <GlassPill className="snap-start" active={activeTab === 'rankings'} onClick={() => setActiveTab('rankings')}>Rankings</GlassPill>
                <GlassPill className="snap-start" active={activeTab === 'content'} onClick={() => setActiveTab('content')}>Content</GlassPill>
                <GlassPill className="snap-start" active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}>Team Socials</GlassPill>
              </div>
            </div>
          </GlassCard>
        </div>

        <div ref={firstSectionRef} />

        {/* Tab Content */}
        <TabTransition tabKey={activeTab}>
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Hero */}
                <GlassCard className="p-6 md:p-10 mb-8 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-blue-200/40 blur-3xl" />
                  <div className="absolute bottom-0 left-16 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
                  <div className="relative">
                    <div className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-4">Playfly Schools IP Performance</div>
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                      <span>JABA analyzed </span>
                      <span className="mx-1.5 text-[#1770C0] font-bold">{formatNumber(networkTotals.totalContents)} posts</span>
                      <span> across </span>
                      <span className="mx-1.5 text-[#1770C0] font-bold">{networkTotals.totalSchools} Playfly schools</span>
                      <span> to show how IP drives engagement.</span>
                    </h2>
                    <p className="text-base md:text-lg text-gray-600 mt-4 max-w-3xl">
                      A comparative analysis of IP performance, engagement lift, and post impact across 20 Playfly partner schools.
                    </p>
                  </div>
                </GlassCard>
            <div className="flex items-center justify-between">
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontStyle: 'italic' }} className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                <span style={{ color: colors.primary }}>
                  {selectedSchool === 'all' ? 'ALL SCHOOLS ' : `${selectedSchool.toUpperCase()} `}
                </span>
                <span style={{ color: colors.headerGray }}>OVERVIEW</span>
              </h3>
              {selectedSchool !== 'all' && filteredSchools.length > 0 && (
                <div className="text-sm text-gray-600">
                  Total Followers: <span className="text-[#3B9FD9] font-bold">{formatNumber(filteredSchools[0].followers)}</span>
                </div>
              )}
            </div>

            {/* Combined Performance Cards - Only show in network view */}
            {selectedSchool === 'all' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  title="Total Followers"
                  value={networkTotals.totalFollowers}
                  subtitle={`Across all ${schoolsData.length} schools`}
                  accent={colors.primary}
                  icon={<Users className="w-5 h-5" />}
                  format={formatMillions}
                  meta={(
                    <>
                      <span>Median per school: {formatMillions(median(perSchool.followers))}</span>
                    </>
                  )}
                />
                <MetricCard
                  title="Total Posts"
                  value={networkTotals.totalContents}
                  subtitle="Content analyzed"
                  accent="#6366F1"
                  icon={<BarChart3 className="w-5 h-5" />}
                  format={formatNumber}
                  meta={(
                    <>
                      <span>Median per school: {formatNumber(median(perSchool.posts))}</span>
                    </>
                  )}
                />
                <MetricCard
                  title="Total Interactions"
                  value={networkTotals.totalLikes + networkTotals.totalComments}
                  subtitle="Likes + Comments"
                  accent="#10B981"
                  icon={<TrendingUp className="w-5 h-5" />}
                  format={formatMillions}
                  meta={(
                    <>
                      <span>Median per school: {formatMillions(median(perSchool.interactions))}</span>
                    </>
                  )}
                />
                <MetricCard
                  title="Total Estimated EMV"
                  value={networkTotals.totalEMV}
                  subtitle="Estimated earned media value"
                  accent="#F59E0B"
                  icon={<Award className="w-5 h-5" />}
                  format={formatEMVMillions}
                  meta={(
                    <>
                      <span className="metric-badge">Estimated</span>
                      <span>Median per school: {formatEMV(median(perSchool.emv))}</span>
                    </>
                  )}
                />
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

                const scopeData = baselineIpScope === 'logo'
                  ? school.logo.yes
                  : baselineIpScope === 'caption'
                  ? school.orgInCaption.yes
                  : baselineIpScope === 'collaboration'
                  ? school.collaboration.yes
                  : null;

                const totalPosts = baselineIpScope === 'all'
                  ? school.overall.totalContents
                  : scopeData?.contents || 0;

                const avgLikesPerPost = baselineIpScope === 'all'
                  ? (school.overall.totalLikes / Math.max(school.overall.totalContents, 1))
                  : (scopeData?.likes || 0);

                const avgCommentsPerPost = baselineIpScope === 'all'
                  ? (school.overall.totalComments / Math.max(school.overall.totalContents, 1))
                  : (scopeData?.comments || 0);

                const avgEngagementPerPost = avgLikesPerPost + avgCommentsPerPost;

                return {
                  rank: index + 1,
                  schoolName: getDisplayName(school.school.name),
                  schoolId: school.school._id,
                  isPlayflyMax: maxSchools.includes(school.school.name),
                  totalPosts,
                  sponsoredPosts: sponsoredPosts,
                  totalLikes: avgLikesPerPost * totalPosts,
                  totalComments: avgCommentsPerPost * totalPosts,
                  totalEngagement: avgEngagementPerPost * totalPosts,
                  avgEngagementPerPost,
                  avgLikesPerPost,
                  engagementRate: school.overall.engagementRate,
                  adoptionPct: (school.counts.withIp / Math.max(school.overall.totalContents, 1)) * 100,
                  bestLift: Math.max(school.logo.avgLift, school.collaboration.avgLift, school.orgInCaption.avgLift),
                  bestIPType: [
                    { type: 'Visual IP', lift: school.logo.avgLift },
                    { type: 'Collaboration', lift: school.collaboration.avgLift },
                    { type: 'Caption Mentions', lift: school.orgInCaption.avgLift }
                  ].sort((a, b) => b.lift - a.lift)[0].type,
                  emv: estimateEmvFromTotals(school.overall.totalLikes, school.overall.totalComments)
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

              const adoptionP75 = percentileValue(baselineData.map(s => s.adoptionPct), 0.75);
              const liftP75 = percentileValue(baselineData.map(s => s.bestLift), 0.75);
              const emvP75 = percentileValue(baselineData.map(s => s.emv), 0.75);

              const handleBaselineSort = (metric: BaselineSortMetric) => {
                if (baselineSortBy === metric) {
                  setBaselineSortDirection(baselineSortDirection === 'asc' ? 'desc' : 'asc');
                } else {
                  setBaselineSortBy(metric);
                  setBaselineSortDirection(metric === 'school' ? 'asc' : 'desc');
                }
              };

              return (
                <GlassCard className="overflow-hidden mb-8">
                  <div className="p-6 border-b border-gray-200 bg-white/70">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <SectionHeader primary="SCHOOL BASELINE " secondary="METRICS" />
                        <p className="text-sm text-gray-600 mt-2">Raw engagement data for all {schoolsData.length} Playfly schools</p>
                      </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <input
                          type="text"
                          placeholder="Search schools..."
                          value={baselineSearchQuery}
                          onChange={(e) => setBaselineSearchQuery(e.target.value)}
                          className="bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-blue-500 focus:outline-none w-full sm:w-64"
                        />
                        <span className="text-xs text-gray-600">
                          Showing {sortedData.length} of {schoolsData.length} schools
                        </span>
                        <div className="flex gap-2 md:hidden">
                          <GlassPill active={baselineMobileView === 'cards'} onClick={() => setBaselineMobileView('cards')}>Card View</GlassPill>
                          <GlassPill active={baselineMobileView === 'table'} onClick={() => setBaselineMobileView('table')}>View Full Table</GlassPill>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <GlassPill className="pf-chip-compact" active={baselineIpScope === 'all'} onClick={() => setBaselineIpScope('all')}>All Posts</GlassPill>
                      <GlassPill className="pf-chip-compact" active={baselineIpScope === 'logo'} onClick={() => setBaselineIpScope('logo')}>Visual IP</GlassPill>
                      <GlassPill className="pf-chip-compact" active={baselineIpScope === 'caption'} onClick={() => setBaselineIpScope('caption')}>Caption</GlassPill>
                      <GlassPill className="pf-chip-compact" active={baselineIpScope === 'collaboration'} onClick={() => setBaselineIpScope('collaboration')}>Collaboration</GlassPill>
                    </div>
                  </div>

                  {/* Mobile Cards */}
                  <div className={`${baselineMobileView === 'cards' ? 'block' : 'hidden'} md:hidden p-4 space-y-4`}>
                    {sortedData.map((school) => (
                      <GlassCard
                        key={school.schoolId}
                        className="p-4"
                        onClick={() => {
                          setBaselineSelected({
                            schoolName: school.schoolName,
                            bestIPType: school.bestIPType,
                            bestLift: school.bestLift,
                            adoptionPct: school.adoptionPct
                          });
                          setBaselineDrawerOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-900">{school.schoolName}</div>
                          <div className="text-xs font-semibold text-[#1770C0]">#{school.rank}</div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3 text-[10px] font-semibold uppercase tracking-wide">
                          {school.adoptionPct >= adoptionP75 && <span className="metric-badge">High Adoption</span>}
                          {school.bestLift >= liftP75 && <span className="metric-badge">High Lift</span>}
                          {school.emv >= emvP75 && <span className="metric-badge">High EMV</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-600">
                          <div>Total Posts</div>
                          <div className="text-right text-gray-900 font-semibold">{formatFullNumber(school.totalPosts)}</div>
                          <div>Sponsored Posts</div>
                          <div className="text-right text-gray-900 font-semibold">{formatFullNumber(school.sponsoredPosts)}</div>
                          <div>Avg Likes/Post</div>
                          <div className="text-right text-gray-900 font-semibold">{formatFullNumber(school.avgLikesPerPost)}</div>
                          <div>Avg Interactions/Post</div>
                          <div className="text-right text-gray-900 font-semibold">{formatFullNumber(school.avgEngagementPerPost)}</div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Table */}
                  <div className={`${baselineMobileView === 'table' ? 'block' : 'hidden'} md:block overflow-x-auto`}>
                    <table className="w-full">
                      <thead style={{ backgroundColor: 'rgba(248,250,252,0.9)' }} className="border-b border-gray-200 sticky top-0">
                        <tr>
                          <th
                            onClick={() => handleBaselineSort('rank')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                          >
                            <div className="flex items-center gap-2">
                              Rank
                              {baselineSortBy === 'rank' && (
                                <span style={{ color: colors.primary }}>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('school')}
                            className="px-6 py-4 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                          >
                            <div className="flex items-center gap-2">
                              School Name
                              {baselineSortBy === 'school' && (
                                <span style={{ color: colors.primary }}>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('totalPosts')}
                            className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                          >
                            <div className="flex items-center justify-end gap-2">
                              Total Posts
                              {baselineSortBy === 'totalPosts' && (
                                <span style={{ color: colors.primary }}>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('sponsoredPosts')}
                            className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                          >
                            <div className="flex items-center justify-end gap-2">
                              Sponsored Posts
                              {baselineSortBy === 'sponsoredPosts' && (
                                <span style={{ color: colors.primary }}>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('totalLikes')}
                            className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                          >
                            <div className="flex items-center justify-end gap-2">
                              Avg Likes Per Post
                              {baselineSortBy === 'totalLikes' && (
                                <span style={{ color: colors.primary }}>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                          <th
                            onClick={() => handleBaselineSort('totalEngagement')}
                            className="px-6 py-4 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:text-[#1770C0]"
                          >
                            <div className="flex items-center justify-end gap-2">
                              <div className="flex items-center gap-1.5">
                                <span>Avg Interactions Per Post</span>
                                <div className="relative group">
                                  <Info className="w-3 h-3 cursor-help" />
                                  <div className="absolute top-full right-0 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    Likes + Comments
                                  </div>
                                </div>
                              </div>
                              {baselineSortBy === 'totalEngagement' && (
                                <span style={{ color: colors.primary }}>{baselineSortDirection === 'asc' ? '↑' : '↓'}</span>
                              )}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((school, index) => {
                          return (
                            <tr
                              key={school.schoolId}
                              className={`border-b border-gray-100 hover:bg-blue-50/60 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                              } ${index < 3 ? 'bg-blue-50/40' : ''}`}
                              title={`Avg Engagement/Post: ${formatNumber(school.avgEngagementPerPost)} | Engagement Rate: ${(school.engagementRate * 100).toFixed(2)}%`}
                            >
                              <td className={`px-6 py-4 font-semibold text-sm ${baselineSortBy === 'rank' ? 'text-green-600' : ''}`} style={{ color: baselineSortBy === 'rank' ? undefined : colors.primary }}>
                                {school.rank}
                              </td>
                              <td className="px-6 py-4 text-gray-900 font-semibold">
                                <div className="flex items-center gap-2">
                                  {school.schoolName}
                                  {school.isPlayflyMax && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded border border-yellow-300">⭐ MAX</span>
                                  )}
                                  {school.adoptionPct >= adoptionP75 && <span className="metric-badge">High Adoption</span>}
                                  {school.bestLift >= liftP75 && <span className="metric-badge">High Lift</span>}
                                  {school.emv >= emvP75 && <span className="metric-badge">High EMV</span>}
                                </div>
                              </td>
                              <td className={`px-6 py-4 text-right ${baselineSortBy === 'totalPosts' ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                                {formatFullNumber(school.totalPosts)}
                              </td>
                              <td className={`px-6 py-4 text-right ${baselineSortBy === 'sponsoredPosts' ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                                {formatFullNumber(school.sponsoredPosts)}
                              </td>
                              <td className={`px-6 py-4 text-right ${baselineSortBy === 'totalLikes' ? 'text-green-600 font-semibold' : 'text-gray-700'}`}>
                                {formatFullNumber(school.avgLikesPerPost)}
                              </td>
                              <td className={`px-6 py-4 text-right font-semibold ${baselineSortBy === 'totalEngagement' ? 'text-green-600' : 'text-gray-900'}`}>
                                {formatFullNumber(school.avgEngagementPerPost)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              );
            })()}

            <DrawerPanel
              open={baselineDrawerOpen}
              onClose={() => setBaselineDrawerOpen(false)}
              title={baselineSelected ? baselineSelected.schoolName : 'School Overview'}
              side="bottom"
            >
              {baselineSelected && (() => {
                const adoptionMedian = median(perSchool.adoption);
                const summary =
                  baselineSelected.bestLift > 0 && baselineSelected.adoptionPct < adoptionMedian
                    ? `High lift in ${baselineSelected.bestIPType}, adoption below median.`
                    : baselineSelected.bestLift > 0 && baselineSelected.adoptionPct >= adoptionMedian
                    ? `Strong lift in ${baselineSelected.bestIPType} with healthy adoption.`
                    : `Lift is muted; adoption sits at ${baselineSelected.adoptionPct.toFixed(1)}%.`;

                return (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Best IP Type</span>
                      <span className="font-semibold text-gray-900">{baselineSelected.bestIPType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Lift %</span>
                      <span className="font-semibold text-green-600">{baselineSelected.bestLift.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Adoption %</span>
                      <span className="font-semibold text-gray-900">{baselineSelected.adoptionPct.toFixed(1)}%</span>
                    </div>
                    <div className="text-gray-600">{summary}</div>
                  </div>
                );
              })()}
            </DrawerPanel>

            {/* Performance by IP Type - Three Cards */}
            <div>
              <SectionHeader primary="PERFORMANCE BY " secondary="IP TYPE" />
              <p className="text-sm text-gray-600 mt-2 mb-6">How different IP types drive engagement across all schools</p>
              {(() => {
                const adoption = {
                  logo: networkTotals.totalContents > 0 ? (networkTotals.totalWithLogo / networkTotals.totalContents) * 100 : 0,
                  caption: networkTotals.totalContents > 0 ? (networkTotals.totalWithCaption / networkTotals.totalContents) * 100 : 0,
                  collab: networkTotals.totalContents > 0 ? (networkTotals.totalWithCollaboration / networkTotals.totalContents) * 100 : 0
                };

                const lifts = {
                  logo: networkTotals.avgLogoLift,
                  caption: networkTotals.avgCaptionLift,
                  collab: networkTotals.avgCollabLift
                };

                const liftRank = Object.entries(lifts).sort((a, b) => b[1] - a[1]).map(([k]) => k);
                const adoptionRank = Object.entries(adoption).sort((a, b) => b[1] - a[1]).map(([k]) => k);

                const opportunitySignal = (key: 'logo' | 'caption' | 'collab') => {
                  const isHighestLift = liftRank[0] === key;
                  const isLowestAdoption = adoptionRank[adoptionRank.length - 1] === key;
                  if (isHighestLift && isLowestAdoption) return 'Highest lift, lowest adoption';
                  if (isHighestLift) return 'Highest lift opportunity';
                  if (isLowestAdoption) return 'Lowest adoption opportunity';
                  return 'Balanced lift and adoption';
                };

                return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Logo Card */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Visual IP (Logo, Uniform with marks)</h5>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Posts with Visual IP</div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatNumber(networkTotals.totalWithLogo)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {networkTotals.totalContents > 0
                          ? ((networkTotals.totalWithLogo / networkTotals.totalContents) * 100).toFixed(1)
                          : 0}% of all posts
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated EMV</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatEMV(filteredSchools.reduce((sum, s) => {
                          const likes = s.logo.yes.likes * s.logo.yes.contents;
                          const comments = s.logo.yes.comments * s.logo.yes.contents;
                          return sum + estimateEmvFromTotals(likes, comments);
                        }, 0))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1.5">
                        <span>Engagement Lift</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 cursor-help" />
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Lift vs posts without this IP
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {networkTotals.avgLogoLift > 0 ? '+' : ''}{networkTotals.avgLogoLift.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        vs posts without visual IP
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Adoption: {adoption.logo.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500 mt-2">Opportunity Signal: <span className="font-semibold text-gray-700">{opportunitySignal('logo')}</span></div>
                      <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${Math.min(Math.abs(networkTotals.avgLogoLift) * 2, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        {networkTotals.avgLogoLift > 0
                          ? 'Posts featuring visual IP drive stronger engagement'
                          : 'Visual IP shows neutral impact on engagement'
                        }
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Caption Mention Card */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Caption Mentions</h5>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Posts with Mentions</div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatNumber(networkTotals.totalWithCaption)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {networkTotals.totalContents > 0
                          ? ((networkTotals.totalWithCaption / networkTotals.totalContents) * 100).toFixed(1)
                          : 0}% of all posts
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated EMV</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {formatEMV(filteredSchools.reduce((sum, s) => {
                          const likes = s.orgInCaption.yes.likes * s.orgInCaption.yes.contents;
                          const comments = s.orgInCaption.yes.comments * s.orgInCaption.yes.contents;
                          return sum + estimateEmvFromTotals(likes, comments);
                        }, 0))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1.5">
                        <span>Engagement Lift</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 cursor-help" />
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Lift vs posts without this IP
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {networkTotals.avgCaptionLift > 0 ? '+' : ''}{networkTotals.avgCaptionLift.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        vs posts without mentions
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Adoption: {adoption.caption.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500 mt-2">Opportunity Signal: <span className="font-semibold text-gray-700">{opportunitySignal('caption')}</span></div>
                      <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${Math.min(Math.abs(networkTotals.avgCaptionLift) * 2, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        {networkTotals.avgCaptionLift > 0
                          ? 'School mentions in captions boost engagement'
                          : networkTotals.avgCaptionLift < -10
                          ? 'Caption mentions show lower engagement - may indicate promotional content'
                          : 'Caption mentions show neutral impact'
                        }
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Collaboration Card */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h5 className="text-lg font-bold text-gray-900">Collaborations</h5>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Collaboration Posts</div>
                      <div className="text-2xl md:text-3xl font-bold text-gray-900">
                        {formatNumber(networkTotals.totalWithCollaboration)}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {networkTotals.totalContents > 0
                          ? ((networkTotals.totalWithCollaboration / networkTotals.totalContents) * 100).toFixed(1)
                          : 0}% of all posts
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1">Estimated EMV</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatEMV(filteredSchools.reduce((sum, s) => {
                          const likes = s.collaboration.yes.likes * s.collaboration.yes.contents;
                          const comments = s.collaboration.yes.comments * s.collaboration.yes.contents;
                          return sum + estimateEmvFromTotals(likes, comments);
                        }, 0))}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600 mb-1 flex items-center gap-1.5">
                        <span>Engagement Lift</span>
                        <div className="relative group">
                          <Info className="w-3 h-3 cursor-help" />
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Lift vs posts without this IP
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {networkTotals.avgCollabLift > 0 ? '+' : ''}{networkTotals.avgCollabLift.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        vs non-collaboration posts
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Adoption: {adoption.collab.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500 mt-2">Opportunity Signal: <span className="font-semibold text-gray-700">{opportunitySignal('collab')}</span></div>
                      <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{ width: `${Math.min(Math.abs(networkTotals.avgCollabLift) * 2, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">
                        {networkTotals.totalWithCollaboration === 0
                          ? 'No collaboration posts detected - opportunity for growth'
                          : networkTotals.avgCollabLift > 0
                          ? 'Collaboration posts show strong performance'
                          : 'Collaboration impact varies by school'
                        }
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
                );
              })()}
            </div>

            {/* School-by-School Performance - Only show in network view */}
            {selectedSchool === 'all' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <SectionHeader primary="SCHOOL-BY-SCHOOL " secondary="PERFORMANCE" />
                    <p className="text-sm text-gray-600 mt-2">Scroll to explore how each school's IP drives engagement</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {schoolsData.length} schools
                  </div>
                </div>

                {/* Scrollable School Cards */}
                <div className="flex md:block gap-6 md:gap-0 md:space-y-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0">
                  {(() => {
                    // ═══════════════════════════════════════════════════════════════
                    // CALCULATE IP IMPACT (Total Engagement from IP Posts)
                    // ═══════════════════════════════════════════════════════════════
                    const schoolsWithImpact = schoolsData.map(school => {
                      // Calculate total engagement (likes + comments) from all IP posts
                      const totalIPEngagement =
                        (school.collaboration.yes.contents * (school.collaboration.yes.likes + school.collaboration.yes.comments)) +
                        (school.logo.yes.contents * (school.logo.yes.likes + school.logo.yes.comments)) +
                        (school.orgInCaption.yes.contents * (school.orgInCaption.yes.likes + school.orgInCaption.yes.comments));

                      return { school, totalIPEngagement };
                    });

                    // Sort schools by IP Impact (highest engagement first)
                    const sortedSchools = schoolsWithImpact.sort((a, b) => b.totalIPEngagement - a.totalIPEngagement);
                    const impactValues = schoolsWithImpact.map(s => s.totalIPEngagement);

                    // Max schools (schools with premium tier)
                    const maxSchools = ['Michigan State', 'University of Maryland', 'Auburn University', 'Texas A&M', 'Louisiana State University', 'Penn State University'];

                    return sortedSchools.map(({ school, totalIPEngagement }) => {
                      // Define IP types in FIXED order: Collaboration, Visual IP, Mention
                      const ipTypes = [
                        { type: 'Collaboration', lift: school.collaboration.avgLift, data: school.collaboration, icon: '🤝' },
                        { type: 'Visual IP', lift: school.logo.avgLift, data: school.logo, icon: '🏫' },
                        { type: 'Mention', lift: school.orgInCaption.avgLift, data: school.orgInCaption, icon: '💬' }
                      ];

                      // Determine which one has the highest lift (best performer)
                      const bestIPType = [...ipTypes].sort((a, b) => b.lift - a.lift)[0].type;

                      const isMaxSchool = maxSchools.includes(school.school.name);
                      const ipAdoption = (school.counts.withIp / school.overall.totalContents) * 100;
                      const impactPercentile = percentile(impactValues, totalIPEngagement);
                      const adoptionTier = ipAdoption >= 66 ? 'high' : ipAdoption >= 33 ? 'mid' : 'low';
                      const strategicSentence = `Top ${impactPercentile >= 80 ? '5' : impactPercentile >= 60 ? '10' : '20'} in IP impact, ${adoptionTier}-tier adoption.`;

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
                        <GlassCard key={school.school._id} className="min-w-[85%] md:min-w-0 snap-start overflow-hidden">
                          {/* School Header */}
                          <div className="p-6 border-b border-gray-200 bg-white/70 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* School Logo Box */}
                              <div className="w-16 h-16 bg-gradient-to-br from-[#1770C0] to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{getInitials(school.school.name)}</span>
                              </div>

                              <div>
                                <div className="flex items-center gap-3">
                                  <h5 className="text-lg font-bold text-gray-900">{getDisplayName(school.school.name)}</h5>
                                  {isMaxSchool && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded border border-yellow-300">
                                      ⭐ MAX
                                    </span>
                                  )}
                                  <span className="metric-badge">P{impactPercentile}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  Best: <span className="text-green-600 font-semibold">{bestIPType} IP</span> ({ipTypes.find(t => t.type === bestIPType)!.lift > 0 ? '+' : ''}{ipTypes.find(t => t.type === bestIPType)!.lift.toFixed(1)}% lift)
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  IP Adoption: <span className="font-semibold text-gray-700">{ipAdoption.toFixed(1)}%</span> • {formatNumber(school.counts.withIp)} IP Posts
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{strategicSentence}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-3xl font-bold text-[#1770C0]">{formatMillions(totalIPEngagement)}</div>
                              <div className="flex items-center justify-end gap-1.5">
                                <div className="text-xs text-gray-600 font-semibold">IP Impact</div>
                                <div className="relative group">
                                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                  <div className="absolute top-1/2 right-full -translate-y-1/2 mr-2 w-56 px-4 py-3 bg-gray-900 border border-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    <div className="font-bold mb-2 text-[#3B9FD9]">IP Impact</div>
                                    <div className="text-gray-300">
                                      Total interactions from all IP posts
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                                        ? 'bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400'
                                        : 'bg-white/70 border border-gray-200'
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
                                        <h6 className="text-base font-bold text-gray-900">{ipType.type.toUpperCase()}</h6>
                                      </div>
                                      <p className="text-xs text-gray-600">
                                        {ipType.type === 'Visual IP' && 'Visual IP visible in content (logo, uniform with marks)'}
                                        {ipType.type === 'Collaboration' && 'Collaboration posts with school'}
                                        {ipType.type === 'Mention' && 'School mentioned in caption'}
                                      </p>
                                    </div>

                                    {/* Lift Metric */}
                                    <div className="mb-4">
                                      {ipType.data.yes.contents === 0 ? (
                                        <div className="text-3xl font-bold text-gray-400">
                                          0
                                        </div>
                                      ) : (
                                        <div className={`text-3xl font-bold ${ipType.lift > 0 ? 'text-green-600' : ipType.lift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                          {ipType.lift > 0 ? '+' : ''}{ipType.lift.toFixed(1)}% {ipType.lift > 0 ? '▲' : ipType.lift < 0 ? '▼' : ''}
                                        </div>
                                      )}
                                      <div className="text-xs text-gray-600">vs No IP baseline</div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Posts</span>
                                        <span className="text-sm font-bold text-gray-900">{formatNumber(ipType.data.yes.contents)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Total Estimated EMV</span>
                                        <span className="text-sm font-bold text-green-600">
                                          {formatEMV(estimateEmvFromTotals(
                                            ipType.data.yes.likes * ipType.data.yes.contents,
                                            ipType.data.yes.comments * ipType.data.yes.contents
                                          ))}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                          <span>Avg Interactions</span>
                                          <div className="relative group">
                                            <Info className="w-3 h-3 cursor-help" />
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                              Likes + Comments
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{formatNumber(totalEngagement)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-600">Avg Likes</span>
                                        <span className="text-sm font-bold text-gray-900">{formatNumber(ipType.data.yes.likes)}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </GlassCard>
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
            <SectionHeader primary="IP IMPACT " secondary="ANALYSIS" />
            <p className="text-gray-600">Compare performance of posts with and without IP usage</p>

            {/* Section Scope */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700" htmlFor="with-vs-without-scope">
                  Section view:
                </label>
                <select
                  id="with-vs-without-scope"
                  value={withVsWithoutScope}
                  onChange={(e) => setWithVsWithoutScope(e.target.value)}
                  className="bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-900 text-sm focus:border-[#1770C0] focus:outline-none w-full md:max-w-[320px]"
                  aria-label="Change school for this section only"
                >
                  <option value="all">All Schools ({schoolsData.length})</option>
                  {schoolsData.map((school) => (
                    <option key={school.school._id} value={school.school.name}>
                      {getDisplayName(school.school.name)}
                    </option>
                  ))}
                </select>
                {withVsWithoutScope !== 'all' && (
                  <button
                    onClick={() => setWithVsWithoutScope('all')}
                    className="text-xs font-semibold text-[#1770C0] hover:text-[#3B9FD9]"
                  >
                    Reset to All Schools
                  </button>
                )}
              </div>
            </div>

            {/* IP Type Sub-tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
              <GlassPill active={ipTypeTab === 'logo'} onClick={() => setIpTypeTab('logo')}>Visual IP</GlassPill>
              <GlassPill active={ipTypeTab === 'collaboration'} onClick={() => setIpTypeTab('collaboration')}>Collaboration</GlassPill>
              <GlassPill active={ipTypeTab === 'caption'} onClick={() => setIpTypeTab('caption')}>Caption</GlassPill>
            </div>

            {/* Logo Comparison */}
            {ipTypeTab === 'logo' && (() => {
              const totals = {
                withIP: {
                  contents: sectionSchools.reduce((sum, s) => sum + s.logo.yes.contents, 0),
                  likes: sectionSchools.reduce((sum, s) => sum + (s.logo.yes.likes * s.logo.yes.contents), 0),
                  comments: sectionSchools.reduce((sum, s) => sum + (s.logo.yes.comments * s.logo.yes.contents), 0),
                  emv: sectionSchools.reduce((sum, s) => sum + (s.logo.yes.emv * s.logo.yes.contents), 0),
                },
                withoutIP: {
                  contents: sectionSchools.reduce((sum, s) => sum + s.logo.no.contents, 0),
                  likes: sectionSchools.reduce((sum, s) => sum + (s.logo.no.likes * s.logo.no.contents), 0),
                  comments: sectionSchools.reduce((sum, s) => sum + (s.logo.no.comments * s.logo.no.contents), 0),
                },
                avgLift: sectionSchools.length > 0
                  ? sectionSchools.reduce((sum, s) => sum + s.logo.avgLift, 0) / sectionSchools.length
                  : 0
              };

              const withEngagementRate = totals.withIP.contents > 0
                ? ((totals.withIP.likes + totals.withIP.comments) / totals.withIP.contents)
                : 0;
              const withoutEngagementRate = totals.withoutIP.contents > 0
                ? ((totals.withoutIP.likes + totals.withoutIP.comments) / totals.withoutIP.contents)
                : 0;

              return (
                <div className="space-y-6">
                  {/* Visual IP Explanation */}
                  <div className="hidden md:block">
                    <GlassCard className="p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">Visual IP</span> refers to posts where school intellectual property is visible in the content, including logos, uniforms with marks, and other branded visual elements.
                      </p>
                    </GlassCard>
                  </div>
                  <div className="md:hidden">
                    <details className="glass-card p-4">
                      <summary className="text-sm font-semibold text-gray-900 cursor-pointer">Research note: Visual IP definition</summary>
                      <p className="text-sm text-gray-700 mt-2">
                        Visual IP refers to posts where school intellectual property is visible in the content, including logos, uniforms with marks, and other branded visual elements.
                      </p>
                    </details>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* With Logo */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">With Visual IP</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Posts</div>
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(totals.withIP.contents)}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                            <span>Avg Interactions</span>
                            <div className="relative group">
                              <Info className="w-3.5 h-3.5 cursor-help" />
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                Likes + Comments
                              </div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatNumber(totals.withIP.likes + totals.withIP.comments)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Avg Engagement/Post</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatNumber(withEngagementRate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Estimated EMV</div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatEMV(estimateEmvFromTotals(totals.withIP.likes, totals.withIP.comments))}
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Without Logo */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Without Visual IP</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Posts</div>
                          <div className="text-2xl font-bold text-gray-900">{formatNumber(totals.withoutIP.contents)}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                            <span>Avg Interactions</span>
                            <div className="relative group">
                              <Info className="w-3.5 h-3.5 cursor-help" />
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                Likes + Comments
                              </div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatNumber(totals.withoutIP.likes + totals.withoutIP.comments)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Avg Engagement/Post</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatNumber(withoutEngagementRate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Estimated EMV</div>
                          <div className="text-2xl font-bold text-gray-400">
                            N/A
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Impact Summary */}
                    <GlassCard className="md:col-span-2 p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Impact Summary</h4>
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div>
                          <div className="text-sm text-gray-700 mb-1">Average Engagement Lift</div>
                          <div className="text-4xl font-bold text-green-600">
                            {totals.avgLift > 0 ? '+' : ''}{totals.avgLift.toFixed(1)}%
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700">
                            Posts with visual IP show <span className="text-green-600 font-bold">{Math.abs(totals.avgLift).toFixed(1)}%</span> {totals.avgLift > 0 ? 'higher' : 'lower'} engagement on average compared to posts without visual IP.
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${Math.min(Math.abs(totals.avgLift) * 2, 100)}%` }}
                        />
                      </div>
                    </GlassCard>
                  </div>
                </div>
              );
            })()}

            {/* Collaboration Comparison */}
            {ipTypeTab === 'collaboration' && (() => {
              const totals = {
                withIP: {
                  contents: sectionSchools.reduce((sum, s) => sum + s.collaboration.yes.contents, 0),
                  likes: sectionSchools.reduce((sum, s) => sum + (s.collaboration.yes.likes * s.collaboration.yes.contents), 0),
                  comments: sectionSchools.reduce((sum, s) => sum + (s.collaboration.yes.comments * s.collaboration.yes.contents), 0),
                  emv: sectionSchools.reduce((sum, s) => sum + (s.collaboration.yes.emv * s.collaboration.yes.contents), 0),
                },
                withoutIP: {
                  contents: sectionSchools.reduce((sum, s) => sum + s.collaboration.no.contents, 0),
                  likes: sectionSchools.reduce((sum, s) => sum + (s.collaboration.no.likes * s.collaboration.no.contents), 0),
                  comments: sectionSchools.reduce((sum, s) => sum + (s.collaboration.no.comments * s.collaboration.no.contents), 0),
                },
                avgLift: sectionSchools.length > 0
                  ? sectionSchools.reduce((sum, s) => sum + s.collaboration.avgLift, 0) / sectionSchools.length
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
                  <GlassCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">With Collaboration</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{formatNumber(totals.withIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                          <span>Avg Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">
                          {formatNumber(totals.withIP.likes + totals.withIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(withEngagementRate)}
                        </div>
                      </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Estimated EMV</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {formatEMV(estimateEmvFromTotals(totals.withIP.likes, totals.withIP.comments))}
                          </div>
                        </div>
                    </div>
                  </GlassCard>

                  {/* Without Collaboration */}
                  <GlassCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-gray-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Without Collaboration</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{formatNumber(totals.withoutIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                          <span>Avg Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">
                          {formatNumber(totals.withoutIP.likes + totals.withoutIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(withoutEngagementRate)}
                        </div>
                      </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Estimated EMV</div>
                          <div className="text-2xl font-bold text-gray-400">
                            N/A
                          </div>
                        </div>
                    </div>
                  </GlassCard>

                  {/* Impact Summary */}
                  <GlassCard className="md:col-span-2 p-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Impact Summary</h4>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div>
                        <div className="text-sm text-gray-700 mb-1">Average Engagement Lift</div>
                        <div className="text-4xl font-bold text-purple-600">
                          {totals.avgLift > 0 ? '+' : ''}{totals.avgLift.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">
                          Posts with school collaboration IP show <span className="text-purple-600 font-bold">{Math.abs(totals.avgLift).toFixed(1)}%</span> {totals.avgLift > 0 ? 'higher' : 'lower'} engagement on average compared to posts without collaboration.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${Math.min(Math.abs(totals.avgLift) * 2, 100)}%` }}
                      />
                    </div>
                  </GlassCard>
                </div>
              );
            })()}

            {/* Caption Comparison */}
            {ipTypeTab === 'caption' && (() => {
              const totals = {
                withIP: {
                  contents: sectionSchools.reduce((sum, s) => sum + s.orgInCaption.yes.contents, 0),
                  likes: sectionSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.likes * s.orgInCaption.yes.contents), 0),
                  comments: sectionSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.comments * s.orgInCaption.yes.contents), 0),
                  emv: sectionSchools.reduce((sum, s) => sum + (s.orgInCaption.yes.emv * s.orgInCaption.yes.contents), 0),
                },
                withoutIP: {
                  contents: sectionSchools.reduce((sum, s) => sum + s.orgInCaption.no.contents, 0),
                  likes: sectionSchools.reduce((sum, s) => sum + (s.orgInCaption.no.likes * s.orgInCaption.no.contents), 0),
                  comments: sectionSchools.reduce((sum, s) => sum + (s.orgInCaption.no.comments * s.orgInCaption.no.contents), 0),
                },
                avgLift: sectionSchools.length > 0
                  ? sectionSchools.reduce((sum, s) => sum + s.orgInCaption.avgLift, 0) / sectionSchools.length
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
                  <GlassCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-yellow-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">With Caption Mention</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{formatNumber(totals.withIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                          <span>Avg Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">
                          {formatNumber(totals.withIP.likes + totals.withIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(withEngagementRate)}
                        </div>
                      </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Estimated EMV</div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {formatEMV(estimateEmvFromTotals(totals.withIP.likes, totals.withIP.comments))}
                          </div>
                        </div>
                    </div>
                  </GlassCard>

                  {/* Without Caption */}
                  <GlassCard className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-gray-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900">Without Caption Mention</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Posts</div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{formatNumber(totals.withoutIP.contents)}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                          <span>Avg Interactions</span>
                          <div className="relative group">
                            <Info className="w-3.5 h-3.5 cursor-help" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 border border-gray-700 text-white text-sm font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                              Likes + Comments
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">
                          {formatNumber(totals.withoutIP.likes + totals.withoutIP.comments)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Avg Engagement/Post</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNumber(withoutEngagementRate)}
                        </div>
                      </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Total Estimated EMV</div>
                          <div className="text-2xl font-bold text-gray-400">
                            N/A
                          </div>
                        </div>
                    </div>
                  </GlassCard>

                  {/* Impact Summary */}
                  <GlassCard className="md:col-span-2 p-8">
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Impact Summary</h4>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div>
                        <div className="text-sm text-gray-700 mb-1">Average Engagement Lift</div>
                        <div className="text-4xl font-bold text-yellow-600">
                          {totals.avgLift > 0 ? '+' : ''}{totals.avgLift.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">
                          Posts with school mention in caption show <span className="text-yellow-600 font-bold">{Math.abs(totals.avgLift).toFixed(1)}%</span> {totals.avgLift > 0 ? 'higher' : 'lower'} engagement on average compared to posts without caption mention.
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${Math.min(Math.abs(totals.avgLift) * 2, 100)}%` }}
                      />
                    </div>
                  </GlassCard>
                </div>
              );
            })()}
              </div>
            )}

            {activeTab === 'partnerships' && (
              <PartnershipsTab
                schoolsData={schoolsData}
                schoolPartnershipData={_schoolPartnershipData}
                brandData={brandData}
                formatNumber={formatNumber}
                formatEMV={formatEMV}
              />
            )}

            {activeTab === 'athletes' && (
              <AthletesTab
                schoolsData={schoolsData}
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

            {activeTab === 'content' && (
              <ContentTab />
            )}

            {activeTab === 'teams' && (
              <TeamsTab playflySchools={Object.keys(SCHOOL_FILE_MAP)} />
            )}
          </div>
        </TabTransition>
      </div>
    </div>
  );
}
