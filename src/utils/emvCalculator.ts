/**
 * EMV (Earned Media Value) Calculator
 *
 * EMV Formula:
 * EMV = (Likes x $0.50) + (Comments x $1.50)
 *
 * Simple engagement-based valuation without impressions or CPM.
 */

export interface PostEMVData {
  postId: string;
  likes: number;
  comments: number;
  athleteFollowers?: number; // Kept for backward compatibility, not used in calculation
  usesPlayflyIP: boolean;
  ipType?: 'Logo' | 'Collaboration' | 'Mention';
  brandName?: string;
}

export interface EMVBreakdown {
  likesValue: number;
  commentsValue: number;
  totalEMV: number;
  avgEMVPerPost: number;
}

/**
 * Calculate EMV for a single post
 *
 * Formula: (likes x $0.50) + (comments x $1.50)
 */
export function calculatePostEMV(post: {
  likes: number;
  comments: number;
  athleteFollowers?: number; // accepted but ignored for backward compatibility
}): number {
  const likesValue = post.likes * 0.50;
  const commentsValue = post.comments * 1.50;
  return likesValue + commentsValue;
}

/**
 * Calculate EMV with detailed breakdown
 */
export function calculatePostEMVWithBreakdown(post: {
  likes: number;
  comments: number;
  athleteFollowers?: number; // accepted but ignored for backward compatibility
}): {
  likesValue: number;
  commentsValue: number;
  totalEMV: number;
} {
  const likesValue = post.likes * 0.50;
  const commentsValue = post.comments * 1.50;
  const totalEMV = likesValue + commentsValue;

  return {
    likesValue,
    commentsValue,
    totalEMV
  };
}

/**
 * Calculate total EMV for a campaign (multiple posts)
 */
export function calculateCampaignEMV(posts: PostEMVData[]): EMVBreakdown {
  if (posts.length === 0) {
    return {
      likesValue: 0,
      commentsValue: 0,
      totalEMV: 0,
      avgEMVPerPost: 0
    };
  }

  let totalLikesValue = 0;
  let totalCommentsValue = 0;
  let totalEMV = 0;

  posts.forEach(post => {
    const breakdown = calculatePostEMVWithBreakdown(post);
    totalLikesValue += breakdown.likesValue;
    totalCommentsValue += breakdown.commentsValue;
    totalEMV += breakdown.totalEMV;
  });

  return {
    likesValue: totalLikesValue,
    commentsValue: totalCommentsValue,
    totalEMV,
    avgEMVPerPost: totalEMV / posts.length
  };
}

/**
 * Calculate average EMV per post
 */
export function calculateAverageEMV(posts: PostEMVData[]): number {
  if (posts.length === 0) return 0;
  const breakdown = calculateCampaignEMV(posts);
  return breakdown.avgEMVPerPost;
}

/**
 * Compare EMV between two groups of posts (e.g., with IP vs without IP)
 */
export function compareEMV(
  groupA: PostEMVData[],
  groupB: PostEMVData[]
): {
  groupA: EMVBreakdown;
  groupB: EMVBreakdown;
  liftPercent: number;
} {
  const emvA = calculateCampaignEMV(groupA);
  const emvB = calculateCampaignEMV(groupB);

  const liftPercent = emvA.avgEMVPerPost > 0
    ? Math.round(((emvB.avgEMVPerPost - emvA.avgEMVPerPost) / emvA.avgEMVPerPost) * 100)
    : 0;

  return {
    groupA: emvA,
    groupB: emvB,
    liftPercent
  };
}

/**
 * Format EMV as currency string
 */
export function formatEMV(emv: number): string {
  if (emv >= 1000000) {
    return `$${(emv / 1000000).toFixed(1)}M`;
  }
  if (emv >= 1000) {
    return `$${(emv / 1000).toFixed(1)}K`;
  }
  return `$${emv.toFixed(0)}`;
}

/**
 * EXAMPLE CALCULATION (for documentation/testing)
 */
export function exampleCalculation(): void {
  const examplePost = {
    likes: 2500,
    comments: 350
  };

  const breakdown = calculatePostEMVWithBreakdown(examplePost);

  console.log('Example EMV Calculation:');
  console.log('------------------------');
  console.log('EMV Breakdown:');
  console.log(`  Likes Value (${examplePost.likes} x $0.50): $${breakdown.likesValue.toLocaleString()}`);
  console.log(`  Comments Value (${examplePost.comments} x $1.50): $${breakdown.commentsValue.toLocaleString()}`);
  console.log('');
  console.log(`Total EMV: $${breakdown.totalEMV.toLocaleString()}`);
  console.log('');
  console.log('For 100 posts like this:');
  console.log(`Total Campaign EMV: $${(breakdown.totalEMV * 100).toLocaleString()}`);
}
