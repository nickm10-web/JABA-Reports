// ═══════════════════════════════════════════════════════════════
// UCLA NIL Intelligence Report — Shared Types
// ═══════════════════════════════════════════════════════════════

export interface SponsorPost {
  _id: string;
  athlete: {
    _id: string;
    name: string;
    image: string;
    bio?: string;
    sport: string;
    position?: string;
    year?: string;
    school?: { name: string };
    conference?: { name: string };
  };
  caption: string;
  hashtags?: string[];
  mediaType?: string;
  metrics: {
    likes: number;
    comments: number;
    engagementRate: number;
    shares?: number;
    saves?: number;
    videoViews?: number;
    impressions?: number;
    reach?: number;
    followers?: number;
    totalInteractions?: number;
    accountsEngaged?: number;
    profileLinksTaps?: number;
  };
  permalink: string;
  publishedAt: { $date: string };
  source?: string;
  sponsorPartner: string;
  url: string;
  isSponsored?: boolean;
  isCollaboration?: boolean;
  isOrganizationCollaboration?: boolean;
  hasOrganizationLogo?: boolean;
  hasOrganizationInCaption?: boolean;
}

export interface BrandGroup {
  key: string;
  displayName: string;
  handle: string;
  posts: SponsorPost[];
  uniqueAthletes: string[];
  sports: string[];
  sponsoredCount: number;
  dateRange: { min: string; max: string };
  athleteGroups: AthleteGroup[];
  totalEMV: number;
  category: string;
}

export interface AthleteGroup {
  id: string;
  name: string;
  image: string;
  sport: string;
  position?: string;
  year?: string;
  posts: SponsorPost[];
  followers: number;
  totalEMV: number;
}

export interface AthleteIndex {
  id: string;
  name: string;
  image: string;
  sport: string;
  position?: string;
  year?: string;
  posts: number;
  totalLikes: number;
  totalComments: number;
  brands: number;
  followers: number;
  totalEMV: number;
  avgEngagement: number;
}

export interface PeerSchool {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string;
  conference: string;
  totalDeals: number;
  totalEMV: number;
  avgEngagement: number;
  topSport: string;
  athleteCount: number;
  brandCount: number;
  monthlyRanks: number[]; // 12 months, rank 1-9
}

export interface MonthlyTrend {
  month: string;
  label: string;
  deals: number;
  emv: number;
  athletes: number;
  engagement: number;
}

export interface BrandGapEntry {
  category: string;
  sport: string;
  status: 'active' | 'competitor' | 'none';
  brandCount: number;
  competitorBrands?: string[];
}

export type UCLATabId = 'overview' | 'benchmarks' | 'brand-deals' | 'content' | 'opportunity' | 'athletes' | 'ip-intelligence';

export interface FilterState {
  sport: string;
  dateRange: { start: string; end: string };
  search: string;
}

export interface IPMetricDrawerData {
  metric: string;
  definition: string;
  uclaValue: string;
  conferenceAvg: string;
  rank: string;
  insight: string;
}

export type DrawerPayload =
  | { type: 'brand'; data: BrandGroup }
  | { type: 'athlete'; data: AthleteIndex }
  | { type: 'post'; data: SponsorPost }
  | { type: 'ip-metric'; data: IPMetricDrawerData };
