/**
 * Recalculate EMV for brand partnerships using the correct formula
 *
 * This utility reads the NCAA roster data to calculate average athlete follower counts,
 * then applies the correct EMV formula to partnership data.
 */

import { calculatePostEMV } from './emvCalculator';

interface AthleteRoster {
  _id: { $oid: string };
  firstName: string;
  lastName: string;
  schoolName: string;
  metrics: {
    ninetyDays: {
      followers: number;
      sponsoredContentCount: number;
      contentCount: number;
    };
  };
}

interface PartnershipData {
  sponsorPartner: string;
  totalContents: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  engagementRateLift: number;
  emv: number; // OLD EMV value
}

interface SchoolPartnershipData {
  school: {
    _id: string;
    name: string;
  };
  followers: number;
  overall: {
    totalContents: number;
  };
  sponsorPartners: PartnershipData[];
}

/**
 * Calculate average follower count of athletes who post sponsored content
 */
export async function calculateAverageSponsoredAthleteFollowers(
  rosterData: AthleteRoster[]
): Promise<number> {
  // Filter athletes with sponsored content in the last 90 days
  const athletesWithSponsored = rosterData.filter(
    athlete => athlete.metrics.ninetyDays.sponsoredContentCount > 0
  );

  if (athletesWithSponsored.length === 0) {
    console.warn('No athletes with sponsored content found in roster');
    return 0;
  }

  // Calculate average follower count
  const totalFollowers = athletesWithSponsored.reduce(
    (sum, athlete) => sum + athlete.metrics.ninetyDays.followers,
    0
  );
  const averageFollowers = totalFollowers / athletesWithSponsored.length;

  console.log(`Found ${athletesWithSponsored.length} athletes with sponsored content`);
  console.log(`Average follower count: ${averageFollowers.toLocaleString()}`);

  return averageFollowers;
}

/**
 * Recalculate EMV for a single brand partnership
 */
export function recalculateBrandEMV(
  partner: PartnershipData,
  avgAthleteFollowers: number
): number {
  // Use the average follower count + brand's avg engagement to calculate EMV
  const avgEMVPerPost = calculatePostEMV({
    athleteFollowers: avgAthleteFollowers,
    likes: partner.avgLikes,
    comments: partner.avgComments
  });

  return avgEMVPerPost;
}

/**
 * Recalculate EMV for all partnerships in a school's data
 */
export function recalculateSchoolPartnerships(
  schoolData: SchoolPartnershipData,
  avgAthleteFollowers: number
): SchoolPartnershipData {
  return {
    ...schoolData,
    sponsorPartners: schoolData.sponsorPartners.map(partner => ({
      ...partner,
      emv: recalculateBrandEMV(partner, avgAthleteFollowers)
    }))
  };
}

/**
 * Recalculate EMV for all schools' partnership data
 */
export function recalculateAllPartnerships(
  schoolPartnerships: SchoolPartnershipData[],
  avgAthleteFollowers: number
): SchoolPartnershipData[] {
  console.log(`\nRecalculating EMV for ${schoolPartnerships.length} schools...`);
  console.log(`Using average athlete followers: ${avgAthleteFollowers.toLocaleString()}`);

  const recalculated = schoolPartnerships.map(school =>
    recalculateSchoolPartnerships(school, avgAthleteFollowers)
  );

  // Log some examples
  const firstSchool = recalculated[0];
  if (firstSchool && firstSchool.sponsorPartners.length > 0) {
    const firstBrand = firstSchool.sponsorPartners[0];
    console.log(`\nExample: ${firstBrand.sponsorPartner}`);
    console.log(`  Avg Likes: ${firstBrand.avgLikes}`);
    console.log(`  Avg Comments: ${firstBrand.avgComments}`);
    console.log(`  Recalculated EMV per post: $${firstBrand.emv.toFixed(2)}`);
    console.log(`  Total EMV (${firstBrand.totalContents} posts): $${(firstBrand.emv * firstBrand.totalContents).toFixed(2)}`);
  }

  return recalculated;
}

/**
 * Calculate school-specific average follower count for more accurate EMV
 * (Optional: Use this if you want per-school averages instead of network-wide)
 */
export function calculateSchoolAverageFollowers(
  rosterData: AthleteRoster[],
  schoolName: string
): number {
  const schoolAthletes = rosterData.filter(
    athlete =>
      athlete.schoolName === schoolName &&
      athlete.metrics.ninetyDays.sponsoredContentCount > 0
  );

  if (schoolAthletes.length === 0) {
    console.warn(`No sponsored athletes found for ${schoolName}`);
    return 0;
  }

  const totalFollowers = schoolAthletes.reduce(
    (sum, athlete) => sum + athlete.metrics.ninetyDays.followers,
    0
  );

  return totalFollowers / schoolAthletes.length;
}
