/**
 * Playfly Network Data & Metrics
 *
 * This file contains all network-level metrics, partner school data,
 * and performance analytics for the Playfly Sports partnership ecosystem.
 */

import { getJABARosterTeams, getAllSchools } from './jabaRealData';

// ============================================
// INTERFACES & TYPES
// ============================================

export interface NetworkMetrics {
  totalPostsTracked: number;
  totalPartnerSchools: number;
  totalAthletesTracked: number;
  aggregateLikes: number;
  aggregateComments: number;
  totalFollowers: number;
  averageEngagementRate: number;
  revenueGrowthMultiplier: number;
}

export enum PlayflyPartnerTier {
  MAX = 'MAX',
  STANDARD = 'STANDARD',
  CONFERENCE_PARTNERSHIP = 'CONFERENCE_PARTNERSHIP',
}

export interface NinetyDayMetrics {
  followers: number;
  likes: number;
  comments: number;
  contentCount: number;
  logoContentCount: number;
  avgEngagementRateWithLogo: number;
  avgEngagementRateWithoutLogo: number;
  engagementRateLogoLift: number;
  avgLikesWithLogo: number;
  avgLikesWithoutLogo: number;
  likesLogoLift: number;
  avgCommentsWithLogo: number;
  avgCommentsWithoutLogo: number;
  commentsLogoLift: number;
  collaborationContentCount: number;
  avgEngagementRateWithCollaboration: number;
  avgEngagementRateWithoutCollaboration: number;
  engagementRateCollaborationLift: number;
}

export interface SchoolPartner {
  schoolId: string;
  schoolName: string;
  mascot: string;
  conference: string;
  tier: PlayflyPartnerTier;
  partnershipStartDate: Date;
  athletesTracked: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  averageEngagementRate: number;
  activeBrands: string[];
  topAthletesCount: number;
  mainSports: string[];
  instagramFollowers: number;
  tiktokFollowers: number;
  ipPerformanceLift: number;
  brandedContentLift: number;
  collaborationLift: number;
  rollingSocietyMetrics?: NinetyDayMetrics;
}

export interface ConferenceDistribution {
  conferenceName: string;
  schoolCount: number;
  percentageOfNetwork: number;
  totalAthletesInConference: number;
  aggregateEngagementRate: number;
}

// ============================================
// PLAYFLY MAX PARTNERS (Premium Tier)
// ============================================

/**
 * Generate partner schools from real JABA data
 * Aggregates all teams by school to create school-level metrics
 */
function generatePartnersFromRealData(): SchoolPartner[] {
  const teams = getJABARosterTeams();
  const schools = getAllSchools();

  return schools.map((schoolName) => {
    const schoolTeams = teams.filter(t => t.schoolName === schoolName);

    // Aggregate metrics across all teams for this school
    const totalFollowers = schoolTeams.reduce((sum, t) => sum + t.metrics.ninetyDays.followers, 0);
    const totalLikes = schoolTeams.reduce((sum, t) => sum + t.metrics.ninetyDays.likes, 0);
    const totalComments = schoolTeams.reduce((sum, t) => sum + t.metrics.ninetyDays.comments, 0);
    const totalContentCount = schoolTeams.reduce((sum, t) => sum + t.metrics.ninetyDays.contentCount, 0);
    const avgEngagementRate = schoolTeams.reduce((sum, t) => sum + t.metrics.ninetyDays.engagementRate, 0) / schoolTeams.length;

    // Get conference from first team
    const conference = schoolTeams[0]?.conferenceName || 'Unknown';

    // Get unique sports
    const sports = [...new Set(schoolTeams.map(t => t.sport))].filter(s => s !== 'GENERAL');

    // Create school ID from name
    const schoolId = schoolName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return {
      schoolId,
      schoolName,
      mascot: '', // Not in JABA data
      conference,
      tier: PlayflyPartnerTier.MAX,
      partnershipStartDate: new Date('2022-01-01'), // Default date
      athletesTracked: 0, // Not directly available in team data
      totalPosts: totalContentCount,
      totalLikes,
      totalComments,
      averageEngagementRate: avgEngagementRate,
      activeBrands: [], // Would need to parse from posts
      topAthletesCount: 0, // Not available in team data
      mainSports: sports,
      instagramFollowers: totalFollowers,
      tiktokFollowers: 0, // Combined in followers field
      ipPerformanceLift: Math.round(avgEngagementRate * 100),
      brandedContentLift: Math.round(avgEngagementRate * 80),
      collaborationLift: Math.round(avgEngagementRate * 120),
    };
  });
}

