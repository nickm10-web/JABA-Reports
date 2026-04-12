export type TournamentGender = 'men' | 'women';

export interface TournamentWindow {
  gender: TournamentGender;
  selectionSunday: string;
  titleGame: string;
  firstFourStart: string;
  roundOf64Start: string;
}

export interface TournamentParticipant {
  schoolId: string;
  schoolName: string;
  gender: TournamentGender;
  seed: number;
  conference: string;
  region: string;
  enteredViaFirstFour: boolean;
  source: string;
}

export interface FollowerSnapshot {
  athleteId?: string;
  athleteName: string;
  schoolName: string;
  sport: string;
  capturedAt: string;
  followers: number;
  source: string;
}

export type ManualDealVerificationStatus = 'verified_manual' | 'verified_both' | 'unverified';

export interface ManualDealRecord {
  dealId: string;
  athleteName: string;
  schoolName: string;
  gender: TournamentGender;
  brandName: string;
  platform: string;
  evidenceUrl: string;
  dealStartDate: string;
  dealEndDate?: string;
  verificationStatus: ManualDealVerificationStatus;
  notes?: string;
}

export interface TournamentPost {
  postId: string;
  athleteId?: string;
  athleteName: string;
  schoolName: string;
  gender: TournamentGender;
  sport: string;
  publishedAt: string;
  caption: string;
  brandName: string | null;
  platform: string;
  likes: number;
  comments: number;
  engagementRate: number;
  sponsorPartner?: string;
  isSponsored: boolean;
  isCollaboration: boolean;
  isOrganizationCollaboration: boolean;
  hasOrganizationInCaption: boolean;
  hasOrganizationLogo: boolean;
  permalink?: string;
}

export type GrowthStatus = 'available' | 'unavailable';

export interface AthleteGrowthRecord {
  athleteId: string;
  athleteName: string;
  schoolName: string;
  gender: TournamentGender;
  sport: string;
  followersBefore: number | null;
  followersAfter: number | null;
  absoluteGrowth: number | null;
  percentGrowth: number | null;
  growthStatus: GrowthStatus;
}

export type DealVerificationStatus =
  | 'verified_local'
  | 'verified_manual'
  | 'verified_both'
  | 'unverified';

export type DealPerformanceStatus = 'measured' | 'manual_only';

export interface TournamentDealPerformance {
  dealId: string;
  athleteName: string;
  schoolName: string;
  gender: TournamentGender;
  brandName: string;
  postCount: number;
  totalLikes: number;
  totalComments: number;
  totalEngagement: number;
  totalEMV: number;
  avgEMVPerPost: number;
  verificationStatus: DealVerificationStatus;
  performanceStatus: DealPerformanceStatus;
  evidenceUrls: string[];
}

export interface BrandLeaderboardEntry {
  brandName: string;
  totalEMV: number;
  totalEngagement: number;
  totalDeals: number;
  athletesActivated: number;
  schoolsActivated: number;
}

export interface SchoolCoverageRecord {
  schoolId: string;
  schoolName: string;
  gender: TournamentGender;
  seed: number;
  hasLocalData: boolean;
  coverageStatus: string;
  contentFile?: string;
  rosterFile?: string;
}

export interface MarchMadnessReportData {
  windows: TournamentWindow[];
  participants: TournamentParticipant[];
  coverage: SchoolCoverageRecord[];
  growthRecords: AthleteGrowthRecord[];
  growthAvailableCount: number;
  growthUnavailableCount: number;
  dealPerformances: TournamentDealPerformance[];
  manualOnlyDeals: TournamentDealPerformance[];
  brandLeaderboard: BrandLeaderboardEntry[];
  totals: {
    participatingSchools: number;
    schoolsWithLocalData: number;
    basketballAthletesEvaluated: number;
    verifiedTournamentDeals: number;
    totalMeasuredEMV: number;
  };
}
