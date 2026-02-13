/**
 * Data loader for Playfly IP Report
 * Loads pre-computed metrics from playfly-metrics-feb12.json
 */

export interface SchoolPerformance {
  schoolId: string;
  schoolName: string;
  isPlayflyMax: boolean;
  totalSponsoredPosts: number;
  uniqueBrandCount: number;
  sponsoredAthletesCount: number;
  totalEngagement: number;
  postsWithoutIP: number;
  engagementWithoutIP: number;
  postsWithIP: number;
  engagementWithIP: number;
  engagementLiftPercent: number;
  logoPostCount: number;
  logoEngagement: number;
  logoLift: number;
  collaborationPostCount: number;
  collaborationEngagement: number;
  collaborationLift: number;
  mentionPostCount: number;
  mentionEngagement: number;
  mentionLift: number;
  brandsUsingIP: number;
  // EMV fields
  totalEMV: number;
  emvWithoutIP: number;
  emvWithIP: number;
  avgEMVPerPost: number;
  emvLiftPercent: number;
}

export interface BrandPerformance {
  brandName: string;
  postsWithIP: number;
  engagementWithIP: number;
  ipTypesUsed: ('Logo' | 'Collaboration' | 'Mention')[];
  avgEngagementPerPost: number;
}

// ─── Pre-computed data shape ───────────────────────────────────
interface PrecomputedSchoolData {
  overview: {
    totalFollowers: number;
    uniqueAthletes: number;
    athletesWithContent: number;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalEMV: number;
    engagementRate: number;
  };
  brandDeals: {
    sponsoredPosts: number;
    uniqueBrands: number;
    sponsoredAthletes: number;
  };
  ipEffectiveness: {
    postsWithoutIP: number;
    postsWithIP: number;
    totalEngagementWithoutIP: number;
    totalEngagementWithIP: number;
    avgEngagementWithoutIP: number;
    avgEngagementWithIP: number;
    engagementLiftPercent: number;
  };
  ipTypeBreakdown: {
    logo: { posts: number; totalEngagement: number; avgEngagement: number; liftPercent: number };
    collaboration: { posts: number; totalEngagement: number; avgEngagement: number; liftPercent: number };
    mention: { posts: number; totalEngagement: number; avgEngagement: number; liftPercent: number };
  };
  emvBreakdown: {
    totalEMV: number;
    emvWithoutIP: number;
    emvWithIP: number;
    avgEMVPerPost: number;
    avgEMVWithIP: number;
    avgEMVWithoutIP: number;
    emvLiftPercent: number;
  };
  topBrands: { name: string; posts: number; engagement: number; ipTypesUsed: string[] }[];
  brandsUsingIPCount: number;
}

interface PrecomputedData {
  networkTotals: PrecomputedSchoolData & { overview: PrecomputedSchoolData['overview'] & { schools: number } };
  schools: Record<string, PrecomputedSchoolData>;
}

// ─── Official Playfly Schools (27 total) ───────────────────────
const OFFICIAL_PLAYFLY_SCHOOLS = [
  'Auburn University',
  'Baylor University',
  'Louisiana State University',
  'Texas A&M University',
  'University of Central Florida',
  'Florida Atlantic University',
  'Washington State University',
  'University of Nebraska',
  'Michigan State University',
  'Appalachian State University',
  'Oakland University',
  'Eastern Carolina University',
  'Troy University',
  'Penn State University',
  'University of Virginia',
  'University of Maryland',
  'Villanova University',
  'Virginia Tech',
  'Butler University',
  'George Mason',
  'Old Dominion University',
  'Oral Roberts University',
  'University of Denver',
  'San Jose State University',
  'University of Texas at San Antonio',
  'University of Cincinnati'
];

// ─── Playfly Max Schools (6 - Premium tier) ────────────────────
const PLAYFLY_MAX_SCHOOLS = [
  'Auburn University',
  'Louisiana State University',
  'Texas A&M University',
  'Penn State University',
  'Michigan State University',
  'University of Maryland'
];

// ─── Name mapping for schools that have different names in the data ─
const SCHOOL_NAME_MAPPING: Record<string, string> = {
  'Maryland': 'University of Maryland',
  'Michigan State': 'Michigan State University',
  'Texas A&M': 'Texas A&M University',
  'Nebraska': 'University of Nebraska',
  'Baylor': 'Baylor University',
  'Virginia': 'University of Virginia',
  'Washington State': 'Washington State University',
  'University of Texas at San Antonio (UTSA)': 'University of Texas at San Antonio'
};

function normalizeSchoolName(name: string): string {
  return SCHOOL_NAME_MAPPING[name] || name;
}

