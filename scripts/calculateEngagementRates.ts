/**
 * Calculate real engagement rates for athletes at Playfly schools
 *
 * Formula: engagementRate = (total likes + total comments across all posts) / followers
 *
 * Data sources:
 *   - Posts (likes/comments/IP flags): public/data/NCAA_contents.json
 *   - Followers: public/data/ncaa_roster.json
 *
 * Run with: npx tsx scripts/calculateEngagementRates.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schools that have data files in the UI (keys from SCHOOL_FILE_MAP in PlayflyIPPage.tsx)
const PLAYFLY_SCHOOLS = new Set([
  'Auburn University',
  'Baylor',
  'Louisiana State University',
  'Michigan State',
  'Old Dominion University',
  'Penn State University',
  'Texas A&M',
  'University of Central Florida',
  'University of Cincinnati',
  'University of Maryland',
  'University of Nebraska',
  'University of Texas at San Antonio (UTSA)',
  'University of Virginia',
  'Virginia Tech',
  'Washington State',
]);

interface RosterAthlete {
  firstName: string;
  lastName: string;
  schoolName: string;
  sport: string;
  metrics: {
    ninetyDays: {
      followers: number;
    };
  };
}

interface ContentItem {
  athlete: {
    name: string;
    sport: string;
    school: {
      name: string;
    };
  };
  metrics: {
    likes: number;
    comments: number;
  };
  hasOrganizationInCaption?: boolean;
  isOrganizationCollaboration?: boolean;
  hasOrganizationLogo?: boolean;
}

interface IPCategoryStats {
  posts: number;
  likes: number;
  comments: number;
}

interface AggregatedAthlete {
  name: string;
  school: string;
  sport: string;
  totalLikes: number;
  totalComments: number;
  postCount: number;
  orgInCaption: IPCategoryStats;
  collaboration: IPCategoryStats;
  logo: IPCategoryStats;
}

// Parse "First Last" or "First Middle Last" into firstName/lastName
function parseAthleteName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.replace(/\s+/g, ' ').trim().split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

async function calculateEngagementRates() {
  // Step 1: Load ncaa_roster.json and build follower lookup
  console.log('Loading NCAA roster...');
  const rosterPath = path.join(__dirname, '../public/data/ncaa_roster.json');
  const roster: RosterAthlete[] = JSON.parse(fs.readFileSync(rosterPath, 'utf-8'));

  const followerMap = new Map<string, number>();
  let rosterPlayflyCount = 0;

  roster.forEach(athlete => {
    if (!PLAYFLY_SCHOOLS.has(athlete.schoolName)) return;
    const followers = athlete.metrics?.ninetyDays?.followers;
    if (!followers || followers <= 0) return;

    rosterPlayflyCount++;
    const key = `${athlete.firstName.trim().toLowerCase()}|${athlete.lastName.trim().toLowerCase()}|${athlete.schoolName}`;
    followerMap.set(key, followers);
  });

  console.log(`  Found ${rosterPlayflyCount} Playfly athletes with followers in roster`);
  console.log(`  Unique lookup keys: ${followerMap.size}`);

  // Step 2: Load NCAA_contents and aggregate likes/comments/IP stats per athlete
  console.log('\nLoading NCAA contents...');
  const contentsPath = path.join(__dirname, '../public/data/NCAA_contents.json');
  const contents: ContentItem[] = JSON.parse(fs.readFileSync(contentsPath, 'utf-8'));
  console.log(`  Loaded ${contents.length} content items`);

  const athleteMap = new Map<string, AggregatedAthlete>();
  let skippedNonPlayfly = 0;

  const emptyStats = (): IPCategoryStats => ({ posts: 0, likes: 0, comments: 0 });

  contents.forEach(item => {
    const schoolName = item.athlete?.school?.name;
    if (!schoolName || !PLAYFLY_SCHOOLS.has(schoolName)) {
      skippedNonPlayfly++;
      return;
    }

    const name = item.athlete.name?.replace(/\s+/g, ' ').trim();
    if (!name) return;

    const sport = item.athlete.sport || 'UNKNOWN';
    const key = `${name}|${schoolName}`;
    const likes = item.metrics?.likes || 0;
    const comments = item.metrics?.comments || 0;

    const existing = athleteMap.get(key);
    if (existing) {
      existing.totalLikes += likes;
      existing.totalComments += comments;
      existing.postCount += 1;
    } else {
      athleteMap.set(key, {
        name,
        school: schoolName,
        sport,
        totalLikes: likes,
        totalComments: comments,
        postCount: 1,
        orgInCaption: emptyStats(),
        collaboration: emptyStats(),
        logo: emptyStats(),
      });
    }

    const athlete = athleteMap.get(key)!;
    if (item.hasOrganizationInCaption) {
      athlete.orgInCaption.posts += 1;
      athlete.orgInCaption.likes += likes;
      athlete.orgInCaption.comments += comments;
    }
    if (item.isOrganizationCollaboration) {
      athlete.collaboration.posts += 1;
      athlete.collaboration.likes += likes;
      athlete.collaboration.comments += comments;
    }
    if (item.hasOrganizationLogo) {
      athlete.logo.posts += 1;
      athlete.logo.likes += likes;
      athlete.logo.comments += comments;
    }
  });

  console.log(`  Aggregated ${athleteMap.size} unique athletes from Playfly schools`);
  console.log(`  Skipped ${skippedNonPlayfly} posts from non-Playfly schools`);

  // Step 3: Match with followers and calculate engagement rate + IP lifts
  console.log('\nMatching athletes with follower data...');

  // Calculate lift for a single IP category using avg engagement (likes+comments per post)
  function calculateLift(
    category: IPCategoryStats,
    totalPosts: number,
    totalLikes: number,
    totalComments: number,
  ): number | null {
    if (category.posts === 0) return null;
    const nonPosts = totalPosts - category.posts;
    if (nonPosts === 0) return null;
    const avgEngWith = (category.likes + category.comments) / category.posts;
    const nonLikes = totalLikes - category.likes;
    const nonComments = totalComments - category.comments;
    const avgEngWithout = (nonLikes + nonComments) / nonPosts;
    if (avgEngWithout === 0) return null;
    return ((avgEngWith - avgEngWithout) / avgEngWithout) * 100;
  }

  const results: Array<{
    name: string;
    school: string;
    sport: string;
    followers: number;
    totalLikes: number;
    totalComments: number;
    postCount: number;
    engagementRate: number;
    emv: number;
    orgInCaptionLift: number | null;
    collaborationLift: number | null;
    logoLift: number | null;
  }> = [];

  let matched = 0;
  let noFollowerData = 0;
  let tooFewFollowers = 0;

  athleteMap.forEach(athlete => {
    const { firstName, lastName } = parseAthleteName(athlete.name);
    const key = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${athlete.school}`;
    const followers = followerMap.get(key);

    if (!followers) {
      noFollowerData++;
      return;
    }

    if (followers < 100) {
      tooFewFollowers++;
      return;
    }

    matched++;
    const avgLikes = athlete.totalLikes / athlete.postCount;
    const avgComments = athlete.totalComments / athlete.postCount;
    const engagementRate = (avgLikes + avgComments) / followers;
    const emv = athlete.totalLikes * 0.5 + athlete.totalComments * 1.5;

    const orgInCaptionLift = calculateLift(athlete.orgInCaption, athlete.postCount, athlete.totalLikes, athlete.totalComments);
    const collaborationLift = calculateLift(athlete.collaboration, athlete.postCount, athlete.totalLikes, athlete.totalComments);
    const logoLift = calculateLift(athlete.logo, athlete.postCount, athlete.totalLikes, athlete.totalComments);

    results.push({
      name: athlete.name,
      school: athlete.school,
      sport: athlete.sport,
      followers,
      totalLikes: athlete.totalLikes,
      totalComments: athlete.totalComments,
      postCount: athlete.postCount,
      engagementRate: Math.round(engagementRate * 1000000) / 1000000, // 6 decimal places
      emv: Math.round(emv * 100) / 100,
      orgInCaptionLift: orgInCaptionLift != null ? Math.round(orgInCaptionLift * 100) / 100 : null,
      collaborationLift: collaborationLift != null ? Math.round(collaborationLift * 100) / 100 : null,
      logoLift: logoLift != null ? Math.round(logoLift * 100) / 100 : null,
    });
  });

  // Sort by engagement rate descending
  results.sort((a, b) => b.engagementRate - a.engagementRate);

  console.log(`  Matched: ${matched}`);
  console.log(`  No follower data: ${noFollowerData}`);
  console.log(`  Skipped (< 100 followers): ${tooFewFollowers}`);

  // Step 4: Write output
  const outputPath = path.join(__dirname, '../public/data/playfly-athletes-metrics.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} athletes to ${outputPath}`);

  // Show top 10
  console.log('\nTop 10 by engagement rate:');
  results.slice(0, 10).forEach((a, i) => {
    console.log(`  ${i + 1}. ${a.name} (${a.school}, ${a.sport}) — ${(a.engagementRate * 100).toFixed(2)}% (${a.postCount} posts, ${a.followers} followers)`);
  });
}

calculateEngagementRates().catch(console.error);
