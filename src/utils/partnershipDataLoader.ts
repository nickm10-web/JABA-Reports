/**
 * Partnership Data Loader with EMV Recalculation
 *
 * Loads partnership JSON files and recalculates EMV using the correct formula
 * with average athlete follower counts from NCAA roster data.
 */

import { calculatePostEMV } from './emvCalculator';
import emvConfig from '../config/emvConfig.json';

interface PartnershipData {
  sponsorPartner: string;
  totalContents: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  engagementRateLift: number;
  emv: number; // OLD EMV value - will be recalculated
}

export interface SchoolPartnershipData {
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
  sponsorPartners: PartnershipData[];
}

/**
 * Recalculate EMV for a single brand partnership using correct formula
 */
function recalculateBrandEMV(
  partner: PartnershipData,
  avgAthleteFollowers: number
): number {
  // Use the correct EMV formula with average athlete followers
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
function recalculateSchoolPartnerships(
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
 * Load all partnership data files and recalculate EMV values
 *
 * @param schoolFiles - Array of school file slugs (e.g., ['auburn-university', 'louisiana-state-university'])
 */
export async function loadPartnershipDataWithRecalculatedEMV(
  schoolFiles: string[]
): Promise<SchoolPartnershipData[]> {
  try {
    // Get average athlete follower count from config
    const avgAthleteFollowers = emvConfig.averageSponsoredAthleteFollowers;

    console.log(`Recalculating EMV with average athlete followers: ${avgAthleteFollowers.toLocaleString()}`);

    const partnershipPromises = schoolFiles.map(async (slug) => {
      try {
        const response = await fetch(`/data/${slug}-partnerships.json`);
        if (!response.ok) {
          console.warn(`Partnership data not found for ${slug}`);
          return null;
        }
        const data: SchoolPartnershipData = await response.json();
        return recalculateSchoolPartnerships(data, avgAthleteFollowers);
      } catch (error) {
        console.warn(`Error loading ${slug}:`, error);
        return null;
      }
    });

    const results = await Promise.all(partnershipPromises);

    // Filter out null results and log summary
    const validResults = results.filter((r): r is SchoolPartnershipData => r !== null);

    console.log(`Loaded ${validResults.length} schools with recalculated EMV`);

    // Log example of recalculation
    if (validResults.length > 0 && validResults[0].sponsorPartners.length > 0) {
      const exampleSchool = validResults[0];
      const exampleBrand = exampleSchool.sponsorPartners[0];
      console.log(`Example (${exampleSchool.school.name} - ${exampleBrand.sponsorPartner}):`);
      console.log(`  Avg Likes: ${exampleBrand.avgLikes.toLocaleString()}`);
      console.log(`  Avg Comments: ${exampleBrand.avgComments.toLocaleString()}`);
      console.log(`  EMV per post: $${exampleBrand.emv.toFixed(2)}`);
      console.log(`  Total EMV (${exampleBrand.totalContents} posts): $${(exampleBrand.emv * exampleBrand.totalContents).toLocaleString()}`);
    }

    return validResults;
  } catch (error) {
    console.error('Error loading partnership data:', error);
    return [];
  }
}

/**
 * Load a single school's partnership data with recalculated EMV
 */
export async function loadSchoolPartnershipData(
  schoolSlug: string
): Promise<SchoolPartnershipData | null> {
  try {
    const avgAthleteFollowers = emvConfig.averageSponsoredAthleteFollowers;

    const response = await fetch(`/data/${schoolSlug}-partnerships.json`);
    if (!response.ok) {
      console.warn(`Partnership data not found for ${schoolSlug}`);
      return null;
    }

    const data: SchoolPartnershipData = await response.json();
    return recalculateSchoolPartnerships(data, avgAthleteFollowers);
  } catch (error) {
    console.error(`Error loading partnership data for ${schoolSlug}:`, error);
    return null;
  }
}