function createSchoolId(schoolName: string): string {
  return schoolName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isPlayflyMax(schoolName: string): boolean {
  const normalized = normalizeSchoolName(schoolName);
  return PLAYFLY_MAX_SCHOOLS.includes(normalized);
}

function formatBrandName(name: string): string {
  // Clean up brand names: remove @ prefix, convert to title case
  const cleaned = name.startsWith('@') ? name.slice(1) : name;
  return cleaned
    .split(/[\s._-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

export async function loadPlayflySchoolData(): Promise<SchoolPerformance[]> {
  try {
    const response = await fetch('/data/playfly-metrics-feb12.json');
    if (!response.ok) {
      throw new Error(`HTTP error loading playfly-metrics-feb12.json: ${response.status}`);
    }

    const data: PrecomputedData = await response.json();
    const schools: SchoolPerformance[] = [];

    for (const [rawName, schoolData] of Object.entries(data.schools)) {
      const schoolName = normalizeSchoolName(rawName);

      // Only include official Playfly schools
      if (!OFFICIAL_PLAYFLY_SCHOOLS.includes(schoolName)) {
        continue;
      }

      const { overview, brandDeals, ipEffectiveness, ipTypeBreakdown, emvBreakdown } = schoolData;

      schools.push({
        schoolId: createSchoolId(schoolName),
        schoolName,
        isPlayflyMax: isPlayflyMax(schoolName),
        totalSponsoredPosts: brandDeals.sponsoredPosts,
        uniqueBrandCount: brandDeals.uniqueBrands,
        sponsoredAthletesCount: brandDeals.sponsoredAthletes,
        totalEngagement: overview.totalLikes + overview.totalComments,
        postsWithoutIP: ipEffectiveness.postsWithoutIP,
        engagementWithoutIP: ipEffectiveness.totalEngagementWithoutIP,
        postsWithIP: ipEffectiveness.postsWithIP,
        engagementWithIP: ipEffectiveness.totalEngagementWithIP,
        engagementLiftPercent: ipEffectiveness.engagementLiftPercent,
        logoPostCount: ipTypeBreakdown.logo.posts,
        logoEngagement: ipTypeBreakdown.logo.totalEngagement,
        logoLift: ipTypeBreakdown.logo.liftPercent,
        collaborationPostCount: ipTypeBreakdown.collaboration.posts,
        collaborationEngagement: ipTypeBreakdown.collaboration.totalEngagement,
        collaborationLift: ipTypeBreakdown.collaboration.liftPercent,
        mentionPostCount: ipTypeBreakdown.mention.posts,
        mentionEngagement: ipTypeBreakdown.mention.totalEngagement,
        mentionLift: ipTypeBreakdown.mention.liftPercent,
        brandsUsingIP: schoolData.brandsUsingIPCount,
        // EMV fields directly from pre-computed data
        totalEMV: emvBreakdown.totalEMV,
        emvWithoutIP: emvBreakdown.emvWithoutIP,
        emvWithIP: emvBreakdown.emvWithIP,
        avgEMVPerPost: emvBreakdown.avgEMVPerPost,
        emvLiftPercent: emvBreakdown.emvLiftPercent,
      });
    }

    // Sort by total sponsored posts descending
    return schools.sort((a, b) => b.totalSponsoredPosts - a.totalSponsoredPosts);
  } catch (error) {
    console.error('Error loading Playfly data:', error);
    return [];
  }
}

export async function loadTopBrandPartners(): Promise<BrandPerformance[]> {
  try {
    const response = await fetch('/data/playfly-metrics-feb12.json');
    if (!response.ok) {
      throw new Error(`HTTP error loading playfly-metrics-feb12.json: ${response.status}`);
    }

    const data: PrecomputedData = await response.json();

    // Aggregate topBrands from all schools
    const brandMap = new Map<string, {
      totalPosts: number;
      totalEngagement: number;
      ipTypesUsed: Set<string>;
    }>();

    for (const [rawName, schoolData] of Object.entries(data.schools)) {
      const schoolName = normalizeSchoolName(rawName);
      if (!OFFICIAL_PLAYFLY_SCHOOLS.includes(schoolName)) continue;

      for (const brand of schoolData.topBrands) {
        const key = brand.name.toLowerCase();
        if (!brandMap.has(key)) {
          brandMap.set(key, { totalPosts: 0, totalEngagement: 0, ipTypesUsed: new Set() });
        }
        const entry = brandMap.get(key)!;
        entry.totalPosts += brand.posts;
        entry.totalEngagement += brand.engagement;
        brand.ipTypesUsed.forEach(t => entry.ipTypesUsed.add(t));
      }
    }

    // Convert to array
    const brands: BrandPerformance[] = [];
    brandMap.forEach((val, key) => {
      const ipTypes: ('Logo' | 'Collaboration' | 'Mention')[] = [];
      if (val.ipTypesUsed.has('logo')) ipTypes.push('Logo');
      if (val.ipTypesUsed.has('collaboration')) ipTypes.push('Collaboration');
      if (val.ipTypesUsed.has('mention')) ipTypes.push('Mention');

      brands.push({
        brandName: formatBrandName(key),
        postsWithIP: val.totalPosts,
        engagementWithIP: val.totalEngagement,
        ipTypesUsed: ipTypes,
        avgEngagementPerPost: val.totalPosts > 0 ? Math.round(val.totalEngagement / val.totalPosts) : 0,
      });
    });

    // Sort by total engagement and return top 10
    return brands
      .sort((a, b) => b.engagementWithIP - a.engagementWithIP)
      .slice(0, 10);
  } catch (error) {
    console.error('Error loading brand data:', error);
    return [];
  }
}