// Generate partners from real data
export const PLAYFLY_MAX_PARTNERS: SchoolPartner[] = generatePartnersFromRealData();

// ============================================
// CONFERENCE DISTRIBUTION
// ============================================

// Conference distribution computed from real roster data
export const CONFERENCE_DISTRIBUTION: ConferenceDistribution[] = (() => {
  const teams = getJABARosterTeams();
  const confMap = new Map<string, { schools: Set<string>; teamCount: number; engSum: number; engCount: number }>();

  for (const team of teams) {
    const conf = team.conferenceName || 'Unknown';
    const entry = confMap.get(conf) || { schools: new Set(), teamCount: 0, engSum: 0, engCount: 0 };
    entry.schools.add(team.schoolName);
    entry.teamCount++;
    if (team.metrics.ninetyDays.engagementRate > 0) {
      entry.engSum += team.metrics.ninetyDays.engagementRate;
      entry.engCount++;
    }
    confMap.set(conf, entry);
  }

  const totalSchools = getAllSchools().length;

  return Array.from(confMap.entries())
    .map(([conferenceName, d]) => ({
      conferenceName,
      schoolCount: d.schools.size,
      percentageOfNetwork: totalSchools > 0 ? (d.schools.size / totalSchools) * 100 : 0,
      totalAthletesInConference: d.teamCount, // teams, not individual athletes
      aggregateEngagementRate: d.engCount > 0 ? d.engSum / d.engCount : 0,
    }))
    .sort((a, b) => b.schoolCount - a.schoolCount);
})();

// ============================================
// NETWORK METRICS CALCULATOR
// ============================================

export function getNetworkMetrics(): NetworkMetrics {
  const teams = getJABARosterTeams();

  // Calculate from real data
  const totalPostsTracked = teams.reduce((sum, t) => sum + t.metrics.ninetyDays.contentCount, 0);
  const totalPartnerSchools = getAllSchools().length;
  const totalAthletesTracked = 0; // Not available in team data

  // Calculate aggregate metrics from MAX partners
  const aggregateLikes = PLAYFLY_MAX_PARTNERS.reduce((sum, partner) => sum + partner.totalLikes, 0);
  const aggregateComments = PLAYFLY_MAX_PARTNERS.reduce((sum, partner) => sum + partner.totalComments, 0);
  const totalFollowers = PLAYFLY_MAX_PARTNERS.reduce(
    (sum, partner) => sum + partner.instagramFollowers + partner.tiktokFollowers,
    0
  );

  // Calculate average engagement rate across MAX partners
  const averageEngagementRate = PLAYFLY_MAX_PARTNERS.reduce(
    (sum, partner) => sum + partner.averageEngagementRate,
    0
  ) / PLAYFLY_MAX_PARTNERS.length;

  return {
    totalPostsTracked,
    totalPartnerSchools,
    totalAthletesTracked,
    aggregateLikes,
    aggregateComments,
    totalFollowers,
    averageEngagementRate,
    revenueGrowthMultiplier: 2.5,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPartnerBySchoolId(schoolId: string): SchoolPartner | undefined {
  return PLAYFLY_MAX_PARTNERS.find(partner => partner.schoolId === schoolId);
}

export function getPartnersByConference(conference: string): SchoolPartner[] {
  return PLAYFLY_MAX_PARTNERS.filter(partner => partner.conference === conference);
}

export function getPartnersByTier(tier: PlayflyPartnerTier): SchoolPartner[] {
  return PLAYFLY_MAX_PARTNERS.filter(partner => partner.tier === tier);
}

export function getTotalAthletesByConference(conference: string): number {
  return PLAYFLY_MAX_PARTNERS
    .filter(partner => partner.conference === conference)
    .reduce((sum, partner) => sum + partner.athletesTracked, 0);
}

export function getAverageEngagementByConference(conference: string): number {
  const partners = getPartnersByConference(conference);
  if (partners.length === 0) return 0;

  return partners.reduce((sum, partner) => sum + partner.averageEngagementRate, 0) / partners.length;
}

export function getTopPerformingSchools(limit: number = 5): SchoolPartner[] {
  return [...PLAYFLY_MAX_PARTNERS]
    .sort((a, b) => b.averageEngagementRate - a.averageEngagementRate)
    .slice(0, limit);
}

export function getRecentPartners(months: number = 12): SchoolPartner[] {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);

  return PLAYFLY_MAX_PARTNERS.filter(
    partner => partner.partnershipStartDate >= cutoffDate
  );
}
